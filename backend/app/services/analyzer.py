
"""Analyze recruitment evidence and identify potential warning signs.

A low score means fewer warning signs were detected in the submitted evidence.
It does NOT prove that a job, recruiter, or company is legitimate.

Scoring is deterministic. OCR text is supplied by app.services.extract.
No external AI API is called by this module.
"""

import ipaddress
import json
import logging
import re
import socket
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from html.parser import HTMLParser
from urllib.parse import urlparse
from app.services.extract import extract_text
from app.services.ai_analyzer import analyze_recruitment_text


logger = logging.getLogger(__name__)

MAX_TEXT_PER_SOURCE = 80_000
MAX_TOTAL_TEXT = 250_000
MAX_PAGE_BYTES = 150_000
PAGE_TIMEOUT_SECONDS = 5

FREE_EMAIL_DOMAINS = {
    "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.in",
    "hotmail.com", "outlook.com", "live.com", "aol.com",
    "icloud.com", "proton.me", "protonmail.com", "gmx.com",
    "mail.com", "rediffmail.com",
}

SUSPICIOUS_TLDS = {
    "xyz", "top", "click", "gq", "tk", "ml", "cf", "buzz",
    "work", "rest", "country",
}

URL_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd",
    "cutt.ly", "rb.gy", "shorturl.at",
}

JOB_BOARDS = {
    "linkedin.com", "indeed.com", "naukri.com", "internshala.com",
    "foundit.in", "glassdoor.com", "glassdoor.co.in",
    "wellfound.com", "instahyre.com",
}

PAYMENT_PATTERNS = [
    (r"\bregistration fee\b", "The evidence mentions a registration fee."),
    (r"\btraining fee\b", "The evidence mentions a training fee."),
    (r"\bprocessing fee\b", "The evidence mentions a processing fee."),
    (r"\bsecurity deposit\b", "The evidence asks for a security deposit."),
    (
        r"\bpay(?:ment)?\s+(?:to|before)\s+(?:join|start|receive)\b",
        "The evidence asks for payment before the role or benefit begins.",
    ),
    (r"\bupfront\s+(?:payment|fee)\b", "The evidence asks for an upfront fee."),
    (r"\bgift cards?\b", "The evidence mentions gift cards as a payment method."),
    (
        r"\b(?:bitcoin|cryptocurrency|crypto|usdt)\b",
        "The evidence mentions cryptocurrency.",
    ),
    (
        r"\bwestern union\b|\bwire transfer\b",
        "The evidence mentions a wire or Western Union payment.",
    ),
]

URGENCY_PATTERNS = [
    (
        r"\bwhatsapp only\b|\btelegram only\b",
        "Contact appears to be restricted to WhatsApp or Telegram.",
    ),
    (r"\bno interview\b", "The message says there is no interview."),
    (
        r"\bimmediate joining\b|\bjoin today\b|\blimited seats\b",
        "The message uses urgency to push a quick decision.",
    ),
    (
        r"\bsend\s+(?:your\s+)?(?:aadhaar|aadhar|passport|pan card|"
        r"bank details|otp)\b",
        "The message requests identity documents, bank details, or an OTP.",
    ),
]

EMAIL_RE = re.compile(
    r"[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}",
    re.IGNORECASE,
)

PHONE_RE = re.compile(r"(?:\+\d{1,3}[\s\-]?)?(?:\d[\s\-]?){10,13}\d")

