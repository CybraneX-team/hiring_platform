"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle,
  Download,
  Loader2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useEffect, Suspense } from "react";
import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";

const CircularProgress = ({ percentage }: { percentage: number }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-12 h-12">
      <svg className="w-12 h-12 transform rotate-360" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r={radius}
          stroke="#E5E7EB"
          strokeWidth="3"
          fill="none"
        />
        <circle
          cx="22"
          cy="22"
          r={radius}
          stroke="#76FF82"
          strokeWidth="3"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-black font-semibold text-sm">{percentage}%</span>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-[#76FF82]" />
      <p className="text-gray-600 text-lg">Loading applicant details...</p>
    </div>
  </div>
);

const ErrorMessage = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
    <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 max-w-md text-center">
      <div className="text-red-500 text-lg font-semibold mb-4">
        Error Loading Details
      </div>
      <p className="text-gray-600 mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-[#76FF82] hover:bg-green-400 text-black font-medium rounded-full transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

function ApplicationDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("id");

  const [applicant, setApplicant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [preparingPdf, setPreparingPdf] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const brandName = "Compscope";
  const brandInitial = brandName.charAt(0);

  // Fetch applicant details
  const fetchApplicantDetails = async () => {
    if (!applicationId) {
      setError("Application ID is required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/profile/application/${applicationId}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Applicant details not found");
        }
        throw new Error("Failed to fetch applicant details");
      }

      const data = await response.json();

      if (data.success) {
        setApplicant(data.data);
        setIsShortlisted(
          data.data.applicationDetails?.status === "shortlisted"
        );
      } else {
        throw new Error(data.message || "Failed to fetch applicant details");
      }
    } catch (err) {
      console.error("Error fetching applicant details:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicantDetails();
  }, [applicationId]);

  const handleShortlist = async () => {
    if (!applicationId) return;

    try {
      if (isShortlisted) {
        // If already shortlisted, we need to use the status update endpoint to change it back
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/application/${applicationId}/status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: "pending",
              notes: "Application status changed back to pending",
            }),
          }
        );

        const result = await response.json();
        if (result.success) {
          setIsShortlisted(false);
          // Optional: Show success message
          // console.log("Candidate removed from shortlist successfully");
        } else {
          console.error("Failed to update application status:", result.message);
          // Optional: Show error message to user
        }
      } else {
        // Use the dedicated shortlist endpoint
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/application/${applicationId}/shortlist`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              shortlistReason: "Candidate shortlisted via detailed view",
              notes: "Shortlisted based on profile review",
            }),
          }
        );

        const result = await response.json();
        if (result.success) {
          setIsShortlisted(true);
          // Optional: Show success message
          // console.log("Candidate shortlisted successfully");
        } else {
          console.error("Failed to shortlist candidate:", result.message);
          // Optional: Show error message to user
        }
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      // Optional: Show error message to user
    }
  };

  const handleDownload = async () => {
    if (!contentRef.current || !applicant) return;

    setPreparingPdf(true);
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r))
    );

    try {
      // console.log("[v0] Starting consolidated PDF generation...");

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const node = contentRef.current;
      const rect = node.getBoundingClientRect();

      const cvDataUrl = await toJpeg(node, {
        quality: 0.95,
        backgroundColor: "#ffffff",
        cacheBust: true,
        filter: (n: HTMLElement) => {
          const hasAttr = typeof n.getAttribute === "function";
          const ignore =
            hasAttr &&
            (n.getAttribute("data-html2canvas-ignore") === "true" ||
              n.getAttribute("data-pdf-hide") === "true");
          return !ignore;
        },
      });

      const imgWidth = pageWidth;
      const imgHeight = (rect.height * imgWidth) / rect.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(cvDataUrl, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(cvDataUrl, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(
        `${applicant.name.replace(/\s+/g, "-")}-Consolidated-Profile.pdf`
      );
    } catch (error) {
      console.error("[v0] Error generating consolidated PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setPreparingPdf(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchApplicantDetails} />;
  }

  if (!applicant) {
    return (
      <ErrorMessage
        message="Applicant details not found"
        onRetry={fetchApplicantDetails}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-4 sm:p-6 lg:p-8">
      <div className="sr-only" aria-live="polite">
        {isShortlisted ? "Shortlisted" : ""}
      </div>
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
        Compscope
      </h1>
      <div className="max-w-6xl mx-auto mt-12">
        <div className="mb-10 flex items-center justify-between">
          <motion.button
            onClick={() => router.back()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>

          <div
            className="flex items-center gap-3"
            data-html2canvas-ignore="true"
          >
            <motion.button
              type="button"
              onClick={handleShortlist}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-full bg-[#76FF82] text-black font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#76FF82]"
              aria-pressed={isShortlisted}
            >
              <AnimatePresence initial={false} mode="wait">
                {!isShortlisted ? (
                  <motion.span
                    key="label-shortlist"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                  >
                    Shortlist
                  </motion.span>
                ) : (
                  <motion.span
                    key="label-shortlisted"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{
                      type: "spring",
                      stiffness: 650,
                      damping: 18,
                    }}
                    className="inline-flex items-center gap-1"
                  >
                    <motion.span
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 650,
                        damping: 18,
                      }}
                      className="inline-flex"
                    >
                      <CheckCircle className="w-4 h-4" color="#000000" />
                    </motion.span>
                    <span>Shortlisted</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              type="button"
              onClick={handleDownload}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={preparingPdf}
              className="px-4 py-2 rounded-full bg-[#76FF82] text-black font-medium inline-flex items-center gap-2 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#76FF82] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {preparingPdf ? "Preparing..." : "Download"}
            </motion.button>
          </div>
        </div>

        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 sm:p-8 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-lg">
                  {applicant.avatar}
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                  {applicant.name}
                </h2>
                <p className="text-gray-600">{applicant.title}</p>
              </div>
            </div>

            <div className="relative w-12 h-12">
              {!preparingPdf && (
                <div data-pdf-hide="true">
                  <CircularProgress percentage={applicant.matchPercentage} />
                </div>
              )}
              {preparingPdf && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-semibold">
                    {brandInitial}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              <span className="text-blue-600 font-medium">
                {applicant.available ? "Available" : "Unavailable"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{applicant.location}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{applicant.experience}</span>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {applicant.skills && applicant.skills.length > 0 ? (
                applicant.skills.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">No skills listed</span>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Certifications from Industry
            </h3>
            <div className="space-y-3">
              {applicant.certifications &&
                applicant.certifications.length > 0 ? (
                applicant.certifications.map((cert: any, index: number) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {cert.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Issuer:</span> {cert.issuer}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Date:</span> {cert.date}
                    </p>
                    {cert.description && (
                      <p className="text-sm text-gray-700">
                        {cert.description}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <span className="text-gray-500 text-sm">
                  No certifications listed
                </span>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Experience
            </h3>
            <div className="space-y-8">
              {applicant.experience_details &&
                applicant.experience_details.length > 0 ? (
                applicant.experience_details.map((exp: any, index: number) => (
                  <div key={index} className="bg-[#F5F5F5] rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {exp.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">{exp.company}</p>
                    <div className="space-y-2">
                      {exp.description.map(
                        (desc: string, descIndex: number) => (
                          <p
                            key={descIndex}
                            className="text-sm text-gray-700 leading-relaxed"
                          >
                            {desc}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">
                  No experience details available
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Academics
              </h3>
              <div className="space-y-4">
                {applicant.academics && applicant.academics.length > 0 ? (
                  applicant.academics.map((academic: any, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-[#76FF82] flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {academic.level}
                        </p>
                        <p className="text-sm text-gray-600">
                          {academic.institution}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    No academic information available
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Languages
              </h3>
              <div className="space-y-2">
                {applicant.languages && applicant.languages.length > 0 ? (
                  applicant.languages.map((language: string, index: number) => (
                    <p key={index} className="text-gray-700">
                      {language}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    No language information available
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contact
            </h3>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-medium">Phone No:</span>{" "}
                {applicant.contact?.phone || "Not provided"}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Mail:</span>{" "}
                {applicant.contact?.email || "Not provided"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ApplicationDetailView() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ApplicationDetailContent />
    </Suspense>
  );
}
