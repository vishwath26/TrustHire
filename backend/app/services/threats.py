import json
from collections import Counter

from sqlalchemy.orm import Session

from app import models


PATTERN_LABELS = {
    "payment": "Upfront payment requests",
    "free_email": "Personal email domains",
    "urgency": "Pressure or sensitive-data requests",
    "unresolved": "Unresolvable domains",
    "suspicious_tld": "Unusual domain endings",
    "shortener": "Shortened links",
}


def build_threat_intelligence(db: Session) -> dict:
    investigations = (
        db.query(models.Investigation)
        .order_by(models.Investigation.created_at.desc())
        .all()
    )

    indicator_counts: Counter[tuple[str, str, str]] = Counter()
    pattern_counts: Counter[str] = Counter()

    for investigation in investigations:
        extracted = _extracted(investigation)
        level = investigation.risk_level or ""

        if level not in {"High Risk", "Needs Review"}:
            continue

        for domain in extracted.get("domains") or []:
            category = "Free email provider" if domain in _free_domains(extracted) else "Mentioned domain"
            kind = "Email domain" if domain in _free_domains(extracted) else "Website"
            indicator_counts[(kind, domain, category)] += 1

        for phone in extracted.get("phones") or []:
            indicator_counts[("Phone number", phone, "Found in a flagged investigation")] += 1

        for flag in extracted.get("flags") or []:
            if flag in PATTERN_LABELS:
                pattern_counts[flag] += 1

    indicators = [
        {
            "type": kind,
            "value": value,
            "reports": count,
            "category": category,
        }
        for (kind, value, category), count in indicator_counts.most_common(8)
    ]

    reports = []

    for investigation in investigations[:8]:
        if not investigation.summary:
            continue

        reports.append({
            "public_id": investigation.public_id,
            "title": _title(investigation),
            "description": investigation.summary,
            "source": "TrustHire analysis",
            "time": investigation.created_at,
            "status": investigation.risk_level or investigation.status,
        })

    patterns = [
        {"label": PATTERN_LABELS[flag], "count": count}
        for flag, count in pattern_counts.most_common()
    ]

    under_review = sum(
        1 for item in investigations if item.risk_level in {"Needs Review", "High Risk", "Insufficient Evidence"}
    )

    return {
        "summary": {
            "investigations": len(investigations),
            "flagged_indicators": len(indicators),
            "recurring_patterns": len(patterns),
            "under_review": under_review,
        },
        "indicators": indicators,
        "reports": reports,
        "patterns": patterns,
    }


def _extracted(investigation: models.Investigation) -> dict:
    if investigation.extracted:
        return investigation.extracted

    if not investigation.extracted_json:
        return {}

    try:
        value = json.loads(investigation.extracted_json)
    except json.JSONDecodeError:
        return {}

    return value if isinstance(value, dict) else {}


def _free_domains(extracted: dict) -> set[str]:
    from app.services.analyzer import FREE_EMAIL_DOMAINS

    domains = set(extracted.get("domains") or [])
    email_domains = set()

    for email in extracted.get("emails") or []:
        if "@" in email:
            email_domains.add(email.split("@", 1)[1].lower())

    return (domains | email_domains) & FREE_EMAIL_DOMAINS


def _title(investigation: models.Investigation) -> str:
    company = investigation.company_name or "Unknown organization"
    role = investigation.job_role or "recruitment opportunity"
    level = investigation.risk_level or "Review"

    return f"{level}: {role} at {company}"
