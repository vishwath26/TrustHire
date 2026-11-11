
import logging
import math
import re
from collections import Counter, defaultdict
from typing import Any

logger = logging.getLogger(__name__)

MAX_INPUT_LENGTH = 12000
MAX_FINDINGS = 10
MAX_EVIDENCE_LENGTH = 1000
MIN_SENTENCE_LENGTH = 15
MIN_CONFIDENCE = 0.40

ALLOWED_SEVERITIES = {"Low", "Medium", "High"}

ALLOWED_CATEGORIES = {
    "payment",
    "identity",
    "urgency",
    "salary",
    "recruiter",
    "company",
    "communication",
    "other",
}

# Demonstration training dataset.
# These examples are for prototype development,
# not a validated real-world fraud detection dataset.

TRAINING_DATA = {
    "payment": [
        "Applicants must pay a registration fee before receiving the offer.",
        "Pay a refundable security deposit to secure your job.",
        "Send processing charges to complete recruitment.",
        "Candidates must purchase our mandatory training package.",
        "Transfer money to activate your employment account.",
        "Applicants must pay a processing charge before their application is accepted.",
        "A candidate must transfer money to reserve an interview appointment.",
        "Pay the recruitment fee before the employer reviews your application.",
        "An upfront payment is mandatory to proceed with the hiring process.",
        "Send the required deposit to confirm your employment opportunity.",
        "Transfer 5000 rupees to reserve your position before the interview.",
        "The applicant must pay an advance fee to confirm employment.",
        "Send money to the recruiter before receiving the appointment letter.",
        "Pay the document verification fee to proceed with recruitment.",
        "A refundable interview reservation payment is required.",
    ],

    "identity": [
        "Send your bank account details and OTP for verification.",
        "Share your password and banking credentials.",
        "Provide your identity documents through this unknown link.",
        "We need your card number and PIN to process your application.",
        "Send your personal identification number immediately.",
        "Share your one-time password to complete candidate verification.",
        "Send your debit card PIN to the hiring department.",
        "Provide your Aadhaar number and banking password.",
        "Send your account password to the recruitment representative.",
        "Share your OTP to activate your employment profile.",
    ],

    "urgency": [
        "Apply immediately or your offer will be cancelled.",
        "This opportunity expires within the next few hours.",
        "Respond immediately without discussing this offer.",
        "You must accept this offer today without delay.",
        "Limited vacancies are available, act now.",
        "Your employment opportunity will disappear unless you respond within one hour.",
        "You have only thirty minutes to accept this employment offer.",
        "Failure to respond today will result in immediate cancellation.",
        "Confirm your employment immediately or lose this opportunity.",
        "The offer expires today and cannot be extended.",
    ],

    "salary": [
        "Earn an unusually high salary with no experience required.",
        "Guaranteed huge income for just one hour of work.",
        "Get an extremely high monthly salary without an interview.",
        "Unrealistic salary is guaranteed to every applicant.",
        "Earn thousands daily with absolutely no qualifications.",
        "Earn an extraordinary monthly income without attending an interview.",
        "We guarantee a massive salary despite having no experience or qualifications.",
        "Receive a huge guaranteed income for very little work.",
        "Earn a massive salary without completing any selection process.",
        "Every candidate receives an exceptionally high guaranteed salary.",
    ],

    "recruiter": [
        "Contact our recruiter through this unofficial email account.",
        "The recruiter refuses to provide professional identification.",
        "Our hiring manager cannot verify their company email.",
        "The recruiter communicates only through an anonymous account.",
        "The recruiter refuses to arrange an official interview.",
        "The hiring representative refuses to share their official company email.",
        "Our recruitment agent cannot provide any verifiable professional identity.",
        "The recruiter cannot confirm their association with the employer.",
        "The hiring agent refuses to identify their organisation.",
        "The recruitment representative uses an unverified personal account.",
    ],

    "company": [
        "The company website does not match the advertised employer.",
        "The employer has no verifiable official website.",
        "The company name differs across recruitment documents.",
        "The organisation cannot be independently verified.",
        "The advertised vacancy is absent from the official careers page.",
        "The advertised employer cannot be found in official company records.",
        "The vacancy does not appear on the employer's official careers portal.",
        "The company information differs between the offer letter and website.",
        "The organisation cannot confirm that the advertised vacancy exists.",
        "The employer's identity cannot be independently established.",
    ],

    "communication": [
        "The recruiter refuses to provide written job details.",
        "The employer avoids answering questions about the vacancy.",
        "The hiring process uses inconsistent communication channels.",
        "The recruiter will not arrange a formal interview.",
        "The employer provides contradictory recruitment instructions.",
        "The recruiter refuses to provide a written job description.",
        "The employer keeps changing the interview instructions.",
        "The hiring representative provides conflicting information.",
        "The recruiter avoids providing official employment documentation.",
        "The interview process is not explained clearly.",
    ],

    "safe": [
        "Please apply through our official company careers website.",
        "The interview will take place through our corporate email.",
        "No payment is required during the recruitment process.",
        "The job description is available on the official website.",
        "Our recruitment team will contact shortlisted applicants.",
        "The candidate will attend a scheduled technical interview.",
        "The company provides a written employment agreement.",
        "Applicants can independently verify this vacancy.",

        # Legitimate document disclaimers
        "This PDF must not be used, presented, or distributed as a genuine employment offer.",
        "This document is a fictional example and does not represent an actual vacancy.",
        "This document is provided for educational demonstration purposes only.",
        "The recruitment details in this sample are fictional.",
        "This sample document must not be distributed as a real job offer.",
        "No actual company or candidate is represented in this example.",

        # Legitimate onboarding
        "After accepting the written offer, submit your bank details through the company's secure payroll portal.",
        "Salary will be transferred to the employee's verified bank account after joining.",
        "The candidate must complete standard payroll documentation after joining.",
        "The company will collect necessary employment documents through its official HR portal.",
        "Successful candidates will receive their salary through the company payroll system.",
        "The employment contract will be provided after successful selection.",
        "Candidates can contact the human resources department through the official website.",
        "Employees receive their monthly salary through the company's payroll system.",
        "The company has scheduled a technical interview for Monday.",
    ],
}


