"use client";

import { useState, useRef, useEffect } from "react";
import { Star, Upload, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "education", label: "Education" },
  { id: "experiences", label: "Experiences" },
  { id: "certifications", label: "Certifications" },
  { id: "schedule", label: "Schedule" },
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
  const [activeTab, setActiveTab] = useState("education");
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
              className={`w-5 h-5 ${
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
            className="space-y-12 text-black"
          >
            <motion.div
              variants={itemVariants}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <h3 className="text-xl font-semibold mb-4 text-black">About</h3>
              <p className="text-gray-600 leading-relaxed text-base">
                {profileData.profile.bio}
              </p>
            </motion.div>
            <motion.div
              variants={itemVariants}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <h3 className="text-xl font-semibold mb-4">Skills</h3>
              <motion.div
                className="flex flex-wrap gap-3"
                variants={containerVariants}
                transition={{ staggerChildren: 0.1 }}
              >
                {profileData.profile.skills.map((skill, index) => (
                  <motion.span
                    key={index}
                    variants={skillVariants}
                    whileHover={{ scale: 1.05, y: -2 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium cursor-default"
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
              <h3 className="text-xl font-semibold mb-4">Languages</h3>
              <motion.ul
                className="space-y-3"
                variants={containerVariants}
                transition={{ staggerChildren: 0.1 }}
              >
                {profileData.profile.languages.map((language, index) => (
                  <motion.li
                    key={index}
                    variants={itemVariants}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="text-gray-600 text-base"
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
            className="space-y-5"
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
                className="bg-white rounded-xl p-5 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {edu.type}
                </h3>
                <p className="text-gray-500 text-base mb-4">{edu.period}</p>
                <p className="text-gray-600 text-base">{edu.institution}</p>
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
            className="space-y-5"
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
                className="bg-white rounded-xl p-5 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {exp.title}
                </h3>
                <p className="text-blue-600 font-medium text-base mb-2">
                  {exp.company}
                </p>
                <p className="text-gray-500 text-base mb-4">{exp.period}</p>
                <p className="text-gray-600 text-base">{exp.description}</p>
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
            className="space-y-8"
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
                  className="space-y-4 bg-white rounded-xl p-5 shadow-sm"
                >
                  <h3 className="text-xl font-semibold text-gray-900">
                    {cert.name}
                  </h3>
                  <p className="text-gray-600 text-base">{cert.issuer}</p>
                  <p className="text-gray-500 text-base">Issued: {cert.date}</p>
                </motion.div>
              ))
            ) : (
              <motion.div
                variants={itemVariants}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-center py-16"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="text-xl font-semibold text-gray-900 mb-3"
                >
                  No certificates uploaded
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="text-gray-600 text-base mb-6"
                >
                  Upload your certificates to showcase your qualifications
                </motion.p>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-colors"
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
            className="space-y-12"
          >
            <motion.div
              variants={itemVariants}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Availability
              </h3>
              <p className="text-gray-600 text-base mb-2">
                {profileData.schedule.availability}
              </p>
              <p className="text-gray-500 text-base">
                Timezone: {profileData.schedule.timezone}
              </p>
            </motion.div>
            <motion.div
              variants={itemVariants}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Preferred Meeting Times
              </h3>
              <motion.ul
                className="space-y-3"
                variants={containerVariants}
                transition={{ staggerChildren: 0.1 }}
              >
                {profileData.schedule.preferredMeetingTimes.map(
                  (time, index) => (
                    <motion.li
                      key={index}
                      variants={itemVariants}
                      whileHover={{ x: 8 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="flex items-center gap-3 cursor-default"
                    >
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600 text-base">{time}</span>
                    </motion.li>
                  )
                )}
              </motion.ul>
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-8 left-8"
      >
        <h1 className="text-lg font-semibold text-gray-900">Logo</h1>
      </motion.div>

      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-between mb-16"
          >
            <div className="flex items-center gap-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="w-16 h-16 rounded-full bg-black flex items-center justify-center"
              >
                <span className="text-white font-bold text-xl">Z</span>
              </motion.div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                  Ryan Edgar
                </h2>
                <p className="text-gray-500 text-base">USA, Michigan</p>
              </div>
            </div>

            <div className="flex items-center gap-8">
              {renderStars()}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-full px-6 py-2 border border-[#12372B] text-gray-700 bg-transparent hover:bg-gray-50 transition-colors"
              >
                Edit Profile
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative mb-12"
          >
            <div className="flex border-b border-gray-200">
              {tabs.map((tab, index) => (
                <motion.button
                  key={tab.id}
                  ref={(el) => {
                    tabsRef.current[index] = el;
                  }}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  className={`px-6 py-4 text-base font-medium transition-colors relative ${
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

          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">{renderTabContent()}</AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
