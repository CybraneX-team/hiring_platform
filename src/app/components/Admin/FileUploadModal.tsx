"use client";

import type React from "react";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, Check, Eye } from "lucide-react";
import { toast } from "react-toastify";
import { useUser } from "@/app/context/UserContext";
import { usePathname } from "next/navigation";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

interface UploadedFile {
  name: string;
  size: string;
  type: string;
  url: string;
  isUploading: boolean;
  uploadProgress: number;
}

export default function FileUploadModal({
  isOpen,
  onClose,
  title,
}: FileUploadModalProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {user}  = useUser()
  const pathname = usePathname();
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  // inside FileUploadModal
 const handleFiles = (files: File[]) => {
    const validFiles = files.filter(
      (file) =>
        file.type === "application/pdf" ||
        file.type === "application/msword" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    validFiles.forEach(async (file) => {
      const newFile: UploadedFile = {
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        type: file.type.includes("pdf") ? "PDF" : "DOC",
        url: URL.createObjectURL(file),
        isUploading: true,
        uploadProgress: 0,
      };

      setUploadedFiles((prev) => [...prev, newFile]);

      // 🔹 Create FormData for API call
      const formData = new FormData();
      formData.append("resume", file);
      if (user && user.id) {
        formData.append("userId", user?.id);
      } else {
        toast.info("user id is required");
        return;
      }

      // 🔹 Route checking logic
      let apiEndpoint = "";
      if (pathname.startsWith("/admin")) {
        apiEndpoint = "/profile/resume";
      } else if (pathname.startsWith("/profile")) {
        apiEndpoint = "/profile/inspector-profile/resume";
      } else {
        // Default fallback (optional)
        apiEndpoint = "/profile/resume";
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}${apiEndpoint}`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!res.ok) toast.error("Upload failed");

        // ✅ resume uploaded + profile created
        const data = await res.json();

        // let parent (InspectView) refresh the list
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("resumeUploaded"));
        }

        // 🔹 REMOVE the file from the list after successful upload
        setUploadedFiles((prev) => prev.filter((f) => f.name !== file.name));

        // Clean up the blob URL to prevent memory leaks
        URL.revokeObjectURL(newFile.url);
        onClose();
        toast.success("profile created");
      } catch (err) {
        console.error("Upload failed", err);

        // 🔹 On error, mark as failed or remove from list
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.name === file.name
              ? { ...f, isUploading: false, uploadProgress: 0 }
              : f
          )
        );
      }
    });
  };


  const removeFile = (fileName: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.name !== fileName));
    if (previewFile === fileName) {
      setPreviewFile(null);
    }
  };

  const togglePreview = (fileName: string) => {
    setPreviewFile(previewFile === fileName ? null : fileName);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#00000055] bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Upload Documents
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-6 flex-1 overflow-hidden">
              {/* Upload Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                  dragActive
                    ? "border-[#76FF82] bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Only PDF and DOC files are allowed
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer px-6 py-2 bg-[#76FF82] hover:bg-green-400 text-black font-medium rounded-full transition-colors"
                >
                  Choose Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Uploaded Files</h3>
                  <div className="space-y-3 max-h-32 overflow-y-auto">
                    {uploadedFiles.map((file, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {file.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {file.size} • {file.type}
                            </p>
                            {file.isUploading && (
                              <div className="mt-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-[#76FF82] h-2 rounded-full transition-all duration-300"
                                      style={{
                                        width: `${file.uploadProgress}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {file.uploadProgress}%
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!file.isUploading && file.type === "PDF" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePreview(file.name);
                              }}
                              className={`p-2 rounded-full transition-colors ${
                                previewFile === file.name
                                  ? "bg-[#76FF82] text-black"
                                  : "hover:bg-gray-200 text-gray-600"
                              }`}
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {!file.isUploading && (
                            <div className="p-2 bg-green-100 rounded-full">
                              <Check className="w-4 h-4 text-green-600" />
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(file.name);
                            }}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            title="Remove"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {previewFile && (
                <div className="flex-1 overflow-y-auto">
                  <h3 className="font-medium text-gray-900 mb-4">
                    PDF Preview
                  </h3>
                  <div className="w-full ">
                    {uploadedFiles
                      .filter(
                        (file) =>
                          file.name === previewFile &&
                          file.type === "PDF" &&
                          !file.isUploading
                      )
                      .map((file, index) => (
                        <iframe
                          key={index}
                          src={`${file.url}#toolbar=0&navpanes=0&scrollbar=0`}
                          className="w-full h-screen border-0 rounded-lg"
                          title={`Preview of ${file.name}`}
                          style={{
                            background: "transparent",
                            border: "none",
                          }}
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-[#76FF82] hover:bg-green-400 text-black font-medium rounded-full transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
