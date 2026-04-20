/**
 * Geocoding Helper for Pickup Points
 * Converts addresses to latitude/longitude coordinates using Google Geocoding API
 */

import { makeRequest, GeocodingResult, LatLng } from "./_core/map";

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

/**
 * Geocode an address to get latitude and longitude
 * @param address - Full address (e.g., "Carrer Major, 42, Vilafranca del Penedès, 08720")
 * @returns Object with lat, lng, and formatted address
 * @throws Error if geocoding fails or returns no results
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  if (!address || address.trim().length === 0) {
    throw new Error("Address cannot be empty");
  }

  try {
    const result = await makeRequest<GeocodingResult>(
      "/maps/api/geocode/json",
      { address: address.trim() }
    );

    if (result.status !== "OK" || !result.results || result.results.length === 0) {
      throw new Error(`Geocoding failed: ${result.status}. Could not find coordinates for address: "${address}"`);
    }

    const firstResult = result.results[0];
    const { lat, lng } = firstResult.geometry.location;
    const formattedAddress = firstResult.formatted_address;

    return {
      lat,
      lng,
      formattedAddress,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Geocoding error: ${error.message}`);
    }
    throw new Error("Unknown geocoding error");
  }
}

/**
 * Geocode an address with fallback to city+postal code if full address fails
 * @param fullAddress - Full address
 * @param city - City name
 * @param postalCode - Postal code
 * @returns Object with lat, lng, and formatted address
 */
export async function geocodeAddressWithFallback(
  fullAddress: string,
  city: string,
  postalCode: string
): Promise<GeocodeResult> {
  try {
    // Try full address first
    return await geocodeAddress(fullAddress);
  } catch (error) {
    console.warn(`Full address geocoding failed, trying fallback: ${error}`);
    
    // Fallback to city + postal code
    const fallbackAddress = `${city}, ${postalCode}, Spain`;
    try {
      return await geocodeAddress(fallbackAddress);
    } catch (fallbackError) {
      console.error(`Fallback geocoding also failed: ${fallbackError}`);
      throw new Error(
        `Could not geocode address. Tried: "${fullAddress}" and "${fallbackAddress}". Please check the address and try again.`
      );
    }
  }
}
