"""
Production-Ready Email Ingestion API
Features: Async AI calls, robust parsing, security checks, proper error handling
"""
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional
from email.utils import parseaddr
from contextlib import asynccontextmanager
import mailparser
import httpx
import uuid
import re
import logging
from datetime import datetime
import sys
import os

# Add parent directory to path to import aiengine
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, HTMLResponse
from aiengine.services.phishing import analyze_phishing
from aiengine.services.persona import select_persona
from aiengine.models import EmailAnalysisRequest, FullAnalysisResponse, PersonaResponse

# ============================================
# CONFIGURATION
# ============================================

# File limits
MAX_EML_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_MIME_TYPES = ["message/rfc822", "text/plain", "application/octet-stream"]



# Security patterns
SUSPICIOUS_KEYWORDS = [
    "urgent", "payment", "invoice", "password", "verify", "reset",
    "suspended", "confirm", "click here", "act now", "limited time",
    "account locked", "unusual activity", "security alert"
]

SHORTENED_DOMAINS = ["bit.ly", "tinyurl.com", "goo.gl", "ow.ly", "t.co", "buff.ly"]

# ============================================
# LOGGING SETUP
# ============================================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - [%(request_id)s] %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================
# PYDANTIC MODELS
# ============================================

class URLDetail(BaseModel):
    """Detailed URL information"""
    url: str
    domain: Optional[str] = None
    scheme: str
    is_suspicious: bool = False
    reason: Optional[str] = None

class IngestPayload(BaseModel):
    """Standardized email ingestion payload"""
    id: str
    sender: Optional[str] = Field(None, alias="from")
    from_display: Optional[str] = None
    to: Optional[List[str]] = []
    subject: Optional[str] = None
    body_text: Optional[str] = None
    body_html: Optional[str] = None
    urls: List[URLDetail] = []
    attachments: List[str] = []
    suspicious_keywords: List[str] = []
    domain_mismatch: bool = False
    dkim_spf_result: Optional[str] = None
    initial_risk_score: int = Field(0, ge=0, le=100)
    timestamp: str
    
    class Config:
        populate_by_name = True

class IngestResponse(BaseModel):
    """API response model"""
    status: str
    id: str
    risk_score: int
    classification: Optional[str] = None
    message: str
    subject: Optional[str] = None
    sender: Optional[str] = None
    email_text: Optional[str] = None
    ai_analysis: Optional[dict] = None

# ============================================
# APP INITIALIZATION
# ============================================

app = FastAPI(
    title="Email Ingestion API",
    description="Production-ready email security ingestion service",
    version="2.0.0"
)

# CORS - RESTRICT IN PRODUCTION
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"],  # Restrict to known origins
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# Mount static files
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
app.mount("/assets", StaticFiles(directory=os.path.join(BASE_DIR, "dist/assets")), name="assets")

# ============================================
# MIDDLEWARE - REQUEST ID
# ============================================

@app.middleware("http")
async def add_request_id(request: Request, call_next):
    """Add unique request ID to all requests for tracing"""
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    
    # Add to logging context
    logger.info(f"Incoming request: {request.method} {request.url.path}", 
                extra={"request_id": request_id})
    
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

# ============================================
# HELPER FUNCTIONS
# ============================================

def extract_urls_robust(text: str) -> List[URLDetail]:
    """
    Extract URLs with detailed parsing and security checks
    Uses improved regex and validates structure
    """
    if not text:
        return []
    
    # More robust URL pattern
    url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
    found_urls = re.findall(url_pattern, text, re.IGNORECASE)
    
    url_details = []
    for url in found_urls:
        # Clean trailing punctuation
        url = url.rstrip('.,;:!?)')
        
        # Parse URL components
        scheme = "http" if url.startswith("http://") else "https"
        domain = extract_domain_from_url(url)
        
        # Check for suspicious characteristics
        is_suspicious = False
        reason = None
        
        if scheme == "http":
            is_suspicious = True
            reason = "insecure_http"
        elif any(short_domain in url.lower() for short_domain in SHORTENED_DOMAINS):
            is_suspicious = True
            reason = "shortened_url"
        elif domain and (domain.endswith(".tk") or domain.endswith(".ml") or domain.endswith(".ga")):
            is_suspicious = True
            reason = "suspicious_tld"
        
        url_details.append(URLDetail(
            url=url,
            domain=domain,
            scheme=scheme,
            is_suspicious=is_suspicious,
            reason=reason
        ))
    
    return url_details

