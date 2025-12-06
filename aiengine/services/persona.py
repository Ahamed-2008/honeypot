from aiengine.models import PersonaType, EmailAnalysisRequest

def select_persona(email: EmailAnalysisRequest) -> PersonaType:
    """
    Selects a persona based on keywords in the email content.
    """
    text = (email.subject + " " + email.body).lower()
    
    finance_keywords = ["invoice", "payment", "bank", "account", "transfer", "billing"]
    hr_keywords = ["resume", "candidate", "offer letter", "hiring", "interview", "job application"]
    it_keywords = ["password", "reset", "vpn", "access", "login", "authentication", "security update"]
    
    # Check for keywords
    if any(keyword in text for keyword in finance_keywords):
        return PersonaType.FINANCE
    
    if any(keyword in text for keyword in hr_keywords):
        return PersonaType.HR
        
    if any(keyword in text for keyword in it_keywords):
        return PersonaType.IT
        
    return PersonaType.GENERAL
