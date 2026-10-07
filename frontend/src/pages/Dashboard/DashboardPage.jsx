import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { NERMap } from '../../components/map/NERMap';
import { Badge } from '../../components/common/Badge';
import { 
  Truck, 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  CloudRain, 
  ArrowRight, 
  RefreshCw, 
  MapPin, 
  PlusCircle, 
  CheckCircle2 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_shipments: 12,
    in_transit: 5,
    delayed: 2,
    delivered: 4,
    active_incidents: 3,
    high_risk_alerts: 2,
    overall_accessibility_score: 82.5,
  });
  const [corridors, setCorridors] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [cargoData, setCargoData] = useState([]);
  const [stateAccessibility, setStateAccessibility] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, corridorsRes, shipmentsRes, incidentsRes, cargoRes, statesRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/predictions/corridors/live-risk'),
        api.get('/shipments/'),
        api.get('/incidents/?status=ACTIVE'),
        api.get('/analytics/cargo-breakdown'),
        api.get('/analytics/state-accessibility')
      ]);

      setStats(statsRes.data);
      setCorridors(corridorsRes.data);
      setShipments(shipmentsRes.data);
      setIncidents(incidentsRes.data);
      setCargoData(cargoRes.data);
      setStateAccessibility(statesRes.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
            <span>North Eastern Regional Command Center</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time multi-modal logistics monitoring, weather disruption prediction, and mountain corridor intelligence.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Feeds
          </button>
          <button
            onClick={() => navigate('/shipments')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium shadow-lg shadow-emerald-600/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            Dispatch Consignment
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Shipments */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Essential Shipments</span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{stats.in_transit}</span>
            <span className="text-xs text-slate-400">/ {stats.total_shipments} Active</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            <span>{stats.delivered} Consignments Safely Delivered</span>
          </div>
        </div>

        {/* KPI 2: Active Road Hazards */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Road Hazards</span>
            <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-400">{stats.active_incidents}</span>
            <span className="text-xs text-slate-400">Landslides / Washouts</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Across Arunachal & Meghalaya corridors
          </div>
        </div>

        {/* KPI 3: AI Critical Risk Alerts */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">High Risk Convoys</span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400">{stats.high_risk_alerts}</span>
            <span className="text-xs text-slate-400">Requiring Reroute</span>
          </div>
          <div className="mt-2 text-xs text-amber-400/90 font-medium">
            AI Landslide Probability &gt; 65%
          </div>
        </div>

        {/* KPI 4: Overall Accessibility Index */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Regional Accessibility</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">{stats.overall_accessibility_score}%</span>
            <span className="text-xs text-slate-400">Operating Index</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Evaluated across 8 NER states
          </div>
        </div>
      </div>

      {/* Main Map & Live Corridor Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Map (2 Columns) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Live GIS Fleet & Hazard Tracking
            </h2>
            <span className="text-xs text-slate-400">
              Centred on Brahmaputra & Eastern Himalayan Passages
            </span>
          </div>
          <NERMap
            shipments={shipments}
            incidents={incidents}
            height="520px"
          />
        </div>

        {/* Live Corridor Monitor Table (1 Column) */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-cyan-400" />
                Corridor Risk Monitor
              </h3>
              <Badge variant="info">Live Weather</Badge>
            </div>
            
            <p className="text-xs text-slate-400 mb-3">
              Automated AI assessment incorporating slope, 24h precipitation, and historical vulnerability.
            </p>

            <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
              {corridors.map((c) => {
                const isRed = c.status === 'BLOCKED' || c.risk_level === 'CRITICAL';
                const isAmber = c.status === 'CAUTION' || c.risk_level === 'MODERATE';
                return (
                  <div
                    key={c.corridor_code}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{c.corridor_code}</span>
                          <span className="text-[10px] text-slate-400">({c.state})</span>
                        </div>
                        <div className="text-xs text-slate-300 font-medium truncate max-w-[170px] mt-0.5">
                          {c.corridor_name}
                        </div>
                      </div>
                      <Badge variant={isRed ? 'danger' : isAmber ? 'warning' : 'success'}>
                        {c.status}
                      </Badge>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-900">
                      <span>Rain: <b className="text-slate-200">{c.current_precipitation_mm} mm</b></span>
                      <span>Risk: <b className={isRed ? 'text-rose-400 font-bold' : isAmber ? 'text-amber-400' : 'text-emerald-400'}>
                        {Math.round(c.risk_probability * 100)}%
                      </b></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => navigate('/routes')}
            className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-slate-700"
          >
            Launch Deep Route Intelligence
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* State Accessibility Bar Chart */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-100">8 NER States Accessibility Index</h3>
              <p className="text-xs text-slate-400">Estimated accessibility index based on terrain & weather saturation</p>
            </div>
            <Badge variant="purple">Regional Metrics</Badge>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateAccessibility} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis 
                  dataKey="state" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="accessibility_index" fill="#10b981" radius={[4, 4, 0, 0]} name="Accessibility %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cargo Type Criticality Pie Chart */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-100">Supply Distribution by Criticality</h3>
              <p className="text-xs text-slate-400">Share of prioritized freight types across active transit</p>
            </div>
            <Badge variant="info">Freight Volume</Badge>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cargoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {cargoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
