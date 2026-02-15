import requests
import json
import time

# Wait for server to start
time.sleep(2)

try:
    response = requests.get("http://localhost:8002/api/stats")
    data = response.json()
    if "connectivity" in data:
        print("Connectivity Data Found!")
        print(json.dumps(data["connectivity"], indent=2))
    else:
        print("Connectivity Data MISSING!")
        print("Keys found:", list(data.keys()))
except Exception as e:
    print("Error:", e)
