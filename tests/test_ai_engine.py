from fastapi.testclient import TestClient
from aiengine.main import app
from aiengine.models import PersonaType

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "ai-engine"}

def test_analyze_finance_persona():
    payload = {
        "subject": "Invoice #12345 Overdue",
        "sender": "billing@vendor.com",
        "body": "Please process this payment immediately."
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    # Check Persona
    assert data["persona"]["persona"] == PersonaType.FINANCE
    
    # Check Phishing (Mock/LLM might vary, but structure should be there)
    assert "is_phishing" in data["phishing_analysis"]
    
    # Check Reply
    assert data["generated_reply"]["persona_used"] == PersonaType.FINANCE
    assert "reply_subject" in data["generated_reply"]
    assert len(data["generated_reply"]["reply_body"]) > 0

def test_analyze_hr_persona():
    payload = {
        "subject": "Candidate Resume",
        "sender": "applicant@gmail.com",
        "body": "Attached is my resume for the position."
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["persona"]["persona"] == PersonaType.HR

def test_analyze_it_persona():
    payload = {
        "subject": "Password Reset Required",
        "sender": "admin@company.com",
        "body": "Click here to reset your VPN password."
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["persona"]["persona"] == PersonaType.IT