def extract_domain_from_url(url: str) -> Optional[str]:
    """Extract domain from URL string"""
    try:
        # Simple domain extraction without external deps
        parts = url.split("//")
        if len(parts) > 1:
            domain_part = parts[1].split("/")[0].split(":")[0]
            return domain_part.lower()
    except Exception:
        pass
    return None

def check_domain_mismatch(from_addr: str, from_display: str) -> bool:
    """
    Check if sender domain doesn't match display name domain
    Uses email.utils.parseaddr for robust parsing
    """
    if not from_addr or not from_display:
        return False
    
    # Parse actual email address
    _, email = parseaddr(from_addr)
    email_domain = email.split("@")[-1].lower() if "@" in email else ""
    
    # Parse display name for embedded email
    _, display_email = parseaddr(from_display)
    
    if display_email and "@" in display_email:
        display_domain = display_email.split("@")[-1].lower()
        
        # Compare base domains
        if email_domain and display_domain and email_domain != display_domain:
            return True
    
    return False

def check_suspicious_keywords(text: str, keywords: List[str]) -> List[str]:
    """
    Check for suspicious keywords with normalization
    Handles common obfuscation techniques
    """
    if not text:
        return []
    
    # Normalize text: remove extra spaces, convert to lowercase
    normalized = re.sub(r'\s+', ' ', text.lower())
    
    found = []
    for keyword in keywords:
        # Check for exact match and common obfuscations
        if keyword in normalized:
            found.append(keyword)
        # Check for spaced variations (e.g., "p a s s w o r d")
        elif ' '.join(keyword) in normalized:
            found.append(keyword)
    
    return found

def calculate_risk_score(payload: dict) -> int:
    """Calculate risk score based on multiple factors"""
    score = 0
    
    # Suspicious keywords (10 points each, max 40)
    score += min(len(payload.get("suspicious_keywords", [])) * 10, 40)
    
    # Suspicious URLs (15 points each, max 45)
    suspicious_url_count = sum(1 for url in payload.get("urls", []) if url.get("is_suspicious"))
    score += min(suspicious_url_count * 15, 45)
    
    # Domain mismatch (20 points)
    if payload.get("domain_mismatch"):
        score += 20
    
    # Attachments (5 points each, max 15)
    score += min(len(payload.get("attachments", [])) * 5, 15)
    
    # Missing DKIM/SPF (10 points)
    if not payload.get("dkim_spf_result"):
        score += 10
    
    return min(score, 100)

# ============================================
# AI SERVICE INTEGRATION
# ============================================



# ============================================
# ROUTES
# ============================================

@app.get("/api-root")
async def api_root():
    """API Root endpoint"""
    return {
        "service": "Email Ingestion API",
        "version": "2.0.0",
        "status": "operational"
    }

