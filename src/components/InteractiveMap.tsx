import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { TableSession } from '../types';
import { 
  Store, 
  Home, 
  MapPin, 
  Maximize2, 
  Navigation, 
  Layers, 
  ShieldCheck,
  CheckCircle2,
  Users,
  Compass
} from 'lucide-react';

interface InteractiveMapProps {
  tables: TableSession[];
  selectedTableId: string | null;
  onSelectTable: (table: TableSession) => void;
  onOpenDetail: (table: TableSession) => void;
}

// Helper to validate geographic coordinates
const isValidCoord = (val: unknown): val is number => {
  return typeof val === 'number' && !isNaN(val) && isFinite(val) && val >= -90 && val <= 90;
};
const isValidLng = (val: unknown): val is number => {
  return typeof val === 'number' && !isNaN(val) && isFinite(val) && val >= -180 && val <= 180;
};

// Safe Leaflet FlyTo helper to completely prevent (NaN, NaN) exceptions
const safeFlyTo = (
  map: L.Map | null,
  lat: number,
  lng: number,
  zoom = 13,
  options?: L.ZoomPanOptions
) => {
  if (!map) return;
  const numLat = Number(lat);
  const numLng = Number(lng);
  if (!isValidCoord(numLat) || !isValidLng(numLng)) return;

  try {
    map.invalidateSize();
    const size = map.getSize();
    // When size is 0 (container not rendered or hidden), flyTo's interpolation math divides by 0 yielding NaN coordinates.
    // Falling back to setView prevents any LatLng(NaN, NaN) crash.
    if (!size || size.x <= 0 || size.y <= 0) {
      map.setView([numLat, numLng], zoom);
      return;
    }
    map.flyTo([numLat, numLng], zoom, { duration: 0.8, ...options });
  } catch (err) {
    console.warn('safeFlyTo fallback to setView:', err);
    try {
      map.setView([numLat, numLng], zoom);
    } catch {
      // Ignore
    }
  }
};

