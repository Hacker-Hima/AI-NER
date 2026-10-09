import React, { useState } from 'react';
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
  ShieldCheck
} from 'lucide-react';

export const DriverPage = () => {
  const { user } = useAuth();
  const { showToast, addNotification } = useApp();

  const [deliveryStatus, setDeliveryStatus] = useState('In Transit');
  const [currentProgress, setCurrentProgress] = useState(65);
  const [nextCheckpoint, setNextCheckpoint] = useState('Sela Lake Military Post (Km 82)');
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const [hazardForm, setHazardForm] = useState({
    type: 'Landslide',
    severity: 'CRITICAL',
    location: 'NH-13 Km 83.5 near Bhalukpong Pass',
    description: 'Fresh boulder fall and mud runoff blocking left lane.'
  });

  const handleStartDelivery = () => {
    setDeliveryStatus('In Transit');
    showToast('Delivery started! Telemetry GPS beacon broadcasting.', 'success');
  };

  const handleMarkCheckpoint = () => {
    setCurrentProgress(prev => Math.min(100, prev + 15));
    setNextCheckpoint('Tawang District Incline (Final Approach)');
    showToast('Checkpoint confirmed: Checkpoint verified at Sela Lake.', 'info');
  };

  const handleCompleteDelivery = () => {
    setDeliveryStatus('Delivered');
    setCurrentProgress(100);
    showToast('Consignment delivered successfully! Proof-of-delivery logged.', 'success');
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
          {/* Active Consignment Card */}
          <div className="glass-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#1d4ed8', background: '#eff6ff', padding: '3px 10px', borderRadius: '99px' }}>
                ACTIVE CONVOY: NER-MED-8401
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
              Critical Vaccines & ICU Meds (3.5T)
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '18px' }}>
              Guwahati Central Depot → Tawang District Hospital (Arunachal Pradesh)
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
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Next Checkpoint</div>
                <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0f172a', marginTop: '3px' }}>{nextCheckpoint}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Expected ETA</div>
                <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0f172a', marginTop: '3px' }}>Today at 4:30 PM</div>
              </div>

              <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '10px', border: '1px solid #fecaca' }}>
                <div style={{ fontSize: '11px', color: '#b91c1c', textTransform: 'uppercase', fontWeight: '700' }}>Pass Risk Level</div>
                <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#dc2626', marginTop: '3px' }}>74% — High Caution</div>
              </div>

              <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                <div style={{ fontSize: '11px', color: '#047857', textTransform: 'uppercase', fontWeight: '700' }}>Assigned Vehicle</div>
                <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0f172a', marginTop: '3px' }}>Tata 407 (AS-01-HC-4821)</div>
              </div>
            </div>
          </div>
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
              shipments={[{
                id: 'NER-MED-8401',
                tracking_number: 'NER-MED-8401',
                current_location: { name: 'Near Bhalukpong', lat: 27.0125, lng: 92.6450 },
                status: deliveryStatus,
                risk_level: 'CRITICAL',
              }]}
              incidents={[{
                id: 'inc-1',
                title: 'Active Mudslide on Sela Lake Road',
                category: 'LANDSLIDE',
                severity: 'CRITICAL',
                lat: 27.45,
                lng: 92.1,
              }]}
              center={[27.0125, 92.6450]}
              zoom={8}
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
