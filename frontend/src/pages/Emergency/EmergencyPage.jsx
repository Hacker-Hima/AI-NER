import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NERMap } from '../../components/map/NERMap';
import {
  Siren,
  AlertTriangle,
  Truck,
  HeartPulse,
  Flame,
  Wheat,
  ShieldAlert,
  CheckCircle,
  RotateCw,
  ExternalLink,
  Radio,
  FileCheck,
  Send
} from 'lucide-react';

const EMERGENCY_SHIPMENTS = [
  { id: 'NER-EMG-9901', cargo: 'ICU Oxygen Cylinders & Ventilators', destination: 'Imphal Regional Hospital', priority: 'CRITICAL', status: 'In Danger', delay: '+180 mins', risk: '92%' },
  { id: 'NER-MED-8401', cargo: 'Anti-Venom & Cold-Chain Vaccines', destination: 'Tawang District Hospital', priority: 'CRITICAL', status: 'Halted', delay: '+140 mins', risk: '74%' },
  { id: 'NER-RAT-4219', cargo: 'Emergency Rice, Pulses & Baby Food', destination: 'Silchar Relief Warehouse', priority: 'HIGH', status: 'Escorted', delay: '+45 mins', risk: '38%' },
  { id: 'NER-FUL-1092', cargo: 'Aviation Fuel Tanker for Air-Drops', destination: 'Dimapur Standby Base', priority: 'CRITICAL', status: 'En-Route', delay: '+20 mins', risk: '22%' },
];

const BLOCKED_CORRIDORS = [
  { code: 'NH-13', name: 'Trans-Arunachal Highway (Km 84)', blockType: 'Massive Mudslide (400m)', clearanceETA: '6 Hours', bypassAvailable: true },
  { code: 'NH-6', name: 'Meghalaya-Assam Lifeline (Sonapur Tunnel)', blockType: 'Flash Flood Runoff', clearanceETA: '3 Hours', bypassAvailable: true },
  { code: 'NH-37', name: 'Silchar-Imphal National Highway', blockType: 'Bridge Structural Washout', clearanceETA: '18 Hours', bypassAvailable: false },
];

