from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class PersonaType(str, Enum):
    FINANCE = "finance"
    HR = "hr"
    IT = "it"
    GENERAL = "general"

class HealthResponse(BaseModel):
    status: str
    service: str

class EmailAnalysisRequest(BaseModel):
    subject: str
    body: str
    sender: str

class PersonaResponse(BaseModel):
    persona: PersonaType
    confidence: float

class PhishingAnalysisResponse(BaseModel):
    is_phishing: bool
    risk_score: int
    tags: List[str]
    reasoning: str

class FullAnalysisResponse(BaseModel):
    persona: PersonaResponse
    phishing_analysis: PhishingAnalysisResponse
