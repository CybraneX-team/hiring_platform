"use client";

import type * as React from "react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowUp,
  ExternalLink,
  Clock,
  MapPin,
  CalendarDays,
  Users,
  X,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { motion, type Variants, AnimatePresence } from "framer-motion";
import JobHeader from "@/app/components/jobHeader";
import TruncatedText from "@/app/components/TruncatedText";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUser } from "@/app/context/UserContext";

// Interfaces
interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

interface Job {
  id: string;
  title: string;
  company: {
    _id: string;
    companyName: string;
  };
  description: string;
  requiredSkills: Array<{
    name: string;
    level: string;
    required: boolean;
  }>;
  // Location may come as string or object with address/coordinates
  location?: any;
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
  companyDescription: string;
  skillsInJobPost: string[];
  educationQualifications: string[];
  responsibilities: string[];
  benefits: string[];
  workSchedule?: any;
  isActive: boolean;
  applicationCount: number;
  usersApplied: string[];
  customQuestions: any;
  noOfOpenings: any;
  totalApplications: any;
  jobStatus?: string;
  experience?: string;
  mandatoryCertificates?: string[];
  payRangeType?: "Daily" | "Monthly";
  fatIncluded?: boolean;
   payoffAmountPercentage?: number; 
}

// Components (keep your existing CustomButton, CustomBadge, CustomAvatar)
const CustomButton: React.FC<CustomButtonProps> = ({
  className,
  children,
  variant = "primary",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium transition-colors focus:outline-none  disabled:opacity-50";

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

const CustomBadge: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
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

const CustomAvatar: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
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

const ApplicationPopup: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  job?: Job | null; // Add job prop
}> = ({ isOpen, onClose, onSubmit, job }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    experience: "",
    portfolio: "",
    coverLetter: "",
    availability: "",
    programmingLanguages: "",
    frameworks: "",
    databaseExperience: "",
    projectDescription: "",
    problemSolvingExample: "",
    remoteWorkExperience: "",
    expectedSalary: "",
  });

  // State for custom questions
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>(
    {}
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If this is for custom questions, submit those answers
    if (job?.customQuestions && job.customQuestions.length > 0) {
      onSubmit(customAnswers);
    } else {
      // Otherwise submit the full form data
      onSubmit(formData);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCustomAnswerChange = (questionId: string, value: string) => {
    setCustomAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Check if we should show custom questions
  const showCustomQuestions =
    job?.customQuestions && job.customQuestions.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 text-black"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold text-[#1F2937] pr-2">
                  {showCustomQuestions
                    ? `Apply for ${job?.title}`
                    : "Apply for Software Development Engineer"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                >
                  <X className="h-5 w-5 text-[#6B7280]" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {showCustomQuestions ? (
                // Custom Questions Form
                <div className="space-y-6">
                  <div className="text-sm text-[#6B7280] mb-4">
                    Please answer the following questions to complete your
                    application:
                  </div>

                  {job.customQuestions.map((question: any, index: number) => (
                    <div key={question.id || index} className="space-y-2">
                      <label className="block text-sm font-medium text-[#1F2937] mb-2">
                        {question.question} *
                      </label>

                      {question.type === "MCQ" ? (
                        <select
                          required
                          value={customAnswers[question.id] || ""}
                          onChange={(e) =>
                            handleCustomAnswerChange(
                              question.id,
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all"
                        >
                          <option value="">Select an option</option>
                          {question.options?.map(
                            (option: string, optIndex: number) => (
                              <option key={optIndex} value={option}>
                                {option}
                              </option>
                            )
                          )}
                        </select>
                      ) : (
                        <textarea
                          required
                          value={customAnswers[question.id] || ""}
                          onChange={(e) =>
                            handleCustomAnswerChange(
                              question.id,
                              e.target.value
                            )
                          }
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all resize-none"
                          placeholder="Enter your answer..."
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                // Full Application Form (your existing form)
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1F2937] mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all text-sm"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1F2937] mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all text-sm"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1F2937] mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all text-sm"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1F2937] mb-2">
                        Years of Experience *
                      </label>
                      <select
                        name="experience"
                        required
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all text-sm"
                      >
                        <option value="">Select experience</option>
                        <option value="0-6months">0-6 months</option>
                        <option value="6months-1year">6 months - 1 year</option>
                        <option value="1-2years">1-2 years</option>
                        <option value="2-5years">2-5 years</option>
                        <option value="5+years">5+ years</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-2">
                      Portfolio/GitHub URL
                    </label>
                    <input
                      type="url"
                      name="portfolio"
                      value={formData.portfolio}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all"
                      placeholder="https://github.com/yourusername"
                    />
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-lg font-semibold text-[#1F2937] mb-4">
                      Technical Questions
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#1F2937] mb-2">
                          Programming Languages *
                        </label>
                        <input
                          type="text"
                          name="programmingLanguages"
                          required
                          value={formData.programmingLanguages}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all"
                          placeholder="e.g., PHP, JavaScript, Python, Java"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#1F2937] mb-2">
                          Frameworks & Technologies *
                        </label>
                        <input
                          type="text"
                          name="frameworks"
                          required
                          value={formData.frameworks}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all"
                          placeholder="e.g., Laravel, React, Node.js, Vue.js"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#1F2937] mb-2">
                          Database Experience *
                        </label>
                        <input
                          type="text"
                          name="databaseExperience"
                          required
                          value={formData.databaseExperience}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all"
                          placeholder="e.g., MySQL, PostgreSQL, MongoDB, Redis"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#1F2937] mb-2">
                          Describe your most challenging project *
                        </label>
                        <textarea
                          name="projectDescription"
                          required
                          value={formData.projectDescription}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all resize-none"
                          placeholder="Briefly describe a challenging project you worked on, the technologies used, and your role..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#1F2937] mb-2">
                          Problem-solving example *
                        </label>
                        <textarea
                          name="problemSolvingExample"
                          required
                          value={formData.problemSolvingExample}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all resize-none"
                          placeholder="Describe a technical problem you solved and your approach to solving it..."
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#1F2937] mb-2">
                            Remote Work Experience *
                          </label>
                          <select
                            name="remoteWorkExperience"
                            required
                            value={formData.remoteWorkExperience}
                            onChange={handleInputChange}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all text-sm"
                          >
                            <option value="">Select experience</option>
                            <option value="no-experience">
                              No remote work experience
                            </option>
                            <option value="some-experience">
                              Some remote work experience
                            </option>
                            <option value="extensive-experience">
                              Extensive remote work experience
                            </option>
                            <option value="fully-remote">
                              Worked fully remote for 1+ years
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#1F2937] mb-2">
                            Expected Salary (₹/hour) *
                          </label>
                          <input
                            type="number"
                            name="expectedSalary"
                            required
                            value={formData.expectedSalary}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all"
                            placeholder="e.g., 15000"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-2">
                      When can you start? *
                    </label>
                    <select
                      name="availability"
                      required
                      value={formData.availability}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all"
                    >
                      <option value="">Select availability</option>
                      <option value="immediately">Immediately</option>
                      <option value="1week">Within 1 week</option>
                      <option value="2weeks">Within 2 weeks</option>
                      <option value="1month">Within 1 month</option>
                      <option value="negotiable">Negotiable</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-2">
                      Cover Letter *
                    </label>
                    <textarea
                      name="coverLetter"
                      required
                      value={formData.coverLetter}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all resize-none"
                      placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <CustomButton
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </CustomButton>
                <CustomButton type="submit" className="flex-1 font-semibold">
                  Submit Application
                </CustomButton>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SuccessPopup: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", duration: 0.6 }}
              className="mb-6"
            >
              <div className="w-16 h-16 bg-[#76FF82] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <h3 className="text-2xl font-semibold text-[#1F2937] mb-3">
                Application Submitted!
              </h3>
              <p className="text-[#6B7280] mb-6 leading-relaxed">
                Thank you for your interest! We've received your application and
                will review it carefully. You'll hear back from us within 3-5
                business days.
              </p>
              <CustomButton onClick={onClose} className="font-semibold px-8">
                Got it!
              </CustomButton>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

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

const LoadingSpinner = () => (
  <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-[#76FF82]" />
      <p className="text-[#6B7280] text-lg">Loading job details...</p>
    </div>
  </div>
);

// Main component that uses useSearchParams and useUser
function JobListingContent() {
  const params = useSearchParams();
  const jobId = params.get("id");
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Modal states
  const [showApplicationPopup, setShowApplicationPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [customQAnswers, setCustomQAnswers] = useState<Record<string, string>>(
    {}
  );

  // Get user and profile data from context
  const { user, profile } = useUser();
  const [hasApplied, setHasApplied] = useState(false);

  // Fetch job details
  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/jobs/${jobId}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Job not found");
        }
        throw new Error("Failed to fetch job details");
      }

      const jobData = await response.json();

      try {
        // eslint-disable-next-line no-console
        console.log("[JobDetails] period snapshot", {
          id: jobId,
          payRangeType: jobData.payRangeType,
          salaryRangePeriod: jobData.salaryRange?.period,
        });
      } catch {}
      setJob(jobData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Handle actual job application (your original API call)
  // Modify handleActualApply to accept custom answers as parameter
  const handleActualApply = async (
    customAnswersData?: Record<string, string>
  ) => {
    console.log(
      "jobId !user?.id || !profile?.id",
      jobId,
      user?.id,
      profile?._id
    );

    if (!jobId || !user?.id || !profile?._id) {
      toast.error(
        "Missing required information. Please ensure you're logged in and have a profile."
      );
      return;
    }

    try {
      setIsApplying(true);

      // Transform the custom answers to match backend format
      const customQuestionAnswers =
        job?.customQuestions?.map((question: any) => ({
          questionId: question.id,
          question: question.question,
          answer: customAnswersData?.[question.id] || "",
        })) || [];

      const applicationData = {
        jobId: jobId,
        userId: user.id,
        profileId: profile._id,
        coverLetter: "",
        customQuestionAnswers: customQuestionAnswers, 
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/application`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(applicationData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setHasApplied(true);
          toast.warning(
            result.message || "You have already applied for this job!"
          );
          return;
        }
        throw new Error(result.message || "Failed to submit application");
      }

      // Success
      setHasApplied(true);
      toast.success(
        `Application submitted successfully! Match Score: ${result.data.matchAnalysis.overallScore}`,
        {
          position: "top-right",
          autoClose: 5000,
        }
      );

      await fetchJobDetails();

      if (result.data.matchAnalysis.recommendations?.length > 0) {
        setTimeout(() => {
          toast.info(
            `Recommendations: ${result.data.matchAnalysis.recommendations[0]}`,
            {
              position: "top-right",
              autoClose: 8000,
            }
          );
        }, 2000);
      }
    } catch (error) {
      console.error("Application error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit application. Please try again.",
        { position: "top-right", autoClose: 5000 }
      );
    } finally {
      setIsApplying(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  useEffect(() => {
    // console.log("job is", job);
    if (job && job.usersApplied && user?.id) {
      const applied = job.usersApplied.includes(user.id);
      setHasApplied(applied);
    }
  }, [job, user]);

  const handleCloseSuccessPopus = () => {
    setShowSuccessPopup(false);
  };

  //  const handleApplyClick = () => {
  //   setShowApplicationPopup(true)
  // }

  // Replace the existing handleApplicationSubmit function with this:
  const handleApplicationSubmit = (data: any) => {
    console.log("Application submitted", data);
    setShowApplicationPopup(false);

    // If this was custom questions, call the actual API with the answers
    if (job?.customQuestions && job.customQuestions.length > 0) {
      // Update the parent state with the received answers
      setCustomQAnswers(data);
      // Call API with the received data
      handleActualApply(data);
    } else {
      // Show success for full form
      setShowSuccessPopup(true);
    }
  };

  const handleCloseApplicationPopup = () => {
    setShowApplicationPopup(false);
  };

  const handleCloseSuccessPopup = () => {
    setShowSuccessPopup(false);
  };
  const handleApplyClick = () => {
    if (job?.customQuestions && job?.customQuestions.length > 0) {
      // show modal that only contains the custom Qs
      setShowApplicationPopup(true);
    } else {
      // no questions → fire API right away
      handleActualApply();
    }
  };

  // Loading and error states
  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchJobDetails} />;
  }

  if (!job) {
    return <ErrorMessage message="Job not found" onRetry={fetchJobDetails} />;
  }

  // Format helpers
// Format helpers
const formatSalary = () => {

  if (!job.salaryRange) return "Salary not specified";
  const { min, max, currency, period } = job.salaryRange;
  
  const payoff = (job as any).payoffAmountPercentage || 0;
  
  // Calculate amounts after deducting payoff percentage
  const calculateDeductedAmount = (amount: number) => {
    return Math.round(amount - (amount * payoff / 100));
  };
  
  const payType = job.payRangeType
    ? ` / ${job.payRangeType}`
    : "";
  const currencySymbol = currency || "₹";
  
  if (min && min > 0) {
    // If min and max are the same, show single value with deduction
    if (min === max) {
      const deductedAmount = calculateDeductedAmount(min);
      return `${currencySymbol}${deductedAmount.toLocaleString()}${payType}`;
    }
    // Different min and max - show range with deductions
    const deductedMin = calculateDeductedAmount(min);
    const deductedMax = calculateDeductedAmount(max);
    return `${currencySymbol}${deductedMin.toLocaleString()} - ${currencySymbol}${deductedMax.toLocaleString()}${payType}`;
  }
  const deductedMax = calculateDeductedAmount(max);
  return `Up to ${currencySymbol}${deductedMax.toLocaleString()}`;
};


  // Helper: last four comma-separated parts of an address
  const getLastFourParts = (address?: string) => {
    if (!address) return "Location unavailable";
    const parts = address
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    if (parts.length <= 4) return address;
    return parts.slice(-4).join(", ");
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPeriod = (t?: string) => {
    if (!t) return "";
    return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
  };

  const formatCoords = (coords?: { latitude?: number; longitude?: number }) => {
    if (
      !coords ||
      typeof coords.latitude !== "number" ||
      typeof coords.longitude !== "number"
    )
      return undefined;
    return `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
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
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="px-4 py-4 sm:px-4 md:px-8 md:py-8 lg:px-12 lg:py-10">
        <motion.div
          className="mx-auto max-w-7xl space-y-4 sm:space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Top Section - Company Info and Details */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Header Card - full width on desktop to avoid empty space */}
            <motion.div
              className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 lg:p-6 flex flex-col"
              variants={itemVariants}
            >
              <div className="flex flex-col lg:flex-row items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <CustomAvatar className="w-10 h-10 sm:w-12 sm:h-12 bg-[#7C3AED] text-white font-semibold text-sm sm:text-lg">
                    {job.company.companyName.charAt(0).toUpperCase()}
                  </CustomAvatar>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold sm:font-extrabold text-[#111827] leading-snug">
                      {job.title}
                    </h1>
                    <div className="text-xs sm:text-sm text-[#6B7280]">
                      @{job.company.companyName.toLowerCase()}
                    </div>
                    <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-2">
                      {job.jobType && <CustomBadge className="text-xs">{job.jobType}</CustomBadge>}
                      {(job.experienceLevel || job.experience) && (
                        <CustomBadge className="text-xs">
                          {job.experienceLevel || job.experience}
                        </CustomBadge>
                      )}
                      {job.department && (
                        <CustomBadge className="text-xs">{job.department}</CustomBadge>
                      )}
                      {job.location && (
                        <CustomBadge className="text-xs">
                          {getLastFourParts(
                            typeof job.location === "string"
                              ? job.location
                              : job.location?.address
                          )}
                        </CustomBadge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side - Pay and Apply */}
                <div className="flex flex-col items-stretch lg:items-end gap-2 mt-1 lg:mt-0 lg:ml-6 w-full lg:w-auto">
                  <div className="text-left lg:text-right w-full">
                    <div className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5">
                      <span className="text-sm sm:text-base lg:text-xl font-bold text-[#111827] leading-tight">
                        {formatSalary()}
                      </span>
                    </div>
                  </div>
                  <CustomButton
                    className="w-full lg:w-auto font-semibold px-4 sm:px-6 py-2 text-xs sm:text-sm focus:outline-none cursor-pointer rounded-full shadow-md hover:shadow-lg transition-shadow bg-gradient-to-r from-[#76FF82] to-[#8BFFA1]"
                    disabled={!job.isActive || isApplying || hasApplied}
                    onClick={handleApplyClick}
                  >
                    {isApplying ? (
                      <>
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Applying...</span>
                        <span className="sm:hidden">Applying</span>
                      </>
                    ) : hasApplied ? (
                      "Applied ✓"
                    ) : !job.isActive ? (
                      "Position Closed"
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <span className="hidden sm:inline">Apply</span>
                        <span className="sm:hidden">Apply</span>
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                      </span>
                    )}
                  </CustomButton>
                </div>
              </div>

              {/* Quick stats row to utilize width */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 text-xs sm:text-sm border-t border-gray-100 pt-3 sm:pt-4 justify-center items-center text-center">
                <div>
                  <div className="text-[#A1A1A1]">Openings</div>
                  <div className="text-[#32343A] font-medium">
                    {job.noOfOpenings || 1}
                  </div>
                </div>
                <div>
                  <div className="text-[#A1A1A1]">Applications</div>
                  <div className="text-[#32343A] font-medium">
                    {job.totalApplications}
                  </div>
                </div>
                <div>
                  <div className="text-[#A1A1A1]">Posted</div>
                  <div className="text-[#32343A] font-medium">
                    {formatDate(job.postedDate)}
                  </div>
                </div>
                <div>
                  <div className="text-[#A1A1A1]">Deadline</div>
                  <div className="text-[#32343A] font-medium">
                    {formatDate(job.applicationDeadline)}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content Card */}
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8"
            variants={itemVariants}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
              <div className="lg:col-span-2 space-y-6 sm:space-y-8 lg:pr-10">
                {/* Job Description */}
                <div className="">
                  <h2 className="text-lg font-semibold text-[#1F2937] mb-3">
                    Job description
                  </h2>
                  <div className="space-y-4 text-justify text-sm text-[#4B5563] leading-relaxed max-w-4xl">
                    <TruncatedText
                      text={job.description}
                      maxWords={50}
                      className="text-sm text-[#4B5563] leading-relaxed"
                    />
                  </div>
                </div>

                {/* Skills in Job Post (raw tags) */}
                {job.skillsInJobPost && job.skillsInJobPost.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-[#1F2937] mb-4">
                      Skills Mentioned
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skillsInJobPost.map((skill: string, idx: number) => (
                        <CustomBadge key={`${skill}-${idx}`}>
                          {skill}
                        </CustomBadge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Required Skills */}
                {job.requiredSkills && job.requiredSkills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-[#1F2937] mb-4">
                      Required Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills.map((skill, index) => (
                        <CustomBadge key={index}>
                          {typeof skill === "string" ? skill : skill.name}
                          {typeof skill === "object" && skill.level && (
                            <span className="ml-1 text-xs">
                              ({skill.level})
                            </span>
                          )}
                        </CustomBadge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Qualifications */}
                {job.educationQualifications &&
                  job.educationQualifications.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#1F2937] mb-4">
                        Qualifications
                      </h3>
                      <ul className="space-y-2 text-sm text-[#4B5563]">
                        {job.educationQualifications.map(
                          (requirement, index) => (
                            <li key={index} className="flex items-start">
                              <span className="inline-block w-1.5 h-1.5 bg-[#6B7280] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              {requirement}
                            </li>
                          )
                        )}
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

                {/* Mandatory Certificates */}
                {job.mandatoryCertificates &&
                  job.mandatoryCertificates.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#1F2937] mb-4">
                        Mandatory Certificates
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {job.mandatoryCertificates.map((cert, idx) => (
                          <CustomBadge key={`${cert}-${idx}`}>
                            {cert}
                          </CustomBadge>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Benefits */}
                {job.benefits && job.benefits.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-[#1F2937] mb-4">
                      Benefits
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-[#4B5563]">
                      {job.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="inline-block w-1.5 h-1.5 bg-[#6B7280] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Work Schedule moved to right facts card */}
              </div>

              {/* Secondary column: About company and additional meta (no duplicates) */}
              <div className="space-y-6 sm:space-y-8 border-t lg:border-t-0 mt-6 sm:mt-8 lg:mt-0 pt-6 sm:pt-8 lg:pt-0 lg:-ml-10">
                <div className="lg:border-l border-gray-200 lg:pl-10">
                  <h2 className="text-base sm:text-lg font-semibold text-[#1F2937] mb-3">
                    About Company
                  </h2>
                  <div className="space-y-4 text-justify text-sm text-[#4B5563] leading-relaxed">
                    <TruncatedText
                      text={job.companyDescription}
                      maxWords={50}
                      className="text-sm text-[#4B5563] leading-relaxed"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 p-4 sm:p-5 bg-white lg:ml-10">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-[#A1A1A1]">Status</div>
                      <div
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium mt-1 ${
                          job.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {job.jobStatus || (job.isActive ? "Open" : "Closed")}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#A1A1A1]">FAT Included</div>
                      <div className="font-medium text-[#32343A]">
                        {typeof job.fatIncluded === "boolean"
                          ? job.fatIncluded
                            ? "Yes"
                            : "No"
                          : "—"}
                      </div>
                    </div>
                    {(() => {
                      const coords = formatCoords(
                        (job as any).location?.coordinates
                      );
                      return coords ? (
                        <div className="col-span-2">
                          <div className="text-[#A1A1A1]">Coordinates</div>
                          <div className="font-medium text-[#32343A]">
                            {coords}
                          </div>
                        </div>
                      ) : null;
                    })()}
                    {job.workSchedule && (
                      <div className="col-span-2 grid grid-cols-2 gap-3">
                        {job.workSchedule?.startDate && (
                          <div>
                            <div className="text-[#A1A1A1]">Start</div>
                            <div className="font-medium text-[#32343A]">
                              {formatDate(String(job.workSchedule.startDate))}
                            </div>
                          </div>
                        )}
                        {job.workSchedule?.endDate && (
                          <div>
                            <div className="text-[#A1A1A1]">End</div>
                            <div className="font-medium text-[#32343A]">
                              {formatDate(String(job.workSchedule.endDate))}
                            </div>
                          </div>
                        )}
                        {job.workSchedule?.hoursPerWeek && (
                          <div>
                            <div className="text-[#A1A1A1]">Hours/Week</div>
                            <div className="font-medium text-[#32343A]">
                              {job.workSchedule.hoursPerWeek}
                            </div>
                          </div>
                        )}
                        {job.workSchedule?.flexibility && (
                          <div className="col-span-2">
                            <div className="text-[#A1A1A1]">Flexibility</div>
                            <div className="font-medium text-[#32343A]">
                              {job.workSchedule.flexibility}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div>
                      <div className="text-[#A1A1A1]">Custom Questions</div>
                      <div className="font-medium text-[#32343A]">
                        {Array.isArray(job.customQuestions)
                          ? job.customQuestions.length
                          : 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#A1A1A1]">Users Applied</div>
                      <div className="font-medium text-[#32343A]">
                        {Array.isArray(job.usersApplied)
                          ? job.usersApplied.length
                          : job.totalApplications || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll to Top Button */}
        <CustomButton
          variant="secondary"
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg p-0"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
        </CustomButton>
      </div>

      <ApplicationPopup
        isOpen={showApplicationPopup}
        onClose={handleCloseApplicationPopup}
        onSubmit={handleApplicationSubmit} // This calls your actual API
        job={job}
      />

      <SuccessPopup
        isOpen={showSuccessPopup}
        onClose={handleCloseSuccessPopup}
      />
    </div>
  );
}

// Wrapper component for Suspense
export default function JobListingPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <JobListingContent />
    </Suspense>
  );
}
