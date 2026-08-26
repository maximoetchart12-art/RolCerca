import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface OSMSearchResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

export const OpenStreetMapAutocomplete = ({ 
  onPlaceSelect, 
  defaultValue 
}: { 
  onPlaceSelect: (address: string, lat: number, lng: number) => void, 
  defaultValue: string 
}) => {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<OSMSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query || query.length < 3 || query === defaultValue) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`);
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      } catch (error) {
        console.error('Error fetching places:', error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, defaultValue]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Ej: Caballito, Buenos Aires (Buscá tu barrio)"
          className="w-full px-3 py-2 pl-9 bg-[#0F0F11] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none placeholder:text-[#52525b] text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault();
          }}
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-[#71717a] animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-[#71717a]" />
          )}
        </div>
      </div>
      
      {isOpen && results.length > 0 && (
        <div className="absolute z-[1000] w-full mt-1 bg-[#161618] border border-[#2A2A2E] rounded-lg shadow-xl overflow-hidden max-h-60 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.place_id}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-[#2A2A2E] text-sm text-[#cbd5e1] border-b border-[#2A2A2E]/50 last:border-0 transition-colors"
              onClick={() => {
                setQuery(result.display_name);
                setIsOpen(false);
                onPlaceSelect(result.display_name, parseFloat(result.lat), parseFloat(result.lon));
              }}
            >
              {result.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
