"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Mail,
  MoreHorizontal,
  MapPin,
  Clock,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
const jobListings = [
  {
    id: 1,
    title: "Software Development Engineer",
    company: "Compscope",
    salary: "12-60$",
    salaryType: "Per/Hr",
    tags: ["Marketing", "Design", "Strategic Development"],
    description:
      "We are seeking a detail-oriented and proactive Payroll Specialist to support our Finance function, specifically managing payroll accounting, reconciliations, and payroll-related financial reporting across multiple international jurisdictions (excluding North America).",
    location: "Remote",
    timePosted: "5 hrs ago",
  },
  {
    id: 2,
    title: "Software Development Engineer",
    company: "Compscope",
    salary: "120k$",
    salaryType: "Per/Year",
    tags: ["Marketing", "Design", "Strategic Development"],
    description:
      "We are seeking a detail-oriented and proactive Payroll Specialist to support our Finance function, specifically managing payroll accounting, reconciliations, and payroll-related financial reporting across multiple international jurisdictions (excluding North America).",
    location: "Remote",
    timePosted: "5 hrs ago",
  },
  {
    id: 3,
    title: "Software Development Engineer",
    company: "Compscope",
    salary: "12-60$",
    salaryType: "Per/Hr",
    tags: ["Marketing", "Design", "Strategic Development"],
    description:
      "We are seeking a detail-oriented and proactive Payroll Specialist to support our Finance function, specifically managing payroll accounting, reconciliations, and payroll-related financial reporting across multiple international jurisdictions (excluding North America).",
    location: "Remote",
    timePosted: "6 hrs ago",
  },
  {
    id: 4,
    title: "Software Development Engineer",
    company: "Compscope",
    salary: "120k$",
    salaryType: "Per/Year",
    tags: ["Marketing", "Design", "Strategic Development"],
    description:
      "We are seeking a detail-oriented and proactive Payroll Specialist to support our Finance function, specifically managing payroll accounting, reconciliations, and payroll-related financial reporting across multiple international jurisdictions (excluding North America).",
    location: "Remote",
    timePosted: "5 hrs ago",
  },
];

const filterTabs = ["Part-Time", "Full-Time", "Remote", "On-site"];

export default function JobComponent() {
  const [activeFilter, setActiveFilter] = useState("Part-Time");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="px-4 sm:px-8 py-4"
      >
        <div className="flex items-center max-w-7xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="text-xl font-semibold text-black"
          >
            Compscope
          </motion.div>

          <div className="hidden md:flex flex-1 max-w-sm mx-10">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for a role"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-3 text-sm text-gray-400 bg-white border-0 rounded-full focus:outline-none focus:ring-0 placeholder-[#CFD7CF]"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#76FF82] p-2 rounded-full"
              >
                <Search className="w-4 h-4 text-black" />
              </motion.button>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-10">
            <motion.span
              whileHover={{ y: -1 }}
              className="text-sm text-[#32343A] font-medium cursor-pointer"
            >
              Explore
            </motion.span>
            <motion.span
              whileHover={{ y: -1 }}
              className="text-sm text-[#32343A] font-medium cursor-pointer"
            >
              Find Jobs
            </motion.span>
            <motion.span
              whileHover={{ y: -1 }}
              className="text-sm text-[#32343A] font-medium cursor-pointer"
            >
              Hire a Engineer
            </motion.span>
          </div>

          {/* User icons - positioned to the far right */}
          <div className="flex items-center space-x-3 ml-auto bg-white rounded-full">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-3 rounded-full"
            >
              <Mail className="w-4 h-4 text-gray-600" />
            </motion.button>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-8 h-8 bg-[#3159AB] p-5 rounded-full flex items-center justify-center text-white font-medium cursor-pointer"
            >
              R
            </motion.div>
          </div>

          {/* Hamburger menu */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMenu}
            className="lg:hidden ml-3 p-2 text-gray-600"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </motion.button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white rounded-xl mt-4 p-4 shadow-lg"
            >
              {/* Mobile Search Bar */}
              <div className="md:hidden mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for a role"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-6 py-3 text-sm text-gray-400 bg-white border-0 rounded-full focus:outline-none focus:ring-0 placeholder-[#CFD7CF]"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#76FF82] p-2 rounded-full"
                  >
                    <Search className="w-4 h-4 text-black" />
                  </motion.button>
                </div>
              </div>

              <div className="space-y-3">
                <motion.div
                  whileHover={{ x: 4 }}
                  className="text-sm text-[#32343A] font-medium cursor-pointer py-2"
                >
                  Explore
                </motion.div>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="text-sm text-[#32343A] font-medium cursor-pointer py-2"
                >
                  Find Jobs
                </motion.div>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="text-sm text-[#32343A] font-medium cursor-pointer py-2"
                >
                  Hire a Engineer
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 md:px-20 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-2xl font-medium text-black mb-8">Explore</h1>

          <div className="flex flex-wrap space-x-0 mb-5">
            {filterTabs.map((tab, index) => (
              <motion.button
                key={tab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -1 }}
                onClick={() => setActiveFilter(tab)}
                className={`px-6 py-1 text-xs mx-2 mb-2 font-medium rounded-full transition-all ${
                  activeFilter === tab
                    ? "bg-[#fff] text-[#32343A] hover:text-gray-700"
                    : " bg-[#EBEBEB] text-[#32343A]"
                }`}
              >
                {tab}
              </motion.button>
            ))}
          </div>

          {/* Job Listings */}
          <div className="space-y-6">
            {jobListings.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -2, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}
                className="bg-white rounded-xl p-6"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Left Side */}
                  <div className="flex flex-1">
                    {/* Avatar */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-12 h-12 bg-[#C5BCFF] rounded-full flex items-center justify-center text-[#32343A] font-medium mr-4 flex-shrink-0"
                    >
                      R
                    </motion.div>

                    <div className="flex-1">
                      {/* Job Title */}
                      <h3 className="text-lg font-medium text-black mb-1">
                        {job.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        {job.company}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap space-x-3 mb-6">
                        {job.tags.map((tag) => (
                          <motion.span
                            key={tag}
                            whileHover={{ scale: 1.02 }}
                            className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full mb-2"
                          >
                            {tag}
                          </motion.span>
                        ))}
                      </div>

                      {/* About Job */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-black mb-2">
                          About Job
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {job.description}
                        </p>
                      </div>

                      {/* Job Details */}
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{job.timePosted}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-between lg:ml-8 mt-4 lg:mt-0">
                    <div className="">
                      {/* <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="text-gray-300 hover:text-gray-500 mb-0 lg:mb-4"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </motion.button> */}

                      <div className="text-right mb-0 lg:mb-6">
                        <div className="text-2xl font-bold text-black">
                          {job.salary}
                        </div>
                        <div className="text-sm text-gray-500">
                          {job.salaryType}
                        </div>
                      </div>
                    </div>
                    <Link href="/jobs/details">
                      <motion.button
                        whileHover={{
                          scale: 1.02,
                          boxShadow: "0 4px 12px rgba(118, 255, 130, 0.3)",
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-[#76FF82] text-black font-medium px-6 py-2 rounded-full text-sm"
                      >
                        View Role
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
