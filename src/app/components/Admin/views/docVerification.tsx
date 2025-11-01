"use client";

import { motion } from "framer-motion";
import { FileText, Eye, CheckCircle, XCircle } from "lucide-react";
import type { Application, SubmittedDocument } from "../../../types";
import DocumentsModal from "../FileList";
import { useState } from "react";

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
  const [openModal, setOpenModal] = useState(false);
  const [modalFiles, setModalFiles] = useState<any[]>([]);

  // ---- RENDER TEXT VALUE ----
const renderTextValue = (doc: any) => {
  if (doc.inputType !== "text" || !doc.value) return null;

  const value = doc.value;

  // Helper function to format field labels properly
  const formatLabel = (key: string): string => {
    // Special case for IFSC
    if (key.toLowerCase() === "ifsccode") return "IFSC Code";
    
    // Split camelCase and capitalize each word
    const spaced = key.replace(/([A-Z])/g, " $1").trim();
    const words = spaced.split(/\s+/);
    const capitalized = words.map(word => {
      // Keep IFSC uppercase if found
      if (word.toLowerCase() === "ifsc") return "IFSC";
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    return capitalized.join(" ");
  };

  return (
    <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-gray-600 text-xs mb-1">Submitted Information:</p>

      {typeof value === "object" ? (
        <div className="text-sm text-gray-900 font-medium space-y-1">
          {Object.entries(value).map(([key, val] : any) => (
            <div key={key}>
              <strong>{formatLabel(key)}: </strong>
              {val}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-900 font-medium">{value}</p>
      )}
    </div>
  );
};


  // ---- RENDER ACTION ICONS ----
  const renderActions = (doc: SubmittedDocument) => {
    if (doc.status !== "submitted") return null;

    return (
      <div className="flex items-center gap-3">
        {/* Eye only for file docs */}
        {doc.inputType === "file" && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setModalFiles(doc.files ?? []);
              setOpenModal(true);
            }}
            className="text-gray-600 hover:text-black cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </motion.button>
        )}

        {/* Approve */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDocumentApproval(doc.id, true)}
          disabled={isUpdating}
          className={`text-green-500 cursor-pointer hover:text-green-700 ${
            isUpdating ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <CheckCircle className="w-4 h-4" />
        </motion.button>

        {/* Reject */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDocumentApproval(doc.id, false)}
          disabled={isUpdating}
          className={`text-red-500 cursor-pointer hover:text-red-700 ${
            isUpdating ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <XCircle className="w-4 h-4" />
        </motion.button>
      </div>
    );
  };

  // ---- RENDER EACH DOCUMENT CARD ----
  const renderDocumentCard = (doc: SubmittedDocument) => (
    <motion.div
      key={doc.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* LEFT SIDE */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-800">
              {doc.name}
            </span>
          </div>

          {/* Below title: first filename or "No file provided" */}
          {/* Below title: upload summary */}
          {doc.inputType === "file" && (
            <p className="text-xs text-gray-500 ml-7 mt-1 truncate">
              {doc.files?.length
                ? `${doc.files.length} file${
                    doc.files.length > 1 ? "s" : ""
                  } uploaded`
                : "No file uploaded"}
            </p>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              doc.status === "approved"
                ? "bg-green-100 text-green-700"
                : doc.status === "needs_resubmission"
                ? "bg-red-100 text-red-700"
                : doc.status === "submitted"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-orange-100 text-orange-700"
            }`}
          >
            {doc.status}
          </div>

          {renderActions(doc)}
        </div>
      </div>

      {/* Text input view */}
      {doc.inputType === "text" &&
        doc.status === "submitted" &&
        renderTextValue(doc)}
    </motion.div>
  );

  // ---- RENDER PAGE ----
  return (
    <>
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6">
          <h1 className="text-xl sm:text-2xl font-medium text-black mb-4">
            Document Verification
          </h1>
          <p className="text-gray-500 mb-6">
            Review and verify documents submitted by {selectedApplicant.name}
          </p>

          <div className="space-y-4">
            {submittedDocs.length ? (
              submittedDocs.map(renderDocumentCard)
            ) : (
              <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                No documents available yet.
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDone}
              className="bg-[#76FF82] text-black font-medium px-6 py-2 rounded-full text-sm"
            >
              Done
            </motion.button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {openModal && (
        <DocumentsModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          files={modalFiles}
        />
      )}
    </>
  );
}
