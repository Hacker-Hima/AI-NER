import React, { useState, useEffect, useRef } from 'react';
import { NERMap } from '../../components/map/NERMap';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  Truck,
  Play,
  Square,
  Search,
  Filter,
  MapPin,
  Clock,
  ShieldAlert,
  AlertTriangle,
  RotateCw,
  Gauge,
  User,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const INITIAL_FLEET = [
  {
    id: 'veh-1',
    reg_number: 'AS-01-HC-4821',
    type: 'Tata 407 4x4 Hill Terrain Truck',
    driver: 'Rajesh Jamatia',
    phone: '+91 98620 11223',
    status: 'In Transit',
    current_location: 'Near Bhalukpong Pass',
    destination: 'Tawang District Hospital',
    speed: 34,
    fuel: 78,
    shipment_id: 'NER-MED-8401',
    cargo: 'Critical Vaccines & ICU Meds',
    risk_level: 'CRITICAL',
    risk_score: 0.74,
    eta: '4:30 PM',
    lat: 27.0125,
    lng: 92.6450,
  },
  {
    id: 'veh-2',
    reg_number: 'MZ-01-A-7744',
    type: 'Ashok Leyland 4x4 Mountain Carrier',
    driver: 'Lalremruata Sailo',
    phone: '+91 94361 88712',
    status: 'In Transit',
    current_location: 'Jowai Bypass Road',
    destination: 'Silchar FCI Granary',
    speed: 42,
    fuel: 85,
    shipment_id: 'NER-RAT-4219',
    cargo: 'Emergency Rice & Pulse Rations',
    risk_level: 'MODERATE',
    risk_score: 0.38,
    eta: '6:15 PM',
    lat: 25.4484,
    lng: 92.2135,
  },
  {
    id: 'veh-3',
    reg_number: 'NL-07-B-3199',
    type: 'BharatBenz Heavy Hill Hauler',
    driver: 'Kevichusa Angami',
    phone: '+91 98622 44319',
    status: 'Assigned',
    current_location: 'Guwahati Logistics Hub',
    destination: 'Kohima Supply Depot',
    speed: 0,
    fuel: 95,
    shipment_id: 'NER-FUL-1092',
    cargo: 'Aviation & Diesel Fuel Tanker',
    risk_level: 'LOW',
    risk_score: 0.18,
    eta: 'Tomorrow 10:00 AM',
    lat: 26.1445,
    lng: 91.7362,
  },
  {
    id: 'veh-4',
    reg_number: 'TR-01-G-9021',
    type: 'Mahindra Bolero Maxi Hill Truck',
    driver: 'Subrata Debbarma',
    phone: '+91 94365 12098',
    status: 'Delayed',
    current_location: 'Sonapur Tunnel Approach',
    destination: 'Agartala Central Depot',
    speed: 12,
    fuel: 62,
    shipment_id: 'NER-BLD-5501',
    cargo: 'Bailey Bridge Construction Steel',
    risk_level: 'CRITICAL',
    risk_score: 0.82,
    eta: 'Delay +3.5 hrs',
    lat: 25.1120,
    lng: 92.3610,
  },
  {
    id: 'veh-5',
    reg_number: 'SK-02-C-1144',
    type: 'Swaraj Mazda 4WD Hill Ambulance',
    driver: 'Karma Bhutia',
    phone: '+91 97330 99812',
    status: 'Available',
    current_location: 'Siliguri North Terminal',
    destination: 'Standby Fleet Yard',
    speed: 0,
    fuel: 100,
    shipment_id: 'None (Standby)',
    cargo: 'Rapid Disaster Medical Response Unit',
    risk_level: 'LOW',
    risk_score: 0.10,
    eta: 'Available on Call',
    lat: 26.7271,
    lng: 88.3953,
  },
  {
    id: 'veh-6',
    reg_number: 'MN-01-D-5522',
    type: 'Tata Signa All-Weather 6x6',
    driver: 'Tomba Singh',
    phone: '+91 98629 33418',
    status: 'Emergency',
    current_location: 'NH-37 Near Noney Bridge',
    destination: 'Imphal Relief Logistics Hub',
    speed: 18,
    fuel: 54,
    shipment_id: 'NER-EMG-9901',
    cargo: 'Emergency Oxygen Cylinders',
    risk_level: 'CRITICAL',
    risk_score: 0.88,
    eta: 'Priority Escort Active',
    lat: 24.8170,
    lng: 93.6500,
  },
];

