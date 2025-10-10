"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, MapPin, Clock, CheckCircle, Download } from "lucide-react";
import { WorkExperienceCard } from "./WorkExperienceCard";
import { useRef, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import ResumePDF from "./pdf/ResumePDF";
import { useRouter } from "next/navigation";

interface CompanyApplicantsProps {
  itemId: any;
  onBack: () => void;
}

export default function Companyapplicants({ itemId, onBack }: CompanyApplicantsProps) {
  const applicant = itemId;
  const contentRef = useRef<HTMLDivElement>(null);
  const [preparingPdf, setPreparingPdf] = useState(false);
  const router = useRouter();

  console.log("applicant", applicant);

  const getInitials = (name: string) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase() || "N/A";
  };

  const isAvailable = applicant?.openToRoles && applicant.openToRoles.length > 0;

  // Format yearsOfExp: accept number or string. If it's numeric, append 'year(s)'.
  // If it's already a readable string (contains 'year' or '+' etc.), leave as-is.
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
      return s;
    }
    return String(years);
  };

  const formattedExperience = formatExperience(applicant?.yearsOfExp);

  const handleDownload = async () => {
    if (!applicant) return;
    setPreparingPdf(true);
    try {
      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

      // Normalize certifications
      const certifications = (applicant?.certificates || []).map((cert: any) => {
        if (typeof cert === 'string') return { name: cert };
        return {
          name: cert?.name || cert?.title,
          issuer: cert?.issuer,
          date: cert?.date,
          description: cert?.description,
        };
      });

      // Normalize experiences
      const experience_details = (applicant?.WorkExperience || []).map((exp: any) => ({
        title: exp?.title,
        company: exp?.company,
        period: exp?.period || `${exp?.startDate || ''} - ${exp?.endDate || ''}`.trim().replace(/^-|-$/g, ''),
        description: exp?.description,
        points: Array.isArray(exp?.points) ? exp.points.map((p: any) => ({ point: p.point || p })) : undefined,
      }));

      const academics = (applicant?.education || []).map((edu: any) => ({
        level: edu?.Degree,
        institution: edu?.institure || edu?.institute,
        completed: true,
      }));

      const blob = await pdf(
        <ResumePDF
          data={{
            name: applicant?.name || 'Unknown',
            title: applicant?.WorkExperience?.[0]?.title || 'Professional',
            location: applicant.location ? applicant.location.split(",").slice(-4).join(", ") : "Unknown Location",
            imageUrl: applicant?.profile_image_url || applicant?.profilePicture || undefined,
            
            experience: applicant?.yearsOfExp ? `${applicant.yearsOfExp}` : undefined,
            skills: applicant?.skills || [],
            certifications,
            experience_details,
            academics,
            languages: applicant?.languages || [],
            contact: { email: applicant?.user?.email, phone: applicant?.phoneNumber },
          }}
          generatedOn={formattedDate}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${applicant.name?.replace(/\s+/g, "-") || "Profile"}-Details.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setPreparingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-4 sm:p-6 lg:p-8">
      {/* <div className="sr-only" aria-live="polite">
        {isShortlisted ? "Shortlisted" : ""}
      </div> */}
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
        Compscope
      </h1>
      <div className="max-w-6xl mx-auto mt-12">
        <div className="mb-10 flex items-center justify-between">
          <motion.button
            onClick={onBack}
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
            {/* <motion.button
              type="button"
              onClick={handleShortlist}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-full bg-[#76FF82] cursor-pointer text-black font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#76FF82]"
              aria-pressed={isShortlisted}
            > */}
              {/* <AnimatePresence initial={false} mode="wait">
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
            </motion.button> */}

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
                  {applicant.avatar || getInitials(applicant.name)}
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
              {/* {!preparingPdf && (
                <div data-pdf-hide="true" className="absolute inset-0">
                  <CircularProgress percentage={applicant.matchPercentage} />
                </div>
              )} */}
              {/* {preparingPdf && profile?.companyLogo && (
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
              )} */}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-gray-600">
            {/* <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              <span className="text-blue-600 font-medium">
                {applicant.available ? "Available" : "Unavailable"}
              </span>
            </div> */}
            {/* limit the location to last four words which are seperated by comas if it is not null */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{applicant.location ? applicant.location.split(",").slice(-4).join(", ") : "Unknown Location"}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Experience : {formatExperience(applicant.yearsOfExp) || "Not Specified"}</span>
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
              {applicant.certificates && applicant.certificates.length > 0 ? (
                applicant.certificates.map((cert: any, index: number) => (
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
              {applicant.WorkExperience &&
                applicant.WorkExperience.length > 0 ? (
                applicant.WorkExperience.map((exp: any, index: number) => (
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
                {applicant.education && applicant.education.length > 0 ? (
                  applicant.education.map((academic: any, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-[#76FF82] flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {academic.Degree}
                        </p>
                        <p className="text-sm text-gray-600">
                          {academic.institure}
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
            {/* Contact Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contact
            </h3>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-medium">Phone No :</span>{" "}
                {applicant.phoneNumber || "+91 00000 00000"}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Mail :</span>{" "}
                {applicant.user.email || "example@mail.com"}
              </p>
            </div>
          </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}