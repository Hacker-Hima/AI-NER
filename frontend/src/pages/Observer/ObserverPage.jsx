import React, { useState, useEffect } from 'react';
import { NERMap } from '../../components/map/NERMap';
import { useApp } from '../../context/AppContext';
import {
  Eye,
  CheckCircle2,
  AlertTriangle,
  Activity,
  ThumbsUp,
  MapPin,
  Clock,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  FileCheck
} from 'lucide-react';

const DISTRICT_ACCESSIBILITY = [
  { state: 'Assam', district: 'Kamrup & Darrang', score: 94, status: 'Normal', activeHazards: 0 },
  { state: 'Arunachal Pradesh', district: 'Tawang & West Kameng', score: 62, status: 'Constrained', activeHazards: 2 },
  { state: 'Meghalaya', district: 'East Jaintia Hills', score: 68, status: 'Constrained', activeHazards: 1 },
  { state: 'Manipur', district: 'Imphal West & Noney', score: 54, status: 'Critical', activeHazards: 2 },
  { state: 'Nagaland', district: 'Kohima & Dimapur', score: 82, status: 'Moderate', activeHazards: 0 },
  { state: 'Mizoram', district: 'Aizawl & Kolasib', score: 79, status: 'Moderate', activeHazards: 0 },
  { state: 'Sikkim', district: 'North Sikkim & Gangtok', score: 71, status: 'Moderate', activeHazards: 1 },
  { state: 'Tripura', district: 'West Tripura & Dhalai', score: 88, status: 'Normal', activeHazards: 0 },
];

const PENDING_REPORTS = [
  { id: 'REP-101', title: 'Mudslide blocking NH-13 Km 84', location: 'Sela Lake Approach', reportedBy: 'Karthikeyan S (AS-01-HC-4821)', time: '18m ago', verifications: 2, severity: 'CRITICAL' },
  { id: 'REP-102', title: 'Water runoff and debris near Sonapur Tunnel', location: 'NH-6 East Jaintia Hills', reportedBy: 'Dinesh Kumar T', time: '42m ago', verifications: 1, severity: 'MODERATE' },
  { id: 'REP-103', title: 'Tree branch fallen on high-tension wire', location: 'Shillong Bypass Km 12', reportedBy: 'Arun Prasath K (PWD Unit)', time: '1h ago', verifications: 3, severity: 'LOW' },
];

export const ObserverPage = () => {
  const { showToast, addNotification } = useApp();
  const [reports, setReports] = useState(PENDING_REPORTS);

  const handleVerify = (id) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, verifications: r.verifications + 1, verifiedByMe: true } : r));
    showToast(`Report ${id} verified and confirmed! Disruption confidence elevated to 100%.`, 'success');
    addNotification({
      title: `Incident ${id} Verified`,
      message: `Ground Observer verified hazard in district sector.`,
      severity: 'info',
      module: 'Observer',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="section-title" style={{ fontSize: 20, color: '#0f172a' }}>Regional Observer & Verification Command</h2>
          <p className="section-subtitle">Ground incident validation, district accessibility auditing & hazard surveillance</p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#fffbeb',
          color: '#b45309',
          padding: '8px 14px',
          borderRadius: '10px',
          border: '1px solid #fde68a',
          fontSize: '12px',
          fontWeight: '700',
        }}>
          <Eye size={15} /> Field Verification Authority Active
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div className="glass-card" style={{ padding: '18px 20px', borderLeft: '4px solid #2563eb' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Average Accessibility</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: 6 }}>74.8%</div>
          <div style={{ fontSize: '11.5px', color: '#059669', fontWeight: '600', marginTop: 4 }}>Across all 8 NER states</div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px', borderLeft: '4px solid #dc2626' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Constrained Districts</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#dc2626', marginTop: 6 }}>3 Sectors</div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: 4 }}>Tawang, Jaintia & Noney</div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px', borderLeft: '4px solid #d97706' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Pending Field Reports</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#d97706', marginTop: 6 }}>{reports.filter(r => !r.verifiedByMe).length} Reports</div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: 4 }}>Requires observer sign-off</div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px', borderLeft: '4px solid #059669' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Verified Incidents</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#059669', marginTop: 6 }}>14 Incidents</div>
          <div style={{ fontSize: '11.5px', color: '#059669', fontWeight: '600', marginTop: 4 }}>Updated on State GIS</div>
        </div>
      </div>

      {/* Main Grid: District Accessibility Table + Pending Field Verifications */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* District Accessibility Table */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>8 NER States — District Connectivity Audit</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>State & Sector</th>
                  <th>Accessibility Score</th>
                  <th>Status</th>
                  <th>Hazards</th>
                </tr>
              </thead>
              <tbody>
                {DISTRICT_ACCESSIBILITY.map((d) => (
                  <tr key={d.district}>
                    <td>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{d.state}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>{d.district}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="risk-bar" style={{ width: 90, height: 6 }}>
                          <div
                            className="risk-bar-fill"
                            style={{
                              width: `${d.score}%`,
                              background: d.score > 80 ? '#059669' : d.score > 65 ? '#d97706' : '#dc2626'
                            }}
                          />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a' }}>{d.score}%</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '99px',
                        background: d.status === 'Normal' ? '#ecfdf5' : d.status === 'Moderate' ? '#eff6ff' : d.status === 'Constrained' ? '#fffbeb' : '#fef2f2',
                        color: d.status === 'Normal' ? '#047857' : d.status === 'Moderate' ? '#1d4ed8' : d.status === 'Constrained' ? '#b45309' : '#b91c1c',
                      }}>
                        {d.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: d.activeHazards > 0 ? '#dc2626' : '#059669' }}>
                        {d.activeHazards} Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Reports Verification Queue */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '700' }}>
              Verification Queue
            </span>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
              Pending Field Reports
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reports.map((rep) => (
              <div
                key={rep.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>{rep.title}</div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>📍 {rep.location}</div>
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    padding: '2px 8px',
                    borderRadius: '99px',
                    background: rep.severity === 'CRITICAL' ? '#fee2e2' : '#fef3c7',
                    color: rep.severity === 'CRITICAL' ? '#b91c1c' : '#92400e',
                  }}>
                    {rep.severity}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8' }}>
                  <span>By: {rep.reportedBy}</span>
                  <span>{rep.time}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
                  <span style={{ fontSize: '11.5px', color: '#059669', fontWeight: '700' }}>
                    ✓ {rep.verifications} Verifications
                  </span>
                  <button
                    onClick={() => handleVerify(rep.id)}
                    disabled={rep.verifiedByMe}
                    className={rep.verifiedByMe ? 'btn-ghost' : 'btn-emerald'}
                    style={{ padding: '5px 12px', fontSize: '11.5px' }}
                  >
                    {rep.verifiedByMe ? <CheckCircle2 size={12} /> : <ThumbsUp size={12} />}
                    <span>{rep.verifiedByMe ? 'Verified by You' : 'Verify Incident'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
