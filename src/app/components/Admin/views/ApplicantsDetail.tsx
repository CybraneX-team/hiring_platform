"use client";

import { motion } from "framer-motion";
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
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-12 h-12 sm:w-16 sm:h-16 bg-[#C5BCFF] rounded-full flex items-center justify-center text-[#32343A] font-medium mr-3 sm:mr-4 text-lg sm:text-xl"
            >
              {selectedApplicant.avatar}
            </motion.div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-medium text-black line-clamp-1">
                {selectedApplicant.name}
              </h1>
              <p className="text-gray-500 text-sm sm:text-base line-clamp-1">
                {selectedApplicant.currentRole}
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
          </div>
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
                  {selectedApplicant.email}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  {selectedApplicant.phone}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  {selectedApplicant.location}
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
                  {selectedApplicant.experience} of experience
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600 line-clamp-1">
                  Applying for {selectedRole.title}
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
    </div>
  );
}