const STATUS_BADGE = {
  'In Transit': { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  'Assigned':   { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
  'Available':  { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
  'Delayed':    { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  'Emergency':  { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
  'Offline':    { bg: '#f8fafc', color: '#94a3b8', border: '#e2e8f0' },
};

export const FleetPage = () => {
  const { showToast } = useApp();
  const [fleet, setFleet] = useState(INITIAL_FLEET);
  const [selectedVehicle, setSelectedVehicle] = useState(INITIAL_FLEET[0]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [isSimulating, setIsSimulating] = useState(false);
  const simRef = useRef(null);

  const filteredFleet = fleet.filter(v => {
    const matchesSearch = v.reg_number.toLowerCase().includes(search.toLowerCase()) ||
                          v.driver.toLowerCase().includes(search.toLowerCase()) ||
                          v.destination.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    const matchesRisk = riskFilter === 'ALL' || v.risk_level === riskFilter;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  const handleSimulateGPS = () => {
    if (isSimulating) {
      clearInterval(simRef.current);
      setIsSimulating(false);
      showToast('Live GPS fleet simulation stopped', 'info');
      return;
    }

    setIsSimulating(true);
    showToast('Simulating live GPS movement across mountain corridors...', 'info');

    simRef.current = setInterval(() => {
      setFleet(prev => prev.map(v => {
        if (v.status === 'In Transit' || v.status === 'Emergency') {
          const deltaLat = (Math.random() - 0.45) * 0.008;
          const deltaLng = (Math.random() - 0.45) * 0.008;
          return {
            ...v,
            lat: v.lat + deltaLat,
            lng: v.lng + deltaLng,
            speed: Math.max(15, Math.min(55, v.speed + Math.floor((Math.random() - 0.5) * 6))),
          };
        }
        return v;
      }));
    }, 2000);
  };

  useEffect(() => {
    return () => clearInterval(simRef.current);
  }, []);

  const shipmentsForMap = fleet.map(v => ({
    id: v.id,
    tracking_number: v.reg_number,
    current_location: { name: v.current_location, lat: v.lat, lng: v.lng },
    status: v.status,
    risk_level: v.risk_level,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="section-title" style={{ fontSize: 20, color: '#0f172a' }}>Fleet Operations & Live Telemetry</h2>
          <p className="section-subtitle">Real-time GPS vehicle tracking, driver communications & mountain speed monitoring</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={handleSimulateGPS}
            className={isSimulating ? 'btn-amber' : 'btn-emerald'}
            style={{ fontSize: '13px' }}
          >
            {isSimulating ? <Square size={14} /> : <Play size={14} />}
            <span>{isSimulating ? 'Stop Fleet Sim' : 'Simulate Fleet GPS'}</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
            placeholder="Search vehicle number, driver, destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>STATUS:</span>
          <select
            className="form-select"
            style={{ width: '140px', height: '38px', fontSize: '12.5px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="In Transit">In Transit</option>
            <option value="Assigned">Assigned</option>
            <option value="Available">Available</option>
            <option value="Delayed">Delayed</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>RISK:</span>
          <select
            className="form-select"
            style={{ width: '130px', height: '38px', fontSize: '12.5px' }}
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option value="ALL">All Risks</option>
            <option value="LOW">Low Risk</option>
            <option value="MODERATE">Moderate Risk</option>
            <option value="CRITICAL">Critical Risk</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Vehicles Table / Cards + Detail Drawer & Map */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedVehicle ? '1fr 380px' : '1fr', gap: '20px' }}>
        {/* Vehicles Table Card */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Fleet Directory ({filteredFleet.length} Active Vehicles)</span>
            {isSimulating && (
              <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#059669', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="ping-dot ping-dot-emerald" style={{ width: 7, height: 7 }} />
                Telemetry Streaming Live
              </span>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Current Location</th>
                  <th>Destination</th>
                  <th>Speed</th>
                  <th>Status</th>
                  <th>Risk</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFleet.map((v) => {
                  const isSelected = selectedVehicle?.id === v.id;
                  const sb = STATUS_BADGE[v.status] || STATUS_BADGE['Available'];
                  const rColor = v.risk_level === 'CRITICAL' ? '#dc2626' : v.risk_level === 'MODERATE' ? '#d97706' : '#059669';

                  return (
                    <tr
                      key={v.id}
                      onClick={() => setSelectedVehicle(v)}
                      style={{ background: isSelected ? '#eff6ff' : 'transparent', cursor: 'pointer' }}
                    >
                      <td>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>{v.reg_number}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{v.type}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{v.driver}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{v.phone}</div>
                      </td>
                      <td style={{ color: '#475569', fontSize: '12.5px' }}>{v.current_location}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{v.destination}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>ETA: {v.eta}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{v.speed} km/h</span>
                      </td>
                      <td>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '3px 8px',
                          borderRadius: '99px',
                          background: sb.bg,
                          color: sb.color,
                          border: `1px solid ${sb.border}`,
                        }}>
                          {v.status}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          color: rColor,
                        }}>
                          {v.risk_level} ({Math.round(v.risk_score * 100)}%)
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-ghost"
                          style={{ padding: '5px 10px', fontSize: '11.5px' }}
                          onClick={(e) => { e.stopPropagation(); setSelectedVehicle(v); }}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Vehicle Detail Drawer */}
        {selectedVehicle && (
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '700' }}>
                  Telemetry Drawer
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                  {selectedVehicle.reg_number}
                </h3>
                <p style={{ fontSize: '12px', color: '#475569' }}>{selectedVehicle.type}</p>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '10.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Current Speed</div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{selectedVehicle.speed} km/h</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '10.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Fuel Tank Level</div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#059669', marginTop: '2px' }}>{selectedVehicle.fuel}% Fuel</div>
              </div>
            </div>

            {/* Shipment and Driver Information */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '10px 12px', borderRadius: '10px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: '700', textTransform: 'uppercase' }}>Assigned Cargo Consignment</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>{selectedVehicle.shipment_id}</div>
                <div style={{ fontSize: '12px', color: '#334155' }}>{selectedVehicle.cargo}</div>
              </div>

              <div style={{ padding: '10px 12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Convoy Pilot & Comms</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>{selectedVehicle.driver}</div>
                <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>{selectedVehicle.phone}</div>
              </div>
            </div>

            {/* Embedded Mini Map for this vehicle */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', height: '200px' }}>
              <NERMap
                shipments={[{
                  id: selectedVehicle.id,
                  tracking_number: selectedVehicle.reg_number,
                  current_location: { name: selectedVehicle.current_location, lat: selectedVehicle.lat, lng: selectedVehicle.lng },
                  status: selectedVehicle.status,
                  risk_level: selectedVehicle.risk_level,
                }]}
                center={[selectedVehicle.lat, selectedVehicle.lng]}
                zoom={9}
                height="200px"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
