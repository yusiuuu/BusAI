# 🚌 AI-Powered Transport Intelligence Platform

A full-stack, production-grade transport analytics system built using Machine Learning, Graph Algorithms, and Microservice Architecture.

---

## 🎯 Problem Statement

Travelers often lack reliable insights when booking intercity bus routes. There is no clear way to:

- Predict travel time
- Estimate delay risk
- Compare operators
- Suggest connected routes when direct routes are unavailable

This project transforms raw bus route data into an intelligent decision-support system.

---

## 📂 Dataset Overview

The dataset contains ~35,000 intercity bus trips across India with:

- From City
- To City
- Operator
- Distance
- Duration
- Bus Type
- Departure & Arrival Time

---

## 🧹 Data Processing

- Converted duration into total minutes
- Extracted departure & arrival hours
- Computed average speed (km/h)
- Created Delay Risk classification label
- Removed inconsistencies and outliers

---

## 📊 Exploratory Data Analysis

Key insights:

- Strong correlation between distance and duration (≈ 0.9)
- Most routes fall between 200–600 km
- Evening departures dominate
- Speed averages between 40–50 km/h

---

## 🤖 Machine Learning Models

### Regression (Travel Time Prediction)

Target: `Duration_Minutes`

Models Tested:
- Linear Regression
- Ridge / Lasso
- Random Forest
- Gradient Boosting

Best Model:
- Random Forest
- R² ≈ 0.91
- MAE ≈ 40 minutes

---

### Classification (Delay Risk)

Models Tested:
- Logistic Regression
- KNN
- Decision Tree
- Random Forest
- SVM
- Neural Network (ANN)

Balanced evaluation using precision, recall, and F1-score.

---

## 🗺 Connected Route Recommendation Engine

- Cities modeled as graph nodes
- Routes modeled as directed edges
- Dijkstra’s algorithm used for shortest path discovery
- Supports alternative route suggestions
- Aggregates duration, distance, and delay risk

---

## 🧠 AI Explanation Layer

Gemini API generates natural language explanations for recommended routes based on deterministic graph output.

LLM is used strictly for explanation, not decision-making.

---

## 🏗 System Architecture

Next.js (Frontend)  
NestJS (Business Backend)  
FastAPI (ML Microservice)  
PostgreSQL + Redis  
Google Maps Integration  

---

## 🚀 Key Features

- Travel time prediction
- Delay risk classification
- Operator reliability ranking
- Connected route recommendation
- Google Map visualization
- AI-powered route explanation
- Business analytics dashboard

---

## 📈 Model Performance

Regression:
- R² ≈ 0.91

Classification:
- Evaluated using precision/recall/F1

---

## 🛠 Tech Stack

Frontend: Next.js, TypeScript, Tailwind  
Backend: NestJS, Prisma, PostgreSQL  
ML Service: FastAPI, Scikit-learn  
AI: Google Gemini  
Infrastructure: Docker

---

## 👨‍💻 Author

Mohammed Yusuf  