// Safe Leaflet FitBounds helper
const safeFitBounds = (map: L.Map | null, coords: [number, number][]) => {
  if (!map || !coords || coords.length === 0) return;
  const valid = coords.filter(([lat, lng]) => isValidCoord(lat) && isValidLng(lng));
  if (valid.length === 0) return;

  try {
    map.invalidateSize();
    const size = map.getSize();
    if (!size || size.x <= 0 || size.y <= 0) return;

    const bounds = L.latLngBounds(valid);
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  } catch (err) {
    console.warn('safeFitBounds error:', err);
  }
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  tables,
  selectedTableId,
  onSelectTable,
  onOpenDetail,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on CABA/Greater Buenos Aires
    const map = L.map(mapContainerRef.current, {
      center: [-34.6037, -58.3816],
      zoom: 11,
      minZoom: 7,
      maxZoom: 18,
      zoomControl: false,
    });

    // Zoom control at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Dark fantasy tile layer (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Resize observer to ensure map renders smoothly on layout split changes
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    if (!Array.isArray(tables) || tables.length === 0) return;

    const validTables = tables.filter((table) => {
      const lat = Number(table?.coordinates?.lat);
      const lng = Number(table?.coordinates?.lng);
      return isValidCoord(lat) && isValidLng(lng);
    });

    if (validTables.length === 0) return;

    const validCoordinatesList: [number, number][] = [];

    validTables.forEach((table) => {
      const lat = Number(table.coordinates.lat);
      const lng = Number(table.coordinates.lng);

      const isSelected = table.id === selectedTableId;
      const isStore = table.venueType === 'store' || table.venueType === 'club_public';
      const available = table.slotsTotal - table.slotsTaken;

      // Custom HTML Marker
      const markerHtml = `
        <div class="relative group cursor-pointer transition-transform duration-200 ${isSelected ? 'scale-125 z-50' : 'hover:scale-115'}">
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center shadow-2xl border-2 transition-all ${
            isStore
              ? isSelected
                ? 'bg-[#800020] border-rose-200 shadow-[#800020]/90 ring-4 ring-[#800020]/50'
                : 'bg-[#800020]/95 border-[#991b1b] text-rose-100 shadow-black/80 hover:bg-[#991b1b]'
              : isSelected
                ? 'bg-[#d97706] border-amber-200 shadow-[#d97706]/90 ring-4 ring-[#d97706]/50'
                : 'bg-[#b45309]/95 border-amber-500 text-amber-100 shadow-black/80 hover:bg-[#d97706]'
          }">
            ${
              isStore
                ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>`
                : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
            }
          </div>

          <!-- Slots Badge indicator -->
          <div class="absolute -top-1.5 -right-1.5 bg-[#0F0F11] border border-[#2A2A2E] text-[10px] font-bold px-1.5 py-0.2 rounded-full text-[#f1f5f9] shadow flex items-center gap-0.5">
            <span class="w-1.5 h-1.5 rounded-full ${available > 0 ? 'bg-emerald-400' : 'bg-rose-500'}"></span>
            ${available}
          </div>

          <!-- Pointer triangle -->
          <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] mx-auto -mt-0.5 ${
            isStore
              ? isSelected ? 'border-t-[#800020]' : 'border-t-[#800020]'
              : isSelected ? 'border-t-[#d97706]' : 'border-t-[#b45309]'
          }"></div>
        </div>
      `;

      try {
        const customIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: markerHtml,
          iconSize: [40, 48],
          iconAnchor: [20, 48],
          popupAnchor: [0, -48],
        });

        const marker = L.marker([lat, lng], {
          icon: customIcon,
        });

        // Custom popup HTML
        const popupHtml = `
          <div class="p-3.5 w-64 text-left">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                isStore ? 'bg-[#800020]/40 text-rose-200 border border-[#800020]/70' : 'bg-[#d97706]/30 text-amber-200 border border-amber-600/60'
              }">
                ${isStore ? 'Sede en Tienda' : 'Casa de Anfitrión'}
              </span>
              <span class="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                ${available > 0 ? `${available} cupos libres` : 'Mesa llena'}
              </span>
            </div>

            <h4 class="font-fantasy font-bold text-sm text-[#f8fafc] leading-snug line-clamp-2 mb-1.5">${table.title}</h4>
            
            <div class="text-xs text-[#94a3b8] mb-2.5 flex items-center gap-1">
              <span class="text-amber-400 font-semibold">${table.system}</span>
              <span>•</span>
              <span class="text-[#cbd5e1] truncate">${table.zone}</span>
            </div>

            <div class="bg-[#0F0F11]/90 rounded-lg p-2.5 text-xs border border-[#2A2A2E] mb-3">
              <div class="flex items-center justify-between text-[#cbd5e1] mb-1">
                <span class="text-[#94a3b8]">GM:</span>
                <span class="font-semibold text-[#f1f5f9]">${table.dm.name} (${table.dm.rating} ★)</span>
              </div>
              <div class="flex items-center justify-between text-[#cbd5e1]">
                <span class="text-[#94a3b8]">Próxima:</span>
                <span class="font-semibold text-[#f1f5f9]">${table.schedule.dayOfWeek} ${table.schedule.time}</span>
              </div>
            </div>

            <button
              id="popup-btn-details-${table.id}"
              class="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-[#800020] to-[#991b1b] hover:from-[#991b1b] hover:to-[#b91c1c] text-white font-semibold text-xs shadow-lg text-center cursor-pointer transition-all border border-[#991b1b]/80"
            >
              Ver Ficha de Seguridad & Mesa
            </button>
          </div>
        `;

        marker.bindPopup(popupHtml, {
          maxWidth: 280,
          className: 'custom-table-popup',
        });

        marker.on('click', () => {
          onSelectTable(table);
        });

        marker.on('popupopen', () => {
          const btn = document.getElementById(`popup-btn-details-${table.id}`);
          if (btn) {
            btn.onclick = (e) => {
              e.stopPropagation();
              onOpenDetail(table);
            };
          }
        });

        markersGroup.addLayer(marker);
        validCoordinatesList.push([lat, lng]);
      } catch (err) {
        console.warn('Error attaching marker:', err);
      }
    });

    // If a table is selected and it changed, safely move/fly to it
    if (selectedTableId) {
      const selected = validTables.find((t) => t.id === selectedTableId);
      if (selected) {
        const selLat = Number(selected.coordinates?.lat);
        const selLng = Number(selected.coordinates?.lng);
        if (isValidCoord(selLat) && isValidLng(selLng)) {
          safeFlyTo(map, selLat, selLng, 13);
        }
      }
    }
  }, [tables, selectedTableId]);

  // Center buttons handlers
  const handleCenterCABA = () => {
    safeFlyTo(mapInstanceRef.current, -34.6037, -58.42, 12);
  };

  const handleCenterPBA = () => {
    safeFlyTo(mapInstanceRef.current, -34.85, -58.75, 9);
  };

  const handleFitAll = () => {
    if (!mapInstanceRef.current) return;
    const validCoords = (Array.isArray(tables) ? tables : [])
      .filter((t) => {
        const lat = Number(t?.coordinates?.lat);
        const lng = Number(t?.coordinates?.lng);
        return isValidCoord(lat) && isValidLng(lng);
      })
      .map((t) => [Number(t.coordinates.lat), Number(t.coordinates.lng)] as [number, number]);

    if (validCoords.length > 0) {
      safeFitBounds(mapInstanceRef.current, validCoords);
    } else {
      handleCenterCABA();
    }
  };

  const handleLocateMe = () => {
    if ('geolocation' in navigator && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos?.coords?.latitude);
          const lng = Number(pos?.coords?.longitude);
          if (isValidCoord(lat) && isValidLng(lng)) {
            safeFlyTo(mapInstanceRef.current, lat, lng, 13);
          } else {
            handleCenterCABA();
          }
        },
        (err) => {
          console.warn('Geolocation error:', err);
          handleCenterCABA();
        }
      );
    }
  };

  return (
    <div className="relative w-full h-full min-h-[360px] sm:min-h-[420px] rounded-xl overflow-hidden border border-[#2A2A2E] bg-[#0F0F11] shadow-2xl flex flex-col">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full flex-1 z-10" />

      {/* Floating Map Navigation Badges & Controls */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5 max-w-[calc(100%-60px)]">
        <button
          id="map-btn-center-caba"
          onClick={handleCenterCABA}
          className="px-2.5 py-1.5 rounded-lg bg-[#161618]/90 hover:bg-[#242429] text-[#e2e8f0] text-xs font-semibold backdrop-blur border border-[#2A2A2E] shadow flex items-center gap-1 transition-all cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5 text-rose-400" />
          <span>CABA</span>
        </button>

        <button
          id="map-btn-center-pba"
          onClick={handleCenterPBA}
          className="px-2.5 py-1.5 rounded-lg bg-[#161618]/90 hover:bg-[#242429] text-[#e2e8f0] text-xs font-semibold backdrop-blur border border-[#2A2A2E] shadow flex items-center gap-1 transition-all cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>PBA / GBA</span>
        </button>

        <button
          id="map-btn-fit-all"
          onClick={handleFitAll}
          className="px-2.5 py-1.5 rounded-lg bg-[#161618]/90 hover:bg-[#242429] text-[#e2e8f0] text-xs font-semibold backdrop-blur border border-[#2A2A2E] shadow flex items-center gap-1 transition-all cursor-pointer"
          title="Ver todos los pines"
        >
          <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Ver Todo</span>
        </button>

        <button
          id="map-btn-locate-me"
          onClick={handleLocateMe}
          className="p-1.5 rounded-lg bg-[#161618]/90 hover:bg-[#242429] text-[#e2e8f0] text-xs font-semibold backdrop-blur border border-[#2A2A2E] shadow transition-all cursor-pointer"
          title="Centrar en mi ubicación"
        >
          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
        </button>
      </div>

      {/* Floating Legend */}
      <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-20 bg-[#161618]/90 backdrop-blur-md rounded-xl p-2.5 border border-[#2A2A2E] shadow-2xl text-xs flex flex-wrap items-center gap-3 justify-between sm:justify-start">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-[#800020] border border-[#991b1b] flex items-center justify-center text-rose-200">
            <Store className="w-3 h-3" />
          </div>
          <span className="text-[#cbd5e1] font-medium">Tienda / Club (Sede Verificada)</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-[#d97706]/40 border border-amber-500 flex items-center justify-center text-amber-300">
            <Home className="w-3 h-3" />
          </div>
          <span className="text-[#cbd5e1] font-medium">Casa Particular (Anfitrión Verificado)</span>
        </div>
      </div>
    </div>
  );
};
