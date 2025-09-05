"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import {
  Star,
  Upload,
  GraduationCap,
  Briefcase,
  X,
  ArrowLeft,
  Edit2,
  Search,
  FileText,
  Eye,
  Pencil,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CalendarSection from "./calender";
import { useRouter } from "next/navigation";
import ResumeUpload from "./ResumeUpload";
import JobMatching from "./JobMatching";
import { useUser } from "../context/UserContext";
import { toast } from "react-toastify";

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "education", label: "Education" },
  { id: "experiences", label: "Experiences" },
  { id: "certifications", label: "Certifications" },
  { id: "schedule", label: "Schedule" },
  { id: "resume", label: "Resume & Jobs" },
];

const initialProfileData = {
  profile: {
    bio: "",
    skills: [],
    languages: [],
  },
  education: [],
  experiences: [],
  certifications: [],
  schedule: {
    availability: "Monday - Friday, 9:00 AM - 6:00 PM EST",
    timezone: "Eastern Standard Time",
    preferredMeetingTimes: ["10:00 AM - 12:00 PM", "2:00 PM - 4:00 PM"],
  },
};

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
  const [activeTab, setActiveTab] = useState("resume");
  const { user, profile, updateProfile } = useUser();
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [httpMethod, sethttpMethod] = useState<string>("PUT");
  const [modalType, setModalType] = useState<
    "education" | "experience" | "certificate" | null
  >(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  // Add this near the top with other useRef declarations

  const [profileData, setProfileData] = useState(() => {
    try {
      // First check if profile from context exists and has data
      if (profile && profile._id && profile.name) {
        // Transform the profile data to match expected structure
        const transformedProfile = {
          profile: {
            bio: profile.bio || "",
            skills: profile.skills || [],
            languages: ["English (Native)"], // Default since not in API response
          },
          education:
            profile.education?.map((edu : any , index : any) => ({
              id: index + 1,
              type: edu.Degree || "Degree",
              period: edu.Graduation
                ? new Date(edu.Graduation).getFullYear().toString()
                : "",
              institution: edu.institure || edu.institute || "",
              description: edu.GPA ? `GPA: ${edu.GPA}` : "",
            })) || [],
          experiences:
            profile.WorkExperience?.map((exp : any, index : any) => ({
              id: index + 1,
              title: exp.title || "",
              company: exp.company || "",
              period: "", // Not available in API response
              description: exp.description || "",
            })) || [],
          schedule: {
            availability: "Monday - Friday, 9:00 AM - 6:00 PM EST",
            timezone: "Eastern Standard Time",
            preferredMeetingTimes: ["10:00 AM - 12:00 PM", "2:00 PM - 4:00 PM"],
          },
          certifications:
            profile.certificates?.map((cert : any, index : any) => ({
              id: index + 1,
              name: cert.name || "",
              issuer: cert.issuer || "",
              date: cert.date || "",
              description: cert.description || "",
              certificateUrl: cert.fileUrl || "",
              certificateFileName: cert.fileName || "",
              certificateMime: cert.mimeType || "",
            })) || [],
        };
        return transformedProfile;
      }

      // If no profile from context, try localStorage
      const savedProfile = localStorage.getItem("profileData");
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        return parsedProfile;
      }

      // If no data anywhere, return initial data
      return initialProfileData;
    } catch (error) {
      console.error("Error parsing profile data:", error);
      return initialProfileData;
    }
  });

  // Update profileData when profile from context changes
  useEffect(() => {
    if (profile) {
      const transformedProfile = {
        profile: {
          bio: profile.bio || "",
          skills: profile.skills || [],
          languages: ["English (Native)"],
        },
        education:
          profile.education?.map((edu : any, index : any) => ({
            id: index + 1,
            type: edu.Degree || "Degree",
            period: edu.Graduation
              ? new Date(edu.Graduation).getFullYear().toString()
              : "",
            institution: edu.institure || edu.institute || "",
            description: edu.GPA ? `GPA: ${edu.GPA}` : "",
          })) || [],
        experiences:
          profile.WorkExperience?.map((exp : any, index : any) => ({
            id: index + 1,
            title: exp.title || "",
            company: exp.company || "",
            period: "", // You might want to add start/end dates to your API
            description: exp.description || "",
          })) || [],
        certifications:
          profile.certificates?.map((cert : any, index : any) => ({
            id: index + 1,
            name: cert.name || "",
            issuer: cert.issuer || "",
            date: cert.date || "",
            description: cert.description || "",
            certificateUrl: cert.fileUrl || "",
            certificateFileName: cert.fileName || "",
            certificateMime: cert.mimeType || "",
          })) || [],

        schedule: {
          availability: "Monday - Friday, 9:00 AM - 6:00 PM EST",
          timezone: "Eastern Standard Time",
          preferredMeetingTimes: ["10:00 AM - 12:00 PM", "2:00 PM - 4:00 PM"],
        },
      };

      setProfileData(transformedProfile);
    }
  }, [profile]);

  const [editingItem, setEditingItem] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [showJobMatching, setShowJobMatching] = useState(false);
  // const [userId] = useState("user123"); // In a real app, this would come from authentication
  // const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [previewCert, setPreviewCert] = useState<{
    url: string;
    name?: string;
    type?: string;
  } | null>(null);
  const router = useRouter();

  // New state for profile management
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState("");
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] =
    useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: "",
    location: "",
    bio: "",
    skills: "",
    languages: "",
  });
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  // Check if profile is complete
  const isProfileComplete = () => {
    return (
      profileFormData.name &&
      profileFormData.location &&
      profileData.profile.bio &&
      profileData.profile.skills.length > 0 &&
      profileData.profile.languages.length > 0
    );
  };

  // const [userId] = useState("user123"); // In a real app, this would come from authentication

  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const userId = user?.id;
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

  // Profile picture handling
  const handleProfilePictureUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicture(e.target?.result as string);
        setIsProfilePictureModalOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture("");
    setIsProfilePictureModalOpen(false);
    if (profileFileInputRef.current) {
      profileFileInputRef.current.value = "";
    }
  };

  const renderProfilePicture = () => {
    if (profilePicture) {
      return (
             <>
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg sm:text-xl">
            {profile?.name
              ? profile?.name.charAt(0)
              : user?.name
              ? user?.name.charAt(0)
              : ""}
          </span>
        </div>
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1 truncate">
            {profile?.name ? profile?.name : user?.name ? user?.name : ""}
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">
            {profile?.location ? profile?.location : ""}
          </p>
        </div>
      </>
      );
    }

    return (
      <>
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg sm:text-xl">
            {profile?.name
              ? profile?.name.charAt(0)
              : user?.name
              ? user?.name.charAt(0)
              : ""}
          </span>
        </div>
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1 truncate">
            {profile?.name ? profile?.name : user?.name ? user?.name : ""}
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">
            {profile?.location ? profile?.location : ""}
          </p>
        </div>
      </>
    );
  };

