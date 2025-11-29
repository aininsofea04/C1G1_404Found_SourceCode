from app import app, db
from models import Building, SolarPanel, SensorReading, CoolingLog, Forecast
from ai_service import ai_service
from flask import request, jsonify
from datetime import datetime, timedelta
import random

# --- Helper Functions ---
def calculate_power(voltage, current):
    return voltage * current

# --- Routes ---

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({"status": "System Operational", "timestamp": datetime.utcnow()})

# --- Simulation / Sensor Data Ingestion ---
@app.route('/api/readings', methods=['POST'])
def add_reading():
    data = request.json
    # Expected: { "panel_id": 1, "voltage": 24.5, "current": 5.2, "irradiance": 800, "temperature": 42 }
    
    # Calculate Power
    power = calculate_power(data['voltage'], data['current'])
    
    # Detect Anomaly
    is_anomaly = bool(ai_service.detect_anomaly(data['voltage'], data['current'], data['temperature']))

    new_reading = SensorReading(
        panel_id=data['panel_id'],
        voltage=data['voltage'],
        current=data['current'],
        irradiance=data['irradiance'],
        temperature=data['temperature'],
        power_output=power,
        is_anomaly=is_anomaly
    )
    
    db.session.add(new_reading)
    
    # --- COOLING LOGIC (Simplified for MVP) ---
    # Check if cooling is needed
    cooling_triggered = False
    if data['temperature'] > 45.0:
        cooling_triggered = True
        # In a real system, we'd check if it's already running to avoid duplicates
        # For MVP, we'll just flag it in the response
        
        # Log the event (start) - simplified
        # In a real system, we'd have a separate start/stop logic
        new_log = CoolingLog(
            panel_id=data['panel_id'],
            trigger_temp=data['temperature'],
            start_time=datetime.utcnow()
        )
        db.session.add(new_log)

    db.session.commit()
    
    return jsonify({
        "message": "Reading saved", 
        "cooling_active": cooling_triggered,
        "reading_id": new_reading.id,
        "is_anomaly": is_anomaly
    }), 201

@app.route('/api/panels/<int:panel_id>/latest', methods=['GET'])
def get_latest_reading(panel_id):
    # Use db.session.query for compatibility with Flask-SQLAlchemy 3.0+
    reading = db.session.query(SensorReading).filter_by(panel_id=panel_id).order_by(SensorReading.timestamp.desc()).first()
    if reading:
        return jsonify({
            "timestamp": reading.timestamp,
            "voltage": reading.voltage,
            "current": reading.current,
            "irradiance": reading.irradiance,
            "temperature": reading.temperature,
            "temperature": reading.temperature,
            "power_output": reading.power_output,
            "is_anomaly": reading.is_anomaly
        })
    return jsonify({"message": "No data found"}), 404

# --- Forecast Stub ---
@app.route('/api/panels/<int:panel_id>/forecast', methods=['GET'])
def get_forecast(panel_id):
    # TODO: Connect to AI Model
    # Returning mock data for now - 7 Days Forecast
    mock_forecast = []
    today = datetime.utcnow().date()
    for i in range(7):
        forecast_date = today + timedelta(days=i)
        mock_forecast.append({
            "date": forecast_date.strftime("%Y-%m-%d"),
            "predicted_energy": random.uniform(20.0, 35.0) # Mock kWh per day
        })
    return jsonify(mock_forecast)
