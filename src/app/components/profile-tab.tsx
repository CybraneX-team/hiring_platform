"use client";

import type React from "react";
import Image from "next/image";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  Star,
  Upload,
  GraduationCap,
  Briefcase,
  X,
  ArrowLeft,
  Edit2,
  Search,
  FileText,
  Eye,
  MapPin,
  Calendar,
  Clock,
  LogOut,
  Plus,
  Phone,
  Trash2,
  ArrowUpRight,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import CalendarSection from "./calender";
import { useRouter, useSearchParams } from "next/navigation";
import ResumeUpload from "./ResumeUpload";
import JobMatching from "./JobMatching";
import { useUser } from "../context/UserContext";
import { toast } from "react-toastify";
import ApplicationDetailView from "./cv";
import Link from "next/link";
import {
  processCerts,
  processEducation,
  processExperiences,
  type UpdatedData,
} from "../Helper/profile-helper";
import { handleLogout } from "../Helper/logout";

// OlaMaps integration
let OlaMaps: any = null;
let olaMaps: any = null;

const initializeOlaMaps = async () => {
  if (typeof window !== "undefined" && !OlaMaps) {
    try {
      const module = await import("olamaps-web-sdk");
      OlaMaps = module.OlaMaps;
      olaMaps = new OlaMaps({
        apiKey: process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY || "",
      });

      // Ensure Marker and Popup constructors are available
      if (!olaMaps.Marker) {
        olaMaps.Marker = (module as any).Marker || (OlaMaps as any).Marker;
      }
      if (!olaMaps.Popup) {
        olaMaps.Popup = (module as any).Popup || (OlaMaps as any).Popup;
      }

      // console.log("OlaMaps initialized successfully with constructors:", {
      //   hasMarker: !!olaMaps.Marker,
      //   hasPopup: !!olaMaps.Popup,
      // });
    } catch (error) {
      console.error("Failed to initialize OlaMaps:", error);
    }
  }
};

