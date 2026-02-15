import google.generativeai as genai
import os

api_key = "AIzaSyClBEhkxmOXw8qiFxeY2Wd44wFsm1rj0hI"
genai.configure(api_key=api_key)

print("Listing models with methods...")
try:
    for m in genai.list_models():
        if 'gemini' in m.name:
            print(f"{m.name}: {m.supported_generation_methods}")
except Exception as e:
    print(f"Error: {e}")
