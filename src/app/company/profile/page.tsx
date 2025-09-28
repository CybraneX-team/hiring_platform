"use client";

import { useState, useRef, useEffect } from "react";
import {
  Star,
  Plus,
  ArrowLeft,
  X,
  Pencil,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ResumeManager from "../../components/Company/ResumeManager";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/app/context/UserContext";
// import { toast } from "react-toastify";
import JobStatusDropdown from "@/app/components/JobStatusDropdown";

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
          // Default location (Bengaluru)
          const defaultLocation = location || { lat: 12.9716, lng: 77.5946 };


          mapInstanceRef.current = olaMaps.init({
            style:
              "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
            container: mapRef.current,
            center: [defaultLocation.lng, defaultLocation.lat],
            zoom: 12,
          });

          mapInstanceRef.current.on("load", () => {
            setIsMapLoaded(true);

            // Add marker if location exists
            if (location) {
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

          // Add error handling
          mapInstanceRef.current.on("error", (e: any) => {
            console.error("Map error:", e);
          });
        } catch (error) {
          console.error("Error initializing map:", error);
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


    try {
      // Remove existing marker
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }

      // Validate coordinates
      if (isNaN(lat) || isNaN(lng)) {
        console.error("Invalid coordinates:", lat, lng);
        return;
      }

      // Create marker element
      const markerElement = document.createElement("div");
      markerElement.className = "custom-marker";
      markerElement.style.cssText = `
        width: 30px; 
        height: 30px; 
        background-color: #3b82f6; 
        border: 3px solid white; 
        border-radius: 50%; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 1000;
        position: relative;
      `;

      const innerDot = document.createElement("div");
      innerDot.style.cssText = `
        width: 12px; 
        height: 12px; 
        background-color: white; 
        border-radius: 50%;
      `;
      markerElement.appendChild(innerDot);


      // Ensure we have the Marker constructor
      if (!olaMaps || !olaMaps.Marker) {
        console.error("OlaMaps Marker not available");

        return;
      }

      // Add marker to map
      markerRef.current = new olaMaps.Marker({
        element: markerElement,
      })
        .setLngLat([lng, lat])
        .addTo(mapInstanceRef.current);


      // Add popup if available
      if (olaMaps.Popup) {
        const popup = new olaMaps.Popup({
          offset: 25,
        }).setHTML(
          `<div style="padding: 8px; font-size: 14px; font-weight: 500;">${title}</div>`
        );

        markerRef.current.setPopup(popup);
      }
    } catch (error) {
      console.error("Error adding marker:", error);
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

        <div className="px-2 sm:px-3 py-1 bg-gray-700 text-white text-xs rounded-full">
          Click to pin
        </div>
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

  const handleSearch = async () => {
    if (!value.trim()) return;

    setIsSearching(true);
    setSearchTrigger(value); // This will trigger the map to search

    // Reset after a short delay
    setTimeout(() => {
      setIsSearching(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter address or click on map to select location..."
          className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
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
  const [applicationsError, setApplicationsError] = useState<any>(null);
  const [updatingJobStatus, setUpdatingJobStatus] = useState<string | null>(
    null
  );
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<any>(null);

  // Add this useEffect for authentication check
  useEffect(() => {
    if (!user) {
      router.push("/profile");
      return;
    }

    if (user.signedUpAs !== "Company") {
      router.push("/profile");
      return;
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
        `${process.env.NEXT_PUBLIC_FIREBASE_API_URL}/jobs/getAllJobsByCompany?companyId=${profile._id}`
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
        `${process.env.NEXT_PUBLIC_FIREBASE_API_URL}/company/complete-profile`,
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
        `${process.env.NEXT_PUBLIC_FIREBASE_API_URL}/company/upload-logo`,
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
        `${process.env.NEXT_PUBLIC_FIREBASE_API_URL}/company/remove-logo`,
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
        `${process.env.NEXT_PUBLIC_FIREBASE_API_URL}/jobs/updateJobStatus`,
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
            className="space-y-6 sm:space-y-8 text-black p-4 sm:p-6 lg:px-8"
          >
            <div className="bg-white rounded-lg p-4 sm:p-6 lg:px-8 space-y-4 sm:space-y-6">
              <motion.div
                variants={itemVariants}
                className="text-center py-4 sm:py-8"
              >
                <h3 className="text-xs sm:text-sm text-[#A1A1A1] font-medium mb-4 sm:mb-6">
                  Company Logo and Identity According to legal Documentation
                </h3>

                <div className="flex flex-col items-center space-y-3 sm:space-y-4">
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
                      className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-5 sm:h-5 p-1 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                    >
                      <Pencil className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </motion.button>
                  </div>

                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 truncate">
                    {formState.companyName || "Company Name"}
                  </h2>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="space-y-3 sm:space-y-4"
              >
                <h3 className="text-xs sm:text-sm font-medium text-[#A1A1A1]">
                  Company description
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed p-3 sm:p-4 rounded-lg">
                  {formState.companyDescription ||
                    "Enter company description..."}
                </p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="space-y-3 mt-6 sm:mt-10 pb-6 sm:pb-10"
              >
                <h3 className="text-xs sm:text-sm text-[#A1A1A1]">
                  No of People in Organization
                </h3>
                <div className="text-md  max-w-full sm:max-w-sm  text-gray-900 p-3 sm:p-4 rounded-lg">
                  {formState.orgSize || "Enter team size"}
                </div>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="space-y-3 sm:space-y-4"
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
                className="bg-white rounded-lg p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[200px] sm:min-h-[250px] cursor-pointer"
                onClick={() => (window.location.href = "/company/new-role")}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 sm:mb-4"
                >
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </motion.div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
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
                      className="bg-white rounded-lg p-4 sm:p-6 min-h-[200px] sm:min-h-[250px] flex flex-col justify-between"
                    >
                      <div>
                        {/* Job Title and Status Row */}
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 flex-1 mr-2">
                            {job.title || "Untitled Job"}
                          </h3>
                          <JobStatusDropdown
                            value={job.jobStatus || "Open"}
                            onChange={handleJobStatusUpdate}
                            jobId={job._id}
                            isUpdating={updatingJobStatus === job._id}
                          />
                        </div>

                        {/* Simple Inline Stats */}
                        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-6">
                            <div>
                              <span className="text-lg font-bold text-gray-900">
                                {job.totalApplications || 0}
                              </span>
                              <span className="text-sm text-gray-600 ml-2">
                                Applicants
                              </span>
                            </div>

                            <div className="text-gray-300">•</div>

                            <div>
                              <span className="text-lg font-bold text-gray-900">
                                {job.noOfOpenings || 0}
                              </span>
                              <span className="text-sm text-gray-600 ml-2">
                                No Of Openings
                              </span>
                            </div>
                          </div>
                        </div>

                        {job.description && (
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {job.description
                              .replace(/\n/g, " ")
                              .substring(0, 100)}
                            {job.description.length > 100 ? "..." : ""}
                          </p>
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
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#76FF82] hover:bg-green-400 text-black text-xs sm:text-sm rounded-full transition-colors order-1 sm:order-2 self-start sm:self-auto"
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
      <Link href="/" className="flex flex-col">
        <span className={`md:text-2xl text-xl font-semibold transition-colors duration-300 ${
          isScrolled ? "text-black " : "text-black"
        }`}>
          ProjectMATCH
        </span>
        <span className={`text-sm font-medium transition-colors duration-300 ${
          isScrolled ? "text-black" : "text-black"
        }`}>
          by <span className="text-[#69a34b] text-md font-bold">compscope</span>
        </span>
      </Link>
      </motion.div>

      <div className="pt-16 sm:pt-24 pb-8 sm:pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <motion.button
            variants={itemVariants}
            onClick={() => router.back()}
            className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 rounded-full text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors mb-6 sm:mb-10"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            Back
          </motion.button>

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
                  {renderCompanyLogo("large")}
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsLogoUploadOpen(true)}
                  className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-5 sm:h-5 bg-blue-600 p-1 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                >
                  <Pencil className="w-3 h-3 sm:w-3 sm:h-3 text-white" />
                </motion.button>
              </div>

              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1 truncate">
                  {formState.companyName || "Company Name"}
                </h2>
                <p className="text-gray-500 text-sm sm:text-base">
                  {formState.locationText || "Location"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8">
              {renderStars()}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveTab("profile");
                  setIsEditOpen(true);
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
                  className={`px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-colors relative whitespace-nowrap flex-shrink-0 mx-5 ${
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

          <div className="min-h-[300px] sm:min-h-[400px]">
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
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
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
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg sm:max-w-xl p-5 sm:p-6 text-gray-500 max-h-[90vh] overflow-y-auto"
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2
                  id="edit-profile-title"
                  className="text-lg sm:text-xl font-semibold text-gray-900 text-balance"
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

              <div className="grid grid-cols-1 gap-4 sm:gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
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
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
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

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
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

              <div className="mt-5 sm:mt-6 flex items-center justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-full border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
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

      {/* Add debugging CSS - remove in production */}
      <style jsx global>{`
        .custom-marker {
          z-index: 1000 !important;
          position: relative !important;
        }
      `}</style>
    </div>
  );
}
