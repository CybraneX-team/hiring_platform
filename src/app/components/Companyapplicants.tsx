"use client";

import { AnimatePresence, motion, Variants } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Download,
  Pencil,
  X,
  Plus,
  Trash2,
  Eye,
} from "lucide-react";
import { WorkExperienceCard } from "./WorkExperienceCard";
import { useRef, useState, useEffect } from "react";
import { pdf } from "@react-pdf/renderer";
import ResumePDF from "./pdf/ResumePDF";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { BasicInfoModal } from "./BasicInfoModal";
import { CertificationsModal } from "./CertificationsModal";
import { ExperienceModal } from "./ExperienceModal";
import { AcademicsModal } from "./AcademicsModal";

interface CompanyApplicantsProps {
  itemId: any;
  onBack: () => void;
  onUpdate?: (updatedProfile: any) => void;
}

// Get API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Modal backdrop animation - WITH TYPE
export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// Modal animation - WITH TYPE
export const modalVariants: Variants = {
  hidden: {
    y: "-100vh",
    opacity: 0,
  },
  visible: {
    y: "0",
    opacity: 1,
    transition: {
      duration: 0.1,
      type: "spring",
      damping: 25,
      stiffness: 500,
    },
  },
  exit: {
    y: "100vh",
    opacity: 0,
  },
};

