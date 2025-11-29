import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';

function App() {
    const [status, setStatus] = useState('Loading...');

    useEffect(() => {
        // Check backend status
        fetch('/api/status')
            .then(res => res.json())
            .then(data => setStatus(data.status))
            .catch(err => setStatus('Backend Offline'));
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-cyan-400">Smart Solar Monitor</h1>
                    <p className="text-slate-400">Building A - Main Array</p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-slate-500">System Status</div>
                    <div className={`font-mono ${status === 'System Operational' ? 'text-green-400' : 'text-red-400'}`}>
                        {status}
                    </div>
                </div>
            </header>

            <main>
                <Dashboard />
            </main>
        </div>
    );
}

export default App;
