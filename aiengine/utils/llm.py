import os
import httpx
import json
from typing import Optional, Dict, Any

class LLMClient:
    def __init__(self, base_url: str = "http://localhost:11434/v1", model: str = "gemma3"):
        self.base_url = os.getenv("LLM_BASE_URL", base_url)
        self.model = os.getenv("LLM_MODEL", model)
        self.api_key = os.getenv("LLM_API_KEY", "ollama") # Ollama doesn't need a real key usually

    async def generate_text(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """
        Generates text using the local LLM via OpenAI-compatible API (e.g., Ollama).
        """
        url = f"{self.base_url}/chat/completions"
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.7,
            "stream": False
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    url, 
                    json=payload, 
                    headers={"Authorization": f"Bearer {self.api_key}"}
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"Error calling LLM: {e}")
            # Fallback for development if LLM is not running
            return f"[MOCK LLM RESPONSE] Processed prompt: {prompt[:50]}..."

    async def generate_json(self, prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        """
        Generates JSON output. Appends instruction to return JSON.
        """
        json_prompt = f"{prompt}\n\nIMPORTANT: Respond ONLY with valid JSON."
        response_text = await self.generate_text(json_prompt, system_prompt)
        
        # Basic cleanup to find JSON blob if LLM chats around it
        try:
            # Try to find { and }
            start = response_text.find("{")
            end = response_text.rfind("}") + 1
            if start != -1 and end != -1:
                json_str = response_text[start:end]
                return json.loads(json_str)
            else:
                return {"error": "No JSON found", "raw": response_text}
        except json.JSONDecodeError:
             return {"error": "Invalid JSON", "raw": response_text}

llm_client = LLMClient()
