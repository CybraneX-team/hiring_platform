"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import apiClient from "../../../utils/api-client";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Building,
  FileText,
} from "lucide-react";
import type { Application, Role, DocumentType } from "../../../types";
import ApplicationDetailView from "../../cv";
import Companyapplicants from "../../Companyapplicants";

interface ApplicantDetailsViewProps {
  selectedApplicant: Application;
  selectedRole: Role;
  requestedDocs: number[];
  documentTypes: DocumentType[];
  onRequestDocuments: () => void;
  onDocumentVerification: () => void;
}



export default function ApplicantDetailsView({
  selectedApplicant,
  selectedRole,
  requestedDocs,
  documentTypes,
  onRequestDocuments,
  onDocumentVerification,
}: ApplicantDetailsViewProps) {

  // Schedule modal state and handler
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState("");

  const handleSchedule = async () => {
    setIsScheduling(true);
    setScheduleError("");
    try {
      // TODO: Replace with your backend API endpoint
      const res = await apiClient.post(`/interviews/schedule`, {
        applicationId: selectedApplicant.id,
        // fallback/reserved fields in case backend needs them
        userId: selectedApplicant.id,
        jobId: selectedRole.id,
        date: scheduleDate,
        time: scheduleTime,
      });
      if (res.status !== 200 && res.status !== 201) throw new Error("Failed to schedule interview");
      setShowScheduleModal(false);
      setScheduleDate("");
      setScheduleTime("");
      // Optionally show a toast/notification here
    } catch (err) {
      setScheduleError("Failed to schedule interview. Please try again.");
    } finally {
      setIsScheduling(false);
    }
  };

  const emailLabel = selectedApplicant.email || "Not provided";
  const phoneLabel = selectedApplicant.phone || "Not provided";
  const locationLabel = selectedApplicant.location || "Location unavailable";
  const experienceLabel = selectedApplicant.experience
    ? `${selectedApplicant.experience}`
    : "Experience not specified";
  const roleLabel = selectedRole.title || "Selected role";
  const currentRoleLabel = selectedApplicant.currentRole || roleLabel;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-xl p-4 sm:p-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-12 h-12 sm:w-16 sm:h-16 bg-[#C5BCFF] rounded-full flex items-center justify-center text-[#32343A] font-medium mr-3 sm:mr-4 text-lg sm:text-xl"
            >
              {selectedApplicant.avatar ||
                selectedApplicant.name.trim().charAt(0).toUpperCase()}
            </motion.div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-medium text-black line-clamp-1">
                {selectedApplicant.name}
              </h1>
              <p className="text-gray-500 text-sm sm:text-base line-clamp-1">
                {currentRoleLabel}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRequestDocuments}
              className="bg-[#76FF82] text-black font-medium px-4 sm:px-6 py-2 rounded-full text-sm whitespace-nowrap"
            >
              Request Documents
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDocumentVerification}
              className="bg-blue-500 text-white font-medium px-4 sm:px-6 py-2 rounded-full text-sm whitespace-nowrap"
            >
              Verify Documents
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowScheduleModal(true)}
              className="bg-purple-500 text-white font-medium px-4 sm:px-6 py-2 rounded-full text-sm whitespace-nowrap"
            >
              Schedule
            </motion.button>
          </div>

          {/* Schedule Modal is rendered at the end of the component to avoid stacking context issues */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-black mb-4">
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600 break-all">
                  {emailLabel}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  {phoneLabel}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  {locationLabel}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-black mb-4">
              Application Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  Applied on {selectedApplicant.appliedDate}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  {experienceLabel}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600 line-clamp-1">
                  Applying for {roleLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {requestedDocs.length > 0 && (
        <div className="bg-white rounded-xl p-4 sm:p-6">
          <h3 className="text-lg font-medium text-black mb-4">
            Requested Documents
          </h3>
          <div className="space-y-3">
            {documentTypes
              .filter((doc) => requestedDocs.includes(doc.id))
              .map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-gray-700 line-clamp-1">
                        {doc.name}
                      </span>
                      {doc.required && (
                        <span className="text-xs text-red-500 block">
                          Required
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-orange-500 whitespace-nowrap">
                    Pending
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
      
    
      {/* Schedule Modal - placed at component root to match calendar modal styling */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-[#00000057] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Schedule Interview</h3>
              <p className="text-sm text-gray-600 mt-1">Select date and time for the interview</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {scheduleError && <div className="text-red-500 text-sm">{scheduleError}</div>}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                disabled={isScheduling}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                disabled={isScheduling || !scheduleDate || !scheduleTime}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
              >
                {isScheduling ? "Scheduling..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  
  );
}