const OlaMapComponent = ({
  location,
  onLocationSelect,
  searchQuery,
  showAutoDetect = true,
}: {
  location?: { lat: number; lng: number; address?: string };
  onLocationSelect?: (location: {
    lat: number;
    lng: number;
    address: string;
  }) => void;
  searchQuery?: string;
  showAutoDetect?: boolean;
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    const loadMap = async () => {
      await initializeOlaMaps();

      if (mapRef.current && olaMaps && !mapInstanceRef.current) {
        try {
          let mapCenter = { lat: 12.9716, lng: 77.5946 };

          if (location) {
            // Check if location has valid coordinates
            if (
              typeof location.lat === "number" &&
              typeof location.lng === "number" &&
              !isNaN(location.lat) &&
              !isNaN(location.lng) &&
              isFinite(location.lat) &&
              isFinite(location.lng)
            ) {
              mapCenter = { lat: location.lat, lng: location.lng };
            } else {
              console.warn("Invalid location coordinates provided:", location);
              setDebugInfo(
                "Invalid location coordinates, using default location"
              );
            }
          }

          // Use 2D-only style to avoid 3D layer errors
          try {
            // Try default light style first
            mapInstanceRef.current = olaMaps.init({
              style:
                "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
              container: mapRef.current,
              center: [mapCenter.lng, mapCenter.lat],
              zoom: 12,
              pitch: 0,
              bearing: 0,
              maxPitch: 0, // Force 2D mode
            });
          } catch (styleError) {
            console.warn(
              "Failed to load default style, trying satellite style:",
              styleError
            );
            try {
              // Try satellite style as fallback
              mapInstanceRef.current = olaMaps.init({
                style:
                  "https://api.olamaps.io/tiles/vector/v1/styles/satellite/style.json",
                container: mapRef.current,
                center: [mapCenter.lng, mapCenter.lat],
                zoom: 12,
                pitch: 0,
                bearing: 0,
                maxPitch: 0,
              });
            } catch (satelliteError) {
              console.warn(
                "Failed to load satellite style, using minimal config:",
                satelliteError
              );
              // Final fallback with minimal configuration
              mapInstanceRef.current = olaMaps.init({
                container: mapRef.current,
                center: [mapCenter.lng, mapCenter.lat],
                zoom: 12,
                pitch: 0,
                bearing: 0,
                maxPitch: 0,
              });
            }
          }

          mapInstanceRef.current.on("load", () => {
            setIsMapLoaded(true);
            setDebugInfo("");

            // Add marker if valid location exists
            if (
              location &&
              typeof location.lat === "number" &&
              typeof location.lng === "number" &&
              !isNaN(location.lat) &&
              !isNaN(location.lng)
            ) {
              addMarker(
                location.lat,
                location.lng,
                location.address || "Selected Location"
              );
            }
          });

          // Add click event listener
          mapInstanceRef.current.on("click", (e: any) => {
            const { lat, lng } = e.lngLat;
            reverseGeocode(lat, lng);
          });

          // Add error handling with 3D model error filtering
          mapInstanceRef.current.on("error", (e: any) => {
            // Suppress 3D model layer errors as they're expected when using 2D mode
            if (
              e.error &&
              e.error.message &&
              (e.error.message.includes("3d_model") ||
                (e.error.message.includes("Source layer") &&
                  e.error.message.includes("does not exist")))
            ) {
              console.warn(
                "Suppressing 3D model layer error (expected in 2D mode):",
                e.error.message
              );
              return;
            }
            console.error("Map error:", e);
            setDebugInfo("Map loading error");
          });
        } catch (error) {
          console.error("Error initializing map:", error);
          setDebugInfo("Failed to initialize map");
        }
      }
    };

    loadMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle location updates separately
  useEffect(() => {
    if (
      mapInstanceRef.current &&
      location &&
      typeof location.lat === "number" &&
      typeof location.lng === "number" &&
      !isNaN(location.lat) &&
      !isNaN(location.lng)
    ) {
      // Fly to new location
      mapInstanceRef.current.flyTo({
        center: [location.lng, location.lat],
        zoom: 15,
        duration: 1000,
      });

      // Add marker
      setTimeout(() => {
        addMarker(
          location.lat,
          location.lng,
          location.address || "Selected Location"
        );
      }, 200);
    }
  }, [location]);

  // Handle search when searchQuery changes
  useEffect(() => {
    if (searchQuery && searchQuery.trim() && isMapLoaded) {
      handleAddressSearch(searchQuery);
    }
  }, [searchQuery, isMapLoaded]);

  const geocodeAddress = async (address: string) => {
    if (!address.trim()) return;

    try {
      const response = await fetch(
        `https://api.olamaps.io/places/v1/geocode?address=${encodeURIComponent(
          address
        )}&api_key=${process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY}`
      );

      if (response.ok) {
        const data = await response.json();

        if (data.geocodingResults && data.geocodingResults.length > 0) {
          const result = data.geocodingResults[0];
          const { lat, lng } = result.geometry.location;

          // Validate coordinates before using them
          if (
            typeof lat === "number" &&
            typeof lng === "number" &&
            !isNaN(lat) &&
            !isNaN(lng) &&
            isFinite(lat) &&
            isFinite(lng)
          ) {
            const formattedAddress = result.formatted_address || address;

            // Update map center and add marker
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo({
                center: [lng, lat],
                zoom: 15,
                duration: 2000,
              });
            }

            // Add marker with delay to ensure map has moved
            setTimeout(() => {
              addMarker(lat, lng, formattedAddress);
            }, 500);

            if (onLocationSelect) {
              onLocationSelect({ lat, lng, address: formattedAddress });
            }

            return { lat, lng, address: formattedAddress };
          } else {
            console.error("Invalid coordinates from geocoding:", lat, lng);
            throw new Error("Invalid coordinates received");
          }
        } else {
          throw new Error("Location not found");
        }
      } else {
        const errorText = await response.text();
        console.error("Geocoding API error:", response.status, errorText);
        throw new Error(`Geocoding failed: ${response.status}`);
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
      setDebugInfo("Search failed - please try a different location");
      throw error;
    }
  };

  const handleAddressSearch = async (address: string) => {
    setIsSearching(true);
    setDebugInfo("Searching...");
    try {
      await geocodeAddress(address);
      setDebugInfo("");
    } catch (error) {
      console.error("Address search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const addMarker = (lat: number, lng: number, title: string) => {
    if (!mapInstanceRef.current) {
      console.error("Cannot add marker: map not initialized");
      return;
    }

    if (!isMapLoaded) {
      console.warn("Map not fully loaded, delaying marker creation");
      setTimeout(() => addMarker(lat, lng, title), 500);
      return;
    }

    // Validate coordinates
    if (
      typeof lat !== "number" ||
      typeof lng !== "number" ||
      isNaN(lat) ||
      isNaN(lng) ||
      !isFinite(lat) ||
      !isFinite(lng)
    ) {
      console.error("Invalid coordinates for marker:", lat, lng);
      return;
    }

    // console.log("Adding marker at:", lat, lng, title);

    try {
      // Remove existing marker
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }

      // Create custom location pin marker element
      const markerElement = document.createElement("div");
      markerElement.className = "custom-marker";
      markerElement.innerHTML = `
        <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16C0 24.837 16 40 16 40S32 24.837 32 16C32 7.163 24.837 0 16 0Z" fill="#3b82f6"/>
          <path d="M16 2C23.732 2 30 8.268 30 16C30 22.5 16 36.5 16 36.5S2 22.5 2 16C2 8.268 8.268 2 16 2Z" fill="#ffffff" stroke="#3b82f6" strokeWidth="0.5"/>
          <circle cx="16" cy="16" r="6" fill="#3b82f6"/>
          <circle cx="16" cy="16" r="3" fill="#ffffff"/>
        </svg>
      `;
      markerElement.style.cssText = `
        width: 32px;
        height: 40px;
        cursor: pointer;
        z-index: 100;
        position: relative;
        filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));
        transform: translate(-50%, -100%);
      `;

      // Wait for OlaMaps to be fully available
      if (!olaMaps) {
        console.error("OlaMaps not initialized");
        return;
      }

      // Import and check for Marker constructor
      if (!olaMaps.Marker) {
        console.error("OlaMaps.Marker constructor not available");
        return;
      }

      // Add marker to map
      markerRef.current = new olaMaps.Marker({
        element: markerElement,
      })
        .setLngLat([lng, lat])
        .addTo(mapInstanceRef.current);

      // Add info window/popup
      if (olaMaps.Popup) {
        const popup = new olaMaps.Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: false,
        }).setHTML(
          `<div style="padding: 8px; font-size: 14px; font-weight: 500; color: #333;">${title}</div>`
        );

        markerRef.current.setPopup(popup);
      }
    } catch (error) {
      console.error("Error adding marker:", error);
      console.error("OlaMaps object:", olaMaps);
      setDebugInfo("Error adding marker");
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    // Validate coordinates
    if (
      typeof lat !== "number" ||
      typeof lng !== "number" ||
      isNaN(lat) ||
      isNaN(lng) ||
      !isFinite(lat) ||
      !isFinite(lng)
    ) {
      console.error("Invalid coordinates for reverse geocoding:", lat, lng);
      return;
    }

    try {
      const response = await fetch(
        `https://api.olamaps.io/places/v1/reverse-geocode?latlng=${lat},${lng}&api_key=${process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY}`
      );

      if (response.ok) {
        const data = await response.json();
        const address =
          data.results?.[0]?.formatted_address ||
          `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

        addMarker(lat, lng, address);

        if (onLocationSelect) {
          onLocationSelect({ lat, lng, address });
        }
      } else {
        console.error("Reverse geocoding failed:", response.status);
        const address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        addMarker(lat, lng, address);

        if (onLocationSelect) {
          onLocationSelect({ lat, lng, address });
        }
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      const address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      addMarker(lat, lng, address);

      if (onLocationSelect) {
        onLocationSelect({ lat, lng, address });
      }
    }
  };

  const autoDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    setIsDetecting(true);
    // console.log("Starting geolocation detection");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // console.log("Geolocation detected:", latitude, longitude);

        // Validate detected coordinates
        if (
          typeof latitude === "number" &&
          typeof longitude === "number" &&
          !isNaN(latitude) &&
          !isNaN(longitude) &&
          isFinite(latitude) &&
          isFinite(longitude)
        ) {
          // Fly to detected location
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo({
              center: [longitude, latitude],
              zoom: 15,
              duration: 2000,
            });
          }

          reverseGeocode(latitude, longitude);
          setDebugInfo("");
        } else {
          console.error(
            "Invalid coordinates from geolocation:",
            latitude,
            longitude
          );
          setDebugInfo("Invalid location detected");
        }
        setIsDetecting(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setDebugInfo("Location detection failed");
        alert(
          "Unable to detect location. Please try again or select manually."
        );
        setIsDetecting(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden h-48 sm:h-64">
      <div
        ref={mapRef}
        className="w-full h-full"
        style={{ minHeight: "200px" }}
      />

      {!isMapLoaded && (
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-gray-900 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {isSearching && (
        <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
          Searching...
        </div>
      )}

      {/* Debug info */}
      {debugInfo && (
        <div className="absolute top-2 left-2 right-2 bg-red-600/90 text-white px-2 py-1 rounded text-xs max-h-8 overflow-hidden">
          {debugInfo}
        </div>
      )}

      {showAutoDetect && (
        <div className="absolute top-1 sm:top-1 right-1 sm:right-1 flex gap-1 sm:gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={autoDetectLocation}
            disabled={isDetecting}
            className="cursor-pointer px-2 sm:px-3 py-1 bg-gray-800 text-white text-xs rounded-full border border-gray-600 hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            {isDetecting ? (
              <>
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                Detecting...
              </>
            ) : (
              <>
                <MapPin className="w-3 h-3" />
                Auto Detect
              </>
            )}
          </motion.button>
        </div>
      )}
    </div>
  );
};

// Enhanced location input field component
const LocationInputWithSearch = ({
  value,
  onChange,
  onLocationSelect,
  selectedLocation,
}: {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    address: string;
  }) => void;
  selectedLocation?: { lat: number; lng: number; address?: string };
}) => {
  const [searchTrigger, setSearchTrigger] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isFromSelection, setIsFromSelection] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced autocomplete suggestions
  useEffect(() => {
    if (!isInputFocused) {
      setShowSuggestions(false);
      return;
    }
    if (isFromSelection) {
      setShowSuggestions(false);
      setIsFromSelection(false);
      return;
    }
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch {}
      abortControllerRef.current = null;
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const fetchSuggestions = async () => {
      try {
        const query = value.trim();
        if (!query) {
          setSuggestions([]);
          setShowSuggestions(false);
          setHighlightIndex(-1);
          return;
        }

        // small delay for debounce
        await new Promise((r) => setTimeout(r, 300));
        if (controller.signal.aborted) return;

        const resp = await fetch(
          `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(
            query
          )}&api_key=${process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY}`,
          { signal: controller.signal }
        );
        if (!resp.ok) throw new Error("Failed to fetch suggestions");
        const data = await resp.json();
        // Normalize results; Ola Maps returns predictions similar to Google
        const preds = data.predictions || data.suggestions || [];
        setSuggestions(preds.slice(0, 8));
        setShowSuggestions(true);
        setHighlightIndex(-1);
      } catch (err) {
        if ((err as any).name !== "AbortError") {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    };

    fetchSuggestions();
    return () => controller.abort();
  }, [value, isInputFocused, isFromSelection]);

  const geocodeAndSelect = async (
    addressOrSuggestion: string | any,
    quiet: boolean = false
  ) => {
    try {
      setIsSearching(true);
      let formattedAddress: string | undefined;
      let lat: number | undefined;
      let lng: number | undefined;

      const maybeSuggestion =
        typeof addressOrSuggestion === "object" && addressOrSuggestion;
      const placeId = maybeSuggestion?.place_id || maybeSuggestion?.placeId;

      if (placeId) {
        const detailsResp = await fetch(
          `https://api.olamaps.io/places/v1/details?place_id=${encodeURIComponent(
            placeId
          )}&api_key=${process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY}`
        );
        if (detailsResp.ok) {
          const detailsData = await detailsResp.json();
          const result = detailsData?.result || detailsData?.details || {};
          lat = result?.geometry?.location?.lat;
          lng = result?.geometry?.location?.lng;
          formattedAddress =
            result?.formatted_address || maybeSuggestion?.description;
        }
      }

      if (typeof lat !== "number" || typeof lng !== "number") {
        const address =
          typeof addressOrSuggestion === "string"
            ? addressOrSuggestion
            : addressOrSuggestion?.description ||
              addressOrSuggestion?.formatted_address ||
              addressOrSuggestion?.name ||
              value;
        const response = await fetch(
          `https://api.olamaps.io/places/v1/geocode?address=${encodeURIComponent(
            address
          )}&api_key=${process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY}`
        );
        if (response.ok) {
          const data = await response.json();
          const result = data.geocodingResults?.[0];
          lat = result?.geometry?.location?.lat;
          lng = result?.geometry?.location?.lng;
          formattedAddress = result?.formatted_address || address;
        }
      }

      if (
        typeof lat === "number" &&
        typeof lng === "number" &&
        !isNaN(lat) &&
        !isNaN(lng) &&
        isFinite(lat) &&
        isFinite(lng)
      ) {
        const finalAddress = formattedAddress || value;
        onChange(finalAddress);
        setShowSuggestions(false);
        setSuggestions([]);
        setHighlightIndex(-1);
        setIsInputFocused(false);
        inputRef.current?.blur();
        if (!quiet) {
          setSearchTrigger(finalAddress);
        }
        onLocationSelect({ lat, lng, address: finalAddress });
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async () => {
    if (!value.trim()) return;

    setIsSearching(true);
    setSearchTrigger(value); // This will trigger the map to search
    // Close any open suggestions when an explicit search is triggered
    setShowSuggestions(false);
    setSuggestions([]);

    // Reset after a short delay
    setTimeout(() => {
      setIsSearching(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (showSuggestions && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      setHighlightIndex((prev) => {
        const count = suggestions.length;
        if (count === 0) return -1;
        if (e.key === "ArrowDown") return (prev + 1 + count) % count;
        return (prev - 1 + count) % count;
      });
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (
        showSuggestions &&
        highlightIndex >= 0 &&
        suggestions[highlightIndex]
      ) {
        const s = suggestions[highlightIndex];
        const address = s.description || s.formatted_address || s.name || value;
        geocodeAndSelect(s, true);
      } else {
        handleSearch();
      }
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setShowSuggestions(true);
            }}
            placeholder="Enter address or click on map to select location..."
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={handleKeyPress}
            onFocus={() => {
              setIsInputFocused(true);
              if (value && !isFromSelection) setShowSuggestions(true);
            }}
            onBlur={() => {
              setIsInputFocused(false);
              setTimeout(() => setShowSuggestions(false), 100);
            }}
            ref={inputRef}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-[9999] mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-auto">
              {suggestions.map((s, idx) => {
                const address =
                  s.description || s.formatted_address || s.name || "";
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-blue-50 ${
                      idx === highlightIndex ? "bg-blue-50" : ""
                    }`}
                    onMouseEnter={() => setHighlightIndex(idx)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setShowSuggestions(false);
                      setIsInputFocused(false);
                      setIsFromSelection(true);
                      if (abortControllerRef.current) {
                        try {
                          abortControllerRef.current.abort();
                        } catch {}
                        abortControllerRef.current = null;
                      }
                      inputRef.current?.blur();
                      geocodeAndSelect(s, true);
                    }}
                  >
                    {address}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSearch}
          disabled={!value.trim() || isSearching}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
        >
          {isSearching ? "Searching..." : "Search"}
        </motion.button>
      </div>

      <OlaMapComponent
        location={selectedLocation}
        onLocationSelect={onLocationSelect}
        searchQuery={searchTrigger}
      />
    </div>
  );
};

const initialProfileData = {
  profile: {
    bio: "",
    skills: [],
    languages: [],
    availability: [],
    location: null,
  },
  education: [],
  experiences: [],
  certifications: [],
  schedule: {
    availability: "Monday - Friday, 9:00 AM - 6:00 PM EST",
    timezone: "Eastern Standard Time",
    preferredMeetingTimes: ["10:00 AM - 12:00 PM", "2:00 PM - 4:00 PM"],
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
};

const skillVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
  },
};

const convertDescriptionToPoints = (description: string): string[] => {
  if (!description) return [];

  // Split by common bullet point indicators
  const points = description
    .split(/[\n•\-*]/)
    .map((point) => point.trim())
    .filter((point) => point.length > 0 && point.length > 5) // Filter very short points
    .map((point) => point.replace(/^[-*•]\s*/, ""));

  return points.length > 0 ? points : [description];
};

const parseEducationPeriod = (period: string): string | undefined => {
  if (!period) return undefined;

  return period;
};

