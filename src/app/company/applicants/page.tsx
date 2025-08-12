"use client";

import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Clock, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface ApplicationDetailViewProps {
  onBack: () => void;
  applicantId: string;
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

const mockApplicantDetail = {
  id: "1",
  name: "Miller Rich",
  title: "Mechanical Engineer",
  avatar: "MR",
  available: true,
  location: "USA, Michigan",
  experience: "5 Years",
  matchPercentage: 81,
  skills: [
    "UI Development",
    "AI Prompting",
    "ML Ops",
    "Adobe Suite",
    "Wireframing",
  ],
  certifications: ["Site Management"],
  experience_details: [
    {
      title: "Managing Director",
      company: "Business Inc",
      description: [
        "Providing strategic advice to the board and ensuring effective functioning.",
        "Preparing comprehensive business plans and overseeing their implementation.",
      ],
    },
    {
      title: "Junior Developer",
      company: "Company Name",
      description: [
        "Quality Assurance Tester to contribute to the testing efforts for our critical regulatory reporting applications.",
        "Reporting to the Quality Assurance Team Lead, you will play a key role in ensuring the accuracy.",
      ],
    },
  ],
  academics: [
    {
      level: "Masters",
      institution: "University of Michigan",
      completed: true,
    },
    {
      level: "Graduation",
      institution: "University of Michigan",
      completed: true,
    },
    {
      level: "Highschool",
      institution: "Great school of Michigan",
      completed: true,
    },
  ],
  languages: ["English (Native)", "German (Intermediate)", "Hindi (Fresh)"],
  contact: {
    phone: "+91 00000 00000",
    email: "soabcc@gmail.com",
  },
};

export default function ApplicationDetailView({
  onBack,
  applicantId,
}: ApplicationDetailViewProps) {
  const applicant = mockApplicantDetail;

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

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 sm:p-8 shadow-sm"
        >
          {/* Profile Header */}
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

            <CircularProgress percentage={applicant.matchPercentage} />
          </div>

          {/* Status Indicators */}
          <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              <span className="text-blue-600 font-medium">Available</span>
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

          {/* Skills Section */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {applicant.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Certifications Section */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Certifications from Industry
            </h3>
            <div className="flex flex-wrap gap-2">
              {applicant.certifications.map((cert, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>

          {/* Experience Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Experience
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {applicant.experience_details.map((exp, index) => (
                <div key={index} className="bg-[#F5F5F5] rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {exp.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">{exp.company}</p>
                  <div className="space-y-2">
                    {exp.description.map((desc, descIndex) => (
                      <p
                        key={descIndex}
                        className="text-sm text-gray-700 leading-relaxed"
                      >
                        {desc}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Two Column Layout for Academics and Languages */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Academics Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Academics
              </h3>
              <div className="space-y-4">
                {applicant.academics.map((academic, index) => (
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
                ))}
              </div>
            </div>

            {/* Languages Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Languages
              </h3>
              <div className="space-y-2">
                {applicant.languages.map((language, index) => (
                  <p key={index} className="text-gray-700">
                    {language}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contact
            </h3>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-medium">Phone No :</span>{" "}
                {applicant.contact.phone}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Mail :</span>{" "}
                {applicant.contact.email}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
