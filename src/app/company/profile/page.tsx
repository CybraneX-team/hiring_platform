"use client";

import { useState, useRef, useEffect } from "react";
import { Star, Plus, ArrowLeft, X, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ResumeManager from "../../components/Company/ResumeManager";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/app/context/UserContext";

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "jobs", label: "Jobs" },
  { id: "resumes", label: "Resume Management" },
];

const profileData = {
  profile: {
    bio: "Experienced software developer with a passion for creating innovative solutions. Specialized in full-stack development with expertise in React, Node.js, and cloud technologies.",
    skills: ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker"],
    languages: ["English (Native)", "Spanish (Intermediate)", "French (Basic)"],
  },
  jobs: [
    {
      title: "Senior Research and Development Specialist",
      applicants: 63,
      date: "23 Jan 2025",
    },
    {
      title: "UX Researcher",
      applicants: 25,
      date: "23 Jan 2025",
    },
    {
      title: "UI designer",
      applicants: 243,
      date: "23 Jan 2025",
    },
    {
      title: "Music Director",
      applicants: 523,
      date: "23 Jan 2025",
    },
    {
      title: "Role for SDE - 2",
      applicants: 645,
      date: "23 Jan 2025",
    },
  ],
  applications: [
    {
      title: "Senior Research and Development Specialist",
      applicants: 63,
      date: "23 Jan 2025",
    },
    {
      title: "UX Researcher",
      applicants: 25,
      date: "23 Jan 2025",
    },
    {
      title: "UI designer",
      applicants: 243,
      date: "23 Jan 2025",
    },
    {
      title: "Music Director",
      applicants: 523,
      date: "23 Jan 2025",
    },
    {
      title: "Role for SDE - 2",
      applicants: 645,
      date: "23 Jan 2025",
    },
  ],
  resumes: [
    // Placeholder for resumes data
  ],
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
};

const skillVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
  },
};

