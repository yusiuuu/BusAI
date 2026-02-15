import requests
import json

def test_route_recommendation():
    url = "http://localhost:8000/v1/route-recommendation"
    payload = {
        "from_city": "Bangalore",
        "to_city": "Delhi"
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        
        data = response.json()
        print("✅ API Call Successful")
        print(f"Route Type: {data.get('type')}")
        print(f"Number of Routes: {len(data.get('routes', []))}")
        
        if 'explanation' in data:
            print("\nGemini Error Debug:")
            print(data['explanation'].get('recommendation_reason', 'No reason found'))
        else:
            print("\n⚠️ No explanation found")
            
    except Exception as e:
        print(f"❌ Test Failed: {e}")
        if 'response' in locals():
            print(response.text)

if __name__ == "__main__":
    test_route_recommendation()
