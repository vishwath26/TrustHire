"""Score a recruitment submission from the evidence the user provided.

The score is a count of warning signs in that evidence. A low score means those
signs were absent. It is not a guarantee that the opportunity is legitimate.
"""

import ipaddress
import json
import re
import socket
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from urllib.parse import urlparse

from app.services.extract import extract_text


FREE_EMAIL_DOMAINS = {
    "gmail.com",
    "googlemail.com",
    "yahoo.com",
    "yahoo.co.in",
    "hotmail.com",
    "outlook.com",
    "live.com",
    "aol.com",
    "icloud.com",
    "proton.me",
    "protonmail.com",
    "gmx.com",
    "mail.com",
    "rediffmail.com",
}

SUSPICIOUS_TLDS = {
    "xyz",
    "top",
    "click",
    "gq",
    "tk",
    "ml",
    "cf",
    "buzz",
    "work",
    "rest",
    "country",
}

URL_SHORTENERS = {
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "goo.gl",
    "is.gd",
    "cutt.ly",
    "rb.gy",
    "shorturl.at",
}

JOB_BOARDS = {
    "linkedin.com",
    "indeed.com",
    "naukri.com",
    "internshala.com",
    "foundit.in",
    "glassdoor.com",
    "glassdoor.co.in",
    "wellfound.com",
    "instahyre.com",
}

PAYMENT_PATTERNS = [
    (r"registration fee", "The evidence mentions a registration fee."),
    (r"training fee", "The evidence mentions a training fee."),
    (r"processing fee", "The evidence mentions a processing fee."),
    (r"security deposit", "The evidence asks for a security deposit."),
    (r"pay(?:ment)? (?:to|before) (?:join|start|receive)", "The evidence asks for payment before the role begins."),
    (r"upfront (?:payment|fee)", "The evidence asks for an upfront fee."),
    (r"gift cards?", "The evidence asks for payment by gift card."),
    (r"\b(?:bitcoin|crypto(?:currency)?|usdt)\b", "The evidence asks for cryptocurrency."),
    (r"western union|wire transfer", "The evidence asks for a wire or Western Union payment."),
]

URGENCY_PATTERNS = [
    (r"whatsapp only|telegram only", "Contact is limited to WhatsApp or Telegram."),
    (r"no interview", "The message says there is no interview."),
    (r"immediate joining|join today|limited seats", "The message uses urgency to push a quick decision."),
    (r"send (?:your )?(?:aadhaar|aadhar|passport|pan card|bank details|otp)", "The message asks for identity documents, bank details, or an OTP."),
]

EMAIL_RE = re.compile(r"[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}", re.I)
PHONE_RE = re.compile(r"(?:\+\d{1,3}[\s\-]?)?(?:\d[\s\-]?){10,13}\d")
ROLE_RE = re.compile(
    r"(?:role|position|hiring|opening|internship)\s*[:\-]\s*([A-Za-z][A-Za-z0-9 /&\-]{2,60})",
    re.I,
)


@dataclass
class Signal:
    category: str
    title: str
    detail: str
    points: int
    status: str


@dataclass
class Analysis:
    company_name: str | None
    job_role: str | None
    risk_score: float | None
    risk_level: str
    status: str
    progress: int
    summary: str
    recommendations: list[str]
    modules: list[dict]
    findings: list[Signal] = field(default_factory=list)
    extracted: dict = field(default_factory=dict)


