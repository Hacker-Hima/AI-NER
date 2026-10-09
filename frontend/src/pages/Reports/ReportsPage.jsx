import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  BarChart3,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowDownToLine,
  Printer
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const SHIPMENTS_OVER_TIME = [
  { day: 'Mon', delivered: 14, delayed: 2, critical: 1 },
  { day: 'Tue', delivered: 18, delayed: 4, critical: 2 },
  { day: 'Wed', delivered: 12, delayed: 6, critical: 3 },
  { day: 'Thu', delivered: 22, delayed: 3, critical: 1 },
  { day: 'Fri', delivered: 19, delayed: 5, critical: 2 },
  { day: 'Sat', delivered: 25, delayed: 2, critical: 0 },
  { day: 'Sun', delivered: 21, delayed: 4, critical: 1 },
];

const INCIDENTS_BY_CATEGORY = [
  { name: 'Landslides', count: 18, color: '#dc2626' },
  { name: 'Flash Floods', count: 12, color: '#2563eb' },
  { name: 'Road Washouts', count: 8, color: '#d97706' },
  { name: 'Tree Falls', count: 5, color: '#059669' },
  { name: 'Bridge Issues', count: 3, color: '#7c3aed' },
];

export const ReportsPage = () => {
  const { showToast } = useApp();
  const [dateRange, setDateRange] = useState('Last 7 Days');

  const handleExportCSV = () => {
    showToast('Exporting NER_LogiFlow_Operations_Audit.csv...', 'success');
  };

  const handleExportPDF = () => {
    showToast('Compiling Regional Transport Compliance PDF Report...', 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header and Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 className="section-title" style={{ fontSize: 20, color: '#0f172a' }}>Operations Reports & Audit Analytics</h2>
          <p className="section-subtitle">Comprehensive transit compliance, delivery reliability & disaster mitigation summaries</p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', padding: '6px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <Calendar size={15} color="#64748b" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{ border: 'none', background: 'none', fontSize: '13px', fontWeight: '600', color: '#0f172a', outline: 'none', cursor: 'pointer' }}
            >
              <option value="Last 24 Hours">Last 24 Hours</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Month to Date">Month to Date</option>
              <option value="Monsoon Season 2026">Monsoon Season 2026</option>
            </select>
          </div>

          <button onClick={handleExportCSV} className="btn-ghost" style={{ fontSize: '12.5px' }}>
            <ArrowDownToLine size={14} />
            <span>Export CSV</span>
          </button>

          <button onClick={handleExportPDF} className="btn-primary" style={{ fontSize: '12.5px' }}>
            <FileText size={14} />
            <span>Executive PDF Report</span>
          </button>
        </div>
      </div>

      {/* Audit KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div className="glass-card" style={{ padding: '18px 20px', borderLeft: '4px solid #2563eb' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Consignments Dispatched</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: 6 }}>131 Convoys</div>
          <div style={{ fontSize: '11.5px', color: '#059669', fontWeight: '600', marginTop: 4 }}>+12% vs prior reporting cycle</div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px', borderLeft: '4px solid #059669' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Delivery Reliability Rate</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#059669', marginTop: 6 }}>94.2%</div>
          <div style={{ fontSize: '11.5px', color: '#059669', fontWeight: '600', marginTop: 4 }}>Zero loss of cold-chain medical goods</div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px', borderLeft: '4px solid #d97706' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Average Mountain Delay</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#d97706', marginTop: 6 }}>48 Mins</div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: 4 }}>Reduced by 62% through AI bypasses</div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px', borderLeft: '4px solid #dc2626' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Hazards Mitigated</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#dc2626', marginTop: 6 }}>46 Incidents</div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: 4 }}>Convoys preemptively rerouted</div>
        </div>
      </div>

      {/* Main Charts: Deliveries Over Time & Category Share */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Deliveries Over Time Chart */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
              Supply Transit Volume & Reliability ({dateRange})
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>Daily delivery completions vs weather delays</p>
          </div>

          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SHIPMENTS_OVER_TIME}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="delivered" name="Delivered Safe" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="delayed" name="Weather Delayed" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hazard Distribution Pie */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
              Road Hazards by Category
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>Breakdown of seasonal disruptions</p>
          </div>

          <div style={{ height: '220px', display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="55%" height="100%">
              <PieChart>
                <Pie data={INCIDENTS_BY_CATEGORY} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="count">
                  {INCIDENTS_BY_CATEGORY.map((e, idx) => (
                    <Cell key={idx} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {INCIDENTS_BY_CATEGORY.map((item) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '3px', background: item.color, flexShrink: 0 }} />
                  <span style={{ color: '#475569', flex: 1 }}>{item.name}</span>
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
