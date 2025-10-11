"use client";

import { useState, useRef, useEffect } from "react";
import {
  Star,
  Plus,
  ArrowLeft,
  X,
  Pencil,
  MapPin,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ResumeManager from "../../components/Company/ResumeManager";
import TruncatedText from "../../components/TruncatedText";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/app/context/UserContext";
// import { toast } from "react-toastify";
import JobStatusDropdown from "@/app/components/JobStatusDropdown";
import { handleLogout } from "@/app/Helper/logout";
import { JobOptionsMenu } from "@/app/components/JobOptionsMenu";

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

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "jobs", label: "Jobs" },
];

// Team size options
const teamSizeOptions = [
  { value: "", label: "Select team size" },
  { value: "small", label: "Small (1-10)" },
  { value: "medium", label: "Medium (10-50)" },
  { value: "large", label: "Large (50-100)" },
  { value: "huge", label: "Huge (100+)" },
];

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

// Helper: last four comma-separated parts of an address
const getLastFourParts = (address?: string) => {
  if (!address) return "";
  const parts = address
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  if (parts.length <= 4) return address.trim();
  return parts.slice(-4).join(", ");
};

// Helper: truncate string to max characters with ellipsis
const truncateChars = (text: string, max: number) => {
  if (!text) return text;
  return text.length > max ? `${text.slice(0, max)}...` : text;
};

const OlaMapComponent = ({
  location,
  onLocationSelect,
  searchQuery,
}: {
  location?: { lat: number; lng: number; address?: string };
  onLocationSelect?: (location: {
    lat: number;
    lng: number;
    address: string;
  }) => void;
  searchQuery?: string;
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
        }
      } else {
        const errorText = await response.text();
        console.error("Geocoding API error:", response.status, errorText);
      }
      throw new Error("Location not found");
    } catch (error) {
      console.error("Geocoding failed:", error);

      throw error;
    }
  };

  const handleAddressSearch = async (address: string) => {
    setIsSearching(true);
    try {
      await geocodeAddress(address);
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
          <path d="M16 2C23.732 2 30 8.268 30 16C30 22.5 16 36.5 16 36.5S2 22.5 2 16C2 8.268 8.268 2 16 2Z" fill="#ffffff" stroke="#3b82f6" stroke-width="0.5"/>
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

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

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
    <div className="relative bg-gray-900 rounded-lg overflow-hidden h-40 sm:h-48 lg:h-64">
      <div
        ref={mapRef}
        className="w-full h-full"
        style={{ minHeight: "160px" }}
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
    </div>
  );
};