def analyze(job_url, recruiter_url, company_url, files: list[tuple[str, bytes]]) -> Analysis:
    texts = []
    readable_files = []
    image_files = []

    for filename, content in files:
        text = extract_text(filename, content).strip()
        suffix = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""

        if suffix in {"png", "jpg", "jpeg"}:
            image_files.append(filename)

        if text:
            readable_files.append(filename)
            texts.append(text[:80_000])

    page_notes = []

    for label, url in (
        ("job", job_url),
        ("recruiter", recruiter_url),
        ("company", company_url),
    ):
        if not url:
            continue

        page = _fetch_public_page(url)

        if page["text"]:
            texts.append(page["text"][:80_000])
            page_notes.append(f"Retrieved the {label} page ({page['host']}).")
        elif page["error"]:
            page_notes.append(page["error"])

    corpus = "\n".join(texts)
    emails = _unique(EMAIL_RE.findall(corpus))
    phones = _unique(_normalize_phone(match) for match in PHONE_RE.findall(corpus))
    phones = [phone for phone in phones if phone]

    hosts = {
        "job": _host(job_url),
        "recruiter": _host(recruiter_url),
        "company": _host(company_url),
    }

    email_domains = _unique(_domain_of(email) for email in emails)
    domains = _unique([host for host in hosts.values() if host] + email_domains)

    company_name = _company_name(hosts.get("company") or hosts.get("job"), corpus)
    job_role = _job_role(corpus)

    findings: list[Signal] = []
    flags: list[str] = []

    free_domains = [domain for domain in email_domains if domain in FREE_EMAIL_DOMAINS]
    company_host = hosts.get("company")

    if free_domains and company_host and _registrable(company_host) not in free_domains:
        findings.append(Signal(
            "domain",
            "Email domain",
            "A recruiter address uses "
            + ", ".join(free_domains)
            + " rather than the claimed company domain.",
            20,
            "High risk",
        ))
        flags.append("free_email")
    elif free_domains and not company_host:
        findings.append(Signal(
            "domain",
            "Email domain",
            "The only email domains found are free providers: " + ", ".join(free_domains) + ".",
            12,
            "Review",
        ))
        flags.append("free_email")

    for host in domains:
        labels = host.split(".")
        tld = labels[-1] if labels else ""

        if tld in SUSPICIOUS_TLDS:
            findings.append(Signal(
                "domain",
                "Domain reputation",
                f"{host} uses .{tld}, a domain ending often seen in short-lived recruitment sites.",
                12,
                "Review",
            ))
            flags.append("suspicious_tld")

        if host in URL_SHORTENERS:
            findings.append(Signal(
                "domain",
                "Shortened link",
                f"{host} hides the real destination. Open it only after checking where it leads.",
                10,
                "Review",
            ))
            flags.append("shortener")

    for label, host in hosts.items():
        if not host or host in URL_SHORTENERS or _is_job_board(host):
            continue

        if not _domain_resolves(host):
            findings.append(Signal(
                "domain",
                "Domain does not resolve",
                f"The {label} host {host} did not resolve in DNS.",
                30,
                "Review",
            ))
            flags.append("unresolved")

    payment_hit = False

    for pattern, detail in PAYMENT_PATTERNS:
        if re.search(pattern, corpus, re.I):
            payment_hit = True
            findings.append(Signal(
                "payment",
                "Payment request",
                detail,
                25,
                "High risk",
            ))
            flags.append("payment")
            break

    for pattern, detail in URGENCY_PATTERNS:
        if re.search(pattern, corpus, re.I):
            findings.append(Signal(
                "fraud",
                "Pressure or sensitive-data request",
                detail,
                15,
                "High risk",
            ))
            flags.append("urgency")
            break

    if hosts.get("recruiter") and company_host:
        recruiter_root = _registrable(hosts["recruiter"])
        company_root = _registrable(company_host)

        if recruiter_root and company_root and recruiter_root != company_root and not _is_job_board(hosts["recruiter"]):
            findings.append(Signal(
                "recruiter",
                "Recruiter identity",
                f"The recruiter link is on {hosts['recruiter']}, which does not match {company_host}.",
                8,
                "Review",
            ))

    if company_host and not _domain_resolves(company_host) and "unresolved" not in flags:
        findings.append(Signal(
            "company",
            "Company verification",
            f"The company host {company_host} could not be resolved.",
            10,
            "Review",
        ))

    if image_files and not readable_files and not corpus.strip():
        findings.append(Signal(
            "document",
            "Document analysis",
            "Screenshots were stored, but this service does not read text inside images. Add a PDF or the message text for a fuller check.",
            0,
            "Info",
        ))

    for note in page_notes:
        if note.startswith("Retrieved"):
            continue

        findings.append(Signal(
            "domain",
            "Page retrieval",
            note,
            0,
            "Info",
        ))

    has_substance = bool(corpus.strip() or company_host or hosts.get("job") or hosts.get("recruiter"))
    scored = [item for item in findings if item.points > 0]
    score = min(100, sum(item.points for item in scored))

    if not has_substance:
        risk_score = None
        risk_level = "Insufficient Evidence"
        status = "Incomplete"
        summary = (
            "There was not enough readable evidence to assess this opportunity. "
            "Submit a job link, a company site, or a document with text."
        )
    else:
        risk_score = float(score)

        if score >= 55:
            risk_level = "High Risk"
            summary = (
                "Several warning signs showed up in the submitted evidence. "
                "Treat the opportunity as unsafe until you confirm it through the company itself."
            )
        elif score >= 25:
            risk_level = "Needs Review"
            summary = (
                "Some details need a second look. Nothing here proves fraud, "
                "and nothing here clears the opportunity either."
            )
        else:
            risk_level = "Verified"
            summary = (
                "No strong fraud indicators were found in the evidence you submitted. "
                "That is not proof the offer is genuine. Confirm the role on the company's own site."
            )

        status = "Completed"

        if not scored:
            findings.insert(0, Signal(
                "fraud",
                "Fraud pattern analysis",
                "No payment demand, free-email mismatch, or urgency pattern was found in the submitted text.",
                0,
                "Info",
            ))

    recommendations = _recommendations(risk_level, flags, image_files)
    modules = _modules(
        readable_files=readable_files,
        image_files=image_files,
        emails=emails,
        hosts=hosts,
        findings=findings,
        page_notes=page_notes,
        company_name=company_name,
        risk_level=risk_level,
    )

    return Analysis(
        company_name=company_name,
        job_role=job_role,
        risk_score=risk_score,
        risk_level=risk_level,
        status=status,
        progress=100 if status == "Completed" else 40,
        summary=summary,
        recommendations=recommendations,
        modules=modules,
        findings=findings,
        extracted={
            "emails": emails[:20],
            "phones": phones[:20],
            "domains": domains[:20],
            "hosts": hosts,
            "flags": sorted(set(flags)),
            "company_name": company_name,
            "job_role": job_role,
            "payment_requested": payment_hit,
        },
    )


