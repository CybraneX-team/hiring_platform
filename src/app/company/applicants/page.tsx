"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Loader2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useEffect, Suspense } from "react";
import { pdf } from "@react-pdf/renderer";
import ResumePDF from "@/app/components/pdf/ResumePDF";
import { useUser } from "@/app/context/UserContext";
import Image from "next/image";

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

const LoadingSpinner = () => (
  <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-[#76FF82]" />
      <p className="text-gray-600 text-lg">Loading applicant details...</p>
    </div>
  </div>
);

const ErrorMessage = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
    <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 max-w-md text-center">
      <div className="text-red-500 text-lg font-semibold mb-4">
        Error Loading Details
      </div>
      <p className="text-gray-600 mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-[#76FF82] hover:bg-green-400 text-black font-medium rounded-full transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

// Helper function to generate avatar initials
const generateAvatar = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

function ApplicationDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("id");
  const { user, profile } = useUser();

  const [applicant, setApplicant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [preparingPdf, setPreparingPdf] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch applicant details
  const fetchApplicantDetails = async () => {
    if (!applicationId) {
      setError("Application ID is required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/profile/application/${applicationId}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Applicant details not found");
        }
        throw new Error("Failed to fetch applicant details");
      }

      const data = await response.json();

      if (data.success) {
        const { profile, application, applicant } = data.data;
        
        // Format the data for the frontend with complete profile
        const formattedData = {
          // Basic info
          id: applicant._id,
          applicationId: application._id,
          name: profile.name || applicant.name || "Unknown",
          title:
            profile.openToRoles?.[0] ||
            profile.WorkExperience?.[0]?.title ||
            "Professional",
          avatar: generateAvatar(profile.name || applicant.name || "NA"),
          
          //
          // Status
          available: (() => {
            try {
              // determine job start/end (support either application.job or top-level fields)
              const jobStart = application.job?.startDate
                ? new Date(application.job.startDate)
                : application.startDate
                ? new Date(application.startDate)
                : null;
              const jobEnd = application.job?.endDate
                ? new Date(application.job.endDate)
                : application.endDate
                ? new Date(application.endDate)
                : null;

              // fallback to status-based check if job dates unavailable
              if (!jobStart || !jobEnd) {
                return application.status === "pending" || application.status === "reviewing";
              }

              // gather unavailability slots from profile or application
              const slots = profile?.unavailability || application.unavailability || [];

              // if any slot overlaps the job date range, applicant is unavailable
              const hasConflict = Array.isArray(slots) && slots.some((slot: any) => {
                const s = slot?.startDate ? new Date(slot.startDate) : null;
                const e = slot?.endDate ? new Date(slot.endDate) : null;
                if (!s || !e) return false;
                return s <= jobEnd && e >= jobStart; // overlap condition
              });

              return !hasConflict;
            } catch (err) {
              return application.status === "pending" || application.status === "reviewing";
            }
          })(),
          
          // Location
          location: profile.locationData?.address || profile.location || "Location not specified",
          
          // Experience
          experience: profile.yearsOfExp ? `${profile.yearsOfExp} ` : "0 Years",
          
          // Match percentage
          matchPercentage: Math.round(application.matchDetails?.overallScore || 0),
          
          // Skills
          skills: profile.skills || [],
          
          // Certifications (from profile.certificates)
          certifications: profile.certificates || [],
          
          // Experience details (from profile.WorkExperience)
          experience_details:
            profile.WorkExperience?.map((exp: any) => ({
              title: exp.title || "Position",
              company: exp.company,
              period: exp.period || 
                (exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : ""),
              description: exp.description,
              points: exp.points,
            })) || [],
          
          // Academics (from profile.education)
          academics:
            profile.education?.map((edu: any) => ({
              level: edu.Degree || "Degree",
              institution: edu.institure || "Institution",
              completed: true,
            })) || [],
          
          // Languages
          languages: profile.languages || [],
          
          // Contact info
          contact: {
            phone: profile.phoneNumber || "+91 00000 00000",
            email: applicant.email || "Not provided",
          },
          
          // Additional info
          bio: profile.bio || "",
          website: profile.website || "",
          social: {
            linkedin: profile.linkdin || "",
            twitter: profile.twitter || "",
            github: profile.Github || "",
          },
          achievements: profile.achivements || "",
          resumeUrl: profile.resumeUrl || "",
          
          // Documents
          documents: {
            photo: profile.profile_image_url || "/images/default-avatar.png",
            certificates: profile.certificateFiles || [],
            marksheets: [],
            identificationDocs: [],
          },
          
          // Application details
          applicationDetails: {
            appliedDate: application.appliedDate,
            status: application.status,
            notes: application.notes,
            matchDetails: application.matchDetails,
          },
          
          // Store complete profile and user for PDF generation
          profile: profile,
          user: applicant,
        };

        setApplicant(formattedData);
        setIsShortlisted(application.status === "shortlisted");
      } else {
        throw new Error(data.message || "Failed to fetch applicant details");
      }
    } catch (err) {
      console.error("Error fetching applicant details:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicantDetails();
  }, [applicationId]);

  const handleShortlist = async () => {
    if (!applicationId) return;

    try {
      if (isShortlisted) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/application/${applicationId}/status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: "pending",
              notes: "Application status changed back to pending",
            }),
          }
        );

        const result = await response.json();
        if (result.success) {
          setIsShortlisted(false);
        } else {
          console.error("Failed to update application status:", result.message);
        }
      } else {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/application/${applicationId}/shortlist`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              shortlistReason: "Candidate shortlisted via detailed view",
              notes: "Shortlisted based on profile review",
            }),
          }
        );

        const result = await response.json();
        if (result.success) {
          setIsShortlisted(true);
        } else {
          console.error("Failed to shortlist candidate:", result.message);
        }
      }
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  const handleDownload = async () => {
    if (!applicant) return;
    setPreparingPdf(true);
    try {
      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

      // Use the complete profile from the API response
      const p = applicant.profile;
      

      // Certifications
      const certifications = Array.isArray(p?.certificates)
        ? p.certificates.map((c: any) => ({
            name: c?.name,
            issuer: c?.issuer,
            date: c?.date,
            description: c?.description,
          }))
        : [];

      // Experience details
      const experience_details = Array.isArray(p?.WorkExperience)
        ? p.WorkExperience.map((exp: any) => ({
            title: exp?.title,
            company: exp?.company,
            period:
              exp?.period || 
              (exp?.startDate && exp?.endDate 
                ? `${exp.startDate} - ${exp.endDate}` 
                : ''),
            description: exp?.description,
            points: Array.isArray(exp?.points)
              ? exp.points.map((pt: any) => ({ point: pt?.point || pt }))
              : undefined,
          }))
        : [];

      // Academics/Education
      const academics = Array.isArray(p?.education)
        ? p.education.map((edu: any) => ({
            level: edu?.Degree,
            institution: edu?.institure || edu?.institute,
            completed: true,
          }))
        : [];

      const skills = Array.isArray(p?.skills) ? p.skills : [];
      const languages = Array.isArray(p?.languages) ? p.languages : [];

      const name = p?.name || applicant?.name || 'Unknown';
      const title = p?.openToRoles?.[0] || p?.WorkExperience?.[0]?.title || applicant?.title || 'Professional';
      const location = applicant.location ? applicant.location.split(",").slice(-4).join(", ") : "Unknown Location";
      const imageUrl = p?.profile_image_url || undefined;
      const available = applicant?.available || false;
      const experience = p?.yearsOfExp ? `${p.yearsOfExp}` : applicant?.experience || '0 Years';
      const email = applicant?.user?.email || applicant?.contact?.email;
      const phone = p?.phoneNumber || applicant?.contact?.phone;
      const companyLogoUrl = localStorage.getItem('companyLogo') || profile?.companyLogo || '';
      const bio = p?.bio ||applicant?.bio || '';

      const blob = await pdf(
        <ResumePDF
          data={{
            name,
            title,
            location,
            imageUrl,
         
            experience,
            skills,
            certifications,
            experience_details,
            academics,
            languages,
            
            companyLogo : companyLogoUrl,
            bio
          }} 
          generatedOn={formattedDate}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.replace(/\s+/g, "-")}-Consolidated-Profile.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating consolidated PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setPreparingPdf(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchApplicantDetails} />;
  }

  if (!applicant) {
    return (
      <ErrorMessage
        message="Applicant details not found"
        onRetry={fetchApplicantDetails}
      />
    );
  }
  const formatExperience = (years: any) => {
    if (years === undefined || years === null || years === "") return undefined;
    if (typeof years === "number") {
      return `${years} ${years === 1 ? "year" : "years"}`;
    }
    if (typeof years === "string") {
      const s = years.trim();
      // if the string already mentions year(s), yr, yrs or contains a + (e.g. '9+'), return as-is
      if (/(year|years|yr|yrs|\+)/i.test(s)) return s;
      // if it's a numeric string like '9' => convert to number and append years
      if (/^\d+(?:\.\d+)?$/.test(s)) {
        const n = Number(s);
        return `${n} ${n === 1 ? "year" : "years"}`;
      }
      //remove +
      return s.replace(/\+/g, "").trim();
    }
    return String(years);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-4 sm:p-6 lg:p-8">
      <div className="sr-only" aria-live="polite">
        {isShortlisted ? "Shortlisted" : ""}
      </div>
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
        Compscope
      </h1>
      <div className="max-w-6xl mx-auto mt-12">
        <div className="mb-10 flex items-center justify-between">
          <motion.button
            onClick={() => router.back()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>

          <div
            className="flex items-center gap-3"
            data-html2canvas-ignore="true"
          >
            <motion.button
              type="button"
              onClick={handleShortlist}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-full bg-[#76FF82] cursor-pointer text-black font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#76FF82]"
              aria-pressed={isShortlisted}
            >
              <AnimatePresence initial={false} mode="wait">
                {!isShortlisted ? (
                  <motion.span
                    key="label-shortlist"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                  >
                    Shortlist
                  </motion.span>
                ) : (
                  <motion.span
                    key="label-shortlisted"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{
                      type: "spring",
                      stiffness: 650,
                      damping: 18,
                    }}
                    className="inline-flex items-center gap-1"
                  >
                    <motion.span
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 650,
                        damping: 18,
                      }}
                      className="inline-flex"
                    >
                      <CheckCircle className="w-4 h-4" color="#000000" />
                    </motion.span>
                    <span>Shortlisted</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              type="button"
              onClick={handleDownload}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={preparingPdf}
              className="px-4 py-2 rounded-full bg-[#76FF82] cursor-pointer text-black font-medium inline-flex items-center gap-2 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#76FF82] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {preparingPdf ? "Preparing..." : "Download"}
            </motion.button>
          </div>
        </div>

        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 sm:p-8 shadow-sm"
        >
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

            <div className="relative" style={{ minWidth: '48px', minHeight: '48px', maxWidth: '120px', maxHeight: '60px' }}>
              {!preparingPdf && (
                <div data-pdf-hide="true" className="absolute inset-0">
                  <CircularProgress percentage={applicant.matchPercentage} />
                </div>
              )}
              {preparingPdf && profile?.companyLogo && (
                <div className="flex items-center justify-center h-full">
                    <Image 
                      src={profile.companyLogo} 
                      alt="Company Logo" 
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{ width: 'auto', height: 'auto', maxWidth: '120px', maxHeight: '60px', objectFit: 'contain' }}
                    />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-gray-600">
            {/* should be red if unavailable and a cross not the tickmark  green if available */}
            <div className="flex items-center gap-2">
              {applicant.available ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className={`font-medium ${applicant.available ? "text-green-600" : "text-red-600"}`}>
                {applicant.available ? "Available" : "Unavailable"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{applicant.location ? applicant.location.split(",").slice(-4).join(", ") : "Unknown Location"}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Experience : {formatExperience(applicant.experience) || "Not Specified"}</span>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-base font-medium text-gray-900 mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {applicant.skills && applicant.skills.length > 0 ? (
                applicant.skills.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">No skills listed</span>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-base font-medium text-gray-900 mb-3">
              Certifications from Industry
            </h3>
            <div className="space-y-3">
              {applicant.certifications &&
                applicant.certifications.length > 0 ? (
                applicant.certifications.map((cert: any, index: number) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {cert.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Issuer:</span> {cert.issuer}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Date:</span> {cert.date}
                    </p>
                    {cert.description && (
                      <p className="text-sm text-gray-700">
                        {cert.description}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <span className="text-gray-500 text-sm">
                  No certifications listed
                </span>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-base font-medium text-gray-900 mb-4">
              Experience
            </h3>
            <div className="space-y-4">
              {applicant.experience_details &&
                applicant.experience_details.length > 0 ? (
                applicant.experience_details.map((exp: any, index: number) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-base font-semibold text-gray-900 mb-1">
                          {exp.title}
                        </h4>
                        <p className="text-gray-600 font-medium text-sm">{exp.company}</p>
                      </div>
                      {exp.period && (
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {exp.period}
                        </span>
                      )}
                    </div>
                    
                    {/* Bullet Points */}
                    {(() => {
                      const points: string[] = Array.isArray(exp?.points) && exp.points.length
                        ? exp.points.map((p: any) => (typeof p === 'string' ? p : p?.point)).filter(Boolean)
                        : exp?.description
                          ? [exp.description]
                          : [];
                      return points.length > 0 ? (
                        <div className="mt-3">
                          <ul className="space-y-2">
                            {points.map((pt: string, idx: number) => (
                              <li key={idx} className="flex items-start">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                <p className="text-black text-sm leading-relaxed">{pt}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null;
                    })()}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">
                  No experience details available
                </p>
              )}
            </div>
            <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Bio
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-700 leading-relaxed">{applicant.bio || "No bio available."}</p>
            </div>
          </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-4">
                Academics
              </h3>
              <div className="space-y-4">
                {applicant.academics && applicant.academics.length > 0 ? (
                  applicant.academics.map((academic: any, index: number) => (
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
                  <p className="text-gray-500 text-sm">
                    No academic information available
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium text-gray-900 mb-4">
                Languages
              </h3>
              <div className="space-y-2">
                {applicant.languages && applicant.languages.length > 0 ? (
                  applicant.languages.map((language: string, index: number) => (
                    <p key={index} className="text-gray-700">
                      {language}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    No language information available
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ApplicationDetailView() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ApplicationDetailContent />
    </Suspense>
  );
}
