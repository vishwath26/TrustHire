from app import models


def build_graph(investigation: models.Investigation) -> dict:
    extracted = investigation.extracted or {}
    hosts = extracted.get("hosts") or {}
    emails = extracted.get("emails") or []
    phones = extracted.get("phones") or []
    nodes = []
    edges = []

    company_label = investigation.company_name or "Unnamed organization"
    role_label = investigation.job_role or "Role not specified"

    nodes.append({
        "id": "opportunity",
        "label": "Opportunity",
        "sub": _clip(role_label),
        "type": "document",
        "detail": investigation.summary or "The submitted recruitment opportunity.",
    })

    if investigation.company_name or hosts.get("company"):
        nodes.append({
            "id": "company",
            "label": "Company",
            "sub": _clip(company_label),
            "type": "company",
            "detail": (
                f"{company_label} is the organization named in this submission. "
                "Confirm it through a source you found yourself."
            ),
        })
        edges.append({
            "source": "opportunity",
            "target": "company",
            "label": "claims to be from",
        })

    if hosts.get("company"):
        nodes.append({
            "id": "website",
            "label": "Website",
            "sub": _clip(hosts["company"]),
            "type": "website",
            "detail": f"Company link host: {hosts['company']}.",
        })
        edges.append({
            "source": "company" if _has(nodes, "company") else "opportunity",
            "target": "website",
            "label": "associated with",
        })

    if hosts.get("job") and hosts.get("job") != hosts.get("company"):
        nodes.append({
            "id": "job-link",
            "label": "Job link",
            "sub": _clip(hosts["job"]),
            "type": "website",
            "detail": f"The job URL is hosted on {hosts['job']}.",
        })
        edges.append({
            "source": "opportunity",
            "target": "job-link",
            "label": "posted on",
        })

    if emails or hosts.get("recruiter"):
        recruiter_sub = emails[0] if emails else hosts.get("recruiter") or "Profile link"
        nodes.append({
            "id": "recruiter",
            "label": "Recruiter",
            "sub": _clip(recruiter_sub),
            "type": "recruiter",
            "detail": "Identity details taken from the recruiter link or from email addresses in the evidence.",
        })
        edges.append({
            "source": "recruiter",
            "target": "company" if _has(nodes, "company") else "opportunity",
            "label": "claims to represent",
        })

    if emails:
        domain = emails[0].split("@", 1)[-1]
        nodes.append({
            "id": "email",
            "label": "Email domain",
            "sub": _clip(domain),
            "type": "email",
            "detail": f"Addresses found: {', '.join(emails[:3])}.",
        })
        edges.append({
            "source": "recruiter" if _has(nodes, "recruiter") else "opportunity",
            "target": "email",
            "label": "uses",
        })

    if phones:
        nodes.append({
            "id": "phone",
            "label": "Phone number",
            "sub": _clip(phones[0]),
            "type": "phone",
            "detail": "A phone number appeared in the submitted evidence. It has not been matched to an independent directory.",
        })
        edges.append({
            "source": "recruiter" if _has(nodes, "recruiter") else "opportunity",
            "target": "phone",
            "label": "shares contact",
        })

    for evidence in investigation.evidence_files[:4]:
        node_id = f"file-{evidence.id}"
        nodes.append({
            "id": node_id,
            "label": "Evidence file",
            "sub": _clip(evidence.filename),
            "type": "document",
            "detail": f"Uploaded file {evidence.filename}.",
        })
        edges.append({
            "source": "opportunity",
            "target": node_id,
            "label": "supported by",
        })

    risky = [item for item in investigation.findings if item.points >= 15]

    if risky:
        nodes.append({
            "id": "incident",
            "label": "Warning sign",
            "sub": _clip(risky[0].title),
            "type": "incident",
            "detail": risky[0].detail,
        })
        edges.append({
            "source": "email" if _has(nodes, "email") else "opportunity",
            "target": "incident",
            "label": "mentioned with",
        })

    return {"nodes": nodes, "edges": edges}


def _has(nodes, node_id: str) -> bool:
    return any(node["id"] == node_id for node in nodes)


def _clip(value: str, limit: int = 32) -> str:
    value = value or ""

    if len(value) <= limit:
        return value

    return value[: limit - 1] + "…"
