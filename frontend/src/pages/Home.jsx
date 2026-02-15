import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Clock, AlertTriangle, CheckCircle, TrendingUp, Bus, MapPin, Globe, ShieldCheck, AlertOctagon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { cn } from '../utils';

const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
    <div className="rounded-xl p-6 border border-slate-800 bg-[#111827] shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className={cn("absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity", color)}>
            <Icon className="w-16 h-16" />
        </div>
        <div className="relative z-10">
            <h3 className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">{title}</h3>
            <div className="text-3xl font-bold text-slate-100 mb-2">{value}</div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
                {subtext}
            </div>
        </div>
    </div>
);

const Home = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('/api/global-stats');
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch global stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="text-center p-20 text-slate-500 animate-pulse">Loading Analytics Dashboard...</div>;
    if (!stats) return <div className="text-center p-20 text-red-400">Failed to load data. API might be down.</div>;

    const durationData = stats.duration_distribution
        ? Object.entries(stats.duration_distribution).map(([range, count]) => ({ range, count }))
        : [];

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-4xl font-bold text-slate-100 tracking-tight">Executive Dashboard</h1>
                    <p className="text-slate-400 mt-2">High-level network overview and performance KPIs.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        System Online
                    </span>
                    <span className="text-xs text-slate-500">Last updated: Just now</span>
                </div>
            </div>

            {/* KPI Grid - Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Routes"
                    value={stats.total_routes?.toLocaleString()}
                    subtext="Across Pan-India Network"
                    icon={Globe}
                    color="text-blue-500"
                />
                <StatCard
                    title="Avg Duration"
                    value={`${stats.avg_duration_mins}m`}
                    subtext="Mean travel time per trip"
                    icon={Clock}
                    color="text-purple-500"
                />
                <StatCard
                    title="Avg Delay Risk"
                    value={`${stats.avg_delay_prob}%`}
                    subtext="Predicted delay likelihood"
                    icon={AlertTriangle}
                    color="text-amber-500"
                />
                <StatCard
                    title="Active Operators"
                    value={stats.active_operators}
                    subtext="Service providers tracked"
                    icon={Bus}
                    color="text-emerald-500"
                />
            </div>

            {/* KPI Grid - Row 2 (Insights) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Most Reliable Operator"
                    value={stats.most_reliable_operator}
                    subtext="Lowest duration variance"
                    icon={ShieldCheck}
                    color="text-teal-400"
                />
                <StatCard
                    title="Cities Connected"
                    value={stats.cities_covered}
                    subtext="Unique transport hubs"
                    icon={MapPin}
                    color="text-indigo-400"
                />
                <div className="lg:col-span-2">
                    <StatCard
                        title="High Risk Route"
                        value={stats.most_delay_prone_route}
                        subtext="Highest duration variability observed"
                        icon={AlertOctagon}
                        color="text-red-500"
                    />
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Duration Distribution */}
                <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#111827] p-6 shadow-xl">
                    <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-400" /> Trip Duration Distribution
                    </h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={durationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="range" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                />
                                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                                    {durationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`rgba(59, 130, 246, ${0.4 + (index / durationData.length) * 0.6})`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <div className="rounded-xl border border-slate-800 bg-[#1e293b]/50 p-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <a href="/predict" className="block w-full p-4 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors text-white font-medium text-center">
                                Launch Prediction Tool
                            </a>
                            <a href="/operators" className="block w-full p-4 rounded-lg bg-[#111827] border border-slate-700 hover:border-slate-500 transition-colors text-slate-200 font-medium text-center">
                                View Leaderboards
                            </a>
                            <a href="/routes" className="block w-full p-4 rounded-lg bg-[#111827] border border-slate-700 hover:border-slate-500 transition-colors text-slate-200 font-medium text-center">
                                Route Analytics
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
