import requests
import json

BASE_URL = "http://localhost:8000"

endpoints = [
    "/global-stats",
    "/operator-analytics",
    "/route-aggregated",
    "/network-stats",
    "/model-performance"
]

print("Testing Internal API Endpoints...")
for ep in endpoints:
    try:
        response = requests.get(f"{BASE_URL}{ep}")
        if response.status_code == 200:
            print(f"✅ {ep}: OK")
            # print(json.dumps(response.json(), indent=2)) 
        else:
            print(f"❌ {ep}: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ {ep}: Error - {e}")