export const EmergencyPage = () => {
  const { emergencyMode, toggleEmergencyMode, showToast } = useApp();
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [airDropRequested, setAirDropRequested] = useState(false);
  const [militaryEscortRequested, setMilitaryEscortRequested] = useState(false);

  const handleActivate = () => {
    toggleEmergencyMode(true);
  };

  const handleConfirmExit = () => {
    toggleEmergencyMode(false);
    setShowExitConfirm(false);
  };

  const handleAirDrop = () => {
    setAirDropRequested(true);
    showToast('🚁 Indian Air Force helicopter relief sortie requested for Sela Pass sector.', 'critical');
  };

  const handleEscort = () => {
    setMilitaryEscortRequested(true);
    showToast('🛡️ Assam Rifles armed convoy escort dispatched for NH-37.', 'critical');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header */}
      <div style={{
        padding: '22px 24px',
        borderRadius: '16px',
        background: emergencyMode ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' : '#ffffff',
        border: `1px solid ${emergencyMode ? '#fca5a5' : '#e2e8f0'}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 14,
        boxShadow: emergencyMode ? '0 10px 25px -5px rgba(220, 38, 38, 0.1)' : '0 1px 3px rgba(0,0,0,0.03)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '24px' }}>{emergencyMode ? '🚨' : '🛡️'}</span>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: emergencyMode ? '#b91c1c' : '#0f172a', fontFamily: 'Space Grotesk, sans-serif' }}>
              {emergencyMode ? 'EMERGENCY OPERATIONS CENTER — ACTIVE' : 'Emergency Operations Command'}
            </h2>
          </div>
          <p style={{ fontSize: 13.5, color: emergencyMode ? '#991b1b' : '#64748b', marginTop: 4 }}>
            {emergencyMode
              ? 'All non-essential traffic suspended. Real-time military escorts, air-drop relief, and priority healthcare corridors.'
              : 'Standby mode. Activate during monsoon flash-floods, multiple simultaneous landslides, or severe supply chokeholds.'}
          </p>
        </div>

        <div>
          {!emergencyMode ? (
            <button
              onClick={handleActivate}
              className="btn-rose"
              style={{ padding: '12px 22px', fontSize: '14px', fontWeight: '800' }}
            >
              <Siren size={18} />
              <span>ACTIVATE EMERGENCY MODE</span>
            </button>
          ) : (
            <button
              onClick={() => setShowExitConfirm(true)}
              className="btn-ghost"
              style={{
                background: '#ffffff',
                borderColor: '#fca5a5',
                color: '#b91c1c',
                fontWeight: '700',
              }}
            >
              Deactivate Emergency Mode
            </button>
          )}
        </div>
      </div>

      {/* Emergency KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div className="glass-card" style={{ padding: '18px 20px', borderLeft: '4px solid #dc2626' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626', fontSize: '12px', fontWeight: '800' }}>
            <HeartPulse size={16} /> MEDICAL CONVOYS IN JEOPARDY
          </div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: 8 }}>2 Units</div>
          <div style={{ fontSize: '11.5px', color: '#dc2626', fontWeight: '600', marginTop: 4 }}>Immediate bypass intervention required</div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px', borderLeft: '4px solid #d97706' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#d97706', fontSize: '12px', fontWeight: '800' }}>
            <AlertTriangle size={16} /> BLOCKED ARTERIAL PASSES
          </div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: 8 }}>3 Corridors</div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: 4 }}>NH-13, NH-6, NH-37 affected</div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px', borderLeft: '4px solid #2563eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563eb', fontSize: '12px', fontWeight: '800' }}>
            <Wheat size={16} /> EMERGENCY RATION STOCKS
          </div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: 8 }}>4.5 Days</div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: 4 }}>Remaining buffer in Imphal / Tawang</div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px', borderLeft: '4px solid #059669' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669', fontSize: '12px', fontWeight: '800' }}>
            <Radio size={16} /> DISASTER RELIEF COMMS
          </div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#059669', marginTop: 8 }}>ONLINE</div>
          <div style={{ fontSize: '11.5px', color: '#059669', fontWeight: '600', marginTop: 4 }}>Satellite telemetry link synchronized</div>
        </div>
      </div>

      {/* Main Grid: Situation Map & Priority Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Left: Emergency Map */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}>Emergency GIS Situation Grid</span>
            <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: '700', background: '#fee2e2', padding: '2px 8px', borderRadius: '99px' }}>
              Priority Level 1
            </span>
          </div>
          <div style={{ height: '420px' }}>
            <NERMap
              shipments={EMERGENCY_SHIPMENTS.map((s, idx) => ({
                id: s.id,
                tracking_number: s.id,
                current_location: { name: s.destination, lat: 26.5 + idx * 0.3, lng: 92.0 + idx * 0.4 },
                status: s.status,
                risk_level: s.priority,
              }))}
              incidents={BLOCKED_CORRIDORS.map((b, i) => ({
                id: b.code,
                title: `${b.code} - ${b.blockType}`,
                category: 'LANDSLIDE',
                severity: 'CRITICAL',
                location: { coordinates: [92.6 + i * 0.3, 26.8 + i * 0.2] }
              }))}
              height="420px"
            />
          </div>
        </div>

        {/* Right: Emergency Actions & Priority Convoys */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Tactical Rapid Response Triggers */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
              Tactical Crisis Response Protocols
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={handleAirDrop}
                disabled={airDropRequested}
                className={airDropRequested ? 'btn-ghost' : 'btn-rose'}
                style={{ fontSize: '12px', justifyContent: 'center' }}
              >
                <Send size={14} />
                <span>{airDropRequested ? 'Air-Drop Dispatched' : 'Request Air-Drop'}</span>
              </button>

              <button
                onClick={handleEscort}
                disabled={militaryEscortRequested}
                className={militaryEscortRequested ? 'btn-ghost' : 'btn-amber'}
                style={{ fontSize: '12px', justifyContent: 'center' }}
              >
                <ShieldAlert size={14} />
                <span>{militaryEscortRequested ? 'Escort Deployed' : 'Armed Convoy Escort'}</span>
              </button>
            </div>
          </div>

          {/* Critical Shipments Priority Table */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}>Priority 1 Lifeline Deliveries</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Consignment</th>
                    <th>Destination</th>
                    <th>Risk</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {EMERGENCY_SHIPMENTS.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontWeight: 800, fontSize: '12.5px', color: '#0f172a' }}>{s.id}</div>
                        <div style={{ fontSize: '11px', color: '#475569' }}>{s.cargo}</div>
                      </td>
                      <td style={{ fontSize: '12px', color: '#1e293b' }}>{s.destination}</td>
                      <td>
                        <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#dc2626' }}>{s.risk}</span>
                      </td>
                      <td>
                        <button
                          className="btn-rose"
                          style={{ padding: '4px 8px', fontSize: '10.5px' }}
                          onClick={() => showToast(`Emergency bypass fast-tracked for ${s.id}`, 'critical')}
                        >
                          Fast-Track
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal to Exit Emergency Mode */}
      {showExitConfirm && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '440px' }}>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
              Deactivate Emergency Operations?
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, marginBottom: '20px' }}>
              Are you sure you want to exit Emergency Mode? Normal civilian transit limits will resume and priority convoy overrides will be disabled.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn-ghost"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setShowExitConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn-rose"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleConfirmExit}
              >
                Confirm Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
