from sklearn.model_selection import train_test_split
from sklearn.base import clone
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, ExtraTreesRegressor
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
from sklearn.neighbors import KNeighborsRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.tree import DecisionTreeRegressor
import pandas as pd
import numpy as np

model_pipeline = None

def train_model(df):
    global model_pipeline
    
    # Features and Target
    # Using 'Distance', 'Departure_Hour', and 'Bus Type' to predict 'Duration_Minutes'
    X = df[['Distance', 'Departure_Hour', 'Bus Type']]
    y = df['Duration_Minutes']
    
    # Preprocessing
    numeric_features = ['Distance', 'Departure_Hour']
    categorical_features = ['Bus Type']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ])
    
    # Pipeline
    model_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=50, random_state=42, n_jobs=-1))
    ])
    
    print("Training model...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model_pipeline.fit(X_train, y_train)
    
    # Calculate metrics for RF
    y_pred = model_pipeline.predict(X_test)
    from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
    
    global model_metrics
    rf_metrics = {
        "model": "Random Forest",
        "mae": round(mean_absolute_error(y_test, y_pred), 2),
        "rmse": round(np.sqrt(mean_squared_error(y_test, y_pred)), 2),
        "r2": round(r2_score(y_test, y_pred), 3)
    }
    
    # Quick Comparison (Mocked for speed if dataset large, or subsampled)
    # Using subsample for speed comparison
    X_sub, _, y_sub, _ = train_test_split(X, y, train_size=0.2, random_state=42) # Smaller set
    X_sub_train, X_sub_test, y_sub_train, y_sub_test = train_test_split(X_sub, y_sub, test_size=0.2, random_state=42)
    
    models = [
        ("Linear Regression", LinearRegression()),
        ("Decision Tree", DecisionTreeRegressor(max_depth=5)),
        ("Ridge Regression", Ridge()),
        ("Lasso Regression", Lasso()),
        ("Elastic Net", ElasticNet()),
        ("Gradient Boosting", GradientBoostingRegressor(n_estimators=50, random_state=42)),
        ("Extra Trees", ExtraTreesRegressor(n_estimators=50, random_state=42)),
        ("K-Neighbors", KNeighborsRegressor())
    ]
    
    comparison = [rf_metrics]
    
    for name, model in models:
        # Clone preprocessor to avoid refitting the main one on a subset
        pipe = Pipeline(steps=[('preprocessor', clone(preprocessor)), ('regressor', model)])
        pipe.fit(X_sub_train, y_sub_train)
        preds = pipe.predict(X_sub_test)
        comparison.append({
            "model": name,
            "mae": round(mean_absolute_error(y_sub_test, preds), 2),
            "rmse": round(np.sqrt(mean_squared_error(y_sub_test, preds)), 2),
            "r2": round(r2_score(y_sub_test, preds), 3)
        })
        
    model_metrics = {
        "current": rf_metrics,
        "comparison": comparison,
        "test_size": len(y_test)
    }
    print(f"Model trained. MAE: {model_metrics['current']['mae']}")

model_metrics = {}

def get_model_performance():
    return model_metrics

def predict_duration(distance, departure_hour, bus_type):
    if model_pipeline is None:
        return None
    
    input_data = pd.DataFrame({
        'Distance': [distance],
        'Departure_Hour': [departure_hour],
        'Bus Type': [bus_type]
    })
    
    prediction = model_pipeline.predict(input_data)
    return float(prediction[0])

def get_model_insights():
    if model_pipeline is None:
        return {}
    
    # Extract feature importance
    # 1. Get feature names from preprocessor
    preprocessor = model_pipeline.named_steps['preprocessor']
    
    # Numeric features
    numeric_features = ['Distance', 'Departure_Hour']
    
    # Categorical features
    ohe = preprocessor.named_transformers_['cat']
    categorical_features = list(ohe.get_feature_names_out(['Bus Type']))
    
    feature_names = numeric_features + categorical_features
    
    # 2. Get importances from regressor
    regressor = model_pipeline.named_steps['regressor']
    importances = regressor.feature_importances_
    
    # Combine
    feature_importance_dict = dict(zip(feature_names, importances))
    
    # Sort by importance
    sorted_importance = dict(sorted(feature_importance_dict.items(), key=lambda item: item[1], reverse=True))
    
    # Return top 10 only to keep visualization clean
    top_importance = dict(list(sorted_importance.items())[:10])
    
    return {
        "feature_importance": top_importance,
        "model_params": regressor.get_params()
    }
