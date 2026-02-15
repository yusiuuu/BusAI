import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, MapPin, Bus, Activity, BarChart as ChartIcon, Map as MapIcon, Clock, AlertTriangle, Info, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker } from '@react-google-maps/api';
import { cn } from '../utils';

// Components
const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                "bg-blue-600/80 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/50 backdrop-blur-sm h-11 px-8 py-2",
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
Button.displayName = "Button"

const GlassCard = ({ className, children, ...props }) => (
    <div className={cn("rounded-xl p-6 relative overflow-hidden group border border-slate-800 bg-[#111827] shadow-xl", className)} {...props}>
        {/* Subtle top highlight instead of glow */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-50"></div>
        {children}
    </div>
)

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#94A3B8'];

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '1rem'
};

const center = {
    lat: 20.5937,
    lng: 78.9629
};

const Prediction = () => {
    const [fromCity, setFromCity] = useState('');
    const [toCity, setToCity] = useState('');
    const [cities, setCities] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [routeType, setRouteType] = useState('direct');
    const [explanation, setExplanation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [predictions, setPredictions] = useState({});
    const [stats, setStats] = useState(null);
    const [routeAnalytics, setRouteAnalytics] = useState(null);

    // Google Maps State
    const [map, setMap] = useState(null);
    const [directionsResponse, setDirectionsResponse] = useState(null);
    const [googleDuration, setGoogleDuration] = useState(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "AIzaSyDURJKCVDXRxEWxEBjzKEfrAd4KqHzUsqY"
    });

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const citiesRes = await axios.get('/api/cities');
                setCities(citiesRes.data.cities);

                const statsRes = await axios.get('/api/stats');
                setStats(statsRes.data);
            } catch (e) {
                console.error("Failed to load initial data", e);
            }
        };
        fetchData();
    }, []);

    // Calculate Route when cities change or search is pressed
    const calculateRoute = async () => {
        if (!fromCity || !toCity || !isLoaded) return;

        const directionsService = new google.maps.DirectionsService();
        try {
            // Check if we need waypoints for connected routes
            const waypoints = [];
            // If we have a connected route selected and it has segments, we could add waypoints
            // But for now, let's keep the map simple with start/end for the main visualization

            const results = await directionsService.route({
                origin: fromCity,
                destination: toCity,
                travelMode: google.maps.TravelMode.DRIVING,
            });
            setDirectionsResponse(results);
            if (results.routes[0] && results.routes[0].legs[0]) {
                setGoogleDuration(results.routes[0].legs[0].duration.text);
            }
        } catch (error) {
            console.error("Error calculating route:", error);
        }
    };

    // Auto-update map when cities change
    useEffect(() => {
        if (fromCity && toCity && isLoaded) {
            setDirectionsResponse(null); // Clear old route immediately to prevent ghosting
            calculateRoute();
        }
    }, [fromCity, toCity, isLoaded]);

    const handleSearch = async () => {
        if (!fromCity || !toCity) return;
        setLoading(true);
        setPredictions({});
        setRouteAnalytics(null);
        setRoutes([]);
        setExplanation(null);
        setRouteType('direct');

        // Clear previous map state
        setDirectionsResponse(null);
        setGoogleDuration(null);

        // Map calculation is now handled by useEffect on state change

        try {
            // Call new Recommendation API
            const response = await axios.post('/api/v1/route-recommendation', { from_city: fromCity, to_city: toCity });

            setRoutes(response.data.routes);
            setRouteType(response.data.type);
            setExplanation(response.data.explanation);

            // Fetch Route Analytics (optional, might not exist for connected routes perfectly, but we try)
            if (response.data.type === 'direct') {
                const analyticsRes = await axios.post('/api/route-analytics', { from_city: fromCity, to_city: toCity });
                setRouteAnalytics(analyticsRes.data);
            }

            // Predictions for Direct Routes (or main segments)
            // For now, let's run predictions on the segments of the first route if connected
            // Or just keep existing prediction logic for direct routes

            // Predictions Logic Removed as per user request to show exact dataset duration.
            // keeping this block empty or removing it entirely.

        } catch (error) {
            console.error("Error searching routes", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to format market share data for charts
    const marketShareData = routeAnalytics?.market_share ? Object.entries(routeAnalytics.market_share).map(([name, value]) => ({ name, value })) : [];
    const timePatternData = routeAnalytics?.time_patterns ? Object.entries(routeAnalytics.time_patterns).map(([hour, count]) => ({ hour: `${hour}:00`, count })) : [];

    // Calculate Stats from Routes directly
    const minDurationMinutes = routes.length > 0
        ? Math.min(...routes.map(r => r.total_duration_minutes || 0))
        : 0;

    const formatMinutes = (mins) => {
        if (!mins) return "Calculating...";
        const h = Math.floor(mins / 60);
        const m = Math.round(mins % 60);
        return `${h}h ${m}m`;
    };


    return (
        <div className="space-y-12 animate-fade-in pb-20">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-8 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/10 blur-[120px] rounded-full -z-10"></div>
                {!routes.length && (
                    <>
                        <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 drop-shadow-sm">
                            Predict Travel Time
                        </h1>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                            AI-powered forecasting for any route.
                        </p>
                    </>
                )}
            </div>

            {/* Sticky Search Bar */}
            <div className="sticky top-4 z-50 max-w-4xl mx-auto px-4">
                <div className="p-5 rounded-lg border border-slate-700 shadow-2xl bg-[#1E293B]">
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
                        <div className="md:col-span-3 space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1">From</label>
                            <div className="relative group">
                                <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                                <select
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none cursor-pointer hover:bg-slate-800/50"
                                    value={fromCity}
                                    onChange={(e) => setFromCity(e.target.value)}
                                >
                                    <option value="">Select Origin</option>
                                    {cities.map(city => <option key={city} value={city}>{city}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex md:col-span-1 justify-center pb-3">
                            <Activity className="text-slate-600 w-6 h-6" />
                        </div>
                        <div className="md:col-span-3 space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1">To</label>
                            <div className="relative group">
                                <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                                <select
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none cursor-pointer hover:bg-slate-800/50"
                                    value={toCity}
                                    onChange={(e) => setToCity(e.target.value)}
                                >
                                    <option value="">Select Destination</option>
                                    {cities.map(city => <option key={city} value={city}>{city}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Button className="w-full text-lg h-12" onClick={handleSearch} disabled={loading}>
                            {loading ? <Activity className="mr-2 h-5 w-5 animate-spin" /> : <Search className="mr-2 h-5 w-5" />}
                            {loading ? "Analyzing Routes..." : "Reveal Insights"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Gemini Insight Card */}
            {explanation && (explanation.summary || explanation.recommendation_reason) && (
                <div className="max-w-6xl mx-auto px-4 animate-fade-in-up">
                    <GlassCard className="border-indigo-500/30 bg-indigo-950/10">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-shrink-0">
                                <div className="p-3 bg-indigo-500/20 rounded-full">
                                    <Sparkles className="w-8 h-8 text-indigo-400" />
                                </div>
                            </div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h3 className="text-lg font-bold text-indigo-200">AI Route Analysis</h3>
                                    <p className="text-slate-400 text-sm">Powered by Gemini</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Summary</div>
                                        <p className="text-slate-200 leading-relaxed">{explanation.summary}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Why this route?</div>
                                        <p className="text-emerald-300 leading-relaxed">{explanation.recommendation_reason}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Risk Analysis</div>
                                        <p className="text-amber-300 leading-relaxed">{explanation.risk_analysis}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Travel Tips</div>
                                        <p className="text-blue-300 leading-relaxed">{explanation.travel_tips}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Comparison Card (Visible only after route selection) */}
            {routes.length > 0 && routeType === 'direct' && (
                <div className="animate-slide-up grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
                    {/* Google vs AI */}
                    <GlassCard className="col-span-1 md:col-span-2 lg:col-span-1 flex flex-col justify-center relative overflow-visible">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25"></div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 z-10">ETA Comparison</h3>
                        <div className="space-y-6 z-10">
                            {/* Google Maps */}
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                                <div className="flex items-center gap-3">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Google_Maps_icon_%282020%29.svg/1200px-Google_Maps_icon_%282020%29.svg.png" className="w-8 h-8" alt="Google Maps" />
                                    <span className="font-medium text-slate-200">Google Maps</span>
                                </div>
                                <span className="text-xl font-bold text-white">{googleDuration || "Calculating..."}</span>
                            </div>

                            {/* Fastest Bus */}
                            <div className="flex justify-between items-center p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                <div className="flex items-center gap-3">
                                    <Bus className="w-5 h-5 text-emerald-400" />
                                    <span className="font-medium text-emerald-100">Fastest Bus (Scheduled)</span>
                                </div>
                                <span className="text-xl font-bold text-emerald-400">{formatMinutes(minDurationMinutes)}</span>
                            </div>
                            {/* Delay Risk Indicator */}
                            {routeAnalytics && (
                                <div className="flex justify-between items-center p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="w-5 h-5 text-indigo-400" />
                                        <span className="font-medium text-indigo-100">Delay Risk</span>
                                    </div>
                                    <span className={cn(
                                        "text-sm font-bold px-2 py-1 rounded",
                                        routeAnalytics.delay_risk === 'High' ? 'bg-red-500/20 text-red-300' :
                                            routeAnalytics.delay_risk === 'Medium' ? 'bg-amber-500/20 text-amber-300' :
                                                'bg-emerald-500/20 text-emerald-300'
                                    )}>
                                        {routeAnalytics.delay_risk || "Low"}
                                    </span>
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    {/* Best Operators */}
                    {
                        routeAnalytics && routeAnalytics.best_operators.length > 0 && (
                            <GlassCard className="col-span-1 border-l-4 border-l-amber-500">
                                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="text-xl">🏆</span> Top Rated Operators
                                </h3>
                                <div className="space-y-3">
                                    {routeAnalytics.best_operators.slice(0, 3).map((op, i) => (
                                        <div key={i} className="flex justify-between items-center pb-2 border-b border-white/5 last:border-0">
                                            <div>
                                                <div className="font-bold text-slate-200">{op.name}</div>
                                                <div className="text-xs text-slate-500">{op.avg_duration} mins avg</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-emerald-400">{op.reliability_score}%</div>
                                                <div className="text-[10px] text-slate-500 uppercase">Reliability</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        )
                    }

                    {/* Market Share */}
                    {
                        routeAnalytics && (
                            <GlassCard className="col-span-1">
                                <h3 className="text-sm font-bold text-pink-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <ChartIcon className="w-4 h-4" /> Market Share
                                </h3>
                                <div className="h-40">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={marketShareData} cx="50%" cy="50%" innerRadius={30} outerRadius={60} paddingAngle={2} dataKey="value">
                                                {marketShareData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                                                itemStyle={{ color: '#fff' }}
                                                labelStyle={{ color: '#fff' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="text-center text-xs text-slate-500">Dominant players on this route</div>
                            </GlassCard>
                        )
                    }
                </div>
            )}


            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up max-w-6xl mx-auto px-4">

                {/* Left Panel: Results */}
                {routes.length > 0 && (
                    <div className="lg:col-span-7 space-y-4">
                        <div className="flex justify-between items-center px-2">
                            <h3 className="text-xl font-bold text-slate-200">
                                {routeType === 'connected' ? 'Multi-Hop Connections' : 'Available Direct Buses'}
                            </h3>
                            <span className="text-sm text-slate-500">{routes.length} options found</span>
                        </div>

                        <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                            {routes.map((route, i) => (
                                <GlassCard key={i} className="hover:bg-slate-800/60 transition-colors">
                                    {routeType === 'connected' ? (
                                        // Connected Route Card
                                        <div className="flex flex-col gap-4">
                                            <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                                                <div className="text-sm text-slate-400">Total Duration: <span className="text-white font-bold">{route.formatted_duration}</span></div>
                                                <div className="text-sm text-emerald-400 font-bold">₹{route.total_price} approx</div>
                                            </div>

                                            {/* Segments */}
                                            <div className="space-y-6 relative pl-4 border-l border-slate-700 ml-2">
                                                {route.segments.map((seg, sIdx) => (
                                                    <div key={sIdx} className="relative">
                                                        {/* Dot */}
                                                        <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-blue-500 border-2 border-slate-900"></div>

                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <div className="text-sm font-bold text-slate-200">{seg.from} → {seg.to}</div>
                                                                <div className="text-xs text-slate-400 mt-1">{seg.operator} • {seg.type || 'Bus'}</div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-xs text-slate-500">{seg.duration}</div>
                                                                {seg.distance && <div className="text-[10px] text-slate-600">{seg.distance} km</div>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        // Direct Route Card
                                        <div className="flex flex-col gap-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <div>
                                                            <span className="font-bold text-lg text-slate-100 block">{route.segments?.[0]?.operator || route.operator}</span>
                                                            <span className="text-xs text-slate-400 uppercase tracking-wider">{route.segments?.[0]?.type || route.bus_type}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-black text-white/90">₹{route.total_price || route.price}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-slate-300 text-sm">
                                                <div>{route.segments?.[0]?.departure || route.departure}</div>
                                                <div className="h-[1px] flex-1 bg-slate-700 mx-4 relative">
                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-2 text-xs text-slate-500">
                                                        {route.distance ? `${route.distance} km` : (route.formatted_duration || route.duration)}
                                                    </div>
                                                </div>
                                                <div>{route.segments?.[0]?.arrival || route.arrival}</div>
                                            </div>

                                            <div className="flex items-center gap-2 pt-2">
                                                <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                                                    <Activity className="h-3 w-3" />
                                                    Scheduled Duration: <span className="text-white">{route.formatted_duration || route.duration}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </GlassCard>
                            ))}
                        </div>
                    </div>
                )}

                {/* Right Panel: Map & Time Analysis */}
                {(routes.length > 0 || (fromCity && toCity)) && (
                    <div className={cn("space-y-6", routes.length > 0 ? "lg:col-span-5" : "lg:col-span-12")}>
                        {/* Map */}
                        <div className="glass rounded-2xl overflow-hidden border border-white/10 shadow-2xl h-[400px] flex flex-col sticky top-24">
                            <div className="flex-1 relative z-0">
                                {isLoaded ? (
                                    <GoogleMap
                                        mapContainerStyle={containerStyle}
                                        center={center}
                                        zoom={5}
                                        onLoad={onLoad}
                                        onUnmount={onUnmount}
                                        options={{
                                            disableDefaultUI: false,
                                            zoomControl: true,
                                            styles: [
                                                { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
                                                { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
                                                { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
                                                { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
                                                { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
                                                { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
                                                { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
                                            ]
                                        }}
                                    >
                                        {directionsResponse && (
                                            <DirectionsRenderer
                                                directions={directionsResponse}
                                                key={`${fromCity}-${toCity}`}
                                                options={{
                                                    polylineOptions: {
                                                        strokeColor: '#3b82f6',
                                                        strokeWeight: 5
                                                    }
                                                }}
                                            />
                                        )}
                                    </GoogleMap>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-500">
                                        Loading Google Maps...
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Time Analysis - Only show if analytics exist */}
                        {routeAnalytics && (
                            <GlassCard>
                                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Peak Departure Times
                                </h3>
                                <div className="h-40">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={timePatternData}>
                                            <XAxis dataKey="hour" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '4px', color: '#fff' }}
                                                itemStyle={{ color: '#fff' }}
                                                labelStyle={{ color: '#fff' }}
                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            />
                                            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </GlassCard>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
};

export default Prediction;
