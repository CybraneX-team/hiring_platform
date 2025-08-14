"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

const mockApplicants: Applicant[] = [
  {
    id: "1",
    name: "Miller Rich",
    title: "Mechanical Engineer",
    avatar: "MR",
    available: true,
    location: "USA, Michigan",
    experience: "5 Years",
    skills: [
      "UI Development",
      "AI Prompting",
      "ML Ops",
      "Adobe Suite",
      "Wireframing",
    ],
    certifications: ["Certifications from Industry", "Site Management"],
    matchPercentage: 83,
  },
  {
    id: "2",
    name: "Miller Rich",
    title: "Mechanical Engineer",
    avatar: "MR",
    available: true,
    location: "USA, Michigan",
    experience: "5 Years",
    skills: [
      "UI Development",
      "AI Prompting",
      "ML Ops",
      "Adobe Suite",
      "Wireframing",
    ],
    certifications: ["Certifications from Industry", "Site Management"],
    matchPercentage: 83,
  },
  {
    id: "3",
    name: "Miller Rich",
    title: "Mechanical Engineer",
    avatar: "MR",
    available: true,
    location: "USA, Michigan",
    experience: "5 Years",
    skills: [
      "UI Development",
      "AI Prompting",
      "ML Ops",
      "Adobe Suite",
      "Wireframing",
    ],
    certifications: ["Certifications from Industry", "Site Management"],
    matchPercentage: 83,
  },
  {
    id: "4",
    name: "Miller Rich",
    title: "Mechanical Engineer",
    avatar: "MR",
    available: false,
    location: "USA, Michigan",
    experience: "5 Years",
    skills: [
      "UI Development",
      "AI Prompting",
      "ML Ops",
      "Adobe Suite",
      "Wireframing",
    ],
    certifications: ["Certifications from Industry", "Site Management"],
    matchPercentage: 83,
  },
];

const filterTabs = [
  { id: "all", label: "75% AI match", count: 4 },
  { id: "experience", label: "2+ Yrs Experience", count: 3 },
  { id: "cgpa", label: "7.5 CGPA+", count: 2 },
  { id: "distance", label: "Distance > 50km", count: 1 },
];

export default function ApplicationsListView() {
  const [activeFilter, setActiveFilter] = useState("all");
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#F5F5F5] p-4 sm:p-6 lg:p-8">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
        Compscope
      </h1>
      <div className="max-w-6xl mx-auto mt-12">
        {/* Header */}
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
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          <AnimatePresence>
            {mockApplicants.map((applicant, index) => (
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {applicant.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {applicant.title}
                        </p>
                      </div>

                      {/* Divider line after name section */}
                      <div className="border-t border-gray-100 mb-4 w-[115%] -mx-14"></div>

                      {/* Status Indicators */}
                      <div className="flex flex-wrap gap-4 mb-4 text-sm  -mx-14  text-gray-600">
                        <div className="flex items-center gap-1">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              applicant.available ? "bg-blue-500" : "bg-red-500"
                            }`}
                          ></div>
                          <span
                            className={
                              applicant.available
                                ? "text-blue-600"
                                : "text-red-600"
                            }
                          >
                            {applicant.available ? "Available" : "Unavailable"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{applicant.location}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{applicant.experience}</span>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="mb-6 -mx-14 ">
                        <p className="text-xs text-gray-500 mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {applicant.skills.map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="px-3 py-1 bg-[#F5F5F5] text-gray-700 text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Certifications */}
                      <div className="-mx-14 ">
                        <p className="text-xs text-gray-500 mb-2">
                          Certifications from Industry
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {applicant.certifications.map((cert, certIndex) => (
                            <span
                              key={certIndex}
                              className="px-3 py-1 bg-[#F5F5F5] text-gray-700 text-xs rounded-full"
                            >
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Match Percentage and Action Button */}
                  <div className="flex flex-col items-end justify-between h-full min-h-[200px] ">
                    {/* Match Percentage with Progress Circle and Label */}
                    <div className="flex flex-col items-center gap-1">
                      <CircularProgress
                        percentage={applicant.matchPercentage}
                      />
                      <span className="text-xs text-gray-500 text-center">
                        AI match score
                      </span>
                    </div>

                    {/* Open Button */}
                    <Link href="/company/applicants">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-8 py-2 bg-[#76FF82] hover:bg-green-400 text-black font-medium rounded-full transition-colors w-40 mt-32"
                      >
                        Open
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
