import { useRef } from "react";
import { MapView } from "./Map";

interface PickupPoint {
  id: number;
  name: string;
  address: string;
  city: string;
  postalCode: string;
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

    if (pickupPoints.length === 0) {
      map.setCenter({ lat: 41.3851, lng: 2.1734 });
      map.setZoom(8);
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    let hasBounds = false;

    const addMarker = (lat: number, lng: number, title: string) => {
      new window.google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat, lng },
        title,
      });
      bounds.extend({ lat, lng });
      hasBounds = true;
      map.fitBounds(bounds);
    };

    const geocoder = new window.google.maps.Geocoder();
    let needsGeocode = false;

    pickupPoints.forEach((point) => {
      const lat = point.latitude != null
        ? (typeof point.latitude === "string" ? parseFloat(point.latitude) : Number(point.latitude))
        : NaN;
      const lng = point.longitude != null
        ? (typeof point.longitude === "string" ? parseFloat(point.longitude) : Number(point.longitude))
        : NaN;

      if (!isNaN(lat) && !isNaN(lng)) {
        addMarker(lat, lng, point.name);
      } else {
        needsGeocode = true;
        const address = `${point.address}, ${point.city}, Spain`;
        geocoder.geocode({ address }, (results, status) => {
          if (status === "OK" && results?.[0]) {
            const loc = results[0].geometry.location;
            addMarker(loc.lat(), loc.lng(), point.name);
          }
        });
      }
    });

    if (!hasBounds) {
      map.setCenter({ lat: 41.3851, lng: 2.1734 });
      map.setZoom(needsGeocode ? 8 : 10);
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