def tokenize(text: str) -> list[str]:
    """Convert text into lowercase word tokens."""
    return re.findall(r"[a-zA-Z]{2,}", text.lower())


class NaiveBayesClassifier:
    """Multinomial Naive Bayes classifier using Python's standard library."""

    def __init__(self):
        self.word_counts = defaultdict(Counter)
        self.class_counts = Counter()
        self.vocabulary = set()
        self.total_samples = 0
        self.trained = False

    def fit(self, training_data: dict[str, list[str]]) -> None:
        """Train the classifier from labelled examples."""

        self.word_counts.clear()
        self.class_counts.clear()
        self.vocabulary.clear()
        self.total_samples = 0

        for label, examples in training_data.items():
            for example in examples:
                words = tokenize(example)

                if not words:
                    continue

                self.word_counts[label].update(words)
                self.vocabulary.update(words)
                self.class_counts[label] += 1
                self.total_samples += 1

        self.trained = self.total_samples > 0

    def predict(self, text: str) -> tuple[str, float]:
        """Return predicted category and model confidence."""

        if not self.trained:
            raise RuntimeError("Classifier has not been trained.")

        words = tokenize(text)

        if not words:
            return "safe", 0.0

        vocabulary_size = max(len(self.vocabulary), 1)
        word_frequencies = Counter(words)
        scores = {}

        for label, sample_count in self.class_counts.items():
            prior = math.log(sample_count / self.total_samples)

            total_words = sum(self.word_counts[label].values())
            denominator = total_words + vocabulary_size

            score = prior

            for word, frequency in word_frequencies.items():
                word_count = self.word_counts[label][word]

                probability = (
                    (word_count + 1) / denominator
                )

                score += frequency * math.log(probability)

            scores[label] = score

        maximum = max(scores.values())

        probabilities = {
            label: math.exp(score - maximum)
            for label, score in scores.items()
        }

        total = sum(probabilities.values())

        if total <= 0:
            return "safe", 0.0

        probabilities = {
            label: value / total
            for label, value in probabilities.items()
        }

        prediction = max(probabilities, key=probabilities.get)

        return prediction, probabilities[prediction]


# Train once when the module is imported.
classifier = NaiveBayesClassifier()
classifier.fit(TRAINING_DATA)

# --------------------------------------------------
# OCR NORMALIZATION AND CONTEXT-AWARE CLASSIFICATION
# --------------------------------------------------

MAX_SEGMENT_LENGTH = 600
MIN_CONFIDENCE = 0.50

