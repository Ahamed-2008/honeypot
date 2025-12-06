from aiengine.models import EmailAnalysisRequest, PhishingAnalysisResponse
from aiengine.utils.llm import llm_client

async def analyze_phishing(email: EmailAnalysisRequest) -> PhishingAnalysisResponse:
    """
    Analyzes an email for phishing indicators using the LLM.
    """
    prompt = f"""
    Analyze the following email for phishing indicators.
    
    Subject: {email.subject}
    Sender: {email.sender}
    Body:
    {email.body}
    
    Check for:
    1. Urgency (e.g., "immediate action required")
    2. Threat (e.g., "account suspended")
    3. Fake Authority (e.g., pretending to be CEO/IT)
    4. Link Manipulation (suspicious URLs)
    5. Unrealistic Offers
    6. Social Engineering Tone
    
    Return a JSON object with the following fields:
    - is_phishing: boolean
    - risk_score: integer (0-100)
    - tags: list of strings (e.g., ["urgency", "fake_authority"])
    - reasoning: short string explaining the verdict
    """
    
    result = await llm_client.generate_json(prompt, system_prompt="You are a cybersecurity expert specializing in phishing detection.")
    
    # Fallback if LLM fails or returns invalid structure
    if "error" in result:
        return PhishingAnalysisResponse(
            is_phishing=False,
            risk_score=0,
            tags=["analysis_failed"],
            reasoning="LLM failed to analyze content."
        )
        
    return PhishingAnalysisResponse(
        is_phishing=result.get("is_phishing", False),
        risk_score=result.get("risk_score", 0),
        tags=result.get("tags", []),
        reasoning=result.get("reasoning", "No reasoning provided.")
    )