ROLE_RE = re.compile(
    r"(?:role|position|hiring|opening|internship)\s*[:\-]\s*"
    r"([A-Za-z][A-Za-z0-9 /&\-]{2,60})",
    re.IGNORECASE,
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


class _TextExtractor(HTMLParser):
    """Extract visible text from HTML without retaining markup."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.skip_depth = 0

    def handle_starttag(self, tag, attrs):
        if tag.lower() in {"script", "style", "noscript", "svg"}:
            self.skip_depth += 1

    def handle_endtag(self, tag):
        if tag.lower() in {"script", "style", "noscript", "svg"}:
            self.skip_depth = max(0, self.skip_depth - 1)

    def handle_data(self, data):
        if not self.skip_depth and data.strip():
            self.parts.append(data.strip())

    def get_text(self):
        return re.sub(r"\s+", " ", " ".join(self.parts)).strip()


def analyze(
    job_url: str | None,
    recruiter_url: str | None,
    company_url: str | None,
    files: list[tuple[str, bytes]],
) -> Analysis:
    """Analyze supplied documents and URLs, returning a structured result."""

    findings: list[Signal] = []
    flags: set[str] = set()
    texts: list[str] = []
    readable_files: list[str] = []
    image_files: list[str] = []
    failed_files: list[str] = []
    page_notes: list[str] = []

    # Extract uploaded evidence. One unreadable file must not stop the analysis.
    for filename, content in files or []:
        safe_name = str(filename or "unnamed file")
        suffix = safe_name.lower().rsplit(".", 1)[-1] if "." in safe_name else ""

        if suffix in {"png", "jpg", "jpeg"}:
            image_files.append(safe_name)

        if not isinstance(content, bytes):
            failed_files.append(safe_name)
            logger.warning("Skipping non-bytes upload: %s", safe_name)
            continue

        try:
            extracted_text = extract_text(safe_name, content)
            extracted_text = (extracted_text or "").strip()
        except Exception:
            logger.exception("Text extraction failed for %s", safe_name)
            extracted_text = ""

        if extracted_text:
            readable_files.append(safe_name)
            texts.append(extracted_text[:MAX_TEXT_PER_SOURCE])
        else:
            failed_files.append(safe_name)

    # Retrieve only public HTTP(S) pages.
    supplied_urls = {
        "job": job_url,
        "recruiter": recruiter_url,
        "company": company_url,
    }

    hosts = {
        label: _host(url)
        for label, url in supplied_urls.items()
    }

    for label, url in supplied_urls.items():
        if not url:
            continue

        page = _fetch_public_page(url)

        if page["text"]:
            texts.append(page["text"][:MAX_TEXT_PER_SOURCE])
            page_notes.append(
                f"Retrieved the {label} page from {page['host']}."
            )
        elif page["error"]:
            page_notes.append(page["error"])

    # Keep the total analysis input bounded.
    corpus = "\n".join(texts)[:MAX_TOTAL_TEXT]
        # Supplementary AI analysis.
    # AI findings never affect the deterministic risk score.
    ai_result = {"success": False, "findings": []}

    if corpus.strip():
        try:
            ai_result = analyze_recruitment_text(corpus)

            if ai_result.get("success"):
                for item in ai_result.get("findings", []):
                    findings.append(Signal(
                        category="ai",
                        title=f"AI Review: {item['category'].title()}",
                        detail=(
                            f"Evidence: \"{item['evidence']}\" "
                            f"Reason: {item['reason']}"
                        ),
                        points=0,
                        status=item["severity"],
                    ))

                if ai_result.get("summary"):
                    findings.append(Signal(
                        category="ai",
                        title="AI Analysis Summary",
                        detail=ai_result["summary"],
                        points=0,
                        status="Info",
                    ))

            else:
                logger.info(
                    "Supplementary AI analysis unavailable: %s",
                    ai_result.get("error", "Unknown error"),
                )

        except Exception:
            logger.exception("Supplementary AI analysis failed.")

    emails = _unique(EMAIL_RE.findall(corpus))
    phones = _unique(
        phone for phone in (_normalize_phone(x) for x in PHONE_RE.findall(corpus))
        if phone
    )

    email_domains = _unique(_domain_of(email) for email in emails)
    domains = _unique(
        [host for host in hosts.values() if host] + email_domains
    )

    company_name = _company_name(
        hosts.get("company") or hosts.get("job"),
        corpus,
    )
    job_role = _job_role(corpus)

    # Warning: a free email address is a signal to verify, not proof of fraud.
    free_domains = [
        domain for domain in email_domains
        if domain in FREE_EMAIL_DOMAINS
    ]
    company_host = hosts.get("company")

    if free_domains and company_host:
        company_root = _registrable(company_host)
        if company_root not in free_domains:
            _add_signal(
                findings,
                flags,
                "free_email_mismatch",
                "domain",
                "Recruiter email domain",
                "A recruiter email uses "
                + ", ".join(free_domains)
                + " instead of an address matching the submitted company domain.",
                15,
                "Review",
            )
    elif free_domains and not company_host:
        _add_signal(
            findings,
            flags,
            "free_email",
            "domain",
            "Free email provider",
            "The submitted evidence contains only free email domains: "
            + ", ".join(free_domains) + ". Verify the recruiter's identity independently.",
            8,
            "Review",
        )

    # Domain ending and shortened-link checks.
    for host in domains:
        labels = host.split(".")
        tld = labels[-1] if labels else ""

        if tld in SUSPICIOUS_TLDS:
            _add_signal(
                findings,
                flags,
                f"suspicious_tld:{host}",
                "domain",
                "Domain ending",
                f"{host} uses the .{tld} domain ending. This is not proof of fraud, "
                "but the domain should be independently checked.",
                8,
                "Review",
            )

        if host in URL_SHORTENERS:
            _add_signal(
                findings,
                flags,
                f"shortener:{host}",
                "domain",
                "Shortened link",
                f"{host} hides the final destination. Verify the destination "
                "through an independently obtained company link.",
                8,
                "Review",
            )

    # DNS checks for supplied hosts. Job boards are not treated as company domains.
    for label, host in hosts.items():
        if not host or _is_job_board(host):
            continue

        if not _domain_resolves(host):
            _add_signal(
                findings,
                flags,
                f"unresolved:{label}:{host}",
                "domain",
                "Domain did not resolve",
                f"The {label} host {host} did not resolve during this check. "
                "Temporary DNS problems are possible.",
                20,
                "Review",
            )

    # Payment patterns: count at most one payment warning.
    for pattern, detail in PAYMENT_PATTERNS:
        if re.search(pattern, corpus, re.IGNORECASE):
            _add_signal(
                findings,
                flags,
                "payment_request",
                "payment",
                "Payment request",
                detail + " Legitimate employers generally do not require applicants "
                "to pay to secure a job.",
                25,
                "High risk",
            )
            break

    # Urgency and sensitive-data patterns: count at most one warning in this group.
    for pattern, detail in URGENCY_PATTERNS:
        if re.search(pattern, corpus, re.IGNORECASE):
            _add_signal(
                findings,
                flags,
                "pressure_or_sensitive_data",
                "fraud",
                "Pressure or sensitive-data request",
                detail + " Verify the request directly with the organization.",
                15,
                "High risk",
            )
            break

    # Compare recruiter and company domains only when both were supplied.
    recruiter_host = hosts.get("recruiter")

    if recruiter_host and company_host and not _is_job_board(recruiter_host):
        recruiter_root = _registrable(recruiter_host)
        company_root = _registrable(company_host)

        if recruiter_root and company_root and recruiter_root != company_root:
            _add_signal(
                findings,
                flags,
                "recruiter_company_domain_mismatch",
                "recruiter",
                "Recruiter and company domains differ",
                f"The recruiter link uses {recruiter_host}, while the company link "
                f"uses {company_host}. A third-party recruiter may be legitimate, "
                "so confirm the relationship independently.",
                8,
                "Review",
            )

    # Image-specific extraction status.
    if image_files:
        readable_images = [name for name in image_files if name in readable_files]
        unreadable_images = [name for name in image_files if name not in readable_files]

        if readable_images:
            findings.append(Signal(
                "document",
                "Image text extraction",
                "OCR extracted readable text from: "
                + ", ".join(readable_images[:5]) + ".",
                0,
                "Info",
            ))

        if unreadable_images:
            findings.append(Signal(
                "document",
                "Image text extraction",
                "No readable text was extracted from: "
                + ", ".join(unreadable_images[:5])
                + ". Try a clearer image or provide the original message text.",
                0,
                "Info",
            ))

    if failed_files:
        findings.append(Signal(
            "document",
            "Some files could not be read",
            "No readable text was extracted from: "
            + ", ".join(failed_files[:5])
            + ". The analysis may be incomplete.",
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

    has_substance = bool(
        corpus.strip()
        or any(hosts.values())
    )

    scored_findings = [item for item in findings if item.points > 0]
    score = min(100, sum(item.points for item in scored_findings))

    if not has_substance:
        risk_score = None
        risk_level = "Insufficient Evidence"
        status = "Incomplete"
        summary = (
            "There was not enough usable evidence to assess this opportunity. "
            "Submit a job link, company website, recruiter details, or a readable document."
        )
    else:
        risk_score = float(score)
        status = "Completed"

        if score >= 55:
            risk_level = "High Risk"
            summary = (
                "Multiple warning signs were detected in the submitted evidence. "
                "Do not proceed until the opportunity is independently verified."
            )
        elif score >= 25:
            risk_level = "Needs Review"
            summary = (
                "Some warning signs were detected. They do not prove fraud, "
                "but the opportunity needs independent verification."
            )
        else:
            risk_level = "Low Risk"
            summary = (
                "Few or no warning signs were detected in the submitted evidence. "
                "This is not proof that the opportunity is genuine."
            )

        if not scored_findings:
            findings.insert(0, Signal(
                "fraud",
                "Warning-sign review",
                "No configured payment, pressure, or domain warning pattern "
                "was detected in the available evidence.",
                0,
                "Info",
            ))

    recommendations = _recommendations(
        risk_level,
        flags,
        image_files,
        failed_files,
    )

    modules = _modules(
        readable_files=readable_files,
        image_files=image_files,
        failed_files=failed_files,
        emails=emails,
        hosts=hosts,
        findings=findings,
        page_notes=page_notes,
        company_name=company_name,
        risk_level=risk_level,
        has_text=bool(corpus.strip()),
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
            "flags": sorted(flags),
            "company_name": company_name,
            "job_role": job_role,
            "payment_requested": "payment_request" in flags,
            "readable_files": readable_files,
            "unreadable_files": failed_files,
        },
    )


def _add_signal(
    findings: list[Signal],
    flags: set[str],
    flag: str,
    category: str,
    title: str,
    detail: str,
    points: int,
    status: str,
) -> None:
    """Add a finding once, preventing duplicate scoring for the same rule."""

    if flag in flags:
        return

    flags.add(flag)
    findings.append(Signal(
        category=category,
        title=title,
        detail=detail,
        points=points,
        status=status,
    ))


def dumps(value) -> str:
    """Serialize values for JSON database fields."""

    return json.dumps(value, ensure_ascii=False)


def _modules(
    *,
    readable_files,
    image_files,
    failed_files,
    emails,
    hosts,
    findings,
    page_notes,
    company_name,
    risk_level,
    has_text,
):
    """Build honest module summaries and statuses."""

    by_category: dict[str, list[Signal]] = {}

    for finding in findings:
        by_category.setdefault(finding.category, []).append(finding)

    def category_summary(category, fallback):
        related = by_category.get(category, [])
        meaningful = [
            item.detail for item in related
            if item.points > 0
        ]
        return " ".join(meaningful[:2]) if meaningful else fallback

    document_bits = []

    if readable_files:
        document_bits.append(
            "Successfully extracted readable text from "
            + ", ".join(readable_files[:4]) + "."
        )

    if image_files:
        readable_images = [
            name for name in image_files if name in readable_files
        ]
        unreadable_images = [
            name for name in image_files if name not in readable_files
        ]

        if readable_images:
            document_bits.append(
                "OCR processed: " + ", ".join(readable_images[:4]) + "."
            )

        if unreadable_images:
            document_bits.append(
                "OCR could not extract readable text from: "
                + ", ".join(unreadable_images[:4]) + "."
            )

    if failed_files and not image_files:
        document_bits.append(
            "Unreadable or unsupported files: "
            + ", ".join(failed_files[:4]) + "."
        )

    if not document_bits:
        document_bits.append(
            "No readable document text was available. Analysis used the supplied links."
        )

    recruiter_fallback = (
        "Found email addresses: " + ", ".join(emails[:3]) + "."
        if emails
        else "No recruiter email address was found in the submitted evidence."
    )

    if hosts.get("recruiter"):
        recruiter_fallback = (
            f"Recruiter link host: {hosts['recruiter']}. " + recruiter_fallback
        )

    company_fallback = (
        f"Possible organization name: {company_name}."
        if company_name
        else "No company name could be identified from the submitted evidence."
    )

    retrieved = [
        note for note in page_notes if note.startswith("Retrieved")
    ]
    domain_fallback = (
        " ".join(retrieved)
        if retrieved
        else "No company or recruiter webpage was successfully retrieved."
    )

    fraud_fallback = (
        "No configured warning pattern was detected."
        if has_text
        else "Fraud-pattern analysis was limited because no readable text was available."
    )

    specs = [
        ("document", "Document Extraction", " ".join(document_bits)),
        (
            "recruiter",
            "Recruiter Verification",
            category_summary("recruiter", recruiter_fallback),
        ),
        (
            "company",
            "Company Verification",
            category_summary("company", company_fallback),
        ),
        (
            "domain",
            "Domain Intelligence",
            category_summary("domain", domain_fallback),
        ),
        (
            "fraud",
            "Fraud Pattern Analysis",
            category_summary(
                "fraud",
                category_summary("payment", fraud_fallback),
            ),
        ),
    ]

    modules = []

    for index, (key, title, summary) in enumerate(specs, start=1):
        # Do not claim that an empty evidence category was fully verified.
        if key == "document":
            module_status = "Completed" if readable_files or not failed_files else "Review"
        elif key == "recruiter":
            module_status = "Completed" if hosts.get("recruiter") or emails else "Limited"
        elif key == "company":
            module_status = "Completed" if hosts.get("company") or company_name else "Limited"
        elif key == "domain":
            module_status = "Completed" if any(hosts.values()) else "Limited"
        else:
            module_status = "Completed" if has_text else "Limited"

        modules.append({
            "module_key": key,
            "title": title,
            "summary": summary,
            "status": module_status,
            "progress": 100 if module_status == "Completed" else 40,
            "sort_order": index,
        })

    return modules


def _recommendations(risk_level, flags, image_files, failed_files):
    items = [
        "Confirm the vacancy on the company's official careers page.",
        "Contact the company using contact details obtained independently.",
        "Never share an OTP, password, or banking credentials with a recruiter.",
    ]

    if "payment_request" in flags:
        items.insert(
            0,
            "Do not pay a registration, training, processing, equipment, or deposit fee.",
        )

    if "free_email" in flags or "free_email_mismatch" in flags:
        items.append(
            "Ask the recruiter to confirm their identity through an official company channel."
        )

    if "recruiter_company_domain_mismatch" in flags:
        items.append(
            "Confirm directly with the company that the third-party recruiter is authorized."
        )

    if image_files or failed_files:
        items.append(
            "Provide a clearer image, original PDF, or copied message text for a more complete check."
        )

    if risk_level == "Insufficient Evidence":
        items.append(
            "Add the job link, company website, recruiter details, and offer or chat evidence."
        )

    if risk_level in {"High Risk", "Needs Review"}:
        items.append(
            "Pause the application process until the warning signs have been independently checked."
        )

    return _unique(items)


def _fetch_public_page(url: str) -> dict:
    """Fetch a small public text page. Redirects are deliberately not followed."""

    parsed = _parse_http_url(url)

    if not parsed:
        return {
            "host": "",
            "text": "",
            "error": "A supplied link was invalid or did not use HTTP or HTTPS.",
        }

    host = parsed.hostname.lower()

    if not _is_public_host(host):
        return {
            "host": host,
            "text": "",
            "error": f"{host} is private, local, or otherwise not a public host.",
        }

    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "TrustHire/1.0 (recruitment evidence review)",
            "Accept": "text/html,text/plain,application/json",
        },
        method="GET",
    )

    opener = urllib.request.build_opener(_NoRedirectHandler())

    try:
        with opener.open(request, timeout=PAGE_TIMEOUT_SECONDS) as response:
            content_type = response.headers.get("Content-Type", "").lower()

            if not any(kind in content_type for kind in (
                "text/html", "text/plain", "application/json"
            )):
                return {"host": host, "text": "", "error": ""}

            raw = response.read(MAX_PAGE_BYTES + 1)

            if len(raw) > MAX_PAGE_BYTES:
                raw = raw[:MAX_PAGE_BYTES]

    except urllib.error.HTTPError as error:
        if 300 <= error.code < 400:
            message = f"{host} redirected to another address; automatic redirects were blocked."
        else:
            message = f"{host} returned HTTP status {error.code}."

        return {"host": host, "text": "", "error": message}

    except (urllib.error.URLError, TimeoutError, OSError, ValueError):
        logger.info("Could not retrieve public page: %s", host)
        return {
            "host": host,
            "text": "",
            "error": f"Could not retrieve {host}. The page may be unavailable.",
        }

    decoded = raw.decode("utf-8", errors="replace")

    if "html" in content_type:
        parser = _TextExtractor()

        try:
            parser.feed(decoded)
            page_text = parser.get_text()
        except Exception:
            page_text = re.sub(r"<[^>]+>", " ", decoded)
    else:
        page_text = decoded

    page_text = re.sub(r"\s+", " ", page_text).strip()

    return {
        "host": host,
        "text": page_text[:MAX_TEXT_PER_SOURCE],
        "error": "",
    }


class _NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    """Prevent a public URL from redirecting the fetcher to a private address."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def _parse_http_url(url: str | None):
    if not isinstance(url, str) or not url.strip():
        return None

    try:
        parsed = urlparse(url.strip())

        if parsed.scheme.lower() not in {"http", "https"}:
            return None

        if not parsed.hostname:
            return None

        # Credentials in submitted URLs are not accepted.
        if parsed.username is not None or parsed.password is not None:
            return None

        # Accessing .port validates malformed port values.
        _ = parsed.port

        return parsed

    except (ValueError, TypeError):
        return None


def _is_public_host(host: str) -> bool:
    """Reject hosts resolving to private, local, reserved, or non-global IPs."""

    host = host.strip("[]").lower().rstrip(".")

    if (
        not host
        or host == "localhost"
        or host.endswith((".local", ".internal", ".localhost"))
    ):
        return False

    try:
        addresses = [ipaddress.ip_address(host)]
    except ValueError:
        try:
            infos = socket.getaddrinfo(host, None, type=socket.SOCK_STREAM)
        except socket.gaierror:
            return False

        addresses = []

        for info in infos:
            try:
                addresses.append(ipaddress.ip_address(info[4][0]))
            except ValueError:
                continue

    return bool(addresses) and all(_is_global(ip) for ip in addresses)


def _is_global(ip: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    return ip.is_global


def _domain_resolves(host: str) -> bool:
    if not host:
        return False

    try:
        socket.getaddrinfo(host, None, type=socket.SOCK_STREAM)
        return True
    except (socket.gaierror, OSError):
        return False


def _host(url: str | None) -> str:
    parsed = _parse_http_url(url)
    return parsed.hostname.lower().rstrip(".") if parsed else ""


def _domain_of(email: str) -> str:
    return email.rsplit("@", 1)[-1].lower()


def _registrable(host: str) -> str:
    """Approximate registrable domain; not a complete public-suffix implementation."""

    host = host.lower().strip(".")
    labels = host.split(".")

    if len(labels) < 2:
        return host

    # Handle common multi-label public suffixes.
    common_second_level_suffixes = {
        "co.in", "com.in", "net.in", "org.in",
        "co.uk", "org.uk", "ac.uk",
        "com.au", "net.au", "org.au",
    }

    last_two = ".".join(labels[-2:])

    if last_two in common_second_level_suffixes and len(labels) >= 3:
        return ".".join(labels[-3:])

    return last_two


def _is_job_board(host: str) -> bool:
    root = _registrable(host)
    return host in JOB_BOARDS or root in JOB_BOARDS


def _company_name(host: str | None, corpus: str) -> str | None:
    match = re.search(
        r"(?:company|organization|organisation)\s*[:\-]\s*"
        r"([A-Za-z0-9][A-Za-z0-9 .&]{1,60})",
        corpus,
        re.IGNORECASE,
    )

    if match:
        return match.group(1).strip(" .")

    if not host or _is_job_board(host):
        return None

    labels = host.split(".")
    label = labels[0]

    if label in {"www", "jobs", "careers", "mail"} and len(labels) > 2:
        label = labels[1]

    label = label.replace("-", " ").replace("_", " ").strip()

    if not label or label.isdigit():
        return None

    return label.title()


def _job_role(corpus: str) -> str | None:
    match = ROLE_RE.search(corpus)

    if match:
        return match.group(1).strip(" .")[:80]

    titled = re.search(
        r"\b((?:software|frontend|backend|data|graphic|marketing|hr|"
        r"human resources)[\w /]{0,40}"
        r"(?:intern(?:ship)?|engineer|developer|analyst|designer|manager))\b",
        corpus,
        re.IGNORECASE,
    )

    return titled.group(1).strip()[:80] if titled else None


def _normalize_phone(value: str) -> str:
    digits = re.sub(r"\D", "", value)

    if len(digits) < 10 or len(digits) > 15:
        return ""

    return value.strip()


def _unique(values) -> list[str]:
    seen = set()
    result = []

    for value in values:
        if value and value not in seen:
            seen.add(value)
            result.append(value)

    return result
