"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Bot, Plus, X, MapPin, Search } from "lucide-react";
import { motion } from "framer-motion";
import JobHeader from "@/app/components/jobHeader";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import { toast } from "react-toastify";
import Link from "next/link";
import Image from "next/image";

// Ola Maps types
interface OlaMapsPlace {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name: string;
}

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

        // Fly to detected location
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo({
            center: [longitude, latitude],
            zoom: 15,
            duration: 2000,
          });
        }

        reverseGeocode(latitude, longitude);
        setIsDetecting(false);
      },
      (error) => {
        console.error("Geolocation error:", error);

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

      {/* Debug info - remove this in production */}
      {debugInfo && (
        <div className="absolute top-2 left-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs max-h-8 overflow-hidden">
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
  const [suggestions, setSuggestions] = useState<OlaMapsPlace[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced search for suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (value.trim() && value.length > 2) {
        searchSuggestions(value);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value]);

  // Only trigger suggestions when user is actively typing (not from auto-detect)
  useEffect(() => {
    if (value.trim() && value.length > 2 && !isAutoDetected) {
      setShowSuggestions(true);
    }
  }, [value, isAutoDetected]);

  const searchSuggestions = async (query: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(
          query
        )}&api_key=${process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY}`,
        { signal: abortControllerRef.current.signal }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Ola Maps API response:", data);
        // Handle different response structures from Ola Maps API
        const predictions = data.predictions || data.suggestions || data.results || [];
        console.log("Processed predictions:", predictions);
        
        if (predictions.length > 0) {
          setSuggestions(predictions);
          setShowSuggestions(true);
          setSelectedIndex(-1);
        } else {
          console.log("No predictions found, hiding suggestions");
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Error fetching suggestions:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    // Handle different response structures
    const address = suggestion.formatted_address || suggestion.description || suggestion.place_name || suggestion.name;
    const lat = suggestion.geometry?.location?.lat || suggestion.lat;
    const lng = suggestion.geometry?.location?.lng || suggestion.lng;
    
    onChange(address);
    onLocationSelect({
      lat: lat,
      lng: lng,
      address: address,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSearch = async () => {
    if (!value.trim()) return;

    setIsSearching(true);
    setSearchTrigger(value); // This will trigger the map to search

    // Reset after a short delay
    setTimeout(() => {
      setIsSearching(false);
    }, 2000);
  };

  // Update input value when location is auto-detected (but don't show suggestions)
  useEffect(() => {
    if (selectedLocation && selectedLocation.address) {
      // Set flag to indicate this is from auto-detect
      setIsAutoDetected(true);
      // Update the input value with the detected address
      onChange(selectedLocation.address);
      // Don't show suggestions dropdown for auto-detected locations
      setShowSuggestions(false);
    }
  }, [selectedLocation, onChange]);


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={value}
              onChange={(e) => {
                // Clear auto-detect flag when user types
                if (isAutoDetected) {
                  setIsAutoDetected(false);
                }
                onChange(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              onKeyPress={handleKeyPress}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onBlur={() => {
                // Delay hiding to allow clicks on suggestions
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              placeholder="Enter address or click auto-detect to select location..."
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs text-black sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
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

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-[9999] mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.place_id}
                className={`px-4 py-3 cursor-pointer text-sm hover:bg-gray-50 ${
                  index === selectedIndex ? "bg-blue-50" : ""
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="font-medium text-gray-900">
                  {(suggestion as any).name || (suggestion as any).description || (suggestion as any).place_name || "Location"}
                </div>
                <div className="text-gray-500 text-xs">
                  {(suggestion as any).formatted_address || (suggestion as any).description || (suggestion as any).place_name || "Address not available"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <OlaMapComponent
        location={selectedLocation}
        onLocationSelect={onLocationSelect}
        searchQuery={searchTrigger}
      />
    </div>
  );
};

export default function PostRole() {
  const [activePayRange, setActivePayRange] = useState("Daily");
  const [companyPerksInput, setCompanyPerksInput] = useState("");
  const [companyPerks, setCompanyPerks] = useState<string[]>([]);
  const [requiredSkillsetInput, setRequiredSkillsetInput] = useState("");
  const [requiredSkillset, setRequiredSkillset] = useState<string[]>([]);
  const [mandatoryCertificatesInput, setMandatoryCertificatesInput] =
    useState("");
  const [mandatoryCertificates, setMandatoryCertificates] = useState<string[]>(
    []
  );

  const [payRange, setPayRange] = useState("₹12,000-60,000");
  const [aboutJob, setAboutJob] = useState("");
  const [jobTittle, setjobTittle] = useState("");

  const [workStartDate, setWorkStartDate] = useState("");
  const [noOfOpenings, setnoOfOpenings] = useState(0);
  const [workEndDate, setWorkEndDate] = useState("");

  const [workLocation, setWorkLocation] = useState("");
  const [jobType, setJobType] = useState("Short Term"); 

  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<
    OlaMapsPlace[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Ola Maps related states
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [customQuestions, setCustomQuestions] = useState<
    Array<{
      id: number;
      question: string;
      type: "MCQ" | "Single Choice";
      options: string[];
    }>
  >([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentQuestionType, setCurrentQuestionType] = useState<
    "MCQ" | "Single Choice"
  >("MCQ");
  const [currentOption, setCurrentOption] = useState("");
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [educationQualificationInput, setEducationQualificationInput] =
    useState("");
  const [educationQualifications, setEducationQualifications] = useState<
    string[]
  >([]);
  const [responsibilityInput, setResponsibilityInput] = useState("");
  const [responsibilities, setResponsibilities] = useState<string[]>([]);

  const [pendingQualifications, setPendingQualifications] = useState<string[]>(
    []
  );
  const [showSplitPreview, setShowSplitPreview] = useState(false);
  const [pendingResponsibilities, setPendingResponsibilities] = useState<
    string[]
  >([]);
  const [showResponsibilitySplitPreview, setShowResponsibilitySplitPreview] =
    useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const [fatAdded, setFatAdded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  useEffect(() => {
    if (noOfOpenings < 0) {
      setnoOfOpenings(0);
    }
  }, [noOfOpenings]);

  const addPerk = () => {
    if (
      companyPerksInput.trim() &&
      !companyPerks.includes(companyPerksInput.trim())
    ) {
      setCompanyPerks([...companyPerks, companyPerksInput.trim()]);
      setCompanyPerksInput("");
    }
  };

  const removePerk = (perkToRemove: string) => {
    setCompanyPerks(companyPerks.filter((perk) => perk !== perkToRemove));
  };

  const addSkill = () => {
    if (
      requiredSkillsetInput.trim() &&
      !requiredSkillset.includes(requiredSkillsetInput.trim())
    ) {
      setRequiredSkillset([...requiredSkillset, requiredSkillsetInput.trim()]);
      setRequiredSkillsetInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setRequiredSkillset(
      requiredSkillset.filter((skill) => skill !== skillToRemove)
    );
  };
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };
  const addCertificate = () => {
    if (
      mandatoryCertificatesInput.trim() &&
      !mandatoryCertificates.includes(mandatoryCertificatesInput.trim())
    ) {
      setMandatoryCertificates([
        ...mandatoryCertificates,
        mandatoryCertificatesInput.trim(),
      ]);
      setMandatoryCertificatesInput("");
    }
  };

  const removeCertificate = (certificateToRemove: string) => {
    setMandatoryCertificates(
      mandatoryCertificates.filter((cert) => cert !== certificateToRemove)
    );
  };

  const addOptionToCurrentQuestion = () => {
    if (
      currentOption.trim() &&
      !currentOptions.includes(currentOption.trim())
    ) {
      setCurrentOptions([...currentOptions, currentOption.trim()]);
      setCurrentOption("");
    }
  };

  const removeOptionFromCurrentQuestion = (optionToRemove: string) => {
    setCurrentOptions(
      currentOptions.filter((option) => option !== optionToRemove)
    );
  };

  const addCustomQuestion = () => {
    if (currentQuestion.trim() && currentOptions.length > 0) {
      const newQuestion = {
        id: Date.now(),
        question: currentQuestion.trim(),
        type: currentQuestionType,
        options: [...currentOptions],
      };
      setCustomQuestions([...customQuestions, newQuestion]);
      setCurrentQuestion("");
      setCurrentOptions([]);
      setCurrentOption("");
    }
  };

  const removeCustomQuestion = (questionId: number) => {
    setCustomQuestions(customQuestions.filter((q) => q.id !== questionId));
  };

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const year = date.getFullYear();

    const suffix =
      day === 1 || day === 21 || day === 31
        ? "st"
        : day === 2 || day === 22
        ? "nd"
        : day === 3 || day === 23
        ? "rd"
        : "th";

    return `${day}${suffix} ${month} ${year}`;
  };

  const addEducationQualification = () => {
    if (educationQualificationInput.trim()) {
      const splitQualifications = educationQualificationInput
        .split(/[•|;]|\n{1,}|(?:\s*•\s*)/)
        .map((q) => q.trim())
        .filter((q) => q.length > 0)
        .filter((q) => !educationQualifications.includes(q));

      if (splitQualifications.length > 0) {
        setEducationQualifications([
          ...educationQualifications,
          ...splitQualifications,
        ]);
        setEducationQualificationInput("");
      }
    }
  };

  const confirmSplitQualifications = () => {
    const newQualifications = pendingQualifications.filter(
      (q) => !educationQualifications.includes(q)
    );
    setEducationQualifications([
      ...educationQualifications,
      ...newQualifications,
    ]);
    setEducationQualificationInput("");
    setShowSplitPreview(false);
    setPendingQualifications([]);
  };

  const removeEducationQualification = (qualificationToRemove: string) => {
    setEducationQualifications(
      educationQualifications.filter(
        (qualification) => qualification !== qualificationToRemove
      )
    );
  };

  const addResponsibility = () => {
    if (responsibilityInput.trim()) {
      const splitResponsibilities = responsibilityInput
        .split(/[•|;]|\n{1,}|(?:\s*•\s*)/)
        .map((r) => r.trim())
        .filter((r) => r.length > 0)
        .filter((r) => !responsibilities.includes(r));

      if (splitResponsibilities.length > 0) {
        setResponsibilities([...responsibilities, ...splitResponsibilities]);
        setResponsibilityInput("");
      }
    }
  };

  const removeResponsibility = (responsibilityToRemove: string) => {
    setResponsibilities(
      responsibilities.filter(
        (responsibility) => responsibility !== responsibilityToRemove
      )
    );
  };

  const confirmSplitResponsibilities = () => {
    const newResponsibilities = pendingResponsibilities.filter(
      (r) => !responsibilities.includes(r)
    );
    setResponsibilities([...responsibilities, ...newResponsibilities]);
    setResponsibilityInput("");
    setShowResponsibilitySplitPreview(false);
    setPendingResponsibilities([]);
  };
  const validateWorkDates = () => {
    if (!workStartDate || !workEndDate) {
      toast.error("Please select both start and end dates for work duration");
      return false;
    }

    const today = getTodayDate();
    const startDate = new Date(workStartDate);
    const endDate = new Date(workEndDate);
    const todayDate = new Date(today);

    if (startDate < todayDate) {
      toast.error("Work start date cannot be in the past");
      return false;
    }

    if (endDate < startDate) {
      toast.error("Work end date must be after start date");
      return false;
    }

    return true;
  };
  const router = useRouter();
  const { user } = useUser();

  const handleSubmit = async () => {
    if (!jobTittle.trim()) {
      toast.error("Job title is required");
      return;
    }
    if (!validateWorkDates()) {
      return;
    }
    if (noOfOpenings <= 0) {
      toast.error("no of opening cant be zero or in minus");
      return;
    }
    setIsPosting(true);

    try {
      const jobData = {
        company: `${user?.id}`,
        userId: `${user?.id}`,
        title: jobTittle,
        jobType,
        companyPerks,
        requiredSkillset,
        mandatoryCertificates,
        noOfOpenings,
        educationQualifications,
        responsibilities,
        payRange,
        payRangeType: activePayRange,
        workStartDate,
        workEndDate,
        workLocation,
        description: aboutJob,
        customQuestions, // This line should already exist
        locationCoordinates: selectedLocation,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/jobs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(jobData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Job posted successfully!");
        router.push("/company/profile");
      } else {
        toast.error(data.message || "Failed to post job");
      }
    } catch (error) {
      console.error("Error posting job:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleAIAssist = async () => {
    if (!aboutJob.trim()) {
      toast.error("Please enter a job description first");
      return;
    }

    if (aboutJob.length < 50) {
      toast.error(
        "Please provide a more detailed job description for better analysis"
      );
      return;
    }

    try {
      setIsAnalyzing(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/jobs/ai-assist`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description: aboutJob.trim(),
            jobTitle: jobTittle.trim(),
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        const { data } = result;

        // Auto-fill job title if not already filled
        if (data.jobTitle && !jobTittle.trim()) {
          setjobTittle(data.jobTitle);
        }

        if (data.location && !workLocation.trim()) {
          setWorkLocation(data.location);
          setLocationSearchQuery(data.location);
        }

        // Set the clean job description - THIS IS THE KEY FIX
        if (data.cleanJobDescription) {
          setAboutJob(data.cleanJobDescription);
        }

        // Auto-fill form fields with extracted data
        if (data.companyPerks.length > 0) {
          setCompanyPerks((prev) => [
            ...new Set([...prev, ...data.companyPerks]),
          ]);
        }

        if (data.requiredSkillset.length > 0) {
          setRequiredSkillset((prev) => [
            ...new Set([...prev, ...data.requiredSkillset]),
          ]);
        }

        if (data.mandatoryCertificates.length > 0) {
          setMandatoryCertificates((prev) => [
            ...new Set([...prev, ...data.mandatoryCertificates]),
          ]);
        }

        if (data.educationQualifications.length > 0) {
          setEducationQualifications((prev) => [
            ...new Set([...prev, ...data.educationQualifications]),
          ]);
        }

        if (data.responsibilities.length > 0) {
          setResponsibilities((prev) => [
            ...new Set([...prev, ...data.responsibilities]),
          ]);
        }

        if (data.fatIncluded !== undefined) {
          setFatAdded(data.fatIncluded);
        }

        if (data.suggestedPayRange) {
          if (payRange === "₹12,000-60,000" || !payRange.trim()) {
            setPayRange(data.suggestedPayRange);
          }
        }

        // Set pay range type (Daily/Monthly) - NEW FIX
        if (data.payRangeType) {
          setActivePayRange(data.payRangeType);
        }

        // Set work duration dates - NEW FIX
        if (data.workStartDate) {
          setWorkStartDate(data.workStartDate);
        }
        if (data.workEndDate) {
          setWorkEndDate(data.workEndDate);
        }

        // Scroll to top after successful analysis
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        // Enhanced success message
        const extractedItems = [];
        if (data.jobTitle && !jobTittle.trim())
          extractedItems.push("job title");
        if (data.location && !workLocation.trim())
          extractedItems.push("location");
        if (data.suggestedPayRange) extractedItems.push("pay range");
        if (data.cleanJobDescription)
          extractedItems.push("clean job description");
        if (data.payRangeType) extractedItems.push("pay range type");

        const autoFillMessage =
          extractedItems.length > 0
            ? ` Auto-filled: ${extractedItems.join(", ")}.`
            : "";
        const fatMessage = data.fatIncluded
          ? " 🍽️ FAT benefits detected and toggle enabled!"
          : "";

        toast.success(
          ` AI Analysis Complete! Added ${data.companyPerks.length} perks, ${data.requiredSkillset.length} skills, ${data.educationQualifications.length} qualifications, and ${data.responsibilities.length} responsibilities.${autoFillMessage}${fatMessage}`
        );
      } else {
        toast.error(result.message || "Failed to analyze job description");
      }
    } catch (error) {
      console.error("Error calling AI assist:", error);
      toast.error(
        "Network error occurred during analysis. Please check your connection."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <JobHeader />
      
      {/* Logo positioned like in header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-4 sm:top-8 left-4 sm:left-8 z-10"
      >
        <Link href="/" className="flex items-center gap-1">
          <Image
            src="/black_logo.png"
            alt="ProjectMATCH by Compscope"
            width={200}
            height={80}
            className="h-16 sm:h-16 md:h-16 lg:h-16 xl:h-28 w-auto"
            priority
          />
          <div className="leading-tight text-[#163A33]">
            <div className="text-xs sm:text-sm md:text-base lg:text-2xl font-black">ProjectMATCH</div>
            <div className="text-[10px] sm:text-xs md:text-sm text-gray-600"><span className="text-[#3EA442] font-bold">by Compscope</span></div>
          </div>
        </Link>
      </motion.div>

      <div className="max-w-5xl md:mx-auto p-8 -mx-5">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 md:p-8 shadow-sm"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
                <span className="text-purple-700 font-semibold text-sm">R</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Post a Role
              </h1>
              <span className="text-gray-500 text-lg">Role - 1</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isPosting}
              className={`rounded-full text-black font-medium text-sm px-10 py-2 transition-colors ${
                isPosting
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#76FF82] hover:bg-green-300"
              }`}
            >
              {isPosting ? "Posting..." : "Post"}
            </motion.button>
          </div>

          {/* Form Fields */}
          <div className="space-y-3 my-3">
            <label className="text-sm font-medium text-gray-700">
              Job Title
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={jobTittle}
                onChange={(e) => setjobTittle(e.target.value)}
                placeholder="Enter Job Title"
                className="w-48 px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-8">
            {/* Company Perks */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Add company perks
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={companyPerksInput}
                  onChange={(e) => setCompanyPerksInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addPerk()}
                  placeholder="Perks..."
                  className="w-48 px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={addPerk}
                  className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {companyPerks.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {companyPerks.map((perk, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm"
                    >
                      <span>{perk}</span>
                      <button
                        onClick={() => removePerk(perk)}
                        className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            {/* Job Type Selection - Add this after the "Add No Of Openings" section */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Job Type
              </label>
              <div className="cursor-pointer flex bg-gray-100 rounded-lg p-1 w-fit">
                {["Short Term", "Long Term", ].map((type) => (
                  <button
                    key={type}
                    onClick={() => setJobType(type)}
                    className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                      jobType === type
                        ? "bg-[#76FF82] text-black shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Add No Of Openings
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={noOfOpenings}
                  required
                  onChange={(e) => {
                    setnoOfOpenings(+e.target.value);
                  }}
                  placeholder="50"
                  className="w-48 px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            {/* About Job */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  About Job
                </label>
                <button
                  type="button"
                  onClick={handleAIAssist}
                  disabled={
                    isAnalyzing || !aboutJob.trim() || aboutJob.length < 50
                  }
                  className="flex items-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-3 h-3 border-2 border-black text-black border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-black">Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-gray-500">AI Assist</span>
                      <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={aboutJob}
                onChange={(e) => setAboutJob(e.target.value)}
                placeholder="Description and requirements about this role..."
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-400 text-black resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Required Skillset */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Add required skillset
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={requiredSkillsetInput}
                  onChange={(e) => setRequiredSkillsetInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addSkill()}
                  placeholder="Type your skills"
                  className="w-48 px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={addSkill}
                  className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {requiredSkillset.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {requiredSkillset.map((skill, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm"
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => removeSkill(skill)}
                        className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Mandatory Certifications */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Mandatory Certifications
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mandatoryCertificatesInput}
                  onChange={(e) =>
                    setMandatoryCertificatesInput(e.target.value)
                  }
                  onKeyPress={(e) => e.key === "Enter" && addCertificate()}
                  placeholder="Enter certificates"
                  className="w-48 px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={addCertificate}
                  className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {mandatoryCertificates.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {mandatoryCertificates.map((cert, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm"
                    >
                      <span>{cert}</span>
                      <button
                        onClick={() => removeCertificate(cert)}
                        className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Education Qualifications */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Education Qualifications
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={educationQualificationInput}
                  onChange={(e) =>
                    setEducationQualificationInput(e.target.value)
                  }
                  onKeyPress={(e) =>
                    e.key === "Enter" && addEducationQualification()
                  }
                  placeholder="Enter education qualification (e.g., BE Mechanical Engineer)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={addEducationQualification}
                  className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* FAT Toggle */}
              <div className="pt-2">
                <div
                  className={`flex items-center justify-between border rounded-xl p-4 ${
                    fatAdded
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      FAT included?
                    </span>
                    <span className="text-xs text-gray-500">
                      (food, accommodation, travel)
                    </span>
                    {fatAdded && (
                      <span className="text-xs text-green-600 mt-1">
                        ✨ Detected by AI Assistant
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={fatAdded}
                    aria-label="Toggle FAT inclusion"
                    onClick={() => setFatAdded((v) => !v)}
                    className={`relative inline-flex items-center h-7 w-18 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      fatAdded ? "bg-[#76FF82]" : "bg-gray-200"
                    }`}
                  >
                    <motion.span
                      className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm"
                      animate={{ x: fatAdded ? 44 : 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 360,
                        damping: 28,
                      }}
                    />
                    <motion.span
                      key={fatAdded ? "on" : "off"}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 0 }}
                      className={`w-full text-center text-sm font-semibold ${
                        fatAdded ? "text-black" : "text-gray-600"
                      }`}
                    >
                      {fatAdded ? "yes" : "no"}
                    </motion.span>
                  </button>
                </div>
              </div>

              {educationQualifications.length > 0 && (
                <div className="space-y-2 mt-3">
                  {educationQualifications.map((qualification, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <span className="text-blue-800 text-sm font-medium">
                          {qualification}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          removeEducationQualification(qualification)
                        }
                        className="w-6 h-6 flex items-center justify-center text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              {showSplitPreview && (
                <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm font-medium text-blue-800 mb-2">
                    We detected multiple qualifications. Split them into
                    separate items?
                  </div>
                  <div className="space-y-1 mb-3">
                    {pendingQualifications.map((qual, index) => (
                      <div key={index} className="text-sm text-blue-700 pl-4">
                        • {qual}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={confirmSplitQualifications}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                      Yes, Split Them
                    </button>
                    <button
                      onClick={() => {
                        setEducationQualifications([
                          ...educationQualifications,
                          educationQualificationInput.trim(),
                        ]);
                        setEducationQualificationInput("");
                        setShowSplitPreview(false);
                      }}
                      className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                    >
                      Keep as One Item
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Job Responsibilities */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Job Responsibilities
              </label>
              <div className="flex gap-2">
                <textarea
                  value={responsibilityInput}
                  onChange={(e) => setResponsibilityInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && !e.shiftKey && addResponsibility()
                  }
                  placeholder="Enter responsibilities (e.g., Review and preparing ITP • Coordinate with site team • Attending inspection calls)"
                  rows={3}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 text-black resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={addResponsibility}
                  className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors self-start"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {showResponsibilitySplitPreview && (
                <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm font-medium text-green-800 mb-2">
                    We detected multiple responsibilities. Split them into
                    separate items?
                  </div>
                  <div className="space-y-1 mb-3">
                    {pendingResponsibilities.map((resp, index) => (
                      <div key={index} className="text-sm text-green-700 pl-4">
                        • {resp}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={confirmSplitResponsibilities}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                    >
                      Yes, Split Them
                    </button>
                    <button
                      onClick={() => {
                        setResponsibilities([
                          ...responsibilities,
                          responsibilityInput.trim(),
                        ]);
                        setResponsibilityInput("");
                        setShowResponsibilitySplitPreview(false);
                      }}
                      className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                    >
                      Keep as One Item
                    </button>
                  </div>
                </div>
              )}

              {responsibilities.length > 0 && (
                <div className="space-y-2 mt-3">
                  {responsibilities.map((responsibility, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-start justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <span className="text-green-800 text-sm font-medium leading-relaxed">
                          {responsibility}
                        </span>
                      </div>
                      <button
                        onClick={() => removeResponsibility(responsibility)}
                        className="w-6 h-6 flex items-center justify-center text-green-500 hover:text-green-700 hover:bg-green-100 rounded-full transition-colors flex-shrink-0 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Work Duration */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Work Duration
              </label>
              <div className="flex gap-4">
                <div className="relative">
                  <input
                    type="date"
                    value={workStartDate}
                    onChange={(e) => setWorkStartDate(e.target.value)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDateForDisplay(workStartDate)}
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="date"
                    value={workEndDate}
                    onChange={(e) => setWorkEndDate(e.target.value)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDateForDisplay(workEndDate)}
                  </div>
                </div>
              </div>
            </div>

            {/* Work Location with Fixed Ola Maps Integration */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Work Location
              </label>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <h3 className="text-sm sm:text-base font-medium text-gray-700">
                    Location
                  </h3>
                </div>

                <LocationInputWithSearch
                  value={locationSearchQuery}
                  onChange={setLocationSearchQuery}
                  onLocationSelect={(location) => {
                    setSelectedLocation({
                      lat: location.lat,
                      lng: location.lng,
                    });
                    setWorkLocation(location.address);
                    setLocationSearchQuery(location.address);
                  }}
                  selectedLocation={selectedLocation ?? undefined}
                />
              </div>
            </div>

            {/* Pay Range */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">
                Pay Range
              </label>

              <div className="flex bg-gray-100 rounded-lg p-1 w-fit mt-2">
                {["Daily", "Monthly"].map((option) => (
                  <button
                    key={option}
                    onClick={() => setActivePayRange(option)}
                    className={`px-8 py-1 text-sm font-medium rounded-md transition-all ${
                      activePayRange === option
                        ? "bg-[#76FF82] text-black shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={payRange}
                onChange={(e) => setPayRange(e.target.value)}
                className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg text-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>

            {/* Custom Question */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">
                Custom Question
              </label>

              <div className="space-y-3">
                <div className="text-xs text-gray-500">Question Type</div>
                <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
                  {(["MCQ", "Single Choice"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setCurrentQuestionType(type)}
                      className={`px-4 py-1 text-sm font-medium rounded-md transition-all ${
                        currentQuestionType === type
                          ? "bg-[#76FF82] text-black shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  placeholder="Enter your Question"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <div className="space-y-3">
                  <div className="text-xs text-gray-500">Options</div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentOption}
                      onChange={(e) => setCurrentOption(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && addOptionToCurrentQuestion()
                      }
                      placeholder="Enter Option"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={addOptionToCurrentQuestion}
                      className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {currentOptions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {currentOptions.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm"
                        >
                          <span>{option}</span>
                          <button
                            onClick={() =>
                              removeOptionFromCurrentQuestion(option)
                            }
                            className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentQuestion && currentOptions.length > 0 && (
                    <button
                      onClick={addCustomQuestion}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Create Question +
                    </button>
                  )}
                </div>
              </div>

              {customQuestions.length > 0 && (
                <div className="space-y-4">
                  <div className="text-sm font-medium text-gray-700">
                    Added Questions
                  </div>
                  {customQuestions.map((question) => (
                    <div
                      key={question.id}
                      className="border border-gray-200 rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-900">
                          {question.question}
                        </div>
                        <button
                          onClick={() => removeCustomQuestion(question.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">
                        Type: {question.type}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {question.options.map((option, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {option}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  setCurrentQuestion("");
                  setCurrentOptions([]);
                  setCurrentOption("");
                  setCurrentQuestionType("MCQ");
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Add another Question +
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
