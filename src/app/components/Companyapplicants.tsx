"use client";

import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Clock, CheckCircle } from "lucide-react";
import { WorkExperienceCard } from "./WorkExperienceCard";

interface CompanyApplicantsProps {
  itemId: any; // The selected profile data
  onBack: () => void;
}

export default function Companyapplicants({ itemId, onBack }: CompanyApplicantsProps) {
  const applicant = itemId; // The actual profile data passed from parent
  console.log("applicant", applicant);

  // Generate avatar initials from name
  const getInitials = (name: string) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase() || "N/A";
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
            className=" cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
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
                {applicant.certificates.map((cert: any, index: number) => {
                  const name =
                    typeof cert === "string"
                      ? cert
                      : cert?.name || cert?.title || "Certification";
                  const issuer =
                    typeof cert === "string" ? undefined : cert?.issuer;
                  const label = issuer ? `${name} · ${issuer}` : name;

                  return (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Experience Section */}
          {applicant?.WorkExperience && applicant.WorkExperience.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Work Experience
              </h3>
              <div className="space-y-4">
                {applicant.WorkExperience.map((experience: any, index: number) => (
                  <WorkExperienceCard 
                    key={index} 
                    experience={experience} 
                  />
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
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0 mt-2"></div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 mb-1">
                            {edu.Degree || "Degree Not Specified"}
                          </p>
                          <p className="text-sm text-gray-700 mb-1">
                            {edu.institure || "Institution Not Specified"}
                          </p>
                          {(edu.period || edu.Graduation) && (
                            <div className="flex items-center gap-2">
                              <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                {edu.period || (edu.Graduation && new Date(edu.Graduation).getFullYear())}
                              </div>
                            </div>
                          )}
                        </div>
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
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{applicant.bio}</p>
                </div>
              </div>
            )}
          </div>

          {/* Contact Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {applicant?.user?.email && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700 min-w-[80px]">Email:</span>
                    <a href={`mailto:${applicant.user.email}`} className="text-blue-600 hover:underline">
                      {applicant.user.email}
                    </a>
                  </div>
                )}
                
                {applicant?.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700 min-w-[80px]">Phone:</span>
                    <a href={`tel:${applicant.phoneNumber}`} className="text-blue-600 hover:underline">
                      {applicant.phoneNumber}
                    </a>
                  </div>
                )}
                
                {applicant?.linkdin && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700 min-w-[80px]">LinkedIn:</span>
                    <a 
                      href={applicant.linkdin} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline truncate"
                    >
                      View Profile
                    </a>
                  </div>
                )}
                
                {applicant?.website && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700 min-w-[80px]">Website:</span>
                    <a 
                      href={applicant.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline truncate"
                    >
                      Visit Site
                    </a>
                  </div>
                )}
                
                {applicant?.resumeUrl && (
                  <div className="flex items-center gap-2 md:col-span-2">
                    <span className="font-medium text-gray-700 min-w-[80px]">Resume:</span>
                    <a 
                      href={applicant.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-medium transition-colors"
                    >
                      📄 Download Resume
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
