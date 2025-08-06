"use client";

import { motion } from "framer-motion";
import { FileText, Eye, Download, CheckCircle, XCircle } from "lucide-react";
import type { Application, SubmittedDocument } from "../../../types";

interface DocumentVerificationViewProps {
  selectedApplicant: Application;
  submittedDocs: SubmittedDocument[];
  onDocumentApproval: (docId: number, approved: boolean) => void;
  onDone: () => void;
}

export default function DocumentVerificationView({
  selectedApplicant,
  submittedDocs,
  onDocumentApproval,
  onDone,
}: DocumentVerificationViewProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-xl p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-medium text-black mb-4 sm:mb-6">
          Document Verification
        </h1>
        <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
          Review and verify documents submitted by {selectedApplicant.name}
        </p>

        <div className="space-y-4">
          {submittedDocs.map((doc) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 sm:p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-gray-700 line-clamp-1">
                      {doc.name}
                    </span>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {doc.file}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      doc.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : doc.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </div>

                  {doc.status === "submitted" && (
                    <div className="flex space-x-1 sm:space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-1 sm:p-2 text-gray-500 hover:text-gray-700"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-1 sm:p-2 text-gray-500 hover:text-gray-700"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onDocumentApproval(doc.id, true)}
                        className="p-1 sm:p-2 text-green-500 hover:text-green-700"
                      >
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onDocumentApproval(doc.id, false)}
                        className="p-1 sm:p-2 text-red-500 hover:text-red-700"
                      >
                        <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onDone}
            className="bg-[#76FF82] text-black font-medium px-4 sm:px-6 py-2 rounded-full text-sm"
          >
            Done
          </motion.button>
        </div>
      </div>
    </div>
  );
}
