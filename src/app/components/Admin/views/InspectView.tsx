"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MapPin, Clock, Plus, MoreVertical, Trash2 } from "lucide-react";
import type { InspectItem } from "@/app/types";
import FileUploadModal from "../FileUploadModal";

interface InspectViewProps {
  onItemSelect: (profile: unknown) => void;
  searchQuery?: string;
}


const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  inspectorName 
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  inspectorName: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Delete Inspector</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{inspectorName}</strong>? This action cannot be undone.
        </p>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete Inspector
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Three Dots Menu Component
const ThreeDotsMenu = ({ 
  isOpen, 
  onClose, 
  onDelete , 
  position = "right"
}: {
  isOpen: boolean;
  onClose: () => void;
  onDelete: any
  position?: "left" | "right";
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`absolute top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px] z-20 ${
        position === "left" ? "left-0" : "right-0"
      }`}
    >
      <button
        onClick={onDelete}
        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Delete Inspector
      </button>
    </motion.div>
  );
};

const CircularProgress = ({ percentage }: { percentage: number }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-12 h-12">
      <svg className="w-12 h-12 transform rotate-360" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r={radius}
          stroke="#E5E7EB"
          strokeWidth="3"
          fill="none"
        />
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
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-black font-semibold text-sm">{percentage}%</span>
      </div>
    </div>
  );
};

export default function InspectView({ onItemSelect, searchQuery }: InspectViewProps) {
  const [items, setItems] = useState<InspectItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InspectItem[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Three dots menu state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    inspector: InspectItem | null;
  }>({
    isOpen: false,
    inspector: null,
  });

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
    if (minutes < 60)
      return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return days === 1 ? "1 day ago" : `${days} days ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    const months = Math.floor(days / 30);
    if (months < 12)
      return months === 1 ? "1 month ago" : `${months} months ago`;
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
      const res = await fetch(`${baseUrl}/profile/getProfile?limit=100&page=1`);

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
        err instanceof Error
          ? err.message
          : "Failed to fetch inspector profiles"
      );
      setItems([]);
      setFilteredItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [transformProfileToItem]);

  // Delete inspector function
  const deleteInspector = useCallback(async (inspectorId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_FIREBASE_API_URL;
    
    if (!baseUrl) {
      setError("API base URL is not configured.");
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/profile/delete-profile/${inspectorId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error(`Failed to delete inspector (status ${res.status})`);
      }

      // Remove from local state
      setItems(prev => prev.filter(item => item.id !== inspectorId));
      setFilteredItems(prev => prev.filter(item => item.id !== inspectorId));
      
      // Close modal and menu
      setDeleteModalState({ isOpen: false, inspector: null });
      setActiveMenuId(null);
      
    } catch (err) {
      console.error("Failed to delete inspector", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete inspector"
      );
    }
  }, []);

  // Handle three dots menu actions
  const handleMenuToggle = useCallback((itemId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setActiveMenuId(activeMenuId === itemId ? null : itemId);
  }, [activeMenuId]);

  const handleDeleteClick = useCallback((inspector: InspectItem, event: React.MouseEvent) => {
    event.stopPropagation();
    setDeleteModalState({ isOpen: true, inspector });
    setActiveMenuId(null);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteModalState.inspector) {
      deleteInspector(deleteModalState.inspector.id);
    }
  }, [deleteModalState.inspector, deleteInspector]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenuId(null);
    };

    if (activeMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeMenuId]);

  useEffect(() => {
    fetchProfiles();

    const handler = () => fetchProfiles();
    window.addEventListener("resumeUploaded", handler);
    return () => window.removeEventListener("resumeUploaded", handler);
  }, [fetchProfiles]);

  const filters = useMemo(() => {
    const total = items.length;
    const statusCounts = items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

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

  const combinedFilteredItems = useMemo(() => {
    let filtered = items;

    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((item) => {
        const searchableFields = [
          item.name,
          item.email,
          item.company,
          item.role,
          item.location,
        ].filter(Boolean);
        
        return searchableFields.some(field => 
          field && field.toLowerCase().includes(query)
        );
      });
    }

    switch (activeFilter) {
      case "active":
        filtered = filtered.filter((item) => item.status === "active");
        break;
      case "pending":
        filtered = filtered.filter((item) => item.status === "pending");
        break;
      case "completed":
        filtered = filtered.filter((item) => item.status === "completed");
        break;
      case "assigned":
        filtered = filtered.filter((item) => item.company !== "Not Assigned");
        break;
      case "unassigned":
        filtered = filtered.filter((item) => item.company === "Not Assigned");
        break;
      default:
        break;
    }

    return filtered;
  }, [items, searchQuery, activeFilter]);

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    setIsFilterOpen(false);
  };

  useEffect(() => {
    setFilteredItems(combinedFilteredItems);
  }, [combinedFilteredItems]);

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
                className="bg-white rounded-xl p-7 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
                onClick={() => onItemSelect(item.profile ?? item)}
              >
                {/* Three Dots Menu Button */}
                <div className="absolute top-4 right-4">
                  <button
                    onClick={(e) => handleMenuToggle(item.id, e)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                  
                  <ThreeDotsMenu
                    isOpen={activeMenuId === item.id}
                    onClose={() => setActiveMenuId(null)}
                    onDelete={(e : any) => handleDeleteClick(item, e)}
                  />
                </div>

                <div className="flex items-start justify-between pr-8">
                  {/* Left Section - Profile Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {item.name
                          .split(" ")
                          .map((n: any) => n[0])
                          .join("")}
                      </span>
                    </div>

                    {/* Profile Details */}
                    <div className="flex-1 min-w-0">
                      {/* Name and Title in one line with proper spacing */}
                      <div className="flex items-center gap-4 mb-5">
                        <h3 className="text-lg font-semibold text-gray-900 flex-shrink-0">
                          {item.name}
                        </h3>

                        <div className="flex-1"></div>

                        {/* Role and Company positioned at the end */}
                        <div className="flex items-center gap-3 text-sm text-gray-500 max-w-[60%] min-w-0">
                          <span className="font-medium text-gray-700 truncate">
                            {item.role || "Role not specified"}
                          </span>
                          <span className="text-gray-300 flex-shrink-0">•</span>
                          <span className="truncate">
                            {item.company || "Not Assigned"}
                          </span>
                        </div>

                        {/* Match Score */}
                        {typeof item.matchScore === "number" && (
                          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                            <CircularProgress percentage={item.matchScore} />
                            <span className="text-xs text-gray-500">
                              Match Score
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Divider line */}
                      <div className="border-t border-gray-100 mb-4"></div>

                      {/* Status Indicators */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              item.status === "active"
                                ? "bg-green-500"
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
                          <span>{item.location || "India"}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{item.yearsOfExp || "9+ years"}</span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                          <Clock className="w-3 h-3" />
                          <span>{item.lastActivity || "18 hours ago"}</span>
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, inspector: null })}
        onConfirm={handleDeleteConfirm}
        inspectorName={deleteModalState.inspector?.name || ""}
      />

      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload New"
      />
    </div>
  );
}
