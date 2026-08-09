import React, { useEffect, useRef } from "react";
import L from "leaflet";

// Create custom SVG marker icon to avoid bundler asset path issues
const createCustomIcon = (color = "#2563EB") =>
  L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
        <div style="position: absolute; width: 36px; height: 36px; background-color: ${color}33; border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; width: 28px; height: 28px; background: linear-gradient(135deg, ${color}, #1D4ED8); border-radius: 50%; border: 3px solid #FFFFFF; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
          <svg style="width: 14px; height: 14px; fill: currentColor;" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });

export function CivicMap({
  coordinates,
  reports = [],
  address,
  onLocationSelect,
  className = "",
  interactive = false,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Normalize coordinates: geoJSON format is [lng, lat], Leaflet format is [lat, lng]
  const lng = Array.isArray(coordinates) ? coordinates[0] : 73.8567;
  const lat = Array.isArray(coordinates) ? coordinates[1] : 18.5204;

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize Leaflet map if not already initialized
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 14,
        zoomControl: false,
      });

      // Add OpenStreetMap real tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add Zoom Control to bottom-right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    map.setView([lat, lng], map.getZoom());

    // Single Marker update
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const marker = L.marker([lat, lng], {
        icon: createCustomIcon("#2563EB"),
        draggable: interactive,
      }).addTo(map);

      if (address) {
        marker.bindPopup(`<b>Civic Location</b><br/>${address}`);
      }

      markerRef.current = marker;
    }

    // Handle dragend for interactive mode
    if (interactive && markerRef.current) {
      markerRef.current.on("dragend", async (e) => {
        const newPos = e.target.getLatLng();
        fetchAddressAndNotify(newPos.lat, newPos.lng);
      });
    }

    // Handle map click in interactive mode
    const handleMapClick = (e) => {
      if (!interactive) return;
      const { lat: clickLat, lng: clickLng } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([clickLat, clickLng]);
      }
      fetchAddressAndNotify(clickLat, clickLng);
    };

    map.off("click");
    if (interactive) {
      map.on("click", handleMapClick);
    }
  }, [lat, lng, interactive]);

  // Plot multiple report markers if provided
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !reports.length) return;

    const reportMarkers = [];

    reports.forEach((report) => {
      const reportCoords = report.location?.coordinates;
      if (!reportCoords || reportCoords.length !== 2) return;

      const [rLng, rLat] = reportCoords;
      const marker = L.marker([rLat, rLng], {
        icon: createCustomIcon(
          report.status === "RESOLVED" || report.status === "CLOSED"
            ? "#16A34A"
            : "#DC2626"
        ),
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <strong style="font-size: 14px; color: #1E293B;">${report.title}</strong><br/>
          <span style="font-size: 12px; color: #64748B;">Category: ${report.category}</span><br/>
          <span style="font-size: 11px; font-weight: bold; color: ${
            report.status === "RESOLVED" ? "#16A34A" : "#2563EB"
          };">${report.status}</span>
        </div>
      `);

      reportMarkers.push(marker);
    });

    return () => {
      reportMarkers.forEach((m) => map.removeLayer(m));
    };
  }, [reports]);

  // Reverse Geocoding via OpenStreetMap Nominatim
  const fetchAddressAndNotify = async (newLat, newLng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}`
      );
      const data = await res.json();
      const formattedAddress =
        data.display_name || `${newLat.toFixed(4)}, ${newLng.toFixed(4)}`;
      if (onLocationSelect) {
        onLocationSelect(newLat, newLng, formattedAddress);
      }
    } catch {
      if (onLocationSelect) {
        onLocationSelect(
          newLat,
          newLng,
          `${newLat.toFixed(4)}° N, ${newLng.toFixed(4)}° E`
        );
      }
    }
  };

  return (
    <div
      className={`relative w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-md border border-gray-200 bg-slate-900 group ${className}`}
    >
      {/* Real Leaflet Map Container */}
      <div ref={mapRef} className="w-full h-full z-0" />

      {/* Map Control Glass Badge */}
      <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-white text-xs font-mono flex items-center gap-2 shadow-md">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>
          OSM MAP: {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
        </span>
      </div>

      {/* Location Address Glass Banner */}
      {address && (
        <div className="absolute bottom-3 left-3 right-14 z-10 p-2.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-white/20 text-white text-xs flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2 overflow-hidden">
            <svg
              className="w-4 h-4 text-blue-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="truncate text-gray-200 font-medium">{address}</span>
          </div>
          {interactive && (
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-700 flex-shrink-0">
              CLICK / DRAG PIN
            </span>
          )}
        </div>
      )}
    </div>
  );
}
