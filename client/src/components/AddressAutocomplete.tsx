import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelected?: (address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    lat: number;
    lng: number;
  }) => void;
  placeholder?: string;
}

export default function AddressAutocomplete({
  value,
  onChange,
  onAddressSelected,
  placeholder = "Escriu l'adreça...",
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);

  // Initialize Google Places API
  useEffect(() => {
    if (typeof google !== "undefined" && google.maps) {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      
      // Create a dummy map element for PlacesService
      const mapDiv = document.createElement("div");
      const map = new google.maps.Map(mapDiv);
      placesServiceRef.current = new google.maps.places.PlacesService(map);
    }
  }, []);

  // Handle input change and fetch suggestions
  const handleInputChange = async (inputValue: string) => {
    onChange(inputValue);

    if (inputValue.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      if (!autocompleteServiceRef.current) return;

      const predictions = await autocompleteServiceRef.current.getPlacePredictions({
        input: inputValue,
        componentRestrictions: { country: "es" }, // Restrict to Spain
        types: ["address"],
      });

      setSuggestions(predictions.predictions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching autocomplete suggestions:", error);
      setSuggestions([]);
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = async (placeId: string, description: string) => {
    onChange(description);
    setShowSuggestions(false);

    try {
      if (!placesServiceRef.current) return;

      // Get place details
      placesServiceRef.current.getDetails(
        { placeId, fields: ["geometry", "address_components", "formatted_address"] },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            // Parse address components
            let street = "";
            let city = "";
            let postalCode = "";
            let country = "";

            place.address_components?.forEach((component) => {
              const types = component.types;
              if (types.includes("route")) {
                street = component.long_name;
              } else if (types.includes("street_number")) {
                street += ` ${component.long_name}`;
              } else if (types.includes("locality")) {
                city = component.long_name;
              } else if (types.includes("postal_code")) {
                postalCode = component.long_name;
              } else if (types.includes("country")) {
                country = component.long_name;
              }
            });

            // Call callback with parsed address
            if (onAddressSelected && place.geometry?.location) {
              onAddressSelected({
                street: street.trim(),
                city,
                postalCode,
                country,
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              });
            }
          }
        }
      );
    } catch (error) {
      console.error("Error getting place details:", error);
    }
  };

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        placeholder={placeholder}
        className="w-full"
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-input rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSuggestion(suggestion.place_id, suggestion.description)}
              className="w-full text-left px-4 py-2 hover:bg-secondary transition-colors border-b last:border-b-0"
            >
              <div className="text-sm font-medium text-foreground">{suggestion.main_text}</div>
              <div className="text-xs text-muted-foreground">{suggestion.secondary_text}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
