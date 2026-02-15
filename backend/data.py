import pandas as pd
import numpy as np
import os

# Global variable to store the dataframe
df = None

def load_data(csv_path):
    global df
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at {csv_path}")
    
    df = pd.read_csv(csv_path)
    
    # Data Cleaning and Preprocessing
    # 1. Duration to Minutes
    def duration_to_minutes(d):
        try:
            parts = list(map(int, d.split(":")))
            if len(parts) == 3:
                days, hours, minutes = parts
                return days*24*60 + hours*60 + minutes
            elif len(parts) == 2: # sometimes might be HH:MM
                hours, minutes = parts
                return hours*60 + minutes
            return None
        except:
            return None

    df["Duration_Minutes"] = df["Duration"].apply(duration_to_minutes)
    df.dropna(subset=["Duration_Minutes"], inplace=True)

    # 2. Time Features
    # The dataset has "Departure" as "09:30:00 PM"
    df["Departure_Time"] = pd.to_datetime(df["Departure"], format="%I:%M:%S %p", errors='coerce')
    df["Arrival_Time"] = pd.to_datetime(df["Arrival"], format="%I:%M:%S %p", errors='coerce')
    
    df["Departure_Hour"] = df["Departure_Time"].dt.hour
    df["Arrival_Hour"] = df["Arrival_Time"].dt.hour
    
    # Fill missing values if any (simple strategy for now)
    df["Departure_Hour"] = df["Departure_Hour"].fillna(0).astype(int)

    return df

def get_unique_cities():
    if df is None:
        return []
    # Combine From and To, get unique, sort
    cities = pd.concat([df['From'], df['To']]).unique()
    return sorted(cities.tolist())

def get_routes(from_city, to_city):
    if df is None:
        return []
    
    mask = (df['From'].str.lower() == from_city.lower()) & (df['To'].str.lower() == to_city.lower())
    results = df[mask].copy()
    
    # Convert to list of dicts
    routes = []
    for _, row in results.iterrows():
        routes.append({
            "operator": row["Operator"],
            "bus_type": row["Bus Type"],
            "departure": row["Departure"],
            "arrival": row["Arrival"],
            "duration": row["Duration"],
            "distance": row["Distance"],
            "price": np.random.randint(500, 2500) # Mock price as it's not in dataset
        })
    return routes

def get_stats():
    if df is None:
        return {}
    
    # 1. Top 10 Operators
    top_operators = df['Operator'].value_counts().head(10).to_dict()
    
    # 2. Bus Type Distribution (Top 5 for cleaner chart)
    bus_types = df['Bus Type'].value_counts().head(5).to_dict()
    
    # 3. Speed Analysis (Proxy for Performance)
    # Avoid division by zero
    temp_df = df[df['Duration_Minutes'] > 0].copy()
    temp_df['Speed_Kmph'] = temp_df['Distance'] / (temp_df['Duration_Minutes'] / 60)
    
    # Classify performance
    def classify_speed(s):
        if s > 60: return "Fast (>60km/h)"
        elif s >= 40: return "Moderate (40-60km/h)"
        else: return "Slow (<40km/h)"
        
    speed_dist = temp_df['Speed_Kmph'].apply(classify_speed).value_counts().to_dict()

    # 4. Distance Category Analysis
    def classify_distance(d):
        if d < 200: return "Short (<200km)"
        elif d <= 600: return "Medium (200-600km)"
        else: return "Long (>600km)"
    
    temp_df['Distance_Category'] = temp_df['Distance'].apply(classify_distance)
    
    # Get dominant operator per category
    distance_dominance = {}
    for cat in ["Short (<200km)", "Medium (200-600km)", "Long (>600km)"]:
        cat_df = temp_df[temp_df['Distance_Category'] == cat]
        if not cat_df.empty:
            top_op = cat_df['Operator'].value_counts().idxmax()
            count = int(cat_df['Operator'].value_counts().max())
            distance_dominance[cat] = {"operator": top_op, "count": count}
        if not cat_df.empty:
            top_op = cat_df['Operator'].value_counts().idxmax()
            count = int(cat_df['Operator'].value_counts().max())
            distance_dominance[cat] = {"operator": top_op, "count": count}
        else:
             distance_dominance[cat] = {"operator": "N/A", "count": 0}

    # 5. Connectivity Analysis (Transport Hubs)
    connectivity = df.groupby("From")["To"].nunique().sort_values(ascending=False).head(10).to_dict()

    return {
        "top_operators": top_operators,
        "bus_types": bus_types,
        "performance": speed_dist,
        "distance_analysis": distance_dominance,
        "connectivity": connectivity
    }

