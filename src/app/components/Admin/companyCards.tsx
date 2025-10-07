"use client";

import { motion } from "framer-motion";
import { MapPin, Users, Trash2 } from "lucide-react";
import type { Company } from "../../types";
import { useState } from "react";

interface CompanyCardProps {
  company: Company;
  index: number;
  onSelect: (company: Company) => void;
  onDelete: (companyId: string) => void;
}

export default function CompanyCard({
  company,
  index,
  onSelect,
  onDelete,
}: CompanyCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const companyName = company.name || "Unnamed Company";
  const logoUrl =
    typeof company.logoUrl === "string" && company.logoUrl.length > 0
      ? company.logoUrl
      : null;
  const hasLogoImage = Boolean(logoUrl);
  const displayLogo =
    company.logo || companyName.trim().charAt(0).toUpperCase() || "C";
  const locationLabel = company.location?.trim() || "Location unavailable";
  
  // Function to get last 4 comma-separated parts of address
  const getLastFourParts = (address: string) => {
    if (!address || address === "Location unavailable") return address;
    const parts = address.split(',').map(part => part.trim()).filter(part => part.length > 0);
    if (parts.length <= 4) return address;
    return parts.slice(-4).join(', ');
  };
  
  const displayLocation = getLastFourParts(locationLabel);
  const applicationsCount = Number.isFinite(company.totalApplications)
    ? company.totalApplications
    : 0;
  const activeRoles = Number.isFinite(company.activeRoles)
    ? company.activeRoles
    : 0;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    onDelete(company.id);
    setShowDeleteModal(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ y: -2, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}
        onClick={() => onSelect(company)}
        className="bg-white rounded-xl p-4 sm:p-6 cursor-pointer relative group"
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

        <div className="h-12 sm:h-14 mb-4 flex items-center">
          <h3 className="text-base sm:text-lg font-medium text-black line-clamp-2 leading-tight">
            {companyName}
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-400 mb-4 gap-2">
          <div className="flex items-center space-x-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate" title={locationLabel}>{displayLocation}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3 flex-shrink-0" />
            <span>{applicationsCount} applications</span>
          </div>
        </div>

        <div className="flex gap-2">
          <motion.button
            whileHover={{
              scale: 1.02,
              boxShadow: "0 4px 12px rgba(118, 255, 130, 0.3)",
            }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer flex-1 bg-[#76FF82] text-black font-medium py-2 sm:py-3 rounded-full text-sm"
          >
            View Roles
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDelete}
            className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors duration-200 flex items-center justify-center cursor-pointer"
            title="Delete Company"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium mb-4">Delete Company</h3>
            <p className="text-sm text-gray-600 mb-6">
              Do you want to delete <strong>{companyName}</strong> permanently? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
