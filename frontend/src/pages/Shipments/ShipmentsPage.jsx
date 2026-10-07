import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { NERMap } from '../../components/map/NERMap';
import { 
  Truck, 
  Plus, 
  Play, 
  Square, 
  RotateCw, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  Navigation,
  X 
} from 'lucide-react';

const NER_HUBS = [
  { name: "Guwahati Central Depot (Assam)", lat: 26.1445, lng: 91.7362 },
  { name: "Tawang District Hospital (Arunachal)", lat: 27.5861, lng: 91.8594 },
  { name: "Silchar FCI Granary (Assam)", lat: 24.8333, lng: 92.7789 },
  { name: "Imphal Relief Logistics Hub (Manipur)", lat: 24.8170, lng: 93.9368 },
  { name: "Kohima Civil Supply Depot (Nagaland)", lat: 25.6751, lng: 94.1086 },
  { name: "Dimapur Railway Freight Yard (Nagaland)", lat: 25.9062, lng: 93.7271 },
  { name: "Shillong Health Department (Meghalaya)", lat: 25.5788, lng: 91.8933 },
  { name: "Aizawl Emergency Supplies Store (Mizoram)", lat: 23.7271, lng: 92.7176 },
  { name: "Agartala State Depot (Tripura)", lat: 23.8315, lng: 91.2868 },
  { name: "Gangtok Hill Supply Center (Sikkim)", lat: 27.3389, lng: 88.6065 }
];

