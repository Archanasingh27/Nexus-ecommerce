import React, { useState, useEffect, useRef } from 'react';
import {
  FiNavigation,
  FiMapPin,
  FiTruck,
  FiPlay,
  FiPause,
  FiRefreshCw,
  FiCompass,
  FiCheckCircle,
} from 'react-icons/fi';

// Indore Coordinates Reference Points
const INDORE_CENTRAL = [22.7196, 75.8577];

export const LiveRouteMap = ({
  order,
  socket,
  riderId,
  onLocationUpdate,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const polylineRef = useRef(null);
  const simIntervalRef = useRef(null);

  const [isSimulating, setIsSimulating] = useState(false);
  const [gpsActive, setGpsActive] = useState(true);
  const [currentCoordIndex, setCurrentCoordIndex] = useState(0);

  // Sample Waypoints across Indore from Scheme 54 / Vijay Nagar to Palasia / Bhawarkua
  const routePoints = [
    [22.7533, 75.8937], // Vendor Store (Scheme 54, Indore)
    [22.7482, 75.8912],
    [22.7420, 75.8885],
    [22.7355, 75.8840],
    [22.7280, 75.8790], // In-Transit (MR 9 / Industry House)
    [22.7215, 75.8740],
    [22.7160, 75.8690],
    [22.7100, 75.8640], // Palasia / Old City
    [22.7040, 75.8590],
    [22.6980, 75.8540], // Customer Doorstep (Indore South)
  ];

  const storeLocation = routePoints[0];
  const customerLocation = routePoints[routePoints.length - 1];
  const currentRiderPos = routePoints[currentCoordIndex];

  // Load Leaflet dynamically if not loaded
  useEffect(() => {
    const loadLeaflet = async () => {
      if (!window.L) {
        // Inject Leaflet CSS
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Inject Leaflet JS
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
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const initMap = () => {
    if (!window.L || !mapContainerRef.current || mapInstanceRef.current) return;

    const L = window.L;

    // Initialize Map centered on Indore
    const map = L.map(mapContainerRef.current, {
      center: storeLocation,
      zoom: 13,
      zoomControl: true,
    });
    mapInstanceRef.current = map;

    // OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
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

    // Add Markers
    const storeMarker = L.marker(storeLocation, { icon: storeIcon })
      .addTo(map)
      .bindPopup(`<b>Pickup Store:</b> ${order?.vendorStoreName || order?.vendors?.[0]?.storeName || 'Vendor Warehouse'}`);

    const customerMarker = L.marker(customerLocation, { icon: customerIcon })
      .addTo(map)
      .bindPopup(`<b>Destination:</b> ${order?.shippingAddress?.street || 'Customer Address'}`);

    const riderMarker = L.marker(currentRiderPos, { icon: riderIcon })
      .addTo(map)
      .bindPopup(`<b>Your Live GPS:</b> Active Dispatch Rider`);

    markersRef.current = {
      store: storeMarker,
      customer: customerMarker,
      rider: riderMarker,
    };

    // Draw Polyline Path
    const polyline = L.polyline(routePoints, {
      color: '#0d9488',
      weight: 4,
      opacity: 0.8,
      dashArray: '8, 8',
    }).addTo(map);
    polylineRef.current = polyline;

    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
  };

  // Broadcast coordinate update
  const emitLocationTick = (pos) => {
    if (!socket || !order?._id) return;

    const locationPayload = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      riderId,
      userId: order.user?._id || order.user,
      lat: pos[0],
      lng: pos[1],
      heading: 180,
      speed: 28, // km/h
      timestamp: new Date().toISOString(),
    };

    socket.emit('rider_location_update', locationPayload);
    if (onLocationUpdate) onLocationUpdate(locationPayload);
  };

  // Update Rider Marker on map whenever coord changes
  useEffect(() => {
    if (markersRef.current.rider && window.L) {
      const pos = routePoints[currentCoordIndex];
      markersRef.current.rider.setLatLng(pos);
      emitLocationTick(pos);
    }
  }, [currentCoordIndex]);

  // Simulation loop
  const toggleSimulation = () => {
    if (isSimulating) {
      clearInterval(simIntervalRef.current);
      setIsSimulating(false);
    } else {
      setIsSimulating(true);
      simIntervalRef.current = setInterval(() => {
        setCurrentCoordIndex((prev) => {
          if (prev >= routePoints.length - 1) {
            return 0; // Loop back
          }
          return prev + 1;
        });
      }, 3000);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs bg-white space-y-2">
      {/* Map Control Bar */}
      <div className="p-3 bg-gradient-to-r from-slate-900 to-teal-950 text-white flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
          <span className="font-extrabold tracking-wide">Live GPS Navigation Route (Indore)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSimulation}
            className={`px-3 py-1 rounded-xl font-extrabold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
              isSimulating
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                : 'bg-teal-600 hover:bg-teal-500 text-white shadow-xs'
            }`}
          >
            {isSimulating ? (
              <>
                <FiPause className="w-3.5 h-3.5" /> Pause GPS Simulation
              </>
            ) : (
              <>
                <FiPlay className="w-3.5 h-3.5" /> Start Live Route Simulation
              </>
            )}
          </button>

          <button
            onClick={() => {
              setCurrentCoordIndex((prev) => (prev + 1) % routePoints.length);
            }}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Step Forward 1 GPS Tick"
          >
            <FiCompass className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-64 sm:h-72 z-0" />

      {/* Bottom Route Status Pill */}
      <div className="px-4 py-2.5 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-700 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-amber-700 font-bold">
            🏪 Store: Scheme 54
          </span>
          <span className="text-slate-300">➔</span>
          <span className="flex items-center gap-1 text-teal-700 font-bold">
            🚴 Rider GPS: Step {currentCoordIndex + 1}/{routePoints.length}
          </span>
          <span className="text-slate-300">➔</span>
          <span className="flex items-center gap-1 text-emerald-700 font-bold">
            🏠 Customer: Indore
          </span>
        </div>
        <div className="text-[11px] text-teal-800 font-mono font-black bg-teal-100/80 px-2 py-0.5 rounded-md">
          {currentCoordIndex === routePoints.length - 1 ? 'ARRIVED AT DESTINATION' : 'IN TRANSIT (28 km/h)'}
        </div>
      </div>
    </div>
  );
};
