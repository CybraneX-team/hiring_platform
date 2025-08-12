"use client";

import { useState, useRef, useEffect } from "react";
import { Star, Upload, Calendar, Plus, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "education", label: "Education" },
  { id: "experiences", label: "Experiences" },
  { id: "certifications", label: "Certifications" },
  { id: "schedule", label: "Schedule" },
  { id: "applications", label: "Applications" },
];

const profileData = {
  profile: {
    bio: "Experienced software developer with a passion for creating innovative solutions. Specialized in full-stack development with expertise in React, Node.js, and cloud technologies.",
    skills: ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker"],
    languages: ["English (Native)", "Spanish (Intermediate)", "French (Basic)"],
  },
  education: [
    {
      type: "Graduation",
      period: "2022-2024",
      institution: "University of Michigan",
    },
    {
      type: "Highschool",
      period: "2019-2021",
      institution: "Inter State school of Michigan",
    },
  ],
  experiences: [
    {
      title: "Senior Software Engineer",
      company: "Tech Solutions Inc.",
      period: "2023-Present",
      description:
        "Lead development of scalable web applications using React and Node.js",
    },
    {
      title: "Full Stack Developer",
      company: "Digital Innovations LLC",
      period: "2021-2023",
      description:
        "Developed and maintained multiple client projects using modern web technologies",
    },
  ],
  certifications: [
    {
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
};

// Animation variants
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
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
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
            {/* Company Logo and Identity Section */}
            <div className="bg-white rounded-lg p-4 sm:p-6 lg:px-8 space-y-4 sm:space-y-6">
              <motion.div
                variants={itemVariants}
                className="text-center py-4 sm:py-8"
              >
                <h3 className="text-xs sm:text-sm text-[#A1A1A1] font-medium mb-4 sm:mb-6">
                  Company Logo and Identity According to legal Documentation
                </h3>

                <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black flex items-center justify-center"
                  >
                    <span className="text-white font-bold text-lg sm:text-xl">
                      Z
                    </span>
                  </motion.div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Riverleaf.Inc
                  </h2>
                </div>
              </motion.div>

              {/* Company Description */}
              <motion.div
                variants={itemVariants}
                className="space-y-3 sm:space-y-4"
              >
                <h3 className="text-xs sm:text-sm font-medium text-[#A1A1A1]">
                  Company description
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed border border-[#A6ACA6] p-3 sm:p-4 rounded-lg">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Aenean commodo ligula eget dolor. Aenean massa. Cum sociis
                  natoque penatibus et magnis dis parturient montes, nascetur
                  ridiculus mus. Donec quam felis, ultricies nec, pellentesque
                  eu, pretium quis, sem. Nulla consequat massa quis enim. Donec
                  pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.
                </p>
              </motion.div>

              {/* Number of People */}
              <motion.div
                variants={itemVariants}
                className="space-y-3 mt-6 sm:mt-10 pb-6 sm:pb-10"
              >
                <h3 className="text-xs sm:text-sm font-medium text-[#A1A1A1]">
                  No of People in Organization
                </h3>
                <div className="text-lg sm:text-xl max-w-full sm:max-w-sm font-semibold text-gray-900 border border-[#A6ACA6] p-3 sm:p-4 rounded-lg">
                  12 - 600
                </div>
              </motion.div>
            </div>

            {/* Location */}
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
                  value="USA, Michigan"
                  readOnly
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-xs sm:text-sm"
                />

                {/* World Map */}
                <div className="relative bg-gray-900 rounded-lg overflow-hidden h-48 sm:h-64">
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-gray-900">
                    {/* Simplified world map representation */}
                    <svg viewBox="0 0 400 200" className="w-full h-full">
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

                    {/* Location marker for Michigan */}
                    <div className="absolute top-12 sm:top-16 left-16 sm:left-20 w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                  </div>

                  {/* Map controls */}
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
                key={index}
                variants={cardVariants}
                whileHover={{
                  y: -4,
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-white rounded-xl p-4 sm:p-5 shadow-sm"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
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
                key={index}
                variants={cardVariants}
                whileHover={{
                  y: -4,
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-white rounded-xl p-4 sm:p-5 shadow-sm"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
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
            {profileData.certifications.length > 0 ? (
              profileData.certifications.map((cert, index) => (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  whileHover={{
                    y: -4,
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-3 sm:space-y-4 bg-white rounded-xl p-4 sm:p-5 shadow-sm"
                >
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                    {cert.name}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {cert.issuer}
                  </p>
                  <p className="text-gray-500 text-sm sm:text-base">
                    Issued: {cert.date}
                  </p>
                </motion.div>
              ))
            ) : (
              <motion.div
                variants={itemVariants}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-center py-12 sm:py-16"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4 sm:mb-6" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="text-lg sm:text-xl font-semibold text-gray-900 mb-3"
                >
                  No certificates uploaded
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 px-4"
                >
                  Upload your certificates to showcase your qualifications
                </motion.p>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-full transition-colors text-sm sm:text-base"
                >
                  Upload Certificate
                </motion.button>
              </motion.div>
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
          ></motion.div>
        );

      case "applications":
        return (
          <motion.div
            key="applications"
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

              {/* Job Role Cards */}
              {profileData.applications.map((application, index) => (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white rounded-lg p-4 sm:p-6 min-h-[200px] sm:min-h-[250px] flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {application.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                      {application.applicants} Applicants
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <span className="text-xs text-gray-400 order-2 sm:order-1">
                      {application.date}
                    </span>
                    <Link href="/company/applications">
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

      default:
        return null;
    }
  };
  const router = useRouter();

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
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-16 gap-4 sm:gap-6"
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
                  Riverleaf.Inc
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
                className="rounded-full px-4 sm:px-6 py-1.5 sm:py-2 border border-[#12372B] text-gray-700 bg-transparent hover:bg-gray-50 transition-colors text-sm sm:text-base whitespace-nowrap"
              >
                Edit Profile
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