SAFE_CONTEXT_PATTERNS = [
    r"\bfictional demo\b",
    r"\bfictional example\b",
    r"\btraining sample\b",
    r"\bnot a real offer\b",
    r"\bnot valid for employment\b",
    r"\bnot an authentic hiring communication\b",
    r"\bfictional details\b",
    r"\bcreated solely for .* testing\b",
    r"\bdoes not represent an actual vacancy\b",
    r"\beducational demonstration\b",
    r"\bsample recruitment document\b",
    r"\bno actual company or candidate\b",
    r"\bmust not be used.*genuine employment offer\b",
]

EDUCATIONAL_CONTEXT_PATTERNS = [
    r"\btraining note\b",
    r"\bthis sample intentionally includes\b",
    r"\btest artifact\b",
    r"\bfraud[- ]detection test\b",
]

ROUTINE_CONTEXT_PATTERNS = [
    r"\btechnical interview\b",
    r"\bproposed joining date\b",
    r"\bposition details\b",
    r"\bdepartment\b",
    r"\bwork arrangement\b",
    r"\bworking hours\b",
    r"\bcompensation\b",
    r"\bshare the next onboarding instructions\b",
]

# These indicate an actual requested action, rather than merely
# discussing a risk indicator in an educational disclaimer.
EXPLICIT_ACTION_PATTERNS = [
    r"\b(?:pay|transfer|send|deposit|remit)\b.{0,100}\b(?:fee|payment|money|charge|deposit|rupees|rs\.?|inr)\b",
    r"\b(?:fee|payment|charge|deposit)\b.{0,100}\b(?:required|mandatory|before|to secure|to reserve|to proceed)\b",
    r"\b(?:otp|one.time password|password|pin)\b.{0,80}\b(?:share|send|provide|reveal)\b",
    r"\b(?:share|send|provide|reveal)\b.{0,80}\b(?:otp|one.time password|password|pin)\b",
    r"\btransaction screenshot\b",
]

STRONG_RISK_PATTERNS = [
    r"\bprocessing charge\b",
    r"\bupfront payment\b",
    r"\bregistration fee\b",
    r"\bsecurity deposit\b",
    r"\btransaction screenshot\b",
    r"\b(?:otp|one.time password|password|pin)\b",
]

# A category must have relevant textual evidence before the model
# is allowed to report it.
CATEGORY_EVIDENCE_PATTERNS = {
    "payment": [
        r"\b(?:registration|processing|application|interview|training|security)\s+(?:fee|charge|payment|deposit)\b",
        r"\b(?:upfront|advance|refundable)\s+(?:fee|payment|deposit)\b",
        r"\b(?:pay|transfer|send|deposit|remit)\b.{0,120}\b(?:money|fee|payment|charge|deposit|rupees|rs\.?|inr)\b",
        r"\b(?:payment|fee|charge|deposit)\b.{0,100}\b(?:required|mandatory|before|to secure|to reserve)\b",
        r"\btransaction screenshot\b",
    ],

    "identity": [
        r"\b(?:otp|one.time password|password|pin|banking credentials)\b",
        r"\b(?:share|send|provide|reveal)\b.{0,100}\b(?:aadhaar|passport|identity documents|bank account details|card number)\b",
        r"\b(?:bank account|debit card|credit card)\b.{0,60}\b(?:password|pin|credentials)\b",
    ],

    "urgency": [
        r"\b(?:immediately|within the next few hours|within one hour|within thirty minutes)\b",
        r"\b(?:offer|opportunity|vacancy)\b.{0,100}\b(?:expires|cancelled|canceled|disappear)\b",
        r"\brespond today or\b",
        r"\baccept this offer today\b",
        r"\bwithout delay\b",
    ],

    "salary": [
        r"\b(?:guaranteed|huge|massive|extraordinary|unusually high)\b.{0,80}\b(?:salary|income|earnings)\b",
        r"\b(?:salary|income|earnings)\b.{0,80}\b(?:guaranteed|without experience|without qualifications)\b",
        r"\bearn thousands daily\b",
    ],

    "recruiter": [
        r"\b(?:recruiter|hiring manager|hiring representative|recruitment agent)\b.{0,100}\b(?:refuses|refuse|cannot provide|unverified|anonymous|unofficial)\b",
        r"\b(?:anonymous|unofficial|unverified)\b.{0,80}\b(?:recruiter|recruitment|email|account)\b",
    ],

    "company": [
        r"\b(?:company|employer|organisation|organization)\b.{0,100}\b(?:cannot be verified|cannot confirm|no verifiable|cannot be found)\b",
        r"\b(?:official website|official careers page|careers portal)\b.{0,100}\b(?:does not|cannot|absent|missing)\b",
    ],

    "communication": [
        r"\b(?:recruiter|employer|hiring representative)\b.{0,100}\b(?:refuses|avoids|contradictory|conflicting|inconsistent)\b",
        r"\b(?:written job details|written job description|formal interview)\b.{0,100}\b(?:refuses|avoids|not provided|will not)\b",
    ],
}



