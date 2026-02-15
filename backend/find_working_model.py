import google.generativeai as genai
import os

api_key = "AIzaSyClBEhkxmOXw8qiFxeY2Wd44wFsm1rj0hI"
genai.configure(api_key=api_key)

candidates = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.0-pro",
    "gemini-pro",
    "gemini-1.5-flash-latest"
]

print("Testing models...")
for model_name in candidates:
    print(f"Testing {model_name}...")
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Hello")
        print(f"✅ SUCCESS: {model_name}")
        break
    except Exception as e:
        print(f"❌ FAILED: {model_name} - {e}")
