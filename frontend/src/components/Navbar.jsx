import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bus, BarChart2, MapPin, Activity, PieChart, Map as MapIcon } from 'lucide-react';
import { cn } from '../utils';

const Navbar = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Overview', icon: BarChart2 },
        { path: '/predict', label: 'Prediction', icon: MapIcon },
        { path: '/operators', label: 'Operators', icon: Bus },
        { path: '/routes', label: 'Routes', icon: MapPin },
        { path: '/network', label: 'Network', icon: Activity },
        { path: '/model', label: 'Model', icon: PieChart }
    ];

    return (
        <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0B1220]/95 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600/20 p-2 rounded-lg border border-blue-500/30">
                            <Bus className="h-5 w-5 text-blue-400" />
                        </div>
                        <span className="text-xl font-bold text-slate-100 tracking-tight">
                            BusAI
                        </span>
                    </div>

                    <div className="hidden md:flex gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-[#1E293B] text-blue-400 border border-blue-500/20"
                                            : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
