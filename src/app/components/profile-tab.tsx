"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import {
  Star,
  Upload,
  GraduationCap,
  Briefcase,
  X,
  ArrowLeft,
  Edit2,
  Search,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CalendarSection from "./calender";
import { useRouter } from "next/navigation";
import ResumeUpload from "./ResumeUpload";
import JobMatching from "./JobMatching";

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "education", label: "Education" },
  { id: "experiences", label: "Experiences" },
  { id: "certifications", label: "Certifications" },
  { id: "schedule", label: "Schedule" },
  { id: "resume", label: "Resume & Jobs" },
];

const initialProfileData = {
  profile: {
    bio: "Experienced software developer with a passion for creating innovative solutions. Specialized in full-stack development with expertise in React, Node.js, and cloud technologies.",
    skills: ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker"],
    languages: ["English (Native)", "Spanish (Intermediate)", "French (Basic)"],
  },
  education: [
    {
      id: 1,
      type: "Graduation",
      period: "2022-2024",
      institution: "University of Michigan",
    },
    {
      id: 2,
      type: "Highschool",
      period: "2019-2021",
      institution: "Inter State school of Michigan",
    },
  ],
  experiences: [
    {
      id: 1,
      title: "Senior Software Engineer",
      company: "Tech Solutions Inc.",
      period: "2023-Present",
      description:
        "Lead development of scalable web applications using React and Node.js",
    },
    {
      id: 2,
      title: "Full Stack Developer",
      company: "Digital Innovations LLC",
      period: "2021-2023",
      description:
        "Developed and maintained multiple client projects using modern web technologies",
    },
  ],
  certifications: [
    {
      id: 1,
      name: "Certified Kubernetes Administrator",
      issuer: "Cloud Native Computing Foundation",
      date: "March 2023",
    },
  ],
  schedule: {
    availability: "Monday - Friday, 9:00 AM - 6:00 PM EST",
    timezone: "Eastern Standard Time",
    preferredMeetingTimes: ["10:00 AM - 12:00 PM", "2:00 PM - 4:00 PM"],
  },
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
  const [activeTab, setActiveTab] = useState("resume");
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<
    "education" | "experience" | "certificate" | null
  >(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(initialProfileData);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [showJobMatching, setShowJobMatching] = useState(false);
  const [userId] = useState("user123"); // In a real app, this would come from authentication
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

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

  const renderAddCard = (
    title: string,
    description: string,
    buttonText: string,
    icon: React.ReactNode,
    type: "education" | "experience" | "certificate"
  ) => {
    return (
      <motion.div
        variants={cardVariants}
        whileHover={{
          y: -4,
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white rounded-xl p-6 sm:p-8 shadow-sm text-center border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-4"
        >
          {icon}
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-lg sm:text-xl font-semibold text-gray-900 mb-3"
        >
          {title}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-gray-600 text-sm sm:text-base mb-6"
        >
          {description}
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => openModal(type)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-full transition-colors text-sm sm:text-base"
        >
          {buttonText}
        </motion.button>
      </motion.div>
    );
  };

  const openEditModal = (
    type: "education" | "experience" | "certificate",
    item: any
  ) => {
    setModalType(type);
    setEditingItem(item);
    setIsEditMode(true);
    setFormData(item);
    setIsModalOpen(true);
  };

  const openModal = (type: "education" | "experience" | "certificate") => {
    setModalType(type);
    setEditingItem(null);
    setIsEditMode(false);
    setFormData({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setEditingItem(null);
    setIsEditMode(false);
    setFormData({});
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditMode && editingItem && modalType) {
      setProfileData((prev) => ({
        ...prev,
        [modalType === "certificate"
          ? "certifications"
          : modalType === "education"
          ? "education"
          : "experiences"]: prev[
          modalType === "certificate"
            ? "certifications"
            : modalType === "education"
            ? "education"
            : "experiences"
        ].map((item: any) =>
          item.id === editingItem.id ? { ...item, ...formData } : item
        ),
      }));
    } else if (modalType) {
      const newItem = {
        ...formData,
        id: Date.now(),
      };

      setProfileData((prev) => ({
        ...prev,
        [modalType === "certificate"
          ? "certifications"
          : modalType === "education"
          ? "education"
          : "experiences"]: [
          ...prev[
            modalType === "certificate"
              ? "certifications"
              : modalType === "education"
              ? "education"
              : "experiences"
          ],
          newItem,
        ],
      }));
    }

    closeModal();
  };

  const renderModal = () => {
    if (!isModalOpen || !modalType) return null;

    const modalContent = {
      education: {
        title: isEditMode ? "Edit Education" : "Add Education",
        fields: [
          {
            name: "type",
            label: "Degree Type",
            placeholder: "e.g., Bachelor's, Master's",
          },
          {
            name: "institution",
            label: "Institution",
            placeholder: "University name",
          },
          { name: "period", label: "Period", placeholder: "e.g., 2020-2024" },
          {
            name: "description",
            label: "Description (Optional)",
            placeholder: "Additional details",
            type: "textarea",
          },
        ],
      },
      experience: {
        title: isEditMode ? "Edit Experience" : "Add Experience",
        fields: [
          {
            name: "title",
            label: "Job Title",
            placeholder: "e.g., Senior Software Engineer",
          },
          { name: "company", label: "Company", placeholder: "Company name" },
          {
            name: "period",
            label: "Period",
            placeholder: "e.g., 2023-Present",
          },
          {
            name: "description",
            label: "Description",
            placeholder: "Describe your role and achievements",
            type: "textarea",
          },
        ],
      },
      certificate: {
        title: isEditMode ? "Edit Certificate" : "Add Certificate",
        fields: [
          {
            name: "name",
            label: "Certificate Name",
            placeholder: "e.g., AWS Solutions Architect",
          },
          {
            name: "issuer",
            label: "Issuing Organization",
            placeholder: "e.g., Amazon Web Services",
          },
          {
            name: "date",
            label: "Issue Date",
            placeholder: "e.g., March 2023",
          },
          {
            name: "description",
            label: "Description (Optional)",
            placeholder: "Additional details",
            type: "textarea",
          },
        ],
      },
    };

    const config = modalContent[modalType];

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-[#00000035] bg-opacity-10 flex items-center justify-center z-50 p-4 text-black"
          onClick={closeModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                {config.title}
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </motion.button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {config.fields.map((field, index) => (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      placeholder={field.placeholder}
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        handleInputChange(field.name, e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none h-20 sm:h-24 text-sm sm:text-base"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        handleInputChange(field.name, e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                    />
                  )}
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: config.fields.length * 0.1,
                  duration: 0.3,
                }}
                className="flex flex-col sm:flex-row gap-3 pt-4"
              >
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  {isEditMode
                    ? "Save Changes"
                    : `Add ${
                        modalType === "certificate"
                          ? "Certificate"
                          : modalType === "education"
                          ? "Education"
                          : "Experience"
                      }`}
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      </AnimatePresence>
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
            className="space-y-8 sm:space-y-12 text-black"
          >
            <motion.div
              variants={itemVariants}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-black">
                About
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                {profileData.profile.bio}
              </p>
            </motion.div>
            <motion.div
              variants={itemVariants}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                Skills
              </h3>
              <motion.div
                className="flex flex-wrap gap-2 sm:gap-3"
                variants={containerVariants}
                transition={{ staggerChildren: 0.1 }}
              >
                {profileData.profile.skills.map((skill, index) => (
                  <motion.span
                    key={index}
                    variants={skillVariants}
                    whileHover={{ scale: 1.05, y: -2 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-medium cursor-default"
                  >
                    {skill}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
            <motion.div
              variants={itemVariants}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                Languages
              </h3>
              <motion.ul
                className="space-y-2 sm:space-y-3"
                variants={containerVariants}
                transition={{ staggerChildren: 0.1 }}
              >
                {profileData.profile.languages.map((language, index) => (
                  <motion.li
                    key={index}
                    variants={itemVariants}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="text-gray-600 text-sm sm:text-base"
                  >
                    {language}
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </motion.div>
        );

      case "education":
        return (
          <motion.div
            key="education"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-4 sm:space-y-5"
          >
            {profileData.education.map((edu, index) => (
              <motion.div
                key={edu.id}
                variants={cardVariants}
                whileHover={{
                  y: -4,
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-white rounded-xl p-4 sm:p-5 shadow-sm relative group"
              >
                <motion.button
                  onClick={() => openEditModal("education", edu)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </motion.button>

                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 pr-10">
                  {edu.type}
                </h3>
                <p className="text-gray-500 text-sm sm:text-base mb-3 sm:mb-4">
                  {edu.period}
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  {edu.institution}
                </p>
              </motion.div>
            ))}

            {renderAddCard(
              "Add Education",
              "Add your educational background to showcase your qualifications",
              "Add Education",
              <GraduationCap className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto" />,
              "education"
            )}
          </motion.div>
        );

      case "experiences":
        return (
          <motion.div
            key="experiences"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-4 sm:space-y-5"
          >
            {profileData.experiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                variants={cardVariants}
                whileHover={{
                  y: -4,
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-white rounded-xl p-4 sm:p-5 shadow-sm relative group"
              >
                <motion.button
                  onClick={() => openEditModal("experience", exp)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </motion.button>

                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 pr-10">
                  {exp.title}
                </h3>
                <p className="text-blue-600 font-medium text-sm sm:text-base mb-2">
                  {exp.company}
                </p>
                <p className="text-gray-500 text-sm sm:text-base mb-3 sm:mb-4">
                  {exp.period}
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  {exp.description}
                </p>
              </motion.div>
            ))}

            {renderAddCard(
              "Add Experience",
              "Add your work experience to highlight your professional journey",
              "Add Experience",
              <Briefcase className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto" />,
              "experience"
            )}
          </motion.div>
        );

      case "certifications":
        return (
          <motion.div
            key="certifications"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-6 sm:space-y-8"
          >
            {profileData.certifications.map((cert, index) => (
              <motion.div
                key={cert.id}
                variants={cardVariants}
                whileHover={{
                  y: -4,
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-3 sm:space-y-4 bg-white rounded-xl p-4 sm:p-5 shadow-sm relative group"
              >
                <motion.button
                  onClick={() => openEditModal("certificate", cert)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </motion.button>

                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 pr-10">
                  {cert.name}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  {cert.issuer}
                </p>
                <p className="text-gray-500 text-sm sm:text-base">
                  Issued: {cert.date}
                </p>
              </motion.div>
            ))}

            {renderAddCard(
              "Add Certificate",
              "Upload your certificates to showcase your qualifications",
              "Add Certificate",
              <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto" />,
              "certificate"
            )}
          </motion.div>
        );

      case "schedule":
        return (
          <motion.div
            key="schedule"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full"
          >
            <CalendarSection />
          </motion.div>
        );

      case "resume":
        return (
          <motion.div
            key="resume"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-6"
          >
            {!showJobMatching ? (
              <div className="space-y-6">
                {/* Resume Upload Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Resume Management
                    </h3>
                    {currentResumeId && (
                      <button
                        onClick={() => setShowJobMatching(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Search className="w-4 h-4" />
                        Find Matching Jobs
                      </button>
                    )}
                  </div>

                  <ResumeUpload
                    userId={userId}
                    onUploadComplete={(data) => {
                      setCurrentResumeId(data.resumeId);
                    }}
                  />

                  {currentResumeId && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        <span className="text-green-800 font-medium">
                          Resume uploaded successfully!
                        </span>
                      </div>
                      <p className="text-green-700 text-sm mt-1">
                        You can now search for matching jobs using our
                        AI-powered matching system.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Job Matching Section */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    AI-Powered Job Matches
                  </h3>
                  <button
                    onClick={() => setShowJobMatching(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Resume
                  </button>
                </div>

                {currentResumeId && (
                  <JobMatching resumeId={currentResumeId} userId={userId} />
                )}
              </div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F5F5F5] overflow-x-hidden">
      {renderModal()}

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <motion.button
              onClick={() => router.back()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </motion.button>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12 gap-4 sm:gap-6"
          >
            <div className="flex items-center gap-4 sm:gap-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black flex items-center justify-center flex-shrink-0"
              >
                <span className="text-white font-bold text-lg sm:text-xl">
                  Z
                </span>
              </motion.div>

              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1 truncate">
                  Ryan Edgar
                </h2>
                <p className="text-gray-500 text-sm sm:text-base">
                  USA, Michigan
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8">
              {renderStars()}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab("resume")}
                className="rounded-full px-4 sm:px-6 py-1.5 sm:py-2 border border-[#12372B] text-gray-700 bg-transparent hover:bg-gray-50 transition-colors text-sm sm:text-base whitespace-nowrap"
              >
                Resume & Jobs
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative mb-8 sm:mb-12"
          >
            <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
              {tabs.map((tab, index) => (
                <motion.button
                  key={tab.id}
                  ref={(el) => {
                    tabsRef.current[index] = el;
                  }}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  className={`px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
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
              className="absolute bottom-0 h-0.5 bg-blue-600"
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
    </div>
  );
}
