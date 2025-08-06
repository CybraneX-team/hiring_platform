"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import type { Application, DocumentType } from "../../../types";

interface RequestDocumentsViewProps {
  selectedApplicant: Application;
  documentTypes: DocumentType[];
  selectedDocs: number[];
  onToggleDoc: (docId: number) => void;
  onCancel: () => void;
  onSendRequest: (docIds: number[]) => void;
}

export default function RequestDocumentsView({
  selectedApplicant,
  documentTypes,
  selectedDocs,
  onToggleDoc,
  onCancel,
  onSendRequest,
}: RequestDocumentsViewProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-xl p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-medium text-black mb-4 sm:mb-6">
          Request Documents
        </h1>
        <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
          Select the documents you want to request from {selectedApplicant.name}
        </p>

        <div className="space-y-3">
          {documentTypes.map((doc) => (
            <motion.div
              key={doc.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => onToggleDoc(doc.id)}
              className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedDocs.includes(doc.id)
                  ? "border-[#76FF82] bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedDocs.includes(doc.id)
                        ? "border-[#76FF82] bg-[#76FF82]"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedDocs.includes(doc.id) && (
                      <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 text-black" />
                    )}
                  </div>
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
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            className="px-4 sm:px-6 py-2 border border-gray-300 text-gray-700 rounded-full text-sm font-medium"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{
              scale: 1.02,
              boxShadow: "0 4px 12px rgba(118, 255, 130, 0.3)",
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSendRequest(selectedDocs)}
            disabled={selectedDocs.length === 0}
            className="bg-[#76FF82] text-black font-medium px-4 sm:px-6 py-2 rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Request ({selectedDocs.length})
          </motion.button>
        </div>
      </div>
    </div>
  );
}