def dumps(value) -> str:
    return json.dumps(value)


def _modules(*, readable_files, image_files, emails, hosts, findings, page_notes, company_name, risk_level):
    by_category: dict[str, list[Signal]] = {}

    for item in findings:
        by_category.setdefault(item.category, []).append(item)

    def module_summary(key, fallback):
        related = by_category.get(key, [])
        pointed = [item.detail for item in related if item.points > 0]

        if pointed:
            return " ".join(pointed[:2])

        return fallback

    document_bits = []

    if readable_files:
        document_bits.append("Read text from " + ", ".join(readable_files[:4]) + ".")

    if image_files:
        document_bits.append("Stored screenshots: " + ", ".join(image_files[:4]) + ".")

    if not document_bits:
        document_bits.append("No document was uploaded. Analysis used the links only.")

    recruiter_fallback = (
        "Found " + ", ".join(emails[:3]) + "."
        if emails
        else "No recruiter email was found in the submitted evidence."
    )

    if hosts.get("recruiter"):
        recruiter_fallback = f"Recruiter link host is {hosts['recruiter']}. " + recruiter_fallback

    company_fallback = (
        f"Claimed organization: {company_name}."
        if company_name
        else "No company name could be taken from the links or documents."
    )

    retrieved = [note for note in page_notes if note.startswith("Retrieved")]
    domain_fallback = " ".join(retrieved) if retrieved else "Checked the hosts named in the submission."

    fraud_fallback = (
        "No payment, urgency, or sensitive-data pattern was found."
        if risk_level != "Insufficient Evidence"
        else "Fraud patterns were not scored because the evidence had no readable text."
    )

    specs = [
        ("document", "Document Extraction", " ".join(document_bits)),
        ("recruiter", "Recruiter Verification", module_summary("recruiter", recruiter_fallback)),
        ("company", "Company Verification", module_summary("company", company_fallback)),
        ("domain", "Domain Intelligence", module_summary("domain", domain_fallback)),
        ("fraud", "Fraud Pattern Analysis", module_summary("fraud", module_summary("payment", fraud_fallback))),
    ]

    modules = []

    for index, (key, title, summary) in enumerate(specs, start=1):
        modules.append({
            "module_key": key,
            "title": title,
            "summary": summary,
            "status": "Completed",
            "progress": 100,
            "sort_order": index,
        })

    return modules


def _recommendations(risk_level, flags, image_files):
    items = [
        "Confirm the opening on the company's own careers page, not only in the message you received.",
        "Contact the company through a phone number or address you looked up yourself.",
    ]

    if "payment" in flags or risk_level == "High Risk":
        items.insert(0, "Do not pay a registration, training, equipment, or deposit fee.")
        items.append("Do not send identity documents, bank details, or one-time passwords.")

    if "free_email" in flags:
        items.append("Ask the recruiter to reply from the company's own email domain.")

    if image_files:
        items.append("If you only uploaded screenshots, also paste the message or upload a PDF so the text can be checked.")

    if risk_level == "Insufficient Evidence":
        items.append("Add the job link, the company website, and the offer or chat export, then run the check again.")

    if risk_level in {"High Risk", "Needs Review"}:
        items.append("Tell your placement cell or a trusted person before you continue with this recruiter.")

    return items


