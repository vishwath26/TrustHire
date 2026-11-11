
from app.services.ai_analyzer import classifier

tests = [
    ("payment", "A processing charge is required before your application can proceed."),
    ("payment", "Send the deposit to our recruitment agent to confirm your appointment."),

    ("identity", "Share your one-time password to complete candidate verification."),
    ("identity", "Send your debit card PIN to the hiring department."),

    ("urgency", "You have only thirty minutes to accept this employment offer."),
    ("urgency", "Failure to respond today will result in immediate cancellation."),

    ("salary", "Earn an extraordinary monthly income without attending an interview."),
    ("salary", "We guarantee a massive salary despite having no experience or qualifications."),

    ("recruiter", "The hiring representative refuses to share their official company email."),
    ("recruiter", "Our recruitment agent cannot provide any verifiable professional identity."),

    ("company", "The advertised employer cannot be found in official company records."),
    ("company", "The vacancy does not appear on the employer's official careers portal."),

    ("communication", "The recruiter refuses to provide a written job description."),
    ("communication", "The employer keeps changing the interview instructions."),

    ("safe", "The company has scheduled a technical interview for Monday."),
    ("safe", "The employment contract will be provided after successful selection."),
    ("safe", "Candidates can contact the human resources department through the official website."),
    ("safe", "Employees receive their monthly salary through the company's payroll system."),
]

correct = 0

for expected, sentence in tests:
    predicted, confidence = classifier.predict(sentence)

    passed = predicted == expected
    correct += passed

    print(
        f"{'PASS' if passed else 'CHECK'} | "
        f"Expected: {expected:14} | "
        f"Predicted: {predicted:14} | "
        f"Confidence: {confidence:.2%}"
    )

print(f"\nCorrect predictions: {correct}/{len(tests)}")
print(f"Test-set agreement: {correct / len(tests) * 100:.2f}%")
