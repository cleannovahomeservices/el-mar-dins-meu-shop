import { useRef } from "react";
import { MapView } from "./Map";

interface PickupPoint {
  id: number;
  name: string;
  latitude: string | number | null;
  longitude: string | number | null;
}

interface PickupPointsMapProps {
  pickupPoints: PickupPoint[];
  isLoading?: boolean;
}

export function PickupPointsMap({ pickupPoints, isLoading = false }: PickupPointsMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;

    // Filter points with coordinates
    const pointsWithCoords = pickupPoints.filter(p => p.latitude && p.longitude);

    if (pointsWithCoords.length === 0) {
      // Default center to Barcelona if no coordinates available
      map.setCenter({ lat: 41.3851, lng: 2.1734 });
      map.setZoom(8);
      return;
    }

    // Create markers for each pickup point
    pointsWithCoords.forEach((point) => {
      const lat = typeof point.latitude === 'string' ? parseFloat(point.latitude) : Number(point.latitude);
      const lng = typeof point.longitude === 'string' ? parseFloat(point.longitude) : Number(point.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        new window.google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat, lng },
          title: point.name,
        });
      }
    });

    // Fit map to show all markers
    if (pointsWithCoords.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      pointsWithCoords.forEach((point) => {
        const lat = typeof point.latitude === 'string' ? parseFloat(point.latitude) : Number(point.latitude);
        const lng = typeof point.longitude === 'string' ? parseFloat(point.longitude) : Number(point.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          bounds.extend({ lat, lng });
        }
      });
      map.fitBounds(bounds);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-[500px] rounded-2xl overflow-hidden shadow-lg animate-pulse" style={{ background: "oklch(0.85 0.04 55)" }}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block">
              <div className="w-12 h-12 rounded-full border-4 border-transparent border-t-current animate-spin" style={{ color: "oklch(0.72 0.08 200)" }} />
            </div>
            <p className="mt-4 text-sm font-semibold" style={{ color: "oklch(0.5 0.05 55)" }}>Carregant mapa...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-lg">
      <MapView
        initialCenter={{ lat: 41.3851, lng: 2.1734 }}
        initialZoom={8}
        onMapReady={handleMapReady}
        className="w-full h-[500px]"
      />
    </div>
  );
}