def _fetch_public_page(url: str) -> dict:
    host = _host(url)

    if not host:
        return {"host": "", "text": "", "error": f"Could not read a host from {url}."}

    if not _is_public_host(host):
        return {
            "host": host,
            "text": "",
            "error": f"{host} is a private or local address, so the page was not retrieved.",
        }

    if not _domain_resolves(host):
        return {"host": host, "text": "", "error": f"{host} did not resolve, so the page was not retrieved."}

    request = urllib.request.Request(
        url,
        headers={"User-Agent": "TrustHire/1.0 (recruitment evidence check)"},
        method="GET",
    )

    try:
        with urllib.request.urlopen(request, timeout=5) as response:
            content_type = response.headers.get("Content-Type", "")
            raw = response.read(150_000)
    except (urllib.error.URLError, TimeoutError, ValueError) as error:
        return {"host": host, "text": "", "error": f"Could not retrieve {host}: {error.__class__.__name__}."}

    if "html" not in content_type and "text" not in content_type and "json" not in content_type:
        return {"host": host, "text": "", "error": ""}

    text = raw.decode("utf-8", errors="ignore")
    text = re.sub(r"(?is)<script.*?>.*?</script>", " ", text)
    text = re.sub(r"(?is)<style.*?>.*?</style>", " ", text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    return {"host": host, "text": text[:80_000], "error": ""}


def _is_public_host(host: str) -> bool:
    host = host.strip("[]").lower()

    if host in {"localhost", "0.0.0.0"} or host.endswith(".local") or host.endswith(".internal"):
        return False

    try:
        addresses = [ipaddress.ip_address(host)]
    except ValueError:
        try:
            infos = socket.getaddrinfo(host, None)
        except socket.gaierror:
            return True

        addresses = []

        for info in infos:
            try:
                addresses.append(ipaddress.ip_address(info[4][0]))
            except ValueError:
                continue

        if not addresses:
            return False

    return all(_is_global(ip) for ip in addresses)


def _is_global(ip: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    return not (
        ip.is_private
        or ip.is_loopback
        or ip.is_link_local
        or ip.is_reserved
        or ip.is_multicast
        or ip.is_unspecified
    )


def _domain_resolves(host: str) -> bool:
    if not host:
        return False

    try:
        socket.getaddrinfo(host, None)
        return True
    except socket.gaierror:
        return False


def _host(url: str | None) -> str:
    if not url:
        return ""

    parsed = urlparse(url)
    return (parsed.hostname or "").lower()


def _domain_of(email: str) -> str:
    return email.split("@", 1)[-1].lower()


def _registrable(host: str) -> str:
    labels = host.lower().split(".")

    if len(labels) >= 2:
        return ".".join(labels[-2:])

    return host.lower()


def _is_job_board(host: str) -> bool:
    root = _registrable(host)
    return host in JOB_BOARDS or root in JOB_BOARDS


def _company_name(host: str | None, corpus: str) -> str | None:
    match = re.search(r"(?:company|organization|organisation)\s*[:\-]\s*([A-Za-z0-9][A-Za-z0-9 .&]{1,60})", corpus, re.I)

    if match:
        return match.group(1).strip(" .")

    if not host or _is_job_board(host):
        return None

    label = host.split(".")[0]

    if label in {"www", "jobs", "careers", "mail"} and "." in host:
        label = host.split(".")[1]

    label = label.replace("-", " ").replace("_", " ").strip()

    if not label or label.isdigit():
        return None

    return label.title()


def _job_role(corpus: str) -> str | None:
    match = ROLE_RE.search(corpus)

    if match:
        return match.group(1).strip(" .")[:80]

    titled = re.search(
        r"\b((?:software|frontend|backend|data|graphic|marketing|hr|human resources)[\w /]{0,40}(?:intern(?:ship)?|engineer|developer|analyst|designer|manager))\b",
        corpus,
        re.I,
    )

    if titled:
        return titled.group(1).strip()[:80]

    return None


def _normalize_phone(value: str) -> str:
    digits = re.sub(r"\D", "", value)

    if len(digits) < 10 or len(digits) > 15:
        return ""

    return value.strip()


def _unique(values) -> list[str]:
    seen = []

    for value in values:
        if value and value not in seen:
            seen.append(value)

    return seen