def get_route_analytics(from_city, to_city):
    if df is None:
        return {}
    
    mask = (df['From'].str.lower() == from_city.lower()) & (df['To'].str.lower() == to_city.lower())
    route_df = df[mask].copy()
    
    if route_df.empty:
        return {}
    
    # 1. Operator Ranking (Best = Lowest Duration + Highest Consistency)
    operator_stats = route_df.groupby('Operator')['Duration_Minutes'].agg(['mean', 'std', 'count'])
    # Handle single trips where std is NaN
    operator_stats['std'] = operator_stats['std'].fillna(0)
    
    # Simple score: Lower mean is better, Lower std is better.
    # We can rank by Mean Duration for now.
    operator_stats = operator_stats.sort_values('mean')
    
    best_operators = []
    for op, row in operator_stats.head(5).iterrows():
        best_operators.append({
            "name": op,
            "avg_duration": round(row['mean'], 1),
            "reliability_score": round(100 - (row['std'] / row['mean'] * 100), 1) if row['mean'] > 0 else 100
        })

    # 2. Market Share
    market_share = route_df['Operator'].value_counts(normalize=True).head(5).to_dict()
    
    # 3. Time Patterns (Departure Hour Distribution)
    time_patterns = route_df['Departure_Hour'].value_counts().sort_index().to_dict()
    

    # Calculate overall stats safely
    mean_val = route_df['Duration_Minutes'].mean()
    std_val = route_df['Duration_Minutes'].std()
    
    # Handle NaN std (single trip)
    if pd.isna(std_val):
        std_val = 0
        
    # Calculate Delay Risk
    delay_risk = "Low"
    if std_val > 60:
        delay_risk = "High"
    elif std_val > 30:
        delay_risk = "Medium"
        
    # Calculate Reliability Score
    reliability_score = 100.0
    if mean_val > 0:
        reliability_score = round(100 - (std_val / mean_val * 100), 1)
    
    return {
        "best_operators": best_operators,
        "market_share": market_share,
        "time_patterns": time_patterns,
        "total_trips": int(route_df.shape[0]),
        "avg_duration": round(mean_val, 1) if not pd.isna(mean_val) else 0,
        "delay_risk": delay_risk,
        "reliability_score": reliability_score
    }

