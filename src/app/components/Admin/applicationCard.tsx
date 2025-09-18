"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, Calendar } from "lucide-react";
import { Application } from "../../types";

interface ApplicationCardProps {
  applicant: Application;
  index: number;
  onSelect: (applicant: Application) => void;
}

export default function ApplicationCard({
  applicant,
  index,
  onSelect,
}: ApplicationCardProps) {
  const nameLabel = applicant.name || "Unknown Applicant";
  const emailLabel = applicant.email || "Not provided";
  const locationLabel = applicant.location || "Location unavailable";
  const experienceLabel = applicant.experience || "Experience not specified";
  const appliedDateLabel = applicant.appliedDate || "Unknown";
  const roleLabel = applicant.currentRole || "Role not specified";
  const statusValue = applicant.status?.toLowerCase() ?? "";
  const highlightedStatuses = ["selected", "shortlisted", "hired"];
  const isHighlighted = highlightedStatuses.includes(statusValue);
  const statusDisplay = applicant.status
    ? applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)
    : "Pending";
  const avatarLabel = applicant.avatar || nameLabel.trim().charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -2, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}
      className={`bg-white rounded-xl p-4 sm:p-6 ${
        isHighlighted ? "ring-2 ring-[#76FF82]" : ""
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-start flex-1 min-w-0">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C5BCFF] rounded-full flex items-center justify-center text-[#32343A] font-medium mr-3 sm:mr-4 flex-shrink-0"
          >
            {avatarLabel}
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
              <h3 className="text-base sm:text-lg font-medium text-black line-clamp-1">
                {nameLabel}
              </h3>
              {applicant.status && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`px-2 py-1 text-xs rounded-full font-medium self-start ${
                    isHighlighted
                      ? "bg-[#76FF82] text-black"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {statusDisplay}
                </motion.div>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-2 sm:mb-3 line-clamp-1">
              {roleLabel}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2 text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{emailLabel}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{locationLabel}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span>Applied {appliedDateLabel}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 sm:gap-2">
          <div className="text-left sm:text-right">
            <div className="text-sm font-medium text-black">
              {experienceLabel}
            </div>
            <div className="text-xs text-gray-500">Experience</div>
          </div>

          <motion.button
            whileHover={{
              scale: 1.02,
              boxShadow: "0 4px 12px rgba(118, 255, 130, 0.3)",
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(applicant)}
            className="bg-[#76FF82] text-black font-medium px-4 sm:px-6 py-2 rounded-full text-sm whitespace-nowrap"
          >
            View Details
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
