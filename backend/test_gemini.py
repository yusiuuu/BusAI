import google.generativeai as genai
import os

api_key = "AIzaSyClBEhkxmOXw8qiFxeY2Wd44wFsm1rj0hI"
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

try:
    response = model.generate_content("Hello, are you working?")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
