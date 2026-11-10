import json
from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship

from app.database import Base


class Investigation(Base):

    __tablename__ = "investigations"

    id = Column(Integer, primary_key=True, index=True)

    public_id = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    job_url = Column(String, nullable=True)
    recruiter_url = Column(String, nullable=True)
    company_url = Column(String, nullable=True)

    company_name = Column(String, nullable=True)
    job_role = Column(String, nullable=True)

    status = Column(String, default="Pending")
    progress = Column(Integer, default=0)

    risk_score = Column(Float, nullable=True)
    risk_level = Column(String, nullable=True)

    summary = Column(Text, nullable=True)
    recommendations_json = Column(Text, nullable=True)
    extracted_json = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    evidence_files = relationship(
        "EvidenceFile",
        back_populates="investigation",
        cascade="all, delete-orphan"
    )

    findings = relationship(
        "Finding",
        back_populates="investigation",
        cascade="all, delete-orphan",
        order_by="Finding.id"
    )

    modules = relationship(
        "ModuleResult",
        back_populates="investigation",
        cascade="all, delete-orphan",
        order_by="ModuleResult.sort_order"
    )

    @property
    def recommendations(self):
        if not self.recommendations_json:
            return []

        try:
            value = json.loads(self.recommendations_json)
        except json.JSONDecodeError:
            return []

        return value if isinstance(value, list) else []

    @property
    def extracted(self):
        if not self.extracted_json:
            return {}

        try:
            value = json.loads(self.extracted_json)
        except json.JSONDecodeError:
            return {}

        return value if isinstance(value, dict) else {}


class EvidenceFile(Base):

    __tablename__ = "evidence_files"

    id = Column(Integer, primary_key=True, index=True)

    investigation_id = Column(
        Integer,
        ForeignKey("investigations.id"),
        nullable=False
    )

    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    content_type = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True)

    investigation = relationship(
        "Investigation",
        back_populates="evidence_files"
    )


class Finding(Base):

    __tablename__ = "findings"

    id = Column(Integer, primary_key=True, index=True)

    investigation_id = Column(
        Integer,
        ForeignKey("investigations.id"),
        nullable=False,
        index=True
    )

    category = Column(String, nullable=False)
    title = Column(String, nullable=False)
    detail = Column(Text, nullable=False)
    points = Column(Integer, default=0)
    status = Column(String, nullable=False)

    investigation = relationship(
        "Investigation",
        back_populates="findings"
    )


class ModuleResult(Base):

    __tablename__ = "module_results"

    id = Column(Integer, primary_key=True, index=True)

    investigation_id = Column(
        Integer,
        ForeignKey("investigations.id"),
        nullable=False,
        index=True
    )

    module_key = Column(String, nullable=False)
    title = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    status = Column(String, nullable=False)
    progress = Column(Integer, default=0)
    sort_order = Column(Integer, default=0)

    investigation = relationship(
        "Investigation",
        back_populates="modules"
    )
