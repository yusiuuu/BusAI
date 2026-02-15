import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, Network, Share2 } from 'lucide-react';

const CityConnectivity = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('/api/network-stats');
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="text-center p-20 text-slate-500">Loading Network...</div>;

    const hubs = data?.hubs || [];

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">Network Intelligence</h1>
                    <p className="text-slate-400 mt-1">Hub connectivity and network strength analysis.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Hub Chart */}
                <div className="rounded-xl border border-slate-800 bg-[#111827] p-6 shadow-xl col-span-2">
                    <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-indigo-400" /> Top Transport Hubs
                    </h3>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={hubs} layout="vertical" margin={{ left: 40 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="city" type="category" width={100} tick={{ fill: '#cbd5e1', fontSize: 13 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="connections" fill="#6366F1" radius={[0, 4, 4, 0]} barSize={20}>
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CityConnectivity;
