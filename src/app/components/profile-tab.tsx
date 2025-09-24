"use client";

import type React from "react";

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
  Pencil,
  MapPin,
  Calendar,
  Clock,
  Plus,
  Phone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CalendarSection from "./calender";
import { useRouter } from "next/navigation";
import ResumeUpload from "./ResumeUpload";
import JobMatching from "./JobMatching";
import { useUser } from "../context/UserContext";
import { toast } from "react-toastify";
import ApplicationDetailView from "./cv";
import Link from "next/link";

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

      console.log("OlaMaps initialized successfully with constructors:", {
        hasMarker: !!olaMaps.Marker,
        hasPopup: !!olaMaps.Popup,
      });
    } catch (error) {
      console.error("Failed to initialize OlaMaps:", error);
    }
  }
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
          <path d="M16 2C23.732 2 30 8.268 30 16C30 22.5 16 36.5 16 36.5S2 22.5 2 16C2 8.268 8.268 2 16 2Z" fill="#ffffff" stroke="#3b82f6" stroke-width="0.5"/>
          <circle cx="16" cy="16" r="6" fill="#3b82f6"/>
          <circle cx="16" cy="16" r="3" fill="#ffffff"/>
        </svg>
      `;
      markerElement.style.cssText = `
        width: 32px; 
        height: 40px; 
        cursor: pointer;
        z-index: 1000;
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
        console.log("Available OlaMaps properties:", Object.keys(olaMaps));
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

      console.log("Marker added successfully at:", lat, lng);
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
        console.log("Reverse geocoding data:", data);
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

      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 flex gap-1 sm:gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={autoDetectLocation}
          disabled={isDetecting}
          className="px-2 sm:px-3 py-1 bg-gray-800 text-white text-xs rounded-full border border-gray-600 hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center gap-1"
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
              if (value) setShowSuggestions(true);
            }}
            onBlur={() => {
              setIsInputFocused(false);
              setTimeout(() => setShowSuggestions(false), 100);
            }}
            ref={inputRef}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-auto">
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

