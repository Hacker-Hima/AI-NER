import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { NERMap } from '../../components/map/NERMap';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { 
  AlertTriangle, 
  Plus, 
  CheckCircle, 
  MapPin, 
  ThumbsUp, 
  ShieldAlert, 
  X, 
  Clock 
} from 'lucide-react';

export const IncidentsPage = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    category: 'LANDSLIDE',
    severity: 'CRITICAL',
    lat: 27.25,
    lng: 92.40,
    landmark: 'NH-13 Mountain Pass Km 42',
    description: 'Boulders and slope debris covering road width.'
  });

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/incidents/');
      setIncidents(res.data);
    } catch (err) {
      console.error("Failed to load incidents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleReport = async (e) => {
    e.preventDefault();
    try {
      await api.post('/incidents/', {
        title: form.title,
        category: form.category,
        severity: form.severity,
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
        landmark: form.landmark,
        description: form.description
      });
      setIsModalOpen(false);
      fetchIncidents();
      alert("Disruption reported successfully. Verified alerts will automatically warn active logistics convoys.");
    } catch (err) {
      alert("Failed to report disruption.");
    }
  };

  const handleVerify = async (id) => {
    try {
      await api.patch(`/incidents/${id}/verify`);
      fetchIncidents();
    } catch (err) {
      console.error("Verification failed:", err);
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.patch(`/incidents/${id}/resolve`);
      fetchIncidents();
    } catch (err) {
      console.error("Resolution failed:", err);
    }
  };

  const handleMapClick = (coords) => {
    setForm(prev => ({
      ...prev,
      lat: parseFloat(coords.lat.toFixed(4)),
      lng: parseFloat(coords.lng.toFixed(4))
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
            Road Disruption & Hazard Intelligence Board
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Crowdsourced and official monitoring of mountain landslides, flash floods, and bridge damages across the 8 NER states.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold shadow-lg shadow-rose-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          Report Road Disruption
        </button>
      </div>

      {/* Map & List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Incident Cards (6 cols) */}
        <div className="lg:col-span-6 space-y-3 max-h-[680px] overflow-y-auto pr-1">
          {incidents.map((inc) => {
            const isCrit = inc.severity === 'CRITICAL';
            const isResolved = inc.status === 'RESOLVED';

            return (
              <div
                key={inc.id}
                className={`p-4 rounded-xl border transition ${
                  isResolved
                    ? 'bg-slate-900/30 border-slate-800 opacity-60'
                    : isCrit
                    ? 'bg-slate-900/80 border-rose-900/50 hover:border-rose-700/60 shadow-md shadow-rose-900/10'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100">{inc.title}</span>
                      <Badge variant={isCrit ? 'danger' : 'warning'}>{inc.severity}</Badge>
                    </div>
                    <div className="text-xs text-slate-300 font-medium mt-1">{inc.landmark}</div>
                  </div>
                  <Badge variant={isResolved ? 'default' : inc.status === 'VERIFIED' ? 'success' : 'warning'}>
                    {inc.status}
                  </Badge>
                </div>

                <p className="text-xs text-slate-400 mt-2">{inc.description}</p>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{inc.lat.toFixed(3)}°N, {inc.lng.toFixed(3)}°E</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isResolved && (
                      <button
                        onClick={() => handleVerify(inc.id)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1 transition"
                        title="Confirm hazard is active"
                      >
                        <ThumbsUp className="w-3 h-3 text-emerald-400" />
                        Verify ({inc.verification_count || 1})
                      </button>
                    )}
                    {!isResolved && (user?.role === 'admin' || user?.role === 'logistics_coordinator') && (
                      <button
                        onClick={() => handleResolve(inc.id)}
                        className="px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[11px] font-medium transition"
                      >
                        Mark Cleared
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Hazard Map (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Visualizing Active Road Hazards & Landslides</span>
            <span className="text-rose-400">Click anywhere on the map to set report coordinates</span>
          </div>
          <NERMap
            incidents={incidents}
            onMapClick={handleMapClick}
            height="550px"
          />
        </div>

      </div>

      {/* Modal: Report Road Disruption */}
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
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Report Road Hazard / Landslide
            </h2>

            <form onSubmit={handleReport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Disruption Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Major Landslide blocking both lanes on NH-29"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hazard Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                  >
                    <option value="LANDSLIDE">LANDSLIDE</option>
                    <option value="FLASH_FLOOD">FLASH FLOOD</option>
                    <option value="ROAD_DAMAGE">ROAD DAMAGE / CAVITATION</option>
                    <option value="SNOW_BLOCKAGE">SNOW BLOCKAGE</option>
                    <option value="PROTEST">CIVIL BLOCKADE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Severity Tier</label>
                  <select
                    value={form.severity}
                    onChange={e => setForm({ ...form, severity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                  >
                    <option value="CRITICAL">CRITICAL (Total Block)</option>
                    <option value="MODERATE">MODERATE (Single Lane)</option>
                    <option value="MINOR">MINOR (Slow Traffic)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Latitude (°N)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={form.lat}
                    onChange={e => setForm({ ...form, lat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Longitude (°E)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={form.lng}
                    onChange={e => setForm({ ...form, lng: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Highway / Kilometer Landmark</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., NH-6 Km 82, Sonapur Tunnel approach"
                  value={form.landmark}
                  onChange={e => setForm({ ...form, landmark: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Observed Road Condition</label>
                <textarea
                  rows="2"
                  required
                  placeholder="Describe obstruction width, weather conditions, clearance efforts..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-rose-500"
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
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-medium hover:bg-rose-500 transition shadow-lg shadow-rose-600/20"
                >
                  Submit Disruption Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
