import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Bus, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '../utils';

const OperatorAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('/api/operator-analytics');
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="text-center p-20 text-slate-500">Loading Analytics...</div>;

    const chartData = data?.top_reliable || [];

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">Operator Analytics</h1>
                    <p className="text-slate-400 mt-1">Performance metrics for top service providers.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Leaderboard Table */}
                <div className="rounded-xl border border-slate-800 bg-[#111827] p-6 shadow-xl">
                    <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" /> Reliability Leaderboard
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="text-xs uppercase bg-[#1E293B] text-slate-300">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Operator</th>
                                    <th className="px-4 py-3">Reliability</th>
                                    <th className="px-4 py-3">Consistency</th>
                                    <th className="px-4 py-3">Trips</th>
                                    <th className="px-4 py-3 rounded-r-lg text-right">Avg Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {chartData.map((op, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-4 font-medium text-slate-200">{op.name}</td>
                                        <td className="px-4 py-4">
                                            <span className={cn(
                                                "px-2 py-1 rounded text-xs font-bold",
                                                op.reliability >= 90 ? "bg-emerald-500/20 text-emerald-400" :
                                                    op.reliability >= 75 ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
                                            )}>
                                                {op.reliability}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-slate-300">{op.consistency}%</td>
                                        <td className="px-4 py-4 text-slate-300">{op.trips}</td>
                                        <td className="px-4 py-4 text-right text-slate-300">{op.avg_time}m</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Reliability Radar Chart */}
                <div className="rounded-xl border border-slate-800 bg-[#111827] p-6 shadow-xl flex flex-col">
                    <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" /> Operator Reliability Profile
                    </h3>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData.slice(0, 5)}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Reliability" dataKey="reliability" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                                <Radar name="Consistency" dataKey="consistency" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                                <Legend />
                                <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px', color: '#fff' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperatorAnalytics;
