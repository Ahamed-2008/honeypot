import os
import json
from typing import Optional, Dict, Any
import google.generativeai as genai

class LLMClient:
    def __init__(self):
        self.api_key = "AIzaSyC8zWDZWNEaZ_7dy8i9hJ8znRPEWA4g8iQ"
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-flash-latest')

    async def check_connection(self) -> bool:
        """
        Checks if the Gemini API is reachable.
        """
        try:
            # Simple generation to check connection
            response = self.model.generate_content("Hello")
            return True if response.text else False
        except Exception as e:
            print(f"Gemini Connection Check Failed: {e}")
            return False

    async def generate_text(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """
        Generates text using Gemini API.
        """
        try:
            full_prompt = prompt
            if system_prompt:
                full_prompt = f"System: {system_prompt}\n\nUser: {prompt}"
            
            response = self.model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            print(f"Error calling Gemini: {e}")
            return f"Error generating response: {str(e)}"

    async def generate_json(self, prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        """
        Generates JSON output.
        """
        json_prompt = f"{prompt}\n\nIMPORTANT: Respond ONLY with valid JSON. Do not include markdown formatting like ```json ... ```."
        response_text = await self.generate_text(json_prompt, system_prompt)
        
        # Basic cleanup to find JSON blob
        try:
            # Remove markdown code blocks if present
            cleaned_text = response_text.replace("```json", "").replace("```", "").strip()
            
            # Try to find { and }
            start = cleaned_text.find("{")
            end = cleaned_text.rfind("}") + 1
            if start != -1 and end != -1:
                json_str = cleaned_text[start:end]
                return json.loads(json_str)
            else:
                return {"error": "No JSON found", "raw": response_text}
        except json.JSONDecodeError:
             return {"error": "Invalid JSON", "raw": response_text}

llm_client = LLMClient()
