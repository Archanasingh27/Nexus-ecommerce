import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import {
  FiTruck,
  FiMapPin,
  FiNavigation,
  FiClock,
  FiPhone,
  FiCompass,
} from 'react-icons/fi';

export const OrderLiveTrackingMap = ({ order }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const polylineRef = useRef(null);

  const [riderCoords, setRiderCoords] = useState([22.7355, 75.884]);
  const [speed, setSpeed] = useState(28);
  const [lastUpdated, setLastUpdated] = useState('Live now');
  const [etaMinutes, setEtaMinutes] = useState(14);

  // Default Indore Coordinate waypoints
  const storeLocation = [22.7533, 75.8937]; // Scheme 54, Indore
  const customerLocation = [22.698, 75.854]; // Indore Destination

  const defaultRoute = [
    [22.7533, 75.8937],
    [22.7482, 75.8912],
    [22.742, 75.8885],
    [22.7355, 75.884],
    [22.728, 75.879],
    [22.7215, 75.874],
    [22.716, 75.869],
    [22.71, 75.864],
    [22.704, 75.859],
    [22.698, 75.854],
  ];

  // Initialize Map
  useEffect(() => {
    const loadLeaflet = () => {
      if (!window.L) {
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        if (!document.getElementById('leaflet-js')) {
          const script = document.createElement('script');
          script.id = 'leaflet-js';
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => initMap();
          document.body.appendChild(script);
          return;
        }
      } else {
        initMap();
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const initMap = () => {
    if (!window.L || !mapContainerRef.current || mapInstanceRef.current) return;

    const L = window.L;

    const map = L.map(mapContainerRef.current, {
      center: riderCoords,
      zoom: 13,
      zoomControl: true,
    });
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    // Custom Icons
    const storeIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="background-color: #f59e0b; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
          🏪
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const customerIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="background-color: #10b981; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
          🏠
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const riderIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="background-color: #0d9488; color: white; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 3px solid white; box-shadow: 0 4px 14px rgba(13,148,136,0.6); animation: pulse 2s infinite;">
          🚴
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });

    // Markers
    L.marker(storeLocation, { icon: storeIcon })
      .addTo(map)
      .bindPopup(`<b>Dispatched Store:</b> ${order?.vendors?.[0]?.storeName || 'Merchant Store'}`);

    L.marker(customerLocation, { icon: customerIcon })
      .addTo(map)
      .bindPopup(`<b>Your Address:</b> ${order?.shippingAddress?.street || 'Indore'}`);

    const riderMarker = L.marker(riderCoords, { icon: riderIcon })
      .addTo(map)
      .bindPopup(`<b>Courier:</b> ${order?.deliveryPartner?.name || 'Express Rider'}`);
    riderMarkerRef.current = riderMarker;

    // Polyline Route
    const polyline = L.polyline(defaultRoute, {
      color: '#0d9488',
      weight: 4,
      opacity: 0.85,
      dashArray: '8, 8',
    }).addTo(map);
    polylineRef.current = polyline;

    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
  };

  // Socket.IO Listener for live GPS ticks
  useEffect(() => {
    if (!order?._id) return;

    const socketUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
      : 'http://localhost:5000';

    const socket = io(socketUrl, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 2,
      timeout: 4000,
    });

    socket.on('connect_error', () => {
      // Graceful fallback for serverless hosting
    });

    socket.emit('join_order_tracking', order._id);

    const handleLocationUpdate = (payload) => {
      if (payload.lat && payload.lng) {
        const newCoords = [payload.lat, payload.lng];
        setRiderCoords(newCoords);
        if (payload.speed) setSpeed(payload.speed);
        setLastUpdated('Updated just now');

        if (riderMarkerRef.current && window.L) {
          riderMarkerRef.current.setLatLng(newCoords);
        }
      }
    };

    socket.on('rider_location_updated', handleLocationUpdate);
    socket.on(`tracking_${order._id}`, handleLocationUpdate);

    return () => {
      socket.disconnect();
    };
  }, [order?._id]);

  const recenterMap = () => {
    if (mapInstanceRef.current && riderCoords) {
      mapInstanceRef.current.setView(riderCoords, 14, { animate: true });
    }
  };

  return (
    <div className="rounded-3xl border border-teal-200/80 overflow-hidden shadow-lg bg-white space-y-2 animate-in fade-in">
      {/* Header Info */}
      <div className="p-4 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
          <div>
            <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
              <span>Live Parcel Tracking</span>
              <span className="bg-teal-500/30 text-teal-300 font-mono text-[10px] px-2 py-0.2 rounded-full border border-teal-400/30">
                GPS Active
              </span>
            </div>
            <p className="text-[11px] text-teal-200/80">Turn-by-turn routing in Indore</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1 bg-white/10 rounded-xl font-bold text-[11px] flex items-center gap-1.5">
            <FiClock className="text-teal-300 w-3.5 h-3.5" />
            <span>ETA: ~{etaMinutes} mins ({speed} km/h)</span>
          </div>

          <button
            onClick={recenterMap}
            className="p-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/40 text-white transition-colors cursor-pointer"
            title="Recenter on Delivery Rider"
          >
            <FiCompass className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-64 sm:h-80 z-0" />

      {/* Footer Details */}
      <div className="px-4 py-3 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border-t border-slate-100">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <span className="text-amber-700">🏪 Apex Warehouse</span>
          <span className="text-slate-400">➔</span>
          <span className="text-teal-700 font-bold">🚴 Rider: {order?.deliveryPartner?.name || 'Express Courier'}</span>
          <span className="text-slate-400">➔</span>
          <span className="text-emerald-700">🏠 Destination</span>
        </div>

        {order?.deliveryPartner?.phone && (
          <a
            href={`tel:${order.deliveryPartner.phone}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl font-bold text-[11px] border border-teal-200 transition-colors shrink-0 self-start sm:self-auto"
          >
            <FiPhone className="w-3 h-3 text-teal-600" />
            <span>Call Rider ({order.deliveryPartner.phone})</span>
          </a>
        )}
      </div>
    </div>
  );
};
