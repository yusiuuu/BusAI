# 🚌 AI-Powered Transport Intelligence Platform

An enterprise-grade, full-stack transport analytics system built using Machine Learning, Graph Algorithms, and Microservice Architecture.

This platform predicts travel time, estimates delay risk, recommends optimal connected routes, ranks bus operators by reliability, and provides business-level transport insights with interactive dashboards and Google Maps visualization.

---

## 🚀 Project Overview

This system transforms raw intercity bus route data into a scalable AI-powered analytics platform.

It includes:

- Travel Time Prediction (Regression – Random Forest, R² ≈ 0.91)
- Delay Risk Classification
- Operator Reliability Scoring
- Connected Route Recommendation Engine (Graph-based)
- Natural Language Route Explanation using Gemini
- Interactive Dashboard (Next.js)
- Microservice-based Backend Architecture

---

## 🏗 Architecture
---
Next.js (Frontend - TypeScript)
|
NestJS Backend (Business API Layer)
|
FastAPI ML Microservice (Prediction Engine)
|
PostgreSQL + Redis
---


### Services:

- **Frontend** → User Interface & Visualization
- **NestJS Backend** → Business logic, routing engine, caching, persistence
- **ML Microservice** → Loads trained models and handles predictions
- **Gemini API** → Natural language explanation layer

---

## 🧠 Core Features

### 1️⃣ Travel Time Prediction
- Predicts trip duration using Random Forest Regression
- Provides confidence interval (± MAE)
- Compares ML ETA vs Google ETA
- Returns risk category

---

### 2️⃣ Delay Risk Classification
- Binary classification: Delayed / On-Time
- Probability-based prediction
- Risk indicator badges

---

### 3️⃣ Operator Reliability Scoring
Calculates reliability using:
- Delay percentage
- Speed consistency
- Duration variance

Outputs ranked operator leaderboard.

---

### 4️⃣ Connected Route Recommendation Engine

If no direct route exists between two cities:

- Builds directed graph from dataset
- Uses Dijkstra's Algorithm to compute shortest duration path
- Returns top alternative routes
- Aggregates:
  - Total duration
  - Total distance
  - Delay risk
  - Operators involved

---

### 5️⃣ Gemini Natural Language Explanation

After deterministic route computation:

Gemini generates:
- Why this route is recommended
- Risk insights
- Travel summary

LLM is used strictly for explanation — not path computation.

---

### 6️⃣ Business Analytics Dashboard

Includes:

- KPI Cards
- Delay Distribution
- Operator Rankings
- Route Popularity
- Duration vs Distance trends
- Correlation Heatmaps
- Model Performance Metrics

---

## 📊 Machine Learning Models

### Regression
- Linear Regression
- Ridge / Lasso
- Random Forest (Best – R² ≈ 0.91)
- Gradient Boosting

### Classification
- Logistic Regression
- KNN
- Decision Tree
- Random Forest
- SVM
- Neural Network (ANN)

---

## 🗺 Route Engine (Graph Logic)

- Nodes → Cities
- Edges → Available routes
- Weight → Duration_Minutes
- Algorithm → Dijkstra (Shortest Path)
- Alternative path suggestions supported

---

## 🛠 Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui
- Recharts
- Google Maps API

### Backend
- NestJS
- Prisma ORM
- PostgreSQL
- Redis
- Winston Logging

### ML Service
- FastAPI
- Scikit-learn
- Joblib
- Pydantic

### AI Explanation Layer
- Google Gemini API

### DevOps
- Docker
- Docker Compose
- Environment Configurations
- Versioned APIs

---

## 📦 Folder Structure
frontend/
backend/
ml-service/
docker-compose.yml


---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone <repo-url>