# --------------------------------------------------
# OCR NORMALIZATION AND CONTEXT FILTERING
# --------------------------------------------------

MAX_SEGMENT_LENGTH = 600
MIN_CONFIDENCE = 0.50

SAFE_CONTEXT_PATTERNS = [
    r"\bfictional demo\b",
    r"\bfictional example\b",
    r"\btraining sample\b",
    r"\bnot a real offer\b",
    r"\bnot valid for employment\b",
    r"\bnot an authentic hiring communication\b",
    r"\bfictional details\b",
    r"\bcreated solely for\b",
    r"\bdoes not represent an actual vacancy\b",
    r"\beducational demonstration\b",
    r"\bsample recruitment document\b",
    r"\bmust not be used.*genuine employment offer\b",
]

EDUCATIONAL_CONTEXT_PATTERNS = [
    r"\btraining note\b",
    r"\bthis sample intentionally includes\b",
    r"\bfraud-detection test artifact\b",
    r"\bcreated solely for trusthire testing\b",
]

# Do not classify ordinary employment metadata as suspicious.
# A technical interview is only routine when it is actually scheduled.
ROUTINE_CONTEXT_PATTERNS = [
    r"\btechnical interview (?:is )?scheduled\b",
    r"\bshare the next onboarding instructions\b",
]

# Explicit actions that can override a disclaimer or routine context.
EXPLICIT_ACTION_PATTERNS = [
    r"\b(?:candidate|applicant|employee)\b.{0,100}\b(?:requested|asked|instructed|required)\b.{0,100}\b(?:pay|transfer|send|deposit|share|provide)\b",
    r"\b(?:pay|transfer|send|deposit)\b.{0,100}\b(?:fee|payment|money|charge|deposit|rupees|rs|inr)\b",
    r"\b(?:share|send|provide|reveal)\b.{0,50}\b(?:otp|one.time password|password|pin)\b",
    r"\b(?:transaction|payment)\s+screenshot\b",
]


def _matches_any(patterns: list[str], text: str) -> bool:
    return any(
        re.search(pattern, text, re.IGNORECASE)
        for pattern in patterns
    )


def _is_heading(line: str) -> bool:
    line = line.strip()

    if not line or len(line) > 100:
        return False

    return bool(
        line.isupper()
        or re.match(r"^\d+(?:\.\d+)*\.?\s+", line)
    )


def normalize_ocr_text(text: str) -> str:
    """
    Clean OCR text while preserving paragraph and heading boundaries.
    Join only short wrapped lines; never merge an entire page.
    """
    if not isinstance(text, str):
        return ""

    text = text.replace("\r\n", "\n").replace("\r", "\n")

    lines = [line.strip() for line in text.split("\n")]

    output = []
    current = ""

    for line in lines:
        if not line:
            if current:
                output.append(current)
                current = ""
            continue

        if not current:
            current = line
            continue

        if (
            current.endswith((".", "!", "?"))
            or _is_heading(current)
            or _is_heading(line)
            or len(current) >= 220
        ):
            output.append(current)
            current = line
        else:
            current += " " + line

        # Keep each OCR block bounded.
        if len(current) >= 220:
            output.append(current)
            current = ""

    if current:
        output.append(current)

    return "\n".join(output)


def is_safe_context(sentence: str) -> bool:
    """Ignore disclaimers and educational notes unless they contain an explicit action."""

    has_explicit_action = _matches_any(
        EXPLICIT_ACTION_PATTERNS,
        sentence
    )

    if has_explicit_action:
        return False

    if _matches_any(EDUCATIONAL_CONTEXT_PATTERNS, sentence):
        return True

    if _matches_any(SAFE_CONTEXT_PATTERNS, sentence):
        return True

    if _matches_any(ROUTINE_CONTEXT_PATTERNS, sentence):
        return True

    return False


