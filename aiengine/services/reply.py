from aiengine.models import EmailAnalysisRequest, PersonaType, ReplyResponse
from aiengine.utils.llm import llm_client

async def generate_reply(email: EmailAnalysisRequest, persona: PersonaType) -> ReplyResponse:
    """
    Generates a reply based on the selected persona.
    """
    
    persona_traits = {
        PersonaType.FINANCE: "cautious, formal, asks for verification, concerned about invoices/payments",
        PersonaType.HR: "polite, compliant, helpful, asks for candidate details or scheduling",
        PersonaType.IT: "technical, suspicious of security issues, asks for ticket numbers or logs",
        PersonaType.GENERAL: "naive, helpful, slightly confused, asks for clarification"
    }
    
    traits = persona_traits.get(persona, persona_traits[PersonaType.GENERAL])
    
    prompt = f"""
    You are an employee with the following traits: {traits}.
    You received this email:
    
    Subject: {email.subject}
    Sender: {email.sender}
    Body:
    {email.body}
    
    Draft a short reply. Do not break character. Do not mention you are an AI.
    If the email seems suspicious, play along but be slightly hesitant or ask a clarifying question based on your persona.
    """
    
    reply_text = await llm_client.generate_text(prompt, system_prompt=f"You are a {persona.value} employee.")
    
    return ReplyResponse(
        reply_body=reply_text.strip(),
        persona_used=persona
    )
