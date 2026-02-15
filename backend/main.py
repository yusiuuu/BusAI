from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import data
import model
from services.route_service import RouteService
from services.gemini_service import GeminiService
from typing import List, Optional, Dict, Any

app = FastAPI(title="Bus Route Prediction API")

# Global Services
route_service = None
gemini_service = None

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup Event
@app.on_event("startup")
def startup_event():
    global route_service, gemini_service
    
    csv_path = "../Pan-India_Bus_Routes (1).csv"
    if not os.path.exists(csv_path):
        # Fallback for manual run location
        csv_path = "Pan-India_Bus_Routes (1).csv"
    
    try:
        df = data.load_data(csv_path)
        model.train_model(df)
        
        # Initialize Route Service
        route_service = RouteService(df)
        print("Route Service Initialized")
        
        # Initialize Gemini Service
        # Use provided key or env var
        api_key = os.getenv("GEMINI_API_KEY", "AIzaSyClBEhkxmOXw8qiFxeY2Wd44wFsm1rj0hI")
        gemini_service = GeminiService(api_key)
        print("Gemini Service Initialized")
        
    except Exception as e:
        print(f"Error starting up: {e}")

# Schemas
class RouteRequest(BaseModel):
    from_city: str
    to_city: str

class PredictionRequest(BaseModel):
    distance: float
    departure_hour: int
    bus_type: str

@app.get("/")
def read_root():
    return {"message": "Bus Route API is running"}

@app.get("/cities")
def get_cities():
    return {"cities": data.get_unique_cities()}

@app.post("/routes")
def search_routes(request: RouteRequest):
    routes = data.get_routes(request.from_city, request.to_city)
    return {"routes": routes}

@app.post("/v1/route-recommendation")
def recommend_routes(request: RouteRequest):
    if not route_service:
        raise HTTPException(status_code=503, detail="Route Service not initialized")
        
    # 1. Get Determinstic Routes
    route_result = route_service.get_routes(request.from_city, request.to_city)
    
    # 2. Add Gemini Explanation for the best route
    explanation = {}
    if route_result['routes'] and gemini_service:
        # We only explain the top recommended route
        best_route = route_result['routes'][0]
        # Construct a simplified object for Gemini to analyze to save tokens
        route_for_ai = {
            "origin": request.from_city,
            "destination": request.to_city,
            "type": route_result['type'],
            "total_duration": best_route['formatted_duration'],
            "total_price": best_route['total_price'],
            "segments": [
                {
                    "from": s['from'] if 'from' in s else request.from_city,
                    "to": s['to'] if 'to' in s else request.to_city,
                    "operator": s['operator'],
                    "duration": s['duration']
                } for s in best_route['segments']
            ]
        }
        explanation = gemini_service.generate_explanation(route_for_ai)
        
    return {
        **route_result,
        "explanation": explanation
    }

@app.post("/predict")
def predict_time(request: PredictionRequest):
    prediction = model.predict_duration(request.distance, request.departure_hour, request.bus_type)
    if prediction is None:
        raise HTTPException(status_code=503, detail="Model not trained yet")
    
    hours = int(prediction // 60)
    minutes = int(prediction % 60)
    
    return {
        "predicted_minutes": prediction,
        "formatted_duration": f"{hours}h {minutes}m"
    }

@app.get("/stats")
def get_stats():
    return data.get_stats()

@app.get("/model-insights")
def get_insights():
    return model.get_model_insights()

@app.post("/route-analytics")
def get_route_analytics(request: RouteRequest):
    analytics = data.get_route_analytics(request.from_city, request.to_city)
    return analytics

@app.get("/global-stats")
def get_global_kpis():
    return data.get_global_kpis()

@app.get("/operator-analytics")
def get_operator_analytics():
    return data.get_operator_analytics()

@app.get("/route-aggregated")
def get_route_aggregated():
    return data.get_route_aggregated_stats()

@app.get("/network-stats")
def get_network_stats():
    return data.get_network_stats()

@app.get("/model-performance")
def get_model_performance():
    return model.get_model_performance()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
