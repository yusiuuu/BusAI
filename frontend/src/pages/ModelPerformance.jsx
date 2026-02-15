import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Settings, CheckCircle, Database, BarChart2 } from 'lucide-react';
import { cn } from '../utils';

const MetricCard = ({ title, value, subtext, color }) => (
    <div className="rounded-xl border border-slate-800 bg-[#111827] p-6 flex flex-col items-center text-center">
        <h3 className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-2">{title}</h3>
        <div className={cn("text-3xl font-black", color)}>{value}</div>
        <div className="text-xs text-slate-500 mt-2">{subtext}</div>
    </div>
);

const ModelPerformance = () => {
    const [performance, setPerformance] = useState(null);
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [perfRes, insightsRes] = await Promise.all([
                    axios.get('/api/model-performance'),
                    axios.get('/api/model-insights')
                ]);
                setPerformance(perfRes.data);
                setInsights(insightsRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="text-center p-20 text-slate-500">Loading Model Stats...</div>;

    const featureImportanceData = insights ? Object.entries(insights.feature_importance).map(([name, value]) => ({ name, value })) : [];

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <h1 className="text-3xl font-bold text-slate-100">Model Performance</h1>
                <p className="text-slate-400 mt-1">Benchmarking Random Forest vs Other Regressors.</p>
            </div>
            <div className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded border border-blue-500/20 flex items-center gap-2">
                <Database className="w-3 h-3" />
                v1.2.0 • Sklearn
            </div>


            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    title="Mean Absolute Error"
                    value={`${performance?.current?.mae}m`}
                    subtext="Avg prediction error in minutes"
                    color="text-emerald-400"
                />
                <MetricCard
                    title="R² Score"
                    value={performance?.current?.r2}
                    subtext="Variance explained (max 1.0)"
                    color="text-blue-400"
                />
                <MetricCard
                    title="Root Mean Squared Error"
                    value={`${performance?.current?.rmse}m`}
                    subtext="Penalizes large errors"
                    color="text-purple-400"
                />
            </div>

            {/* Comparison Chart */}
            <div className="rounded-xl border border-slate-800 bg-[#111827] p-8 shadow-xl">
                <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-indigo-400" /> Algorithm Comparison
                </h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={performance?.comparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="model" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="r2" fill="#6366f1" name="R2 Score" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Feature Importance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="rounded-xl border border-slate-800 bg-[#111827] p-8 shadow-xl col-span-2">
                    <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-slate-400" /> Feature Importance
                    </h3>
                    <p className="text-sm text-slate-400 mb-6">Which factors drive the prediction most?</p>

                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={featureImportanceData} layout="vertical" margin={{ left: 80 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={150} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ color: '#fff' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ModelPerformance;
