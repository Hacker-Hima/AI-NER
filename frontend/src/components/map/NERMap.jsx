import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export const NERMap = ({
  shipments = [],
  incidents = [],
  routes = [],
  selectedShipment = null,
  onMapClick = null,
  center = [26.1445, 92.5],
  zoom = 7,
  height = '500px'
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({
    markers: L.layerGroup(),
    routes: L.layerGroup(),
    incidents: L.layerGroup()
  });

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: false,
      });

      // CartoDB Dark Matter / Positron or Standard OSM with dark CSS filter
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | NER Intelligence',
        maxZoom: 18,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      layersRef.current.routes.addTo(map);
      layersRef.current.incidents.addTo(map);
      layersRef.current.markers.addTo(map);

      if (onMapClick) {
        map.on('click', (e) => {
          onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
        });
      }

      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup handled on component unmount
    };
  }, []);

  // Update Click Listener when onMapClick changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.off('click');
    if (onMapClick) {
      map.on('click', (e) => {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
    }
  }, [onMapClick]);

  // Render Routes (Polylines)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    layersRef.current.routes.clearLayers();

    routes.forEach((routeItem) => {
      const coords = routeItem.geometry; // [[lng, lat], ...]
      if (!coords || coords.length === 0) return;

      const latLngs = coords.map((c) => [c[1], c[0]]);

      const isSafeAlt = routeItem.is_safe_alternative;
      const riskLevel = routeItem.risk_level;

      const color = isSafeAlt
        ? '#10b981' // Emerald
        : riskLevel === 'CRITICAL'
        ? '#f43f5e' // Rose
        : riskLevel === 'MODERATE'
        ? '#f59e0b' // Amber
        : '#06b6d4'; // Cyan

      const polyline = L.polyline(latLngs, {
        color: color,
        weight: isSafeAlt ? 5 : 4,
        opacity: 0.85,
        dashArray: isSafeAlt ? null : '6, 6',
      });

      polyline.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
          <strong style="color: ${color};">${isSafeAlt ? 'SAFE ALTERNATIVE ROUTE' : 'STANDARD HIGHWAY ROUTE'}</strong><br/>
          <span>Distance: <b>${routeItem.distance_km} km</b></span><br/>
          <span>Est. Transit: <b>${routeItem.predicted_duration_mins} mins</b></span><br/>
          <span>AI Risk Level: <b style="color: ${color};">${riskLevel}</b></span>
        </div>
      `);

      layersRef.current.routes.addLayer(polyline);
    });
  }, [routes]);

  // Render Incidents (Landslides, Floods, Cavitations)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    layersRef.current.incidents.clearLayers();

    incidents.forEach((inc) => {
      if (inc.status === 'RESOLVED') return;

      const isCritical = inc.severity === 'CRITICAL';
      const iconHtml = `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
        ">
          <div style="
            position: absolute;
            width: 100%;
            height: 100%;
            background-color: ${isCritical ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'};
            border-radius: 50%;
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
          <div style="
            position: relative;
            background: ${isCritical ? '#ef4444' : '#f59e0b'};
            color: #ffffff;
            font-size: 14px;
            font-weight: bold;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5);
            border: 2px solid #ffffff;
          ">
            ⚠️
          </div>
        </div>
      `;

      const hazardIcon = L.divIcon({
        className: 'custom-hazard-marker',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([inc.lat, inc.lng], { icon: hazardIcon });
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #f8fafc;">
          <div style="font-weight: bold; color: ${isCritical ? '#f87171' : '#fbbf24'}; margin-bottom: 4px;">
            [${inc.category}] ${inc.title}
          </div>
          <div style="color: #cbd5e1; margin-bottom: 4px;">${inc.landmark}</div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">${inc.description}</div>
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b;">
            <span>Severity: <b style="color: #f8fafc;">${inc.severity}</b></span>
            <span>Verifications: <b style="color: #10b981;">${inc.verification_count || 1}</b></span>
          </div>
        </div>
      `);

      layersRef.current.incidents.addLayer(marker);
    });
  }, [incidents]);

  // Render Shipments & Moving Trucks
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    layersRef.current.markers.clearLayers();

    shipments.forEach((s) => {
      const lat = s.current_location?.lat || s.origin?.lat;
      const lng = s.current_location?.lng || s.origin?.lng;
      if (!lat || !lng) return;

      const isSelected = selectedShipment && selectedShipment.id === s.id;
      const isCritical = s.risk_level === 'CRITICAL';

      const truckHtml = `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
        ">
          ${isSelected ? `
            <div style="
              position: absolute;
              width: 44px;
              height: 44px;
              border: 2px dashed #10b981;
              border-radius: 50%;
              animation: spin 3s linear infinite;
            "></div>
          ` : ''}
          <div style="
            width: 28px;
            height: 28px;
            background: ${isCritical ? '#dc2626' : isSelected ? '#10b981' : '#0284c7'};
            border: 2px solid #ffffff;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.4);
            transform: scale(${isSelected ? '1.15' : '1.0'});
            transition: transform 0.2s ease;
          ">
            🚚
          </div>
        </div>
      `;

      const truckIcon = L.divIcon({
        className: 'custom-truck-marker',
        html: truckHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([lat, lng], { icon: truckIcon });
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #f8fafc; min-width: 180px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="color: #38bdf8;">${s.tracking_number}</strong>
            <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: ${s.status === 'IN_TRANSIT' ? '#065f46' : '#1e293b'}; color: #6ee7b7;">
              ${s.status}
            </span>
          </div>
          <div style="color: #e2e8f0; font-weight: 500; font-size: 11px;">${s.cargo_type} (${s.weight_tonnes}T)</div>
          <div style="font-size: 11px; color: #94a3b8; margin: 4px 0;">
            ${s.origin?.name} ➔ ${s.destination?.name}
          </div>
          <div style="font-size: 11px; color: ${isCritical ? '#f87171' : '#4ade80'};">
            AI Disruption Risk: <b>${Math.round(s.risk_score * 100)}% (${s.risk_level})</b>
          </div>
          ${s.estimated_delay_mins > 0 ? `
            <div style="font-size: 10px; color: #fbbf24; margin-top: 2px;">
              Expected Transit Delay: +${s.estimated_delay_mins} mins
            </div>
          ` : ''}
        </div>
      `);

      layersRef.current.markers.addLayer(marker);
    });
  }, [shipments, selectedShipment]);

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: 14, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', background: '#f8fafc' }}>
      <div ref={mapContainerRef} style={{ height: height, width: '100%' }} />
      {/* Visual map legend overlay */}
      <div style={{
        position: 'absolute', bottom: 14, left: 14, zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)',
        border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: 10,
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)', fontSize: 11.5,
        color: '#334155', display: 'flex', flexDirection: 'column', gap: 6,
        pointerEvents: 'auto'
      }}>
        <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid #e2e8f0', paddingBottom: 5 }}>
          <span>Map Intelligence Layers</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: '#0284c7', display: 'inline-block' }}></span>
          <span>Active Supply Truck</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#dc2626', display: 'inline-block' }}></span>
          <span>Landslide / Disruption Hazard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 16, height: 2, borderTop: '2px dashed #dc2626', display: 'inline-block' }}></span>
          <span>High Risk National Highway</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 16, height: 3, background: '#059669', borderRadius: 2, display: 'inline-block' }}></span>
          <span>Recommended Safe Alternative</span>
        </div>
      </div>
    </div>
  );
};
