import google.generativeai as genai

genai.configure(api_key="AIzaSyC8zWDZWNEaZ_7dy8i9hJ8znRPEWA4g8iQ")

print("Available models:")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(f"- {m.name}")
