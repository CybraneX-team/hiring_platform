"use client";

import type * as React from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowUp,
  ExternalLink,
  Clock,
  MapPin,
  CalendarDays,
  Users,
  Loader2,
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import JobHeader from "@/app/components/jobHeader";

// Updated interface to match API response
interface Job {
  id: string;
  title: string;
  company: {
    _id: string;
    name: string;
  };
  description: string;
  requiredSkills: Array<{
    name: string;
    level: string;
    required: boolean;
  }>;
  location?: string;
  salaryRange: {
    min?: number;
    max: number;
    currency: string;
    period?: string;
  };
  jobType: string;
  experienceLevel?: string;
  department?: string;
  postedDate: string;
  applicationDeadline?: string;
  educationQualifications: string[];
  responsibilities: string[];
  benefits: string[];
  workSchedule?: string | object;
  isActive: boolean;
  applicationCount: number;
}

interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

const CustomButton: React.FC<CustomButtonProps> = ({
  className,
  children,
  variant = "primary",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium transition-colors focus:outline-none disabled:opacity-50";

  const variantClasses = {
    primary: "bg-[#76FF82] hover:bg-[#69e874] text-black text-sm px-8 py-2.5",
    secondary:
      "bg-white hover:bg-gray-50 text-[#4B5563] border border-[#E5E7EB] shadow-sm",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface CustomBadgeProps extends React.HTMLAttributes<HTMLDivElement> {}

const CustomBadge: React.FC<CustomBadgeProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={`px-3 py-1.5 bg-[#F3F4F6] text-[#6B7280] text-xs font-medium rounded-full ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface CustomAvatarProps extends React.HTMLAttributes<HTMLDivElement> {}

const CustomAvatar: React.FC<CustomAvatarProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-[#76FF82]" />
      <p className="text-[#6B7280] text-lg">Loading job details...</p>
    </div>
  </div>
);

// Error component
const ErrorMessage = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
    <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 max-w-md text-center">
      <div className="text-red-500 text-lg font-semibold mb-4">
        Error Loading Job
      </div>
      <p className="text-[#6B7280] mb-6">{message}</p>
      <CustomButton onClick={onRetry}>Try Again</CustomButton>
    </div>
  </div>
);

export default function JobListingPage() {
  const params = useSearchParams();
  const jobId = params.get("id");
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch job details
  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FIREBASE_API_URL}/api/jobs/${jobId}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Job not found");
        }
        throw new Error("Failed to fetch job details");
      }

      const jobData = await response.json();
      setJob(jobData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  // Show loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Show error state
  if (error) {
    return <ErrorMessage message={error} onRetry={fetchJobDetails} />;
  }

  // Show not found state
  if (!job) {
    return <ErrorMessage message="Job not found" onRetry={fetchJobDetails} />;
  }

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Updated format salary helper
  const formatSalary = () => {
    if (!job.salaryRange) return "Salary not specified";
    const { min, max, currency, period } = job.salaryRange;
    
    if (min && min > 0) {
      return `${min.toLocaleString()}-${max.toLocaleString()}${currency}${period ? `/${period}` : ''}`;
    } else {
      return `Up to ${max.toLocaleString()}${currency}${period ? `/${period}` : ''}`;
    }
  };

  // Helper to get work schedule string
  const getWorkSchedule = () => {
    if (!job.workSchedule) return "Not specified";
    if (typeof job.workSchedule === 'string') return job.workSchedule;
    if (typeof job.workSchedule === 'object') {
      return "Full-time"; // Default fallback
    }
    return "Not specified";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <JobHeader />
      <div className="px-0 py-6 sm:px-4 md:px-8 md:py-8 lg:px-12 lg:py-10">
        <motion.div
          className="mx-auto max-w-7xl space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Top Section - Company Info and Details */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Left Card - Company Info */}
            <motion.div
              className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8 flex flex-col"
              variants={itemVariants}
            >
              <div className="flex flex-col lg:flex-row items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <CustomAvatar className="w-12 h-12 bg-[#C5BCFF] text-white font-semibold text-lg">
                    {job.company.name.charAt(0).toUpperCase()}
                  </CustomAvatar>
                  <div className="flex-1">
                    <h1 className="text-xl font-semibold text-[#1F2937] mb-2">
                      {job.title}
                    </h1>
                    <p className="text-sm text-[#6B7280] leading-relaxed mb-8">
                      {job.description.substring(0, 200)}...
                    </p>
                    <div className="text-sm text-[#6B7280] mt-auto">
                      @{job.company.name.toLowerCase().replace(/\s+/g, "")}
                    </div>
                  </div>
                </div>

                {/* Right side - Pay and Application Count */}
                <div className="flex flex-col items-end mt-4 lg:mt-0 lg:ml-6">
                  <div className="text-sm text-[#6B7280] mb-2">
                    {job.applicationCount} applications
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-[#1F2937]">
                      {formatSalary()}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Card - Job Details */}
            <motion.div
              className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4"
              variants={itemVariants}
            >
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Clock className="h-4 w-4 text-[#6B7280] mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold text-[#A1A1A1]">
                      Experience
                    </div>
                    <div className="text-[#32343A]">
                      {job.experienceLevel || "Not specified"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CalendarDays className="h-4 w-4 text-[#6B7280] mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold text-[#A1A1A1]">Job Type</div>
                    <div className="text-[#32343A]">{job.jobType}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Users className="h-4 w-4 text-[#6B7280] mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold text-[#A1A1A1]">
                      Work Schedule
                    </div>
                    <div className="text-[#32343A]">{getWorkSchedule()}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-[#6B7280] mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold text-[#A1A1A1]">Location</div>
                    <div className="text-[#32343A]">
                      {job.location || "Remote/Not specified"}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content Card */}
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8"
            variants={itemVariants}
          >
            {/* Apply Button - Top Right */}
            <div className="flex justify-end mb-6">
              <CustomButton
                className="font-semibold px-14 py-3 focus:outline-none"
                disabled={!job.isActive}
              >
                {job.isActive ? "Apply" : "Position Closed"}
              </CustomButton>
            </div>

            <div className="space-y-8">
              {/* Job Description */}
              <div className="-mt-12">
                <h2 className="text-lg font-semibold text-[#1F2937] mb-3">
                  Job Description
                </h2>
                <div className="space-y-4 text-sm text-[#4B5563] leading-relaxed max-w-4xl">
                  <p>{job.description}</p>
                </div>
              </div>

              {/* Department */}
              {job.department && (
                <div>
                  <h3 className="text-lg font-semibold text-[#1F2937] mb-4">
                    Department
                  </h3>
                  <CustomBadge>{job.department}</CustomBadge>
                </div>
              )}

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-[#1F2937] mb-4">
                    Benefits
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.benefits.map((benefit, index) => (
                      <CustomBadge key={index}>{benefit}</CustomBadge>
                    ))}
                  </div>
                </div>
              )}

              {/* Required Skills - Fixed to handle objects */}
              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-[#1F2937] mb-4">
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, index) => (
                      <CustomBadge key={index}>
                        {typeof skill === 'string' ? skill : skill.name}
                        {typeof skill === 'object' && skill.level && (
                          <span className="ml-1 text-xs">({skill.level})</span>
                        )}
                      </CustomBadge>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {job.educationQualifications && job.educationQualifications.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-[#1F2937] mb-4">
                    Qualifications
                  </h3>
                  <ul className="space-y-2 text-sm text-[#4B5563]">
                    {job.educationQualifications.map((requirement, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-[#6B7280] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-[#1F2937] mb-4">
                    Key Responsibilities
                  </h3>
                  <ul className="space-y-2 text-sm text-[#4B5563]">
                    {job.responsibilities.map((responsibility, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-[#6B7280] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {responsibility}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Application Deadline */}
              {job.applicationDeadline && (
                <div className="bg-[#F3F4F6] rounded-lg p-4">
                  <p className="text-sm text-[#4B5563]">
                    <strong>Application Deadline:</strong>{" "}
                    {formatDate(job.applicationDeadline)}
                  </p>
                  <p className="text-sm text-[#6B7280] mt-1">
                    Posted on {formatDate(job.postedDate)}
                  </p>
                </div>
              )}

              {/* Posted Date - Always show since it exists */}
              {!job.applicationDeadline && (
                <div className="bg-[#F3F4F6] rounded-lg p-4">
                  <p className="text-sm text-[#6B7280]">
                    Posted on {formatDate(job.postedDate)}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll to Top Button */}
        <CustomButton
          variant="secondary"
          className="fixed bottom-8 right-8 w-12 h-12 rounded-full shadow-lg p-0"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ArrowUp className="h-5 w-5" />
        </CustomButton>
      </div>
    </div>
  );
}
