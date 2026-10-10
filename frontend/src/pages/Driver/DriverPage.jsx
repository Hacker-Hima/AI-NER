import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { NERMap } from '../../components/map/NERMap';
import {
  Truck,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Play,
  RotateCw,
  Plus,
  X,
  Send,
  Flag,
  Navigation,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const DriverPage = () => {
  const { user } = useAuth();
  const { showToast, addNotification } = useApp();

  const [assignedShipment, setAssignedShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deliveryStatus, setDeliveryStatus] = useState('In Transit');
  const [currentProgress, setCurrentProgress] = useState(45);
  const [nextCheckpoint, setNextCheckpoint] = useState('Sela Lake Military Post (Km 82)');
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const [hazardForm, setHazardForm] = useState({
    type: 'Landslide',
    severity: 'CRITICAL',
    location: 'NH-13 Km 83.5 near Bhalukpong Pass',
    description: 'Fresh boulder fall and mud runoff blocking left lane.'
  });

  const fetchDriverShipment = async () => {
    try {
      setLoading(true);
      const res = await api.get('/shipments/');
      const myShipments = res.data.filter(s =>
        s.assigned_driver_id === user?.id ||
        (s.assigned_driver_name && user?.full_name && s.assigned_driver_name.toLowerCase().includes(user.full_name.toLowerCase()))
      );
      const active = myShipments.find(s => ['IN_TRANSIT', 'SCHEDULED', 'DELAYED', 'REROUTED'].includes(s.status));
      const target = active || myShipments[0] || null;
      setAssignedShipment(target);
      if (target) {
        setDeliveryStatus(target.status === 'IN_TRANSIT' ? 'In Transit' : target.status);
        setCurrentProgress(target.status === 'DELIVERED' ? 100 : target.status === 'IN_TRANSIT' ? 55 : 10);
      }
    } catch (err) {
      console.error('Failed to load driver shipment', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverShipment();
  }, [user]);

  const handleStartDelivery = async () => {
    if (!assignedShipment) return;
    try {
      await api.patch(`/shipments/${assignedShipment.id}/status`, { status: 'IN_TRANSIT' });
      setDeliveryStatus('In Transit');
      setCurrentProgress(35);
      showToast('Delivery started! Telemetry GPS beacon broadcasting.', 'success');
      fetchDriverShipment();
    } catch {
      setDeliveryStatus('In Transit');
    }
  };

  const handleMarkCheckpoint = () => {
    setCurrentProgress(prev => Math.min(100, prev + 20));
    setNextCheckpoint('Tawang District Incline (Final Mountain Approach)');
    showToast('Checkpoint confirmed: Checkpoint verified at Sela Lake.', 'info');
  };

  const handleCompleteDelivery = async () => {
    if (!assignedShipment) return;
    try {
      await api.patch(`/shipments/${assignedShipment.id}/status`, { status: 'DELIVERED' });
      setDeliveryStatus('Delivered');
      setCurrentProgress(100);
      showToast('Consignment delivered successfully! Proof-of-delivery logged. Driver is now Idle.', 'success');
      fetchDriverShipment();
    } catch {
      setDeliveryStatus('Delivered');
      setCurrentProgress(100);
    }
  };

  const handleSubmitHazard = (e) => {
    e.preventDefault();
    showToast('Hazard report submitted successfully! Dispatch alerts notified.', 'success');
    addNotification({
      title: `Driver Report: ${hazardForm.type}`,
      message: `${hazardForm.location} — ${hazardForm.description}`,
      severity: hazardForm.severity.toLowerCase(),
      module: 'Driver',
    });
    setReportModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Driver Welcome & Consignment Banner */}
      <div style={{
        padding: '20px 24px',
        borderRadius: '16px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 14,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #059669, #047857)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
          }}>
            <Truck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
              Mountain Convoy Cockpit
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', fontFamily: 'Space Grotesk, sans-serif' }}>
              Pilot: {user?.full_name || 'Karthikeyan S'}
            </h2>
          </div>
        </div>

        {/* Quick Driver Action Buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => setReportModalOpen(true)}
            className="btn-rose"
            style={{ fontSize: '13px' }}
          >
            <AlertTriangle size={15} />
            <span>Report Road Hazard</span>
          </button>

          {deliveryStatus !== 'Delivered' ? (
            <>
              <button
                onClick={handleMarkCheckpoint}
                className="btn-ghost"
                style={{ fontSize: '13px' }}
              >
                <Flag size={15} />
                <span>Mark Checkpoint</span>
              </button>
              <button
                onClick={handleCompleteDelivery}
                className="btn-emerald"
                style={{ fontSize: '13px' }}
              >
                <CheckCircle size={15} />
                <span>Complete Delivery</span>
              </button>
            </>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#ecfdf5',
              color: '#047857',
              padding: '8px 16px',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '13px',
              border: '1px solid #a7f3d0'
            }}>
              <CheckCircle size={16} /> Delivered
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Mission HUD & Navigation Map */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '20px' }}>
        {/* Left: Active Delivery HUD */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {assignedShipment ? (
            /* Active Consignment Card */
            <div className="glass-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#1d4ed8', background: '#eff6ff', padding: '3px 10px', borderRadius: '99px' }}>
                  ACTIVE CONVOY: {assignedShipment.tracking_number}
                </span>
                <span style={{
                  fontSize: '11.5px',
                  fontWeight: '700',
                  padding: '3px 10px',
                  borderRadius: '99px',
                  background: deliveryStatus === 'Delivered' ? '#ecfdf5' : '#eff6ff',
                  color: deliveryStatus === 'Delivered' ? '#047857' : '#1d4ed8',
                  border: `1px solid ${deliveryStatus === 'Delivered' ? '#a7f3d0' : '#bfdbfe'}`,
                }}>
                  {deliveryStatus}
                </span>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                {assignedShipment.cargo_type} ({assignedShipment.weight_tonnes}T)
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '18px' }}>
                {assignedShipment.origin?.name} → {assignedShipment.destination?.name}
              </p>

              {/* Delivery Progress Bar */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  <span>Route Transit Progress</span>
                  <span style={{ color: '#2563eb' }}>{currentProgress}% Completed</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${currentProgress}%`, background: '#2563eb' }} />
                </div>
              </div>

              {/* Info Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Next Waypoint</div>
                  <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0f172a', marginTop: '3px' }}>{nextCheckpoint}</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Expected Delay</div>
                  <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0f172a', marginTop: '3px' }}>+{assignedShipment.estimated_delay_mins || 30} mins</div>
                </div>

                <div style={{ background: assignedShipment.risk_level === 'CRITICAL' ? '#fef2f2' : '#fffbeb', padding: '12px', borderRadius: '10px', border: `1px solid ${assignedShipment.risk_level === 'CRITICAL' ? '#fecaca' : '#fde68a'}` }}>
                  <div style={{ fontSize: '11px', color: assignedShipment.risk_level === 'CRITICAL' ? '#b91c1c' : '#b45309', textTransform: 'uppercase', fontWeight: '700' }}>Terrain Risk Score</div>
                  <div style={{ fontSize: '12.5px', fontWeight: '800', color: assignedShipment.risk_level === 'CRITICAL' ? '#dc2626' : '#d97706', marginTop: '3px' }}>
                    {Math.round(assignedShipment.risk_score * 100)}% — {assignedShipment.risk_level}
                  </div>
                </div>

                <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                  <div style={{ fontSize: '11px', color: '#047857', textTransform: 'uppercase', fontWeight: '700' }}>Assigned Vehicle</div>
                  <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0f172a', marginTop: '3px' }}>Tata 407 4x4 (Hill Spec)</div>
                </div>
              </div>
            </div>
          ) : (
            /* Idle Standby Card */
            <div className="glass-card" style={{ padding: '32px 24px', textAlign: 'center' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: '#ecfdf5', color: '#059669', margin: '0 auto 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <CheckCircle2 size={30} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                Driver Status: Standby & Idle
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '380px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                You are currently not on any active convoy. You are available in the driver pool for selection by the Logistics Coordinator or Admin.
              </p>
              <div style={{
                display: 'inline-block',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 18px',
                fontSize: '12px',
                color: '#334155',
                textAlign: 'left'
              }}>
                <div>🟢 <strong>Availability:</strong> Ready for Dispatch</div>
                <div style={{ marginTop: 4 }}>📍 <strong>Region Depot:</strong> {user?.region || 'NER Hub'}</div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Big Interactive Navigation Map */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}>Live Mountain Convoy GPS Guidance</span>
            <span style={{ fontSize: '11.5px', color: '#059669', fontWeight: '700' }}>
              📡 GPS Fixed (12 Sats)
            </span>
          </div>
          <div style={{ height: '440px' }}>
            <NERMap
              shipments={assignedShipment ? [{
                id: assignedShipment.id || assignedShipment.tracking_number,
                tracking_number: assignedShipment.tracking_number,
                current_location: assignedShipment.current_location || { name: assignedShipment.origin?.name || 'Depot', lat: assignedShipment.origin?.lat || 26.1445, lng: assignedShipment.origin?.lng || 91.7362 },
                status: deliveryStatus,
                risk_level: assignedShipment.risk_level || 'LOW',
              }] : []}
              incidents={[{
                id: 'inc-1',
                title: 'Active Mudslide on Sela Lake Road',
                category: 'LANDSLIDE',
                severity: 'CRITICAL',
                lat: 27.45,
                lng: 92.1,
              }]}
              center={assignedShipment?.origin ? [assignedShipment.origin.lat, assignedShipment.origin.lng] : [26.1445, 91.7362]}
              zoom={7}
              height="440px"
            />
          </div>
        </div>
      </div>

      {/* Driver Hazard Reporting Modal */}
      {reportModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} color="#dc2626" />
                <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Report Mountain Road Hazard</h3>
              </div>
              <button
                onClick={() => setReportModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitHazard} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Hazard Type</label>
                <select
                  className="form-select"
                  value={hazardForm.type}
                  onChange={(e) => setHazardForm({ ...hazardForm, type: e.target.value })}
                >
                  <option value="Landslide">Landslide / Rockfall</option>
                  <option value="Flash Flood">Flash Flood Runoff</option>
                  <option value="Road Damage">Road Washout / Bridge Damage</option>
                  <option value="Tree Fall">Tree Fall / Road Blockage</option>
                  <option value="Accident">Accident / Vehicle Breakdown</option>
                  <option value="Other">Other Hazard</option>
                </select>
              </div>

              <div>
                <label className="form-label">Severity Level</label>
                <select
                  className="form-select"
                  value={hazardForm.severity}
                  onChange={(e) => setHazardForm({ ...hazardForm, severity: e.target.value })}
                >
                  <option value="CRITICAL">Critical (Road Completely Blocked)</option>
                  <option value="MODERATE">Moderate (Single Lane Passable)</option>
                  <option value="LOW">Low (Slow Caution Traffic)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Road Marker / Landmark</label>
                <input
                  type="text"
                  className="form-input"
                  value={hazardForm.location}
                  onChange={(e) => setHazardForm({ ...hazardForm, location: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Observation Notes</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={hazardForm.description}
                  onChange={(e) => setHazardForm({ ...hazardForm, description: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', paddingTop: '6px' }}>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setReportModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-rose"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Send size={14} /> Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
