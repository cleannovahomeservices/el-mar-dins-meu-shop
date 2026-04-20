import { describe, it, expect, vi, beforeEach } from "vitest";
import { geocodeAddress, geocodeAddressWithFallback } from "./geocoding";
import * as mapModule from "./_core/map";

// Mock the makeRequest function
vi.mock("./_core/map", () => ({
  makeRequest: vi.fn(),
}));

describe("Geocoding Helper", () => {
  const mockMakeRequest = vi.mocked(mapModule.makeRequest);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("geocodeAddress", () => {
    it("should successfully geocode a valid address", async () => {
      mockMakeRequest.mockResolvedValueOnce({
        status: "OK",
        results: [
          {
            geometry: {
              location: { lat: 41.3667, lng: 1.7306 },
              location_type: "ROOFTOP",
              viewport: {
                northeast: { lat: 41.3680, lng: 1.7320 },
                southwest: { lat: 41.3654, lng: 1.7292 },
              },
            },
            formatted_address: "Carrer Major, 42, 08720 Vilafranca del Penedès, Spain",
            place_id: "ChIJX_test_id",
            types: ["street_address"],
            address_components: [],
          },
        ],
      });

      const result = await geocodeAddress("Carrer Major, 42, Vilafranca del Penedès, 08720");

      expect(result).toEqual({
        lat: 41.3667,
        lng: 1.7306,
        formattedAddress: "Carrer Major, 42, 08720 Vilafranca del Penedès, Spain",
      });

      expect(mockMakeRequest).toHaveBeenCalledWith(
        "/maps/api/geocode/json",
        { address: "Carrer Major, 42, Vilafranca del Penedès, 08720" }
      );
    });

    it("should throw error for empty address", async () => {
      await expect(geocodeAddress("")).rejects.toThrow("Address cannot be empty");
    });

    it("should throw error when geocoding returns no results", async () => {
      mockMakeRequest.mockResolvedValueOnce({
        status: "ZERO_RESULTS",
        results: [],
      });

      await expect(geocodeAddress("Invalid Address XYZ")).rejects.toThrow(
        "Geocoding failed: ZERO_RESULTS"
      );
    });

    it("should throw error when API returns error status", async () => {
      mockMakeRequest.mockResolvedValueOnce({
        status: "REQUEST_DENIED",
        results: [],
      });

      await expect(geocodeAddress("Some Address")).rejects.toThrow(
        "Geocoding failed: REQUEST_DENIED"
      );
    });
  });

  describe("geocodeAddressWithFallback", () => {
    it("should use full address when available", async () => {
      mockMakeRequest.mockResolvedValueOnce({
        status: "OK",
        results: [
          {
            geometry: {
              location: { lat: 41.3667, lng: 1.7306 },
              location_type: "ROOFTOP",
              viewport: {
                northeast: { lat: 41.3680, lng: 1.7320 },
                southwest: { lat: 41.3654, lng: 1.7292 },
              },
            },
            formatted_address: "Carrer Major, 42, 08720 Vilafranca del Penedès, Spain",
            place_id: "ChIJX_test_id",
            types: ["street_address"],
            address_components: [],
          },
        ],
      });

      const result = await geocodeAddressWithFallback(
        "Carrer Major, 42",
        "Vilafranca del Penedès",
        "08720"
      );

      expect(result.lat).toBe(41.3667);
      expect(result.lng).toBe(1.7306);
      expect(mockMakeRequest).toHaveBeenCalledTimes(1);
    });

    it("should fallback to city+postal when full address fails", async () => {
      // First call fails, second succeeds
      mockMakeRequest
        .mockRejectedValueOnce(new Error("Full address not found"))
        .mockResolvedValueOnce({
          status: "OK",
          results: [
            {
              geometry: {
                location: { lat: 41.3667, lng: 1.7306 },
                location_type: "APPROXIMATE",
                viewport: {
                  northeast: { lat: 41.3680, lng: 1.7320 },
                  southwest: { lat: 41.3654, lng: 1.7292 },
                },
              },
              formatted_address: "Vilafranca del Penedès, 08720, Spain",
              place_id: "ChIJX_test_id_2",
              types: ["locality"],
              address_components: [],
            },
          ],
        });

      const result = await geocodeAddressWithFallback(
        "Invalid Street Name",
        "Vilafranca del Penedès",
        "08720"
      );

      expect(result.lat).toBe(41.3667);
      expect(result.lng).toBe(1.7306);
      expect(mockMakeRequest).toHaveBeenCalledTimes(2);
    });

    it("should throw error when both full address and fallback fail", async () => {
      mockMakeRequest
        .mockRejectedValueOnce(new Error("Full address not found"))
        .mockRejectedValueOnce(new Error("Fallback also failed"));

      await expect(
        geocodeAddressWithFallback("Invalid Address", "Invalid City", "00000")
      ).rejects.toThrow("Could not geocode address");
    });
  });
});
