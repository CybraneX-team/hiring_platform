"use client";

import { motion } from "framer-motion";
import { Briefcase, Clock, Users, MapPin } from "lucide-react";
import type { Role } from "../../types";

interface RoleCardProps {
  role: Role;
  index: number;
  onSelect: (role: Role) => void;
}

export default function RoleCard({ role, index, onSelect }: RoleCardProps) {
  const departmentLabel = role.department?.trim() || "Department not specified";
  const typeLabel = role.type?.trim() || "Unknown";
  const statusLabel = role.status?.trim() || "Unknown";
  const postedLabel = role.posted?.trim() || "Unknown";
  const locationLabel = role.location?.trim();
  const experienceLabel = role.experienceLevel?.trim();

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
          </div>
        </div>

        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-between lg:ml-4 gap-4">
          <div className="text-left lg:text-right">
            <div className="text-lg sm:text-xl font-bold text-black">
              {role.salary}
            </div>
            <div className="text-sm text-gray-500">Per Year</div>
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
