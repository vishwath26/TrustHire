from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import ThreatIntelligenceResponse
from app.services.threats import build_threat_intelligence


router = APIRouter(
    prefix="/api/threat-intelligence",
    tags=["Threat intelligence"],
)


@router.get("", response_model=ThreatIntelligenceResponse, include_in_schema=False)
@router.get("/", response_model=ThreatIntelligenceResponse)
def threat_intelligence(db: Session = Depends(get_db)):
    return build_threat_intelligence(db)
