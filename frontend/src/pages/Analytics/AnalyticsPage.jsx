import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Zap, Activity, BarChart3, RefreshCw } from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  AreaChart, Area,
} from 'recharts';

const SliderField = ({ label, value, min, max, step, unit, onChange, color }) => (
  <div style={{ padding: '14px 0' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{label}</label>
      <span style={{ fontSize: 13, fontWeight: 700, color: color || '#2563eb' }}>
        {value} {unit}
      </span>
    </div>
    <input
      type="range"
      className="styled-slider"
      min={min} max={max} step={step}
      value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
    />
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
      <span>{min} {unit}</span><span>{max} {unit}</span>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: '#ffffff', border: '1px solid #cbd5e1',
        borderRadius: 10, padding: '10px 14px', fontSize: 12,
        boxShadow: '0 10px 25px rgba(15,23,42,0.1)'
      }}>
        <div style={{ color: '#64748b', marginBottom: 4, fontWeight: 600 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, fontWeight: 700 }}>
            {p.name}: {p.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const AnalyticsPage = () => {
  const [summary, setSummary] = useState(null);
  const [stateData, setStateData] = useState([]);
  const [cargoData, setCargoData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ML Sandbox
  const [mlInput, setMlInput] = useState({
    corridor_name: 'Custom Simulation Corridor',
    precipitation_24h_mm: 45,
    precipitation_72h_accumulated_mm: 120,
    elevation_change_m: 1200,
    slope_gradient: 28,
    road_vulnerability_index: 0.7,
    cargo_weight_tonnes: 5,
  });
  const [mlResult, setMlResult] = useState(null);
  const [previousResult, setPreviousResult] = useState(null);
  const [lastInferenceTime, setLastInferenceTime] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isSimulatedActive, setIsSimulatedActive] = useState(false);

  const PRESETS = [
    {
      id: 'dry',
      label: '☀️ Clear Skies (Low Risk)',
      color: '#059669',
      bg: '#ecfdf5',
      params: {
        corridor_name: 'Custom Simulation Corridor',
        precipitation_24h_mm: 5,
        precipitation_72h_accumulated_mm: 15,
        elevation_change_m: 350,
        slope_gradient: 10,
        road_vulnerability_index: 0.2,
        cargo_weight_tonnes: 3,
      }
    },
    {
      id: 'monsoon',
      label: '🌦️ Active Monsoon (Moderate)',
      color: '#d97706',
      bg: '#fffbeb',
      params: {
        corridor_name: 'Custom Simulation Corridor',
        precipitation_24h_mm: 65,
        precipitation_72h_accumulated_mm: 160,
        elevation_change_m: 1400,
        slope_gradient: 26,
        road_vulnerability_index: 0.65,
        cargo_weight_tonnes: 6,
      }
    },
    {
      id: 'cloudburst',
      label: '⛈️ Cloudburst Hazard (Critical)',
      color: '#dc2626',
      bg: '#fef2f2',
      params: {
        corridor_name: 'Custom Simulation Corridor',
        precipitation_24h_mm: 210,
        precipitation_72h_accumulated_mm: 520,
        elevation_change_m: 2600,
        slope_gradient: 38,
        road_vulnerability_index: 0.95,
        cargo_weight_tonnes: 12,
      }
    }
  ];

  const runMLInference = async (customInput = null) => {
    setMlLoading(true);
    const targetInput = customInput || mlInput;
    if (customInput) {
      setMlInput(customInput);
    }
    try {
      const res = await api.post('/predictions/risk-score', {
        corridor_name: 'Custom Simulation Corridor',
        ...targetInput
      });
      if (mlResult) {
        setPreviousResult(mlResult);
      }
      setMlResult(res.data);
      const now = new Date();
      setLastInferenceTime(now.toLocaleTimeString());
      setToastMessage({
        text: `ML Inference updated: ${Math.round(res.data.disruption_probability * 100)}% Disruption Risk (${res.data.risk_level}) · +${res.data.expected_delay_mins}m expected delay`,
        level: res.data.risk_level
      });
      setTimeout(() => setToastMessage(null), 4500);
    } catch (e) {
      console.error('ML inference failed', e);
      setToastMessage({ text: 'Inference request failed. Please check backend connection.', level: 'CRITICAL' });
      setTimeout(() => setToastMessage(null), 4000);
    } finally { setMlLoading(false); }
  };

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [sumR, stateR, cargoR] = await Promise.allSettled([
          api.get('/analytics/summary'),
          api.get('/analytics/state-accessibility'),
          api.get('/analytics/cargo-breakdown'),
        ]);
        if (sumR.status === 'fulfilled') setSummary(sumR.value.data);
        if (stateR.status === 'fulfilled') setStateData(stateR.value.data);
        if (cargoR.status === 'fulfilled') setCargoData(cargoR.value.data);
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
    runMLInference();
  }, []);

  const getRiskColor = (level) => {
    if (level === 'CRITICAL') return '#dc2626';
    if (level === 'MODERATE') return '#d97706';
    return '#059669';
  };

  const radarData = mlResult ? [
    { subject: 'Rainfall', value: Math.round(mlInput.precipitation_24h_mm / 1.5) },
    { subject: '72h Saturation', value: Math.round(mlInput.precipitation_72h_accumulated_mm / 3.5) },
    { subject: 'Elevation', value: Math.round(mlInput.elevation_change_m / 26) },
    { subject: 'Slope', value: Math.round(mlInput.slope_gradient / 0.45) },
    { subject: 'Vulnerability', value: Math.round(mlInput.road_vulnerability_index * 100) },
    { subject: 'Cargo Load', value: Math.round(mlInput.cargo_weight_tonnes / 0.25) },
  ] : [];

  // Derived KPIs and state metrics when simulation is applied to the network
  const currentRiskProb = mlResult ? mlResult.disruption_probability : 0.44;
  
  const displayedSummary = summary ? (
    isSimulatedActive ? {
      ...summary,
      high_risk_alerts: Math.max(1, Math.round(summary.total_shipments * (currentRiskProb * 0.75))),
      delayed: Math.max(1, Math.round(summary.total_shipments * (currentRiskProb * 0.6))),
      active_incidents: Math.max(2, Math.round(currentRiskProb * 8)),
      in_transit: Math.max(2, summary.total_shipments - Math.round(summary.total_shipments * (currentRiskProb * 0.6))),
    } : summary
  ) : null;

  const displayedStateData = stateData.map(st => {
    if (!isSimulatedActive) return st;
    const isSteep = ['Arunachal Pradesh', 'Sikkim', 'Nagaland', 'Meghalaya'].includes(st.state);
    const dropFactor = isSteep ? currentRiskProb * 45 : currentRiskProb * 20;
    const adjusted = Math.max(25, Math.min(98, Math.round(st.accessibility_index - dropFactor + 12)));
    return {
      ...st,
      accessibility_index: adjusted,
      active_hazards: currentRiskProb > 0.6 ? st.active_hazards + 2 : st.active_hazards
    };
  });

  const prevProb = previousResult ? Math.round(previousResult.disruption_probability * 100) : null;
  const currProb = mlResult ? Math.round(mlResult.disruption_probability * 100) : null;
  const delta = (prevProb !== null && currProb !== null) ? currProb - prevProb : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 9999,
          background: '#ffffff',
          color: '#0f172a',
          padding: '14px 20px',
          borderRadius: 12,
          boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
          borderLeft: `5px solid ${getRiskColor(toastMessage.level)}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 13.5,
          fontWeight: 600,
          animation: 'slideIn 0.3s ease'
        }}>
          <span>{toastMessage.level === 'CRITICAL' ? '⛈️' : toastMessage.level === 'MODERATE' ? '🌦️' : '☀️'}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 className="section-title" style={{ fontSize: 20, color: '#0f172a' }}>AI Analytics & Risk Sandbox</h2>
          <p className="section-subtitle">Live Regional Metrics + Random Forest ML Inference Engine (100 Estimators)</p>
        </div>

        {/* Network-wide simulation toggle */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setIsSimulatedActive(!isSimulatedActive)}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s',
              background: isSimulatedActive ? '#fef3c7' : '#ffffff',
              color: isSimulatedActive ? '#92400e' : '#334155',
              border: `1px solid ${isSimulatedActive ? '#f59e0b' : '#cbd5e1'}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <Activity size={16} color={isSimulatedActive ? '#d97706' : '#64748b'} />
            {isSimulatedActive ? '⚡ Simulation Applied to Network (Click to Reset)' : '🌐 Apply Scenario to Regional Network'}
          </button>
        </div>
      </div>

      {/* Simulation Active Banner */}
      {isSimulatedActive && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 12,
          background: '#fffbeb',
          border: '1px solid #fde68a',
          color: '#92400e',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 13
        }}>
          <div>
            <strong>⚡ Live Platform Simulation Active:</strong> The KPIs and 8-State Accessibility metrics below are reflecting the ML predicted disruption probability ({currProb}%).
          </div>
          <button
            onClick={() => setIsSimulatedActive(false)}
            style={{
              background: '#fef3c7',
              border: '1px solid #d97706',
              padding: '4px 10px',
              borderRadius: 6,
              color: '#92400e',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer'
            }}
          >
            Reset to Real Sensors
          </button>
        </div>
      )}

      {/* Summary KPIs */}
      {displayedSummary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
          {[
            { label: 'Total Shipments', value: displayedSummary.total_shipments, color: '#2563eb', bg: '#eff6ff' },
            { label: 'In Transit', value: displayedSummary.in_transit, color: '#059669', bg: '#ecfdf5' },
            { label: 'Delayed', value: displayedSummary.delayed, color: '#d97706', bg: '#fffbeb' },
            { label: 'Delivered', value: displayedSummary.delivered, color: '#047857', bg: '#ecfdf5' },
            { label: 'Active Incidents', value: displayedSummary.active_incidents, color: '#dc2626', bg: '#fef2f2' },
            { label: 'High Risk', value: displayedSummary.high_risk_alerts, color: '#ea580c', bg: '#fff7ed' },
          ].map(s => (
            <div key={s.label} style={{
              padding: '16px 14px', borderRadius: 12,
              background: '#ffffff', border: '1px solid #e2e8f0',
              textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Main Layout: ML Sandbox + Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '430px 1fr', gap: 20 }}>
        {/* ML Sandbox */}
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={18} color="#d97706" />
              <div className="section-title" style={{ fontSize: 16, color: '#0f172a' }}>AI Risk Prediction Sandbox</div>
            </div>
            {lastInferenceTime && (
              <span style={{ fontSize: 11, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: 99 }}>
                Ran at {lastInferenceTime}
              </span>
            )}
          </div>
          <p style={{ fontSize: 12.5, color: '#64748b', marginBottom: 14 }}>
            Adjust parameters or choose a preset scenario to run live Random Forest inference:
          </p>

          {/* Quick Scenario Presets */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
              Quick Scenario Presets:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => runMLInference(preset.params)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: preset.bg,
                    color: preset.color,
                    border: `1px solid ${preset.color}35`,
                    transition: 'all 0.15s'
                  }}
                >
                  <span>{preset.label}</span>
                  <span style={{ fontSize: 11, opacity: 0.85 }}>Click to Run ➔</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 6 }}>
            <SliderField label="24h Rainfall" value={mlInput.precipitation_24h_mm}
              min={0} max={250} step={5} unit="mm"
              onChange={v => setMlInput(p => ({ ...p, precipitation_24h_mm: v }))}
              color="#0284c7" />
            <SliderField label="72h Accumulated Rainfall" value={mlInput.precipitation_72h_accumulated_mm}
              min={0} max={600} step={10} unit="mm"
              onChange={v => setMlInput(p => ({ ...p, precipitation_72h_accumulated_mm: v }))}
              color="#2563eb" />
            <SliderField label="Elevation Change" value={mlInput.elevation_change_m}
              min={100} max={3000} step={50} unit="m"
              onChange={v => setMlInput(p => ({ ...p, elevation_change_m: v }))}
              color="#7c3aed" />
            <SliderField label="Slope Gradient" value={mlInput.slope_gradient}
              min={5} max={45} step={1} unit="°"
              onChange={v => setMlInput(p => ({ ...p, slope_gradient: v }))}
              color="#d97706" />
            <SliderField label="Road Vulnerability Index" value={mlInput.road_vulnerability_index}
              min={0.1} max={1.0} step={0.05} unit=""
              onChange={v => setMlInput(p => ({ ...p, road_vulnerability_index: v }))}
              color="#dc2626" />
            <SliderField label="Cargo Weight" value={mlInput.cargo_weight_tonnes}
              min={1} max={20} step={0.5} unit="T"
              onChange={v => setMlInput(p => ({ ...p, cargo_weight_tonnes: v }))}
              color="#059669" />
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
            onClick={() => runMLInference()}
            disabled={mlLoading}
          >
            {mlLoading ? (
              <div style={{ width: 15, height: 15, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            ) : <Zap size={15} />}
            {mlLoading ? 'Computing Random Forest Inference...' : 'Run ML Inference'}
          </button>

          {/* ML Result */}
          {mlResult && (
            <div style={{ marginTop: 20 }}>
              <div style={{ padding: '18px 20px', borderRadius: 14,
                background: `${getRiskColor(mlResult.risk_level)}10`,
                border: `1px solid ${getRiskColor(mlResult.risk_level)}30`,
                textAlign: 'center', marginBottom: 14 }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                    Disruption Probability
                  </span>
                  {delta !== null && (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 99,
                      background: delta > 0 ? '#fef2f2' : delta < 0 ? '#ecfdf5' : '#f1f5f9',
                      color: delta > 0 ? '#dc2626' : delta < 0 ? '#059669' : '#64748b'
                    }}>
                      {delta > 0 ? `+${delta}% vs prev` : delta < 0 ? `${delta}% vs prev` : 'Unchanged'}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: 46, fontWeight: 900, color: getRiskColor(mlResult.risk_level), lineHeight: 1 }}>
                  {Math.round(mlResult.disruption_probability * 100)}%
                </div>
                
                <div style={{ marginTop: 8 }}>
                  <span style={{
                    padding: '4px 14px', borderRadius: 99, fontWeight: 700, fontSize: 12,
                    background: `${getRiskColor(mlResult.risk_level)}20`,
                    color: getRiskColor(mlResult.risk_level),
                    border: `1px solid ${getRiskColor(mlResult.risk_level)}40`,
                  }}>
                    {mlResult.risk_level}
                  </span>
                </div>
                
                <div style={{ marginTop: 10, fontSize: 13, color: '#334155' }}>
                  Expected Delay: <strong style={{ color: '#0f172a' }}>+{mlResult.expected_delay_mins} mins</strong>
                </div>

                <div style={{ marginTop: 8, fontSize: 11, color: '#64748b' }}>
                  Model: Random Forest Regressor & Classifier (100 Trees)
                </div>
              </div>

              {mlResult.contributing_factors?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2, fontWeight: 600 }}>
                    Contributing Geological & Environmental Factors
                  </div>
                  {mlResult.contributing_factors.map((f, i) => (
                    <div key={i} style={{
                      padding: '8px 12px', borderRadius: 8, fontSize: 12, color: '#92400e',
                      background: '#fffbeb', border: '1px solid #fde68a',
                      display: 'flex', alignItems: 'center', gap: 7
                    }}>
                      ⚠️ {f}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Radar Chart */}
          {mlResult && (
            <div className="glass-card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div className="section-title" style={{ fontSize: 15, color: '#0f172a' }}>
                  Risk Factor Radar — Parameter Profile
                </div>
                <span style={{ fontSize: 11.5, color: '#64748b' }}>
                  Normalized Environmental Ingestion Vectors
                </span>
              </div>
              <div style={{ height: 230 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Radar name="Parameters" dataKey="value" stroke={getRiskColor(mlResult.risk_level)}
                      fill={getRiskColor(mlResult.risk_level)} fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* State Accessibility */}
          <div className="glass-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div className="section-title" style={{ fontSize: 15, color: '#0f172a' }}>
                8 NER States — Accessibility vs. Active Hazards
              </div>
              {isSimulatedActive && (
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '2px 8px', borderRadius: 6 }}>
                  Simulated Scenario Applied
                </span>
              )}
            </div>
            <div style={{ height: mlResult ? 210 : 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayedStateData} margin={{ top: 5, right: 5, left: -20, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="state" stroke="#64748b" fontSize={11}
                    interval={0} angle={-25} textAnchor="end" tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="accessibility_index" name="Accessibility %" radius={[5, 5, 0, 0]}>
                    {displayedStateData.map((entry, i) => (
                      <Cell key={i} fill={
                        entry.accessibility_index > 85 ? '#059669' :
                        entry.accessibility_index > 70 ? '#2563eb' :
                        entry.accessibility_index > 60 ? '#d97706' : '#dc2626'
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
};
