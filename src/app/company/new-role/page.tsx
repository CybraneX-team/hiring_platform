"use client";

import { useState } from "react";
import { ArrowLeft, Bot, Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import JobHeader from "@/app/components/jobHeader";
import { useRouter } from "next/navigation";

export default function PostRole() {
  const [activePayRange, setActivePayRange] = useState("Per Hour");
  const [companyPerksInput, setCompanyPerksInput] = useState("");
  const [companyPerks, setCompanyPerks] = useState<string[]>([]);
  const [requiredSkillsetInput, setRequiredSkillsetInput] = useState("");
  const [requiredSkillset, setRequiredSkillset] = useState<string[]>([]);
  const [payRange, setPayRange] = useState("12,000-60,000₹");
  const [aboutJob, setAboutJob] = useState("");

  const addPerk = () => {
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

  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F5F5F5] ">
      <JobHeader />
      <div className="max-w-5xl mx-auto p-8">
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
          className="bg-white rounded-2xl p-8 shadow-sm"
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

            {/* Pay Range */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">
                Pay Range
              </label>

              {/* Pay Range Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1 w-fit mt-2">
                {["Per Hour", "Annually"].map((option) => (
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}
