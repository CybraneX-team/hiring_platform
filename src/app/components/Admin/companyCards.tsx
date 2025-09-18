"use client";

import { motion } from "framer-motion";
import { MapPin, Users } from "lucide-react";
import type { Company } from "../../types";

interface CompanyCardProps {
  company: Company;
  index: number;
  onSelect: (company: Company) => void;
}

export default function CompanyCard({
  company,
  index,
  onSelect,
}: CompanyCardProps) {
  const companyName = company.name || "Unnamed Company";
  const logoUrl =
    typeof company.logoUrl === "string" && company.logoUrl.length > 0
      ? company.logoUrl
      : null;
  const hasLogoImage = Boolean(logoUrl);
  const displayLogo =
    company.logo || companyName.trim().charAt(0).toUpperCase() || "C";
  const locationLabel = company.location?.trim() || "Location unavailable";
  const industryLabel =
    company.industry?.trim() || "Industry information unavailable";
  const applicationsCount = Number.isFinite(company.totalApplications)
    ? company.totalApplications
    : 0;
  const activeRoles = Number.isFinite(company.activeRoles)
    ? company.activeRoles
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -2, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}
      onClick={() => onSelect(company)}
      className="bg-white rounded-xl p-4 sm:p-6 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C5BCFF] rounded-full flex items-center justify-center text-[#32343A] font-medium text-sm sm:text-base overflow-hidden"
        >
          {hasLogoImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl!}
              alt={`${companyName} logo`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{displayLogo}</span>
          )}
        </motion.div>
        <div className="text-right">
          <div className="text-xs sm:text-sm text-gray-500">Active Roles</div>
          <div className="text-lg sm:text-xl font-bold text-black">
            {activeRoles}
          </div>
        </div>
      </div>

      <h3 className="text-base sm:text-lg font-medium text-black mb-2 line-clamp-2">
        {companyName}
      </h3>
      <p className="text-sm text-gray-500 mb-4">{industryLabel}</p>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-400 mb-4 gap-2">
        <div className="flex items-center space-x-1">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{locationLabel}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Users className="w-3 h-3 flex-shrink-0" />
          <span>{applicationsCount} applications</span>
        </div>
      </div>

      <motion.button
        whileHover={{
          scale: 1.02,
          boxShadow: "0 4px 12px rgba(118, 255, 130, 0.3)",
        }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-[#76FF82] text-black font-medium py-2 sm:py-3 rounded-full text-sm"
      >
        View Roles
      </motion.button>
    </motion.div>
  );
}