export default function Companyapplicants({
  itemId,
  onBack,
  onUpdate,
}: CompanyApplicantsProps) {
  const [applicant, setApplicant] = useState(itemId);
  console.log("applicant", applicant);
  const contentRef = useRef<HTMLDivElement>(null);
  const [preparingPdf, setPreparingPdf] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  // Sync with parent updates
  useEffect(() => {
    setApplicant(itemId);
  }, [itemId]);

  // Modal states
  const [showBasicInfoModal, setShowBasicInfoModal] = useState(false);
  const [showCertificationsModal, setShowCertificationsModal] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showAcademicsModal, setShowAcademicsModal] = useState(false);

  // Form states
  const [basicInfo, setBasicInfo] = useState({
    name: applicant?.name || "",
    yearsOfExp: applicant?.yearsOfExp || "",
    bio: applicant?.bio || "",
    skills: applicant?.skills?.join(", ") || "",
    languages: applicant?.languages?.join(", ") || "",
    phoneNumber: applicant?.phoneNumber || "",
  });

  const [certifications, setCertifications] = useState(
    applicant?.certificates || []
  );

  const [experiences, setExperiences] = useState(
    applicant?.WorkExperience || []
  );

  const [academics, setAcademics] = useState(applicant?.education || []);

  // Update form states when applicant changes
  useEffect(() => {
    setBasicInfo({
      name: applicant?.name || "",
      yearsOfExp: applicant?.yearsOfExp || "",
      bio: applicant?.bio || "",
      skills: applicant?.skills?.join(", ") || "",
      languages: applicant?.languages?.join(", ") || "",
      phoneNumber: applicant?.phoneNumber || "",
    });
    setCertifications(applicant?.certificates || []);
    setExperiences(applicant?.WorkExperience || []);
    setAcademics(applicant?.education || []);
  }, [applicant]);

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "N/A"
    );
  };

  const formatExperience = (years: any) => {
    if (years === undefined || years === null || years === "") return undefined;
    if (typeof years === "number") {
      return `${years} ${years === 1 ? "year" : "years"}`;
    }
    if (typeof years === "string") {
      const s = years.trim();
      if (/(year|years|yr|yrs|\+)/i.test(s)) return s;
      if (/^\d+(?:\.\d+)?$/.test(s)) {
        const n = Number(s);
        return `${n} ${n === 1 ? "year" : "years"}`;
      }
      return s;
    }
    return String(years);
  };

  // Handle certificate file view
  const handleViewCertificate = (fileUrl: string) => {
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    } else {
      toast.error("No file available to view");
    }
  };

  const formattedExperience = formatExperience(applicant?.yearsOfExp);

  const handleDownload = async () => {
    if (!applicant) return;
    setPreparingPdf(true);
    try {
      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, "0")}/${String(
        now.getMonth() + 1
      ).padStart(2, "0")}/${now.getFullYear()}`;

      const certifications = (applicant?.certificates || []).map(
        (cert: any) => {
          if (typeof cert === "string") return { name: cert } as any;
          return {
            name: cert?.name || cert?.title,
            issuer: cert?.issuer,
            date: cert?.date,
            description: cert?.description,
            fileUrl: cert?.fileUrl || cert?.certificateUrl || undefined,
            fileName: cert?.fileName || cert?.certificateFileName || undefined,
            mimeType: cert?.mimeType || cert?.certificateMime || undefined,
          };
        }
      );

      const experience_details = (applicant?.WorkExperience || []).map(
        (exp: any) => ({
          title: exp?.title,
          company: exp?.company,
          period: exp?.period || "",
          description: exp?.description,
          points: Array.isArray(exp?.points)
            ? exp.points.map((p: any) => ({ point: p.point || p }))
            : undefined,
        })
      );

      const academics = (applicant?.education || []).map((edu: any) => ({
        level: edu?.Degree,
        institution: edu?.institure || edu?.institute,
        period: edu?.period || undefined,
        gpa: edu?.GPA || undefined,
        description: edu?.description || undefined,
        completed: true,
      }));

      const blob = await pdf(
        <ResumePDF
          data={{
            name: applicant?.name || "Unknown",
            title: applicant?.WorkExperience?.[0]?.title || "Professional",
            location: applicant.location
              ? applicant.location.split(",").slice(-4).join(", ")
              : applicant.locationData && applicant.locationData.address
              ? applicant.locationData.address.split(",").slice(-4).join(", ")
              : "Unknown Location",
            imageUrl:
              applicant?.profile_image_url ||
              applicant?.profilePicture ||
              undefined,

            experience: (() => {
              const exp = applicant?.yearsOfExp;
              if (!exp) return undefined;
              if (typeof exp === "string") {
                let match = exp.match(/(\d+(?:\.\d+)?)/);
                return match ? match[1] : exp;
              }
              return String(exp);
            })(),
            skills: applicant?.skills || [],
            certifications,
            experience_details,
            academics,
            languages: applicant?.languages || [],
            contact: {
              email: applicant?.user?.email,
              phone: applicant?.phoneNumber,
            },
            bio: applicant?.bio || "",
          }}
          generatedOn={formattedDate}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${
        applicant.name?.replace(/\s+/g, "-") || "Profile"
      }-Details.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Error generating PDF. Please try again.");
    } finally {
      setPreparingPdf(false);
    }
  };

  const loc = applicant.location ?? applicant.locationData?.address ?? null;

  // API CALL HANDLERS
  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const response = await fetch(
        `${API_URL}/profile/edit/${applicant._id}/basic`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: basicInfo.name,
            yearsOfExp: basicInfo.yearsOfExp,
            bio: basicInfo.bio,
            skills: basicInfo.skills,
            languages: basicInfo.languages,
            phoneNumber: basicInfo.phoneNumber,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to update basic information");
      }

      const updatedApplicant = {
        ...applicant,
        name: basicInfo.name,
        yearsOfExp: basicInfo.yearsOfExp,
        bio: basicInfo.bio,
        skills: basicInfo.skills
          .split(",")
          .map((s: any) => s.trim())
          .filter(Boolean),
        languages: basicInfo.languages
          .split(",")
          .map((l: any) => l.trim())
          .filter(Boolean),
        phoneNumber: basicInfo.phoneNumber,
      };

      setApplicant(updatedApplicant);

      if (onUpdate && data.profile) {
        onUpdate(data.profile);
      }

      toast.success("✅ Basic information updated successfully!");
      setShowBasicInfoModal(false);
    } catch (error) {
      console.error("Error updating basic info:", error);
      toast.error(
        `❌ ${
          error instanceof Error
            ? error.message
            : "Failed to update basic information"
        }`
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCertificationsSubmit = async () => {
    setIsUpdating(true);

    try {
      // ✅ Create proper JSON payload
      const payload = {
        certifications: certifications.map((cert: any) => ({
          name: cert.name,
          issuer: cert.issuer,
          date: cert.date || null,
          description: cert.description || "",
          fileUrl: cert.fileUrl || "",
          fileName: cert.fileName || "",
          mimeType: cert.mimeType || "",
        })),
      };

      const response = await fetch(
        `${API_URL}/profile/edit/${applicant._id}/certifications`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json", // ✅ IMPORTANT
          },
          body: JSON.stringify(payload), // ✅ Send JSON, not FormData
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to update certifications");
      }

      // ✅ Update local state immediately
      const updatedApplicant = {
        ...applicant,
        certificates: certifications,
      };

      setApplicant(updatedApplicant);

      // ✅ Update parent component
      if (onUpdate && data.profile) {
        onUpdate(data.profile);
      }

      toast.success("✅ Certifications updated successfully!");
      setShowCertificationsModal(false);
    } catch (error) {
      console.error("Error updating certifications:", error);
      toast.error(
        `❌ ${
          error instanceof Error
            ? error.message
            : "Failed to update certifications"
        }`
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExperienceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const response = await fetch(
        `${API_URL}/profile/edit/${applicant._id}/experience`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            experiences: experiences.map((exp: any) => ({
              company: exp.company,
              title: exp.title,
              period: exp.period || null,
              description: exp.description || null,
              points: Array.isArray(exp.points)
                ? exp.points
                    .map((p: any) => ({
                      point: typeof p === "string" ? p : p.point,
                    }))
                    .filter((p: any) => p.point && p.point.trim() !== "")
                : [],
            })),
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to update work experience");
      }

      const updatedApplicant = {
        ...applicant,
        WorkExperience: experiences,
      };

      setApplicant(updatedApplicant);

      if (onUpdate && data.profile) {
        onUpdate(data.profile);
      }

      toast.success("✅ Work experience updated successfully!");
      setShowExperienceModal(false);
    } catch (error) {
      console.error("Error updating experience:", error);
      toast.error(
        `❌ ${
          error instanceof Error
            ? error.message
            : "Failed to update work experience"
        }`
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAcademicsSubmit = async () => {
    setIsUpdating(true);

    try {
      // ✅ Create proper JSON payload
      const payload = {
        education: academics.map((edu: any) => ({
          institure: edu.institure,
          Degree: edu.Degree,
          period: edu.period || null,
          GPA: edu.GPA || null,
          description: edu.description || "",
        })),
      };

      const response = await fetch(
        `${API_URL}/profile/edit/${applicant._id}/education`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json", // ✅ IMPORTANT
          },
          body: JSON.stringify(payload), // ✅ Send JSON, not FormData
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to update education");
      }

      // ✅ Update local state immediately
      const updatedApplicant = {
        ...applicant,
        education: academics,
      };

      setApplicant(updatedApplicant);

      // ✅ Update parent component
      if (onUpdate && data.profile) {
        onUpdate(data.profile);
      }

      toast.success("✅ Education updated successfully!");
      setShowAcademicsModal(false);
    } catch (error) {
      console.error("Error updating education:", error);
      toast.error(
        `❌ ${
          error instanceof Error ? error.message : "Failed to update education"
        }`
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-4 sm:p-6 lg:p-8">
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
          {/* Header with Edit Button */}
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

            <motion.button
              onClick={() => setShowBasicInfoModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer self-start sm:self-auto p-2.5 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              aria-label="Edit basic information"
            >
              <Pencil className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>

          <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>
                {loc ? loc.split(",").slice(-4).join(", ") : "Unknown Location"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                Experience :{" "}
                {formatExperience(applicant.yearsOfExp) || "Not Specified"}
              </span>
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

          {/* Certifications Section - WITH EYE ICON */}
          {/* Certifications Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-medium text-gray-900">
                Certifications from Industry
              </h3>
              <motion.button
                onClick={() => setShowCertificationsModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer p-2.5 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                aria-label="Edit certifications"
              >
                <Pencil className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>
            <div className="space-y-3">
              {applicant.certificates && applicant.certificates.length > 0 ? (
                applicant.certificates.map((cert: any, index: number) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {cert.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Issuer:</span>{" "}
                          {cert.issuer}
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
                      {cert.fileUrl && (
                        <motion.a
                          href={cert.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="cursor-pointer ml-3 p-2.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                          aria-label="View certificate file"
                        >
                          <Eye className="w-5 h-5 text-blue-600" />
                        </motion.a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-gray-500 text-sm">
                  No certifications listed
                </span>
              )}
            </div>
          </div>

          {/* Experience Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-gray-900">
                Experience
              </h3>
              <motion.button
                onClick={() => setShowExperienceModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer p-2.5 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                aria-label="Edit experience"
              >
                <Pencil className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>
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
                        <p className="text-gray-600 font-medium text-sm">
                          {exp.company}
                        </p>
                      </div>
                      {exp.period && (
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {exp.period}
                        </span>
                      )}
                    </div>

                    {(() => {
                      const points: string[] =
                        Array.isArray(exp?.points) && exp.points.length
                          ? exp.points
                              .map((p: any) =>
                                typeof p === "string" ? p : p?.point
                              )
                              .filter(Boolean)
                          : exp?.description
                          ? [exp.description]
                          : [];
                      return points.length > 0 ? (
                        <div className="mt-3">
                          <ul className="space-y-2">
                            {points.map((pt: string, idx: number) => (
                              <li key={idx} className="flex items-start">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                <p className="text-black text-sm leading-relaxed">
                                  {pt}
                                </p>
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
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bio</h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-700 leading-relaxed">
                {applicant.bio || "No bio available."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Academics Section - ENHANCED */}
            <div>
              {/* Academics Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-medium text-gray-900">
                    Academics
                  </h3>
                  <motion.button
                    onClick={() => setShowAcademicsModal(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="cursor-pointer p-2.5 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                    aria-label="Edit academics"
                  >
                    <Pencil className="w-5 h-5 text-gray-600" />
                  </motion.button>
                </div>
                <div className="space-y-4">
                  {applicant.education && applicant.education.length > 0 ? (
                    applicant.education.map((academic: any, index: number) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-3 h-3 rounded-full bg-[#76FF82] flex-shrink-0 mt-1.5"></div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 mb-1">
                              {academic.Degree}
                            </p>
                            <p className="text-sm text-gray-700 mb-1">
                              {academic.institure}
                            </p>
                            {academic.period && (
                              <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Period:</span>{" "}
                                {academic.period}
                              </p>
                            )}
                            {academic.GPA && (
                              <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">GPA:</span>{" "}
                                {academic.GPA}
                              </p>
                            )}
                            {academic.description && (
                              <p className="text-sm text-gray-600 mt-2">
                                {academic.description}
                              </p>
                            )}
                          </div>
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

                {/* ✅ ADD HERE */}
                {applicant.resumeUrl && (
                  <p className="text-gray-700">
                    <span className="font-medium">Resume:</span>{" "}
                    <a
                      href={applicant.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800 cursor-pointer"
                    >
                      Click here to view
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence initial={false} mode="wait">
        {showBasicInfoModal && (
          <BasicInfoModal
            basicInfo={basicInfo}
            setBasicInfo={setBasicInfo}
            onClose={() => setShowBasicInfoModal(false)}
            onSubmit={handleBasicInfoSubmit}
            isUpdating={isUpdating}
          />
        )}
      </AnimatePresence>

      <AnimatePresence initial={false} mode="wait">
        {showCertificationsModal && (
          <CertificationsModal
            certifications={certifications}
            setCertifications={setCertifications}
            onClose={() => setShowCertificationsModal(false)}
            onSubmit={handleCertificationsSubmit}
            isUpdating={isUpdating}
          />
        )}
      </AnimatePresence>

      <AnimatePresence initial={false} mode="wait">
        {showExperienceModal && (
          <ExperienceModal
            experiences={experiences}
            setExperiences={setExperiences}
            onClose={() => setShowExperienceModal(false)}
            onSubmit={handleExperienceSubmit}
            isUpdating={isUpdating}
          />
        )}
      </AnimatePresence>

      <AnimatePresence initial={false} mode="wait">
        {showAcademicsModal && (
          <AcademicsModal
            academics={academics}
            setAcademics={setAcademics}
            onClose={() => setShowAcademicsModal(false)}
            onSubmit={handleAcademicsSubmit}
            isUpdating={isUpdating}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
