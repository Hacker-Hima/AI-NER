import React, { useState } from 'react';
import api from '../../services/api';
import { NERMap } from '../../components/map/NERMap';
import { Navigation, ArrowRight, RefreshCw, AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react';

const NER_HUBS = [
  { name: 'Guwahati Central Depot (Assam)', lat: 26.1445, lng: 91.7362 },
  { name: 'Tawang District Hospital (Arunachal)', lat: 27.5861, lng: 91.8594 },
  { name: 'Silchar FCI Granary (Assam)', lat: 24.8333, lng: 92.7789 },
  { name: 'Imphal Relief Logistics Hub (Manipur)', lat: 24.8170, lng: 93.9368 },
  { name: 'Kohima Civil Supply Depot (Nagaland)', lat: 25.6751, lng: 94.1086 },
  { name: 'Dimapur Railway Freight Yard (Nagaland)', lat: 25.9062, lng: 93.7271 },
  { name: 'Shillong Health Department (Meghalaya)', lat: 25.5788, lng: 91.8933 },
  { name: 'Aizawl Emergency Supplies (Mizoram)', lat: 23.7271, lng: 92.7176 },
  { name: 'Agartala State Depot (Tripura)', lat: 23.8315, lng: 91.2868 },
  { name: 'Gangtok Hill Supply Center (Sikkim)', lat: 27.3389, lng: 88.6065 },
];

const PRESET_ROUTES = [
  { label: 'Guwahati → Tawang (Trans-Arunachal)', originIndex: 0, destIndex: 1 },
  { label: 'Silchar → Imphal (Manipur Lifeline)', originIndex: 2, destIndex: 3 },
  { label: 'Dimapur → Kohima (Nagaland Highway)', originIndex: 5, destIndex: 4 },
  { label: 'Guwahati → Shillong (Meghalaya Link)', originIndex: 0, destIndex: 6 },
  { label: 'Agartala → Silchar (Tripura Connection)', originIndex: 8, destIndex: 2 },
];

const RouteCard = ({ route, label, recommended }) => {
  const rColor = route.risk_level === 'CRITICAL' ? '#dc2626' : route.risk_level === 'MODERATE' ? '#d97706' : '#059669';
  const isPrimary = route.is_safe_alternative;
  return (
    <div style={{
      padding: '20px 22px', borderRadius: 14,
      background: isPrimary ? '#f0fdf4' : '#fef2f2',
      border: `1px solid ${isPrimary ? '#bbf7d0' : '#fecaca'}`,
      position: 'relative',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      {recommended && (
        <div style={{
          position: 'absolute', top: -10, right: 16,
          padding: '4px 14px', borderRadius: 99,
          background: 'linear-gradient(135deg, #059669, #10b981)',
          fontSize: 10.5, fontWeight: 700, color: 'white',
          boxShadow: '0 2px 8px rgba(5,150,105,0.3)',
        }}>
          ✓ AI RECOMMENDED
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{isPrimary ? '🟢 Optimal Valley Bypass (Safe Corridor)' : '🔴 Standard Mountain Highway (Vulnerable)'}</span>
            {isPrimary && (
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: '#ecfdf5', color: '#065f46', fontWeight: 800, border: '1px solid #a7f3d0' }}>
                AI-OPTIMIZED
              </span>
            )}
          </div>
          <div style={{ fontSize: 12.5, color: '#64748b' }}>{route.notes}</div>
        </div>
        <span style={{
          padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700,
          background: `${rColor}15`, color: rColor, border: `1px solid ${rColor}40`,
        }}>{route.risk_level}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
        {[
          { icon: '📏', label: 'Distance', value: `${route.distance_km} km`, sub: isPrimary ? 'Valley Bypass' : 'Direct Highway' },
          { icon: '⏱️', label: 'Est. Time', value: `${Math.round(route.predicted_duration_mins / 60)}h ${route.predicted_duration_mins % 60}m`, sub: isPrimary ? 'Fast & Time-Saving' : 'Severe Delay' },
          { icon: '⚡', label: 'Delay', value: `+${route.delay_delta_mins} mins`, sub: isPrimary ? 'Minimal Buffer' : 'Mountain Choke Hold' },
        ].map(item => (
          <div key={item.label} style={{
            padding: '10px 12px', borderRadius: 10, textAlign: 'center',
            background: '#ffffff', border: '1px solid #e2e8f0',
          }}>
            <div style={{ fontSize: 16, marginBottom: 3 }}>{item.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{item.value}</div>
            <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600 }}>{item.label}</div>
            {item.sub && (
              <div style={{ fontSize: 9.5, color: isPrimary ? '#059669' : '#dc2626', fontWeight: 700, marginTop: 2 }}>
                {item.sub}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Corridor Highlights */}
      <div style={{
        padding: '8px 12px', borderRadius: 8, marginBottom: 14, fontSize: 12, fontWeight: 600,
        background: isPrimary ? '#ecfdf5' : '#fef2f2',
        color: isPrimary ? '#047857' : '#b91c1c',
        border: `1px solid ${isPrimary ? '#a7f3d0' : '#fecaca'}`,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span>{isPrimary ? '⚡ Optimal Transit:' : '⚠️ Caution:'}</span>
        <span>
          {isPrimary
            ? 'Free-flowing fortified corridor saving transit delay and eliminating mountain landslide choke points.'
            : 'Unstable mountain pass subject to chronic rockfalls, single-lane crawl, and clearance holds.'}
        </span>
      </div>

      {/* Risk Gauge */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#64748b', marginBottom: 5 }}>
          <span>AI Disruption Probability</span>
          <span style={{ color: rColor, fontWeight: 700 }}>
            {Math.round(route.overall_risk_score * 100)}%
          </span>
        </div>
        <div className="risk-bar" style={{ height: 6 }}>
          <div className="risk-bar-fill" style={{
            width: `${Math.round(route.overall_risk_score * 100)}%`,
            background: `linear-gradient(90deg, ${rColor}99, ${rColor})`,
          }} />
        </div>
      </div>

      {/* Waypoints */}
      {route.segments && route.segments.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: 8 }}>
            Waypoint Breakdown
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {route.segments.map((seg, i) => {
              const sc = seg.risk_level === 'CRITICAL' ? '#dc2626' : seg.risk_level === 'MODERATE' ? '#d97706' : '#059669';
              return (
                <div key={i} style={{
                  padding: '9px 12px', borderRadius: 8,
                  background: '#ffffff', border: `1px solid #e2e8f0`,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: `${sc}18`,
                    border: `1.5px solid ${sc}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800, color: sc, flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: '#0f172a', fontWeight: 600 }}>{seg.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      🌧️ {seg.precipitation_mm}mm · 📐 {seg.slope_gradient}° · ⚡ {Math.round(seg.risk_score * 100)}% risk
                    </div>
                  </div>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99,
                    background: `${sc}15`, color: sc, fontWeight: 700 }}>
                    {seg.risk_level}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const RoutePlannerPage = () => {
  const [originIndex, setOriginIndex] = useState(0);
  const [destIndex, setDestIndex] = useState(1);
  const [cargoWeight, setCargoWeight] = useState(5);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const calculate = async () => {
    const origin = NER_HUBS[parseInt(originIndex)];
    const dest = NER_HUBS[parseInt(destIndex)];
    if (originIndex === destIndex) {
      showToast('Please select different origin and destination', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/routes/calculate', {
        origin: { name: origin.name, lat: origin.lat, lng: origin.lng },
        destination: { name: dest.name, lat: dest.lat, lng: dest.lng },
        cargo_weight_tonnes: cargoWeight,
      });
      setResult(res.data);
    } catch (err) {
      showToast('Route calculation failed. Backend may be unavailable.', 'error');
    } finally { setLoading(false); }
  };

  const applyPreset = (preset) => {
    setOriginIndex(preset.originIndex);
    setDestIndex(preset.destIndex);
    const origin = NER_HUBS[preset.originIndex];
    const dest = NER_HUBS[preset.destIndex];
    setLoading(true);
    api.post('/routes/calculate', {
      origin: { name: origin.name, lat: origin.lat, lng: origin.lng },
      destination: { name: dest.name, lat: dest.lat, lng: dest.lng },
      cargo_weight_tonnes: cargoWeight,
    }).then(res => setResult(res.data))
      .catch(() => showToast('Route calculation failed', 'error'))
      .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    calculate();
  }, []);

  const displayRoutes = result ? [
    result.standard_route,
    result.safe_alternative_route,
  ].filter(Boolean) : [];

  const isRecommendingAlt = result?.recommendation?.includes('RECOMMENDED');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
          <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="section-title" style={{ fontSize: 20, color: '#0f172a' }}>Route Intelligence</h2>
        <p className="section-subtitle">Real-time terrain-aware pathfinding & landslide disruption intelligence trained on Kaggle benchmark data</p>
      </div>

      {/* Controls Card */}
      <div className="glass-card" style={{ padding: 22 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto auto', gap: 14, alignItems: 'end' }}>
          <div>
            <label className="form-label">Origin Depot</label>
            <select className="form-select" value={originIndex}
              onChange={e => { setOriginIndex(e.target.value); setResult(null); }}>
              {NER_HUBS.map((h, i) => <option key={i} value={i}>{h.name}</option>)}
            </select>
          </div>
          <div style={{ padding: '0 4px', color: '#94a3b8', alignSelf: 'flex-end', paddingBottom: 10 }}>
            <ArrowRight size={20} />
          </div>
          <div>
            <label className="form-label">Destination</label>
            <select className="form-select" value={destIndex}
              onChange={e => { setDestIndex(e.target.value); setResult(null); }}>
              {NER_HUBS.map((h, i) => <option key={i} value={i}>{h.name}</option>)}
            </select>
          </div>
          <div style={{ width: 130 }}>
            <label className="form-label">Cargo (T)</label>
            <input type="number" className="form-input" min={1} max={20} step={0.5}
              value={cargoWeight} onChange={e => setCargoWeight(parseFloat(e.target.value))} />
          </div>
          <button className="btn-primary" onClick={calculate} disabled={loading}
            style={{ height: 42, alignSelf: 'flex-end', whiteSpace: 'nowrap' }}>
            {loading ? (
              <div style={{ width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            ) : <Navigation size={14} />}
            {loading ? 'Calculating...' : 'Calculate Routes'}
          </button>
        </div>

        {/* Preset Quick Routes */}
        <div style={{ marginTop: 16, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
          <div style={{ fontSize: 11.5, color: '#64748b', marginBottom: 9, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Quick Presets — Common NER Transit Corridors
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PRESET_ROUTES.map((p, i) => (
              <button key={i} className="btn-ghost"
                style={{ fontSize: 11.5, padding: '7px 14px' }}
                onClick={() => applyPreset(p)}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendation Banner */}
      {result?.recommendation && (
        <div style={{
          padding: '16px 20px', borderRadius: 14, fontSize: 13.5, fontWeight: 700,
          background: isRecommendingAlt ? '#f0fdf4' : '#ecfdf5',
          border: `1px solid ${isRecommendingAlt ? '#86efac' : '#a7f3d0'}`,
          color: isRecommendingAlt ? '#14532d' : '#047857',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          boxShadow: '0 2px 10px rgba(16, 185, 129, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
            <CheckCircle size={20} color="#16a34a" />
            <span>{result.recommendation}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 11, background: '#ffffff', padding: '4px 10px', borderRadius: 99, border: '1px solid #bbf7d0', color: '#15803d', fontWeight: 800 }}>
              ⏱️ Time-Saving
            </span>
            <span style={{ fontSize: 11, background: '#ffffff', padding: '4px 10px', borderRadius: 99, border: '1px solid #bbf7d0', color: '#15803d', fontWeight: 800 }}>
              🛡️ Low Hazard Exposure
            </span>
          </div>
        </div>
      )}

      {/* Map + Route Cards */}
      {result && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Map */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
            <NERMap
              routes={displayRoutes}
              shipments={[]}
              incidents={[]}
              center={[NER_HUBS[parseInt(originIndex)].lat, NER_HUBS[parseInt(originIndex)].lng]}
              zoom={7}
              height="520px"
            />
          </div>

          {/* Route Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', maxHeight: 520 }}>
            {result.safe_alternative_route && (
              <RouteCard route={result.safe_alternative_route} label="Safe Alternative" recommended={isRecommendingAlt} />
            )}
            {result.standard_route && (
              <RouteCard route={result.standard_route} label="Standard Route" recommended={false} />
            )}
          </div>
        </div>
      )}

      {!result && !loading && (
        <div style={{
          padding: '60px 24px', textAlign: 'center', borderRadius: 16,
          background: '#ffffff', border: '1px dashed #cbd5e1',
        }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>🗺️</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
            Select origin & destination to compute routes
          </div>
          <p style={{ fontSize: 13.5, color: '#64748b', maxWidth: 440, margin: '0 auto', lineHeight: 1.6 }}>
            The AI engine will fetch live weather, check active incidents on route, run ML inference at 5 waypoints,
            and recommend the safest path.
          </p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