// Enhanced location input field component with autocomplete
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
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced autocomplete suggestions
  useEffect(() => {
    if (!isInputFocused) {
      // If input is not focused, keep suggestions hidden
      setShowSuggestions(false);
      return;
    }
    const controller = new AbortController();
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
  }, [value, isInputFocused]);

  const geocodeAndSelect = async (address: string) => {
    try {
      setIsSearching(true);
      const response = await fetch(
        `https://api.olamaps.io/places/v1/geocode?address=${encodeURIComponent(
          address
        )}&api_key=${process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY}`
      );
      if (response.ok) {
        const data = await response.json();
        const result = data.geocodingResults?.[0];
        const lat = result?.geometry?.location?.lat;
        const lng = result?.geometry?.location?.lng;
        const formattedAddress = result?.formatted_address || address;
        if (
          typeof lat === "number" &&
          typeof lng === "number" &&
          !isNaN(lat) &&
          !isNaN(lng) &&
          isFinite(lat) &&
          isFinite(lng)
        ) {
          onChange(formattedAddress);
          setShowSuggestions(false);
          setSuggestions([]);
          setHighlightIndex(-1);
          setIsInputFocused(false);
          inputRef.current?.blur();
          setSearchTrigger(formattedAddress);
          onLocationSelect({ lat, lng, address: formattedAddress });
        }
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
        geocodeAndSelect(address);
      } else {
        handleSearch();
      }
    }
  };

  return (
    <div className="space-y-2 sm:space-y-3 lg:space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setShowSuggestions(true);
            }}
            placeholder="Enter address or click on map to select location..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={handleKeyPress}
            onFocus={() => {
              setIsInputFocused(true);
              if (value) setShowSuggestions(true);
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
                      inputRef.current?.blur();
                      geocodeAndSelect(address);
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
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors w-full sm:w-auto"
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

// Team Size Dropdown Component
const TeamSizeDropdown = ({
  value,
  onChange,
  placeholder = "Select team size",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = teamSizeOptions.find(
    (option) => option.value === value
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500"
        whileTap={{ scale: 0.98 }}
      >
        <span
          className={selectedOption?.value ? "text-gray-900" : "text-gray-500"}
        >
          {selectedOption?.label || placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-[1000] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          >
            {teamSizeOptions.map((option) => (
              <motion.button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                  option.value === value
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700"
                } ${option.value === "" ? "text-gray-500" : ""}`}
                whileHover={{
                  backgroundColor:
                    option.value === value ? "#dbeafe" : "#f9fafb",
                }}
              >
                {option.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ProfileTab() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address?: string;
  } | null>(null);
  // const [companyLogo, setCompanyLogo] = useState("");
  const [isLogoUploadOpen, setIsLogoUploadOpen] = useState(false);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  // const router = useRouter();
  const {
    user,
    profile,
    setuser,
    setprofile,
    updateProfile: updateProfileContext,
  } = useUser(); // Get user from context
  const [companyLogo, setCompanyLogo] = useState(
    profile ? profile.companyLogo : ""
  );
  const handleLocationTextChange = (value: string) => {
    setFormState((prevState) => ({
      ...prevState,
      locationText: value,
    }));
  };

  const router = useRouter(); // Declare the router variable here
  const [hasLoadedApplications, setHasLoadedApplications] = useState(false);
  // Add this new state variable
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const [isLogoGettingRemoved, setisLogoGettingRemoved] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [formState, setFormState] = useState({
    companyName: profile?.companyName ? profile?.companyName : "",
    companyDescription: profile?.companyDescription
      ? profile?.companyDescription
      : "",
    orgSize: profile?.orgSize ? profile?.orgSize : "",
    locationText: profile?.location ? profile?.location : "",
  });

  useEffect(() => {
    if (profile) {
      setFormState({
        companyName: profile.companyName || "",
        companyDescription: profile.companyDescription || "",
        orgSize: profile.orgSize || "",
        locationText: profile.location || "",
      });
      setCompanyLogo(profile.companyLogo);
    }
  }, [profile]);

  useEffect(() => {
    const hasShownToast = localStorage.getItem("profileToastShown");
    const isProfileEmpty =
      !formState.companyName &&
      !formState.companyDescription &&
      !formState.orgSize &&
      !formState.locationText;

    if (!hasShownToast && isProfileEmpty && profile) {
      toast({
        title: "Complete Your Profile",
        description: "Please complete your profile to get started.",
        duration: 5000,
        variant: "success",
      });
      localStorage.setItem("profileToastShown", "true");
    }
  }, [toast, formState, profile]);

  useEffect(() => {
    // Only runs on the client
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const isProfileComplete = () => {
    return (
      formState.companyName &&
      formState.companyDescription &&
      formState.orgSize &&
      formState.locationText
    );
  };

  const [applications, setApplications] = useState<any>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  // Job edit/delete states
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  const [applicationsError, setApplicationsError] = useState<any>(null);
  const [updatingJobStatus, setUpdatingJobStatus] = useState<string | null>(
    null
  );
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<any>(null);

    useEffect(() => {
      // Check if user is signed up as Inspector (capital I)
      if (user && user.signedUpAs === "Inspector") {
        router.push("/profile");
      }
    }, [user, router]);

  const fetchApplications = async () => {
    if (!user?.id) {
      setApplicationsError("User not found");
      return;
    }

    setApplicationsLoading(true);
    setApplicationsError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/jobs/getAllJobsByCompany?companyId=${profile._id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const data = await response.json();
      setApplications(data.jobs || []);
    } catch (error: any) {
      console.error("Error fetching applications:", error);
      setApplicationsError(error.message || "Failed to fetch applications");
    } finally {
      setApplicationsLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user?.id || !profile?._id) {
      setApplicationsError("User not found");
      return;
    }

    setApplicationsLoading(true);
    setApplicationsError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/company/complete-profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            companyId: profile._id,
            companyName: formState.companyName, // Add this
            companyDescription: formState.companyDescription,
            location: formState.locationText,
            orgSize: formState.orgSize,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setuser(data.user);
      updateProfileContext(data.profile);

      // Update form state with the response data
      setFormState({
        companyName: data.profile?.companyName || formState.companyName,
        companyDescription:
          data.profile?.companyDescription || formState.companyDescription,
        orgSize: data.profile?.orgSize || formState.orgSize,
        locationText: data.profile?.location || formState.locationText,
      });

      toast({
        title: data.message || "Profile updated successfully",
        duration: 5000,
        variant: "success",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setApplicationsError(error.message || "Failed to update profile");
      toast({
        title: "Error updating profile",
        description: error.message || "Please try again",
        duration: 5000,
        variant: "destructive",
      });
    } finally {
      setApplicationsLoading(false);
      setIsEditOpen(false);
    }
  };

  // Add useEffect to fetch data when component mounts or user changes
  useEffect(() => {
    if (user?.id && activeTab === "jobs" && !hasLoadedApplications) {
      fetchApplications();
      setHasLoadedApplications(true);
    }
  }, [user?.id, activeTab, hasLoadedApplications]);

  useEffect(() => {
    const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
    const activeTabElement = tabsRef.current[activeIndex];

    if (activeTabElement) {
      setIndicatorStyle({
        left: activeTabElement.offsetLeft,
        width: activeTabElement.offsetWidth,
      });
    }
  }, [activeTab]);

  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/svg+xml",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, SVG, or WebP image.",
        duration: 5000,
        variant: "destructive",
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        duration: 5000,
        variant: "destructive",
      });
      return;
    }

    try {
      // Show loading state - use specific logo loading state
      setIsLogoUploading(true);

      // Create FormData to send file
      const formData = new FormData();
      formData.append("logo", file);
      formData.append("userId", user?.id || "");
      formData.append("companyId", profile?._id || "");

      // Send to API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/company/upload-logo`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload logo");
      }

      // Update local state with the returned URL
      setCompanyLogo(data.logoUrl);

      // Update profile context if needed
      updateProfileContext(data.company);

      setIsLogoUploadOpen(false);

      toast({
        title: "Logo uploaded successfully",
        description: "Your company logo has been updated.",
        duration: 5000,
        variant: "success",
      });
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Please try again.",
        duration: 5000,
        variant: "destructive",
      });
    } finally {
      setIsLogoUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!user?.id || !profile?._id) {
      toast({
        title: "Error",
        description: "User or profile information missing",
        duration: 5000,
        variant: "destructive",
      });
      return;
    }

    try {
      // Show loading state
      setisLogoGettingRemoved(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/company/remove-logo`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            companyId: profile._id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove logo");
      }

      // Update local state
      setCompanyLogo("");

      // Update profile context if needed
      updateProfileContext(data.company);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Close modal
      setisLogoGettingRemoved(false);

      toast({
        title: "Logo removed successfully",
        description: "Your company logo has been removed.",
        duration: 5000,
        variant: "success",
      });
    } catch (error: any) {
      console.error("Error removing logo:", error);
      toast({
        title: "Failed to remove logo",
        description: error.message || "Please try again.",
        duration: 5000,
        variant: "destructive",
      });
    } finally {
      setIsLogoUploading(false);
    }
  };

  const handleLocationSelect = (location: {
    lat: number;
    lng: number;
    address: string;
  }) => {
    setSelectedLocation(location);
    setFormState({ ...formState, locationText: location.address });
  };

  // Helper function to get display text for team size
  const getTeamSizeDisplayText = (value: string) => {
    const option = teamSizeOptions.find((opt) => opt.value === value);
    return option?.label || "Enter team size";
  };

  const renderCompanyLogo = (size: string) => {
    const sizeClasses =
      size === "large"
        ? "w-12 h-12 sm:w-16 sm:h-16"
        : "w-12 h-12 sm:w-16 sm:h-16";

    if (companyLogo) {
      return (
        <div
          className={`${sizeClasses} flex items-center justify-center relative group`}
        >
          <img
            src={companyLogo}
            alt="Company Logo"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    }

    return (
      <div
        className={`${sizeClasses} rounded-full bg-black flex items-center justify-center flex-shrink-0`}
      >
        <span className="text-white font-bold text-lg sm:text-xl">
          {formState.companyName?.charAt(0) || "?"} {/* Fixed reference */}
        </span>
      </div>
    );
  };

  const renderStars = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.div
            key={star}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <Star
              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                star <= 3
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-300 text-gray-300"
              }`}
            />
          </motion.div>
        ))}
      </div>
    );
  };

  const handleJobStatusUpdate = async (newStatus: string, jobId: string) => {
    if (!user?.id || !profile?._id) {
      toast({
        title: "Error",
        description: "User information missing",
        duration: 2000,
        variant: "destructive",
      });
      return;
    }

    setUpdatingJobStatus(jobId);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/jobs/updateJobStatus`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            statusToUpdate: newStatus,
            jobId: jobId,
            userId: user.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update job status");
      }

      // Update the local state
      setApplications((prevApps: any) =>
        prevApps.map((job: any) =>
          job._id === jobId ? { ...job, jobStatus: newStatus } : job
        )
      );

      toast({
        title: "Status Updated",
        description: `Job status updated to ${newStatus}`,
        duration: 5000,
        variant: "success",
      });
    } catch (error: any) {
      console.error("Error updating job status:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update job status",
        duration: 5000,
        variant: "destructive",
      });
    } finally {
      setUpdatingJobStatus(null);
    }
  };
  const handleEditJob = (jobId: string) => {
    router.push(`/company/edit-role?jobId=${jobId}`);
  };

  const handleDeleteJob = (jobId: string) => {
    setJobToDelete(jobId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteJob = async () => {
    if (!jobToDelete || !user?.id) {
      toast({
        title: "Error",
        description: "Job ID or user information missing",
        duration: 2000,
        variant: "destructive",
      });
      return;
    }

    setDeletingJobId(jobToDelete);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/jobs/${jobToDelete}/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete job");
      }

      setApplications((prevApps: any) =>
        prevApps.filter((job: any) => job._id !== jobToDelete)
      );

      toast({
        title: "Job Deleted",
        description: "Job has been deleted successfully",
        duration: 5000,
        variant: "success",
      });

      setShowDeleteConfirm(false);
      setJobToDelete(null);
    } catch (error: any) {
      console.error("Error deleting job:", error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete job",
        duration: 5000,
        variant: "destructive",
      });
    } finally {
      setDeletingJobId(null);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        // If profile has no data, show a single call-to-action card
        if (!isProfileComplete()) {
          return (
            <motion.div
              key="profile-empty"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-6 sm:space-y-8 text-black p-4 sm:p-6 lg:px-8"
            >
              <div className="bg-white rounded-lg p-8 sm:p-12 flex items-center justify-center min-h-[260px] sm:min-h-[320px]">
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Complete your company profile</h3>
                  <p className="text-gray-500 text-sm sm:text-base mb-6">Add details like description, team size and location to get started.</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setActiveTab("profile");
                      setIsEditOpen(true);
                    }}
                    className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#76FF82] hover:bg-green-400 text-black text-sm sm:text-base font-medium cursor-pointer"
                  >
                    Add Profile
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        }

        return (
          <motion.div
            key="profile"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-6 sm:space-y-8 text-black p-4 sm:p-6 lg:px-8"
          >
            <div className="bg-white rounded-lg p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 w-full max-w-full overflow-hidden">
              <motion.div
                variants={itemVariants}
                className="text-center py-4 sm:py-6 lg:py-8"
              >
                <h3 className="text-xs sm:text-sm text-[#A1A1A1] font-medium mb-3 sm:mb-4 lg:mb-6">
                  Company Logo and Identity According to legal Documentation
                </h3>

                <div className="flex flex-col items-center space-y-2 sm:space-y-3 lg:space-y-4 w-full">
                  <div className="relative">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      {renderCompanyLogo("large")}
                    </motion.div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsLogoUploadOpen(true)}
                      className="absolute cursor-pointer -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 p-1 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                    >
                      <Pencil className="w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-white" />
                    </motion.button>
                  </div>

                  <div className="w-full max-w-full px-4">
                    <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-1 break-words text-center w-full overflow-hidden">
                      {formState.companyName || "Company Name"}
                    </h2>
                  </div>
                </div>
              </motion.div>

              {formState.companyDescription?.trim() && (
                <motion.div
                  variants={itemVariants}
                  className="space-y-3 sm:space-y-4 mt-6 sm:mt-8"
                >
                  <h3 className="text-xs sm:text-sm font-medium text-[#A1A1A1]">
                    Company description
                  </h3>
                  <p className="text-justify text-xs sm:text-sm text-gray-600 leading-relaxed p-3 sm:p-4 rounded-lg break-words">
                    {formState.companyDescription}
                  </p>
                </motion.div>
              )}

              {formState.orgSize?.trim() && (
                <motion.div
                  variants={itemVariants}
                  className="space-y-3 mt-6 sm:mt-8"
                >
                  <h3 className="text-xs sm:text-sm text-[#A1A1A1]">
                    No of People in Organization
                  </h3>
                  <div className="text-md max-w-full sm:max-w-sm text-gray-900 p-3 sm:p-4 rounded-lg">
                    {formState.orgSize}
                  </div>
                </motion.div>
              )}
              <motion.div
                variants={itemVariants}
                className="space-y-3 sm:space-y-4 mt-6 sm:mt-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <h3 className="text-sm sm:text-base font-medium text-gray-700">
                    Location
                  </h3>
                </div>

                <LocationInputWithSearch
                  value={formState.locationText}
                  onChange={handleLocationTextChange}
                  onLocationSelect={handleLocationSelect}
                  selectedLocation={selectedLocation ?? undefined}
                />
              </motion.div>
            </div>
          </motion.div>
        );

      case "jobs":
        return (
          <motion.div
            key="jobs"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-6 sm:space-y-8"
          >
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
            >
              <motion.div
                variants={cardVariants}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-white rounded-lg p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center text-center min-h-[180px] sm:min-h-[200px] lg:min-h-[250px] cursor-pointer"
                onClick={() => (window.location.href = "/company/new-role")}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2 sm:mb-3 lg:mb-4"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-600" />
                </motion.div>
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
                  Create a New Post
                </h3>
              </motion.div>

              {applicationsLoading && (
                <motion.div
                  variants={cardVariants}
                  className="bg-white rounded-lg p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[200px] sm:min-h-[250px]"
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600">Loading jobs...</p>
                </motion.div>
              )}

              {applicationsError && !applicationsLoading && (
                <motion.div
                  variants={cardVariants}
                  className="bg-white rounded-lg p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[200px] sm:min-h-[250px]"
                >
                  <div className="text-red-500 mb-4">⚠️</div>
                  <p className="text-red-600 text-sm">{applicationsError}</p>
                  <button
                    onClick={fetchApplications}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}

              {!applicationsLoading &&
                !applicationsError &&
                applications.length === 0 && (
                  <motion.div
                    variants={cardVariants}
                    className="bg-white rounded-lg p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[200px] sm:min-h-[250px]"
                  >
                    <div className="text-gray-400 mb-4">📋</div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                      No Job Posts Yet
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Create your first job posting to get started!
                    </p>
                  </motion.div>
                )}

              {!applicationsLoading &&
                !applicationsError &&
                applications.length > 0 &&
                applications.map((job: any, index: number) => {
                  return (
                    <motion.div
                      key={job._id || index}
                      variants={cardVariants}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 min-h-[180px] sm:min-h-[200px] lg:min-h-[250px] flex flex-col justify-between relative"
                    >
                      {/* 3-dot menu */}
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 cursor-pointer">
                        <JobOptionsMenu
                          jobId={job._id}
                          onEdit={() => handleEditJob(job._id)}
                          onDelete={() => handleDeleteJob(job._id)}
                        />
                      </div>

                      <div>
                        {/* Job Title and Status Row */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 pr-8 gap-2">
                          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                            {job.title || "Untitled Job"}
                          </h3>
                          <JobStatusDropdown
                            value={job.jobStatus || "Open"}
                            onChange={(newStatus: string) =>
                              handleJobStatusUpdate(newStatus, job._id)
                            }
                            jobId={job._id}
                            isUpdating={updatingJobStatus === job._id}
                          />
                        </div>

                        {/* Simple Inline Stats */}
                        <div className="flex items-center justify-between mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3 sm:gap-6">
                            <div>
                              <span className="text-base sm:text-lg font-bold text-gray-900">
                                {job.totalApplications || 0}
                              </span>
                              <span className="text-xs sm:text-sm text-gray-600 ml-1 sm:ml-2">
                                Applicants
                              </span>
                            </div>

                            <div className="text-gray-300 hidden sm:block">•</div>

                            <div>
                              <span className="text-base sm:text-lg font-bold text-gray-900">
                                {job.noOfOpenings || 0}
                              </span>
                              <span className="text-xs sm:text-sm text-gray-600 ml-1 sm:ml-2">
                                Openings
                              </span>
                            </div>
                          </div>
                        </div>

                        {job.description && (
                          <div className="mb-2">
                            <TruncatedText
                              text={job.description.replace(/\n/g, " ")}
                              maxWords={50}
                              className="text-xs text-gray-600"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mt-auto">
                        <span className="text-xs text-gray-400 order-2 sm:order-1">
                          {job.postedDate
                            ? new Date(job.postedDate).toLocaleDateString(
                                "en-US",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "No date"}
                        </span>

                        <Link href={`/company/applications?jobId=${job._id}`}>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 cursor-pointer sm:px-4 py-1.5 sm:py-2 bg-[#76FF82] hover:bg-green-400 text-black text-xs sm:text-sm rounded-full transition-colors order-1 sm:order-2 self-start sm:self-auto w-full sm:w-auto"
                          >
                            View Applications
                          </motion.button>
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-4 sm:top-8 left-4 sm:left-8"
      >
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <Image
            src="/black_logo.png"
            alt="ProjectMATCH by Compscope"
            width={200}
            height={80}
            className="h-12 sm:h-16 md:h-16 lg:h-16 xl:h-28 w-auto"
            priority
          />
          <div className="leading-tight text-[#163A33]">
            <div className="text-xs sm:text-sm md:text-base lg:text-2xl font-black">
              ProjectMATCH
            </div>
            <div className="text-[10px] sm:text-xs md:text-sm text-gray-600">
              <span className="text-[#3EA442] font-bold">by Compscope</span>
            </div>
          </div>
        </Link>
        {user && (
          <button
            className="cursor-pointer fixed top-4 sm:top-8 right-4 sm:right-8 z-50 p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            onClick={() => {
              handleLogout(setToken, setuser, setprofile, router);
            }}
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </motion.div>

      <div className="pt-20 sm:pt-28 pb-6 sm:pb-8 lg:pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-10 lg:mb-12 gap-4 sm:gap-6"
          >
            <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
              <div className="relative flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderCompanyLogo("large")}
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsLogoUploadOpen(true)}
                  className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 p-1 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                >
                  <Pencil className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                </motion.button>
              </div>

              <div className="min-w-0 flex-1 max-w-full overflow-hidden">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-1 break-words w-full">
                  {formState.companyName || "Company Name"}
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm lg:text-base break-words w-full">
                  {truncateChars(getLastFourParts(formState.locationText), 40) || "Location"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 sm:gap-4 lg:gap-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveTab("profile");
                  setIsEditOpen(true);
                }}
                className="cursor-pointer rounded-full px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 border border-[#12372B] text-gray-700 bg-transparent hover:bg-gray-50 transition-colors text-xs sm:text-sm lg:text-base whitespace-nowrap"
              >
                {isProfileComplete() ? "Edit Profile" : "Add Profile"}
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative mb-8 sm:mb-10 lg:mb-12"
          >
            <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide justify-center">
              {tabs.map((tab, index) => (
                <motion.button
                  key={tab.id}
                  ref={(el) => {
                    tabsRef.current[index] = el;
                  }}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  className={`px-4 cursor-pointer sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-colors relative whitespace-nowrap flex-shrink-0 mx-2 sm:mx-5 ${
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
              className="absolute bottom-0 h-0.5 bg-blue-600 "
              animate={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </motion.div>

          <div className="min-h-[250px] sm:min-h-[300px] lg:min-h-[400px]">
            <AnimatePresence mode="wait">{renderTabContent()}</AnimatePresence>
          </div>
        </div>
      </div>

      {/* Logo Upload Modal */}
      <AnimatePresence>
        {isLogoUploadOpen && (
          <motion.div
            key="logo-upload-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-modal="true"
            role="dialog"
            aria-labelledby="logo-upload-title"
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogoUploadOpen(false)}
            />

            {/* Dialog */}
            <motion.div
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-4 sm:p-6"
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  id="logo-upload-title"
                  className="text-lg font-semibold text-gray-900"
                >
                  Company Logo
                </h2>
                <button
                  onClick={() => setIsLogoUploadOpen(false)}
                  aria-label="Close"
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                    {companyLogo ? (
                      <img
                        src={companyLogo}
                        alt="Company Logo Preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">No logo</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                  >
                    {isLogoUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Uploading...
                      </>
                    ) : (
                      "Upload Logo"
                    )}
                  </motion.button>

                  {companyLogo && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRemoveLogo}
                      disabled={isLogoUploading}
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                    >
                      {isLogoGettingRemoved ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Removing...
                        </>
                      ) : (
                        "Remove Logo"
                      )}
                    </motion.button>
                  )}
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Supported formats: JPG, PNG, SVG. Max size: 5MB
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditOpen && (
          <motion.div
            key="edit-profile-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-modal="true"
            role="dialog"
            aria-labelledby="edit-profile-title"
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditOpen(false)}
            />

            {/* Dialog */}
            <motion.div
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg sm:max-w-xl p-4 sm:p-5 lg:p-6 text-gray-500 max-h-[90vh] overflow-y-auto"
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
                <h2
                  id="edit-profile-title"
                  className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 text-balance"
                >
                  Edit Company Profile
                </h2>
                <button
                  onClick={() => setIsEditOpen(false)}
                  aria-label="Close"
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-5">
                <div className="flex flex-col gap-1 sm:gap-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formState.companyName}
                    onChange={(e) =>
                      setFormState((s) => ({
                        ...s,
                        companyName: e.target.value,
                      }))
                    }
                    placeholder="e.g., Riverleaf Inc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-1 sm:gap-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">
                    Company Description
                  </label>
                  <textarea
                    value={formState.companyDescription}
                    onChange={(e) =>
                      setFormState((s) => ({
                        ...s,
                        companyDescription: e.target.value,
                      }))
                    }
                    placeholder="Describe your company..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-1 sm:gap-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">
                    No. of People in Organization
                  </label>
                  <TeamSizeDropdown
                    value={formState.orgSize}
                    onChange={(value) =>
                      setFormState((s) => ({ ...s, orgSize: value }))
                    }
                    placeholder="Select team size"
                  />
                </div>

                <div className="flex flex-col gap-1 sm:gap-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <LocationInputWithSearch
                    value={formState.locationText}
                    onChange={(value) =>
                      setFormState((s) => ({ ...s, locationText: value }))
                    }
                    onLocationSelect={(location) => {
                      setSelectedLocation(location);
                      setFormState((s) => ({
                        ...s,
                        locationText: location.address,
                      }));
                    }}
                    selectedLocation={selectedLocation ?? undefined}
                  />
                </div>
              </div>

              <div className="mt-4 sm:mt-5 lg:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
                <button
                  className="px-4 py-2 rounded-full border border-gray-300 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 order-2 sm:order-1"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 sm:px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm order-1 sm:order-2"
                  onClick={() => {
                    updateProfile();
                  }}
                >
                  Save
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {showDeleteConfirm && (
        <motion.div
          key="delete-confirm-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-lg p-4 sm:p-6 max-w-md w-full"
          >
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Delete Job</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
              Are you sure you want to delete this job? This action cannot be
              undone and will also delete all applications for this job.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setJobToDelete(null);
                }}
                disabled={deletingJobId !== null}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-xs sm:text-sm order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteJob}
                disabled={deletingJobId !== null}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-xs sm:text-sm order-1 sm:order-2"
              >
                {deletingJobId ? "Deleting..." : "Delete Job"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
