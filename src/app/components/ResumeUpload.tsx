"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, Check, Loader2, Eye } from "lucide-react";
import apiClient from "../utils/api";
import { toast } from "react-toastify";
import { useUser } from "../context/UserContext";


interface ResumeUploadProps {
  userId: string;
  onUploadComplete?: (resumeData: any) => void;
  onClose?: () => void;
}

interface UploadedFile {
  name: string;
  size: string;
  type: string;
  url: string;
  isUploading: boolean;
  uploadProgress: number;
}

interface AnalysisResult {
  skills: Array<{
    name: string;
    level: string;
    yearsOfExperience?: number;
  }>;
  experienceLevel: string;
  primarySkills: string[];
  preferredRoles: string[];
}

export default function ResumeUpload({ userId, onUploadComplete, onClose }: ResumeUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {user, profile, setprofile} = useUser()

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

  const handleFiles = async (files: File[]) => {
    setError(null);
    
    const validFiles = files.filter(
      (file) =>
        file.type === "application/pdf" ||
        file.type === "application/msword" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    if (validFiles.length === 0) {
      setError("Please upload valid resume files (PDF, DOC, DOCX)");
      return;
    }

    // For now, handle only the first file
    const file = validFiles[0];
    
    const newFile: UploadedFile = {
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      type: file.type.includes("pdf") ? "PDF" : "DOC",
      url: URL.createObjectURL(file),
      isUploading: true,
      uploadProgress: 0,
    };

    setUploadedFiles([newFile]);
    setIsProcessing(true);


      // Upload and parse the resume
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('userId', userId || (user ? user.id : ""));
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/profile/resume`,
            {
              method: "POST",
              body: formData,
            }
          );
      
          if (!res.ok) {
            toast.error("Upload failed");
            return; // Stop execution on error
          }
  
          // ✅ resume uploaded + profile created
          const data = await res.json();
          setprofile(data.profile)
          localStorage.setItem("profile", JSON.stringify(data.profile))
          // 🔹 REMOVE the file from the list after successful upload
          setUploadedFiles((prev) => prev.filter((f) => f.name !== file.name));
  
          // Clean up the blob URL to prevent memory leaks

          toast.success("profile created")
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
       }finally {
      setIsProcessing(false);
      }
    }
  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
    setAnalysisResult(null);
  };

  return (
    <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Upload Your Resume
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors mb-6 ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Drop your resume here or click to browse
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Supports PDF, DOC, and DOCX files (Max 10MB)
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-full transition-colors"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
              Processing...
            </>
          ) : (
            "Choose File"
          )}
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
        <div className="space-y-4 mb-6">
          <h3 className="font-medium text-gray-900">Uploaded Resume</h3>
          {uploadedFiles.map((file, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {file.size} • {file.type}
                  </p>
                  {file.isUploading && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${file.uploadProgress}%` }}
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
                {!file.isUploading && (
                  <div className="p-2 bg-green-100 rounded-full">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                )}
                <button
                  onClick={() => removeFile(file.name)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h3 className="text-lg font-semibold text-gray-900">Resume Analysis</h3>
          
          {/* Experience Level */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Experience Level</h4>
            <span className="inline-block px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-medium">
              {analysisResult.experienceLevel || 'Not determined'}
            </span>
          </div>

          {/* Primary Skills */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Primary Skills</h4>
            <div className="flex flex-wrap gap-2">
              {(analysisResult.primarySkills || []).map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Detailed Skills */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Skills Analysis</h4>
            <div className="space-y-2">
              {(analysisResult.skills || []).length > 0 ? (
                (analysisResult.skills || []).slice(0, 8).map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">{skill.name}</span>
                      {skill.yearsOfExperience && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({skill.yearsOfExperience} years)
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      skill.level === 'Advanced' 
                        ? 'bg-green-100 text-green-800'
                        : skill.level === 'Intermediate'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {skill.level}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg text-center text-gray-500">
                  Skills analysis is being processed. Try uploading again if no skills appear.
                </div>
              )}
            </div>
          </div>

          {/* Preferred Roles */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Suggested Job Roles</h4>
            <div className="flex flex-wrap gap-2">
              {(analysisResult.preferredRoles || []).map((role, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
