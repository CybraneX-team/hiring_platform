"use client";

import { useState } from "react";
import { ArrowLeft, Bot, Plus, X, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import JobHeader from "@/app/components/jobHeader";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import { toast } from "react-toastify";

export default function PostRole() {
  const [activePayRange, setActivePayRange] = useState("Daily");
  const [companyPerksInput, setCompanyPerksInput] = useState("");
  const [companyPerks, setCompanyPerks] = useState<string[]>([]);
  const [requiredSkillsetInput, setRequiredSkillsetInput] = useState("");
  const [requiredSkillset, setRequiredSkillset] = useState<string[]>([]);
  const [mandatoryCertificatesInput, setMandatoryCertificatesInput] =
    useState("");
  const [mandatoryCertificates, setMandatoryCertificates] = useState<string[]>(
    []
  );

  const [payRange, setPayRange] = useState("₹12,000-60,000");
  const [aboutJob, setAboutJob] = useState("");
  const [jobTittle, setjobTittle] = useState("");

  const [workStartDate, setWorkStartDate] = useState("2025-08-04");
  const [workEndDate, setWorkEndDate] = useState("2025-08-11");

  const [workLocation, setWorkLocation] = useState("");
  const [locationMethod, setLocationMethod] = useState("auto"); // 'auto' or 'manual'
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const [customQuestions, setCustomQuestions] = useState<
    Array<{
      id: number;
      question: string;
      type: "MCQ" | "Single Choice";
      options: string[];
    }>
  >([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentQuestionType, setCurrentQuestionType] = useState<
    "MCQ" | "Single Choice"
  >("MCQ");
  const [currentOption, setCurrentOption] = useState("");
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [educationQualificationInput, setEducationQualificationInput] =
    useState("");
  const [educationQualifications, setEducationQualifications] = useState<
    string[]
  >([]);
  const [responsibilityInput, setResponsibilityInput] = useState("");
  const [responsibilities, setResponsibilities] = useState<string[]>([]);

  const [pendingQualifications, setPendingQualifications] = useState<string[]>(
    []
  );
  const [showSplitPreview, setShowSplitPreview] = useState(false);
  const [pendingResponsibilities, setPendingResponsibilities] = useState<
    string[]
  >([]);
  const [showResponsibilitySplitPreview, setShowResponsibilitySplitPreview] =
    useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const [fatAdded, setFatAdded] = useState(false);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=YOUR_API_KEY`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const result = data.results[0];
          const city =
            result.components.city ||
            result.components.town ||
            result.components.village;
          const state = result.components.state;
          const country = result.components.country;
          return `${city ? city + ", " : ""}${
            state ? state + ", " : ""
          }${country}`;
        }
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
    }
    return `Location: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
  };

  const requestLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log("[v0] Got coordinates:", latitude, longitude);

          const address = await reverseGeocode(latitude, longitude);
          console.log("[v0] Converted to address:", address);

          setWorkLocation(address);
          setLocationMethod("auto");
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your location. Please enter manually.");
          setLocationMethod("manual");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setLocationMethod("manual");
    }
  };

  const addPerk = () => {
    console.log("[v0] Adding perk:", companyPerksInput);
    if (
      companyPerksInput.trim() &&
      !companyPerks.includes(companyPerksInput.trim())
    ) {
      setCompanyPerks([...companyPerks, companyPerksInput.trim()]);
      setCompanyPerksInput("");
    }
  };

  const removePerk = (perkToRemove: string) => {
    setCompanyPerks(companyPerks.filter((perk) => perk !== perkToRemove));
  };

  const addSkill = () => {
    console.log("[v0] Adding skill:", requiredSkillsetInput);
    if (
      requiredSkillsetInput.trim() &&
      !requiredSkillset.includes(requiredSkillsetInput.trim())
    ) {
      setRequiredSkillset([...requiredSkillset, requiredSkillsetInput.trim()]);
      setRequiredSkillsetInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setRequiredSkillset(
      requiredSkillset.filter((skill) => skill !== skillToRemove)
    );
  };

  const addCertificate = () => {
    console.log("[v0] Adding certificate:", mandatoryCertificatesInput);
    if (
      mandatoryCertificatesInput.trim() &&
      !mandatoryCertificates.includes(mandatoryCertificatesInput.trim())
    ) {
      setMandatoryCertificates([
        ...mandatoryCertificates,
        mandatoryCertificatesInput.trim(),
      ]);
      setMandatoryCertificatesInput("");
    }
  };

  const removeCertificate = (certificateToRemove: string) => {
    setMandatoryCertificates(
      mandatoryCertificates.filter((cert) => cert !== certificateToRemove)
    );
  };

  const addOptionToCurrentQuestion = () => {
    console.log("[v0] Adding option:", currentOption);
    if (
      currentOption.trim() &&
      !currentOptions.includes(currentOption.trim())
    ) {
      setCurrentOptions([...currentOptions, currentOption.trim()]);
      setCurrentOption("");
    }
  };

  const removeOptionFromCurrentQuestion = (optionToRemove: string) => {
    setCurrentOptions(
      currentOptions.filter((option) => option !== optionToRemove)
    );
  };

  const addCustomQuestion = () => {
    console.log(
      "[v0] Adding custom question:",
      currentQuestion,
      currentOptions
    );
    if (currentQuestion.trim() && currentOptions.length > 0) {
      const newQuestion = {
        id: Date.now(),
        question: currentQuestion.trim(),
        type: currentQuestionType,
        options: [...currentOptions],
      };
      setCustomQuestions([...customQuestions, newQuestion]);
      setCurrentQuestion("");
      setCurrentOptions([]);
      setCurrentOption("");
    }
  };

  const removeCustomQuestion = (questionId: number) => {
    setCustomQuestions(customQuestions.filter((q) => q.id !== questionId));
  };

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const year = date.getFullYear();

    const suffix =
      day === 1 || day === 21 || day === 31
        ? "st"
        : day === 2 || day === 22
        ? "nd"
        : day === 3 || day === 23
        ? "rd"
        : "th";

    return `${day}${suffix} ${month} ${year}`;
  };
  // Education Qualifications functions
  const addEducationQualification = () => {
    console.log(
      "[v0] Adding education qualification:",
      educationQualificationInput
    );
    if (educationQualificationInput.trim()) {
      // Split only on bullet points, pipes, semicolons, and clear line breaks
      const splitQualifications = educationQualificationInput
        .split(/[•|;]|\n{1,}|(?:\s*•\s*)/)
        .map((q) => q.trim())
        .filter((q) => q.length > 0)
        .filter((q) => !educationQualifications.includes(q));

      if (splitQualifications.length > 0) {
        setEducationQualifications([
          ...educationQualifications,
          ...splitQualifications,
        ]);
        setEducationQualificationInput("");
      }
    }
  };

  const confirmSplitQualifications = () => {
    const newQualifications = pendingQualifications.filter(
      (q) => !educationQualifications.includes(q)
    );
    setEducationQualifications([
      ...educationQualifications,
      ...newQualifications,
    ]);
    setEducationQualificationInput("");
    setShowSplitPreview(false);
    setPendingQualifications([]);
  };

  const removeEducationQualification = (qualificationToRemove: string) => {
    setEducationQualifications(
      educationQualifications.filter(
        (qualification) => qualification !== qualificationToRemove
      )
    );
  };

  // Responsibilities functions
  // Responsibilities functions
  const addResponsibility = () => {
    console.log("[v0] Adding responsibility:", responsibilityInput);
    if (responsibilityInput.trim()) {
      // Smart splitting for responsibilities - split on bullet points, pipes, semicolons, and clear line breaks
      const splitResponsibilities = responsibilityInput
        .split(/[•|;]|\n{1,}|(?:\s*•\s*)/)
        .map((r) => r.trim())
        .filter((r) => r.length > 0)
        .filter((r) => !responsibilities.includes(r));

      if (splitResponsibilities.length > 0) {
        setResponsibilities([...responsibilities, ...splitResponsibilities]);
        setResponsibilityInput("");
      }
    }
  };

  const removeResponsibility = (responsibilityToRemove: string) => {
    setResponsibilities(
      responsibilities.filter(
        (responsibility) => responsibility !== responsibilityToRemove
      )
    );
  };

  const confirmSplitResponsibilities = () => {
    const newResponsibilities = pendingResponsibilities.filter(
      (r) => !responsibilities.includes(r)
    );
    setResponsibilities([...responsibilities, ...newResponsibilities]);
    setResponsibilityInput("");
    setShowResponsibilitySplitPreview(false);
    setPendingResponsibilities([]);
  };

  const router = useRouter();
  const { user } = useUser();
  const handleSubmit = async () => {
    // Basic validation
    if (!jobTittle.trim()) {
      toast.error("Job title is required");
      return;
    }

    // if (!user?.id) {
    //   toast.error("User not authenticated");
    //   return;
    // }

    setIsPosting(true);

    try {
      const jobData = {
        company: `${user?.id}`,
        userId: `${user?.id}`,
        title: jobTittle,
        jobType: "Part-time",
        companyPerks,
        requiredSkillset,
        mandatoryCertificates,
        educationQualifications,
        responsibilities,
        payRange,
        payRangeType: activePayRange,
        workStartDate,
        workEndDate,
        workLocation,
        description: aboutJob,
        customQuestions,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FIREBASE_API_URL}/api/jobs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(jobData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Job posted successfully!");
        router.push("/company/profile");
      } else {
        toast.error(data.message || "Failed to post job");
      }
    } catch (error) {
      console.error("Error posting job:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] ">
      <JobHeader />
      <div className="max-w-5xl md:mx-auto p-8 -mx-5">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 md:p-8 shadow-sm"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
                <span className="text-purple-700 font-semibold text-sm">R</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Post a Role
              </h1>
              <span className="text-gray-500 text-lg">Role - 1</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isPosting}
              className={`rounded-full text-black font-medium text-sm px-10 py-2 transition-colors ${
                isPosting
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#76FF82] hover:bg-green-300"
              }`}
            >
              {isPosting ? "Posting..." : "Post"}
            </motion.button>
          </div>

          {/* Form Fields */}
          <div className="space-y-3 my-3">
            <label className="text-sm font-medium text-gray-700">
              Job Tittle
            </label>

            {/* Location Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={jobTittle}
                onChange={(e) => setjobTittle(e.target.value)}
                placeholder="Enter Job Tittle"
                className="w-48 px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* World Map Interface */}
          </div>
          <div className="space-y-8">
            {/* Company Perks */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Add company perks
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={companyPerksInput}
                  onChange={(e) => setCompanyPerksInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addPerk()}
                  placeholder="Perks..."
                  className="w-48 px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={addPerk}
                  className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {/* Display Added Perks */}
              {companyPerks.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {companyPerks.map((perk, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm"
                    >
                      <span>{perk}</span>
                      <button
                        onClick={() => removePerk(perk)}
                        className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Required Skillset */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Add required skillset
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={requiredSkillsetInput}
                  onChange={(e) => setRequiredSkillsetInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addSkill()}
                  placeholder="Type your skills"
                  className="w-48 px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={addSkill}
                  className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {/* Display Added Skills */}
              {requiredSkillset.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {requiredSkillset.map((skill, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm"
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => removeSkill(skill)}
                        className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Mandatory Certifications */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Mandatory Certifications
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mandatoryCertificatesInput}
                  onChange={(e) =>
                    setMandatoryCertificatesInput(e.target.value)
                  }
                  onKeyPress={(e) => e.key === "Enter" && addCertificate()}
                  placeholder="Enter certificates"
                  className="w-48 px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={addCertificate}
                  className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {/* Display Added Certificates */}
              {mandatoryCertificates.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {mandatoryCertificates.map((cert, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm"
                    >
                      <span>{cert}</span>
                      <button
                        onClick={() => removeCertificate(cert)}
                        className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Education Qualifications
              </label>
              <div className="text-xs text-gray-500">
                💡 Tip: You can paste multiple qualifications separated by • - |
                or line breaks, and we'll split them automatically
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={educationQualificationInput}
                  onChange={(e) =>
                    setEducationQualificationInput(e.target.value)
                  }
                  onKeyPress={(e) =>
                    e.key === "Enter" && addEducationQualification()
                  }
                  placeholder="Enter education qualification (e.g., BE Mechanical Engineer)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={addEducationQualification}
                  className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

            {/* FAT Toggle (accent green) */}
            <div className="pt-2">
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    FAT included?
                  </span>
                  <span className="text-xs text-gray-500">
                    (food, accommodation, travel)
                  </span>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={fatAdded}
                  aria-label="Toggle enforcing certificates"
                  onClick={() => setFatAdded((v) => !v)}
                  className={`relative inline-flex items-center h-7 w-18 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    fatAdded ? "bg-[#76FF82]" : "bg-gray-200"
                  }`}
                >
                  {/* moving knob */}
                  <motion.span
                    className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm"
                    animate={{ x: fatAdded ? 44 : 0 }}
                    transition={{ type: "spring", stiffness: 360, damping: 28 }}
                  />
                  {/* on/off label */}
                  <motion.span
                    key={fatAdded ? "on" : "off"}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 0 }}
                    className={`w-full text-center text-sm font-semibold ${
                      fatAdded ? "text-black" : "text-gray-600"
                    }`}
                  >
                    {fatAdded ? "yes" : "no"}
                  </motion.span>
                </button>
              </div>
            </div>
            {/* end FAT Toggle */}

              {/* Display Added Education Qualifications */}
              {educationQualifications.length > 0 && (
                <div className="space-y-2 mt-3">
                  {educationQualifications.map((qualification, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <span className="text-blue-800 text-sm font-medium">
                          {qualification}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          removeEducationQualification(qualification)
                        }
                        className="w-6 h-6 flex items-center justify-center text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Split Preview Modal */}
              {showSplitPreview && (
                <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm font-medium text-blue-800 mb-2">
                    We detected multiple qualifications. Split them into
                    separate items?
                  </div>
                  <div className="space-y-1 mb-3">
                    {pendingQualifications.map((qual, index) => (
                      <div key={index} className="text-sm text-blue-700 pl-4">
                        • {qual}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={confirmSplitQualifications}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                      Yes, Split Them
                    </button>
                    <button
                      onClick={() => {
                        setEducationQualifications([
                          ...educationQualifications,
                          educationQualificationInput.trim(),
                        ]);
                        setEducationQualificationInput("");
                        setShowSplitPreview(false);
                      }}
                      className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                    >
                      Keep as One Item
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Job Responsibilities - ADD THIS HERE */}
            {/* Job Responsibilities */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Job Responsibilities
              </label>
              <div className="text-xs text-gray-500">
                💡 Tip: You can paste multiple responsibilities separated by • |
                ; or line breaks, and we'll split them automatically
              </div>
              <div className="flex gap-2">
                <textarea
                  value={responsibilityInput}
                  onChange={(e) => setResponsibilityInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && !e.shiftKey && addResponsibility()
                  }
                  placeholder="Enter responsibilities (e.g., Review and preparing ITP • Coordinate with site team • Attending inspection calls)"
                  rows={3}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 text-black resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={addResponsibility}
                  className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors self-start"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Split Preview Modal for Responsibilities */}
              {showResponsibilitySplitPreview && (
                <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm font-medium text-green-800 mb-2">
                    We detected multiple responsibilities. Split them into
                    separate items?
                  </div>
                  <div className="space-y-1 mb-3">
                    {pendingResponsibilities.map((resp, index) => (
                      <div key={index} className="text-sm text-green-700 pl-4">
                        • {resp}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={confirmSplitResponsibilities}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                    >
                      Yes, Split Them
                    </button>
                    <button
                      onClick={() => {
                        setResponsibilities([
                          ...responsibilities,
                          responsibilityInput.trim(),
                        ]);
                        setResponsibilityInput("");
                        setShowResponsibilitySplitPreview(false);
                      }}
                      className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                    >
                      Keep as One Item
                    </button>
                  </div>
                </div>
              )}

              {/* Display Added Responsibilities */}
              {responsibilities.length > 0 && (
                <div className="space-y-2 mt-3">
                  {responsibilities.map((responsibility, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-start justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <span className="text-green-800 text-sm font-medium leading-relaxed">
                          {responsibility}
                        </span>
                      </div>
                      <button
                        onClick={() => removeResponsibility(responsibility)}
                        className="w-6 h-6 flex items-center justify-center text-green-500 hover:text-green-700 hover:bg-green-100 rounded-full transition-colors flex-shrink-0 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Work Duration */}
            {/* ... continue with existing sections ... */}
            {/* Work Duration */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Work Duration
              </label>
              <div className="flex gap-4">
                <div className="relative">
                  <input
                    type="date"
                    value={workStartDate}
                    onChange={(e) => setWorkStartDate(e.target.value)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDateForDisplay(workStartDate)}
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="date"
                    value={workEndDate}
                    onChange={(e) => setWorkEndDate(e.target.value)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDateForDisplay(workEndDate)}
                  </div>
                </div>
              </div>
            </div>

            {/* Work Location */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Work Location
              </label>

              {/* Location Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={workLocation}
                  onChange={(e) => setWorkLocation(e.target.value)}
                  placeholder="Enter location"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* World Map Interface */}
              <div className="relative bg-[#2A1B3D] rounded-lg overflow-hidden h-64">
                {/* World Map Background */}
                <div
                  className="w-full h-full bg-cover bg-center relative"
                  style={{
                    backgroundImage: `url('/world-map-dark-theme-satellite-view.png')`,
                  }}
                >
                  {/* Location Controls */}
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button
                      onClick={requestLocation}
                      className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      Auto Detect
                    </button>
                    <button
                      onClick={() => setShowLocationPicker(!showLocationPicker)}
                      className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Drop Pin
                    </button>
                  </div>

                  {/* Location Marker */}
                  {workLocation && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pay Range */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">
                Pay Range
              </label>

              {/* Pay Range Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1 w-fit mt-2">
                {["Daily", "Monthly"].map((option) => (
                  <button
                    key={option}
                    onClick={() => setActivePayRange(option)}
                    className={`px-8 py-1 text-sm font-medium rounded-md transition-all ${
                      activePayRange === option
                        ? "bg-[#76FF82] text-black shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {/* Pay Range Input */}
              <input
                type="text"
                value={payRange}
                onChange={(e) => setPayRange(e.target.value)}
                className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg text-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>

            {/* About Job */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  About Job
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">AI Assist</span>
                  <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
              <textarea
                value={aboutJob}
                onChange={(e) => setAboutJob(e.target.value)}
                placeholder="Description and requirements about this role..."
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-400 text-black resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Custom Question */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">
                Custom Question
              </label>

              {/* Question Type Toggle */}
              <div className="space-y-3">
                <div className="text-xs text-gray-500">Question Type</div>
                <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
                  {(["MCQ", "Single Choice"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        console.log("[v0] Changing question type to:", type);
                        setCurrentQuestionType(type);
                      }}
                      className={`px-4 py-1 text-sm font-medium rounded-md transition-all ${
                        currentQuestionType === type
                          ? "bg-[#76FF82] text-black shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Input */}
              <input
                type="text"
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                placeholder="Enter your Question"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {/* Options Section */}
              <div className="space-y-3">
                <div className="text-xs text-gray-500">Options</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentOption}
                    onChange={(e) => setCurrentOption(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && addOptionToCurrentQuestion()
                    }
                    placeholder="Enter Option"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={addOptionToCurrentQuestion}
                    className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Display Current Options */}
                {currentOptions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {currentOptions.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm"
                      >
                        <span>{option}</span>
                        <button
                          onClick={() =>
                            removeOptionFromCurrentQuestion(option)
                          }
                          className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Create Question Button */}
                {currentQuestion && currentOptions.length > 0 && (
                  <button
                    onClick={addCustomQuestion}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Create Question +
                  </button>
                )}
              </div>
            </div>

            {/* Display Added Questions */}
            {customQuestions.length > 0 && (
              <div className="space-y-4">
                <div className="text-sm font-medium text-gray-700">
                  Added Questions
                </div>
                {customQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="border border-gray-200 rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900">
                        {question.question}
                      </div>
                      <button
                        onClick={() => removeCustomQuestion(question.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-500">
                      Type: {question.type}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {question.options.map((option, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Another Question Button */}
            <button
              onClick={() => {
                console.log("[v0] Resetting question form for new question");
                setCurrentQuestion("");
                setCurrentOptions([]);
                setCurrentOption("");
                setCurrentQuestionType("MCQ");
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Add another Question +
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
