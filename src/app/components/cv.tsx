"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Clock, CheckCircle, Download, ExternalLink, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import ResumePDF from "./pdf/ResumePDF";
import { useUser } from "../context/UserContext";

const CircularProgress = ({ percentage }: { percentage: number }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-12 h-12">
      <svg className="w-12 h-12 transform rotate-360" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r={radius}
          stroke="#E5E7EB"
          strokeWidth="3"
          fill="none"
        />
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

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-black font-semibold text-sm">{percentage}%</span>
      </div>
    </div>
  );
};

// Certificate Card Component with Links
const CertificateCard = ({ cert }: { cert: any }) => {

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold text-gray-900 mb-1">{cert.name || "Unknown Certificate"}</h4>
      <p className="text-gray-600 text-sm mb-1">
        <span className="font-medium">Issuer:</span> {cert.issuer || "Unknown"}
      </p>
      <p className="text-gray-600 text-sm mb-2">
        <span className="font-medium">Date:</span> {cert.date || "Unknown"}
      </p>
      {cert.description && (
        <p className="text-gray-700 text-sm leading-relaxed mb-3">{cert.description}</p>
      )}
      
      {/* Certificate File Link */}
      {cert.fileUrl && (
        <div className="flex items-center gap-2">
          <a
            href={cert.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            <FileText className="w-4 h-4" />
            View Certificate
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
};

// Work Experience Card Component
export const WorkExperienceCard = ({ experience }: any) => {

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          {experience.title  && 
          <h3 className="font-semibold text-lg text-gray-900">{experience.title || ""}</h3>
            }
          <p className="text-gray-600 font-medium">{experience.company || "Company"}</p>
        </div>
        {experience.period && (
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {experience.period}
          </span>
        )}
      </div>
      
      {/* Bullet Points */}
      {experience.points && experience.points.length > 0 ? (
        <div className="mt-3">
          <ul className="space-y-2">
            {experience.points.map((item: any, index: any) => (
              <li key={index} className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <p className="text-gray-700 text-sm leading-relaxed">{item.point}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        /* Description fallback if no points */
        experience.description && (
          <div className="mt-3">
            <p className="text-gray-700 text-sm leading-relaxed">{experience.description}</p>
          </div>
        )
      )}

      {/* Show message if no points and no description */}
      {(!experience.points || experience.points.length === 0) && !experience.description && (
        <p className="text-gray-500 text-sm mt-3">No description available</p>
      )}
    </div>
  );
};

interface applicantDetail {
  id: string;
  name: string;
  title: string;
  avatar: string;
  available: boolean;
  location: string;
  experience: string;
  matchPercentage: number;
  skills: string[];
  certifications: any[];
  experience_details: any[];
  academics: Array<{
    level: string;
    institution: string;
    completed: boolean;
  }>;
  languages: string[];
  contact: {
    phone: string;
    email: string;
  };
  resumeUrl?: string; // Added resume URL
}

export default function ApplicationDetailView() {
  const [applicantDetail, setapplicantDetail] = useState<applicantDetail | any >(null);
  const { user, profile } = useUser();
  useEffect(() => {
    if (!profile || !user) {
      return;
    }

    // Use profile data from localStorage/context instead of fetching
    const formatted: applicantDetail = {
      id: profile._id || "unknown",
      name: profile.name || user.name || "Unknown Name",
      title: profile.openToRoles?.[0] || profile.WorkExperience?.[0]?.title || "Professional",
      avatar: (profile.name || user.name || "U")
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase(),
      available: true,
      location: profile.location || "Location not specified",
      experience: profile.yearsOfExp || `${profile.WorkExperience?.length || 0} Roles`,
      matchPercentage: 0,
      skills: Array.isArray(profile.skills) ? profile.skills : [],
      certifications: Array.isArray(profile.certificates) ? profile.certificates : [], 
      experience_details: Array.isArray(profile.WorkExperience) ? profile.WorkExperience : [], 
      academics: Array.isArray(profile.education) ? profile.education.map((edu: any) => ({
        level: edu.Degree || "Degree",
        institution: edu.institure || "Institution", // Note: keeping the typo from your data
        completed: true,
      })) : [],
      languages: Array.isArray(profile.languages) ? profile.languages : ["English"],
      contact: {
        phone: profile.phoneNumber || "+91 00000 00000",
        email: user.email || "Not provided",
      },
      resumeUrl: profile.resumeUrl || null, // Add resume URL
    };

    setapplicantDetail(formatted);
  }, [profile, user]);

  const router = useRouter();
//  const [companyLogo, setCompanyLogo] = useState(
//     profile ? profile.companyLogo : ""
//   );
  const [isShortlisted, setIsShortlisted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const brandName = "Compscope";
  const brandInitial = brandName.charAt(0);
  const [preparingPdf, setPreparingPdf] = useState(false);

  const handleShortlist = () => {
    setIsShortlisted((prev) => !prev);
  };

  const handleDownload = async () => {
    // React-PDF export that mirrors Profile Tab styling via ResumePDF component
    if (!applicantDetail) return;

    setPreparingPdf(true);
    try {
      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
      const blob = await pdf(
        <ResumePDF
          data={{
            name: applicantDetail.name,
            title: applicantDetail.title,
            location: applicantDetail.location,
            imageUrl: (profile as any)?.profile_image_url || undefined,
            available: applicantDetail.available,
            experience: applicantDetail.experience,
            skills: applicantDetail.skills,
            certifications: applicantDetail.certifications,
            experience_details: applicantDetail.experience_details,
            academics: applicantDetail.academics,
            languages: applicantDetail.languages,
            contact: applicantDetail.contact,
          }}
          generatedOn={formattedDate}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${applicantDetail?.name?.replace(/\s+/g, "-") || "CV"}-CV.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (_) {
      alert("Error generating PDF. Please try again.");
    } finally {
      setPreparingPdf(false);
    }
  };

  // Early return with loading state
  if (!applicantDetail) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-4 sm:p-6 lg:p-8">
      <div className="sr-only" aria-live="polite">
        {isShortlisted ? "Shortlisted" : ""}
      </div>
     
      <div className="max-w-6xl mx-auto mt-12">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          {/* Resume Link */}
          {/* <div className="flex items-center gap-3">
            {applicantDetail.resumeUrl && (
              <a
                href={applicantDetail.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-blue-600 text-white font-medium inline-flex items-center gap-2 shadow-sm hover:bg-blue-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                View Resume
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div> */}

          <div className="flex items-center gap-3" data-html2canvas-ignore="true">
            <motion.button
              type="button"
              onClick={handleDownload}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-full bg-[#76FF82] text-black font-medium inline-flex items-center gap-2 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#76FF82]"
            >
              <Download className="w-4 h-4" />
              Download
            </motion.button>
          </div>
        </div>

        {/* Main Content Card */}
        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 sm:p-8 shadow-sm"
        >
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-lg">
                  {applicantDetail.avatar}
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                  {applicantDetail.name}
                </h2>
                <p className="text-gray-600">{applicantDetail.title}</p>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              <span className="text-blue-600 font-medium">Available</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{applicantDetail.location}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{applicantDetail.experience}</span>
            </div>
          </div>

          {/* Skills Section */}
          {applicantDetail.skills.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {applicantDetail.skills.map((skill : any, index : any) => (
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
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Certificates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applicantDetail.certifications?.length > 0 ? (
                applicantDetail.certifications.map((cert : any, index : any) => (
                  <CertificateCard key={index} cert={cert} />
                ))
              ) : (
                <p className="text-gray-500 col-span-full">No certificates available</p>
              )}
            </div>
          </div>

          {/* Experience Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Experience
            </h3>
            <div className="space-y-4">
              {applicantDetail.experience_details?.length > 0 ? (
                applicantDetail.experience_details.map((exp : any, index : any) => (
                  <WorkExperienceCard key={index} experience={exp} />
                ))
              ) : (
                <p className="text-gray-500">No work experience available</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Academics Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Academics
              </h3>
              <div className="space-y-4">
                {applicantDetail.academics?.length > 0 ? (
                  applicantDetail.academics.map((academic : any, index : any) => (
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
                  ))
                ) : (
                  <p className="text-gray-500">No education details available</p>
                )}
              </div>
            </div>

            {/* Languages Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Languages
              </h3>
              <div className="space-y-2">
                {applicantDetail.languages?.length > 0 ? (
                  applicantDetail.languages.map((language : any, index : any) => (
                    <p key={index} className="text-gray-700">
                      {language}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500">No languages specified</p>
                )}
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
                {applicantDetail.contact.phone}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Mail :</span>{" "}
                {applicantDetail.contact.email}
              </p>
            </div>
          </div>

          {/* Links Section for PDF - Hidden from view but included in PDF */}
          <div className="hidden print:block mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Links</h3>
            <div className="space-y-2 text-sm">
              {applicantDetail.resumeUrl && (
                <p>Resume: {applicantDetail.resumeUrl}</p>
              )}
              {applicantDetail.certifications?.map((cert : any, index : any) => (
                cert.fileUrl && (
                  <p key={index}>{cert.name}: {cert.fileUrl}</p>
                )
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}