def get_global_kpis():
    if df is None: return {}
    
    total_routes = int(df.shape[0])
    avg_duration = round(df['Duration_Minutes'].mean(), 1)
    
    # Simulate "On Time"
    df['Speed_Kmph'] = df['Distance'] / (df['Duration_Minutes'] / 60)
    on_time_rate = round((df[df['Speed_Kmph'] >= 40].shape[0] / total_routes) * 100, 1)
    
    # Delay Distribution (Histogram data)
    # Binning duration into buckets
    duration_bins = [0, 120, 240, 360, 480, 600, 720, 1000]
    labels = ['0-2h', '2-4h', '4-6h', '6-8h', '8-10h', '10-12h', '12h+']
    df['Duration_Bin'] = pd.cut(df['Duration_Minutes'], bins=duration_bins, labels=labels)
    duration_dist = df['Duration_Bin'].value_counts().sort_index().to_dict()
    
    # Most Reliable Operator
    op_stats = df.groupby('Operator')['Duration_Minutes'].std().sort_values().head(1)
    most_reliable = op_stats.index[0] if not op_stats.empty else "N/A"

    # Most Delay Prone Route
    route_delays = df.groupby(['From', 'To'])['Duration_Minutes'].std().sort_values(ascending=False).head(1)
    most_delay_prone = f"{route_delays.index[0][0]} - {route_delays.index[0][1]}" if not route_delays.empty else "N/A"

    return {
        "total_routes": total_routes,
        "avg_duration_mins": avg_duration,
        "avg_delay_prob": round(100 - on_time_rate, 1),
        "active_operators": int(df['Operator'].nunique()),
        "cities_covered": int(pd.concat([df['From'], df['To']]).nunique()),
        "duration_distribution": duration_dist,
        "most_reliable_operator": most_reliable,
        "most_delay_prone_route": most_delay_prone
    }

def get_operator_analytics():
    if df is None: return {}
    
    # Operator Performance
    op_stats = df.groupby('Operator').agg({
        'Duration_Minutes': ['mean', 'std', 'count'],
        'Distance': 'mean'
    })
    op_stats.columns = ['avg_duration', 'duration_std', 'trip_count', 'avg_distance']
    
    # Filter for active operators
    active_ops = op_stats[op_stats['trip_count'] > 10].copy()
    
    # Reliability Score (100 - CV)
    active_ops['cv'] = active_ops['duration_std'] / active_ops['avg_duration']
    active_ops['reliability_score'] = (1 - active_ops['cv']).clip(0, 1) * 100
    
    # Speed Consistency (Inverse of Variance normalized)
    active_ops['speed_consistency'] = (100 - (active_ops['duration_std'] / 10)).clip(0, 100)
    
    top_reliable = active_ops.sort_values('reliability_score', ascending=False).head(10)
    
    results = []
    for op, row in top_reliable.iterrows():
        results.append({
            "name": op,
            "reliability": round(row['reliability_score'], 1),
            "consistency": round(row['speed_consistency'], 1),
            "trips": int(row['trip_count']),
            "avg_time": round(row['avg_duration'], 0),
            "duration_variance": round(row['duration_std'], 1)
        })
        
    return {"top_reliable": results}

def get_route_aggregated_stats():
    if df is None: return {}
    
    # Route Stats
    route_stats = df.groupby(['From', 'To']).agg({
        'Duration_Minutes': ['count', 'mean', 'std'],
        'Distance': 'mean'
    }).reset_index()
    route_stats.columns = ['From', 'To', 'count', 'avg_duration', 'std_duration', 'distance']
    
    # Efficiency (Speed)
    route_stats['efficiency_kmph'] = route_stats['distance'] / (route_stats['avg_duration'] / 60)
    
    # Stability (100 - CV)
    route_stats['stability_score'] = (1 - (route_stats['std_duration'] / route_stats['avg_duration'])).clip(0, 1) * 100
    
    # Most Popular
    top_popular = route_stats.sort_values('count', ascending=False).head(5)
    
    popular = []
    for _, row in top_popular.iterrows():
        popular.append({
            "route": f"{row['From']} - {row['To']}",
            "count": int(row['count']),
            "avg_duration": round(row['avg_duration'], 0),
            "efficiency": round(row['efficiency_kmph'], 1),
            "stability": round(row['stability_score'], 1)
        })
        
    return {"popular_routes": popular}

def get_network_stats():
    if df is None: return {}
    
    # Hub Analysis (Degree Centrality)
    from_counts = df['From'].value_counts()
    to_counts = df['To'].value_counts()
    
    total_conns = from_counts.add(to_counts, fill_value=0).sort_values(ascending=False).head(10)
    
    hubs = []
    for city, count in total_conns.items():
        hubs.append({"city": city, "connections": int(count)})
        
    return {"hubs": hubs}
