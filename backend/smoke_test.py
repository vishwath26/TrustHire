from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)

health = client.get("/health")
print("health", health.status_code, health.json())

response = client.post(
    "/api/investigations",
    data={
        "company_url": "https://example.com",
        "job_url": "https://example.com/careers",
    },
    files={
        "evidence_files": (
            "offer.txt",
            b"Role: Software Developer Intern\nCompany: Example Labs\nPay a registration fee of 500 before joining. Email recruiter@gmail.com. WhatsApp only.",
            "text/plain",
        )
    },
)
print("create", response.status_code)
body = response.json()
if response.status_code != 200:
    raise SystemExit(body)

print(body.get("public_id"), body.get("risk_level"), body.get("risk_score"))
print("findings", [(item["title"], item["points"]) for item in body.get("findings", [])])
print("company", body.get("company_name"), "role", body.get("job_role"))

public_id = body["public_id"]
graph = client.get(f"/api/investigations/{public_id}/graph")
print("graph", graph.status_code, len(graph.json()["nodes"]), len(graph.json()["edges"]))

threats = client.get("/api/threat-intelligence/")
print("threats", threats.status_code, threats.json()["summary"])

listing = client.get("/api/investigations")
print("list", listing.status_code, len(listing.json()))

low = client.post("/api/investigations", data={"company_url": "https://example.com"})
print("low", low.status_code, low.json().get("risk_level"), low.json().get("risk_score"), low.json().get("detail"))

local = client.post("/api/investigations", data={"job_url": "http://127.0.0.1/secret"})
print("local", local.status_code, local.json().get("risk_level"))
print([item["detail"] for item in local.json().get("findings", [])])
