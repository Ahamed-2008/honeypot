import asyncio
import sys
import os

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from aiengine.utils.llm import llm_client

async def main():
    print(f"Checking connection to LLM at {llm_client.base_url}...")
    connected = await llm_client.check_connection()
    
    if connected:
        print("✅ Connection Successful!")
        print(f"Attempting to generate text with model '{llm_client.model}'...")
        try:
            response = await llm_client.generate_text("Hello, are you working?")
            print(f"✅ Response received:\n{response}")
        except Exception as e:
            print(f"❌ Failed to generate text: {e}")
    else:
        print("❌ Connection Failed. Is Ollama running?")
        print("Try running: ollama serve")

if __name__ == "__main__":
    asyncio.run(main())