# SPA root route
@app.get("/")
async def serve_spa_root():
    """Serve the SPA index.html at root"""
    return HTMLResponse(content=open(os.path.join(BASE_DIR, "dist/index.html")).read())

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/ingest-email", response_model=IngestResponse)
async def ingest_email(
    request: Request,
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None)
):
    """
    Ingest email from file upload (.eml) or raw text
    Performs security analysis and forwards to AI service
    """
    request_id = request.state.request_id
    
    # Validation: must provide either file or raw_text
    if not file and not raw_text:
        raise HTTPException(
            status_code=400,
            detail="Must provide either 'file' or 'raw_text'"
        )
    
    # Parse email
    try:
        if file:
            # Check file size
            content = await file.read()
            if len(content) > MAX_EML_SIZE:
                raise HTTPException(
                    status_code=413,
                    detail=f"File too large. Maximum size: {MAX_EML_SIZE / (1024*1024)}MB"
                )
            
            # Check MIME type (if provided)
            if file.content_type and file.content_type not in ALLOWED_MIME_TYPES:
                logger.warning(f"Unexpected MIME type: {file.content_type}", 
                             extra={"request_id": request_id})
            
            # Parse with mailparser
            mail = mailparser.parse_from_bytes(content)
            
            # Extract both text and HTML bodies
            body_text = mail.text_plain[0] if mail.text_plain else (mail.body or "")
            body_html = mail.text_html[0] if mail.text_html else ""
            
            subject = mail.subject or ""
            from_addr = mail.from_[0][1] if mail.from_ else ""
            from_display = mail.from_[0][0] if mail.from_ else ""
            to_addrs = [addr[1] for addr in mail.to] if mail.to else []
            
            # Extract attachments safely
            attachments = []
            if mail.attachments:
                for att in mail.attachments:
                    filename = att.get("filename", "unknown")
                    # Sanitize filename
                    filename = re.sub(r'[^\w\s\-.]', '', filename)
                    attachments.append(filename)
            
            # Extract DKIM/SPF
            headers = dict(mail.headers) if mail.headers else {}
            dkim_spf = headers.get("Authentication-Results")
            
        else:
            # Raw text parsing
            body_text = raw_text or ""
            body_html = ""
            subject = "N/A"
            from_addr = ""
            from_display = ""
            to_addrs = []
            attachments = []
            dkim_spf = None
        
    except Exception as e:
        logger.error(f"Email parsing failed: {str(e)}", 
                    extra={"request_id": request_id})
        raise HTTPException(
            status_code=400,
            detail=f"Failed to parse email: {str(e)}"
        )
    
    # Security analysis
    try:
        # Extract URLs from both text and HTML
        combined_text = f"{body_text} {body_html}"
        urls = extract_urls_robust(combined_text)
        
        # Check for suspicious keywords
        combined_content = f"{subject} {body_text}".lower()
        suspicious_keywords = check_suspicious_keywords(
            combined_content, 
            SUSPICIOUS_KEYWORDS
        )
        
        # Check domain mismatch
        domain_mismatch = check_domain_mismatch(from_addr, from_display)
        
        # Build payload
        email_id = str(uuid.uuid4())
        payload_dict = {
            "id": email_id,
            "from": from_addr,
            "from_display": from_display,
            "to": to_addrs,
            "subject": subject,
            "email_text": body_text,
            "body_html": body_html,
            "urls": [url.dict() for url in urls],
            "attachments": attachments,
            "suspicious_keywords": suspicious_keywords,
            "domain_mismatch": domain_mismatch,
            "dkim_spf_result": dkim_spf,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Calculate risk score
        risk_score = calculate_risk_score(payload_dict)
        payload_dict["initial_risk_score"] = risk_score
        
        # Validate with Pydantic
        payload = IngestPayload(**payload_dict)
        
        logger.info(
            f"Email parsed successfully - Risk: {risk_score}, "
            f"Keywords: {len(suspicious_keywords)}, URLs: {len(urls)}",
            extra={"request_id": request_id}
        )
        
    except Exception as e:
        logger.error(f"Security analysis failed: {str(e)}", 
                    extra={"request_id": request_id})
        raise HTTPException(
            status_code=500,
            detail=f"Security analysis failed: {str(e)}"
        )
    
    # Direct AI Service Call
    try:
        ai_request = EmailAnalysisRequest(
            subject=subject,
            body=body_text,
            sender=from_addr
        )
        
        # 1. Choose Persona
        persona_type = select_persona(ai_request)
        persona_result = PersonaResponse(persona=persona_type, confidence=1.0)
        
        # 2. Detect Phishing
        phishing_result = await analyze_phishing(ai_request)
        
        ai_result = FullAnalysisResponse(
            persona=persona_result,
            phishing_analysis=phishing_result
        ).dict()
        
    except Exception as e:
        logger.error(f"AI analysis failed: {str(e)}", extra={"request_id": request_id})
        ai_result = {"error": str(e)}
    
    # Determine classification
    if risk_score >= 70:
        classification = "high_risk"
    elif risk_score >= 40:
        classification = "medium_risk"
    else:
        classification = "low_risk"
    
    # Return response with AI analysis
    return IngestResponse(
        status="processed",
        id=email_id,
        risk_score=risk_score,
        classification=classification,
        message="Email analyzed successfully",
        subject=subject,
        sender=from_addr,
        email_text=body_text,
        ai_analysis=ai_result
    )

# ============================================
# LIFECYCLE EVENTS
# ============================================

@app.on_event("startup")
async def startup():
    """Initialize resources on startup"""
    logger.info("🚀 Email Ingestion API starting up...")

@app.on_event("shutdown")
async def shutdown():
    """Cleanup resources on shutdown"""
    logger.info("🛑 Shutting down...")
    logger.info("🛑 Shutting down...")

# ============================================
# ERROR HANDLERS
# ============================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler with request ID"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "request_id": getattr(request.state, "request_id", None)
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Catch-all exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}", 
                extra={"request_id": getattr(request.state, "request_id", None)})
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc),
            "request_id": getattr(request.state, "request_id", None)
        }
    )
# SPA Catch-all route
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    """Serve the SPA index.html for any unmatched route"""
    return HTMLResponse(content=open(os.path.join(BASE_DIR, "dist/index.html")).read())
# ============================================
# RUN SERVER
# ============================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )