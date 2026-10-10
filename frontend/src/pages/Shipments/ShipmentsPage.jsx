import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { NERMap } from '../../components/map/NERMap';
import { useAuth } from '../../context/AuthContext';
import {
  Truck, Plus, Play, Square, RotateCw, MapPin, ShieldCheck,
  AlertTriangle, Navigation, X, CheckCircle, Clock, Package
} from 'lucide-react';

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

const PRIORITY_MAP = {
  CRITICAL: { class: 'badge-rose', color: '#dc2626' },
  HIGH:     { class: 'badge-amber', color: '#d97706' },
  NORMAL:   { class: 'badge-blue', color: '#2563eb' },
  LOW:      { class: 'badge-slate', color: '#64748b' },
};
const STATUS_MAP = {
  IN_TRANSIT: { class: 'badge-blue', label: 'In Transit' },
  REROUTED:   { class: 'badge-emerald', label: 'Rerouted' },
  SCHEDULED:  { class: 'badge-slate', label: 'Scheduled' },
  DELAYED:    { class: 'badge-amber', label: 'Delayed' },
  DELIVERED:  { class: 'badge-emerald', label: 'Delivered' },
};

export const ShipmentsPage = () => {
  const { user } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [activeRoutes, setActiveRoutes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [driversList, setDriversList] = useState([]);
  const [simulatingId, setSimulatingId] = useState(null);
  const [rerouting, setRerouting] = useState(false);
  const [toast, setToast] = useState(null);
  const simRef = useRef(null);
  const [form, setForm] = useState({
    cargo_type: 'Critical Vaccines & Medical Supplies',
    priority: 'CRITICAL',
    weight_tonnes: 3.5,
    originIndex: 0,
    destinationIndex: 1,
    assigned_driver_id: '',
    notes: 'Urgent mountain transit dispatch',
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/shipments/drivers/status');
      setDriversList(res.data);
    } catch (err) {
      console.error('Failed to load drivers status', err);
    }
  };

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/shipments/');
      setShipments(res.data);
      if (res.data.length > 0 && !selected) setSelected(res.data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShipments(); }, []);

  useEffect(() => {
    if (!selected) return;
    const fetchRoute = async () => {
      try {
        const res = await api.get(`/routes/shipment/${selected.id}`);
        if (res.data?.standard_route) {
          const routes = [res.data.standard_route];
          if (res.data.safe_alternative_route) routes.push(res.data.safe_alternative_route);
          setActiveRoutes(routes);
        }
      } catch {
        if (selected.origin && selected.destination) {
          setActiveRoutes([{
            geometry: [[selected.origin.lng, selected.origin.lat], [selected.destination.lng, selected.destination.lat]],
            distance_km: 240, predicted_duration_mins: 320,
            risk_level: selected.risk_level, is_safe_alternative: false
          }]);
        }
      }
    };
    fetchRoute();
  }, [selected]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const origin = NER_HUBS[parseInt(form.originIndex)];
      const dest = NER_HUBS[parseInt(form.destinationIndex)];
      await api.post('/shipments/', {
        cargo_type: form.cargo_type,
        priority: form.priority,
        weight_tonnes: parseFloat(form.weight_tonnes),
        origin: { name: origin.name, lat: origin.lat, lng: origin.lng },
        destination: { name: dest.name, lat: dest.lat, lng: dest.lng },
        assigned_driver_id: form.assigned_driver_id || undefined,
        notes: form.notes,
      });
      setIsModalOpen(false);
      showToast('Convoy dispatched and field driver assigned successfully!', 'success');
      fetchShipments();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to dispatch shipment. Only Admins and Coordinators can dispatch.', 'error');
    }
  };

  const handleSimulateGPS = async () => {
    if (!selected) return;
    if (simulatingId) {
      clearInterval(simRef.current);
      setSimulatingId(null);
      showToast('GPS simulation stopped', 'info');
      return;
    }

    const origin = selected.origin;
    const dest = selected.destination;
    if (!origin || !dest) return;

    const waypoints = [];
    const steps = 12;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      waypoints.push({
        lat: origin.lat + (dest.lat - origin.lat) * t + Math.sin(t * Math.PI) * 0.15,
        lng: origin.lng + (dest.lng - origin.lng) * t,
      });
    }

    setSimulatingId(selected.id);
    showToast('GPS simulation started — tracking convoy movement...', 'info');
    let step = 0;

    simRef.current = setInterval(async () => {
      if (step >= waypoints.length) {
        clearInterval(simRef.current);
        setSimulatingId(null);
        showToast('Convoy reached destination!', 'success');
        return;
      }
      const wp = waypoints[step];
      try {
        await api.post(`/shipments/${selected.id}/telemetry`, { lat: wp.lat, lng: wp.lng });
        setSelected(prev => prev ? {
          ...prev,
          current_location: { name: 'Live GPS Position', lat: wp.lat, lng: wp.lng }
        } : prev);
        setShipments(prev => prev.map(s => s.id === selected.id
          ? { ...s, current_location: { name: 'Live GPS', lat: wp.lat, lng: wp.lng } }
          : s
        ));
      } catch { clearInterval(simRef.current); setSimulatingId(null); }
      step++;
    }, 2000);
  };

  const handleReroute = async () => {
    if (!selected) return;
    setRerouting(true);
    try {
      const res = await api.post(`/shipments/${selected.id}/reroute`);
      setSelected(res.data);
      setShipments(prev => prev.map(s => s.id === res.data.id ? res.data : s));
      showToast('Convoy rerouted to safe alternative path!', 'success');
      const routeRes = await api.get(`/routes/shipment/${res.data.id}`);
      if (routeRes.data?.safe_alternative_route) {
        setActiveRoutes([routeRes.data.safe_alternative_route]);
      }
    } catch {
      showToast('Reroute failed. Please try again.', 'error');
    } finally {
      setRerouting(false);
    }
  };

  const canDispatch = ['admin', 'logistics_coordinator'].includes(user?.role);
  const filteredShipments = filter === 'ALL' ? shipments : shipments.filter(s => s.status === filter || s.priority === filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
          <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="section-title" style={{ fontSize: 20, color: '#0f172a' }}>Essential Supply Shipments</h2>
          <p className="section-subtitle">GPS-tracked convoy management — medicines, food, fuel & construction materials</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Filter tabs */}
          <div className="tab-bar">
            {['ALL', 'IN_TRANSIT', 'CRITICAL', 'REROUTED', 'SCHEDULED'].map(f => (
              <button key={f} className={`tab-item ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)} style={{ fontSize: 11.5 }}>
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
          {canDispatch && (
            <button className="btn-primary" onClick={() => { setIsModalOpen(true); fetchDrivers(); }}>
              <Plus size={15} /> Dispatch
            </button>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20 }}>
        {/* Shipments List */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc' }}>
            <Package size={16} color="#2563eb" />
            <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>Convoys ({filteredShipments.length})</span>
          </div>
          <div className="scroll-zone" style={{ flex: 1, maxHeight: 540 }}>
            {loading ? (
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 85, borderRadius: 10 }} />)}
              </div>
            ) : filteredShipments.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
                No shipments found
              </div>
            ) : filteredShipments.map(s => {
              const isActive = selected?.id === s.id;
              const pm = PRIORITY_MAP[s.priority] || PRIORITY_MAP.NORMAL;
              const sm = STATUS_MAP[s.status] || STATUS_MAP.SCHEDULED;
              return (
                <div key={s.id}
                  onClick={() => setSelected(s)}
                  style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    background: isActive ? '#eff6ff' : '#ffffff',
                    borderLeft: `3px solid ${isActive ? '#2563eb' : 'transparent'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: isActive ? '#1d4ed8' : '#0f172a' }}>
                      {s.tracking_number}
                    </div>
                    <span className={`badge ${pm.class}`} style={{ fontSize: 9.5 }}>{s.priority}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: '#475569', marginBottom: 6 }}>{s.cargo_type}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`badge ${sm.class}`} style={{ fontSize: 9.5 }}>{sm.label}</span>
                    <span style={{
                      fontSize: 11.5, fontWeight: 700,
                      color: s.risk_level === 'CRITICAL' ? '#dc2626' : s.risk_level === 'MODERATE' ? '#d97706' : '#059669'
                    }}>
                      {Math.round(s.risk_score * 100)}% Risk
                    </span>
                  </div>
                  <div className="risk-bar" style={{ marginTop: 8 }}>
                    <div className="risk-bar-fill" style={{
                      width: `${Math.round(s.risk_score * 100)}%`,
                      background: s.risk_level === 'CRITICAL' ? '#dc2626' : s.risk_level === 'MODERATE' ? '#d97706' : '#059669'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail + Map Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {selected && (
            <div className="glass-card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <h3 style={{ fontSize: 19, fontWeight: 800, color: '#0f172a' }}>{selected.tracking_number}</h3>
                    <span className={`badge ${PRIORITY_MAP[selected.priority]?.class}`}>{selected.priority}</span>
                    <span className={`badge ${STATUS_MAP[selected.status]?.class}`}>{selected.status?.replace('_', ' ')}</span>
                  </div>
                  <div style={{ fontSize: 13.5, color: '#475569' }}>
                    {selected.cargo_type} — {selected.weight_tonnes}T
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    onClick={handleSimulateGPS}
                    className={simulatingId ? 'btn-amber' : 'btn-emerald'}
                    disabled={selected.status === 'DELIVERED'}
                    style={{ fontSize: 12.5 }}
                  >
                    {simulatingId ? <Square size={13} /> : <Play size={13} />}
                    {simulatingId ? 'Stop GPS Sim' : 'Simulate GPS'}
                  </button>
                  {(selected.risk_level === 'CRITICAL' || selected.risk_level === 'MODERATE') && canDispatch && (
                    <button
                      onClick={handleReroute}
                      className="btn-rose"
                      disabled={rerouting || selected.status === 'REROUTED'}
                      style={{ fontSize: 12.5 }}
                    >
                      <RotateCw size={13} style={{ animation: rerouting ? 'spin 1s linear infinite' : 'none' }} />
                      {rerouting ? 'Rerouting...' : 'Reroute to Safe Path'}
                    </button>
                  )}
                </div>
              </div>

              {/* Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Origin', value: selected.origin?.name, icon: '📍' },
                  { label: 'Destination', value: selected.destination?.name, icon: '🏁' },
                  { label: 'Current Location', value: selected.current_location?.name, icon: '📡' },
                  { label: 'AI Risk Score', value: `${Math.round(selected.risk_score * 100)}% — ${selected.risk_level}`, icon: '🤖',
                    color: selected.risk_level === 'CRITICAL' ? '#dc2626' : selected.risk_level === 'MODERATE' ? '#d97706' : '#059669' },
                  { label: 'Expected Delay', value: `+${selected.estimated_delay_mins} mins`, icon: '⏱️' },
                  { label: 'Driver', value: selected.assigned_driver_name, icon: '👤' },
                ].map(item => (
                  <div key={item.label} style={{
                    padding: '11px 14px', borderRadius: 10,
                    background: '#f8fafc', border: '1px solid #e2e8f0',
                  }}>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                      {item.icon} {item.label}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: item.color || '#0f172a' }}>
                      {item.value || '—'}
                    </div>
                  </div>
                ))}
              </div>

              {selected.notes && (
                <div style={{
                  padding: '11px 16px', borderRadius: 10,
                  background: '#fffbeb', border: '1px solid #fde68a',
                  fontSize: 12.5, color: '#92400e', fontWeight: 500
                }}>
                  ⚠️ {selected.notes}
                </div>
              )}
            </div>
          )}

          {/* Map */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
            <NERMap
              shipments={shipments}
              routes={activeRoutes}
              selectedShipment={selected}
              incidents={[]}
              height="360px"
            />
          </div>
        </div>
      </div>

      {/* Create Shipment Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: '#0f172a' }}>
                Dispatch New Convoy
              </h3>
              <button onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="form-label">Cargo Type</label>
                <input className="form-input" value={form.cargo_type}
                  onChange={e => setForm(p => ({ ...p, cargo_type: e.target.value }))} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">Priority</label>
                  <select className="form-select" value={form.priority}
                    onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="NORMAL">NORMAL</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Weight (Tonnes)</label>
                  <input type="number" step="0.1" min="0.5" max="25" className="form-input"
                    value={form.weight_tonnes}
                    onChange={e => setForm(p => ({ ...p, weight_tonnes: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="form-label">Origin Depot</label>
                <select className="form-select" value={form.originIndex}
                  onChange={e => setForm(p => ({ ...p, originIndex: e.target.value }))}>
                  {NER_HUBS.map((h, i) => <option key={i} value={i}>{h.name}</option>)}
                </select>
              </div>

              <div>
                <label className="form-label">Destination</label>
                <select className="form-select" value={form.destinationIndex}
                  onChange={e => setForm(p => ({ ...p, destinationIndex: e.target.value }))}>
                  {NER_HUBS.map((h, i) => <option key={i} value={i}>{h.name}</option>)}
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Assign Field Driver</label>
                  <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>
                    {driversList.filter(d => d.is_available).length} Idle Driver(s) Available
                  </span>
                </div>
                <select
                  className="form-select"
                  value={form.assigned_driver_id}
                  onChange={e => setForm(p => ({ ...p, assigned_driver_id: e.target.value }))}
                >
                  <option value="">⚡ Auto-Assign First Available Idle Driver</option>
                  {driversList.map(d => (
                    <option
                      key={d.id}
                      value={d.id}
                      disabled={!d.is_available}
                      style={{ color: d.is_available ? '#0f172a' : '#94a3b8' }}
                    >
                      {d.is_available ? '🟢' : '🔴'} {d.full_name} ({d.region}) — {d.is_available ? 'Available (Idle)' : `Busy on ${d.current_work?.tracking_number}`}
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: 3 }}>
                  * Drivers currently assigned to active mountain convoys are marked busy and cannot be selected.
                </div>
              </div>

              <div>
                <label className="form-label">Notes / Special Instructions</label>
                <textarea className="form-input" rows={2} value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>

              <div style={{ display: 'flex', gap: 10, paddingTop: 6 }}>
                <button type="button" className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  <Truck size={14} /> Dispatch & Calculate Risk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
