import networkx as nx
import pandas as pd
import numpy as np

class RouteService:
    def __init__(self, df: pd.DataFrame):
        self.df = df
        self.graph = self._build_graph()

    def _build_graph(self):
        """Builds a directed graph from the dataframe."""
        G = nx.DiGraph()
        
        if self.df is None or self.df.empty:
            return G

        # Create edges with attributes
        for _, row in self.df.iterrows():
            # Filter out invalid durations
            try:
                if pd.isna(row['Duration_Minutes']) or row['Duration_Minutes'] <= 0:
                    continue
                
                u, v = row['From'], row['To']
                duration = row['Duration_Minutes']
                
                service_info = {
                    "operator": row['Operator'],
                    "departure": row['Departure'],
                    "arrival": row['Arrival'],
                    "duration": row['Duration'],
                    "price": float(np.random.randint(500, 2500)), # Mock price
                    "type": row['Bus Type'],
                    "duration_mins": duration,
                    "distance": row['Distance']
                }

                if G.has_edge(u, v):
                    # Keep the minimum weight for shortest path calculation
                    if duration < G[u][v]['weight']:
                        G[u][v]['weight'] = duration
                    
                    # Store all services
                    if 'services' not in G[u][v]:
                        G[u][v]['services'] = []
                    G[u][v]['services'].append(service_info)
                else:
                    G.add_edge(u, v, weight=duration, services=[service_info])
            except Exception as e:
                continue
                
        return G

    def get_routes(self, from_city, to_city):
        """
        Returns a list of routes (direct or connected).
        Format:
        {
            "type": "direct" | "connected",
            "routes": [
                {
                    "path": ["City A", "City B"],
                    "total_duration": 120,
                    "segments": [...],
                    "total_price": 1200
                }
            ]
        }
        """
        if not self.graph.has_node(from_city) or not self.graph.has_node(to_city):
            return {"type": "none", "routes": []}

        # 1. Check for Direct Edge
        if self.graph.has_edge(from_city, to_city):
            edge_data = self.graph[from_city][to_city]
            # Return all direct services
            direct_routes = []
            services = edge_data.get('services', [])
            
            # Sort services by duration
            services.sort(key=lambda x: x['duration_mins'])
            
            for service in services[:10]: # Return top 10 direct
                direct_routes.append({
                    "path": [from_city, to_city],
                    "total_duration_minutes": service['duration_mins'],
                    "formatted_duration": f"{int(service['duration_mins'] // 60)}h {int(service['duration_mins'] % 60)}m",
                    "segments": [{
                        "from": from_city,
                        "to": to_city,
                        **service
                    }],
                    "total_price": service['price'],
                    "distance": service['distance'],
                    "operators": [service['operator']],
                    "risk": "Low" # Direct is usually lower risk
                })
            
            return {"type": "direct", "routes": direct_routes}

        # 2. Find Connected Routes (Shortest Paths)
        try:
            # Find k shortest paths by weight (duration)
            # This generates simple paths. Limit to top 5 to avoid long computation.
            paths_gen = nx.shortest_simple_paths(self.graph, from_city, to_city, weight='weight')
            
            valid_connected_routes = []
            
            # Iterate through generator to get top 3 paths
            count = 0
            for path in paths_gen:
                if len(path) < 2: continue
                if count >= 3: break
                
                # Reconstruct full route details
                segments = []
                total_minutes = 0
                total_price = 0
                total_distance = 0
                operators = set()
                
                # For each segment in the path (e.g. A->B->C)
                for i in range(len(path) - 1):
                    u, v = path[i], path[i+1]
                    edge = self.graph[u][v]
                    
                    # We need to pick ONE service per segment to show a concrete itinerary.
                    # Strategy: Pick the fastest service for that segment.
                    best_service = min(edge['services'], key=lambda x: x['duration_mins'])
                    
                    segments.append({
                        "from": u,
                        "to": v,
                        **best_service
                    })
                    
                    total_minutes += best_service['duration_mins']
                    total_price += best_service['price']
                    total_distance += best_service['distance']
                    operators.add(best_service['operator'])
                
                valid_connected_routes.append({
                    "path": path,
                    "total_duration_minutes": total_minutes,
                    "formatted_duration": f"{int(total_minutes // 60)}h {int(total_minutes % 60)}m",
                    "segments": segments,
                    "total_price": total_price,
                    "distance": total_distance,
                    "operators": list(operators),
                    "risk": "Medium" if len(path) == 3 else "High" # More stops = higher risk
                })
                count += 1
                
            return {"type": "connected", "routes": valid_connected_routes}

        except nx.NetworkXNoPath:
            return {"type": "none", "routes": []}
        except Exception as e:
            print(f"Error finding path: {e}")
            return {"type": "error", "routes": []}
