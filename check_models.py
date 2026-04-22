import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(".env.local")
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("ERROR: GOOGLE_API_KEY not found in .env.local")
else:
    genai.configure(api_key=api_key)
    print(f"DEBUG: Using API Key starting with: {api_key[:5]}...")
    try:
        print("Available Models:")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"- {m.name}")
    except Exception as e:
        print(f"CRITICAL ERROR LISTING MODELS: {str(e)}")
