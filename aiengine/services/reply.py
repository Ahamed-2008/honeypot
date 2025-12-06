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
    
    Draft a reply email.
    Return a JSON object with two fields:
    - "subject": The subject line of the reply (e.g., "Re: ...")
    - "body": The body of the reply.
    
    Do not break character. Do not mention you are an AI.
    """
    
    result = await llm_client.generate_json(prompt, system_prompt=f"You are a {persona.value} employee.")
    
    # Fallback
    if "error" in result:
        return ReplyResponse(
            reply_subject=f"Re: {email.subject}",
            reply_body="I received your email and will get back to you shortly.",
            persona_used=persona
        )

    return ReplyResponse(
        reply_subject=result.get("subject", f"Re: {email.subject}"),
        reply_body=result.get("body", "").strip(),
        persona_used=persona
    )
