
"""Investigation API routes for TrustHire."""

import logging
import re
from pathlib import Path
from urllib.parse import urlparse
from uuid import uuid4

from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from sqlalchemy.orm import Session, selectinload
from starlette.concurrency import run_in_threadpool

from app import models, schemas
from app.database import get_db
from app.services.analyzer import analyze, dumps
from app.services.graph import build_graph


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/investigations",
    tags=["Investigations"],
)

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg",
    ".txt",
    ".doc",
    ".docx",
}

MAX_FILE_BYTES = 8 * 1024 * 1024
MAX_TOTAL_UPLOAD_BYTES = 32 * 1024 * 1024
MAX_UPLOAD_COUNT = 10
MAX_URL_LENGTH = 2048

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# --------------------------------------------------
# DATABASE HELPERS
# --------------------------------------------------

def _investigation_query(db: Session):
    return db.query(models.Investigation).options(
        selectinload(models.Investigation.evidence_files),
        selectinload(models.Investigation.findings),
        selectinload(models.Investigation.modules),
    )


def _get_or_404(
    db: Session,
    public_id: str,
) -> models.Investigation:

    investigation = (
        _investigation_query(db)
        .filter(models.Investigation.public_id == public_id)
        .first()
    )

    if investigation is None:
        raise HTTPException(
            status_code=404,
            detail="Investigation not found.",
        )

    return investigation


# --------------------------------------------------
# INPUT VALIDATION
# --------------------------------------------------

def _clean_url(
    value: str | None,
    field_name: str,
) -> str | None:
    """Validate a submitted HTTP or HTTPS URL."""

    if value is None:
        return None

    value = value.strip()

    if not value:
        return None

    if len(value) > MAX_URL_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"{field_name} is too long.",
        )

    if any(char.isspace() for char in value):
        raise HTTPException(
            status_code=400,
            detail=f"{field_name} contains invalid whitespace.",
        )

    if "://" not in value:
        value = "https://" + value

    try:
        parsed = urlparse(value)

        if parsed.scheme.lower() not in {"http", "https"}:
            raise ValueError("Unsupported URL scheme.")

        if not parsed.hostname:
            raise ValueError("Missing hostname.")

        if parsed.username is not None or parsed.password is not None:
            raise ValueError("Credentials in URLs are not allowed.")

        # Accessing port validates malformed port values.
        port = parsed.port

        if port is not None and not (1 <= port <= 65535):
            raise ValueError("Invalid port.")

        hostname = parsed.hostname

        if not re.fullmatch(
            r"[A-Za-z0-9.\-:\[\]]+",
            hostname,
        ):
            raise ValueError("Invalid hostname.")

        return value

    except (ValueError, TypeError):
        raise HTTPException(
            status_code=400,
            detail=f"{field_name} must be a valid HTTP or HTTPS link.",
        )


def _safe_filename(filename: str | None) -> str:
    """Remove directory components and unsafe filename characters."""

    filename = (filename or "evidence").replace("\\", "/")
    filename = Path(filename).name

    filename = re.sub(
        r"[^A-Za-z0-9._\- ]",
        "_",
        filename,
    )

    filename = filename.strip(" .")

    return filename[:150] or "evidence"


async def _read_upload(upload: UploadFile) -> tuple[str, bytes]:
    """Validate and read one upload without loading unlimited data."""

    original_name = _safe_filename(upload.filename)
    extension = Path(original_name).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not supported: {original_name}",
        )

    # Read at most one byte beyond the limit.
    content = await upload.read(MAX_FILE_BYTES + 1)

    if len(content) > MAX_FILE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"{original_name} exceeds the 8 MB file limit.",
        )

    if not content:
        raise HTTPException(
            status_code=400,
            detail=f"{original_name} is empty.",
        )

    return original_name, content


async def _close_uploads(uploads: list[UploadFile]) -> None:
    """Close every uploaded file, even if another file fails validation."""

    for upload in uploads:
        try:
            await upload.close()
        except Exception:
            logger.warning(
                "Could not close an uploaded file.",
                exc_info=True,
            )


# --------------------------------------------------
# FILE CLEANUP
# --------------------------------------------------

def _delete_files(paths: list[Path]) -> None:
    """Remove files created by an investigation that failed to persist."""

    for path in paths:
        try:
            if path.exists():
                path.unlink()
        except OSError:
            logger.exception(
                "Could not remove temporary evidence file: %s",
                path,
            )


# --------------------------------------------------
# GET INVESTIGATIONS
# --------------------------------------------------

@router.get(
    "",
    response_model=list[schemas.InvestigationSummary],
    include_in_schema=False,
)
@router.get(
    "/",
    response_model=list[schemas.InvestigationSummary],
)
def list_investigations(
    db: Session = Depends(get_db),
):
    return (
        db.query(models.Investigation)
        .order_by(models.Investigation.created_at.desc())
        .all()
    )


