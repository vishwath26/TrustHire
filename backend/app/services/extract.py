
import logging
import os
import re
import zipfile
from functools import lru_cache
from io import BytesIO
from pathlib import Path

logger = logging.getLogger(__name__)

MAX_PDF_PAGES = 20
OCR_TIMEOUT = 15

TESSERACT_DEFAULT_PATH = Path(
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


def extract_text(filename: str, content: bytes) -> str:
    """Extract readable text from supported evidence files."""

    if not content:
        return ""

    extension = Path(filename or "").suffix.lower()

    if extension == ".txt":
        return _decode(content)

    if extension == ".docx":
        return _docx_text(content)

    if extension == ".pdf":
        return _pdf_text(content)

    if extension in {".png", ".jpg", ".jpeg"}:
        return _ocr_image(content)

    if extension == ".doc":
        logger.warning("Legacy .doc files are not supported.")
        return ""

    return _decode(content)


# --------------------------------------------------
# TEXT EXTRACTION
# --------------------------------------------------

def _decode(content: bytes) -> str:
    for encoding in ("utf-8", "utf-16", "latin-1"):
        try:
            return content.decode(encoding)
        except UnicodeDecodeError:
            continue

    return ""


def _docx_text(content: bytes) -> str:
    try:
        with zipfile.ZipFile(BytesIO(content)) as archive:
            xml = archive.read("word/document.xml")

    except (zipfile.BadZipFile, KeyError):
        logger.exception("DOCX extraction failed.")
        return ""

    text = re.sub(
        r"</w:p>",
        "\n",
        xml.decode("utf-8", errors="ignore"),
    )

    text = re.sub(r"<[^>]+>", " ", text)

    return re.sub(r"[ \t]+", " ", text).strip()


# --------------------------------------------------
# TESSERACT OCR CONFIGURATION
# --------------------------------------------------

_CACHED_OCR_ENGINE = None

def _get_ocr_engine():
    global _CACHED_OCR_ENGINE
    if _CACHED_OCR_ENGINE is not None:
        return _CACHED_OCR_ENGINE

    try:
        import pytesseract
    except ImportError:
        logger.warning("pytesseract is not installed.")
        return None

    candidate_paths = [
        Path(os.getenv("TESSERACT_CMD", "")),
        Path(os.environ.get("LOCALAPPDATA", "")) / "Tesseract-OCR" / "tesseract.exe",
        Path(os.environ.get("USERPROFILE", "")) / "AppData" / "Local" / "Tesseract-OCR" / "tesseract.exe",
        Path(r"C:\Program Files\Tesseract-OCR\tesseract.exe"),
        Path(r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe"),
    ]

    executable = None
    for path in candidate_paths:
        if path and str(path) != "." and path.is_file():
            executable = path
            break

    if not executable:
        logger.error("Tesseract executable not found in any standard path.")
        return None

    pytesseract.pytesseract.tesseract_cmd = str(executable)
    _CACHED_OCR_ENGINE = pytesseract
    return _CACHED_OCR_ENGINE


# --------------------------------------------------
# IMAGE OCR
# --------------------------------------------------

def _ocr_image(content: bytes) -> str:
    pytesseract = _get_ocr_engine()

    if pytesseract is None:
        return ""

    try:
        from PIL import Image

        with Image.open(BytesIO(content)) as source:
            image = source.convert("RGB")

        text = pytesseract.image_to_string(
            image,
            lang="eng",
            timeout=OCR_TIMEOUT,
        )

        return text.strip()

    except Exception:
        logger.exception("Image OCR failed.")
        return ""


# --------------------------------------------------
# PDF EXTRACTION + OCR FALLBACK
# --------------------------------------------------

def _pdf_text(content: bytes) -> str:
    try:
        import fitz
        from PIL import Image

    except ImportError:
        logger.warning(
            "PyMuPDF or Pillow is unavailable for PDF extraction."
        )
        return ""

    pytesseract = _get_ocr_engine()

    try:
        document = fitz.open(
            stream=content,
            filetype="pdf",
        )

    except Exception:
        logger.exception("Could not open PDF.")
        return ""

    pages = []

    try:
        for page in document[:MAX_PDF_PAGES]:

            # First attempt normal PDF text extraction.
            page_text = page.get_text("text").strip()

            # Use OCR when the page has little selectable text.
            if len(page_text) < 30 and pytesseract is not None:

                try:
                    pix = page.get_pixmap(
                        matrix=fitz.Matrix(2, 2),
                        alpha=False,
                    )

                    image_bytes = pix.tobytes("png")

                    with Image.open(BytesIO(image_bytes)) as source:
                        image = source.convert("RGB")

                    ocr_text = pytesseract.image_to_string(
                        image,
                        lang="eng",
                        timeout=OCR_TIMEOUT,
                    ).strip()

                    if len(ocr_text) > len(page_text):
                        page_text = ocr_text

                except Exception:
                    logger.exception("PDF page OCR failed.")

            if page_text:
                pages.append(page_text)

    finally:
        document.close()

    return "\n".join(pages)
