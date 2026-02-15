import google.generativeai as genai
import os
import json

class GeminiService:
    def __init__(self, api_key: str):
        if not api_key:
            print("Warning: GEMINI_API_KEY is not set.")
            self.model = None
            return
            
        genai.configure(api_key=api_key)
        self.models_to_try = [
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-1.0-pro',
            'gemini-pro'
        ]
        self.model = None

    def generate_explanation(self, route_data: dict):
        """
        Generates a natural language explanation for the recommended route.
        """
        prompt = self._construct_prompt(route_data)
        
        for model_name in self.models_to_try:
            try:
                # Configure model on the fly to try different ones
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                
                # Try to parse JSON from response if possible, or just return text
                text = response.text
                 # Clean up potential markdown formatting
                text = text.replace("```json", "").replace("```", "").strip()
                return json.loads(text)
                
            except Exception as e:
                print(f"Gemini generation error with {model_name}: {e}")
                continue # Try next model
        
        # If all API calls failed, use deterministic fallback
        print("Gemini API failed. Using deterministic fallback.")
        return self._generate_fallback_explanation(route_data)

    def _generate_fallback_explanation(self, route_data):
        """
        Generates a rule-based explanation when AI is unavailable.
        """
        origin = route_data.get('origin', 'Origin')
        destination = route_data.get('destination', 'Destination')
        total_duration = route_data.get('total_duration', 'unknown duration')
        
        # 1. Summary
        summary = f"Journey from {origin} to {destination} takes approximately {total_duration}."
        if route_data.get('type') == 'connected':
            segments = route_data.get('segments', [])
            stops = [s.get('to') for s in segments[:-1]]
            stop_str = ", ".join(stops) if stops else "changeover points"
            summary += f" This is a connected route with transfers at {stop_str}."
        else:
            summary += " This is a direct bus service."

        # 2. Recommendation Reason
        if route_data.get('type') == 'direct':
            rec = "This is a direct route, offering the most convenience and lower travel time compared to connected options."
        else:
            rec = "Although this route involves a transfer, it provides a viable connection where no direct service exists."

        # 3. Risk Analysis
        risks = []
        operators = set(s.get('operator') for s in route_data.get('segments', []))
        
        if route_data.get('type') == 'connected':
            risks.append("Multiple transfers increase the risk of delays.")
            if len(route_data.get('segments', [])) > 2:
                risks.append("Tight connection times may be risky if the first bus is delayed.")
        
        # Simple heuristic for operator risk (mock)
        if len(operators) > 1:
            risks.append("Different operators for each leg may require re-checking in luggage.")
            
        risk_analysis = " ".join(risks) if risks else "Standard travel risks apply. Allow extra time for boarding."

        # 4. Travel Tips
        tips = [
            "Carry a printed copy of your ticket.",
            "Arrive at the boarding point 15 minutes early."
        ]
        if route_data.get('type') == 'connected':
            tips.append("Ensure you have the contact details for the connecting bus operator.")

        return {
            "summary": summary,
            "recommendation_reason": rec,
            "risk_analysis": risk_analysis,
            "travel_tips": " ".join(tips)
        }

    def _construct_prompt(self, route_data):
        return f"""
        You are a smart travel assistant. Analyze the following bus route options and provide a structured explanation.
        
        Route Data:
        {json.dumps(route_data, indent=2)}

        Task:
        1. Summarize the travel plan (From -> To, changes if any).
        2. Explain why this specific route is recommended (e.g., "It's the only direct option" or "It's the fastest connection").
        3. Analyze potential risks (e.g., "Short transfer time at City B" or "High delay probability based on operator").
        4. Give 1-2 quick travel tips.

        Return ONLY a VALID JSON object with these keys:
        {{
            "summary": "...",
            "recommendation_reason": "...",
            "risk_analysis": "...",
            "travel_tips": "..."
        }}
        Do not include any other text.
        """
