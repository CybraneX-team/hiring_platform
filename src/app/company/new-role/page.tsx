"use client";

import { useState } from "react";
import { ArrowLeft, Bot, Plus, X, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import JobHeader from "@/app/components/jobHeader";
import { useRouter } from "next/navigation";

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

  const router = useRouter();

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
              className="rounded-full text-black font-medium text-sm px-10 py-2 bg-[#76FF82] hover:bg-green-300"
            >
              Post
            </motion.button>
          </div>

          {/* Form Fields */}
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
