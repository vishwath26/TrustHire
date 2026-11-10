import re
import zipfile
from io import BytesIO
from pathlib import Path


def extract_text(filename: str, content: bytes) -> str:
    """Pull readable text from an uploaded evidence file.

    Images are stored but not OCR'd. PDF text is read when pypdf is installed.
    """
    extension = Path(filename or "").suffix.lower()

    if extension == ".txt":
        return _decode(content)

    if extension == ".docx":
        return _docx_text(content)

    if extension == ".pdf":
        return _pdf_text(content)

    if extension in {".png", ".jpg", ".jpeg"}:
        return ""

    if extension == ".doc":
        return ""

    return _decode(content)


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
        return ""

    text = re.sub(r"</w:p>", "\n", xml.decode("utf-8", errors="ignore"))
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"[ \t]+", " ", text)


def _pdf_text(content: bytes) -> str:
    try:
        from pypdf import PdfReader
    except ImportError:
        return ""

    try:
        reader = PdfReader(BytesIO(content))
    except Exception:
        return ""

    pages = []

    for page in reader.pages[:20]:
        try:
            pages.append(page.extract_text() or "")
        except Exception:
            continue

    return "\n".join(pages)
