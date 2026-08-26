import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix the default icon path issue with Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapEvents = ({ onLocationSelect, location }: { 
  onLocationSelect: (lat: number, lng: number) => void;
  location: {lat: number, lng: number} | null;
}) => {
  const map = useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }
  });

  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], map.getZoom(), {
        animate: true,
        duration: 0.5
      });
    }
  }, [location, map]);

  return null;
};

export const LeafletMap = ({ 
  location, 
  onLocationSelect 
}: { 
  location: {lat: number, lng: number} | null,
  onLocationSelect: (lat: number, lng: number) => void
}) => {
  const defaultCenter: [number, number] = [-34.6037, -58.3816];
  const center: [number, number] = location ? [location.lat, location.lng] : defaultCenter;

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onLocationSelect={onLocationSelect} location={location} />
        {location && (
          <Marker position={[location.lat, location.lng]} />
        )}
      </MapContainer>
    </div>
  );
};
