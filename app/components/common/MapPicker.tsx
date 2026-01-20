"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Next.js
const iconUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
      iconUrl,
      iconRetinaUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface MapPickerProps {
      initialPosition: { lat: number; lng: number };
      onLocationSelect: (lat: number, lng: number) => void;
}

// Component to handle map clicks and marker updates
function MapEvents({
      onLocationSelect,
      setPosition,
}: {
      onLocationSelect: (lat: number, lng: number) => void;
      setPosition: (pos: { lat: number; lng: number }) => void;
}) {
      const map = useMap();

      useMapEvents({
            click(e) {
                  const { lat, lng } = e.latlng;
                  setPosition({ lat, lng });
                  onLocationSelect(lat, lng);
                  map.flyTo(e.latlng, map.getZoom());
            },
      });

      return null;
}

// Component to fly to position when it changes via props
function MapUpdater({ position }: { position: { lat: number; lng: number } | null }) {
      const map = useMap();
      useEffect(() => {
            if (position) {
                  map.flyTo(position, map.getZoom());
            }
      }, [position, map]);
      return null;
}

export default function MapPicker({ initialPosition, onLocationSelect }: MapPickerProps) {
      const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
            initialPosition.lat !== 0 && initialPosition.lng !== 0 ? initialPosition : null
      );
      const [searchQuery, setSearchQuery] = useState("");
      const [isSearching, setIsSearching] = useState(false);

      // Sync internal state with props
      useEffect(() => {
            if (initialPosition.lat !== 0 && initialPosition.lng !== 0) {
                  setPosition(initialPosition);
            }
      }, [initialPosition]);

      const handleSearch = async () => {
            if (!searchQuery.trim()) return;

            setIsSearching(true);
            try {
                  const response = await fetch(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
                  );
                  const data = await response.json();

                  if (data && data.length > 0) {
                        const { lat, lon } = data[0];
                        const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
                        setPosition(newPos);
                        onLocationSelect(newPos.lat, newPos.lng);
                  } else {
                        alert("Location not found");
                  }
            } catch (error) {
                  console.error("Search error:", error);
                  alert("Error searching for location");
            } finally {
                  setIsSearching(false);
            }
      };

      const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
            }
      };

      const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // India

      return (
            <div className="h-[400px] w-full rounded-lg overflow-hidden border z-0 relative">
                  <div className="absolute top-2 left-12 z-[1000] bg-white p-2 rounded shadow-md flex gap-2">
                        <div className="flex gap-2">
                              <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Search location..."
                                    className="px-2 py-1 border rounded text-sm w-48 text-black"
                              />
                              <button
                                    type="button"
                                    onClick={handleSearch}
                                    disabled={isSearching}
                                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                              >
                                    {isSearching ? "..." : "Search"}
                              </button>
                        </div>
                  </div>
                  <MapContainer
                        center={position || defaultCenter}
                        zoom={5}
                        scrollWheelZoom={true}
                        className="h-full w-full"
                        style={{ height: "100%", width: "100%" }}
                  >
                        <TileLayer
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapEvents onLocationSelect={onLocationSelect} setPosition={setPosition} />
                        <MapUpdater position={position} />
                        {position && <Marker position={position} />}
                  </MapContainer>
            </div>
      );
}
