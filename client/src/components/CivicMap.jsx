import React, { useEffect, useRef, useCallback } from "react";
import L from "leaflet";

// ─── Custom map pin icon (avoids Leaflet's broken default image URLs in bundlers) ──
const createCustomIcon = (color = "#2563EB") =>
  L.divIcon({
    className: "",
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;width:36px;height:36px;">
        <div style="position:absolute;width:36px;height:36px;background-color:${color}33;border-radius:50%;animation:ping 2s cubic-bezier(0,0,.2,1) infinite;"></div>
        <div style="position:relative;width:28px;height:28px;background:linear-gradient(135deg,${color},#1D4ED8);border-radius:50%;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:#fff;">
          <svg style="width:14px;height:14px;fill:currentColor;" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -22],
  });

// ─── Reverse geocode via OSM Nominatim ───────────────────────────────────────
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`;
  }
}

// ─── CivicMap component ───────────────────────────────────────────────────────
export function CivicMap({
  coordinates,       // [lng, lat] geoJSON order
  reports = [],      // array of report objects to plot
  address,
  onLocationSelect,  // (lat, lng, address) => void — called when pin moves
  className = "",
  interactive = false,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);       // Leaflet map instance
  const pinRef = useRef(null);       // Primary draggable pin
  const onLocationSelectRef = useRef(onLocationSelect);

  // Keep callback ref fresh so the map click handler always has the latest version
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  // Parse coordinates: [lng, lat] → Leaflet wants [lat, lng]
  const lng = Array.isArray(coordinates) && coordinates.length === 2 ? coordinates[0] : 73.8567;
  const lat = Array.isArray(coordinates) && coordinates.length === 2 ? coordinates[1] : 18.5204;

  // ── Initialize map once ────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 14,
      zoomControl: false,
      // Prevent touch events from scrolling the page through the map
      dragging: true,
      tap: true,
    });

    // Real OpenStreetMap tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Primary location pin
    const pin = L.marker([lat, lng], {
      icon: createCustomIcon("#2563EB"),
      draggable: interactive,
    }).addTo(map);

    if (address) pin.bindPopup(`<b>Civic Location</b><br/>${address}`);

    // Drag end → reverse geocode and notify parent
    if (interactive) {
      pin.on("dragend", async () => {
        const pos = pin.getLatLng();
        const addr = await reverseGeocode(pos.lat, pos.lng);
        onLocationSelectRef.current?.(pos.lat, pos.lng, addr);
      });

      // Map click → move pin, reverse geocode
      map.on("click", async (e) => {
        pin.setLatLng(e.latlng);
        const addr = await reverseGeocode(e.latlng.lat, e.latlng.lng);
        onLocationSelectRef.current?.(e.latlng.lat, e.latlng.lng, addr);
      });
    }

    mapRef.current = map;
    pinRef.current = pin;

    // Cleanup on unmount
    return () => {
      map.remove();
      mapRef.current = null;
      pinRef.current = null;
    };
  }, []); // intentionally empty — runs once only

  // ── Sync pin position when coordinates prop changes ────────────────────────
  useEffect(() => {
    if (!mapRef.current || !pinRef.current) return;
    const newLatLng = L.latLng(lat, lng);
    pinRef.current.setLatLng(newLatLng);
    mapRef.current.setView(newLatLng, mapRef.current.getZoom(), { animate: true });
  }, [lat, lng]);

  // ── Plot report markers from feed ─────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !reports.length) return;

    const markers = [];
    reports.forEach((report) => {
      const coords = report.location?.coordinates;
      if (!Array.isArray(coords) || coords.length !== 2) return;

      const [rLng, rLat] = coords;
      const isResolved = report.status === "RESOLVED" || report.status === "CLOSED";
      const m = L.marker([rLat, rLng], {
        icon: createCustomIcon(isResolved ? "#16A34A" : "#DC2626"),
      }).addTo(mapRef.current);

      m.bindPopup(`
        <div style="font-family:sans-serif;padding:4px;max-width:180px;">
          <strong style="font-size:13px;color:#1E293B;">${report.title}</strong><br/>
          <span style="font-size:11px;color:#64748B;">${report.category}</span><br/>
          <span style="font-size:11px;font-weight:700;color:${isResolved ? "#16A34A" : "#2563EB"};">${report.status}</span>
        </div>`);

      markers.push(m);
    });

    return () => {
      if (mapRef.current) markers.forEach((m) => mapRef.current.removeLayer(m));
    };
  }, [reports]);

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden shadow-md border border-gray-200 bg-slate-900 ${className}`}
      style={{ minHeight: "240px" }}
    >
      {/* Leaflet mount node */}
      <div ref={containerRef} className="w-full h-full" style={{ minHeight: "inherit" }} />

      {/* Coordinate badge */}
      <div className="absolute top-3 left-3 z-[400] px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-white text-xs font-mono flex items-center gap-2 shadow-md pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>{lat.toFixed(4)}°N, {lng.toFixed(4)}°E</span>
      </div>

      {/* Address banner */}
      {address && (
        <div className="absolute bottom-3 left-3 right-16 z-[400] p-2.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-white/20 text-white text-xs flex items-center gap-2 shadow-lg pointer-events-none">
          <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate font-medium text-gray-200">{address}</span>
        </div>
      )}

      {interactive && (
        <div className="absolute bottom-3 right-3 z-[400] text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-1 rounded-lg border border-cyan-700 pointer-events-none">
          CLICK / DRAG PIN
        </div>
      )}
    </div>
  );
}