export const ShipmentsPage = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    cargo_type: 'Critical Vaccines & Medical Supplies',
    priority: 'CRITICAL',
    weight_tonnes: 3.5,
    originIndex: 0,
    destinationIndex: 1,
    notes: 'Urgent mountain transit dispatch'
  });

  // Telemetry Simulation State
  const [simulatingId, setSimulatingId] = useState(null);
  const [simInterval, setSimInterval] = useState(null);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/shipments/');
      setShipments(res.data);
      if (res.data.length > 0 && !selectedShipment) {
        setSelectedShipment(res.data[0]);
      }
    } catch (err) {
      console.error("Failed to load shipments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  // Fetch route when shipment selection changes
  useEffect(() => {
    if (!selectedShipment) return;
    const fetchRoute = async () => {
      try {
        const res = await api.get(`/routes/shipment/${selectedShipment.id}`);
        if (res.data && res.data.standard_route) {
          setActiveRoute(res.data.standard_route);
        }
      } catch (err) {
        // Fallback synthetic route between origin and dest
        const origin = selectedShipment.origin;
        const dest = selectedShipment.destination;
        if (origin && dest) {
          setActiveRoute({
            geometry: [[origin.lng, origin.lat], [dest.lng, dest.lat]],
            distance_km: 240,
            predicted_duration_mins: 320,
            risk_level: selectedShipment.risk_level,
            is_safe_alternative: selectedShipment.status === 'REROUTED'
          });
        }
      }
    };
    fetchRoute();
  }, [selectedShipment]);

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    try {
      const originHub = NER_HUBS[form.originIndex];
      const destHub = NER_HUBS[form.destinationIndex];

      const payload = {
        cargo_type: form.cargo_type,
        priority: form.priority,
        weight_tonnes: parseFloat(form.weight_tonnes),
        origin: { name: originHub.name, lat: originHub.lat, lng: originHub.lng },
        destination: { name: destHub.name, lat: destHub.lat, lng: destHub.lng },
        notes: form.notes
      };

      await api.post('/shipments/', payload);
      setIsModalOpen(false);
      fetchShipments();
    } catch (err) {
      alert("Failed to create shipment. Please verify input.");
    }
  };

  // Start GPS Simulation
  const toggleSimulation = (shipment) => {
    if (simulatingId === shipment.id) {
      // Stop
      clearInterval(simInterval);
      setSimInterval(null);
      setSimulatingId(null);
      return;
    }

    // Start simulation
    setSimulatingId(shipment.id);
    let step = 0;
    const totalSteps = 20;
    const oLat = shipment.origin.lat;
    const oLng = shipment.origin.lng;
    const dLat = shipment.destination.lat;
    const dLng = shipment.destination.lng;

    const interval = setInterval(async () => {
      step = (step + 1) % totalSteps;
      const t = step / totalSteps;
      const currentLat = oLat + (dLat - oLat) * t + Math.sin(t * Math.PI) * 0.05;
      const currentLng = oLng + (dLng - oLng) * t;

      try {
        await api.post(`/shipments/${shipment.id}/telemetry`, {
          lat: currentLat,
          lng: currentLng
        });

        // Update local state smoothly
        setShipments(prev => prev.map(s => {
          if (s.id === shipment.id) {
            return {
              ...s,
              status: 'IN_TRANSIT',
              current_location: { name: `Live GPS Waypoint (Step ${step})`, lat: currentLat, lng: currentLng }
            };
          }
          return s;
        }));

        if (selectedShipment?.id === shipment.id) {
          setSelectedShipment(prev => ({
            ...prev,
            status: 'IN_TRANSIT',
            current_location: { name: `Live GPS Waypoint (Step ${step})`, lat: currentLat, lng: currentLng }
          }));
        }
      } catch (err) {
        console.error("Telemetry push failed:", err);
      }
    }, 2500);

    setSimInterval(interval);
  };

  const handleReroute = async (shipmentId) => {
    try {
      await api.post(`/shipments/${shipmentId}/reroute`);
      fetchShipments();
      alert("Shipment successfully diverted to verified Safe Alternative Route bypassing mountain hazard.");
    } catch (err) {
      alert("Reroute request failed.");
    }
  };

  const filteredShipments = shipments.filter(s => {
    if (filter === 'ALL') return true;
    if (filter === 'CRITICAL') return s.priority === 'CRITICAL' || s.risk_level === 'CRITICAL';
    if (filter === 'IN_TRANSIT') return s.status === 'IN_TRANSIT';
    if (filter === 'DELIVERED') return s.status === 'DELIVERED';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-400" />
            Essential Supply Shipments & Convoys
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage critical cargo, track moving trucks along Himalayan passes, and execute dynamic hazard rerouting.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          Dispatch New Supply Convoy
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {['ALL', 'CRITICAL', 'IN_TRANSIT', 'DELIVERED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === tab
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Main Grid: Shipments List (Left) + Selected Shipment Live Map (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Shipment Cards List (5 cols) */}
        <div className="lg:col-span-5 space-y-3 max-h-[700px] overflow-y-auto pr-1">
          {filteredShipments.map((s) => {
            const isSelected = selectedShipment?.id === s.id;
            const isCrit = s.priority === 'CRITICAL' || s.risk_level === 'CRITICAL';
            const isSimulating = simulatingId === s.id;

            return (
              <div
                key={s.id}
                onClick={() => setSelectedShipment(s)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-500/5'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100">{s.tracking_number}</span>
                      <Badge variant={isCrit ? 'danger' : 'info'}>{s.priority}</Badge>
                    </div>
                    <div className="text-xs text-slate-300 font-medium mt-1">{s.cargo_type} ({s.weight_tonnes} T)</div>
                  </div>
                  <Badge variant={s.status === 'IN_TRANSIT' ? 'success' : s.status === 'DELIVERED' ? 'default' : 'warning'}>
                    {s.status}
                  </Badge>
                </div>

                <div className="mt-3 text-xs text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                    <span>From: {s.origin.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>To: {s.destination.name}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">AI Risk: </span>
                    <span className={`font-semibold ${isCrit ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {Math.round(s.risk_score * 100)}% ({s.risk_level})
                    </span>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {s.status !== 'DELIVERED' && (
                      <button
                        onClick={() => toggleSimulation(s)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition ${
                          isSimulating
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                        title="Simulate GPS Coordinates Playback"
                      >
                        {isSimulating ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        {isSimulating ? 'Stop GPS' : 'Simulate GPS'}
                      </button>
                    )}
                    {s.risk_level === 'CRITICAL' && s.status !== 'REROUTED' && (
                      <button
                        onClick={() => handleReroute(s.id)}
                        className="px-2.5 py-1 rounded text-[11px] font-semibold bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 transition"
                      >
                        Reroute
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Shipment Details & Map Tracker (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedShipment ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-100">{selectedShipment.tracking_number}</h2>
                    <Badge variant={selectedShipment.risk_level === 'CRITICAL' ? 'danger' : 'success'}>
                      {selectedShipment.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">Driver: {selectedShipment.assigned_driver_name}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">AI Expected Delay</div>
                  <div className="text-sm font-bold text-amber-400">+{selectedShipment.estimated_delay_mins} mins</div>
                </div>
              </div>

              {/* Map tracking the selected shipment */}
              <NERMap
                shipments={[selectedShipment]}
                routes={activeRoute ? [activeRoute] : []}
                selectedShipment={selectedShipment}
                height="400px"
              />

              {/* Notes & Risk Guidance */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Corridor Intelligence Notes:
                </div>
                <p className="text-slate-400">{selectedShipment.notes || "No special mountain transit advisories for this corridor."}</p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
              Select a shipment on the left to inspect its live GIS trajectory.
            </div>
          )}
        </div>

      </div>

      {/* Modal: Dispatch New Consignment */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-emerald-400" />
              Dispatch New Essential Supply Convoy
            </h2>

            <form onSubmit={handleCreateShipment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cargo Type</label>
                <input
                  type="text"
                  required
                  value={form.cargo_type}
                  onChange={e => setForm({ ...form, cargo_type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="NORMAL">NORMAL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Weight (Tonnes)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="35"
                    value={form.weight_tonnes}
                    onChange={e => setForm({ ...form, weight_tonnes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Origin Logistics Depot</label>
                <select
                  value={form.originIndex}
                  onChange={e => setForm({ ...form, originIndex: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {NER_HUBS.map((hub, idx) => (
                    <option key={hub.name} value={idx}>{hub.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Destination Node</label>
                <select
                  value={form.destinationIndex}
                  onChange={e => setForm({ ...form, destinationIndex: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {NER_HUBS.map((hub, idx) => (
                    <option key={hub.name} value={idx}>{hub.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Transit Instructions</label>
                <textarea
                  rows="2"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition shadow-lg shadow-emerald-600/20"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