@router.get(
    "/{public_id}",
    response_model=schemas.InvestigationResponse,
)
def get_investigation(
    public_id: str,
    db: Session = Depends(get_db),
):
    return _get_or_404(db, public_id)


@router.get(
    "/{public_id}/graph",
    response_model=schemas.GraphResponse,
)
def get_graph(
    public_id: str,
    db: Session = Depends(get_db),
):
    investigation = _get_or_404(db, public_id)

    graph = build_graph(investigation)

    return {
        "public_id": investigation.public_id,
        **graph,
    }


# --------------------------------------------------
# CREATE INVESTIGATION
# --------------------------------------------------

@router.post(
    "",
    response_model=schemas.InvestigationResponse,
    include_in_schema=False,
)
@router.post(
    "/",
    response_model=schemas.InvestigationResponse,
)
async def create_investigation(
    job_url: str | None = Form(default=None),
    recruiter_url: str | None = Form(default=None),
    company_url: str | None = Form(default=None),
    evidence_files: Annotated[
        list[UploadFile] | None,
        File(),
    ] = None,
    db: Session = Depends(get_db),
):
    uploads = [
        upload
        for upload in (evidence_files or [])
        if upload.filename
    ]

    saved_paths: list[Path] = []

    try:
        # Validate URLs.
        job_url = _clean_url(
            job_url,
            "Job opportunity URL",
        )

        recruiter_url = _clean_url(
            recruiter_url,
            "Recruiter profile URL",
        )

        company_url = _clean_url(
            company_url,
            "Company URL",
        )

        # Validate upload count.
        if len(uploads) > MAX_UPLOAD_COUNT:
            raise HTTPException(
                status_code=400,
                detail=f"You can upload a maximum of {MAX_UPLOAD_COUNT} files.",
            )

        # Require at least one source of evidence.
        if not any((job_url, recruiter_url, company_url)) and not uploads:
            raise HTTPException(
                status_code=400,
                detail="Please provide at least one URL or evidence file.",
            )

        # Read and validate uploads.
        prepared_files: list[tuple[str, bytes]] = []
        total_upload_bytes = 0

        for upload in uploads:
            original_filename, content = await _read_upload(upload)

            total_upload_bytes += len(content)

            if total_upload_bytes > MAX_TOTAL_UPLOAD_BYTES:
                raise HTTPException(
                    status_code=400,
                    detail="The combined upload size cannot exceed 32 MB.",
                )

            prepared_files.append(
                (original_filename, content)
            )

        # Create the investigation record.
        investigation = models.Investigation(
            public_id=f"TRH-{uuid4().hex[:8].upper()}",
            job_url=job_url,
            recruiter_url=recruiter_url,
            company_url=company_url,
            status="Running",
            progress=10,
        )

        db.add(investigation)
        db.flush()

        # Save evidence with generated filenames.
        for original_filename, content in prepared_files:
            extension = Path(original_filename).suffix.lower()

            unique_filename = f"{uuid4().hex}{extension}"
            file_path = UPLOAD_DIR / unique_filename

            # Register the path before writing so cleanup can
            # also handle a partially written file.
            saved_paths.append(file_path)
            file_path.write_bytes(content)

            evidence = models.EvidenceFile(
                investigation_id=investigation.id,
                filename=original_filename,
                file_path=str(file_path),
                content_type=extension.lstrip("."),
                file_size=len(content),
            )

            db.add(evidence)

        # Run OCR, page retrieval, and deterministic analysis
        # outside the async event loop.
        result = await run_in_threadpool(
            analyze,
            job_url,
            recruiter_url,
            company_url,
            prepared_files,
        )

        # Update the investigation.
        investigation.company_name = result.company_name
        investigation.job_role = result.job_role
        investigation.status = result.status
        investigation.progress = result.progress
        investigation.risk_score = result.risk_score
        investigation.risk_level = result.risk_level
        investigation.summary = result.summary

        investigation.recommendations_json = dumps(
            result.recommendations
        )

        investigation.extracted_json = dumps(
            result.extracted
        )

        # Save analysis modules.
        for module in result.modules:
            db.add(
                models.ModuleResult(
                    investigation_id=investigation.id,
                    **module,
                )
            )

        # Save individual findings.
        for finding in result.findings:
            db.add(
                models.Finding(
                    investigation_id=investigation.id,
                    category=finding.category,
                    title=finding.title,
                    detail=finding.detail,
                    points=finding.points,
                    status=finding.status,
                )
            )

        # Persist everything together.
        db.commit()

        logger.info(
            "Investigation %s completed with status %s and risk level %s.",
            investigation.public_id,
            investigation.status,
            investigation.risk_level,
        )

        return _get_or_404(
            db,
            investigation.public_id,
        )

    except HTTPException:
        db.rollback()
        _delete_files(saved_paths)
        raise

    except Exception:
        logger.exception("Investigation creation failed.")

        db.rollback()
        _delete_files(saved_paths)

        raise HTTPException(
            status_code=500,
            detail="Could not create the investigation. Please try again.",
        )

    finally:
        await _close_uploads(uploads)
