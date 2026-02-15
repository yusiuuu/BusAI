# 🚌 Pan India Bus Routes — Data Analysis & Machine Learning

## 📌 Project Overview

This project explores a large dataset of intercity bus routes across India to understand travel patterns and build machine learning models for transport analytics. The focus is on uncovering operational insights and developing predictive systems for classification tasks such as delay detection and bus service categorization.

The work follows a complete data science pipeline — from data analysis and feature engineering to visualization, traditional machine learning, and neural network modeling.

---

## 📂 Dataset Description

The dataset contains **35,667 bus trips**, where each row represents one journey between two cities.

| Feature | Description |
|---------|-------------|
| **From** | Source city |
| **To** | Destination city |
| **Operator** | Bus service provider |
| **Distance** | Route distance (in km) |
| **Duration** | Travel time (Days:Hours:Minutes format) |
| **Bus Type** | Bus configuration and amenities |
| **Departure** | Departure time |
| **Arrival** | Arrival time |

---

## 🎯 Project Objectives

- Perform detailed **data analysis** and identify potential data quality issues  
- Conduct **missing value analysis** and define suitable imputation strategies  
- Explore trends and patterns through **EDA and visualization**  
- Apply **conventional machine learning classification models**  
- Implement **neural network–based classification**  
- Lay the groundwork for future **travel time prediction** and **route optimization systems**

---

## 🧹 Data Preprocessing & Feature Engineering

Key transformations carried out:

- Converted travel duration into **total minutes**
- Extracted **departure and arrival hours** from timestamps
- Computed **average trip speed (km/h)**
- Created meaningful classification labels, including:
  - **Time of Day Category**
  - **Bus Comfort Category**
  - **Delay Risk (On-Time vs Delayed)**

---

## 📊 Exploratory Data Analysis (EDA)

EDA helped uncover several insights about intercity bus travel:

- Most routes fall in the **200–600 km** range, indicating medium-distance travel dominates
- A large number of trips depart in the **evening and night**, reflecting overnight travel patterns
- Average bus speeds are typically **40–50 km/h**
- A strong relationship exists between **distance and travel duration**
- A few extreme speed values suggest the presence of **outliers or data inconsistencies**

---

## 🤖 Machine Learning Models

### 🔹 Conventional Classification Models

Used for tasks such as time-of-day prediction, bus category classification, and delay risk detection:

- Logistic Regression  
- K-Nearest Neighbors (KNN)  
- Decision Tree  
- Random Forest  
- Support Vector Machine (SVM)  

### 🔹 Neural Network Classification

A feedforward **Artificial Neural Network (ANN)** built with TensorFlow/Keras was used to classify **delay risk**. The model demonstrated competitive performance compared to traditional ML approaches.

---

## 📈 Key Findings

- Ensemble methods like **Random Forest** generally delivered the best performance among conventional models  
- Neural networks performed well but did not significantly outperform traditional ML for this structured dataset  
- The dataset shows strong potential for advanced applications such as **travel time prediction** and **transport optimization**

---

## 🚀 Future Scope

This project can be extended into more advanced transport intelligence solutions:

- ⏱ **Travel Time Prediction** using regression models  
- 🗺 **Route Optimization** with graph algorithms  
- ⭐ **Operator Reliability Scoring** based on performance metrics  

---

## 🛠 Tech Stack

- Python  
- Pandas, NumPy  
- Matplotlib, Seaborn  
- Scikit-learn  
- TensorFlow / Keras  

---

## 📎 How to Run the Project

1. Clone this repository  
2. Open the notebook in **Google Colab** or **Jupyter Notebook**  
3. Upload the dataset file `Pan-India_Bus_Routes.csv`  
4. Run the cells sequentially  

---

## 👨‍💻 Author

**Yusuf**  

