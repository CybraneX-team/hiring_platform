"use client";

import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Clock, CheckCircle } from "lucide-react";

// const CircularProgress = ({ percentage }: { percentage: number }) => {
//   const radius = 20;
//   const circumference = 2 * Math.PI * radius;
//   const strokeDasharray = circumference;
//   const strokeDashoffset = circumference - (percentage / 100) * circumference;

//   return (
//     <div className="relative w-12 h-12">
//       <svg className="w-12 h-12 transform rotate-360" viewBox="0 0 44 44">
//         <circle
//           cx="22"
//           cy="22"
//           r={radius}
//           stroke="#E5E7EB"
//           strokeWidth="3"
//           fill="none"
//         />
//         <circle
//           cx="22"
//           cy="22"
//           r={radius}
//           stroke="#76FF82"
//           strokeWidth="3"
//           fill="none"
//           strokeDasharray={strokeDasharray}
//           strokeDashoffset={strokeDashoffset}
//           strokeLinecap="round"
//           className="transition-all duration-300 ease-in-out"
//         />
//       </svg>
//       <div className="absolute inset-0 flex items-center justify-center">
//         <span className="text-black font-semibold text-sm">{percentage}%</span>
//       </div>
//     </div>
//   );
// };

interface CompanyApplicantsProps {
  itemId: any; // The selected profile data
  onBack: () => void;
}

export default function Companyapplicants({ itemId, onBack }: CompanyApplicantsProps) {
  const applicant = itemId; // The actual profile data passed from parent
  console.log("applicant is : ", applicant);

  // Generate avatar initials from name
  const getInitials = (name: string) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase() || "N/A";
  };

  // Calculate match percentage (you can implement your own logic)
  const getMatchPercentage = () => {
    return Math.floor(Math.random() * 30) + 70; // Random between 70-100 for now
  };

  // Check if user is available based on openToRoles
  const isAvailable = applicant?.openToRoles && applicant.openToRoles.length > 0;

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-4 sm:p-6 lg:p-8">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
        Compscope
      </h1>
      <div className="max-w-6xl mx-auto mt-12">
        {/* Header */}
        <div className="mb-10">
          <motion.button
            onClick={onBack}
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
                  {getInitials(applicant?.name)}
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                  {applicant?.name || "Name Not Available"}
                </h2>
                <p className="text-gray-600">
                  {applicant?.WorkExperience?.[0]?.title || "Position Not Specified"}
                </p>
              </div>
            </div>

            {/* <CircularProgress percentage={getMatchPercentage()} /> */}
          </div>

          {/* Status Indicators */}
          <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className={`w-4 h-4 ${isAvailable ? 'text-blue-500' : 'text-red-500'}`} />
              <span className={`font-medium ${isAvailable ? 'text-blue-600' : 'text-red-600'}`}>
                {isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>

            {applicant?.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{applicant.location}</span>
              </div>
            )}

            {applicant?.yearsOfExp && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{applicant.yearsOfExp}</span>
              </div>
            )}
          </div>

          {/* Open to Roles Section */}
          {applicant?.openToRoles && applicant.openToRoles.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Open to Roles</h3>
              <div className="flex flex-wrap gap-2">
                {applicant.openToRoles.map((role: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills Section */}
          {applicant?.skills && applicant.skills.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {applicant.skills.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Certifications Section */}
          {applicant?.certificates && applicant.certificates.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Certifications from Industry
              </h3>
              <div className="flex flex-wrap gap-2">
                {applicant.certificates.map((cert: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience Section */}
          {applicant?.WorkExperience && applicant.WorkExperience.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Work Experience
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {applicant.WorkExperience.map((exp: any, index: number) => (
                  <div key={index} className="bg-[#F5F5F5] rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {exp.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">{exp.company}</p>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {exp.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Education Section */}
            {applicant?.education && applicant.education.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Education
                </h3>
                <div className="space-y-4">
                  {applicant.education.map((edu: any, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-[#76FF82] flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {edu.Degree || "Degree Not Specified"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {edu.institure || "Institution Not Specified"}
                        </p>
                        {edu.Graduation && (
                          <p className="text-xs text-gray-500">
                            Graduated: {new Date(edu.Graduation).getFullYear()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bio Section */}
            {applicant?.bio && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Bio
                </h3>
                <p className="text-gray-700">{applicant.bio}</p>
              </div>
            )}
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contact
            </h3>
            <div className="space-y-2">
              {applicant?.user?.email && (
                <p className="text-gray-700">
                  <span className="font-medium">Email:</span>{" "}
                  {applicant.user.email}
                </p>
              )}
              {applicant?.linkdin && (
                <p className="text-gray-700">
                  <span className="font-medium">LinkedIn:</span>{" "}
                  <a href={applicant.linkdin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {applicant.linkdin}
                  </a>
                </p>
              )}
              {applicant?.website && (
                <p className="text-gray-700">
                  <span className="font-medium">Website:</span>{" "}
                  <a href={applicant.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {applicant.website}
                  </a>
                </p>
              )}
              {applicant?.resumeUrl && (
                <p className="text-gray-700">
                  <span className="font-medium">Resume:</span>{" "}
                  <a href={applicant.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View Resume
                  </a>
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
