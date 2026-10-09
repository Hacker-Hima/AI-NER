import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { NERMap } from '../../components/map/NERMap';
import { useApp } from '../../context/AppContext';
import {
  Truck, AlertTriangle, ShieldAlert, Activity,
  CloudRain, ArrowRight, RefreshCw, MapPin,
  PlusCircle, CheckCircle2, TrendingUp, Zap,
  Siren, Clock, X, Info, Gauge, User
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts';

const StatCard = ({ label, value, sub, icon: Icon, iconColor, iconBg, topColor, trend }) => (
  <div className={`kpi-card kpi-card-${topColor}`} style={{ cursor: 'default' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
        {label}
      </span>
      <div style={{ padding: '7px', borderRadius: 9, background: iconBg, border: `1px solid ${iconBg}` }}>
        <Icon size={16} color={iconColor} />
      </div>
    </div>
    <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <span style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</span>
      {sub && <span style={{ fontSize: 11.5, color: '#64748b' }}>{sub}</span>}
    </div>
    {trend && (
      <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: iconColor, fontWeight: 600 }}>
        <TrendingUp size={12} />
        <span>{trend}</span>
      </div>
    )}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#ffffff', border: '1px solid #cbd5e1',
        borderRadius: 10, padding: '10px 14px', fontSize: 12,
        boxShadow: '0 10px 25px rgba(15,23,42,0.1)'
      }}>
        <div style={{ color: '#64748b', marginBottom: 4, fontWeight: 600 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, fontWeight: 700 }}>
            {p.name}: {p.value}{typeof p.value === 'number' && p.value <= 100 ? '%' : ''}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { emergencyMode } = useApp();

  const [stats, setStats] = useState({
    total_shipments: 12,
    in_transit: 5,
    delayed: 2,
    delivered: 4,
    active_incidents: 3,
    high_risk_alerts: 2,
    emergency_shipments: 2,
    overall_accessibility_score: 82.5
  });

  const [corridors, setCorridors] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [cargoData, setCargoData] = useState([]);
  const [stateAccessibility, setStateAccessibility] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null); // Truck or Incident details
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsR, corridorsR, shipmentsR, incidentsR, cargoR, statesR] = await Promise.allSettled([
        api.get('/analytics/summary'),
        api.get('/predictions/corridors/live-risk'),
        api.get('/shipments/'),
        api.get('/incidents/'),
        api.get('/analytics/cargo-breakdown'),
        api.get('/analytics/state-accessibility'),
      ]);
      if (statsR.status === 'fulfilled') setStats(prev => ({ ...prev, ...statsR.value.data }));
      if (corridorsR.status === 'fulfilled') setCorridors(corridorsR.value.data);
      if (shipmentsR.status === 'fulfilled') setShipments(shipmentsR.value.data);
      if (incidentsR.status === 'fulfilled') setIncidents(incidentsR.value.data);
      if (cargoR.status === 'fulfilled') setCargoData(cargoR.value.data);
      if (statesR.status === 'fulfilled') setStateAccessibility(statesR.value.data);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Dashboard fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const getRiskColor = (level) => {
    if (level === 'CRITICAL') return '#dc2626';
    if (level === 'MODERATE') return '#d97706';
    return '#059669';
  };

  const getStatusBadge = (status) => {
    const map = {
      BLOCKED: { class: 'badge-rose', label: 'BLOCKED' },
      CAUTION: { class: 'badge-amber', label: 'CAUTION' },
      OPEN: { class: 'badge-emerald', label: 'OPEN' },
    };
    return map[status] || map.OPEN;
  };

  // Mock click on truck or incident for inspection panel
  const handleInspectShipment = (s) => {
    setSelectedEntity({
      type: 'truck',
      id: s.tracking_number,
      cargo: s.cargo_type,
      driver: s.assigned_driver_name || 'Karthikeyan S',
      status: s.status,
      destination: s.destination?.name || 'Tawang District Hospital',
      eta: '4:30 PM',
      risk: s.risk_level,
      delay: `+${s.estimated_delay_mins || 45} mins`
    });
  };

  const handleInspectIncident = (inc) => {
    setSelectedEntity({
      type: 'incident',
      id: inc.title,
      category: inc.category?.replace('_', ' '),
      severity: inc.severity,
      location: inc.landmark,
      reportedBy: inc.reported_by_name || 'Field Pilot',
      verification: `${inc.verification_count || 2}x Verified`,
      status: inc.status,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#0f172a' }}>
            Regional Command Center
            <span className="ping-dot ping-dot-emerald" />
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 3 }}>
            Last synced: {lastUpdated.toLocaleTimeString()} — real-time corridor risk, fleet GPS & weather disruption intelligence
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={fetchAll}
            className="btn-ghost"
            style={{ gap: 7, fontSize: 13 }}
            disabled={loading}
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh Feed
          </button>
          <button onClick={() => navigate('/shipments')} className="btn-primary">
            <PlusCircle size={15} />
            Dispatch Convoy
          </button>
        </div>
      </div>

      {/* TOP 6 KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
        <StatCard
          label="Convoys In Transit"
          value={stats.in_transit}
          sub={`/ ${stats.total_shipments}`}
          icon={Truck}
          iconColor="#2563eb"
          iconBg="#eff6ff"
          topColor="blue"
          trend={`${stats.delivered} safe`}
        />
        <StatCard
          label="Active Road Hazards"
          value={stats.active_incidents}
          sub="Roadblocks"
          icon={AlertTriangle}
          iconColor="#dc2626"
          iconBg="#fef2f2"
          topColor="rose"
          trend="Arunachal & Jaintia"
        />
        <StatCard
          label="High-Risk Convoys"
          value={stats.high_risk_alerts}
          sub="Risk > 65%"
          icon={ShieldAlert}
          iconColor="#d97706"
          iconBg="#fffbeb"
          topColor="amber"
          trend="Bypass advised"
        />
        <StatCard
          label="Regional Accessibility"
          value={`${stats.overall_accessibility_score}%`}
          sub="Composite"
          icon={Activity}
          iconColor="#059669"
          iconBg="#ecfdf5"
          topColor="emerald"
          trend="8 NER states"
        />
        <StatCard
          label="Emergency Shipments"
          value={stats.emergency_shipments || 2}
          sub="Priority 1"
          icon={Siren}
          iconColor="#dc2626"
          iconBg="#fef2f2"
          topColor="rose"
          trend="ICU/Vaccine"
        />
        <StatCard
          label="Delayed Deliveries"
          value={stats.delayed}
          sub="Weather hold"
          icon={Clock}
          iconColor="#ea580c"
          iconBg="#fff7ed"
          topColor="amber"
          trend="+48m avg delay"
        />
      </div>

      {/* Main Situation Map + Inspect Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedEntity ? '1fr 340px' : '1fr 320px', gap: 20 }}>
        {/* Map */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>
              <MapPin size={16} color="#2563eb" />
              Regional Situation Map — Northeast Mountain Corridors
            </div>
            <span style={{ fontSize: '11.5px', color: '#64748b' }}>
              Click any convoy or hazard for live telemetry
            </span>
          </div>

          <div style={{ height: '480px' }}>
            <NERMap
              shipments={shipments}
              incidents={incidents.filter(i => i.status !== 'RESOLVED')}
              height="480px"
            />
          </div>
        </div>

        {/* Dynamic Detail Panel OR Quick Corridor Risk Monitor */}
        {selectedEntity ? (
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>
                  {selectedEntity.type === 'truck' ? 'Convoy Telemetry Inspection' : 'Incident Hazard Inspection'}
                </span>
                <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', marginTop: 2 }}>
                  {selectedEntity.id}
                </h3>
              </div>
              <button onClick={() => setSelectedEntity(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={18} />
              </button>
            </div>

            {selectedEntity.type === 'truck' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700' }}>DESTINATION</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{selectedEntity.destination}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700' }}>DRIVER</div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>{selectedEntity.driver}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700' }}>ETA</div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>{selectedEntity.eta}</div>
                  </div>
                </div>
                <div style={{ padding: '10px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: '10.5px', color: '#b91c1c', fontWeight: '800' }}>AI RISK & DELAY</div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#dc2626' }}>{selectedEntity.risk} ({selectedEntity.delay})</div>
                </div>
                <button onClick={() => navigate('/shipments')} className="btn-primary" style={{ justifyContent: 'center', marginTop: 6, fontSize: '12px' }}>
                  Open Shipment Console
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700' }}>LOCATION</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{selectedEntity.location}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700' }}>SEVERITY</div>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#dc2626' }}>{selectedEntity.severity}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700' }}>VERIFICATION</div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#059669' }}>{selectedEntity.verification}</div>
                  </div>
                </div>
                <button onClick={() => navigate('/incidents')} className="btn-rose" style={{ justifyContent: 'center', marginTop: 6, fontSize: '12px' }}>
                  Open Disruption Board
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Corridor Risk Monitor */
          <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div className="section-title" style={{ fontSize: 15, display: 'flex', alignItems: 'center', gap: 7, color: '#0f172a' }}>
                <CloudRain size={16} color="#0284c7" />
                Corridor Risk Monitor
              </div>
              <span className="badge badge-cyan" style={{ fontSize: 10 }}>Live Weather</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '380px' }}>
              {corridors.map((c) => {
                const { class: bdgClass, label: bdgLabel } = getStatusBadge(c.status);
                const rColor = getRiskColor(c.risk_level);
                return (
                  <div key={c.corridor_code} style={{
                    padding: '12px 14px', borderRadius: 12,
                    background: '#f8fafc', border: '1px solid #e2e8f0',
                    transition: 'border-color 0.18s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>{c.corridor_code}</span>
                          <span style={{ fontSize: 11, color: '#64748b' }}>{c.state}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#334155', marginTop: 2, fontWeight: 500 }}>
                          {c.corridor_name}
                        </div>
                      </div>
                      <span className={`badge ${bdgClass}`} style={{ fontSize: 10, flexShrink: 0 }}>{bdgLabel}</span>
                    </div>

                    <div className="risk-bar">
                      <div className="risk-bar-fill" style={{
                        width: `${Math.round(c.risk_probability * 100)}%`,
                        background: `linear-gradient(90deg, ${rColor}99, ${rColor})`,
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#64748b', marginTop: 5 }}>
                      <span>🌧️ {c.current_precipitation_mm} mm</span>
                      <span style={{ color: rColor, fontWeight: 700 }}>{Math.round(c.risk_probability * 100)}% Risk</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={() => navigate('/routes')} className="btn-ghost"
              style={{ marginTop: 14, width: '100%', justifyContent: 'center', fontSize: 13 }}>
              Deep Route Intelligence <ArrowRight size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Regional Analytics Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        {/* State Accessibility Bar Chart */}
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: '800', color: '#0f172a' }}>8 NER States — District Accessibility Score</h3>
            <p style={{ fontSize: 12, color: '#64748b' }}>Terrain, weather and active roadblock composite rating</p>
          </div>
          <div style={{ height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateAccessibility} margin={{ top: 5, right: 5, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="state" stroke="#64748b" fontSize={11} tickLine={false} interval={0} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="accessibility_index" radius={[4, 4, 0, 0]} name="Accessibility %" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Freight Supply Criticality Distribution */}
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: '800', color: '#0f172a' }}>Active Supply Freight Distribution</h3>
            <p style={{ fontSize: 12, color: '#64748b' }}>Essential medical, food grain, and fuel load share</p>
          </div>
          <div style={{ height: 230, display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="55%" height="100%">
              <PieChart>
                <Pie data={cargoData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                  {cargoData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cargoData.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, color: '#475569' }}>{d.name}</div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{d.value}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