const handleProfileSave = async () => {
  try {
    setIsLoading(true);
    
    const skillsArray: string[] = profileFormData.skills
      ? profileFormData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill)
      : [];
    const languagesArray: string[] = profileFormData.languages
      ? profileFormData.languages
          .split(",")
          .map((lang) => lang.trim())
          .filter((lang) => lang)
      : [];

    const updatedProfileData = {
      ...profileData,
      profile: {
        bio: profileFormData.bio,
        skills: skillsArray,
        languages: languagesArray,
      },
    };

    // Update local state first (optimistic update)
    setProfileData(updatedProfileData);

    // Call API to update profile
    await updateProfileAPI(updatedProfileData);
    
    // Update localStorage
    localStorage.setItem("profileData", JSON.stringify(updatedProfileData));
    
    toast.success("Profile updated successfully!");
    setIsProfileEditOpen(false);
    
  } catch (error) {
    console.error("Failed to update profile:", error);
    // Revert local state on API failure
    setProfileData(profileData);
    toast.error("Failed to update profile. Please try again.");
  } finally {
    setIsLoading(false);
  }
};


const openProfileEditModal = () => {
  setProfileFormData({
    name: profile?.name || user?.name || "",
    location: profile?.location || "",
    bio: profileData.profile.bio || "",
    skills: profileData.profile.skills.join(", ") || "",
    languages: profileData.profile.languages.join(", ") || "",
  });
  setIsProfileEditOpen(true);
};

