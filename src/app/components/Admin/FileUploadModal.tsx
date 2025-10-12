"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, Check, Eye, Loader2, Sparkles, FileSearch, Brain, Database } from "lucide-react";
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

const LOADING_MESSAGES = [
  { text: "Uploading resume to server", icon: Upload },
  { text: "Analyzing document structure", icon: FileSearch },
  { text: "Extracting personal information", icon: Database },
  { text: "Processing work experience", icon: Brain },
  { text: "Identifying skills and qualifications", icon: Sparkles },
  { text: "Parsing education history", icon: FileText },
  { text: "Validating extracted data", icon: Check },
  { text: "Finalizing profile creation", icon: Sparkles },
];

export default function FileUploadModal({
  isOpen,
  onClose,
  title,
}: FileUploadModalProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();
  const pathname = usePathname();

  // Rotate loading messages every 3 seconds
  useEffect(() => {
    if (!isProcessing) return;

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isProcessing]);

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
      setIsProcessing(true);
      setLoadingMessageIndex(0);

      const progressInterval = setInterval(() => {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.name === file.name && f.uploadProgress < 90
              ? { ...f, uploadProgress: f.uploadProgress + 10 }
              : f
          )
        );
      }, 300);

      const formData = new FormData();
      formData.append("resume", file);
      if (user && user.id) {
        formData.append("userId", user?.id);
      }

      let apiEndpoint = "";
      if (pathname.startsWith("/admin")) {
        apiEndpoint = "/profile/resume";
      } else if (pathname.startsWith("/profile")) {
        apiEndpoint = "/profile/inspector-profile/resume";
      } else {
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

        clearInterval(progressInterval);

        if (!res.ok) {
          toast.error("Upload failed");
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.name === file.name
                ? { ...f, isUploading: false, uploadProgress: 0 }
                : f
            )
          );
          setIsProcessing(false);
          return;
        }

        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.name === file.name
              ? { ...f, isUploading: false, uploadProgress: 100 }
              : f
          )
        );

        const data = await res.json();

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("resumeUploaded"));
        }

        setTimeout(() => {
          setUploadedFiles((prev) => prev.filter((f) => f.name !== file.name));
          URL.revokeObjectURL(newFile.url);
          setIsProcessing(false);
          onClose();
          toast.success("Profile created successfully");
        }, 1000);
      } catch (err) {
        console.error("Upload failed", err);
        clearInterval(progressInterval);
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.name === file.name
              ? { ...f, isUploading: false, uploadProgress: 0 }
              : f
          )
        );
        setIsProcessing(false);
        toast.error("Upload failed");
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

  const CurrentIcon = LOADING_MESSAGES[loadingMessageIndex].icon;

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
            className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative"
          >
            {/* Improved Processing Loader */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-br from-white via-green-50/30 to-white backdrop-blur-sm z-50 flex items-center justify-center rounded-xl"
                >
                  <div className="text-center max-w-md px-6">
                    {/* Animated Icon Container */}
                    <div className="relative w-32 h-32 mx-auto mb-8">
                      {/* Outer rotating ring */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute inset-0"
                      >
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#76FF82"
                            strokeWidth="2"
                            strokeDasharray="70 200"
                            strokeLinecap="round"
                          />
                        </svg>
                      </motion.div>

                      {/* Middle pulsing ring */}
                      <motion.div
                        className="absolute inset-3 border-4 border-[#76FF82]/40 rounded-full"
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.4, 0.6, 0.4],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />

                      {/* Inner circle with dynamic icon */}
                      <motion.div
                        className="absolute inset-6 bg-gradient-to-br from-[#76FF82] to-[#5FE86A] rounded-full flex items-center justify-center shadow-lg"
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={loadingMessageIndex}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ duration: 0.4 }}
                          >
                            <CurrentIcon className="w-12 h-12 text-black" />
                          </motion.div>
                        </AnimatePresence>
                      </motion.div>

                      {/* Orbiting particles */}
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-[#76FF82] rounded-full"
                          style={{
                            top: "50%",
                            left: "50%",
                            marginTop: "-4px",
                            marginLeft: "-4px",
                          }}
                          animate={{
                            rotate: 360,
                            x: [0, 60 * Math.cos((i * 120 * Math.PI) / 180)],
                            y: [0, 60 * Math.sin((i * 120 * Math.PI) / 180)],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear",
                            delay: i * 0.4,
                          }}
                        />
                      ))}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Processing Resume
                    </h3>

                    {/* Animated status message */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={loadingMessageIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="mb-6"
                      >
                        <p className="text-lg text-gray-700 font-medium">
                          {LOADING_MESSAGES[loadingMessageIndex].text}
                        </p>
                      </motion.div>
                    </AnimatePresence>

                    {/* Progress indicator dots */}
                    <div className="flex gap-2 justify-center mb-6">
                      {LOADING_MESSAGES.map((_, i) => (
                        <motion.div
                          key={i}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            i === loadingMessageIndex
                              ? "w-8 bg-[#76FF82]"
                              : "w-1.5 bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Animated text hint */}
                    <motion.p
                      className="text-sm text-gray-500"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      This may take a few moments
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className="w-8 h-8 text-gray-600" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {file.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {file.size} • {file.type}
                            </p>
                            {file.isUploading && (
                              <div className="mt-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs overflow-hidden">
                                    <motion.div
                                      className="bg-[#76FF82] h-2 rounded-full"
                                      initial={{ width: "0%" }}
                                      animate={{ width: `${file.uploadProgress}%` }}
                                      transition={{ duration: 0.3 }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-500 min-w-[3rem] text-right">
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
                          {!file.isUploading && file.uploadProgress === 100 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="p-2 bg-green-100 rounded-full"
                            >
                              <Check className="w-4 h-4 text-green-600" />
                            </motion.div>
                          )}
                          {file.isUploading && (
                            <Loader2 className="w-5 h-5 text-[#76FF82] animate-spin" />
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
