"use client";

import { motion } from "framer-motion";
import { FileText, Eye, Download, CheckCircle, XCircle } from "lucide-react";
import type { Application, SubmittedDocument } from "../../../types";

interface DocumentVerificationViewProps {
  selectedApplicant: Application;
  submittedDocs: SubmittedDocument[];
  onDocumentApproval: (docId: number, approved: boolean) => void;
  onDone: () => void;
  isUpdating?: boolean;
}

export default function DocumentVerificationView({
  selectedApplicant,
  submittedDocs,
  onDocumentApproval,
  onDone,
  isUpdating = false,
}: DocumentVerificationViewProps) {
  
  const renderTextValue = (doc: SubmittedDocument) => {
    if (doc.inputType !== "text" || !doc.value) return null;

    // Handle Bank Details object
    if (doc.name === "Bank Details" && typeof doc.value === "object") {
      return (
        <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-2 text-sm border border-gray-200">
          <p className="font-semibold text-gray-700 mb-2">Submitted Bank Details:</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-gray-600 text-xs">Account Holder:</span>
              <p className="text-gray-900 font-medium">{doc.value.accountHolderName || "N/A"}</p>
            </div>
            <div>
              <span className="text-gray-600 text-xs">Account Number:</span>
              <p className="text-gray-900 font-medium">{doc.value.accountNumber || "N/A"}</p>
            </div>
            <div>
              <span className="text-gray-600 text-xs">IFSC Code:</span>
              <p className="text-gray-900 font-medium">{doc.value.ifscCode || "N/A"}</p>
            </div>
            <div>
              <span className="text-gray-600 text-xs">Bank Name:</span>
              <p className="text-gray-900 font-medium">{doc.value.bankName || "N/A"}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600 text-xs">Branch:</span>
              <p className="text-gray-900 font-medium">{doc.value.branch || "N/A"}</p>
            </div>
          </div>
        </div>
      );
    }

    // Handle simple text value
    return (
      <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600 text-xs mb-1">Submitted Information:</p>
        <p className="text-sm text-gray-900 font-medium">{doc.value}</p>
      </div>
    );
  };

  const renderDocumentActions = (doc: SubmittedDocument) => {
    if (doc.status !== "submitted") {
      return null;
    }

    return (
      <div className="flex space-x-1 sm:space-x-2">
        {doc.fileUrl && (
          <>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 sm:p-2 text-gray-500 hover:text-gray-700"
              title="Preview"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={doc.fileUrl}
              download
              className="p-1 sm:p-2 text-gray-500 hover:text-gray-700"
              title="Download"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            </motion.a>
          </>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDocumentApproval(doc.id, true)}
          disabled={isUpdating}
          className={`p-1 sm:p-2 text-green-500 hover:text-green-700 ${
            isUpdating ? "opacity-50 cursor-not-allowed" : ""
          }`}
          aria-label="Approve document"
        >
          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDocumentApproval(doc.id, false)}
          disabled={isUpdating}
          className={`p-1 sm:p-2 text-red-500 hover:text-red-700 ${
            isUpdating ? "opacity-50 cursor-not-allowed" : ""
          }`}
          aria-label="Reject document"
        >
          <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
        </motion.button>
      </div>
    );
  };

  const renderDocumentCard = (doc: SubmittedDocument) => (
    <motion.div
      key={doc.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 sm:p-4 border border-gray-200 rounded-lg bg-white"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="text-sm font-medium text-gray-700 line-clamp-1">
              {doc.name}
            </span>
            {doc.inputType === "file" && (
              <p className="text-xs text-gray-500 line-clamp-1">
                {doc.file || "No file provided"}
              </p>
            )}
            {doc.inputType === "text" && doc.status !== "submitted" && (
              <p className="text-xs text-gray-500">Text input {doc.status || ""}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <div
            className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              doc.status === "approved"
                ? "bg-green-100 text-green-700"
                : doc.status === "rejected"
                ? "bg-red-100 text-red-700"
                : doc.status === "submitted"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-orange-100 text-orange-700"
            }`}
          >
            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
          </div>

          {renderDocumentActions(doc)}
        </div>
      </div>

      {/* Display text value for text inputs when submitted */}
      {doc.inputType === "text" && doc.status === "submitted" && renderTextValue(doc)}
    </motion.div>
  );

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
          {submittedDocs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
              No documents available yet.
            </div>
          ) : (
            submittedDocs.map(renderDocumentCard)
          )}
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
