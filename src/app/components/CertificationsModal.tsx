import React, { useState } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Download,
  Pencil,
  X,
  Plus,
  Trash2,
  Upload,
  File,
} from "lucide-react";
import { backdropVariants, modalVariants } from "./Companyapplicants";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const CertificationsModal = ({
  certifications,
  setCertifications,
  onClose,
  onSubmit,
  isUpdating,
}: any) => {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const addCertification = () => {
    setCertifications([
      ...certifications,
      {
        name: "",
        issuer: "",
        date: "",
        description: "",
        fileUrl: "",
        fileName: "",
        mimeType: "",
      },
    ]);
  };

  const removeCertification = (index: number) => {
    setCertifications(
      certifications.filter((_: any, i: number) => i !== index)
    );
  };

  const updateCertification = (index: number, field: string, value: string) => {
    const updated = [...certifications];
    updated[index][field] = value;
    setCertifications(updated);
  };

  const handleFileUpload = async (index: number, file: File) => {
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setUploadingIndex(index);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/upload/certificate`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("File upload failed");
      }

      const data = await response.json();

      if (data.success) {
        const updated = [...certifications];
        updated[index].fileUrl = data.fileUrl;
        updated[index].fileName = data.fileName;
        updated[index].mimeType = data.mimeType;
        setCertifications(updated);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <motion.div
      key="certifications-modal"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 px-6 py-5 z-10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Edit Certifications
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Add or update your professional certifications
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {certifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">No certifications added yet</p>
              <button
                type="button"
                onClick={addCertification}
                className="px-4 py-2 bg-[#76FF82] text-black rounded-lg font-medium hover:bg-[#6ee879] transition-colors"
              >
                Add Your First Certification
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {certifications.map((cert: any, index: number) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-xl p-5 border border-gray-200"
                  >
                    {/* Header with number and delete */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Certification #{index + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeCertification(index)}
                        disabled={isUpdating}
                        className="p-2 cursor-pointer hover:bg-red-50 rounded-lg transition-colors group disabled:opacity-50"
                        aria-label="Remove certification"
                      >
                        <Trash2 className="w-5 h-5 text-red-600 group-hover:text-red-700" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Certificate Name *
                        </label>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) =>
                            updateCertification(index, "name", e.target.value)
                          }
                          disabled={isUpdating}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#76FF82] focus:border-[#76FF82] outline-none transition-all text-gray-900 placeholder:text-gray-400"
                          required
                          placeholder="e.g., AWS Certified Solutions Architect"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Issuing Organization *
                        </label>
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) =>
                            updateCertification(index, "issuer", e.target.value)
                          }
                          disabled={isUpdating}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#76FF82] focus:border-[#76FF82] outline-none transition-all text-gray-900 placeholder:text-gray-400"
                          required
                          placeholder="e.g., Amazon Web Services"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Issue Date
                        </label>
                        <input
                          type="text"
                          value={cert.date}
                          onChange={(e) =>
                            updateCertification(index, "date", e.target.value)
                          }
                          disabled={isUpdating}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#76FF82] focus:border-[#76FF82] outline-none transition-all text-gray-900 placeholder:text-gray-400"
                          placeholder="e.g., January 2024"
                        />
                      </div>

                      {/* File Upload Section */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Certificate File
                        </label>
                        <div className="flex items-center gap-3">
                          <label
                            htmlFor={`file-upload-${index}`}
                            className="cursor-pointer flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#76FF82] hover:bg-[#76FF82]/5 hover:text-black transition-all font-medium"
                          >
                            <Upload className="w-4 h-4" />
                            {uploadingIndex === index
                              ? "Uploading..."
                              : "Upload File"}
                          </label>
                          <input
                            id={`file-upload-${index}`}
                            type="file"
                            accept=".jpg,.jpeg,.png,.gif,.webp"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(index, file);
                            }}
                            disabled={isUpdating || uploadingIndex !== null}
                            className="hidden"
                          />

                          {cert.fileName && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                              <File className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-700 truncate max-w-[200px]">
                                {cert.fileName}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Supported formats: JPG, PNG, JPEG, webp, gif
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addCertification}
                disabled={isUpdating}
                className="mt-6 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-[#76FF82] hover:bg-[#76FF82]/5 hover:text-black transition-all inline-flex items-center justify-center gap-2 font-medium disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
                Add Another Certification
              </button>
            </>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white rounded-b-2xl border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="px-6 py-2.5 cursor-pointer border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={onSubmit}
            disabled={isUpdating || uploadingIndex !== null}
            className="px-6 cursor-pointer py-2.5 bg-[#76FF82] text-black rounded-xl font-medium hover:bg-[#6ee879] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