export default function ProfileTab() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("resume");
  const { user, profile, updateProfile, setuser, setprofile } = useUser();
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [httpMethod, sethttpMethod] = useState<string>("PUT");
  const [token, setToken] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [modalType, setModalType] = useState<
    "education" | "experience" | "certificate" | null
  >(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  // Add these state variables
  const [documentValues, setDocumentValues] = useState<Record<number, any>>({});
  const [certificates, setCertificates] = useState([
    {
      clientId: uuidv4(),
      name: "",
      issuer: "",
      date: "",
      description: "",
      file: null,
    },
  ]);

  const [loadingApplications, setLoadingApplications] = useState(false);
  const [documentUploadModal, setDocumentUploadModal] = useState<{
    isOpen: boolean;
    applicationId: string;
    documents: any[];
  }>({
    isOpen: false,
    applicationId: "",
    documents: [],
  });
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const hasApplicationsWithDocuments = useMemo(() => {
    return applications.some(
      (application) =>
        application.documents &&
        application.documents.length > 0 &&
        application.documents.some((doc: any) => doc.status === "requested")
    );
  }, [applications]);

  const tabs = useMemo(() => {
    const baseTabs = [
      { id: "profile", label: "Profile" },
      { id: "education", label: "Education" },
      { id: "experiences", label: "Experiences" },
      { id: "certifications", label: "Certifications" },
      { id: "schedule", label: "Schedule" },
      { id: "resume", label: "Resume & Jobs" },
      { id: "jobsApplied", label: "Jobs Applied" },
    ];

    return baseTabs;
  }, [hasApplicationsWithDocuments]);

  // Add this useEffect to fetch applications on component mount
  useEffect(() => {
    if (user?.id) {
      fetchUserApplications();
    }
  }, [user?.id]);

  // Keep the existing useEffect for refreshing when tab becomes active
  useEffect(() => {
    if (activeTab === "jobsApplied" && user?.id) {
      fetchUserApplications();
    }
  }, [activeTab, user?.id]);

  const fetchUserApplications = async () => {
    if (!user?.id) return;

    setLoadingApplications(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/application/allApplicationsOfUser?userId=${user.id}`
      );

      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        console.error("Failed to fetch applications");
        toast.error("Failed to load applications");
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Error loading applications");
    } finally {
      setLoadingApplications(false);
    }
  };

  const updateDocumentValue = (docId: number, field: string, value: string) => {
    setDocumentValues((prev) => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        [field]: value,
      },
    }));
  };

  const submitTextDocument = async (
    applicationId: string,
    docId: number,
    value: any
  ) => {
    setUploadingDocument(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/application/${applicationId}/documents/${docId}/text`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            docId === 6 ? { bankDetails: value } : { value }
          ),
        }
      );

      if (response.ok) {
        toast.success("Document submitted successfully!");
        fetchUserApplications();
        setDocumentUploadModal({
          isOpen: false,
          applicationId: "",
          documents: [],
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to submit document");
      }
    } catch (error) {
      console.error("Error submitting document:", error);
      toast.error("Error submitting document");
    } finally {
      setUploadingDocument(false);
    }
  };

  useEffect(() => {
    if (activeTab === "jobsApplied") {
      fetchUserApplications();
    }
  }, [activeTab, user?.id]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "jobsApplied") {
      setActiveTab("jobsApplied");
    }
  }, [searchParams]);

  useEffect(() => {
    // Only runs on the client
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const uploadDocument = async (
    applicationId: string,
    docId: number,
    file: File
  ) => {
    setUploadingDocument(true);
    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("docId", docId.toString());

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/application/${applicationId}/upload-document`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        toast.success("Document uploaded successfully!");
        // Refresh applications to get updated status
        fetchUserApplications();
        // Close modal
        setDocumentUploadModal({
          isOpen: false,
          applicationId: "",
          documents: [],
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to upload document");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Error uploading document");
    } finally {
      setUploadingDocument(false);
    }
  };

  const getLocationDisplay = (location: any) => {
    if (!location) return "";
    if (typeof location === "string") return location;
    if (typeof location === "object" && location.address)
      return location.address;
    return "";
  };

  const [profileData, setProfileData] = useState<any>(() => {
    try {
      if (profile && profile._id && profile.name) {
        const transformedProfile = {
          profile: {
            bio: profile.bio || "",
            skills: profile.skills || [],
            languages: [],
            unavailability: profile.unavailability || [],
            location: null,
            phoneNumber: profile.phoneNumber || "",
          },
          education:
            profile.education?.map((edu: any, index: any) => ({
              id: index + 1,
              type: edu.Degree || "Degree",
              period: edu.period,
              institution: edu.institure || edu.institute || "",
              description: edu.GPA ? `GPA: ${edu.GPA}` : "",
            })) || [],
          experiences: profile.WorkExperience?.map((exp: any, index: any) => ({
            id: index + 1,
            title: exp.title,
            company: exp.company,
            period: "",
            description: exp.description,
            points:
              exp.points ||
              (exp.description
                ? convertDescriptionToPoints(exp.description).map(
                    (point: string) => ({ point })
                  )
                : []),
          })),

          schedule: {
            availability: "Monday - Friday, 9:00 AM - 6:00 PM EST",
            timezone: "Eastern Standard Time",
            preferredMeetingTimes: ["10:00 AM - 12:00 PM", "2:00 PM - 4:00 PM"],
          },
          certifications:
            profile.certificates?.map((cert: any, index: any) => ({
              id: index + 1,
              name: cert.name || "",
              issuer: cert.issuer || "",
              date: cert.date || "",
              description: cert.description || "",
              certificateUrl: cert.fileUrl || "",
              certificateFileName: cert.fileName || "",
              certificateMime: cert.mimeType || "",
            })) || [],
        };
        return transformedProfile;
      }

      // Check if we're in the browser before accessing localStorage
      if (
        typeof window !== "undefined" &&
        typeof localStorage !== "undefined"
      ) {
        const savedProfile = localStorage.getItem("profileData");
        if (savedProfile) {
          const parsedProfile = JSON.parse(savedProfile);
          return parsedProfile;
        }
      }

      return initialProfileData;
    } catch (error) {
      console.error("Error parsing profile data:", error);
      return initialProfileData;
    }
  });
  const [newCertificatesFiles, setNewCertificatesFiles] = useState<File[]>([]);
  const [newCertificatesMeta, setNewCertificatesMeta] = useState<any[]>([]);

  const [editingItem, setEditingItem] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({
    experiences: [{ company: "", title: "", points: [] }], // Updated structure
  });
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [showJobMatching, setShowJobMatching] = useState(false);
  const [previewCert, setPreviewCert] = useState<{
    url: string;
    name?: string;
    type?: string;
  } | null>(null);
  const router = useRouter();

  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState("");
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] =
    useState(false);
  const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: "",
    location: "",
    phone: "",
    bio: "",
    skills: "",
    languages: "",
    unavailability: "",
    locationData: null as { lat: number; lng: number; address: string } | null,
  });
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  const [showAvailabilityCalendar, setShowAvailabilityCalendar] =
    useState(false);
  const [selectedAvailabilitySlots, setSelectedAvailabilitySlots] = useState<
    string[]
  >([]);
  const [showLocationMap, setShowLocationMap] = useState(false);

  // New state for availability slot management
  const [availabilitySlots, setAvailabilitySlots] = useState<any[]>(
    profileData.profile.unavailability || []
  );
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [newAvailabilityDate, setNewAvailabilityDate] = useState("");
  const [newAvailabilityStartDate, setNewAvailabilityStartDate] = useState("");
  const [newAvailabilityEndDate, setNewAvailabilityEndDate] = useState("");

  // Map search query state
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const getProfileId = () => {
    return profile?._id || null;
  };
  // Check if profile is complete
  const isProfileComplete = () => {
    return (
      profileFormData.name &&
      profileFormData.location &&
      profileData.profile.bio &&
      profileData.profile.skills.length > 0 &&
      profileData.profile.languages.length > 0
    );
  };
  // Add this function near the top of your component, after the imports

  const handleCertificateFileChange = (file: File | null, meta: any = {}) => {
    if (!file) return;
    setNewCertificatesFiles((prev) => [...prev, file]);
    setNewCertificatesMeta((prev) => [...prev, meta]);
  };

  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const userId = user?.id;

  useEffect(() => {
    const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
    const activeTabElement = tabsRef.current[activeIndex];

    if (activeTabElement) {
      setIndicatorStyle({
        left: activeTabElement.offsetLeft,
        width: activeTabElement.offsetWidth,
      });
    }
  }, [activeTab, tabs]);

  useEffect(() => {
    if (profileData.profile.unavailability) {
      setAvailabilitySlots(profileData.profile.unavailability);
    }
  }, [profileData.profile.unavailability]);

  useEffect(() => {
    if (profile?.profile_image_url) {
      setProfilePicture(profile.profile_image_url);
    }
  }, [profile]);

  // Profile picture upload handler
  const handleProfilePictureUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploadingProfilePicture(true);

    try {
      const formData = new FormData();
      formData.append("profilePicture", file);
      formData.append("userId", user.id);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/profile/upload-profile-picture`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
      }

      const result = await response.json();
      setProfilePicture(result.profile_image_url);
      updateProfile?.(result.profile);
      toast.success("Profile picture uploaded successfully!");
      setIsProfilePictureModalOpen(false);
    } catch (error: any) {
      console.error("Profile picture upload failed:", error);
      toast.error(error.message || "Failed to upload profile picture");
    } finally {
      setUploadingProfilePicture(false);
      // Reset file input
      if (profileFileInputRef.current) {
        profileFileInputRef.current.value = "";
      }
    }
  };

  // Profile picture removal handler
  const handleRemoveProfilePicture = async () => {
    if (!user?.id) return;

    setUploadingProfilePicture(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/profile/remove-profile-picture`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Removal failed");
      }

      const result = await response.json();
      setProfilePicture("");
      updateProfile?.(result.profile);
      toast.success("Profile picture removed successfully!");
      setIsProfilePictureModalOpen(false);
    } catch (error: any) {
      console.error("Profile picture removal failed:", error);
      toast.error(error.message || "Failed to remove profile picture");
    } finally {
      setUploadingProfilePicture(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        if (profile && profile._id && profile.name) {
          // Helper function to safely convert description to points
          const safeConvertDescriptionToPoints = (
            description: string
          ): string[] => {
            if (!description) return [];

            // Split by common bullet point indicators
            const points = description
              .split(/[\n•\-*]/)
              .map((point) => point.trim())
              .filter((point) => point.length > 0 && point.length > 5)
              .map((point) => point.replace(/^[-*•]\s*/, ""));

            return points.length > 0 ? points : [description];
          };

          const transformedProfile = {
            profile: {
              bio: profile.bio || "",
              skills: profile.skills || [],
              languages: profile.languages || ["English (Native)"],
              phoneNumber: profile.phoneNumber || "",
              unavailability:
                profile.unavailability?.map((slot: any) => {
                  const formatDate = (dateStr: string) => {
                    const date = new Date(dateStr);
                    return date.toLocaleDateString("en-GB");
                  };
                  return {
                    startDate: slot.startDate,
                    endDate: slot.endDate,
                    description: `Unavailable from ${formatDate(
                      slot.startDate
                    )} to ${formatDate(slot.endDate)}`,
                  };
                }) || [],

              location: profile.locationData || null,
            },
            education:
              profile.education?.map((edu: any, index: any) => ({
                id: index + 1,
                type: edu.Degree || "Degree",
                period: edu.period || "", // Use period directly as string
                institution: edu.institure || edu.institute || "",
                description: edu.GPA ? `GPA: ${edu.GPA}` : "",
              })) || [],
            experiences:
              profile.WorkExperience?.map((exp: any, index: any) => ({
                id: index + 1,
                title: exp.title || "",
                company: exp.company || "",
                period:
                  exp.period ||
                  `${exp.startDate || ""} - ${exp.endDate || ""}`
                    .trim()
                    .replace(/^-|-$/g, "") ||
                  "", // Use period directly as string
                description: exp.description || "",
                points:
                  exp.points ||
                  (exp.description
                    ? safeConvertDescriptionToPoints(exp.description).map(
                        (point: string) => ({ point })
                      )
                    : []), // Preserve points structure
              })) || [],
            schedule: {
              availability: "Monday - Friday, 9:00 AM - 6:00 PM EST",
              timezone: "Eastern Standard Time",
              preferredMeetingTimes: [
                "10:00 AM - 12:00 PM",
                "2:00 PM - 4:00 PM",
              ],
            },
            certifications:
              profile.certificates?.map((cert: any, index: any) => ({
                id: index + 1,
                name: cert.name || "",
                issuer: cert.issuer || "",
                date: cert.date || "",
                description: cert.description || "",
                certificateUrl: cert.fileUrl || "",
                certificateFileName: cert.fileName || "",
                certificateMime: cert.mimeType || "",
              })) || [],
          };

          setProfileData(transformedProfile);
        } else {
          // Try to load from localStorage only on the client
          const savedProfile = localStorage.getItem("profileData");
          if (savedProfile) {
            const parsedProfile = JSON.parse(savedProfile);
            setProfileData(parsedProfile);
          }
        }
      } catch (error) {
        console.error("Error parsing profile data:", error);
        // Set fallback data instead of keeping undefined state
        setProfileData({
          profile: {
            bio: "",
            skills: [],
            languages: ["English"],
            phoneNumber: "",
            unavailability: [],
            location: null,
          },
          education: [],
          experiences: [],
          schedule: {
            availability: "Monday - Friday, 9:00 AM - 6:00 PM EST",
            timezone: "Eastern Standard Time",
            preferredMeetingTimes: ["10:00 AM - 12:00 PM", "2:00 PM - 4:00 PM"],
          },
          certifications: [],
        });
      }
    }
  }, [profile]);

  const renderProfilePicture = () => {
    return (
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {profilePicture ? (
              <img
                src={profilePicture || "/placeholder.svg"}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={() => {
                  setProfilePicture("");
                  toast.error("Failed to load profile picture");
                }}
              />
            ) : (
              <span className="text-gray-500 font-bold text-lg sm:text-xl">
                {profile?.name
                  ? profile.name.charAt(0).toUpperCase()
                  : user?.name
                  ? user.name.charAt(0).toUpperCase()
                  : "?"}
              </span>
            )}
          </div>

          {/* Upload button overlay */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsProfilePictureModalOpen(true)}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
            title="Change profile picture"
          >
            <Edit2 className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1 break-words whitespace-normal sm:whitespace-nowrap sm:truncate">
            {profile?.name || user?.name || "Unknown User"}
          </h2>
          <p className="text-gray-500 text-sm sm:text-base break-words">
            {getLocationDisplay(profile?.location)}
          </p>
        </div>
      </div>
    );
  };

  const handleProfileSave = async () => {
    try {
      setIsLoading(true);

      const formData = new FormData();

      // Always include userId (required)
      if (user?.id) {
        formData.append("userId", user.id);
      }

      // Only append if field has been changed and is valid
      if (
        profileFormData.name?.trim() &&
        profileFormData.name !== (profile?.name || user?.name)
      ) {
        formData.append("name", profileFormData.name);
      }

      if (
        profileFormData.phone?.trim() &&
        profileFormData.phone !== profile?.phoneNumber
      ) {
        formData.append("phoneNumber", profileFormData.phone);
      }

      if (profileFormData.bio?.trim() && profileFormData.bio !== profile?.bio) {
        formData.append("bio", profileFormData.bio);
      }

      // Handle skills only if changed
      const skillsArray: string[] = profileFormData.skills
        ? profileFormData.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter((skill) => skill)
        : [];

      if (skillsArray.length > 0) {
        const currentSkills = JSON.stringify(profile?.skills || []);
        const newSkills = JSON.stringify(skillsArray);
        if (currentSkills !== newSkills) {
          formData.append("skills", newSkills);
        }
      }

      // Handle languages only if changed
      const languagesArray: string[] = profileFormData.languages
        ? profileFormData.languages
            .split(",")
            .map((lang) => lang.trim())
            .filter((lang) => lang)
        : [];

      if (languagesArray.length > 0) {
        const currentLangs = JSON.stringify(profile?.languages || []);
        const newLangs = JSON.stringify(languagesArray);
        if (currentLangs !== newLangs) {
          formData.append("languages", newLangs);
        }
      }

      // Handle availability only if changed
      // Handle availability only if changed
      // Around line 2200 in handleProfileSave
      if (availabilitySlots && availabilitySlots.length > 0) {
        const currentAvailability = JSON.stringify(
          profile?.unavailability || []
        );
        const newAvailability = JSON.stringify(availabilitySlots);
        if (currentAvailability !== newAvailability) {
          formData.append("unavailability", newAvailability); // ✅ Changed from "availability"
        }
      }

      // Handle location data properly
      if (
        profileFormData.locationData?.lat &&
        profileFormData.locationData?.lng &&
        profileFormData.locationData?.address
      ) {
        const locationData = {
          lat: profileFormData.locationData.lat,
          lng: profileFormData.locationData.lng,
          address:
            profileFormData.locationData.address || profileFormData.location,
        };

        const currentLocationData = JSON.stringify(profile?.locationData || {});
        const newLocationData = JSON.stringify(locationData);
        if (currentLocationData !== newLocationData) {
          formData.append("locationData", newLocationData);
        }
      } else if (
        profileFormData.location?.trim() &&
        profileFormData.location !== profile?.location
      ) {
        formData.append("location", profileFormData.location);
      }

      // Handle education only if there are valid entries and they've changed
      const validEducation =
        profileData.education
          ?.filter((edu: any) => edu.institution && edu.institution.trim())
          .map((edu: any) => ({
            institure: edu.institution || edu.institure,
            Graduation: parseEducationPeriod(edu.period),
            Degree: edu.type || edu.Degree,
            GPA: edu.description?.includes("GPA")
              ? edu.description.replace("GPA: ", "")
              : edu.GPA,
          })) || [];

      if (validEducation.length > 0) {
        const currentEducation = JSON.stringify(profile?.education || []);
        const newEducation = JSON.stringify(validEducation);
        if (currentEducation !== newEducation) {
          formData.append("education", newEducation);
        }
      }

      // Handle work experience only if there are valid entries and they've changed
      const validWorkExperience =
        profileData.experiences
          ?.filter((exp: any) => exp.company && exp.company.trim())
          .map((exp: any) => ({
            company: exp.company,
            title: exp.title,
            points: exp.points || [],
            description:
              exp.points && exp.points.length > 0
                ? exp.points.map((p: any) => p.point).join("\n")
                : exp.description || "",
          })) || [];

      if (validWorkExperience.length > 0) {
        const currentExperience = JSON.stringify(profile?.WorkExperience || []);
        const newExperience = JSON.stringify(validWorkExperience);
        if (currentExperience !== newExperience) {
          formData.append("WorkExperience", newExperience);
        }
      }

      // Handle certificates only if there are valid entries and they've changed


      // Only make API call if we have data to send (besides userId)
      let hasDataToSend = false;
      for (const pair of formData.entries()) {
        if (pair[0] !== "userId") {
          hasDataToSend = true;
          break;
        }
      }

      if (!hasDataToSend) {
        toast.info("No changes detected to save.");
        setIsProfileEditOpen(false);
        return;
      }

      const apiUrl = profile?._id
        ? `${process.env.NEXT_PUBLIC_API_URL}/profile/edit-profile/${profile._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/profile/create-profile`;
      const method = profile?._id ? "PUT" : "POST";

      const response = await fetch(apiUrl, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const result = await response.json();
      if (result.profile) {
        updateProfile!(result.profile);
      }

      toast.success("Profile updated successfully!");
      setIsProfileEditOpen(false);
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Availability slot management functions
  const addAvailabilitySlot = () => {
    if (newAvailabilityStartDate && newAvailabilityEndDate) {
      try {
        const startDate = new Date(newAvailabilityStartDate);
        const endDate = new Date(newAvailabilityEndDate);

        // Validate dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          toast.error("Invalid date format");
          return;
        }

        if (endDate <= startDate) {
          toast.error("End date must be after start date");
          return;
        }

        const newSlot = {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          description: `Unavailable from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
        };

        // Check for duplicates
        const isDuplicate = availabilitySlots.some(
          (slot) =>
            slot.startDate === newSlot.startDate &&
            slot.endDate === newSlot.endDate
        );

        if (!isDuplicate) {
          setAvailabilitySlots([...availabilitySlots, newSlot]);
          toast.success("Availability slot added successfully");
        } else {
          toast.warning("This availability slot already exists");
        }

        // Reset form
        setNewAvailabilityStartDate("");
        setNewAvailabilityEndDate("");
        setShowAvailabilityModal(false);
      } catch (error) {
        console.error("Error adding availability slot:", error);
        toast.error("Error adding availability slot");
      }
    } else {
      toast.error("Please select both start and end dates");
    }
  };

  const removeAvailabilitySlot = (slotToRemove: any) => {
    setAvailabilitySlots(
      availabilitySlots.filter(
        (slot) =>
          slot.startDate !== slotToRemove.startDate ||
          slot.endDate !== slotToRemove.endDate
      )
    );
    toast.success("Availability slot removed");
  };
  // Add this function after the imports and before the component
  const convertDescriptionToPoints = (description: string): string[] => {
    if (!description) return [""];

    // Split by common bullet point indicators
    const points = description
      .split(/[\n•\-*]/)
      .map((point) => point.trim())
      .filter((point) => point.length > 0 && point.length > 5) // Filter very short points
      .map((point) => point.replace(/^[-*•]\s*/, ""));

    return points.length > 0 ? points : [description];
  };

  // Handle map location selection
  const handleMapLocationSelect = (location: {
    lat: number;
    lng: number;
    address: string;
  }) => {
    setProfileFormData((prev) => ({
      ...prev,
      location: location.address,
      locationData: location,
    }));
  };

  const openProfileEditModal = () => {
    console.log("profileData is :", profileData);

    // Correctly sync internal state with current profile data
    setProfileFormData({
      name: profile?.name || user?.name || "",
      location: profile?.location || "",
      phone: profileData.profile.phoneNumber || "",
      bio: profileData.profile.bio || "",
      skills: profileData.profile.skills.join(", ") || "",
      languages: profileData.profile.languages.join(", ") || "",
      unavailability: profileData.profile.unavailability?.join(", ") || "",
      locationData: profileData.profile.location || null,
    });

    // ✅ FIXED: Don't wrap in extra array!
    setAvailabilitySlots(profileData.profile.unavailability || []);

    // Clear certificate states to prevent duplication
    setNewCertificatesFiles([]);
    setNewCertificatesMeta([]);

    // Clear map search query
    setMapSearchQuery("");

    setIsProfileEditOpen(true);
  };

  const updateProfileAPI = async (updatedData: UpdatedData) => {
    try {
      setIsLoading(true);

      const fd = new FormData();

      // Always include userId (required)
      if (user?.id) {
        fd.append("userId", user.id);
      }

      // Profile sub-object - only if exists and has content
      if (updatedData.profile) {
        if (updatedData.profile.bio && updatedData.profile.bio.trim()) {
          fd.append("bio", updatedData.profile.bio);
        }
        if (
          updatedData.profile.skills &&
          updatedData.profile.skills.length > 0
        ) {
          fd.append("skills", JSON.stringify(updatedData.profile.skills));
        }
        if (
          updatedData.profile.languages &&
          updatedData.profile.languages.length > 0
        ) {
          fd.append("languages", JSON.stringify(updatedData.profile.languages));
        }
        if (
          updatedData.profile.availability &&
          updatedData.profile.availability.length > 0
        ) {
          fd.append(
            "availability",
            JSON.stringify(updatedData.profile.availability)
          );
        }
      }

      // Simple text fields - only if changed and valid
      if (
        profileFormData.name?.trim() &&
        profileFormData.name !== (profile?.name ?? user?.name)
      ) {
        fd.append("name", profileFormData.name);
      }

      // Location handling - only if valid data exists
      if (
        profileFormData.locationData?.lat &&
        profileFormData.locationData?.lng &&
        profileFormData.locationData?.address
      ) {
        fd.append("locationData", JSON.stringify(profileFormData.locationData));
      } else if (
        profileFormData.location?.trim() &&
        profileFormData.location !== profile?.location
      ) {
        fd.append("location", profileFormData.location);
      }

      // Phone - only if valid and different
      if (
        profileFormData.phone?.trim() &&
        profileFormData.phone !== profile?.phoneNumber
      ) {
        fd.append("phoneNumber", profileFormData.phone);
      }

      // Complex arrays - only process and send if data exists
      if (
        updatedData.education &&
        Array.isArray(updatedData.education) &&
        updatedData.education.length > 0
      ) {
        const processed = processEducation(updatedData.education);
        if (processed.length > 0) {
          fd.append("education", JSON.stringify(processed));
        }
      }

      if (
        updatedData.experiences &&
        Array.isArray(updatedData.experiences) &&
        updatedData.experiences.length > 0
      ) {
        const processed = processExperiences(updatedData.experiences);
        if (processed.length > 0) {
          fd.append("WorkExperience", JSON.stringify(processed));
        }
      }

      if (
        updatedData.certifications &&
        Array.isArray(updatedData.certifications) &&
        updatedData.certifications.length > 0
      ) {
        const processed: any = processCerts(updatedData.certifications);
        if (processed.length > 0) {
          fd.append("certificates", JSON.stringify(processed));
        }
      }

      // API call
      const res = await fetch(
        profile?._id
          ? `${process.env.NEXT_PUBLIC_API_URL}/profile/edit-profile/${profile._id}`
          : `${process.env.NEXT_PUBLIC_API_URL}/profile/create-profile`,
        { method: profile?._id ? "PUT" : "POST", body: fd }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(
          `HTTP ${res.status}: ${err.message ?? "Unknown error"}`
        );
      }

      const result = await res.json();
      if (result.profile) updateProfile!(result.profile);

      toast.success("Profile updated successfully!");
      setIsProfileEditOpen(false);
    } catch (e: any) {
      console.error("Failed to update profile", e);
      toast.error(e.message ?? "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.signedUpAs === "Company") {
      toast.info(
        "You are signed up as a company. Redirecting to company profile..."
      );
      router.push("/company/profile");
    }
  }, [user, router]);

  const renderStars = () => {
    const rating = profile?.averageRating || 0;

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= Math.floor(rating);
          const isHalfFilled = star === Math.ceil(rating) && rating % 1 !== 0;

          return (
            <motion.div
              key={star}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              {isHalfFilled ? (
                <div className="relative">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-gray-300 text-gray-300" />
                  <div className="absolute inset-0 overflow-hidden w-1/2">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
              ) : (
                <Star
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    isFilled
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-300 text-gray-300"
                  }`}
                />
              )}
            </motion.div>
          );
        })}
        <span className="ml-2 text-sm text-gray-600">
          {rating.toFixed(1)} ({profile?.totalJobsCompleted || 0} jobs
          completed)
        </span>
      </div>
    );
  };

  const renderAddCard = (
    title: string,
    description: string,
    buttonText: string,
    icon: React.ReactNode,
    type: "education" | "experience" | "certificate"
  ) => {
    return (
      <motion.div
        variants={cardVariants}
        whileHover={{
          y: -4,
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white rounded-xl p-6 sm:p-8 shadow-sm text-center border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-4"
        >
          {icon}
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4"
        >
          {title}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8"
        >
          {description}
        </motion.p>
        <motion.button
          onClick={() => {
            if (type === "certificate") {
              handleAddCertificate(); // adds new certificate
              openModal("certificate"); // opens the modal UI
            } else {
              openModal(type);
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-full transition-colors text-sm sm:text-base"
        >
          {buttonText}
        </motion.button>
      </motion.div>
    );
  };

  const openEditModal = (
    type: "education" | "experience" | "certificate",
    item: any
  ) => {
    setModalType(type);
    setEditingItem(item);
    setIsEditMode(true);
    setFormData(item);
    if (type === "experience") {
      const formDataWithPoints = {
        ...item,
        points:
          item.points ||
          (item.description
            ? convertDescriptionToPoints(item.description).map(
                (point: string) => ({ point })
              )
            : []),
      };
      setFormData(formDataWithPoints);
    } else {
      setFormData(item);
    }
    setIsModalOpen(true);
  };

  const openModal = (type: "education" | "experience" | "certificate") => {
    setModalType(type);
    setEditingItem(null);
    setIsEditMode(false);
    setFormData({});
    setIsModalOpen(true);
  };
  const handleAddCertificate = () => {
    openModal("certificate");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setEditingItem(null);
    setIsEditMode(false);
    setFormData({});
    setPreviewCert(null);
    setNewCertificatesFiles([]);
    setNewCertificatesMeta([]);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateSpecificSectionAPI = async (
    sectionType: string,
    sectionData: any
  ) => {
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("userId", user?.id!);

      /********* 1) WORK EXPERIENCE *********/
      if (sectionType === "experience" || sectionType === "workExp") {
        /*  – keep only rows that have a company name
          – preserve points[] exactly as stored
          – keep period as a raw string                                       */
        const validExperiences = sectionData
          .filter((exp: any) => (exp.company || "").trim().length > 0)
          .map((exp: any) => ({
            company: exp.company,
            title: exp.title,
            period: exp.period || "", // e.g. "Mar 2023 – Present"
            points: exp.points || [], // already an array of { point }
            // only send description when no points exist
            description:
              exp.points && exp.points.length > 0 ? "" : exp.description || "",
          }));

        formData.append("WorkExperience", JSON.stringify(validExperiences));
      }
      if (sectionType === "unavailability") {
        const validSlots = sectionData
          .filter((slot: any) => slot.startDate && slot.endDate)
          .map((slot: any) => ({
            startDate: slot.startDate,
            endDate: slot.endDate,
            description: slot.description || "",
          }));

        formData.append("unavailability", JSON.stringify(validSlots));
      }
      /********* 2) EDUCATION *********/
      if (sectionType === "education") {
        const validEducation = sectionData
          .filter((edu: any) => (edu.institution || "").trim().length > 0)
          .map((edu: any) => ({
            institure: edu.institution, // backend field name
            period: edu.period || "", // e.g. "2021 – 2024"
            Degree: edu.type || edu.Degree,
            description: edu.description || "",
            GPA: edu.description?.startsWith("GPA")
              ? edu.description.replace(/GPA:\s*/i, "")
              : edu.GPA,
          }));

        formData.append("education", JSON.stringify(validEducation));
      }

      if (sectionType === "certificate") {
        // ✅ FIXED: Only append NEW files that are File objects
        const allCertificateDetails = sectionData.map((c: any) => ({
          _id: c.id || c._id, // Preserve existing IDs
          name: c.name || "Certificate",
          issuer: c.issuer || "Not Specified",
          date: c.date || new Date().toISOString().split("T")[0],
          description: c.description || "",
          // Keep existing file info
          fileUrl: c.certificateUrl || c.fileUrl || "",
          fileName: c.certificateFileName || c.fileName || "",
          mimeType: c.certificateMime || c.mimeType || "",
        }));

        formData.append("certificates", JSON.stringify(allCertificateDetails));

        // ✅ CRITICAL FIX: Only append files that are NEW File objects
        // Do NOT append if cert.file is undefined, null, or a string URL
        sectionData.forEach((cert: any, index: number) => {
          if (cert.file && cert.file instanceof File && cert.file.size > 0) {
            const renamedFile = new File(
              [cert.file],
              `${index}__${cert.file.name}`,
              { type: cert.file.type }
            );
            formData.append("certificateFiles", renamedFile);
          }
        });
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/profile/edit-profile/${profile?._id}`;
      const response = await fetch(apiUrl, { method: "PUT", body: formData });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Update failed");
      }

      const result = await response.json();
      if (result.profile) updateProfile!(result.profile);
      return result;
    } catch (error: any) {
      console.error(`Error updating ${sectionType}:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let updatedSection;

      if (modalType === "experience") {
        const experienceData = {
          ...formData,
          // Ensure points are preserved as array
          points: formData.points || [],
          period: formData.period || "",
          // Don't create description from points here - let backend handle it
          description: formData.description || "",
        };

        if (isEditMode && editingItem) {
          updatedSection = profileData.experiences.map((item: any) =>
            item.id === editingItem.id ? { ...item, ...experienceData } : item
          );
        } else {
          // Add new item
          const newItem = { ...experienceData, id: Date.now() };
          updatedSection = [...profileData.experiences, newItem];
        }
      } else if (modalType === "education") {
        const educationData = {
          ...formData,
          period: formData.period || "", // Handle period as string
        };

        if (isEditMode && editingItem) {
          // Update existing education item
          updatedSection = profileData.education.map((item: any) =>
            item.id === editingItem.id ? { ...item, ...educationData } : item
          );
        } else {
          // Add new education item
          const newItem = { ...educationData, id: Date.now() };
          updatedSection = [...profileData.education, newItem];
        }
      } // In your handleSubmit function (around line 2590), replace the certificate handling section:
      else if (modalType === "certificate") {
        // Handle certificate with file
        const certificateData = { ...formData };

        // ✅ FIXED: Only attach file if a NEW file was selected
        if (newCertificatesFiles.length > 0) {
          const latestFile =
            newCertificatesFiles[newCertificatesFiles.length - 1];
          // Double-check it's actually a File object
          if (latestFile instanceof File) {
            certificateData.file = latestFile;
          }
        }

        // ✅ CRITICAL: Remove file property if no new file selected
        if (!certificateData.file || !(certificateData.file instanceof File)) {
          delete certificateData.file;
        }

        if (isEditMode && editingItem) {
          updatedSection = profileData.certifications.map((item: any) =>
            item.id === editingItem.id
              ? { ...item, ...certificateData, file: certificateData.file }
              : item
          );
        } else {
          const newItem = { ...certificateData, id: Date.now() };
          updatedSection = [...profileData.certifications, newItem];
        }
      }

      if (updatedSection) {
        // Update local state optimistically
        setProfileData((prev: any) => ({
          ...prev,
          [modalType === "certificate"
            ? "certifications"
            : modalType === "education"
            ? "education"
            : "experiences"]: updatedSection,
        }));

        // Call API
        await updateSpecificSectionAPI(modalType!, updatedSection);
        setNewCertificatesFiles([]);
        setNewCertificatesMeta([]);
        toast.success(`${modalType} updated successfully!`);
        closeModal();
      }
    } catch (error: any) {
      console.error("Failed to update:", error);
      toast.error(error.message || "Update failed. Please try again.");
      // Revert optimistic update on error
      setProfileData(profileData);
    }
  };

  const handleProfileFieldUpdate = async (field: string, value: any) => {
    try {
      const updatedProfileData = {
        ...profileData,
        profile: {
          ...profileData.profile,
          [field]: value,
        },
      };

      setProfileData(updatedProfileData);
      await updateProfileAPI(updatedProfileData);
      localStorage.setItem("profile", JSON.stringify(updatedProfileData));
    } catch (error) {
      console.error("Failed to update profile field:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const renderModal = () => {
    if (!isModalOpen || !modalType) return null;

    const modalContent = {
      education: {
        title: isEditMode ? "Edit Education" : "Add Education",
        fields: [
          {
            name: "type",
            label: "Degree Type",
            placeholder: "e.g., Bachelor's, Master's",
          },
          {
            name: "institution",
            label: "Institution",
            placeholder: "University name",
          },
          {
            name: "period", // Changed from individual start/end dates
            label: "Period",
            placeholder: "e.g., 2020 - 2024, 2022 - Present",
          },
          {
            name: "description",
            label: "Description (Optional)",
            placeholder: "Additional details",
            type: "textarea",
          },
        ],
      },
      experience: {
        title: isEditMode ? "Edit Experience" : "Add Experience",
        fields: [
          {
            name: "title",
            label: "Job Title",
            placeholder: "e.g., Senior Software Engineer",
          },
          {
            name: "company",
            label: "Company",
            placeholder: "Company name",
          },
          {
            name: "period", // Changed from individual start/end dates
            label: "Period",
            placeholder: "e.g., March 2023 - Present, Jan 2022 - Aug 2024",
          },
        ],
      },
      certificate: {
        title: isEditMode ? "Edit Certificate" : "Add Certificate",
        fields: [
          {
            name: "name",
            label: "Certificate Name",
            placeholder: "e.g., AWS Solutions Architect",
          },
          {
            name: "issuer",
            label: "Issuing Organization",
            placeholder: "e.g., Amazon Web Services",
          },
          {
            name: "date",
            label: "Issue Date",
            placeholder: "e.g., March 2023",
          },
          {
            name: "description",
            label: "Description (Optional)",
            placeholder: "Additional details",
            type: "textarea",
          },
        ],
      },
    };

    const config = modalContent[modalType];

    const handleCertificateFileChange = (file: File | null, index?: number) => {
      if (!file) return;

      setNewCertificatesFiles((prev) => {
        const updatedFiles = [...prev];
        if (typeof index === "number") {
          updatedFiles[index] = file; // replace for that certificate only
        } else {
          updatedFiles.push(file);
        }
        return updatedFiles;
      });
    };

    const isPdf = (mime?: string, url?: string) =>
      (mime && mime.includes("pdf")) ||
      (url && url.toLowerCase().endsWith(".pdf"));

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-[#00000035] bg-opacity-10 flex items-center justify-center z-50 p-4 text-black"
          onClick={closeModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                {config.title}
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </motion.button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {config.fields.map((field: any, index) => (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      placeholder={field.placeholder}
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        handleInputChange(field.name, e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none h-20 sm:h-24 text-sm sm:text-base"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        handleInputChange(field.name, e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                    />
                  )}
                </motion.div>
              ))}

              {modalType === "certificate" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: config.fields.length * 0.1,
                    duration: 0.3,
                  }}
                  className="space-y-2"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificate File (image)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleCertificateFileChange(file);
                      }
                    }}
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {(formData.certificateUrl || formData.file) && (
                    <div className="mt-3 border border-gray-200 rounded-lg p-2">
                      <p className="text-xs text-gray-500 mb-2">
                        {formData.certificateFileName ||
                          formData.file?.name ||
                          "Selected file"}
                      </p>
                      {formData.file ? (
                        <div className="text-sm text-green-600">
                          New file selected: {formData.file.name}
                        </div>
                      ) : isPdf(
                          formData.certificateMime,
                          formData.certificateUrl
                        ) ? (
                        <iframe
                          src={formData.certificateUrl}
                          title="Certificate preview"
                          className="w-full h-64 rounded-md"
                        />
                      ) : (
                        <img
                          src={formData.certificateUrl || "/placeholder.svg"}
                          alt="Certificate preview"
                          className="w-full max-h-64 object-contain rounded-md"
                        />
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Special handling for experience points */}
              {modalType === "experience" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: config.fields.length * 0.1,
                    duration: 0.3,
                  }}
                  className="space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">
                      Key Responsibilities & Achievements
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const currentPoints = formData.points || [];
                        setFormData({
                          ...formData,
                          points: [...currentPoints, { point: "" }],
                        });
                      }}
                      className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Point
                    </button>
                  </div>

                  {/* Convert existing description to points if needed */}
                  {formData.description &&
                    (!formData.points || formData.points.length === 0) && (
                      <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800 mb-2">
                          Convert existing description to bullet points?
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            const points = convertDescriptionToPoints(
                              formData.description
                            );
                            setFormData({
                              ...formData,
                              points: points.map((point) => ({ point })),
                            });
                          }}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Convert to Points
                        </button>
                      </div>
                    )}

                  {/* Points Input */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(formData.points || []).map(
                      (pointObj: any, pointIndex: number) => (
                        <div
                          key={pointIndex}
                          className="flex items-start space-x-2"
                        >
                          <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-3"></div>
                          <div className="flex-grow">
                            <textarea
                              value={pointObj.point}
                              onChange={(e) => {
                                const newPoints = [...(formData.points || [])];
                                newPoints[pointIndex].point = e.target.value;
                                setFormData({ ...formData, points: newPoints });
                              }}
                              placeholder="Describe a specific responsibility or achievement..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              rows={2}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newPoints = formData.points.filter(
                                (_: any, i: number) => i !== pointIndex
                              );
                              setFormData({ ...formData, points: newPoints });
                            }}
                            className="flex-shrink-0 text-red-500 hover:text-red-700 mt-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    )}

                    {(!formData.points || formData.points.length === 0) && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            points: [{ point: "" }],
                          });
                        }}
                        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                      >
                        <Plus className="w-5 h-5 mx-auto mb-2" />
                        Add your first responsibility or achievement
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: (config.fields.length + 1) * 0.1,
                  duration: 0.3,
                }}
                className="flex flex-col sm:flex-row gap-3 pt-4"
              >
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 cursor-pointer sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  {isEditMode
                    ? "Save Changes"
                    : `Add ${
                        modalType === "certificate"
                          ? "Certificate"
                          : modalType === "education"
                          ? "Education"
                          : "Experience"
                      }`}
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // CHANGE: Add delete handler for education/experience/certificate items
  const handleDeleteItem = async (
    type: "education" | "experience" | "certificate",
    item: any
  ) => {
    try {
      const sectionKey =
        type === "certificate"
          ? "certifications"
          : type === "education"
          ? "education"
          : "experiences";

      // ✅ FIXED: Store the previous snapshot properly
      const prevSnapshot: any = { ...profileData };

      // Optimistic update
      const updatedSection = (profileData as any)[sectionKey].filter(
        (it: any) => it.id !== item.id
      );

      setProfileData((prev: any) => ({
        ...prev,
        [sectionKey]: updatedSection,
      }));

      // Persist change via existing API util
      await updateSpecificSectionAPI(type, updatedSection);
      toast.success(`${type} deleted successfully!`);
    } catch (error: any) {
      console.error("Failed to delete:", error);
      const prevSnapshot: any = { ...profileData };

      // ✅ FIXED: Properly revert using the stored snapshot
      setProfileData(prevSnapshot);

      toast.error(error?.message || "Failed to delete. Please try again.");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <motion.div
            key="profile"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-8 sm:space-y-12 text-black"
          >
            {!profileData.profile.bio ||
            profileData.profile.skills.length === 0 ? (
              <motion.div variants={itemVariants} className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Complete Your Profile
                </h3>
                <p className="text-gray-600 mb-6">
                  Add your information to get started
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openProfileEditModal}
                  className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full transition-colors"
                >
                  Add Profile Information
                </motion.button>
              </motion.div>
            ) : (
              <>
                <motion.div variants={itemVariants}>
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-black">
                    About
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base text-justify">
                    {profileData.profile.bio}
                  </p>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                    Skills
                  </h3>
                  <motion.div
                    className="flex flex-wrap gap-2 sm:gap-3"
                    variants={containerVariants}
                    transition={{ staggerChildren: 0.1 }}
                  >
                    {profileData.profile.skills.map(
                      (skill: string, index: number) => (
                        <motion.span
                          key={index}
                          variants={skillVariants}
                          whileHover={{ scale: 1.05, y: -2 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-medium cursor-default"
                        >
                          {skill}
                        </motion.span>
                      )
                    )}
                  </motion.div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                    Languages
                  </h3>
                  <motion.ul
                    className="space-y-2 sm:space-y-3"
                    variants={containerVariants}
                    transition={{ staggerChildren: 0.1 }}
                  >
                    {profileData.profile.languages.map(
                      (language: string, index: number) => (
                        <motion.li
                          key={index}
                          variants={itemVariants}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="text-gray-600 text-sm sm:text-base"
                        >
                          {language}
                        </motion.li>
                      )
                    )}
                  </motion.ul>
                </motion.div>

                {/* Availability Section */}
                {/* Availability Section */}
                {profileData.profile.unavailability.length > 0 && (
                  <motion.div variants={itemVariants}>
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                      Availability
                    </h3>
                    <motion.div
                      className="flex flex-wrap gap-2 sm:gap-3"
                      variants={containerVariants}
                      transition={{ staggerChildren: 0.1 }}
                    >
                      {profileData.profile.unavailability.map(
                        (slot: any, index: any) => (
                          <motion.div
                            key={index}
                            variants={skillVariants}
                            whileHover={{ scale: 1.05, y: -2 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-medium cursor-default flex items-center gap-2"
                          >
                            <Clock className="w-3 h-3" />
                            <span>
                              {typeof slot === "string"
                                ? slot
                                : slot.description}
                            </span>
                          </motion.div>
                        )
                      )}
                    </motion.div>
                  </motion.div>
                )}

                {/* Location Map Section */}
                {profileData.profile.location && (
                  <motion.div variants={itemVariants}>
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                      Location
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm sm:text-base">
                          {getLocationDisplay(profileData.profile.location)}{" "}
                          Location set
                        </span>
                      </div>
                      {profileData.profile.phoneNumber && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span className="text-sm sm:text-base">
                            Phone: {profileData.profile.phoneNumber}
                          </span>
                        </div>
                      )}
                      <OlaMapComponent
                        location={profileData.profile.location}
                        searchQuery=""
                        showAutoDetect={false}
                      />
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        );

      case "education":
        return (
          <motion.div
            key="education"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-4 sm:space-y-5"
          >
            {profileData.education.map((edu: any, index: any) => (
              <motion.div
                key={edu.id}
                variants={cardVariants}
                whileHover={{
                  y: -4,
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-white rounded-xl p-4 sm:p-5 shadow-sm relative group"
              >
                <motion.button
                  onClick={() => openEditModal("education", edu)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Edit education"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </motion.button>

                {/* CHANGE: Add delete button for education item */}
                <motion.button
                  onClick={() => handleDeleteItem("education", edu)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-12 right-3 p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
                  aria-label="Delete education"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </motion.button>

                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 pr-10">
                  {edu.type}
                </h3>

                <p className="text-gray-600 text-sm sm:text-base font-medium mb-2">
                  {edu.institution}
                </p>

                {/* Display period properly */}
                {edu.period && (
                  <p className="text-gray-500 text-sm sm:text-base mb-3 sm:mb-4 font-medium">
                    {edu.period}
                  </p>
                )}

                {/* Display description if exists */}
                {edu.description && (
                  <p className="text-gray-500 text-xs sm:text-sm">
                    {edu.description}
                  </p>
                )}
              </motion.div>
            ))}

            {renderAddCard(
              "Add Education",
              "Add your educational background to showcase your qualifications",
              "Add Education",
              <GraduationCap className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto" />,
              "education"
            )}
          </motion.div>
        );

      case "experiences":
        return (
          <motion.div
            key="experiences"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-4 sm:space-y-5"
          >
            {profileData.experiences.map((exp: any, index: any) => (
              <motion.div
                key={exp.id}
                variants={cardVariants}
                whileHover={{
                  y: -4,
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-white rounded-xl p-4 sm:p-6 shadow-sm relative group"
              >
                <motion.button
                  onClick={() => openEditModal("experience", exp)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Edit experience"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </motion.button>

                {/* CHANGE: Add delete button for experience item */}
                <motion.button
                  onClick={() => handleDeleteItem("experience", exp)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-12 right-3 p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
                  aria-label="Delete experience"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </motion.button>

                <div className="border-l-2 border-blue-200 pl-4 pr-10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {exp.title}
                    </h4>
                    {/* Display period in brackets */}
                    {exp.period && (
                      <span className="text-sm text-gray-500 mt-1 sm:mt-0 font-medium">
                        ({exp.period})
                      </span>
                    )}
                  </div>
                  <p className="text-blue-600 font-medium mb-3">
                    {exp.company}
                  </p>

                  {/* Render bullet points if they exist, otherwise fallback to description */}
                  {exp.points && exp.points.length > 0 ? (
                    <ul className="mt-2 space-y-1">
                      {exp.points.map((pointObj: any, pointIndex: number) => (
                        <li
                          key={pointIndex}
                          className="text-gray-600 text-sm flex items-start"
                        >
                          <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {pointObj.point || pointObj}
                        </li>
                      ))}
                    </ul>
                  ) : exp.description ? (
                    <div className="mt-2">
                      <ul className="space-y-1">
                        {convertDescriptionToPoints(exp.description).map(
                          (point: string, pointIndex: number) => (
                            <li
                              key={pointIndex}
                              className="text-gray-600 text-sm flex items-start"
                            >
                              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {point}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </motion.div>
            ))}

            {renderAddCard(
              "Add Work Experience",
              "Add your professional experience to showcase your career journey",
              "Add Experience",
              <Briefcase className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto" />,
              "experience"
            )}
          </motion.div>
        );

      case "jobsApplied":
        return (
          <motion.div
            key="jobsApplied"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                My Applications
              </h3>
              <span className="text-sm text-gray-500">
                {applications.length} applications
              </span>
            </div>

            {loadingApplications ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : applications.length === 0 ? (
              <motion.div variants={itemVariants} className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  No Applications Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  You haven't applied to any jobs yet. Start exploring
                  opportunities!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/jobs")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Browse Jobs
                </motion.button>
              </motion.div>
            ) : (
              <div className="relative space-y-4">
                {applications.map((application) => (
                  <div
                    key={application._id}
                    className="relative bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 mb-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          {application.job.title}
                          {/* Redirect Icon */}
                          <Link
                            href={`/jobs/details?id=${application.job._id}`}
                            className="text-blue-600 hover:text-blue-800 transition-all"
                            title="View Job Details"
                          >
                            <ArrowUpRight className="w-5 h-5 inline" />
                          </Link>
                        </h3>

                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                          {application.job.description}
                        </p>
                        <p className="text-gray-500 text-xs mt-2">
                          Applied on{" "}
                          {new Date(application.appliedDate).toLocaleDateString(
                            "en-GB"
                          )}
                        </p>

                        {/* Status Tag */}
                        <span
                          className={`inline-block mt-3 text-xs px-3 py-1 rounded-full ${
                            application.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : application.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {application.status.charAt(0).toUpperCase() +
                            application.status.slice(1)}
                        </span>
                      {application.documents.some(
                        (doc: any) => doc.status === "requested" && doc.inputType === "file"
                      ) && (
                        <div className="absolute bottom-4 right-4">
                          <button
                            className="flex items-center gap-2 px-5 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-base font-medium shadow-sm"
                            onClick={() =>
                              setDocumentUploadModal({
                                isOpen: true,
                                applicationId: application._id,
                                documents: application.documents.filter(
                                  (doc : any) => doc.status === "requested" && doc.inputType === "file"
                                ),
                              })
                            }
                          >
                            <Upload className="w-5 h-5" />
                            Upload Documents
                          </button>
                        </div>
                      )}
                      </div>
                    </div>



                  </div>
                ))}
              </div>
            )}
          </motion.div>
        );

      case "certifications":
        return (
          <motion.div
            key="certifications"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-4 sm:space-y-5"
          >
            {profileData.certifications.map((cert: any, index: any) => (
              <motion.div
                key={cert.id}
                variants={cardVariants}
                whileHover={{
                  y: -4,
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-white rounded-xl p-4 sm:p-6 shadow-sm relative group"
              >
                <motion.button
                  onClick={() => openEditModal("certificate", cert)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Edit certificate"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </motion.button>

                {/* CHANGE: Add delete button for certificate item */}
                <motion.button
                  onClick={() => handleDeleteItem("certificate", cert)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-12 right-3 p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
                  aria-label="Delete certificate"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </motion.button>

                <div className="pr-10">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    {cert.name}
                  </h3>
                  <p className="text-blue-600 font-medium mb-2">
                    {cert.issuer}
                  </p>
                  <p className="text-gray-500 text-sm mb-3">{cert.date}</p>

                  {cert.description && (
                    <p className="text-gray-600 text-sm mb-3">
                      {cert.description}
                    </p>
                  )}

                  {/* Show file info if exists */}
                  {cert.certificateUrl && (
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          window.open(cert.certificateUrl, "_blank")
                        }
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View Certificate
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {renderAddCard(
              "Add Certificate",
              "Add your certificates and achievements to showcase your qualifications",
              "Add Certificate",
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto" />,
              "certificate"
            )}
          </motion.div>
        );

      case "schedule":
        return (
          <motion.div
            key="schedule"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full"
          >
            <CalendarSection profileId={profile?._id} userId={user?.id} />
          </motion.div>
        );

      case "resume":
        return (
          <motion.div
            key="resume"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-6"
          >
            {!showJobMatching ? (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      AI Profile Creation
                    </h3>
                    {currentResumeId && (
                      <button
                        onClick={() => setShowJobMatching(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Search className="w-4 h-4" />
                        Find Matching Jobs
                      </button>
                    )}
                  </div>

                  <ResumeUpload
                    userId={userId ? userId : ""}
                    onUploadComplete={(data) => {
                      setCurrentResumeId(data.resumeId);
                    }}
                  />

                  {currentResumeId && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        <span className="text-green-800 font-medium">
                          Resume uploaded successfully!
                        </span>
                      </div>
                      <p className="text-green-700 text-sm mt-1">
                        You can now search for matching jobs using our
                        AI-powered matching system.
                      </p>
                    </div>
                  )}

                  <ApplicationDetailView />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    AI-Powered Job Matches
                  </h3>
                  <button
                    onClick={() => setShowJobMatching(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Resume
                  </button>
                </div>

                {currentResumeId && (
                  <JobMatching
                    resumeId={currentResumeId}
                    userId={userId ? userId : ""}
                  />
                )}
              </div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] overflow-x-hidden">
      {renderModal()}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-4 sm:top-8 left-4 sm:left-8"
      >
        <Link
          href="/"
          className="flex items-center gap-1 -mt-4 md:-mt-10 mb-20"
        >
          <Image
            src="/black_logo.png"
            alt="ProjectMATCH by Compscope"
            width={200}
            height={80}
            className="h-16 sm:h-16 md:h-16 lg:h-16 xl:h-28 w-auto "
            priority
          />
          <div className={`leading-tight text-black`}>
            <div className="text-xs sm:text-sm md:text-base lg:text-2xl font-black">
              ProjectMATCH
            </div>
            <div className="text-[10px] sm:text-xs md:text-sm text-gray-600">
              <span className="text-[#3EA442] font-bold">by Compscope</span>
            </div>
          </div>
        </Link>
      </motion.div>
      {/* Document Upload Modal */}
      <AnimatePresence>
        {documentUploadModal.isOpen && (
          <motion.div
            key="document-upload-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-modal="true"
            role="dialog"
          >
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setDocumentUploadModal({
                  isOpen: false,
                  applicationId: "",
                  documents: [],
                })
              }
            />

            <motion.div
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[80vh] overflow-y-auto"
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Upload Required Documents
                </h2>
                <button
                  onClick={() =>
                    setDocumentUploadModal({
                      isOpen: false,
                      applicationId: "",
                      documents: [],
                    })
                  }
                  aria-label="Close"
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                {documentUploadModal.documents.map((doc) => (
                  <div key={doc.docId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {doc.name}
                        </h4>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            doc.status === "requested"
                              ? "bg-yellow-100 text-yellow-800"
                              : doc.status === "submitted"
                              ? "bg-blue-100 text-blue-800"
                              : doc.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {doc.status.charAt(0).toUpperCase() +
                            doc.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {doc.status === "requested" && (
                      <div className="mt-3">
                        {doc.inputType === "file" ? (
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                uploadDocument(
                                  documentUploadModal.applicationId,
                                  doc.docId,
                                  file
                                );
                              }
                            }}
                            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            disabled={uploadingDocument}
                          />
                        ) : doc.inputType === "text" &&
                          doc.name === "Bank Details" ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Account Holder Name"
                              value={
                                documentValues[doc.docId]?.accountHolderName ||
                                ""
                              }
                              onChange={(e) =>
                                updateDocumentValue(
                                  doc.docId,
                                  "accountHolderName",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              placeholder="Account Number"
                              value={
                                documentValues[doc.docId]?.accountNumber || ""
                              }
                              onChange={(e) =>
                                updateDocumentValue(
                                  doc.docId,
                                  "accountNumber",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              placeholder="IFSC Code"
                              value={documentValues[doc.docId]?.ifscCode || ""}
                              onChange={(e) =>
                                updateDocumentValue(
                                  doc.docId,
                                  "ifscCode",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              placeholder="Bank Name"
                              value={documentValues[doc.docId]?.bankName || ""}
                              onChange={(e) =>
                                updateDocumentValue(
                                  doc.docId,
                                  "bankName",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              placeholder="Branch"
                              value={documentValues[doc.docId]?.branch || ""}
                              onChange={(e) =>
                                updateDocumentValue(
                                  doc.docId,
                                  "branch",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() =>
                                submitTextDocument(
                                  documentUploadModal.applicationId,
                                  doc.docId,
                                  documentValues[doc.docId]
                                )
                              }
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              disabled={uploadingDocument}
                            >
                              {uploadingDocument
                                ? "Submitting..."
                                : "Submit Bank Details"}
                            </button>
                          </div>
                        ) : doc.inputType === "text" ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder={`Enter ${doc.name}`}
                              value={documentValues[doc.docId]?.value || ""}
                              onChange={(e) =>
                                updateDocumentValue(
                                  doc.docId,
                                  "value",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() =>
                                submitTextDocument(
                                  documentUploadModal.applicationId,
                                  doc.docId,
                                  documentValues[doc.docId]?.value
                                )
                              }
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              disabled={uploadingDocument}
                            >
                              {uploadingDocument ? "Submitting..." : "Submit"}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )}

                    {doc.fileUrl && (
                      <div className="mt-3">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                        >
                          <FileText className="w-4 h-4" />
                          View Uploaded
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {uploadingDocument && (
                <div className="mt-6 flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-16 sm:pt-24 pb-8 sm:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {token && (
            <button
              className="absolute cursor-pointer top-4 right-4 z-50 p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
              onClick={() => {
                handleLogout(setToken, setuser, setprofile, router);
              }}
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}

          {/* <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute top-4 sm:top-8 left-4 sm:left-8"
          >
            <Link href="/" className="flex items-center gap-1 ">
              <Image
                src="/black_logo.png"
                alt="ProjectMATCH by Compscope"
                width={200}
                height={80}
                className="h-16 sm:h-16 md:h-16 lg:h-16 xl:h-28 w-auto "
                priority
              />
              <div className={`leading-tight text-black`}>
                <div className="text-xs sm:text-sm md:text-base lg:text-2xl font-black">
                  ProjectMATCH
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm text-gray-600">
                  <span className="text-[#3EA442] font-bold">by Compscope</span>
                </div>
              </div>
            </Link>
          </motion.div> */}

          <div className="mb-10 flex items-center justify-between">
            <motion.button
              onClick={() => router.back()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </motion.button>

            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => router.push("/jobs")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Explore Jobs
              </motion.button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12 gap-4 sm:gap-6"
          >
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderProfilePicture()}
                </motion.div>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8">
              {renderStars()}
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (isProfileComplete()) {
                      openProfileEditModal();
                    } else {
                      setActiveTab("profile");
                      openProfileEditModal();
                    }
                  }}
                  className="cursor-pointer rounded-full px-4 sm:px-6 py-1.5 sm:py-2 border border-[#12372B] text-gray-700 bg-transparent hover:bg-gray-50 transition-colors text-sm sm:text-base whitespace-nowrap"
                >
                  {isProfileComplete() ? "Edit Profile" : "Add Profile"}
                </motion.button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative mb-8 sm:mb-12"
          >
            <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
              {tabs.map((tab, index) => (
                <motion.button
                  key={tab.id}
                  ref={(el) => {
                    tabsRef.current[index] = el;
                  }}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  className={`px-3 sm:px-6 hover:cursor-pointer py-3 sm:py-4 text-sm sm:text-base font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? "text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </motion.button>
              ))}
            </div>

            <motion.div
              className="absolute bottom-0 h-0.5 bg-blue-600 hidden md:block"
              animate={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </motion.div>

          <div className="min-h-[300px] sm:min-h-[400px]">
            <AnimatePresence mode="wait">{renderTabContent()}</AnimatePresence>
          </div>
        </div>
      </div>

      {/* Profile Picture Upload Modal */}
      {/* Profile Picture Upload Modal */}
      <AnimatePresence>
        {isProfilePictureModalOpen && (
          <motion.div
            key="profile-picture-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-modal="true"
            role="dialog"
            aria-labelledby="profile-picture-title"
          >
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                !uploadingProfilePicture && setIsProfilePictureModalOpen(false)
              }
            />

            <motion.div
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2
                  id="profile-picture-title"
                  className="text-xl font-semibold text-gray-900"
                >
                  Profile Picture
                </h2>
                <button
                  onClick={() =>
                    !uploadingProfilePicture &&
                    setIsProfilePictureModalOpen(false)
                  }
                  disabled={uploadingProfilePicture}
                  aria-label="Close"
                  className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Current Picture Preview */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {profilePicture ? (
                    <img
                      src={profilePicture || "/placeholder.svg"}
                      alt="Current profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No photo</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <input
                  ref={profileFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                  disabled={uploadingProfilePicture}
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => profileFileInputRef.current?.click()}
                  disabled={uploadingProfilePicture}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploadingProfilePicture ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload New Photo
                    </>
                  )}
                </motion.button>

                {profilePicture && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRemoveProfilePicture}
                    disabled={uploadingProfilePicture}
                    className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                  >
                    Remove Photo
                  </motion.button>
                )}
              </div>

              {/* File Requirements */}
              <p className="text-xs text-gray-500 text-center mt-4">
                Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {isProfileEditOpen && (
          <motion.div
            key="profile-edit-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-modal="true"
            role="dialog"
            aria-labelledby="profile-edit-title"
          >
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileEditOpen(false)}
            />

            <motion.div
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg my-8 text-gray-500 max-h-[calc(100vh-4rem)] overflow-y-auto"
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
            >
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between mb-6 p-6 border-b border-gray-200">
                <h2
                  id="profile-edit-title"
                  className="text-xl font-semibold text-gray-900"
                >
                  {isProfileComplete()
                    ? "Edit Profile"
                    : "Add Profile Information"}
                </h2>
                <button
                  onClick={() => setIsProfileEditOpen(false)}
                  aria-label="Close"
                  className="p-2 rounded-full hover:bg-gray-100 flex-shrink-0"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="px-6 pb-6 space-y-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileFormData.name}
                    onChange={(e) =>
                      setProfileFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g., John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <div className="space-y-3">
                    <LocationInputWithSearch
                      value={profileFormData.location}
                      onChange={(value) => {
                        setProfileFormData((prev) => ({
                          ...prev,
                          location: value,
                        }));
                      }}
                      onLocationSelect={handleMapLocationSelect}
                      selectedLocation={
                        profileFormData.locationData || undefined
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    About
                  </label>
                  <textarea
                    value={profileFormData.bio}
                    onChange={(e) =>
                      setProfileFormData((prev) => ({
                        ...prev,
                        bio: e.target.value,
                      }))
                    }
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Skills
                  </label>
                  <input
                    type="text"
                    value={profileFormData.skills}
                    onChange={(e) =>
                      setProfileFormData((prev) => ({
                        ...prev,
                        skills: e.target.value,
                      }))
                    }
                    placeholder="e.g., JavaScript, React, Python (comma separated)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Languages
                  </label>
                  <input
                    type="text"
                    value={profileFormData.languages}
                    onChange={(e) =>
                      setProfileFormData((prev) => ({
                        ...prev,
                        languages: e.target.value,
                      }))
                    }
                    placeholder="e.g., English (Native), Spanish (Intermediate) (comma separated)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileFormData.phone}
                    onChange={(e) =>
                      setProfileFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="e.g., +1 (555) 123-4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Availability Section */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Unavailability
                    </label>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowAvailabilityModal(true)}
                      className="flex cursor-pointer items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Slot
                    </motion.button>
                  </div>

                  {/* Display current availability slots */}
                  {availabilitySlots.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {availabilitySlots.map((slot, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>{slot.description}</span>
                          <button
                            onClick={() => removeAvailabilitySlot(slot)}
                            className="ml-1 p-0.5 rounded-full hover:bg-red-200 transition-colors"
                            aria-label="Remove slot"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {availabilitySlots.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      No unavailability slots added yet. Click "Add Slot" to get
                      started.
                    </p>
                  )}
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex items-center justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-full cursor-pointer border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsProfileEditOpen(false)}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2 rounded-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleProfileSave}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Availability Slot Modal */}
      <AnimatePresence>
        {showAvailabilityModal && (
          <motion.div
            key="availability-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-modal="true"
            role="dialog"
            aria-labelledby="availability-title"
          >
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAvailabilityModal(false)}
            />

            <motion.div
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  id="availability-title"
                  className="text-xl font-semibold text-gray-900"
                >
                  Add Unavailability Slot
                </h2>
                <button
                  onClick={() => setShowAvailabilityModal(false)}
                  aria-label="Close"
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={newAvailabilityStartDate}
                      onChange={(e) =>
                        setNewAvailabilityStartDate(e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={newAvailabilityEndDate}
                      onChange={(e) =>
                        setNewAvailabilityEndDate(e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  className="px-4 py-2 cursor-pointer rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowAvailabilityModal(false)}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2 cursor-pointer rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={addAvailabilitySlot}
                  disabled={
                    !newAvailabilityStartDate || !newAvailabilityEndDate
                  }
                >
                  Add Slot
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
