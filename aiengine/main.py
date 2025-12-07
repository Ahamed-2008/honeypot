from fastapi import FastAPI
from aiengine.models import (
    HealthResponse, 
    EmailAnalysisRequest, 
    FullAnalysisResponse,
    PersonaResponse,
    PhishingAnalysisResponse
)
from aiengine.services.persona import select_persona
from aiengine.services.phishing import analyze_phishing

app = FastAPI(title="Honeypot AI Engine", version="0.1.0")

@app.get("/")
async def root():
    return {"detail": "Honeypot AI Engine - Use /health or /analyze endpoints"}

@app.get("/health", response_model=HealthResponse)
async def health_check():
    return {"status": "ok", "service": "ai-engine"}

@app.post("/analyze", response_model=FullAnalysisResponse)
async def analyze_email(request: EmailAnalysisRequest):
    # 1. Choose Persona
    persona_type = select_persona(request)
    persona_result = PersonaResponse(persona=persona_type, confidence=1.0) # Rule-based is confident
    
    # 2. Detect Phishing
    phishing_result = await analyze_phishing(request)
    
    return FullAnalysisResponse(
        persona=persona_result,
        phishing_analysis=phishing_result
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
