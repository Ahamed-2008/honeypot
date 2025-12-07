import os
import json
import asyncio
import time
import random
from typing import Optional, Dict, Any, Callable
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class LLMClient:
    def __init__(self):
        # Load API key from environment variable
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables. Please check your .env file.")

        # Model configuration with optional fallback
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        self.fallback_model_name = os.getenv("GEMINI_FALLBACK_MODEL", "gemini-2.0-flash-lite")
        self._used_fallback = False

        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(self.model_name)

    def _should_retry(self, e: Exception) -> bool:
        msg = str(e).lower()
        retry_markers = ["429", "quota", "rate limit", "retry in", "temporarily unavailable", "deadline exceeded", "unavailable"]
        return any(m in msg for m in retry_markers)

    def _maybe_switch_to_fallback(self, e: Exception) -> None:
        if self._used_fallback:
            return
        msg = str(e).lower()
        if ("429" in msg or "quota" in msg) and self.fallback_model_name and self.fallback_model_name != self.model_name:
            print(f"[LLM] Quota hit on {self.model_name}. Switching to fallback model {self.fallback_model_name}.")
            self.model_name = self.fallback_model_name
            self.model = genai.GenerativeModel(self.model_name)
            self._used_fallback = True

    def _call_with_retry(self, func: Callable[[], Any], max_retries: int = 3) -> Any:
        backoff = 1.0
        last_err = None
        for attempt in range(max_retries):
            try:
                return func()
            except Exception as e:  # noqa: BLE001 - SDK raises generic Exceptions
                last_err = e
                # If API key is revoked/leaked (403), do not retry
                if "403" in str(e) and ("leaked" in str(e).lower() or "revoked" in str(e).lower()):
                    break
                if self._should_retry(e):
                    # Try switching to fallback model once on quota errors
                    self._maybe_switch_to_fallback(e)
                    sleep_s = backoff + random.uniform(0, 0.5)
                    time.sleep(sleep_s)
                    backoff *= 2
                    continue
                break
        raise last_err

    async def check_connection(self) -> bool:
        """
        Checks if the Gemini API is reachable.
        """
        try:
            def _run():
                resp = self._call_with_retry(lambda: self.model.generate_content("Hello"))
                return bool(getattr(resp, "text", None))
            return await asyncio.to_thread(_run)
        except Exception as e:
            print(f"Gemini Connection Check Failed: {e}")
            return False

    async def generate_text(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """
        Generates text using Gemini API.
        """
        from google.generativeai.types import HarmCategory, HarmBlockThreshold

        def _run() -> str:
            full_prompt = prompt
            if system_prompt:
                full_prompt = f"System: {system_prompt}\n\nUser: {prompt}"

            response = self._call_with_retry(
                lambda: self.model.generate_content(
                    full_prompt,
                    safety_settings={
                        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
                    },
                )
            )

            if not getattr(response, "text", None):
                if getattr(response, "prompt_feedback", None):
                    return f"Response blocked: {response.prompt_feedback}"
                return "Response was blocked or empty"
            return response.text

        try:
            return await asyncio.to_thread(_run)
        except Exception as e:
            print(f"Error calling Gemini: {e}")
            return f"Error generating response: {str(e)}"

    async def generate_json(self, prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        """
        Generates JSON output. Uses JSON response mode when available and falls back to parsing.
        """
        from google.generativeai.types import HarmCategory, HarmBlockThreshold

        def _run() -> Dict[str, Any]:
            full_prompt = prompt
            if system_prompt:
                full_prompt = f"System: {system_prompt}\n\nUser: {prompt}"

            try:
                response = self._call_with_retry(
                    lambda: self.model.generate_content(
                        full_prompt,
                        safety_settings={
                            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
                        },
                        generation_config={
                            "response_mime_type": "application/json",
                        },
                    )
                )

                text = getattr(response, "text", None)
                if not text:
                    if getattr(response, "prompt_feedback", None):
                        return {"error": f"Response blocked: {response.prompt_feedback}"}
                    return {"error": "Response was blocked or empty"}

                try:
                    return json.loads(text)
                except json.JSONDecodeError:
                    # Fallback: try to extract a JSON object substring
                    cleaned_text = text.replace("```json", "").replace("```", "").strip()
                    start = cleaned_text.find("{")
                    end = cleaned_text.rfind("}") + 1
                    if start != -1 and end != -1:
                        return json.loads(cleaned_text[start:end])
                    return {"error": "Invalid JSON", "raw": text}
            except Exception as e:  # surfacing the error message to caller
                print(f"Error calling Gemini: {e}")
                return {"error": f"Error generating response: {str(e)}"}

        return await asyncio.to_thread(_run)

llm_client = LLMClient()
