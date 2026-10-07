import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { 
  BarChart3, 
  Cpu, 
  Sliders, 
  TrendingUp, 
  Map, 
  ShieldCheck, 
  AlertTriangle,
  Play
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  CartesianGrid 
} from 'recharts';

export const AnalyticsPage = () => {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);

  // ML Sandbox Inputs
  const [sandbox, setSandbox] = useState({
    corridor_name: "Custom Himalayan Pass",
    precipitation_24h_mm: 75.0,
    precipitation_72h_accumulated_mm: 190.0,
    elevation_change_m: 1450.0,
    slope_gradient: 34.0,
    road_vulnerability_index: 0.80,
    cargo_weight_tonnes: 8.5
  });

  const [mlResult, setMlResult] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/state-accessibility');
      setStates(res.data);
    } catch (err) {
      console.error("Failed to fetch state accessibility:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    runMLInference();
  }, []);

  const runMLInference = async () => {
    try {
      setMlLoading(true);
      const res = await api.post('/predictions/risk-score', sandbox);
      setMlResult(res.data);
    } catch (err) {
      console.error("ML Inference error:", err);
    } finally {
      setMlLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-400" />
          Regional Accessibility & AI Prediction Sandbox
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Deep analytics on terrain accessibility across the 8 North Eastern states, paired with an interactive Scikit-learn inference simulator.
        </p>
      </div>

      {/* 8 NER States Accessibility Grid */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Map className="w-4 h-4 text-emerald-400" />
          Accessibility Profile by State
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {states.map((st) => {
            const isHigh = st.accessibility_index >= 80;
            const isMed = st.accessibility_index >= 65 && st.accessibility_index < 80;
            return (
              <div
                key={st.state}
                className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100">{st.state}</span>
                  <Badge variant={isHigh ? 'success' : isMed ? 'warning' : 'danger'}>
                    {st.accessibility_index}% Operable
                  </Badge>
                </div>
                <div className="text-xs text-slate-400 mt-2">{st.terrain}</div>
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Active Hazards: <b className={st.active_hazards > 1 ? 'text-rose-400' : 'text-slate-200'}>{st.active_hazards}</b></span>
                  <span className="text-[11px] text-emerald-400 font-medium">Monitored</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive AI Model Sandbox */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              Interactive AI Inference Engine (Random Forest)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate weather and geological conditions to evaluate real-time disruption probability and transit delay.
            </p>
          </div>
          <button
            onClick={runMLInference}
            disabled={mlLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20 transition self-start sm:self-auto"
          >
            <Play className={`w-3.5 h-3.5 ${mlLoading ? 'animate-spin' : ''}`} />
            Run ML Inference
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sliders Form (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* 24h Precipitation */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300">24-Hour Rainfall</span>
                <span className="text-cyan-400 font-bold">{sandbox.precipitation_24h_mm} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="250"
                step="5"
                value={sandbox.precipitation_24h_mm}
                onChange={e => setSandbox({ ...sandbox, precipitation_24h_mm: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* 72h Cumulative Precipitation */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300">72-Hour Accumulated Rainfall (Soil Saturation)</span>
                <span className="text-cyan-400 font-bold">{sandbox.precipitation_72h_accumulated_mm} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="600"
                step="10"
                value={sandbox.precipitation_72h_accumulated_mm}
                onChange={e => setSandbox({ ...sandbox, precipitation_72h_accumulated_mm: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Slope Gradient */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300">Mountain Slope Gradient</span>
                <span className="text-cyan-400 font-bold">{sandbox.slope_gradient}°</span>
              </div>
              <input
                type="range"
                min="5"
                max="45"
                step="1"
                value={sandbox.slope_gradient}
                onChange={e => setSandbox({ ...sandbox, slope_gradient: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Elevation Change */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300">Corridor Elevation Change</span>
                <span className="text-cyan-400 font-bold">{sandbox.elevation_change_m} m</span>
              </div>
              <input
                type="range"
                min="100"
                max="2600"
                step="50"
                value={sandbox.elevation_change_m}
                onChange={e => setSandbox({ ...sandbox, elevation_change_m: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Cargo Weight */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300">Convoy Cargo Weight</span>
                <span className="text-cyan-400 font-bold">{sandbox.cargo_weight_tonnes} Tonnes</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="0.5"
                value={sandbox.cargo_weight_tonnes}
                onChange={e => setSandbox({ ...sandbox, cargo_weight_tonnes: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
            </div>

          </div>

          {/* Model Prediction Output Card (5 cols) */}
          <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            {mlResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-semibold text-slate-400">Prediction Output</span>
                  <Badge variant={mlResult.risk_level === 'CRITICAL' ? 'danger' : mlResult.risk_level === 'MODERATE' ? 'warning' : 'success'}>
                    {mlResult.risk_level} RISK
                  </Badge>
                </div>

                <div>
                  <div className="text-xs text-slate-400">Road Disruption Probability</div>
                  <div className={`text-4xl font-extrabold mt-1 ${mlResult.risk_level === 'CRITICAL' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {Math.round(mlResult.disruption_probability * 100)}%
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${mlResult.risk_level === 'CRITICAL' ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${mlResult.disruption_probability * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400">Predicted Transit Delay Delta</div>
                  <div className="text-2xl font-bold text-amber-400 mt-1">
                    +{mlResult.expected_delay_mins} Minutes
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-1.5">Dominant Model Factors:</div>
                  <ul className="text-xs text-slate-400 space-y-1">
                    {mlResult.contributing_factors.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center text-xs text-slate-500 my-auto">
                Adjust sliders and click "Run ML Inference" to inspect predictions.
              </div>
            )}

            <div className="text-[10px] text-slate-500 pt-3 border-t border-slate-900 mt-4">
              Model: Random Forest Estimators (Trained on historical rainfall, slope degree & elevation).
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
