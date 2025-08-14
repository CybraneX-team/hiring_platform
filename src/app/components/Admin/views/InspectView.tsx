"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MapPin, Clock, Plus } from "lucide-react";
import type { InspectItem } from "@/app/types";
import { inspectItems } from "../inspectData";
import FileUploadModal from "../FileUploadModal";
import Link from "next/link";

interface InspectViewProps {
  onItemSelect: (item: InspectItem) => void;
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
  const [filteredItems, setFilteredItems] = useState(inspectItems);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const filters = [
    { id: "all", label: "All Items", count: inspectItems.length },
    {
      id: "active",
      label: "Active",
      count: inspectItems.filter((item) => item.status === "active").length,
    },
    {
      id: "pending",
      label: "Pending",
      count: inspectItems.filter((item) => item.status === "pending").length,
    },
    {
      id: "completed",
      label: "Completed",
      count: inspectItems.filter((item) => item.status === "completed").length,
    },
    {
      id: "assigned",
      label: "Assigned",
      count: inspectItems.filter((item) => item.company !== "Not Assigned")
        .length,
    },
    {
      id: "unassigned",
      label: "Unassigned",
      count: inspectItems.filter((item) => item.company === "Not Assigned")
        .length,
    },
  ];

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    setIsFilterOpen(false);

    let filtered = inspectItems;
    switch (filterId) {
      case "active":
        filtered = inspectItems.filter((item) => item.status === "active");
        break;
      case "pending":
        filtered = inspectItems.filter((item) => item.status === "pending");
        break;
      case "completed":
        filtered = inspectItems.filter((item) => item.status === "completed");
        break;
      case "assigned":
        filtered = inspectItems.filter(
          (item) => item.company !== "Not Assigned"
        );
        break;
      case "unassigned":
        filtered = inspectItems.filter(
          (item) => item.company === "Not Assigned"
        );
        break;
      default:
        filtered = inspectItems;
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
      <Link href="/company/applicants">
        <div className="space-y-4">
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onItemSelect(item)}
              >
                <div className="flex items-start justify-between">
                  {/* Left Section - Profile Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {item.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>

                    {/* Profile Details */}
                    <div className="flex-1 min-w-full w-full">
                      {/* Name and Title */}
                      <div className="mb-5 w-full">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {item.name}
                        </h3>
                        <p className="text-gray-600 text-sm">{item.company}</p>
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
                                : "bg-red-500"
                            }`}
                          ></div>
                          <span
                            className={
                              item.status === "active"
                                ? "text-blue-600"
                                : "text-red-600"
                            }
                          >
                            {item.status === "active"
                              ? "Available"
                              : "Unavailable"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>USA, Michigan</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>5 Years</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Match Percentage */}
                  <div className="flex flex-col items-center gap-1">
                    <CircularProgress
                      percentage={Math.floor(Math.random() * 30) + 70}
                    />
                    <span className="text-xs text-gray-500 text-center">
                      AI match score
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Link>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm">
          <p className="text-gray-500">
            No items found for the selected filter.
          </p>
        </div>
      )}

      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}
