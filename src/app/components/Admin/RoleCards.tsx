"use client";

import { motion } from "framer-motion";
import { Briefcase, Clock, Users, MapPin, Percent, Edit2 } from "lucide-react";
import type { Role } from "../../types";
import { useState } from "react";
import { toast } from "react-toastify";

interface RoleCardProps {
  role: Role;
  index: number;
  onSelect: (role: Role) => void;
  onPayoffUpdate?: (roleId: string, newPercentage: number) => void;
}

export default function RoleCard({ role, index, onSelect, onPayoffUpdate }: RoleCardProps) {
  const [isEditingPayoff, setIsEditingPayoff] = useState(false);
  const [payoffValue, setPayoffValue] = useState(role.payoffAmountPercentage?.toString() || "25");
  const [isUpdating, setIsUpdating] = useState(false);

  const departmentLabel = role.department?.trim() || "Department not specified";
  const typeLabel = role.type?.trim() || "Unknown";
  // Show payRangeType (Daily/Monthly) under price strictly from API
  const periodLabel = role.payRangeType
    ? role.payRangeType.charAt(0).toUpperCase() + role.payRangeType.slice(1).toLowerCase()
    : "";
  const statusLabel = role.status?.trim() || "Unknown";
  const postedLabel = role.posted?.trim() || "Unknown";
  const locationLabel = role.location?.trim();
  const experienceLabel = role.experienceLevel?.trim();
  const payoffPercentage = role.payoffAmountPercentage ?? 25;
  const payRangeType = role.payRangeType ;
  console.log("payRangeType", payRangeType)
  const handlePayoffUpdate = async () => {
    const newValue = parseFloat(payoffValue);
    
    if (isNaN(newValue) || newValue < 0 || newValue > 100) {
      toast.error("Payoff percentage must be between 0 and 100");
      return;
    }

    setIsUpdating(true);
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      
      if (!baseUrl) {
        toast.error("API URL not configured");
        return;
      }

      const response = await fetch(`${baseUrl}/jobs/${role.id}/payoff-percentage`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payoffAmountPercentage: newValue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || `Failed to update payoff percentage`);
      }

      const result = await response.json();
      
      toast.success("Payoff percentage updated successfully");
      setIsEditingPayoff(false);
      
      // Call the callback to update parent state
      if (onPayoffUpdate) {
        onPayoffUpdate(role.id, newValue);
      }
      
    } catch (error) {
      console.error("Error updating payoff percentage:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update payoff percentage");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setPayoffValue(role.payoffAmountPercentage?.toString() || "25");
    setIsEditingPayoff(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -2, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}
      className="bg-white rounded-xl p-4 sm:p-6"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex flex-1">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C5BCFF] rounded-full flex items-center justify-center text-[#32343A] font-medium mr-3 sm:mr-4 flex-shrink-0"
          >
            <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-medium text-black mb-1 line-clamp-2">
              {role.title}
            </h3>
            <p className="text-sm text-gray-500 mb-3 sm:mb-4">
              {departmentLabel}
            </p>

            <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4">
              <motion.span
                whileHover={{ scale: 1.02 }}
                className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {typeLabel}
              </motion.span>
              <motion.span
                whileHover={{ scale: 1.02 }}
                className="px-2 sm:px-3 py-1 bg-green-100 text-green-600 text-xs rounded-full"
              >
                {statusLabel}
              </motion.span>
              {experienceLabel && (
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded-full"
                >
                  {experienceLabel}
                </motion.span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span>Posted {postedLabel}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3 flex-shrink-0" />
                <span>{role.applications} applications</span>
              </div>
              {locationLabel && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate max-w-[120px]">{locationLabel}</span>
                </div>
              )}
            </div>

            {/* Payoff Percentage Section */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-gray-500">Payoff:</span>
                
                {isEditingPayoff ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={payoffValue}
                      onChange={(e) => setPayoffValue(e.target.value)}
                      className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="0"
                      max="100"
                      step="0.1"
                      disabled={isUpdating}
                    />
                    <span className="text-xs text-gray-600">%</span>
                    <button
                      onClick={handlePayoffUpdate}
                      disabled={isUpdating}
                      className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50"
                    >
                      {isUpdating ? "..." : "Save"}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                      className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-purple-600">
                      {payoffPercentage}%
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingPayoff(true);
                      }}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      title="Edit payoff percentage"
                    >
                      <Edit2 className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-between lg:ml-4 gap-4">
          <div className="text-left lg:text-right">
            <div className="text-lg sm:text-xl font-bold text-black">
              {role.salary}/
            </div>
            {role.payRangeType && (
              <div className="text-sm text-gray-500">{payRangeType}</div>
            )}
          </div>

          <motion.button
            whileHover={{
              scale: 1.02,
              boxShadow: "0 4px 12px rgba(118, 255, 130, 0.3)",
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(role)}
            className="bg-[#76FF82] text-black font-medium px-4 sm:px-6 py-2 rounded-full text-sm whitespace-nowrap"
          >
            View Applications
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
