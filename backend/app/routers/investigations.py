import logging
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

from app import models, schemas
from app.database import get_db
from app.services.analyzer import analyze, dumps
from app.services.graph import build_graph


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/investigations",
    tags=["Investigations"]
)


UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

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


def _investigation_query(db: Session):
    return db.query(models.Investigation).options(
        selectinload(models.Investigation.evidence_files),
        selectinload(models.Investigation.findings),
        selectinload(models.Investigation.modules),
    )


def _get_or_404(db: Session, public_id: str) -> models.Investigation:
    investigation = (
        _investigation_query(db)
        .filter(models.Investigation.public_id == public_id)
        .first()
    )

    if investigation is None:
        raise HTTPException(status_code=404, detail="Investigation not found.")

    return investigation


def _clean_url(value: str | None, field_name: str) -> str | None:
    if value is None:
        return None

    value = value.strip()

    if not value:
        return None

    if "://" not in value:
        value = "https://" + value

    parsed = urlparse(value)

    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        raise HTTPException(
            status_code=400,
            detail=f"{field_name} must be an http or https link.",
        )

    return parsed.geturl()


@router.get("", response_model=list[schemas.InvestigationSummary], include_in_schema=False)
@router.get("/", response_model=list[schemas.InvestigationSummary])
def list_investigations(db: Session = Depends(get_db)):
    return (
        db.query(models.Investigation)
        .order_by(models.Investigation.created_at.desc())
        .all()
    )


@router.get("/{public_id}", response_model=schemas.InvestigationResponse)
def get_investigation(public_id: str, db: Session = Depends(get_db)):
    return _get_or_404(db, public_id)


@router.get("/{public_id}/graph", response_model=schemas.GraphResponse)
def get_graph(public_id: str, db: Session = Depends(get_db)):
    investigation = _get_or_404(db, public_id)
    graph = build_graph(investigation)

    return {
        "public_id": investigation.public_id,
        **graph,
    }


@router.post("", response_model=schemas.InvestigationResponse, include_in_schema=False)
@router.post("/", response_model=schemas.InvestigationResponse)
async def create_investigation(
    job_url: str | None = Form(default=None),
    recruiter_url: str | None = Form(default=None),
    company_url: str | None = Form(default=None),
    evidence_files: Annotated[list[UploadFile] | None, File()] = None,
    db: Session = Depends(get_db),
):
    job_url = _clean_url(job_url, "Job opportunity URL")
    recruiter_url = _clean_url(recruiter_url, "Recruiter profile URL")
    company_url = _clean_url(company_url, "Company URL")

    uploads = [
    item for item in (evidence_files or [])
    if item.filename
]

    if not any([job_url, recruiter_url, company_url]) and not uploads:
        raise HTTPException(
            status_code=400,
            detail="Please provide at least one URL or evidence file.",
        )

    prepared_files: list[tuple[str, bytes]] = []

    for upload in uploads:
        extension = Path(upload.filename or "").suffix.lower()

        if extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"File type not supported: {upload.filename}",
            )

        content = await upload.read()
        await upload.close()

        if len(content) > MAX_FILE_BYTES:
            raise HTTPException(
                status_code=400,
                detail=f"{upload.filename} is larger than 8 MB.",
            )

        prepared_files.append((Path(upload.filename).name, content))

    investigation = models.Investigation(
        public_id=f"TRH-{uuid4().hex[:8].upper()}",
        job_url=job_url,
        recruiter_url=recruiter_url,
        company_url=company_url,
        status="Running",
        progress=10,
    )

    saved_paths: list[Path] = []

    try:
        db.add(investigation)
        db.flush()

        for original_filename, content in prepared_files:
            extension = Path(original_filename).suffix.lower()
            unique_filename = f"{uuid4().hex}{extension}"
            file_path = UPLOAD_DIR / unique_filename
            file_path.write_bytes(content)
            saved_paths.append(file_path)

            db.add(models.EvidenceFile(
                investigation_id=investigation.id,
                filename=original_filename,
                file_path=str(file_path),
                content_type=extension.lstrip("."),
                file_size=len(content),
            ))

        result = analyze(job_url, recruiter_url, company_url, prepared_files)

        investigation.company_name = result.company_name
        investigation.job_role = result.job_role
        investigation.status = result.status
        investigation.progress = result.progress
        investigation.risk_score = result.risk_score
        investigation.risk_level = result.risk_level
        investigation.summary = result.summary
        investigation.recommendations_json = dumps(result.recommendations)
        investigation.extracted_json = dumps(result.extracted)

        for module in result.modules:
            db.add(models.ModuleResult(
                investigation_id=investigation.id,
                **module,
            ))

        for finding in result.findings:
            db.add(models.Finding(
                investigation_id=investigation.id,
                category=finding.category,
                title=finding.title,
                detail=finding.detail,
                points=finding.points,
                status=finding.status,
            ))

        db.commit()

    except HTTPException:
        db.rollback()
        _delete_files(saved_paths)
        raise

    except Exception:
        logger.exception("Investigation analysis failed")
        db.rollback()
        _delete_files(saved_paths)
        raise HTTPException(
            status_code=500,
            detail="Could not create the investigation.",
        )

    return _get_or_404(db, investigation.public_id)


def _delete_files(paths: list[Path]):
    for path in paths:
        if path.exists():
            path.unlink()
