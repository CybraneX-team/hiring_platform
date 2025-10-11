"use client";

import { useState, useEffect, Suspense } from "react";
import StarRating from "@/app/components/StarRating";
import RatingModal from "@/app/components/RatingModal";
import { Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface Applicant {
  id: string;
  name: string;
  title: string;
  avatar: string;
  available: boolean;
  location: string;
  experience: string;
  skills: string[];
  certifications: string[];
  matchPercentage: number;
  status: string;
  applicationId: string;
}

interface RatingData {
  hasRating: boolean;
  rating: number | null;
  canRate: boolean;
  jobStatus: string;
}

const CircularProgress = ({ percentage }: { percentage: number }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-12 h-12">
      <svg className="w-12 h-12 transform rotate-360" viewBox="0 0 44 44">
        {/* Background circle */}
        <circle
          cx="22"
          cy="22"
          r={radius}
          stroke="#E5E7EB"
          strokeWidth="3"
          fill="none"
        />
        {/* Progress circle */}
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
      {/* Percentage text */}
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
      <p className="text-gray-600 text-lg">Loading applicants...</p>
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
        Error Loading Applicants
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

function ApplicationsListContent() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobInfo, setJobInfo] = useState<any>(null);
  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean;
    applicationId: string;
    applicantName: string;
    jobTitle: string;
  } | null>(null);
  const [ratings, setRatings] = useState<Record<string, RatingData>>({});
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  // Transform API response to match Applicant interface
  const transformApplicationToApplicant = (application: any): Applicant => {
    const applicant = application.applicant;
    const profile = application.profile || {};

    // Generate avatar from name
    const generateAvatar = (name: string) => {
      const names = name.split(" ");
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    };

    // Calculate experience years
    const getExperienceText = (yearsOfExp: string | number) => {
      const years =
        typeof yearsOfExp === "string"
          ? parseInt(yearsOfExp) || 0
          : yearsOfExp || 0;
      return `${years} Year${years !== 1 ? "s" : ""}`;
    };

    return {
      id: applicant._id || applicant.id,
      name: application.profile.name || "Unknown Applicant",
      title:
        profile.openToRoles?.[0] ||
        profile.WorkExperience?.[0]?.title ||
        "Professional",
      avatar: generateAvatar(application.profile.name || "NA"),
      available:
        application.status === "pending" || application.status === "reviewing",
      location: profile.location || profile.locationData?.address || "Location not specified",
      experience: getExperienceText(profile.yearsOfExp),
      skills: profile.skills || ["No skills listed"],
      certifications: profile.certificates?.map((cert: any) => cert.name) || [
        "No certifications",
      ],
      matchPercentage: Math.round(
        application.matchScore || application.matchDetails?.overallScore || 0
      ),
      status: application.status || "pending",
      applicationId: application._id,
    };
  };

  // Fetch rating for a specific application
  const fetchRating = async (applicationId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/application/${applicationId}/rating`
      );
      const data = await response.json();

      if (data.success) {
        setRatings((prev) => ({
          ...prev,
          [applicationId]: data.data,
        }));
      }
    } catch (error) {
      console.error("Error fetching rating:", error);
    }
  };

  // Submit rating
  const submitRating = async (applicationId: string, rating: number) => {
    setRatingSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/application/${applicationId}/rate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rating }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update local rating state
        setRatings((prev) => ({
          ...prev,
          [applicationId]: {
            hasRating: true,
            rating: rating,
            canRate: prev[applicationId]?.canRate || false,
            jobStatus: prev[applicationId]?.jobStatus || "",
          },
        }));
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      throw error;
    } finally {
      setRatingSubmitting(false);
    }
  };

  // Fetch applicants data
  const fetchApplicants = async () => {
    if (!jobId) {
      setError("Job ID is required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/application/job/${jobId}?limit=50`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Job not found");
        }
        throw new Error("Failed to fetch applicants");
      }

      const data = await response.json();

      if (data.success) {
        setJobInfo(data.data.job);

        // Transform applications to applicants
        const transformedApplicants = data.data.applications.map(
          transformApplicationToApplicant
        );
        setApplicants(transformedApplicants);

        // **FIX: Fetch ratings after applicants are loaded**
        transformedApplicants.forEach((applicant: Applicant) => {
          fetchRating(applicant.applicationId);
        });
      } else {
        throw new Error(data.message || "Failed to fetch applicants");
      }
    } catch (err) {
      console.error("Error fetching applicants:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // **FIX: Single useEffect that calls fetchApplicants**
  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  // Filter tabs based on actual data
  const getFilterTabs = () => {
    const totalApplicants = applicants.length;
    const experiencedApplicants = applicants.filter(
      (a) => parseInt(a.experience.split(" ")[0]) >= 2
    ).length;
    const highMatchApplicants = applicants.filter(
      (a) => a.matchPercentage >= 75
    ).length;
    const availableApplicants = applicants.filter((a) => a.available).length;

    return [
      { id: "all", label: "All Applicants", count: totalApplicants },
      {
        id: "experience",
        label: "2+ Yrs Experience",
        count: experiencedApplicants,
      },
      { id: "match", label: "75%+ AI match", count: highMatchApplicants },
      { id: "available", label: "Available", count: availableApplicants },
    ];
  };

  // Filter applicants based on active filter
  const getFilteredApplicants = () => {
    switch (activeFilter) {
      case "experience":
        return applicants.filter(
          (a) => parseInt(a.experience.split(" ")[0]) >= 2
        );
      case "match":
        return applicants.filter((a) => a.matchPercentage >= 75);
      case "available":
        return applicants.filter((a) => a.available);
      default:
        return applicants;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchApplicants} />;
  }
  const formatExperience = (years: any) => {
    if (years === undefined || years === null || years === "") return undefined;
    if (typeof years === "number") {
      return `${years} ${years === 1 ? "year" : "years"}`;
    }
    if (typeof years === "string") {
      const s = years.trim();
      // if the string already mentions year(s), yr, yrs or contains a + (e.g. '9+'), return as-is
      if (/(year|years|yr|yrs|\+)/i.test(s)) return s;
      // if it's a numeric string like '9' => convert to number and append years
      if (/^\d+(?:\.\d+)?$/.test(s)) {
        const n = Number(s);
        return `${n} ${n === 1 ? "year" : "years"}`;
      }
      //remove +
      return s.replace(/\+/g, "").trim();
    }
    return String(years);
  };
  const filteredApplicants = getFilteredApplicants();
  const filterTabs = getFilterTabs();

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-4 sm:p-6 lg:p-8">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
        {jobInfo?.title || "Job Applications"}
      </h1>
      <div className="max-w-4xl mx-auto mt-12">
        {/* Header */}
        <div className="mb-10">
          <motion.button
            onClick={() => router.back()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {filterTabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeFilter === tab.id
                    ? "bg-[#D0FFD4] text-[#2E9977]"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab.label} ({tab.count})
              </motion.button>
            ))}
          </div>
        </div>

        {/* No Applicants Message */}
        {filteredApplicants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {activeFilter === "all"
                ? "No applicants found for this job."
                : "No applicants match the selected filter."}
            </p>
          </div>
        )}

        {/* Applications List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredApplicants.map((applicant, index) => {
              return (
                <motion.div
                  key={applicant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    {/* Left Section - Profile Info */}
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">
                          {applicant.avatar}
                        </span>
                      </div>

                      {/* Profile Details */}
                      <div className="flex-1 min-w-full w-full">
                        {/* Name and Title */}
                        <div className="mb-5 w-full">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 max-w-[200px]">
                            {applicant.name}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {applicant.title}
                          </p>
                        </div>

                        {/* Divider line after name section */}
                        <div className="border-t border-gray-100 mb-4 w-[115%] -mx-14"></div>

                        {/* Status Indicators */}
                        <div className="flex flex-wrap gap-4 mb-4 text-sm -mx-14 text-gray-600">
                          {/* <div className="flex items-center gap-1">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                applicant.available
                                  ? "bg-blue-500"
                                  : "bg-red-500"
                              }`}
                            ></div>
                            <span
                              className={
                                applicant.available
                                  ? "text-blue-600"
                                  : "text-red-600"
                              }
                            >
                              {applicant.available
                                ? "Available"
                                : "Unavailable"}
                            </span>
                          </div> */}

                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{applicant.location.split(",").slice(-4).join(", ")}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Experience : {formatExperience(applicant.experience) || "Not Specified"}</span>
                          </div>
                        </div>
                        
                        {/* Skills */}
                        <div className="mb-6 -mx-14">
                          <p className="text-xs text-gray-500 mb-2">Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {applicant.skills
                              .slice(0, 4)
                              .map((skill, skillIndex) => (
                                <span
                                  key={skillIndex}
                                  className="px-3 py-1 bg-[#F5F5F5] text-gray-700 text-xs rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                            {applicant.skills.length > 4 && (
                              <span className="px-3 py-1 bg-[#F5F5F5] text-gray-700 text-xs rounded-full">
                                +{applicant.skills.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Certifications */}
                        <div className="-mx-14">
                          <p className="text-xs text-gray-500 mb-2">
                            Certifications from Industry
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {applicant.certifications
                              .slice(0, 3)
                              .map((cert, certIndex) => (
                                <span
                                  key={certIndex}
                                  className="px-3 py-1 bg-[#F5F5F5] text-gray-700 text-xs rounded-full"
                                >
                                  {cert}
                                </span>
                              ))}
                            {applicant.certifications.length > 3 && (
                              <span className="px-3 py-1 bg-[#F5F5F5] text-gray-700 text-xs rounded-full">
                                +{applicant.certifications.length - 3} more
                              </span>
                            )}
                          </div>

                          {/* **FIX: Rating Section - Moved to better position** */}
                          {ratings[applicant.applicationId]?.canRate && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              {ratings[applicant.applicationId]?.hasRating ? (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">
                                    Your Rating:
                                  </span>
                                  <StarRating
                                    rating={
                                      ratings[applicant.applicationId]
                                        ?.rating || 0
                                    }
                                    readonly
                                    size="sm"
                                  />
                                </div>
                              ) : (
                                <button
                                  onClick={() =>
                                    setRatingModal({
                                      isOpen: true,
                                      applicationId: applicant.applicationId,
                                      applicantName: applicant.name,
                                      jobTitle: jobInfo?.title || "Position",
                                    })
                                  }
                                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                  <Star className="w-4 h-4" />
                                  Rate Applicant
                                </button>
                              )}
                            </div>
                          )}

                          {/* Mobile Open Button */}
                          <Link
                            href={`/company/applicants?id=${applicant.applicationId}`}
                            className="flex justify-end"
                          >
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="px-8 py-2 bg-[#76FF82] hover:bg-green-400 text-black font-medium rounded-full transition-colors w-40 mr-10 mt-5 md:hidden"
                            >
                              Open
                            </motion.button>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Match Percentage and Action Button */}
                    <div className="flex flex-col items-end justify-between h-full min-h-[200px]">
                      {/* Match Percentage with Progress Circle and Label */}
                      <div className="flex items-center gap-3">
                        {applicant.status === "shortlisted" && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#76FF82] text-black font-medium shadow-sm">
                            <span className="inline-flex items-center" aria-hidden="true">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                                <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                                <path d="m9 11 3 3L22 4"></path>
                              </svg>
                            </span>
                            <span>Shortlisted</span>
                          </div>
                        )}
                        <div className="flex flex-col items-center gap-1">
                          <CircularProgress
                            percentage={applicant.matchPercentage}
                          />
                          <span className="text-xs text-gray-500 text-center">
                            AI match score
                          </span>
                        </div>
                      </div>

                      {/* Desktop Open Button */}
                      <Link
                        href={`/company/applicants?id=${applicant.applicationId}`}
                      >
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-8 py-2 bg-[#76FF82] hover:bg-green-400 text-black font-medium rounded-full transition-colors w-40 hidden md:mt-44 md:block"
                        >
                          Open
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Rating Modal */}
        {ratingModal && (
          <RatingModal
            isOpen={ratingModal.isOpen}
            onClose={() => setRatingModal(null)}
            onSubmit={(rating) => submitRating(ratingModal.applicationId, rating)}
            applicantName={ratingModal.applicantName}
            jobTitle={ratingModal.jobTitle}
            isSubmitting={ratingSubmitting}
          />
        )}
      </div>
    </div>
  );
}

export default function ApplicationsListView() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ApplicationsListContent />
    </Suspense>
  );
}
