import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Zap, Thermometer, Sun, Activity, Droplets, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
    const [readings, setReadings] = useState([]);
    const [latest, setLatest] = useState(null);
    const [coolingActive, setCoolingActive] = useState(false);
    const [isAnomaly, setIsAnomaly] = useState(false);
    const [forecast, setForecast] = useState([]);

    // Simulate fetching data
    // Fetch Forecast on Mount
    useEffect(() => {
        fetch('/api/panels/1/forecast')
            .then(res => res.json())
            .then(data => setForecast(data))
            .catch(err => console.error("Forecast Error:", err));
    }, []);

    // Simulate fetching data and syncing with backend
    useEffect(() => {
        const interval = setInterval(async () => {
            const now = new Date();
            const time = now.toLocaleTimeString();

            // Simulate sensor data
            const newReading = {
                panel_id: 1,
                time: time,
                voltage: 24 + Math.random(),
                current: 5 + Math.random(),
                temp: 35 + Math.random() * 15, // Fluctuate between 35 and 50
                irradiance: 800 + Math.random() * 100
            };

            // Send to Backend to check for Anomaly
            try {
                const res = await fetch('/api/readings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        panel_id: 1,
                        voltage: newReading.voltage,
                        current: newReading.current,
                        irradiance: newReading.irradiance,
                        temperature: newReading.temp
                    })
                });
                const data = await res.json();

                // Update Anomaly State from Backend
                setIsAnomaly(data.is_anomaly);
                setCoolingActive(data.cooling_active);

            } catch (err) {
                console.error("Backend Error:", err);
            }

            setLatest(newReading);
            setReadings(prev => [...prev.slice(-19), newReading]); // Keep last 20
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    if (!latest) return <div>Initializing Sensors...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Metric Cards */}
            <MetricCard
                title="Voltage"
                value={`${latest.voltage.toFixed(1)} V`}
                icon={<Zap className="text-yellow-400" />}
            />
            <MetricCard
                title="Current"
                value={`${latest.current.toFixed(1)} A`}
                icon={<Activity className="text-blue-400" />}
            />
            <MetricCard
                title="Irradiance"
                value={`${latest.irradiance.toFixed(0)} W/m²`}
                icon={<Sun className="text-orange-400" />}
            />
            <MetricCard
                title="Temperature"
                value={`${latest.temp.toFixed(1)} °C`}
                icon={<Thermometer className={latest.temp > 45 ? "text-red-500 animate-pulse" : "text-green-400"} />}
                alert={latest.temp > 45}
            />

            {/* Anomaly Alert */}
            {isAnomaly && (
                <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-red-500/20 border border-red-500 p-4 rounded-xl flex items-center gap-4 animate-pulse">
                    <AlertTriangle className="text-red-500 w-8 h-8" />
                    <div>
                        <h3 className="text-red-400 font-bold text-lg">ANOMALY DETECTED</h3>
                        <p className="text-red-300/80 text-sm">Irregular power patterns detected by AI model. Check panel integrity immediately.</p>
                    </div>
                </div>
            )}

            {/* Cooling Status */}
            <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-200">Active Cooling System</h3>
                    <p className="text-slate-400 text-sm">Automated sprinkler activation based on thermal threshold (&gt;45°C)</p>
                </div>
                <div className={`flex items-center gap-3 px-6 py-3 rounded-full font-bold transition-all ${coolingActive ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'bg-slate-700/50 text-slate-500'}`}>
                    <Droplets className={coolingActive ? "animate-bounce" : ""} />
                    {coolingActive ? "COOLING ACTIVE" : "STANDBY"}
                </div>
            </div>

            {/* Test Controls */}
            <div className="col-span-1 md:col-span-2 lg:col-span-4 flex justify-end">
                <button
                    onClick={() => setIsAnomaly(!isAnomaly)}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded-lg text-sm transition-colors"
                >
                    {isAnomaly ? "Clear Anomaly" : "Simulate Anomaly Alert"}
                </button>
            </div>

            {/* Main Chart */}
            <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-slate-800 p-6 rounded-xl border border-slate-700 h-96">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">Real-time Efficiency</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={readings}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="time" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                            itemStyle={{ color: '#e2e8f0' }}
                        />
                        <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} name="Temp (°C)" />
                        <Line type="monotone" dataKey="voltage" stroke="#eab308" strokeWidth={2} name="Voltage (V)" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Weekly Forecast Chart */}
            <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-slate-800 p-6 rounded-xl border border-slate-700 h-96">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">Weekly Energy Forecast (AI Prediction)</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={forecast}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="date" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                            itemStyle={{ color: '#e2e8f0' }}
                        />
                        <Bar dataKey="predicted_energy" fill="#3b82f6" name="Predicted Energy (kWh)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, icon, alert }) => (
    <div className={`bg-slate-800 p-6 rounded-xl border ${alert ? 'border-red-500/50 bg-red-500/10' : 'border-slate-700'}`}>
        <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-sm">{title}</span>
            {icon}
        </div>
        <div className="text-2xl font-bold text-slate-100">{value}</div>
    </div>
);

export default Dashboard;
