"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MapPin, Clock, Plus } from "lucide-react";
import type { InspectItem } from "@/app/types";
import FileUploadModal from "../FileUploadModal";

interface InspectViewProps {
  onItemSelect: (profile: unknown) => void;
}

const CircularProgress = ({ percentage }: { percentage: number }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-12 h-12">
      <svg className="w-12 h-12 transform rotate-360" viewBox="0 0 44 44">
        {/* Background circle */}
        <circle
          cx="22"
          cy="22"
          r={radius}
          stroke="#E5E7EB"
          strokeWidth="3"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="22"
          cy="22"
          r={radius}
          stroke="#76FF82"
          strokeWidth="3"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-black font-semibold text-sm">{percentage}%</span>
      </div>
    </div>
  );
};

export default function InspectView({ onItemSelect }: InspectViewProps) {
  const [items, setItems] = useState<InspectItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InspectItem[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatRelative = useCallback((dateInput?: string) => {
    if (!dateInput) return "Unknown";
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return "Unknown";

    const diffMs = Date.now() - date.getTime();
    if (diffMs < 0) return "In the future";

    const seconds = Math.floor(diffMs / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return days === 1 ? "1 day ago" : `${days} days ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return months === 1 ? "1 month ago" : `${months} months ago`;
    const years = Math.floor(days / 365);
    return years === 1 ? "1 year ago" : `${years} years ago`;
  }, []);

  const determineStatus = useCallback((profile: any) => {
    if (profile?.total_jobs_completed > 0) {
      return "completed" as const;
    }
    if (Array.isArray(profile?.openToRoles) && profile.openToRoles.length > 0) {
      return "active" as const;
    }
    return "pending" as const;
  }, []);

  const transformProfileToItem = useCallback(
    (profile: any): InspectItem => {
      const status = determineStatus(profile);
      const companyName =
        profile?.WorkExperience?.[0]?.company || "Not Assigned";
      const primaryRole =
        profile?.openToRoles?.[0] || profile?.WorkExperience?.[0]?.title || "";
      const matchScore = profile?.average_rating
        ? Math.min(100, Math.round(Number(profile.average_rating) * 10))
        : undefined;

      return {
        id: profile?._id?.toString() || profile?.id || "",
        name: profile?.name || profile?.user?.name || "Unnamed Inspector",
        company: companyName,
        status,
        lastActivity: formatRelative(profile?.updatedAt || profile?.createdAt),
        role: primaryRole,
        email: profile?.user?.email || "",
        location: profile?.location || "",
        yearsOfExp: profile?.yearsOfExp || "",
        matchScore,
        profile,
      };
    },
    [determineStatus, formatRelative]
  );

  const fetchProfiles = useCallback(async () => {
    const baseUrl = process.env.NEXT_PUBLIC_FIREBASE_API_URL;

    if (!baseUrl) {
      setError("API base URL is not configured.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${baseUrl}/api/getProfile?limit=100&page=1`);

      if (!res.ok) {
        throw new Error(`Failed to fetch profiles (status ${res.status})`);
      }

      const data = await res.json();
      const rawProfiles = Array.isArray(data?.profiles) ? data.profiles : [];
      const transformed = rawProfiles.map(transformProfileToItem);
      setItems(transformed);
      setFilteredItems(transformed);
      setActiveFilter("all");
    } catch (err) {
      console.error("Failed to fetch profiles", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch inspector profiles"
      );
      setItems([]);
      setFilteredItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [transformProfileToItem]);

  useEffect(() => {
    fetchProfiles();

    // listen to upload events
    const handler = () => fetchProfiles();
    window.addEventListener("resumeUploaded", handler);
    return () => window.removeEventListener("resumeUploaded", handler);
  }, [fetchProfiles]);

  const filters = useMemo(() => {
    const total = items.length;
    const statusCounts = items.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const assignedCount = items.filter(
      (item) => item.company && item.company !== "Not Assigned"
    ).length;
    const unassignedCount = total - assignedCount;

    return [
      { id: "all", label: "All Profiles", count: total },
      { id: "active", label: "Active", count: statusCounts.active || 0 },
      { id: "pending", label: "Pending", count: statusCounts.pending || 0 },
      {
        id: "completed",
        label: "Completed",
        count: statusCounts.completed || 0,
      },
      { id: "assigned", label: "Assigned", count: assignedCount },
      { id: "unassigned", label: "Unassigned", count: unassignedCount },
    ];
  }, [items]);

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    setIsFilterOpen(false);

    let filtered = items;
    switch (filterId) {
      case "active":
        filtered = items.filter((item) => item.status === "active");
        break;
      case "pending":
        filtered = items.filter((item) => item.status === "pending");
        break;
      case "completed":
        filtered = items.filter((item) => item.status === "completed");
        break;
      case "assigned":
        filtered = items.filter(
          (item) => item.company !== "Not Assigned"
        );
        break;
      case "unassigned":
        filtered = items.filter(
          (item) => item.company === "Not Assigned"
        );
        break;
      default:
        filtered = items;
    }
    setFilteredItems(filtered);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Filter Section and Add More Button */}
      <div className="mb-6 flex items-center justify-between">
        <div className="relative inline-block">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="bg-[#D1D5DB] hover:bg-[#C1C5CB] text-[#374151] px-6 py-3 rounded-lg font-medium text-sm flex items-center space-x-2 min-w-[120px] justify-center transition-colors"
          >
            <span>Filter</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isFilterOpen ? "rotate-180" : ""
              }`}
            />
          </motion.button>

          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[200px] z-10"
            >
              {filters.map((filter) => (
                <motion.button
                  key={filter.id}
                  whileHover={{ backgroundColor: "#F9FAFB" }}
                  onClick={() => handleFilterChange(filter.id)}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between ${
                    activeFilter === filter.id
                      ? "text-[#76FF82] font-medium"
                      : "text-gray-700"
                  }`}
                >
                  <span>{filter.label}</span>
                  <span className="text-xs text-gray-500">
                    ({filter.count})
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-[#76FF82] hover:bg-green-400 text-black font-medium px-6 py-3 rounded-full flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add More
        </motion.button>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
          Loading inspector profiles...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center text-sm text-red-600">
          {error}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
          No profiles match the selected filter.
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onItemSelect(item.profile ?? item)}
              >
                <div className="flex items-start justify-between">
                  {/* Left Section - Profile Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {item.name
                          .split(" ")
                          .map((n : any) => n[0])
                          .join("")}
                      </span>
                    </div>

                    {/* Profile Details */}
                    <div className="flex-1 min-w-full w-full">
                      {/* Name and Title */}
                      <div className="mb-5 w-full flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {item.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 sm:flex-1 sm:justify-end sm:text-right min-w-0">
                          <span className="font-medium text-gray-700 min-w-0 max-w-full whitespace-normal break-words">
                            {item.role || "Role not specified"}
                          </span>
                          <span className="hidden sm:inline text-gray-300 flex-shrink-0">•</span>
                          <span className="min-w-0 max-w-full whitespace-normal break-all">
                            {item.company || "Not Assigned"}
                          </span>
                        </div>
                        {typeof item.matchScore === "number" && (
                          <div className="flex items-center gap-2 self-start sm:self-auto sm:ml-auto text-xs text-gray-500">
                            <CircularProgress percentage={item.matchScore} />
                            <span>Match Score</span>
                          </div>
                        )}
                      </div>

                      {/* Divider line after name section */}
                      <div className="border-t border-gray-100 mb-4 w-[115%] -mx-14"></div>

                      {/* Status Indicators - only showing available, location, experience */}
                      <div className="flex flex-wrap gap-4 mb-4 text-sm -mx-14 text-gray-600">
                        <div className="flex items-center gap-1">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              item.status === "active"
                                ? "bg-blue-500"
                                : item.status === "completed"
                                ? "bg-green-500"
                                : "bg-yellow-500"
                            }`}
                          />
                          <span className="capitalize text-gray-700">
                            {item.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{item.location || "Location unavailable"}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{item.yearsOfExp || "Experience not specified"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{item.lastActivity || "No recent activity"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      

      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload New"
      />
    </div>
  );
}