export default function ProfileTab() {
  const [activeTab, setActiveTab] = useState("resume");
  const { user, profile, updateProfile } = useUser();
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [httpMethod, sethttpMethod] = useState<string>("PUT");
  const [applications, setApplications] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [modalType, setModalType] = useState<
    "education" | "experience" | "certificate" | null
  >(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  // Add these state variables
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
    ];

    // Only add "Jobs Applied" tab if there are applications with requested documents
    if (hasApplicationsWithDocuments) {
      baseTabs.push({ id: "jobsApplied", label: "Jobs Applied" });
    }

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
        `${process.env.NEXT_PUBLIC_FIREBASE_API_URL}/application/allApplicationsOfUser?userId=${user.id}`
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

  useEffect(() => {
    if (activeTab === "jobsApplied") {
      fetchUserApplications();
    }
  }, [activeTab, user?.id]);

  // Add this computed property inside your ProfileTab component

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
        `${process.env.NEXT_PUBLIC_FIREBASE_API_URL}/application/${applicationId}/upload-document`,
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

  const [profileData, setProfileData] = useState(() => {
    try {
      if (profile && profile._id && profile.name) {
        console.log("profile", profile, profile.unavailability);
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
              period: edu.Graduation
                ? new Date(edu.Graduation).getFullYear().toString()
                : "",
              institution: edu.institure || edu.institute || "",
              description: edu.GPA ? `GPA: ${edu.GPA}` : "",
            })) || [],
          experiences:
            profile.WorkExperience?.map((exp: any, index: any) => ({
              id: index + 1,
              title: exp.title || "",
              company: exp.company || "",
              period: "",
              description: exp.description || "",
            })) || [],
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
  const [formData, setFormData] = useState<any>({});
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
  }, [activeTab]);

  useEffect(() => {
    if (profileData.profile.unavailability) {
      setAvailabilitySlots(profileData.profile.unavailability);
    }
  }, [profileData.profile.unavailability]);

   useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        if (profile && profile._id && profile.name) {
          console.log("profile", profile, profile.unavailability);
          const transformedProfile = {
            profile: {
              bio: profile.bio || "",
              skills: profile.skills || [],
              languages: profile.languages || ["English (Native)"],
              phoneNumber: profile.phoneNumber || "",
              unavailability: profile.unavailability?.map((slot: any) => ({
                startDate: slot.startDate,
                endDate: slot.endDate,
                description: `${slot.description} (${new Date(slot.startDate).toLocaleDateString()} - ${new Date(slot.endDate).toLocaleDateString()})`
              })) || [],
              location: profile.locationData || null,
            },
            education: profile.education?.map((edu: any, index: any) => ({
              id: index + 1,
              type: edu.Degree || "Degree",
              period: edu.Graduation ? new Date(edu.Graduation).getFullYear().toString() : "",
              institution: edu.institure || edu.institute, // Handle both field names
              description: edu.GPA ? `GPA: ${edu.GPA}` : "",
            })) || [],
            experiences: profile.WorkExperience?.map((exp: any, index: any) => ({
              id: index + 1,
              title: exp.title || "",
              company: exp.company || "",
              period: "", // You might want to add period field to your backend
              description: exp.description || "",
            })) || [],
            schedule: {
              availability: "Monday - Friday, 9:00 AM - 6:00 PM EST",
              timezone: "Eastern Standard Time",
              preferredMeetingTimes: ["10:00 AM - 12:00 PM", "2:00 PM - 4:00 PM"],
            },
            certifications: profile.certificates?.map((cert: any, index: any) => ({
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
        // Keep the initial profile data if there's an error
      }
    }
  }, [profile]);
  // useEffect(() => {
  //   if (
  //     profileData.profile &&
  //     !profileData.profile.phone &&
  //     !profileData.profile.name
  //   ) {
  //     toast(
  //       "Complete Your Profile: Please enter your phone number to complete your profile"
  //     );
  //   }
  // }, [profileData.profile, toast]);

  const handleProfilePictureUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicture(e.target?.result as string);
        setIsProfilePictureModalOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture("");
    setIsProfilePictureModalOpen(false);
    if (profileFileInputRef.current) {
      profileFileInputRef.current.value = "";
    }
  };

  const renderProfilePicture = () => {
    if (profilePicture) {
      return (
        <>
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg sm:text-xl">
              {profile?.name
                ? profile?.name.charAt(0)
                : user?.name
                ? user?.name.charAt(0)
                : ""}
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1 truncate">
              {profile?.name ? profile?.name : user?.name ? user?.name : ""}
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">
              {getLocationDisplay(profile?.location)}
            </p>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg sm:text-xl">
            {profile?.name
              ? profile?.name.charAt(0)
              : user?.name
              ? user?.name.charAt(0)
              : ""}
          </span>
        </div>
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1 truncate">
            {profile?.name ? profile?.name : user?.name ? user?.name : ""}
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">
            {profile?.location ? profile?.location : ""}
          </p>
        </div>
      </>
    );
  };
  // console.log("profile?._id", profile?._id, profile);
  // console.log("user?._id", user?.id, user);

  const handleProfileSave = async () => {
    try {
      setIsLoading(true);

      const skillsArray: string[] = profileFormData.skills
        ? profileFormData.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter((skill) => skill)
        : [];

      const languagesArray: string[] = profileFormData.languages
        ? profileFormData.languages
            .split(",")
            .map((lang) => lang.trim())
            .filter((lang) => lang)
        : [];

      // Prepare FormData for API call
      const formData = new FormData();
      formData.append("userId", user?.id!);
      formData.append("name", profileFormData.name);
      formData.append("phoneNumber", profileFormData.phone);
      formData.append("location", profileFormData.location); // Basic location string
      formData.append("bio", profileFormData.bio);
      formData.append("skills", JSON.stringify(skillsArray));
      formData.append("languages", JSON.stringify(languagesArray));
      formData.append("availability", JSON.stringify(availabilitySlots));

      // Handle location data with coordinates
      if (
        profileFormData.locationData &&
        profileFormData.locationData.lat &&
        profileFormData.locationData.lng
      ) {
        // Send structured location data with coordinates
        formData.append(
          "locationData",
          JSON.stringify({
            lat: profileFormData.locationData.lat,
            lng: profileFormData.locationData.lng,
            address:
              profileFormData.locationData.address || profileFormData.location,
          })
        );
      } else {
        // Send just the basic location string
        formData.append("locationData", profileFormData.location);
      }

      // Include existing sections with proper filtering
      const validEducation = profileData.education
        .filter((edu: any) => edu.institution && edu.institution.trim())
        .map((edu: any) => ({
          institure: edu.institution || edu.institure,
          Graduation: edu.period ? new Date(`${edu.period}-12-31`) : undefined,
          Degree: edu.type || edu.Degree,
          GPA: edu.description?.includes("GPA")
            ? edu.description.replace("GPA: ", "")
            : edu.GPA,
        }));

      formData.append("education", JSON.stringify(validEducation));

      const validWorkExperience = profileData.experiences
        .filter((exp: any) => exp.company && exp.company.trim())
        .map((exp: any) => ({
          company: exp.company,
          title: exp.title,
          description: exp.description,
        }));

      formData.append("WorkExperience", JSON.stringify(validWorkExperience));

      const validCertificates = profileData.certifications
        .filter((cert: any) => cert.name && cert.issuer)
        .map((cert: any) => ({
          name: cert.name || "Unknown Certificate",
          issuer: cert.issuer || "Unknown Issuer",
          date: cert.date || "Unknown Date",
          description: cert.description || "",
        }));

      formData.append("certificates", JSON.stringify(validCertificates));

      // Call API
      // console.log("profile?._id", profile?._id, profile);
      const apiUrl = profile?._id // Use ._id instead of .id
        ? `${process.env.NEXT_PUBLIC_FIREBASE_API_URL}/api/edit-profile/${profile._id}`
        : `${process.env.NEXT_PUBLIC_FIREBASE_API_URL}/api/create-profile`;
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

  // const handleProfileSave = async () => {
  //   try {
  //     setIsLoading(true)

  //     const skillsArray: string[] = profileFormData.skills
  //       ? profileFormData.skills
  //           .split(",")
  //           .map((skill) => skill.trim())
  //           .filter((skill) => skill)
  //       : []
  //     const languagesArray: string[] = profileFormData.languages
  //       ? profileFormData.languages
  //           .split(",")
  //           .map((lang) => lang.trim())
  //           .filter((lang) => lang)
  //       : []

  //     const updatedProfileData = {
  //       ...profileData,
  //       profile: {
  //         ...profileData.profile,
  //         bio: profileFormData.bio,
  //         skills: skillsArray,
  //         languages: languagesArray,
  //         availability: availabilitySlots,
  //         location: profileFormData.locationData,
  //       },
  //     }

  //     await updateProfileAPI(updatedProfileData)
  //     localStorage.setItem("profileData", JSON.stringify(updatedProfileData))

  //     setProfileData(updatedProfileData)

  //     toast.success("Profile updated successfully!")
  //     setIsProfileEditOpen(false)
  //   } catch (error) {
  //     console.error("Failed to update profile:", error)
  //     setProfileData(profileData)
  //     toast.error("Failed to update profile. Please try again.")
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  const openProfileEditModal = () => {
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

    // Initialize availability slots
    setAvailabilitySlots(profileData.profile.unavailability || []);

    // FIXED: Clear certificate states to prevent duplication
    setNewCertificatesFiles([]);
    setNewCertificatesMeta([]);

    // Clear map search query
    setMapSearchQuery("");

    setIsProfileEditOpen(true);
  };

  const updateProfileAPI = async (updatedData: any) => {
    try {
      setIsLoading(true);
      const profileId = profile?._id;

      let apiUrl: string;
      let method: string;

      if (!profileId) {
        apiUrl = `${process.env.NEXT_PUBLIC_FIREBASE_API_URL}/api/create-profile`;
        method = "POST";
      } else {
        apiUrl = `${process.env.NEXT_PUBLIC_FIREBASE_API_URL}/api/edit-profile/${profileId}`;
        method = "PUT";
      }

      const formData = new FormData();

      formData.append("userId", user ? user?.id : "");

      if (updatedData.profile) {
        if (updatedData.profile.bio) {
          formData.append("bio", updatedData.profile.bio);
        }
        if (updatedData.profile.skills) {
          formData.append("skills", JSON.stringify(updatedData.profile.skills));
        }
        if (updatedData.profile.languages) {
          formData.append(
            "languages",
            JSON.stringify(updatedData.profile.languages)
          );
        }
        if (updatedData.profile.availability) {
          formData.append(
            "availability",
            JSON.stringify(updatedData.profile.availability)
          );
        }
        if (updatedData.profile.location) {
          formData.append(
            "profileLocation",
            JSON.stringify(updatedData.profile.location)
          );
        }
      }

      if (profileFormData.name) {
        formData.append("name", profileFormData.name);
      }
      if (profileFormData.location) {
        formData.append("location", profileFormData.location);
      }

      if (updatedData.education) {
        formData.append(
          "education",
          JSON.stringify(
            updatedData.education
              .map((edu: any) => ({
                institure: edu.institution || edu.institure || "",
                Graduation: edu.period
                  ? new Date(`${edu.period}-12-31`).toISOString()
                  : undefined,
                Degree: edu.type || edu.Degree || "",
                GPA: edu.description?.includes("GPA:")
                  ? edu.description.replace("GPA: ", "")
                  : edu.GPA || "",
              }))
              .filter((edu: any) => edu.institure)
          )
        );
      }

      if (updatedData.experiences) {
        formData.append(
          "WorkExperience",
          JSON.stringify(
            updatedData.experiences
              .map((exp: any) => ({
                company: exp.company || "",
                title: exp.title || "",
                description: exp.description || "",
              }))
              .filter((exp: any) => exp.company)
          )
        );
      }

      if (updatedData.certifications) {
        const certData = updatedData.certifications.map((cert: any) => ({
          name: cert.name || "Unknown Certificate",
          issuer: cert.issuer || "Unknown Issuer",
          date: cert.date || "Unknown Date",
          description: cert.description || "",
        }));

        formData.append("certificates", JSON.stringify(certData));
      }

      updatedData.certifications?.forEach((cert: any) => {
        if (cert.certificateFile instanceof File) {
          formData.append("certificateFiles", cert.certificateFile);
        }
      });

      const response = await fetch(apiUrl, {
        method: method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const result = await response.json();

      if (result.profile && updateProfile) {
        updateProfile(result.profile);
      }
      return result;
    } catch (error: any) {
      toast.error(error.message);
      console.error("Error updating profile:", error);
      throw error;
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => openModal(type)}
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
    setIsModalOpen(true);
  };

  const openModal = (type: "education" | "experience" | "certificate") => {
    setModalType(type);
    setEditingItem(null);
    setIsEditMode(false);
    setFormData({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setEditingItem(null);
    setIsEditMode(false);
    setFormData({});
    setPreviewCert(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };
  // Replace the complex updateSpecificSectionAPI with this simpler version
  const updateSpecificSectionAPI = async (
    sectionType: string,
    sectionData: any
  ) => {
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("userId", user?.id!);

      if (sectionType === "education") {
        const validEducation = sectionData
          .filter((edu: any) => edu.institution && edu.institution.trim())
          .map((edu: any) => ({
            institure: edu.institution, // Map to backend field name
            Graduation: edu.period
              ? new Date(`${edu.period}-12-31`).toISOString()
              : undefined,
            Degree: edu.type || edu.Degree,
            GPA: edu.description?.includes("GPA")
              ? edu.description.replace("GPA: ", "")
              : edu.GPA,
          }));

        formData.append("education", JSON.stringify(validEducation));
      }

      if (sectionType === "experience") {
        const validExperiences = sectionData
          .filter((exp: any) => exp.company && exp.company.trim())
          .map((exp: any) => ({
            company: exp.company,
            title: exp.title,
            description: exp.description || "",
          }));

        formData.append("WorkExperience", JSON.stringify(validExperiences));
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_FIREBASE_API_URL}/api/edit-profile/${profile?._id}`;
      const response = await fetch(apiUrl, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Update failed");
      }

      const result = await response.json();
      if (result.profile) {
        updateProfile!(result.profile);
      }
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

      if (isEditMode && editingItem && modalType) {
        // Update existing item
        updatedSection = profileData[
          modalType === "certificate"
            ? "certifications"
            : modalType === "education"
            ? "education"
            : "experiences"
        ].map((item: any) =>
          item.id === editingItem.id ? { ...item, ...formData } : item
        );
      } else if (modalType) {
        // Add new item
        const newItem = { ...formData, id: Date.now() };
        updatedSection = [
          ...profileData[
            modalType === "certificate"
              ? "certifications"
              : modalType === "education"
              ? "education"
              : "experiences"
          ],
          newItem,
        ];
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
          { name: "period", label: "Period", placeholder: "e.g., 2020-2024" },
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
          { name: "company", label: "Company", placeholder: "Company name" },
          {
            name: "period",
            label: "Period",
            placeholder: "e.g., 2023-Present",
          },
          {
            name: "description",
            label: "Description",
            placeholder: "Describe your role and achievements",
            type: "textarea",
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

    const handleCertificateFileChange = (file: File | null, meta: any = {}) => {
      if (!file) return;

      // FIXED: Ensure we're only adding new certificates, not duplicating
      setNewCertificatesFiles((prev) => {
        // Check if file already exists to prevent duplicates
        const fileExists = prev.some(
          (existingFile) =>
            existingFile.name === file.name && existingFile.size === file.size
        );

        if (fileExists) {
          console.warn("File already selected:", file.name);
          return prev;
        }

        return [...prev, file];
      });

      setNewCertificatesMeta((prev) => {
        // Check if meta already exists
        const metaExists = prev.some(
          (existingMeta) => existingMeta.name === meta.name
        );

        if (metaExists) {
          return prev;
        }

        return [...prev, meta];
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
              {config.fields.map((field, index) => (
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
                    Certificate File (PDF or image)
                  </label>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) =>
                      handleCertificateFileChange(e.target.files?.[0] || null)
                    }
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {formData.certificateUrl && (
                    <div className="mt-3 border border-gray-200 rounded-lg p-2">
                      <p className="text-xs text-gray-500 mb-2">
                        {formData.certificateFileName || "Selected file"}
                      </p>
                      {isPdf(
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
                  className="flex-1 px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full transition-colors"
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
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
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
                  className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors "
                  aria-label="Edit education"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </motion.button>

                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 pr-10">
                  {edu.type}
                </h3>
                <p className="text-gray-500 text-sm sm:text-base mb-3 sm:mb-4">
                  {edu.period}
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  {edu.institution}
                </p>
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
            {profileData.experiences.map((exp: any, index: number) => (
              <motion.div
                key={exp.id}
                variants={cardVariants}
                whileHover={{
                  y: -4,
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-white rounded-xl p-4 sm:p-5 shadow-sm relative group"
              >
                <motion.button
                  onClick={() => openEditModal("experience", exp)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors "
                  aria-label="Edit experience"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </motion.button>

                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 pr-10">
                  {exp.title}
                </h3>
                <p className="text-blue-600 font-medium text-sm sm:text-base mb-2">
                  {exp.company}
                </p>
                <p className="text-gray-500 text-sm sm:text-base mb-3 sm:mb-4">
                  {exp.period}
                </p>
                <p className="text-gray-600 text-sm:text-base">
                  {exp.description}
                </p>
              </motion.div>
            ))}

            {renderAddCard(
              "Add Experience",
              "Add your work experience to highlight your professional journey",
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
              <div className="space-y-4">
                {applications.map((application, index) => (
                  <motion.div
                    key={application._id}
                    variants={cardVariants}
                    whileHover={{
                      y: -2,
                      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
                    }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-xl p-6 shadow-sm border"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          Job Application {application.job.title || ""}
                        </h4>
                        <h4 className="text-sm font-light text-gray-900 mb-2">
                          {application.job.description.substring(0, 120) +
                            "..." || ""}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>
                            Applied:{" "}
                            {new Date(
                              application.appliedDate
                            ).toLocaleDateString()}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              application.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : application.status === "reviewing"
                                ? "bg-blue-100 text-blue-800"
                                : application.status === "shortlisted"
                                ? "bg-green-100 text-green-800"
                                : application.status === "interview"
                                ? "bg-purple-100 text-purple-800"
                                : application.status === "hired"
                                ? "bg-green-200 text-green-900"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {application.status.charAt(0).toUpperCase() +
                              application.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      {application.documents &&
                        application.documents.length > 0 && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              setDocumentUploadModal({
                                isOpen: true,
                                applicationId: application._id,
                                documents: application.documents,
                              })
                            }
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                          >
                            <Upload className="w-4 h-4" />
                            Upload Documents
                          </motion.button>
                        )}
                    </div>
                  </motion.div>
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
            className="space-y-6 sm:space-y-8"
          >
            {profileData.certifications.map((cert: any) => (
              <motion.div
                key={cert.id}
                variants={cardVariants}
                whileHover={{
                  y: -4,
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-3 sm:space-y-4 bg-white rounded-xl p-4 sm:p-5 shadow-sm relative group"
              >
                <motion.button
                  onClick={() => openEditModal("certificate", cert)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors "
                  aria-label="Edit certificate"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </motion.button>

                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 pr-10">
                  {cert.name}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Issued by: {cert.issuer}
                </p>
                <p className="text-gray-500 text-sm sm:text-base">
                  Date: {cert.date}
                </p>
                {cert.description && (
                  <p className="text-gray-600 text-sm sm:text-base">
                    {cert.description}
                  </p>
                )}

                {cert.certificateUrl && (
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() =>
                        setPreviewCert({
                          url: cert.certificateUrl,
                          name: cert.name,
                          type: cert.certificateMime,
                        })
                      }
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                    >
                      <Eye className="w-4 h-4" />
                      View Certificate
                    </button>
                    <a
                      href={cert.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                    >
                      <FileText className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                )}
              </motion.div>
            ))}

            {renderAddCard(
              "Add Certificate",
              "Upload your certificates to showcase your qualifications",
              "Add Certificate",
              <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto" />,
              "certificate"
            )}

            <AnimatePresence>
              {previewCert && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
                  onClick={() => setPreviewCert(null)}
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {previewCert.name || "Certificate Preview"}
                      </p>
                      <button
                        onClick={() => setPreviewCert(null)}
                        className="p-2 rounded-md hover:bg-gray-100"
                        aria-label="Close preview"
                      >
                        <X className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                    <div className="p-4 bg-gray-50">
                      {previewCert.type?.includes("pdf") ? (
                        <iframe
                          src={previewCert.url}
                          title="Certificate PDF"
                          className="w-full h-[70vh] rounded-md bg-white"
                        />
                      ) : (
                        <img
                          src={previewCert.url || "/placeholder.svg"}
                          alt="Certificate image"
                          className="w-full max-h-[70vh] object-contain rounded-md bg-white"
                        />
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
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
            <CalendarSection />
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
                      Resume Management
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
        <Link href="/" className="flex flex-col">
          <span
            className={`md:text-2xl text-xl font-semibold transition-colors duration-300 ${
              isScrolled ? "text-black " : "text-black"
            }`}
          >
            ProjectMatch
          </span>
          <span
            className={`text-sm font-medium transition-colors duration-300 ${
              isScrolled ? "text-black" : "text-black"
            }`}
          >
            By Comscope
          </span>
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
            <motion.button
              onClick={() => router.push("/jobs")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
            >
              Explore Jobs
            </motion.button>
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

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsProfilePictureModalOpen(true)}
                  className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-5 sm:h-5 p-1 bg-blue-600
                   hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                >
                  <Pencil className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </motion.button>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8">
              {renderStars()}
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
                className="rounded-full px-4 sm:px-6 py-1.5 sm:py-2 border border-[#12372B] text-gray-700 bg-transparent hover:bg-gray-50 transition-colors text-sm sm:text-base whitespace-nowrap"
              >
                {isProfileComplete() ? "Edit Profile" : "Add Profile"}
              </motion.button>
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
                  className={`px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
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
              className="absolute bottom-0 h-0.5 bg-blue-600"
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
              onClick={() => setIsProfilePictureModalOpen(false)}
            />

            <motion.div
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  id="profile-picture-title"
                  className="text-lg font-semibold text-gray-900"
                >
                  Profile Picture
                </h2>
                <button
                  onClick={() => setIsProfilePictureModalOpen(false)}
                  aria-label="Close"
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-full overflow-hidden">
                    {profilePicture ? (
                      <img
                        src={profilePicture || "/placeholder.svg"}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">No photo</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <input
                    ref={profileFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                  />

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => profileFileInputRef.current?.click()}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                  >
                    Upload Photo
                  </motion.button>

                  {profilePicture && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRemoveProfilePicture}
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                    >
                      Remove Photo
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

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {isProfileEditOpen && (
          <motion.div
            key="profile-edit-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 text-gray-500 max-h-[90vh] overflow-y-auto"
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-6">
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
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-5">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100 transition-colors"
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
                          <span>{slot.description}</span>{" "}
                          {/* ✅ Render specific property */}
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

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-full border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsProfileEditOpen(false)}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
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
                {/* <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={newAvailabilityDate}
                    onChange={(e) => setNewAvailabilityDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div> */}

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
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowAvailabilityModal(false)}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