const updateProfileAPI = async (updatedData: any) => {
  try {
    setIsLoading(true);
    const profileId = profile?._id;
    const hasRealProfileData = profile && profile._id && profile.name;

    let apiUrl: string;
    let method: string;

    if (!profileId) {
      apiUrl = `${process.env.NEXT_PUBLIC_FIREBASE_API_URL}/api/create-profile`;
      method = "POST";
    } else {
      apiUrl = `${process.env.NEXT_PUBLIC_FIREBASE_API_URL}/api/edit-profile/${profileId}`;
      method = "PUT";
    }

    // Create FormData for file uploads
    const formData = new FormData();

    // Add userId
    console.log(user, user?.id)
    formData.append("userId", user ? user?.id : "");
    // formData.append("user", user ? user?.id : "");

    // Handle basic profile fields
    if (updatedData.profile) {
      if (updatedData.profile.bio) {
        formData.append("bio", updatedData.profile.bio);
      }
      if (updatedData.profile.skills) {
        formData.append("skills", JSON.stringify(updatedData.profile.skills));
      }
      if (updatedData.profile.languages) {
        formData.append("languages", JSON.stringify(updatedData.profile.languages));
      }
    }

    // Handle name and location from form
    if (profileFormData.name) {
      formData.append("name", profileFormData.name);
    }
    if (profileFormData.location) {
      formData.append("location", profileFormData.location);
    }

    // Handle education (existing code)
    if (updatedData.education) {
      formData.append(
        "education",
        JSON.stringify(
          updatedData.education
            .map((edu: any) => ({
              institure: edu.institution || edu.institure || "",
              Graduation: edu.period
                ? new Date(`${edu.period}-12-31`).toISOString()
                : undefined,
              Degree: edu.type || edu.Degree || "",
              GPA: edu.description?.includes("GPA:")
                ? edu.description.replace("GPA: ", "")
                : edu.GPA || "",
            }))
            .filter((edu: any) => edu.institure)
        )
      );
    }

    // Handle work experience (existing code)
    if (updatedData.experiences) {
      formData.append(
        "WorkExperience",
        JSON.stringify(
          updatedData.experiences
            .map((exp: any) => ({
              company: exp.company || "",
              title: exp.title || "",
              description: exp.description || "",
            }))
            .filter((exp: any) => exp.company)
        )
      );
    }

    // Handle certificates (existing code)
    if (updatedData.certifications) {
      const certData = updatedData.certifications.map((cert: any) => ({
        name: cert.name || "Unknown Certificate",
        issuer: cert.issuer || "Unknown Issuer",
        date: cert.date || "Unknown Date",
        description: cert.description || "",
      }));

      formData.append("certificates", JSON.stringify(certData));
    }

    // Add certificate files if any (existing code)
    updatedData.certifications?.forEach((cert: any) => {
      if (cert.certificateFile instanceof File) {
        formData.append("certificateFiles", cert.certificateFile);
      }
    });

    const response = await fetch(apiUrl, {
      method: method,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Response:", errorData);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${
          errorData.message || "Unknown error"
        }`
      );
    }

    const result = await response.json();
    console.log("Profile updated successfully:", result);

    if (result.profile && updateProfile) {
      updateProfile(result.profile);
    }
    return result;
  } catch (error: any) {
    toast.error(error.message);
    console.error("Error updating profile:", error);
    throw error;
  } finally {
    setIsLoading(false);
  }
};


  useEffect(() => {
    if (user && user.signedUpAs === "Company") {
      // Show toast notification (you can replace this with your preferred toast library)
      toast.info(
        "You are signed up as a company. Redirecting to company profile..."
      );
      router.push("/company/profile");
    }
  }, [user, router]);

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
              className={`w-4 h-4 sm:w-5 sm:h-5 ${
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

  const renderAddCard = (
    title: string,
    description: string,
    buttonText: string,
    icon: React.ReactNode,
    type: "education" | "experience" | "certificate"
  ) => {
    return (
      <motion.div
        variants={cardVariants}
        whileHover={{
          y: -4,
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white rounded-xl p-6 sm:p-8 shadow-sm text-center border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-4"
        >
          {icon}
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4"
        >
          {title}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8"
        >
          {description}
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => openModal(type)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-full transition-colors text-sm sm:text-base"
        >
          {buttonText}
        </motion.button>
      </motion.div>
    );
  };

  const openEditModal = (
    type: "education" | "experience" | "certificate",
    item: any
  ) => {
    setModalType(type);
    setEditingItem(item);
    setIsEditMode(true);
    setFormData(item);
    setIsModalOpen(true);
  };

  const openModal = (type: "education" | "experience" | "certificate") => {
    setModalType(type);
    setEditingItem(null);
    setIsEditMode(false);
    setFormData({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setEditingItem(null);
    setIsEditMode(false);
    setFormData({});
    setPreviewCert(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Modified handleSubmit function
  // Modified handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let updatedProfileData;

    if (isEditMode && editingItem && modalType) {
      // Update existing item
      updatedProfileData = {
        ...profileData,
        [modalType === "certificate"
          ? "certifications"
          : modalType === "education"
          ? "education"
          : "experiences"]: profileData[
          modalType === "certificate"
            ? "certifications"
            : modalType === "education"
            ? "education"
            : "experiences"
        ].map((item: any) =>
          item.id === editingItem.id
            ? {
                ...item,
                ...formData,
                certificateUrl: formData.certificateUrl ?? item.certificateUrl,
                certificateMime:
                  formData.certificateMime ?? item.certificateMime,
                certificateFileName:
                  formData.certificateFileName ?? item.certificateFileName,
              }
            : item
        ),
      };
    } else if (modalType) {
      // Add new item
      const newItem = {
        ...formData,
        id: Date.now(),
      };

      updatedProfileData = {
        ...profileData,
        [modalType === "certificate"
          ? "certifications"
          : modalType === "education"
          ? "education"
          : "experiences"]: [
          ...profileData[
            modalType === "certificate"
              ? "certifications"
              : modalType === "education"
              ? "education"
              : "experiences"
          ],
          newItem,
        ],
      };
    }

    if (updatedProfileData) {
      try {
        // Update local state first (optimistic update)
        setProfileData(updatedProfileData);

        // Call API to update profile
        const result = await updateProfileAPI(updatedProfileData);

        // Only update localStorage if API call was successful
        localStorage.setItem("profileData", JSON.stringify(updatedProfileData));

        toast.success("Profile updated successfully!");
      } catch (error) {
        console.error("Failed to update profile:", error);

        // Revert local state on API failure
        setProfileData(profileData);

        // Don't update localStorage on error
      }
    }

    closeModal();
  };

  const handleProfileFieldUpdate = async (field: string, value: any) => {
    try {
      const updatedProfileData = {
        ...profileData,
        profile: {
          ...profileData.profile,
          [field]: value,
        },
      };

      setProfileData(updatedProfileData);
      await updateProfileAPI(updatedProfileData);
      localStorage.setItem("profileData", JSON.stringify(updatedProfileData));
    } catch (error) {
      console.error("Failed to update profile field:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const renderModal = () => {
    if (!isModalOpen || !modalType) return null;

    const modalContent = {
      education: {
        title: isEditMode ? "Edit Education" : "Add Education",
        fields: [
          {
            name: "type",
            label: "Degree Type",
            placeholder: "e.g., Bachelor's, Master's",
          },
          {
            name: "institution",
            label: "Institution",
            placeholder: "University name",
          },
          { name: "period", label: "Period", placeholder: "e.g., 2020-2024" },
          {
            name: "description",
            label: "Description (Optional)",
            placeholder: "Additional details",
            type: "textarea",
          },
        ],
      },
      experience: {
        title: isEditMode ? "Edit Experience" : "Add Experience",
        fields: [
          {
            name: "title",
            label: "Job Title",
            placeholder: "e.g., Senior Software Engineer",
          },
          { name: "company", label: "Company", placeholder: "Company name" },
          {
            name: "period",
            label: "Period",
            placeholder: "e.g., 2023-Present",
          },
          {
            name: "description",
            label: "Description",
            placeholder: "Describe your role and achievements",
            type: "textarea",
          },
        ],
      },
      certificate: {
        title: isEditMode ? "Edit Certificate" : "Add Certificate",
        fields: [
          {
            name: "name",
            label: "Certificate Name",
            placeholder: "e.g., AWS Solutions Architect",
          },
          {
            name: "issuer",
            label: "Issuing Organization",
            placeholder: "e.g., Amazon Web Services",
          },
          {
            name: "date",
            label: "Issue Date",
            placeholder: "e.g., March 2023",
          },
          {
            name: "description",
            label: "Description (Optional)",
            placeholder: "Additional details",
            type: "textarea",
          },
        ],
      },
    };

    const config = modalContent[modalType];

    const handleCertificateFileChange = (file: File | null) => {
      if (!file) return;
      const url = URL.createObjectURL(file);
      setFormData((prev: any) => ({
        ...prev,
        certificateUrl: url,
        certificateMime: file.type,
        certificateFileName: file.name,
        certificateFile: file, // Store the actual file for upload
      }));
    };

    const isPdf = (mime?: string, url?: string) =>
      (mime && mime.includes("pdf")) ||
      (url && url.toLowerCase().endsWith(".pdf"));

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-[#00000035] bg-opacity-10 flex items-center justify-center z-50 p-4 text-black"
          onClick={closeModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                {config.title}
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </motion.button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {config.fields.map((field, index) => (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      placeholder={field.placeholder}
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        handleInputChange(field.name, e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none h-20 sm:h-24 text-sm sm:text-base"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        handleInputChange(field.name, e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                    />
                  )}
                </motion.div>
              ))}

              {modalType === "certificate" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: config.fields.length * 0.1,
                    duration: 0.3,
                  }}
                  className="space-y-2"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificate File (PDF or image)
                  </label>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) =>
                      handleCertificateFileChange(e.target.files?.[0] || null)
                    }
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {formData.certificateUrl && (
                    <div className="mt-3 border border-gray-200 rounded-lg p-2">
                      <p className="text-xs text-gray-500 mb-2">
                        {formData.certificateFileName || "Selected file"}
                      </p>
                      {isPdf(
                        formData.certificateMime,
                        formData.certificateUrl
                      ) ? (
                        <iframe
                          src={formData.certificateUrl}
                          title="Certificate preview"
                          className="w-full h-64 rounded-md"
                        />
                      ) : (
                        <img
                          src={formData.certificateUrl || "/placeholder.svg"}
                          alt="Certificate preview"
                          className="w-full max-h-64 object-contain rounded-md"
                        />
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: (config.fields.length + 1) * 0.1,
                  duration: 0.3,
                }}
                className="flex flex-col sm:flex-row gap-3 pt-4"
              >
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  {isEditMode
                    ? "Save Changes"
                    : `Add ${
                        modalType === "certificate"
                          ? "Certificate"
                          : modalType === "education"
                          ? "Education"
                          : "Experience"
                      }`}
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      // Replace the entire profile case with this corrected version:
      case "profile":
        return (
          <motion.div
            key="profile"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-8 sm:space-y-12 text-black"
          >
            {/* Check if profile is incomplete */}
            {!profileData.profile.bio ||
            profileData.profile.skills.length === 0 ? (
              <motion.div variants={itemVariants} className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Complete Your Profile
                </h3>
                <p className="text-gray-600 mb-6">
                  Add your information to get started
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openProfileEditModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full transition-colors"
                >
                  Add Profile Information
                </motion.button>
              </motion.div>
            ) : (
              <>
                <motion.div variants={itemVariants}>
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-black">
                    About
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                    {profileData.profile.bio}
                  </p>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                    Skills
                  </h3>
                  <motion.div
                    className="flex flex-wrap gap-2 sm:gap-3"
                    variants={containerVariants}
                    transition={{ staggerChildren: 0.1 }}
                  >
                    {profileData.profile.skills.map(
                      (skill: string, index: number) => (
                        <motion.span
                          key={index}
                          variants={skillVariants}
                          whileHover={{ scale: 1.05, y: -2 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-medium cursor-default"
                        >
                          {skill}
                        </motion.span>
                      )
                    )}
                  </motion.div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                    Languages
                  </h3>
                  <motion.ul
                    className="space-y-2 sm:space-y-3"
                    variants={containerVariants}
                    transition={{ staggerChildren: 0.1 }}
                  >
                    {profileData.profile.languages.map(
                      (language: string, index: number) => (
                        <motion.li
                          key={index}
                          variants={itemVariants}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="text-gray-600 text-sm sm:text-base"
                        >
                          {language}
                        </motion.li>
                      )
                    )}
                  </motion.ul>
                </motion.div>
              </>
            )}
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
            className="space-y-4 sm:space-y-5"
          >
            {profileData.education.map((edu  : any, index : any) => (
              <motion.div
                key={edu.id}
                variants={cardVariants}
                whileHover={{
                  y: -4,
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-white rounded-xl p-4 sm:p-5 shadow-sm relative group"
              >
                <motion.button
                  onClick={() => openEditModal("education", edu)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors "
                  aria-label="Edit education"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </motion.button>

                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 pr-10">
                  {edu.type}
                </h3>
                <p className="text-gray-500 text-sm sm:text-base mb-3 sm:mb-4">
                  {edu.period}
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  {edu.institution}
                </p>
              </motion.div>
            ))}

            {renderAddCard(
              "Add Education",
              "Add your educational background to showcase your qualifications",
              "Add Education",
              <GraduationCap className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto" />,
              "education"
            )}
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
            className="space-y-4 sm:space-y-5"
          >
            {profileData.experiences.map((exp: any, index: number) => (
              <motion.div
                key={exp.id}
                variants={cardVariants}
                whileHover={{
                  y: -4,
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-white rounded-xl p-4 sm:p-5 shadow-sm relative group"
              >
                <motion.button
                  onClick={() => openEditModal("experience", exp)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors "
                  aria-label="Edit experience"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </motion.button>

                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 pr-10">
                  {exp.title}
                </h3>
                <p className="text-blue-600 font-medium text-sm sm:text-base mb-2">
                  {exp.company}
                </p>
                <p className="text-gray-500 text-sm sm:text-base mb-3 sm:mb-4">
                  {exp.period}
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  {exp.description}
                </p>
              </motion.div>
            ))}

            {renderAddCard(
              "Add Experience",
              "Add your work experience to highlight your professional journey",
              "Add Experience",
              <Briefcase className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto" />,
              "experience"
            )}
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
            className="space-y-6 sm:space-y-8"
          >
            {profileData.certifications.map((cert: any) => (
              <motion.div
                key={cert.id}
                variants={cardVariants}
                whileHover={{
                  y: -4,
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-3 sm:space-y-4 bg-white rounded-xl p-4 sm:p-5 shadow-sm relative group"
              >
                <motion.button
                  onClick={() => openEditModal("certificate", cert)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors "
                  aria-label="Edit certificate"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </motion.button>

                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 pr-10">
                  {cert.name}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Issued by: {cert.issuer}
                </p>
                <p className="text-gray-500 text-sm sm:text-base">
                  Date: {cert.date}
                </p>
                {cert.description && (
                  <p className="text-gray-600 text-sm sm:text-base">
                    {cert.description}
                  </p>
                )}

                {cert.certificateUrl && (
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() =>
                        setPreviewCert({
                          url: cert.certificateUrl,
                          name: cert.name,
                          type: cert.certificateMime,
                        })
                      }
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                    >
                      <Eye className="w-4 h-4" />
                      View Certificate
                    </button>
                    <a
                      href={cert.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                    >
                      <FileText className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                )}
              </motion.div>
            ))}

            {renderAddCard(
              "Add Certificate",
              "Upload your certificates to showcase your qualifications",
              "Add Certificate",
              <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto" />,
              "certificate"
            )}

            {/* Certificate Preview Modal */}
            <AnimatePresence>
              {previewCert && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
                  onClick={() => setPreviewCert(null)}
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {previewCert.name || "Certificate Preview"}
                      </p>
                      <button
                        onClick={() => setPreviewCert(null)}
                        className="p-2 rounded-md hover:bg-gray-100"
                        aria-label="Close preview"
                      >
                        <X className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                    <div className="p-4 bg-gray-50">
                      {previewCert.type?.includes("pdf") ? (
                        <iframe
                          src={previewCert.url}
                          title="Certificate PDF"
                          className="w-full h-[70vh] rounded-md bg-white"
                        />
                      ) : (
                        <img
                          src={previewCert.url || "/placeholder.svg"}
                          alt="Certificate image"
                          className="w-full max-h-[70vh] object-contain rounded-md bg-white"
                        />
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
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
            className="w-full"
          >
            <CalendarSection />
          </motion.div>
        );

      case "resume":
        return (
          <motion.div
            key="resume"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-6"
          >
            {!showJobMatching ? (
              <div className="space-y-6">
                {/* Resume Upload Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Resume Management
                    </h3>
                    {currentResumeId && (
                      <button
                        onClick={() => setShowJobMatching(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Search className="w-4 h-4" />
                        Find Matching Jobs
                      </button>
                    )}
                  </div>

                  <ResumeUpload
                    userId={userId ? userId : "" }
                    onUploadComplete={(data) => {
                      setCurrentResumeId(data.resumeId);
                    }}
                  />

                  {currentResumeId && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        <span className="text-green-800 font-medium">
                          Resume uploaded successfully!
                        </span>
                      </div>
                      <p className="text-green-700 text-sm mt-1">
                        You can now search for matching jobs using our
                        AI-powered matching system.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Job Matching Section */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    AI-Powered Job Matches
                  </h3>
                  <button
                    onClick={() => setShowJobMatching(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Resume
                  </button>
                </div>

                {currentResumeId && (
                  <JobMatching resumeId={currentResumeId} userId={userId ? userId : "" } />
                )}
              </div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] overflow-x-hidden">
      {renderModal()}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-4 sm:top-8 left-4 sm:left-8"
      >
        <h1 className="text-base sm:text-lg font-semibold text-gray-900">
          Logo
        </h1>
      </motion.div>

      <div className="pt-16 sm:pt-24 pb-8 sm:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12 gap-4 sm:gap-6"
          >
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderProfilePicture()}
                </motion.div>

                {/* Pencil Icon for Profile Picture */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsProfilePictureModalOpen(true)}
                  className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-5 sm:h-5 p-1 bg-blue-600
                   hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                >
                  <Pencil className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </motion.button>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8">
              {renderStars()}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (isProfileComplete()) {
                    openProfileEditModal();
                  } else {
                    setActiveTab("profile");
                    openProfileEditModal();
                  }
                }}
                className="rounded-full px-4 sm:px-6 py-1.5 sm:py-2 border border-[#12372B] text-gray-700 bg-transparent hover:bg-gray-50 transition-colors text-sm sm:text-base whitespace-nowrap"
              >
                {isProfileComplete() ? "Edit Profile" : "Add Profile"}
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative mb-8 sm:mb-12"
          >
            <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
              {tabs.map((tab, index) => (
                <motion.button
                  key={tab.id}
                  ref={(el) => {
                    tabsRef.current[index] = el;
                  }}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  className={`px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
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

          <div className="min-h-[300px] sm:min-h-[400px]">
            <AnimatePresence mode="wait">{renderTabContent()}</AnimatePresence>
          </div>
        </div>
      </div>

      {/* Profile Picture Upload Modal */}
      <AnimatePresence>
        {isProfilePictureModalOpen && (
          <motion.div
            key="profile-picture-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-modal="true"
            role="dialog"
            aria-labelledby="profile-picture-title"
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfilePictureModalOpen(false)}
            />

            {/* Dialog */}
            <motion.div
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  id="profile-picture-title"
                  className="text-lg font-semibold text-gray-900"
                >
                  Profile Picture
                </h2>
                <button
                  onClick={() => setIsProfilePictureModalOpen(false)}
                  aria-label="Close"
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-full overflow-hidden">
                    {profilePicture ? (
                      <img
                        src={profilePicture}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">No photo</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <input
                    ref={profileFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                  />

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => profileFileInputRef.current?.click()}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                  >
                    Upload Photo
                  </motion.button>

                  {profilePicture && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRemoveProfilePicture}
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                    >
                      Remove Photo
                    </motion.button>
                  )}
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Supported formats: JPG, PNG, SVG. Max size: 5MB
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {isProfileEditOpen && (
          <motion.div
            key="profile-edit-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-modal="true"
            role="dialog"
            aria-labelledby="profile-edit-title"
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileEditOpen(false)}
            />

            {/* Dialog */}
            <motion.div
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 text-gray-500 max-h-[90vh] overflow-y-auto"
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  id="profile-edit-title"
                  className="text-xl font-semibold text-gray-900"
                >
                  {isProfileComplete()
                    ? "Edit Profile"
                    : "Add Profile Information"}
                </h2>
                <button
                  onClick={() => setIsProfileEditOpen(false)}
                  aria-label="Close"
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileFormData.name}
                    onChange={(e) =>
                      setProfileFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g., John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profileFormData.location}
                    onChange={(e) =>
                      setProfileFormData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    placeholder="e.g., USA, Michigan"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    About
                  </label>
                  <textarea
                    value={profileFormData.bio}
                    onChange={(e) =>
                      setProfileFormData((prev) => ({
                        ...prev,
                        bio: e.target.value,
                      }))
                    }
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Skills
                  </label>
                  <input
                    type="text"
                    value={profileFormData.skills}
                    onChange={(e) =>
                      setProfileFormData((prev) => ({
                        ...prev,
                        skills: e.target.value,
                      }))
                    }
                    placeholder="e.g., JavaScript, React, Python (comma separated)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Languages
                  </label>
                  <input
                    type="text"
                    value={profileFormData.languages}
                    onChange={(e) =>
                      setProfileFormData((prev) => ({
                        ...prev,
                        languages: e.target.value,
                      }))
                    }
                    placeholder="e.g., English (Native), Spanish (Intermediate) (comma separated)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-full border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsProfileEditOpen(false)}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  onClick={handleProfileSave}
                >
                  Save
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
