import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { NERMap } from '../../components/map/NERMap';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, Plus, CheckCircle, Shield, MapPin, X, ThumbsUp } from 'lucide-react';

const CATEGORY_MAP = {
  LANDSLIDE:    { label: 'Landslide', icon: '⛰️', color: '#dc2626', bg: '#fef2f2' },
  FLASH_FLOOD:  { label: 'Flash Flood', icon: '🌊', color: '#2563eb', bg: '#eff6ff' },
  ROAD_DAMAGE:  { label: 'Road Damage', icon: '🔧', color: '#d97706', bg: '#fffbeb' },
  TREE_FALL:    { label: 'Tree Fall', icon: '🌲', color: '#059669', bg: '#ecfdf5' },
  BRIDGE_ISSUE: { label: 'Bridge Issue', icon: '🌉', color: '#7c3aed', bg: '#f5f3ff' },
  OTHER:        { label: 'Other', icon: '⚠️', color: '#64748b', bg: '#f1f5f9' },
};

export const IncidentsPage = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [isReporting, setIsReporting] = useState(false);
  const [mapClickCoords, setMapClickCoords] = useState(null);
  const [form, setForm] = useState({
    title: '', category: 'LANDSLIDE', severity: 'CRITICAL',
    lat: '', lng: '', landmark: '', description: ''
  });
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/incidents/');
      setIncidents(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchIncidents(); }, []);

  const handleMapClick = (coords) => {
    if (!isReporting) return;
    setMapClickCoords(coords);
    setForm(p => ({ ...p, lat: coords.lat.toFixed(5), lng: coords.lng.toFixed(5) }));
    showToast(`Coordinates pinned: ${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°E`, 'info');
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!form.lat || !form.lng) {
      showToast('Click on the map to set incident coordinates', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/incidents/', {
        title: form.title,
        category: form.category,
        severity: form.severity,
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
        landmark: form.landmark,
        description: form.description,
      });
      showToast('Incident reported and logged!', 'success');
      setIsReporting(false);
      setMapClickCoords(null);
      setForm({ title: '', category: 'LANDSLIDE', severity: 'CRITICAL', lat: '', lng: '', landmark: '', description: '' });
      fetchIncidents();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to report incident', 'error');
    } finally { setSubmitting(false); }
  };

  const handleVerify = async (id) => {
    try {
      await api.patch(`/incidents/${id}/verify`);
      showToast('Incident verified — trust score increased!', 'success');
      fetchIncidents();
    } catch { showToast('Verification failed', 'error'); }
  };

  const handleResolve = async (id) => {
    try {
      await api.patch(`/incidents/${id}/resolve`);
      showToast('Incident marked as resolved', 'success');
      fetchIncidents();
    } catch { showToast('Could not resolve incident', 'error'); }
  };

  const canReport = ['admin', 'logistics_coordinator', 'field_driver'].includes(user?.role);
  const canResolve = ['admin'].includes(user?.role);

  const filtered = filter === 'ALL' ? incidents : incidents.filter(i =>
    i.status === filter || i.severity === filter || i.category === filter
  );

  const stats = {
    total: incidents.length,
    critical: incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length,
    verified: incidents.filter(i => i.status === 'VERIFIED').length,
    resolved: incidents.filter(i => i.status === 'RESOLVED').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
          <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="section-title" style={{ fontSize: 20, color: '#0f172a' }}>Disruption Board</h2>
          <p className="section-subtitle">Crowdsourced road hazard reports — landslides, floods, bridge damage</p>
        </div>
        {canReport && (
          <button
            className={isReporting ? 'btn-amber' : 'btn-rose'}
            onClick={() => setIsReporting(!isReporting)}
          >
            {isReporting ? <X size={15} /> : <Plus size={15} />}
            {isReporting ? 'Cancel Reporting' : 'Report Disruption'}
          </button>
        )}
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Total Reports', value: stats.total, color: '#2563eb', bg: '#eff6ff', icon: '📋' },
          { label: 'Critical Active', value: stats.critical, color: '#dc2626', bg: '#fef2f2', icon: '🚨' },
          { label: 'Verified', value: stats.verified, color: '#d97706', bg: '#fffbeb', icon: '✅' },
          { label: 'Resolved', value: stats.resolved, color: '#059669', bg: '#ecfdf5', icon: '🟢' },
        ].map(s => (
          <div key={s.label} style={{
            padding: '16px 20px', borderRadius: 14, background: s.bg, border: `1px solid ${s.color}25`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1.2, marginTop: 8 }}>{s.value}</div>
            <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 3, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Left: List + Report Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Reporting Form */}
          {isReporting && (
            <div className="glass-card" style={{ padding: 22, borderColor: '#fca5a5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: '#dc2626', fontWeight: 800, fontSize: 15 }}>
                <AlertTriangle size={18} /> Report Road Disruption
              </div>
              <div style={{
                padding: '11px 14px', borderRadius: 10, marginBottom: 14,
                background: '#eff6ff', border: '1px solid #bfdbfe',
                fontSize: 12.5, color: '#1d4ed8',
              }}>
                📍 Click anywhere on the map to set incident coordinates
                {form.lat && form.lng && (
                  <div style={{ fontWeight: 700, marginTop: 4 }}>
                    Pinned: {parseFloat(form.lat).toFixed(3)}°N, {parseFloat(form.lng).toFixed(3)}°E
                  </div>
                )}
              </div>

              <form onSubmit={handleReport} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label className="form-label">Incident Title</label>
                  <input className="form-input" placeholder="e.g. Landslide at Sela Pass" required
                    value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="form-label">Category</label>
                    <select className="form-select" value={form.category}
                      onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                      {Object.keys(CATEGORY_MAP).map(k => <option key={k} value={k}>{CATEGORY_MAP[k].label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Severity</label>
                    <select className="form-select" value={form.severity}
                      onChange={e => setForm(p => ({ ...p, severity: e.target.value }))}>
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="MODERATE">MODERATE</option>
                      <option value="LOW">LOW</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">Landmark / Highway Marker</label>
                  <input className="form-input" placeholder="e.g. NH-13 Km 84 near Sela Lake" required
                    value={form.landmark} onChange={e => setForm(p => ({ ...p, landmark: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={2} placeholder="Describe the disruption..."
                    value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <button type="submit" className="btn-rose" style={{ justifyContent: 'center', marginTop: 4 }} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Incident Report'}
                </button>
              </form>
            </div>
          )}

          {/* Filter + List */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: 6, flexWrap: 'wrap', background: '#f8fafc' }}>
              {['ALL', 'ACTIVE', 'VERIFIED', 'RESOLVED'].map(f => (
                <button key={f} className={`tab-item ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)} style={{ fontSize: 11.5, padding: '5px 12px' }}>
                  {f}
                </button>
              ))}
            </div>
            <div className="scroll-zone" style={{ maxHeight: 480 }}>
              {loading ? [...Array(3)].map((_, i) => (
                <div key={i} style={{ padding: 14, borderBottom: '1px solid #f1f5f9' }}>
                  <div className="skeleton" style={{ height: 60, borderRadius: 8 }} />
                </div>
              )) : filtered.map(inc => {
                const cat = CATEGORY_MAP[inc.category] || CATEGORY_MAP.OTHER;
                const isSelected = selected?.id === inc.id;
                return (
                  <div key={inc.id}
                    onClick={() => setSelected(isSelected ? null : inc)}
                    style={{
                      padding: '14px 18px', borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer', transition: 'background 0.15s',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      borderLeft: `3px solid ${isSelected ? cat.color : 'transparent'}`,
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span>{cat.icon}</span>
                        <span style={{ fontWeight: 700, fontSize: 13.5, color: '#0f172a' }}>{inc.title}</span>
                      </div>
                      <span className={`badge ${inc.severity === 'CRITICAL' ? 'badge-rose' : inc.severity === 'MODERATE' ? 'badge-amber' : 'badge-emerald'}`} style={{ fontSize: 9.5 }}>
                        {inc.severity}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748b', marginBottom: 6 }}>{inc.landmark}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`badge ${inc.status === 'RESOLVED' ? 'badge-emerald' : inc.status === 'VERIFIED' ? 'badge-blue' : 'badge-rose'}`} style={{ fontSize: 9.5 }}>
                        {inc.status}
                      </span>
                      <span style={{ fontSize: 11.5, color: '#d97706', fontWeight: 600 }}>✓ {inc.verification_count || 1}x verified</span>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      {inc.status !== 'RESOLVED' && (
                        <button
                          className="btn-ghost"
                          style={{ fontSize: 11.5, padding: '5px 12px', gap: 4 }}
                          onClick={e => { e.stopPropagation(); handleVerify(inc.id); }}
                        >
                          <ThumbsUp size={12} /> Verify
                        </button>
                      )}
                      {canResolve && inc.status !== 'RESOLVED' && (
                        <button
                          className="btn-emerald"
                          style={{ fontSize: 11.5, padding: '5px 12px', gap: 4 }}
                          onClick={e => { e.stopPropagation(); handleResolve(inc.id); }}
                        >
                          <CheckCircle size={12} /> Resolve
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Map */}
        <div>
          {isReporting && (
            <div style={{
              padding: '11px 16px', borderRadius: 10, marginBottom: 12,
              background: '#fef2f2', border: '1px solid #fecaca',
              fontSize: 13, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600
            }}>
              <AlertTriangle size={15} />
              Reporting mode ON — click anywhere on the map to pin incident location
            </div>
          )}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
            <NERMap
              incidents={incidents}
              shipments={[]}
              onMapClick={isReporting ? handleMapClick : null}
              height="560px"
              zoom={7}
            />
          </div>
          {mapClickCoords && (
            <div style={{
              marginTop: 10, padding: '10px 14px', borderRadius: 10,
              background: '#eff6ff', border: '1px solid #bfdbfe',
              fontSize: 12.5, color: '#1d4ed8', textAlign: 'center', fontWeight: 600
            }}>
              📍 Coordinates pinned at {mapClickCoords.lat.toFixed(4)}°N, {mapClickCoords.lng.toFixed(4)}°E
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
