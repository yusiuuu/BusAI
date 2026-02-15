import requests
import json

try:
    response = requests.get("http://localhost:8002/stats")
    if response.status_code == 200:
        data = response.json()
        if "connectivity" in data:
            print("Connectivity Data Found!")
            print(json.dumps(data["connectivity"], indent=2))
        else:
            print("Connectivity Data MISSING!")
            print("Keys found:", list(data.keys()))
    else:
        print(f"Error: Status Code {response.status_code}")
except Exception as e:
    print("Error:", e)