def _split_into_segments(text: str) -> list[str]:
    """Split OCR text into bounded, meaningful evidence segments."""

    segments = []

    for block in text.split("\n"):
        block = block.strip()

        if not block:
            continue

        sentences = re.split(
            r"(?<=[.!?])\s+",
            block
        )

        for sentence in sentences:
            sentence = sentence.strip()

            if not sentence:
                continue

            if len(sentence) <= MAX_SEGMENT_LENGTH:
                segments.append(sentence)
                continue

            parts = re.split(
                r"(?<=[;:])\s+|\s+[•|]\s+",
                sentence
            )

            for part in parts:
                part = part.strip()

                if part:
                    segments.append(
                        part[:MAX_SEGMENT_LENGTH]
                    )

    return segments


def _has_category_evidence(category: str, sentence: str) -> bool:
    """Require matching evidence before accepting a model prediction."""

    patterns = CATEGORY_EVIDENCE_PATTERNS.get(category, [])

    if not patterns:
        return category == "other"

    return _matches_any(patterns, sentence)


def analyze_recruitment_text(text: str) -> dict:
    """
    Analyze recruitment text using Naive Bayes and contextual filtering.

    Confidence is a model score, not the probability that a job is fraudulent.
    """

    if not isinstance(text, str) or not text.strip():
        return _failure("No readable recruitment text was provided.")

    normalized_text = normalize_ocr_text(
        text[:MAX_INPUT_LENGTH]
    )

    if not normalized_text:
        return _failure("No readable recruitment text was provided.")

    segments = _split_into_segments(normalized_text)

    findings = []
    seen_evidence = set()

    for sentence in segments:

        if len(sentence) < MIN_SENTENCE_LENGTH:
            continue

        if is_safe_context(sentence):
            continue

        category, confidence = classifier.predict(sentence)

        if category == "safe":
            continue

        if confidence < MIN_CONFIDENCE:
            continue

        if not _has_category_evidence(category, sentence):
            continue

        evidence = sentence[:MAX_EVIDENCE_LENGTH]
        fingerprint = (category, evidence.casefold())

        if fingerprint in seen_evidence:
            continue

        seen_evidence.add(fingerprint)

        if confidence >= 0.70:
            severity = "High"
        elif confidence >= 0.55:
            severity = "Medium"
        else:
            severity = "Low"

        findings.append({
            "category": category,
            "severity": severity,
            "confidence": round(confidence, 4),
            "evidence": evidence,
            "reason": (
                f"The local Naive Bayes model classified this text "
                f"as {category}, and matching category-specific "
                "evidence was found. Independent verification is required."
            ),
        })

        if len(findings) >= MAX_FINDINGS:
            break

    return {
        "success": True,
        "summary": (
            f"The local ML model identified {len(findings)} "
            "potentially suspicious language indicator(s). "
            "These findings require contextual review."
        ),
        "findings": findings,
    }


def validate_result(result: Any, evidence: str) -> dict | None:
    """Validate classifier output and require exact evidence quotations."""

    if not isinstance(result, dict):
        return None

    summary = result.get("summary", "")

    if not isinstance(summary, str):
        return None

    raw_findings = result.get("findings", [])

    if not isinstance(raw_findings, list):
        return None

    validated_findings = []
    seen = set()

    for item in raw_findings[:MAX_FINDINGS]:
        if not isinstance(item, dict):
            continue

        category = item.get("category")
        quotation = item.get("evidence")
        reason = item.get("reason")
        severity = item.get("severity")

        if category not in ALLOWED_CATEGORIES - {"safe"}:
            continue

        if severity not in ALLOWED_SEVERITIES:
            continue

        if not all(
            isinstance(value, str)
            for value in (quotation, reason)
        ):
            continue

        quotation = quotation.strip()
        reason = reason.strip()

        if not quotation or not reason:
            continue

        if quotation not in evidence:
            continue

        fingerprint = (category, quotation.casefold())

        if fingerprint in seen:
            continue

        seen.add(fingerprint)

        validated_findings.append({
            "category": category,
            "evidence": quotation[:MAX_EVIDENCE_LENGTH],
            "reason": reason[:1500],
            "severity": severity,
        })

    return {
        "summary": summary[:1500],
        "findings": validated_findings,
    }


def _failure(message: str) -> dict:
    return {
        "success": False,
        "error": message,
        "summary": "",
        "findings": [],
    }
