import google.generativeai as genai
import os
import sys

# Use the key from the service
api_key = os.getenv("GEMINI_API_KEY", "AIzaSyClBEhkxmOXw8qiFxeY2Wd44wFsm1rj0hI")
genai.configure(api_key=api_key)

print(f"Python version: {sys.version}")
print(f"GenerativeAI version: {genai.__version__}")

models_to_test = ['gemini-1.5-flash', 'gemini-pro', 'gemini-1.0-pro']

for m in models_to_test:
    print(f"\n--- Testing {m} ---")
    try:
        model = genai.GenerativeModel(m)
        response = model.generate_content("Explain a bus route from Bangalore to Delhi.")
        print(f"SUCCESS. Response snippet: {response.text[:50]}...")
    except Exception as e:
        print(f"FAILED: {e}")
