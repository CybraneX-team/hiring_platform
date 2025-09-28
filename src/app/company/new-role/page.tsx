"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Bot, Plus, X, MapPin, Search } from "lucide-react";
import { motion } from "framer-motion";
import JobHeader from "@/app/components/jobHeader";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import { toast } from "react-toastify";

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
          placeholder="Enter address or click auto-detect to select location..."
          className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs text-black sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
  const [jobType, setJobType] = useState("Full-time"); 

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
        `${process.env.NEXT_PUBLIC_FIREBASE_API_URL}/jobs`,
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
        `${process.env.NEXT_PUBLIC_FIREBASE_API_URL}/jobs/ai-assist`,
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
              <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
                {["Full-time", "Part-time", "Remote"].map((type) => (
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