export default function ProfileTab() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [orgSize, setOrgSize] = useState("");
  const [locationText, setLocationText] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  const [isLogoUploadOpen, setIsLogoUploadOpen] = useState(false);
  const [formState, setFormState] = useState({
    companyName: "",
    companyDescription: "",
    orgSize: "",
    locationText: "",
  });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter(); // Declare the router variable here

  useEffect(() => {
    const hasShownToast = localStorage.getItem("profileToastShown");
    const isProfileEmpty =
      !companyName && !companyDescription && !orgSize && !locationText;

    if (!hasShownToast && isProfileEmpty) {
      toast({
        title: "Complete Your Profile",
        description: "Please complete your profile to get started.",
        duration: 5000,
      });
      localStorage.setItem("profileToastShown", "true");
    }
  }, [toast, companyName, companyDescription, orgSize, locationText]);

  const isProfileComplete = () => {
    return companyName && companyDescription && orgSize && locationText;
  };
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState<any>(null);

  const { user } = useUser(); // Get user from context

  // Add this useEffect for authentication check
  useEffect(() => {
    // Check if user is not logged in or not signed up as company
    if (!user) {
      // User is not logged in at all
      router.push("/profile");
      return;
    }

    // Check if user is not signed up as a company
    if (user.signedUpAs !== "Company") {
      // User is logged in but not as a company
      router.push("/profile");
      return;
    }
  }, [user, router]);

  // Add this function inside your component
  const fetchApplications = async () => {
    if (!user?.id) {
      setApplicationsError("User not found");
      return;
    }

    setApplicationsLoading(true);
    setApplicationsError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FIREBASE_API_URL}/api/jobs/getAllJobsByCompany?userId=${user.id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const data = await response.json();
      setApplications(data.jobs || []);
    } catch (error: any) {
      console.error("Error fetching applications:", error);
      setApplicationsError(error.message || "Failed to fetch applications");
    } finally {
      setApplicationsLoading(false);
    }
  };

  // Add useEffect to fetch data when component mounts or user changes
  useEffect(() => {
    if (user?.id && activeTab === "jobs") {
      fetchApplications();
    }
  }, [user?.id, activeTab]);

  useEffect(() => {
    const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
    const activeTabElement = tabsRef.current[activeIndex];

    if (activeTabElement) {
      setIndicatorStyle({
        left: activeTabElement.offsetLeft,
        width: activeTabElement.offsetWidth,
      });
    }
  }, [activeTab]);

  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCompanyLogo(e.target?.result as string);
        setIsLogoUploadOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setCompanyLogo("");
    setIsLogoUploadOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const renderCompanyLogo = (size: string) => {
    const sizeClasses =
      size === "large"
        ? "w-12 h-12 sm:w-16 sm:h-16"
        : "w-12 h-12 sm:w-16 sm:h-16";

    if (companyLogo) {
      return (
        <div
          className={`${sizeClasses} flex items-center justify-center relative group`}
        >
          <img
            src={companyLogo}
            alt="Company Logo"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    }

    return (
      <div
        className={`${sizeClasses} rounded-full bg-black flex items-center justify-center flex-shrink-0`}
      >
        <span className="text-white font-bold text-lg sm:text-xl">
          {companyName?.charAt(0) || "?"}
        </span>
      </div>
    );
  };

  const renderStars = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.div
            key={star}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <Star
              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                star <= 3
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-300 text-gray-300"
              }`}
            />
          </motion.div>
        ))}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <motion.div
            key="profile"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-6 sm:space-y-8 text-black p-4 sm:p-6 lg:px-8"
          >
            <div className="bg-white rounded-lg p-4 sm:p-6 lg:px-8 space-y-4 sm:space-y-6">
              <motion.div
                variants={itemVariants}
                className="text-center py-4 sm:py-8"
              >
                <h3 className="text-xs sm:text-sm text-[#A1A1A1] font-medium mb-4 sm:mb-6">
                  Company Logo and Identity According to legal Documentation
                </h3>

                <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                  <div className="relative">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      {renderCompanyLogo("large")}
                    </motion.div>

                    {/* Pencil Icon */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsLogoUploadOpen(true)}
                      className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-5 sm:h-5 p-1 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                    >
                      <Pencil className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </motion.button>
                  </div>

                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 truncate">
                    {formState.companyName || companyName || "Company Name"}
                  </h2>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="space-y-3 sm:space-y-4"
              >
                <h3 className="text-xs sm:text-sm font-medium text-[#A1A1A1]">
                  Company description
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed border border-[#A6ACA6] p-3 sm:p-4 rounded-lg">
                  {companyDescription || "Enter company description..."}
                </p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="space-y-3 mt-6 sm:mt-10 pb-6 sm:pb-10"
              >
                <h3 className="text-xs sm:text-sm font-medium text-[#A1A1A1]">
                  No of People in Organization
                </h3>
                <div className="text-lg sm:text-xl max-w-full sm:max-w-sm font-semibold text-gray-900 border border-[#A6ACA6] p-3 sm:p-4 rounded-lg">
                  {orgSize || "Enter team size"}
                </div>
              </motion.div>
            </div>

            <motion.div
              variants={itemVariants}
              className="space-y-3 sm:space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <h3 className="text-sm sm:text-base font-medium text-gray-700">
                  Location
                </h3>
                <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-full hover:bg-gray-50 transition-colors self-start sm:self-auto">
                  Map
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <input
                  type="text"
                  value={locationText}
                  placeholder="Enter location..."
                  readOnly
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-xs sm:text-sm"
                />

                <div className="relative bg-gray-900 rounded-lg overflow-hidden h-48 sm:h-64">
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-gray-900">
                    <svg
                      className="w-full h-full"
                      viewBox="0 0 400 200"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* North America */}
                      <path
                        d="M50 60 Q80 40 120 50 L140 80 Q100 100 60 90 Z"
                        fill="#4ade80"
                        opacity="0.8"
                      />
                      {/* Europe */}
                      <path
                        d="M160 45 Q180 35 200 45 L210 65 Q190 75 170 65 Z"
                        fill="#4ade80"
                        opacity="0.8"
                      />
                      {/* Asia */}
                      <path
                        d="M220 40 Q280 30 320 50 L340 80 Q300 90 240 75 Z"
                        fill="#4ade80"
                        opacity="0.8"
                      />
                      {/* Africa */}
                      <path
                        d="M170 80 Q190 70 210 85 L220 130 Q200 140 180 125 Z"
                        fill="#4ade80"
                        opacity="0.8"
                      />
                      {/* Australia */}
                      <path
                        d="M280 130 Q300 125 320 135 L325 150 Q305 155 285 145 Z"
                        fill="#4ade80"
                        opacity="0.8"
                      />
                      {/* South America */}
                      <path
                        d="M80 110 Q100 105 115 120 L120 160 Q100 170 85 155 Z"
                        fill="#4ade80"
                        opacity="0.8"
                      />
                    </svg>
                  </div>
                  <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 flex gap-1 sm:gap-2">
                    <button className="px-2 sm:px-3 py-1 bg-gray-800 text-white text-xs rounded-full border border-gray-600 hover:bg-gray-700 transition-colors">
                      Auto Detect
                    </button>
                    <button className="px-2 sm:px-3 py-1 bg-gray-700 text-white text-xs rounded-full hover:bg-gray-600 transition-colors">
                      Drop Pin
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );

      case "jobs":
        return (
          <motion.div
            key="jobs"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-6 sm:space-y-8"
          >
            {/* Applications Grid */}
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
            >
              {/* Create New Post Card */}
              <motion.div
                variants={cardVariants}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-white rounded-lg p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[200px] sm:min-h-[250px] cursor-pointer"
                onClick={() => (window.location.href = "/company/new-role")}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 sm:mb-4"
                >
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </motion.div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Create a New Post
                </h3>
              </motion.div>

              {/* Loading State */}
              {applicationsLoading && (
                <motion.div
                  variants={cardVariants}
                  className="bg-white rounded-lg p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[200px] sm:min-h-[250px]"
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600">Loading jobs...</p>
                </motion.div>
              )}

              {/* Error State */}
              {applicationsError && !applicationsLoading && (
                <motion.div
                  variants={cardVariants}
                  className="bg-white rounded-lg p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[200px] sm:min-h-[250px]"
                >
                  <div className="text-red-500 mb-4">⚠️</div>
                  <p className="text-red-600 text-sm">{applicationsError}</p>
                  <button
                    onClick={fetchApplications}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}

              {/* No Jobs State */}
              {!applicationsLoading &&
                !applicationsError &&
                applications.length === 0 && (
                  <motion.div
                    variants={cardVariants}
                    className="bg-white rounded-lg p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[200px] sm:min-h-[250px]"
                  >
                    <div className="text-gray-400 mb-4">📝</div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                      No Job Posts Yet
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Create your first job posting to get started!
                    </p>
                  </motion.div>
                )}

              {/* Actual Job Applications */}
              {!applicationsLoading &&
                !applicationsError &&
                applications.length > 0 &&
                applications.map((job: any, index: number) => (
                  <motion.div
                    key={job._id || index}
                    variants={cardVariants}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="bg-white rounded-lg p-4 sm:p-6 min-h-[200px] sm:min-h-[250px] flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {job.title || "Untitled Job"}
                      </h3>

                      <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                        0 Applicants{" "}
                        {/* Since applicants count is not in your response */}
                      </p>

                      {/* Job Type */}
                      {job.jobType && (
                        <div className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mb-2">
                          {job.jobType}
                        </div>
                      )}

                      {/* Job Details */}
                      <div className="space-y-1 mb-3">
                        {job.salaryRange?.currency && (
                          <p className="text-xs text-gray-400">
                            💰 {job.salaryRange.currency}
                          </p>
                        )}

                        {job.requiredSkills &&
                          job.requiredSkills.length > 0 && (
                            <p className="text-xs text-gray-400">
                              🛠️ {job.requiredSkills.length} Skills Required
                            </p>
                          )}

                        {job.isActive !== undefined && (
                          <p className="text-xs text-gray-400">
                            📊 Status: {job.isActive ? "Active" : "Inactive"}
                          </p>
                        )}
                      </div>

                      {/* Job Description (truncated) */}
                      {job.description && (
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {job.description
                            .replace(/\n/g, " ")
                            .substring(0, 100)}
                          {job.description.length > 100 ? "..." : ""}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mt-auto">
                      <span className="text-xs text-gray-400 order-2 sm:order-1">
                        {job.postedDate
                          ? new Date(job.postedDate).toLocaleDateString(
                              "en-US",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "No date"}
                      </span>
                      <Link href={`/company/applications?jobId=${job._id}`}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#76FF82] hover:bg-green-400 text-black text-xs sm:text-sm rounded-full transition-colors order-1 sm:order-2 self-start sm:self-auto"
                        >
                          View Applications
                        </motion.button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
            </motion.div>
          </motion.div>
        );

      case "resumes":
        return (
          <motion.div
            key="resumes"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full"
          >
            <ResumeManager />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-4 sm:top-8 left-4 sm:left-8"
      >
        <h1 className="text-base sm:text-lg font-semibold text-gray-900">
          Logo
        </h1>
      </motion.div>

      <div className="pt-16 sm:pt-24 pb-8 sm:pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <motion.button
            variants={itemVariants}
            onClick={() => router.back()}
            className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 rounded-full text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors mb-6 sm:mb-10"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            Back
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12 gap-4 sm:gap-6"
          >
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderCompanyLogo("large")}
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsLogoUploadOpen(true)}
                  className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-5 sm:h-5 bg-blue-600 p-1 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                >
                  <Pencil className="w-3 h-3 sm:w-3 sm:h-3 text-white" />
                </motion.button>
              </div>

              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1 truncate">
                  {formState.companyName || companyName || "Company Name"}
                </h2>
                <p className="text-gray-500 text-sm sm:text-base">
                  {formState.locationText || locationText || "Location"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8">
              {renderStars()}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveTab("profile");
                  setFormState({
                    companyName: companyName || "",
                    companyDescription: companyDescription || "",
                    orgSize: orgSize || "",
                    locationText: locationText || "",
                  });
                  setIsEditOpen(true);
                }}
                className="rounded-full px-4 sm:px-6 py-1.5 sm:py-2 border border-[#12372B] text-gray-700 bg-transparent hover:bg-gray-50 transition-colors text-sm sm:text-base whitespace-nowrap"
              >
                {isProfileComplete() ? "Edit Profile" : "Add Profile"}
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative mb-8 sm:mb-12"
          >
            <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide justify-center">
              {tabs.map((tab, index) => (
                <motion.button
                  key={tab.id}
                  ref={(el) => {
                    tabsRef.current[index] = el;
                  }}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  className={`px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-colors relative whitespace-nowrap flex-shrink-0 mx-5 ${
                    activeTab === tab.id
                      ? "text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </motion.button>
              ))}
            </div>

            <motion.div
              className="absolute bottom-0 h-0.5 bg-blue-600 "
              animate={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </motion.div>

          <div className="min-h-[300px] sm:min-h-[400px]">
            <AnimatePresence mode="wait">{renderTabContent()}</AnimatePresence>
          </div>
        </div>
      </div>

      {/* Logo Upload Modal */}
      <AnimatePresence>
        {isLogoUploadOpen && (
          <motion.div
            key="logo-upload-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-modal="true"
            role="dialog"
            aria-labelledby="logo-upload-title"
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogoUploadOpen(false)}
            />

            {/* Dialog */}
            <motion.div
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  id="logo-upload-title"
                  className="text-lg font-semibold text-gray-900"
                >
                  Company Logo
                </h2>
                <button
                  onClick={() => setIsLogoUploadOpen(false)}
                  aria-label="Close"
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                    {companyLogo ? (
                      <img
                        src={companyLogo}
                        alt="Company Logo Preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">No logo</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                  >
                    Upload Logo
                  </motion.button>

                  {companyLogo && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRemoveLogo}
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                    >
                      Remove Logo
                    </motion.button>
                  )}
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Supported formats: JPG, PNG, SVG. Max size: 5MB
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditOpen && (
          <motion.div
            key="edit-profile-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-modal="true"
            role="dialog"
            aria-labelledby="edit-profile-title"
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditOpen(false)}
            />

            {/* Dialog */}
            <motion.div
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg sm:max-w-xl p-5 sm:p-6 text-gray-500"
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2
                  id="edit-profile-title"
                  className="text-lg sm:text-xl font-semibold text-gray-900 text-balance"
                >
                  Edit Company Profile
                </h2>
                <button
                  onClick={() => setIsEditOpen(false)}
                  aria-label="Close"
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formState.companyName}
                    onChange={(e) =>
                      setFormState((s) => ({
                        ...s,
                        companyName: e.target.value,
                      }))
                    }
                    placeholder="e.g., Riverleaf Inc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Company Description
                  </label>
                  <textarea
                    value={formState.companyDescription}
                    onChange={(e) =>
                      setFormState((s) => ({
                        ...s,
                        companyDescription: e.target.value,
                      }))
                    }
                    placeholder="Describe your company..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    No. of People in Organization
                  </label>
                  <input
                    type="text"
                    value={formState.orgSize}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, orgSize: e.target.value }))
                    }
                    placeholder="e.g., 12 - 600"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formState.locationText}
                    onChange={(e) =>
                      setFormState((s) => ({
                        ...s,
                        locationText: e.target.value,
                      }))
                    }
                    placeholder="e.g., USA, Michigan"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-5 sm:mt-6 flex items-center justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-full border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  onClick={() => {
                    setCompanyName(formState.companyName.trim());
                    setCompanyDescription(formState.companyDescription.trim());
                    setOrgSize(formState.orgSize.trim());
                    setLocationText(formState.locationText.trim());
                    setIsEditOpen(false);
                  }}
                >
                  Save
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
