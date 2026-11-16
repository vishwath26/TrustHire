from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import ensure_schema
from app.routers import investigations, threats


ensure_schema()

app = FastAPI(
    title="TrustHire API",
    description="Backend services for the TrustHire recruitment investigation platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(investigations.router)
app.include_router(threats.router)


@app.on_event("startup")
def startup_checks():
    from app.services.extract import _get_ocr_engine
    ocr = _get_ocr_engine()
    if ocr:
        import pytesseract
        print(f"✅ [TrustHire] Tesseract OCR ready: {pytesseract.pytesseract.tesseract_cmd}")
    else:
        print("⚠️ [TrustHire] Warning: Tesseract OCR executable not found. Image OCR will be disabled.")


@app.get("/")
def home():
    return {
        "message": "Welcome to TrustHire API",
        "status": "Running successfully",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "application": "TrustHire",
    }


@app.get("/database-status")
def database_status():
    from app.database import Base

    return {
        "status": "connected",
        "database": "SQLite",
        "tables": list(Base.metadata.tables.keys()),
    }
