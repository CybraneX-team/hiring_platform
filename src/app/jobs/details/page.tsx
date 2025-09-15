"use client"

import type * as React from "react"
import { useState } from "react"
import { ArrowUp, ExternalLink, Clock, MapPin, CalendarDays, Users, X, CheckCircle } from "lucide-react"
import { motion, type Variants, AnimatePresence } from "framer-motion"
import JobHeader from "@/app/components/jobHeader"

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary"
}

const CustomButton: React.FC<CustomButtonProps> = ({ className, children, variant = "primary", ...props }) => {
  const baseClasses =
    "inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium transition-colors focus:outline-none  disabled:opacity-50"

  const variantClasses = {
    primary: "bg-[#76FF82] hover:bg-[#69e874] text-black text-sm px-8 py-2.5",
    secondary: "bg-white hover:bg-gray-50 text-[#4B5563] border border-[#E5E7EB] shadow-sm",
  }

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

interface CustomBadgeProps extends React.HTMLAttributes<HTMLDivElement> {}

const CustomBadge: React.FC<CustomBadgeProps> = ({ className, children, ...props }) => {
  return (
    <div className={`px-3 py-1.5 bg-[#F3F4F6] text-[#6B7280] text-xs font-medium rounded-full ${className}`} {...props}>
      {children}
    </div>
  )
}

// --- Custom Avatar Component ---
interface CustomAvatarProps extends React.HTMLAttributes<HTMLDivElement> {}

const CustomAvatar: React.FC<CustomAvatarProps> = ({ className, children, ...props }) => {
  return (
    <div className={`rounded-full flex items-center justify-center flex-shrink-0 ${className}`} {...props}>
      {children}
    </div>
  )
}

const ApplicationPopup: React.FC<{
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    experience: "",
    portfolio: "",
    coverLetter: "",
    availability: "",
    programmingLanguages: "",
    frameworks: "",
    databaseExperience: "",
    projectDescription: "",
    problemSolvingExample: "",
    remoteWorkExperience: "",
    expectedSalary: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto text-black"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 ">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#1F2937]">Apply for Software Development Engineer</h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="h-5 w-5 text-[#6B7280]" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-2">Years of Experience *</label>
                  <select
                    name="experience"
                    required
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Select experience</option>
                    <option value="0-6months">0-6 months</option>
                    <option value="6months-1year">6 months - 1 year</option>
                    <option value="1-2years">1-2 years</option>
                    <option value="2-5years">2-5 years</option>
                    <option value="5+years">5+ years</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-2">Portfolio/GitHub URL</label>
                <input
                  type="url"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all"
                  placeholder="https://github.com/yourusername"
                />
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-[#1F2937] mb-4">Technical Questions</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-2">Programming Languages *</label>
                    <input
                      type="text"
                      name="programmingLanguages"
                      required
                      value={formData.programmingLanguages}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all"
                      placeholder="e.g., PHP, JavaScript, Python, Java"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-2">Frameworks & Technologies *</label>
                    <input
                      type="text"
                      name="frameworks"
                      required
                      value={formData.frameworks}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all"
                      placeholder="e.g., Laravel, React, Node.js, Vue.js"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-2">Database Experience *</label>
                    <input
                      type="text"
                      name="databaseExperience"
                      required
                      value={formData.databaseExperience}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all"
                      placeholder="e.g., MySQL, PostgreSQL, MongoDB, Redis"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-2">
                      Describe your most challenging project *
                    </label>
                    <textarea
                      name="projectDescription"
                      required
                      value={formData.projectDescription}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all resize-none"
                      placeholder="Briefly describe a challenging project you worked on, the technologies used, and your role..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-2">Problem-solving example *</label>
                    <textarea
                      name="problemSolvingExample"
                      required
                      value={formData.problemSolvingExample}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all resize-none"
                      placeholder="Describe a technical problem you solved and your approach to solving it..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1F2937] mb-2">Remote Work Experience *</label>
                      <select
                        name="remoteWorkExperience"
                        required
                        value={formData.remoteWorkExperience}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all"
                      >
                        <option value="">Select experience</option>
                        <option value="no-experience">No remote work experience</option>
                        <option value="some-experience">Some remote work experience</option>
                        <option value="extensive-experience">Extensive remote work experience</option>
                        <option value="fully-remote">Worked fully remote for 1+ years</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1F2937] mb-2">
                        Expected Salary (₹/hour) *
                      </label>
                      <input
                        type="number"
                        name="expectedSalary"
                        required
                        value={formData.expectedSalary}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all"
                        placeholder="e.g., 15000"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-2">When can you start? *</label>
                <select
                  name="availability"
                  required
                  value={formData.availability}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all"
                >
                  <option value="">Select availability</option>
                  <option value="immediately">Immediately</option>
                  <option value="1week">Within 1 week</option>
                  <option value="2weeks">Within 2 weeks</option>
                  <option value="1month">Within 1 month</option>
                  <option value="negotiable">Negotiable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-2">Cover Letter *</label>
                <textarea
                  name="coverLetter"
                  required
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#76FF82] focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <CustomButton type="button" variant="secondary" onClick={onClose} className="flex-1">
                  Cancel
                </CustomButton>
                <CustomButton type="submit" className="flex-1 font-semibold">
                  Submit Application
                </CustomButton>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const SuccessPopup: React.FC<{
  isOpen: boolean
  onClose: () => void
}> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", duration: 0.6 }}
              className="mb-6"
            >
              <div className="w-16 h-16 bg-[#76FF82] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <h3 className="text-2xl font-semibold text-[#1F2937] mb-3">Application Submitted!</h3>
              <p className="text-[#6B7280] mb-6 leading-relaxed">
                Thank you for your interest! We've received your application and will review it carefully. You'll hear
                back from us within 3-5 business days.
              </p>
              <CustomButton onClick={onClose} className="font-semibold px-8">
                Got it!
              </CustomButton>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function JobListingPage() {
  const [showApplicationPopup, setShowApplicationPopup] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  const handleApplyClick = () => {
    setShowApplicationPopup(true)
  }

  const handleApplicationSubmit = (formData: any) => {
    console.log("Application submitted:", formData)
    setShowApplicationPopup(false)
    setShowSuccessPopup(true)
  }

  const handleCloseApplicationPopup = () => {
    setShowApplicationPopup(false)
  }

  const handleCloseSuccessPopup = () => {
    setShowSuccessPopup(false)
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <JobHeader />
      <div className="px-0 py-6 sm:px-4 md:px-8 md:py-8 lg:px-12 lg:py-10">
        <motion.div
          className="mx-auto max-w-7xl space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Top Section - Company Info and Details */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Left Card - Company Info */}
            <motion.div
              className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8 flex flex-col"
              variants={itemVariants}
            >
              <div className="flex flex-col lg:flex-row items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <CustomAvatar className="w-12 h-12 bg-[#7C3AED] text-white font-semibold text-lg">R</CustomAvatar>
                  <div className="flex-1">
                    <h1 className="text-xl font-semibold text-[#1F2937] mb-2">Software Development Engineer</h1>
                    <p className="text-sm text-[#6B7280] leading-relaxed mb-8">
                      Riverleaf Corp. is a leading supplier in tech solutions, providing automation to Industrial and
                      Enterprise Clients.
                    </p>
                    <div className="text-sm text-[#6B7280] mt-auto">@riverleaf</div>
                  </div>
                </div>

                {/* Right side - Pay and Link */}
                <div className="flex flex-col items-end mt-4 lg:mt-0 lg:ml-6">
                  <a
                    href="https://www.riverleaf.co"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#6B7280] flex items-center hover:underline mb-2"
                  >
                    www.Riverleaf.co <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                  <div className="text-right">
                    <div className="text-xl font-bold text-[#1F2937]">12,000-60,000₹</div>
                    <div className="text-sm text-[#6B7280]">Per/Hr</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Card - Job Details */}
            <motion.div
              className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4"
              variants={itemVariants}
            >
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Clock className="h-4 w-4 text-[#6B7280] mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold text-[#A1A1A1]">Experience</div>
                    <div className="text-[#32343A]">6 Months - 1 Years</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CalendarDays className="h-4 w-4 text-[#6B7280] mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold text-[#A1A1A1]">Job Type</div>
                    <div className="text-[#32343A]">Full-Time</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Users className="h-4 w-4 text-[#6B7280] mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold text-[#A1A1A1]">Timing hours</div>
                    <div className="text-[#32343A]">40 Hours a week</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-[#6B7280] mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold text-[#A1A1A1]">Location</div>
                    <div className="text-[#32343A]">Michigan USA</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content Card */}
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8"
            variants={itemVariants}
          >
            {/* Apply Button - Top Right */}
            <div className="flex justify-end mb-6">
              <CustomButton className="font-semibold px-14 py-3 focus:outline-none" onClick={handleApplyClick}>
                Apply
              </CustomButton>
            </div>

            <div className="space-y-8">
              {/* Job Description */}
              <div className="-mt-12">
                <h2 className="text-lg font-semibold text-[#1F2937] mb-3">Job description</h2>
                <div className="space-y-4 text-sm text-[#4B5563] leading-relaxed max-w-4xl">
                  <p>
                    We are seeking a detail-oriented and proactive Software Development Engineer to support our
                    development team, specifically developing scalable and efficient software solutions for our clients.
                  </p>
                  <p>
                    You will be responsible primarily for writing clean code, conducting code reviews, and ensuring
                    software quality and compliance with industry standards.
                  </p>
                  <p>
                    This role emphasizes software development tasks (coding, debugging, testing) rather than operational
                    tasks such as direct client interaction.
                  </p>
                </div>
              </div>

              {/* Perks */}
              <div>
                <h3 className="text-lg font-semibold text-[#1F2937] mb-4">Perks</h3>
                <div className="flex flex-wrap gap-2">
                  <CustomBadge>Provident Fund</CustomBadge>
                  <CustomBadge>Joining Bonus</CustomBadge>
                  <CustomBadge>5-Days a week</CustomBadge>
                </div>
              </div>

              {/* Must have Skills */}
              <div>
                <h3 className="text-lg font-semibold text-[#1F2937] mb-4">Must have Skills</h3>
                <div className="flex flex-wrap gap-2">
                  <CustomBadge>PHP</CustomBadge>
                  <CustomBadge>Finances</CustomBadge>
                  <CustomBadge>Quantitative Maths</CustomBadge>
                  <CustomBadge>Microsoft Suite</CustomBadge>
                </div>
              </div>

              {/* Qualifications */}
              <div>
                <h3 className="text-lg font-semibold text-[#1F2937] mb-4">Qualifications</h3>
                <ul className="space-y-2 text-sm text-[#4B5563]">
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-[#6B7280] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Bachelor's degree in Computer Science or a related field.
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-[#6B7280] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Minimum 6 months to 1 year of experience in software development.
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-[#6B7280] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Strong portfolio showcasing a variety of software projects.
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-[#6B7280] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Excellent communication and interpersonal skills.
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-[#6B7280] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Ability to work under pressure and meet tight deadlines.
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-[#6B7280] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    A passion for software development and a focus on quality.
                  </li>
                </ul>
              </div>

              {/* Key Responsibilities */}
              <div>
                <h3 className="text-lg font-semibold text-[#1F2937] mb-4">Key Responsibilities</h3>
                <ul className="space-y-2 text-sm text-[#4B5563]">
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-[#6B7280] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Develop and maintain scalable software solutions for our clients.
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-[#6B7280] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Conduct code reviews and provide feedback to improve code quality.
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-[#6B7280] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Ensure software compliance with industry standards and regulations.
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-[#6B7280] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Act as the primary point of contact internally for software development queries and support.
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-[#6B7280] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Research, assess, and recommend improvements in software development processes.
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-[#6B7280] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Support the analysis of software performance and provide optimization suggestions.
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Similar Jobs Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-[#1F2937]">Discover Similar Jobs</h2>
            <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
              <SimilarJobCard itemVariants={itemVariants} />
              <SimilarJobCard itemVariants={itemVariants} />
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll to Top Button */}
        <CustomButton
          variant="secondary"
          className="fixed bottom-8 right-8 w-12 h-12 rounded-full shadow-lg p-0"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ArrowUp className="h-5 w-5" />
        </CustomButton>
      </div>

      <ApplicationPopup
        isOpen={showApplicationPopup}
        onClose={handleCloseApplicationPopup}
        onSubmit={handleApplicationSubmit}
      />

      <SuccessPopup isOpen={showSuccessPopup} onClose={handleCloseSuccessPopup} />
    </div>
  )
}

// --- Similar Job Card Component ---
interface SimilarJobCardProps {
  itemVariants: Variants
}

const SimilarJobCard: React.FC<SimilarJobCardProps> = ({ itemVariants }) => {
  return (
    <motion.div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6" variants={itemVariants}>
      <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
        <div className="flex items-start space-x-4 flex-1">
          <CustomAvatar className="w-10 h-10 bg-[#7C3AED] text-white font-semibold text-base">R</CustomAvatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-[#1F2937] mb-1">Software Development Engineer</h3>
            <p className="text-sm text-[#6B7280] mb-3">Riverleaf Corp.</p>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-[#1F2937] mb-2">About Job</h4>
              <p className="text-sm text-[#4B5563] leading-relaxed">
                We are seeking a detail-oriented and proactive Software Development Engineer to support our development
                team, specifically developing scalable and efficient software solutions for our clients.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <CustomBadge>Marketing</CustomBadge>
              <CustomBadge>Design</CustomBadge>
              <CustomBadge>Strategy Development</CustomBadge>
            </div>

            <div className="flex items-center space-x-4 text-xs text-[#6B7280]">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Remote</span>
              </div>
              <div className="flex items-center space-x-1">
                <CalendarDays className="h-3 w-3" />
                <span>5 Days ago</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end lg:items-end">
          <div className="text-right mb-4">
            <div className="text-lg font-bold text-[#1F2937]">120k$</div>
            <div className="text-sm text-[#6B7280]">Per/Year</div>
          </div>
          <CustomButton className="font-semibold">View Role</CustomButton>
        </div>
      </div>
    </motion.div>
  )
}
