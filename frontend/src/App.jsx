import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Prediction from './pages/Prediction';
import OperatorAnalytics from './pages/OperatorAnalytics';
import RouteAnalytics from './pages/RouteAnalytics';
import CityConnectivity from './pages/CityConnectivity';
import ModelPerformance from './pages/ModelPerformance';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col">
                <Navbar />
                <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/predict" element={<Prediction />} />
                        <Route path="/operators" element={<OperatorAnalytics />} />
                        <Route path="/routes" element={<RouteAnalytics />} />
                        <Route path="/network" element={<CityConnectivity />} />
                        <Route path="/model" element={<ModelPerformance />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
