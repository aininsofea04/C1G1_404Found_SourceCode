import numpy as np
from sklearn.ensemble import IsolationForest
import pickle
import os

class AIService:
    def __init__(self):
        self.model = IsolationForest(contamination=0.1, random_state=42)
        self.is_trained = False
        # Initial training data (mocked normal behavior)
        # Voltage: ~24V, Current: ~5A, Temp: ~35-45C
        self.X_train = np.array([
            [24.0, 5.0, 35.0],
            [24.5, 5.2, 38.0],
            [23.8, 4.8, 40.0],
            [24.2, 5.1, 42.0],
            [24.1, 5.0, 36.0],
            [23.9, 4.9, 39.0],
            [24.3, 5.3, 41.0],
            [24.0, 5.0, 37.0],
            [24.4, 5.2, 43.0],
            [23.7, 4.7, 44.0]
        ])
        self.train()

    def train(self):
        self.model.fit(self.X_train)
        self.is_trained = True

    def detect_anomaly(self, voltage, current, temperature):
        if not self.is_trained:
            return False
        
        # Reshape for prediction
        data = np.array([[voltage, current, temperature]])
        prediction = self.model.predict(data)
        
        # -1 indicates anomaly, 1 indicates normal
        return prediction[0] == -1

ai_service = AIService()
