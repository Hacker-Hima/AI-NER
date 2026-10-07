import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { NERMap } from '../../components/map/NERMap';
import { Badge } from '../../components/common/Badge';
import { 
  Navigation, 
  ShieldCheck, 
  AlertTriangle, 
  MapPin, 
  CheckCircle, 
  Sliders, 
  CloudRain, 
  Clock, 
  TrendingDown,
  ArrowRight
} from 'lucide-react';

const PRESET_ROUTES = [
  {
    name: "Guwahati -> Tawang (Arunachal Alpine Lifeline)",
    origin: { name: "Guwahati Depot", lat: 26.1445, lng: 91.7362 },
    destination: { name: "Tawang Hospital", lat: 27.5861, lng: 91.8594 }
  },
  {
    name: "Silchar -> Imphal (Barail Mountain Pass)",
    origin: { name: "Silchar FCI Hub", lat: 24.8333, lng: 92.7789 },
    destination: { name: "Imphal Node", lat: 24.8170, lng: 93.9368 }
  },
  {
    name: "Dimapur -> Kohima (NH-29 Monsoon Disruption Sector)",
    origin: { name: "Dimapur Railhead", lat: 25.9062, lng: 93.7271 },
    destination: { name: "Kohima City Depot", lat: 25.6751, lng: 94.1086 }
  },
  {
    name: "Shillong -> Aizawl (Meghalaya - Mizoram Corridor)",
    origin: { name: "Shillong Civil Depot", lat: 25.5788, lng: 91.8933 },
    destination: { name: "Aizawl Emergency Hub", lat: 23.7271, lng: 92.7176 }
  }
];

export const RoutePlannerPage = () => {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [cargoWeight, setCargoWeight] = useState(4.0);
  const [loading, setLoading] = useState(false);
  const [routeData, setRouteData] = useState(null);

  const calculateRoute = async (presetIndex) => {
    const route = PRESET_ROUTES[presetIndex !== undefined ? presetIndex : selectedPreset];
    try {
      setLoading(true);
      const res = await api.post('/routes/calculate', {
        origin: route.origin,
        destination: route.destination,
        avoid_hazards: true
      });
      setRouteData(res.data);
    } catch (err) {
      console.error("Failed to calculate routes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateRoute(0);
  }, []);

  const handleSelectPreset = (index) => {
    setSelectedPreset(index);
    calculateRoute(index);
  };

  const routesToRender = routeData ? [
    routeData.standard_route,
    routeData.safe_alternative_route
  ].filter(Boolean) : [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Navigation className="w-6 h-6 text-emerald-400" />
            AI Route Risk & Alternative Navigation Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate real-time highway slope stability, meteorological precipitation along mountain passes, and generate safe alternative bypasses.
          </p>
        </div>
      </div>

      {/* Preset Route Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PRESET_ROUTES.map((p, idx) => (
          <button
            key={p.name}
            onClick={() => handleSelectPreset(idx)}
            className={`p-3.5 rounded-xl border text-left transition ${
              selectedPreset === idx
                ? 'bg-emerald-950/30 border-emerald-500/60 shadow-md shadow-emerald-500/10'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-xs font-bold text-slate-200 line-clamp-1">{p.name}</div>
            <div className="mt-1 text-[11px] text-slate-400">
              {p.origin.name.split(' ')[0]} ➔ {p.destination.name.split(' ')[0]}
            </div>
          </button>
        ))}
      </div>

      {/* Recommendation Banner */}
      {routeData && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold">
                AI Optimization Recommendation
              </div>
              <div className="text-sm font-semibold text-slate-100 mt-0.5">
                {routeData.recommendation}
              </div>
            </div>
          </div>
          <Badge variant="success" size="md">
            Verified Alternative Available
          </Badge>
        </div>
      )}

      {/* Comparison Grid & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive Dual-Route Map (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Visualizing Standard Highway (Dashed) vs Safe Bypass (Solid Green)</span>
            {loading && <span className="text-emerald-400 animate-pulse">Calculating OSRM Path...</span>}
          </div>
          <NERMap
            routes={routesToRender}
            height="480px"
          />
        </div>

        {/* Route Metrics Side-by-Side (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {routeData && (
            <div className="space-y-4">
              
              {/* Standard Route Card */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-rose-900/40 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                    <h3 className="font-bold text-sm text-slate-200">Standard Highway Route</h3>
                  </div>
                  <Badge variant={routeData.standard_route.risk_level === 'CRITICAL' ? 'danger' : 'warning'}>
                    {routeData.standard_route.risk_level} RISK
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Distance</div>
                    <div className="text-sm font-bold text-slate-100">{routeData.standard_route.distance_km} km</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Est. Time</div>
                    <div className="text-sm font-bold text-slate-100">{routeData.standard_route.predicted_duration_mins} mins</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Disruption Prob</div>
                    <div className="text-sm font-bold text-rose-400">{Math.round(routeData.standard_route.overall_risk_score * 100)}%</div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-rose-400/90 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Prone to slope saturation and reported landslide blockages.</span>
                </div>
              </div>

              {/* Safe Alternative Route Card */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-emerald-800/50 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <h3 className="font-bold text-sm text-slate-200">Recommended Safe Alternative</h3>
                  </div>
                  <Badge variant="success">LOW RISK</Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Distance</div>
                    <div className="text-sm font-bold text-slate-100">{routeData.safe_alternative_route.distance_km} km</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Est. Time</div>
                    <div className="text-sm font-bold text-slate-100">{routeData.safe_alternative_route.predicted_duration_mins} mins</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Disruption Prob</div>
                    <div className="text-sm font-bold text-emerald-400">{Math.round(routeData.safe_alternative_route.overall_risk_score * 100)}%</div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Bypasses vulnerable mountain passes with minimal transit delay delta.</span>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* Segment-by-Segment Geological & Weather Risk Breakdown */}
      {routeData && routeData.standard_route.segments && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-100">Waypoint & Corridor Segment Analysis</h3>
              <p className="text-xs text-slate-400">Granular AI predictions across intermediate mountain waypoints</p>
            </div>
            <Badge variant="info">In-Process Scikit-learn Inference</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Segment</th>
                  <th className="py-2.5 px-3">Precipitation (24h)</th>
                  <th className="py-2.5 px-3">Slope Gradient</th>
                  <th className="py-2.5 px-3">AI Risk Score</th>
                  <th className="py-2.5 px-3">Risk Tier</th>
                  <th className="py-2.5 px-3">Contributing Factors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {routeData.standard_route.segments.map((seg) => {
                  const isCrit = seg.risk_level === 'CRITICAL';
                  return (
                    <tr key={seg.segment_index} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-medium text-slate-200">{seg.name}</td>
                      <td className="py-3 px-3">{seg.precipitation_mm} mm</td>
                      <td className="py-3 px-3">{seg.slope_gradient}°</td>
                      <td className="py-3 px-3 font-semibold">
                        <span className={isCrit ? 'text-rose-400' : 'text-emerald-400'}>
                          {Math.round(seg.risk_score * 100)}%
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={isCrit ? 'danger' : seg.risk_level === 'MODERATE' ? 'warning' : 'success'}>
                          {seg.risk_level}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-slate-400 max-w-xs">{seg.reason}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
