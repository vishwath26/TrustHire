from datetime import datetime

from pydantic import BaseModel, ConfigDict


class EvidenceFileResponse(BaseModel):

    id: int
    filename: str
    content_type: str | None = None
    file_size: int | None = None

    model_config = ConfigDict(from_attributes=True)


class FindingResponse(BaseModel):

    id: int
    category: str
    title: str
    detail: str
    points: int
    status: str

    model_config = ConfigDict(from_attributes=True)


class ModuleResponse(BaseModel):

    module_key: str
    title: str
    summary: str
    status: str
    progress: int
    sort_order: int

    model_config = ConfigDict(from_attributes=True)


class InvestigationSummary(BaseModel):

    public_id: str
    company_name: str | None = None
    job_role: str | None = None
    status: str
    progress: int
    risk_score: float | None = None
    risk_level: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InvestigationResponse(InvestigationSummary):

    id: int
    job_url: str | None = None
    recruiter_url: str | None = None
    company_url: str | None = None
    summary: str | None = None
    recommendations: list[str] = []
    evidence_files: list[EvidenceFileResponse] = []
    findings: list[FindingResponse] = []
    modules: list[ModuleResponse] = []


class GraphNode(BaseModel):

    id: str
    label: str
    sub: str
    type: str
    detail: str


class GraphEdge(BaseModel):

    source: str
    target: str
    label: str


class GraphResponse(BaseModel):

    public_id: str
    nodes: list[GraphNode]
    edges: list[GraphEdge]


class ThreatIndicator(BaseModel):

    type: str
    value: str
    reports: int
    category: str


class ThreatReport(BaseModel):

    public_id: str
    title: str
    description: str
    source: str
    time: datetime
    status: str


class ThreatPattern(BaseModel):

    label: str
    count: int


class ThreatSummary(BaseModel):

    investigations: int
    flagged_indicators: int
    recurring_patterns: int
    under_review: int


class ThreatIntelligenceResponse(BaseModel):

    summary: ThreatSummary
    indicators: list[ThreatIndicator]
    reports: list[ThreatReport]
    patterns: list[ThreatPattern]
