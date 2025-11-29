from app import db
from datetime import datetime

class Building(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100))
    panels = db.relationship('SolarPanel', backref='building', lazy=True)

class SolarPanel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    building_id = db.Column(db.Integer, db.ForeignKey('building.id'), nullable=False)
    model = db.Column(db.String(100))
    max_output = db.Column(db.Float) # kW
    installation_date = db.Column(db.Date)
    readings = db.relationship('SensorReading', backref='panel', lazy=True)
    cooling_logs = db.relationship('CoolingLog', backref='panel', lazy=True)
    forecasts = db.relationship('Forecast', backref='panel', lazy=True)

class SensorReading(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    panel_id = db.Column(db.Integer, db.ForeignKey('solar_panel.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    voltage = db.Column(db.Float)
    current = db.Column(db.Float)
    irradiance = db.Column(db.Float)
    temperature = db.Column(db.Float)
    power_output = db.Column(db.Float)
    is_anomaly = db.Column(db.Boolean, default=False)

class CoolingLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    panel_id = db.Column(db.Integer, db.ForeignKey('solar_panel.id'), nullable=False)
    start_time = db.Column(db.DateTime, default=datetime.utcnow)
    end_time = db.Column(db.DateTime)
    trigger_temp = db.Column(db.Float)
    duration_seconds = db.Column(db.Integer)

class Forecast(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    panel_id = db.Column(db.Integer, db.ForeignKey('solar_panel.id'), nullable=False)
    forecast_date = db.Column(db.DateTime)
    predicted_energy = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
