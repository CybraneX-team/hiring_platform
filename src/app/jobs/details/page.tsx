"use client";

import type * as React from "react";
import {
  ArrowUp,
  ExternalLink,
  Clock,
  MapPin,
  CalendarDays,
  Users,
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import JobHeader from "@/app/components/jobHeader";

interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

const CustomButton: React.FC<CustomButtonProps> = ({
  className,
  children,
  variant = "primary",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium transition-colors focus:outline-none  disabled:opacity-50";

  const variantClasses = {
    primary: "bg-[#76FF82] hover:bg-[#69e874] text-black text-sm px-8 py-2.5",
    secondary:
      "bg-white hover:bg-gray-50 text-[#4B5563] border border-[#E5E7EB] shadow-sm",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface CustomBadgeProps extends React.HTMLAttributes<HTMLDivElement> {}

const CustomBadge: React.FC<CustomBadgeProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={`px-3 py-1.5 bg-[#F3F4F6] text-[#6B7280] text-xs font-medium rounded-full ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// --- Custom Avatar Component ---
interface CustomAvatarProps extends React.HTMLAttributes<HTMLDivElement> {}

const CustomAvatar: React.FC<CustomAvatarProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default function JobListingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

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
  };

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
                  <CustomAvatar className="w-12 h-12 bg-[#C5BCFF] text-white font-semibold text-lg">
                    R
                  </CustomAvatar>
                  <div className="flex-1">
                    <h1 className="text-xl font-semibold text-[#1F2937] mb-2">
                      Software Development Engineer
                    </h1>
                    <p className="text-sm text-[#6B7280] leading-relaxed mb-8">
                      Riverleaf Corp. is a leading supplier in tech solutions,
                      providing automation to Industrial and Enterprise Clients.
                    </p>
                    <div className="text-sm text-[#6B7280] mt-auto">
                      @riverleaf
                    </div>
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
                    <div className="text-xl font-bold text-[#1F2937]">
                      12,000-60,000₹
                    </div>
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
                    <div className="font-semibold text-[#A1A1A1]">
                      Experience
                    </div>
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
                    <div className="font-semibold text-[#A1A1A1]">
                      Timing hours
                    </div>
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
              <CustomButton className="font-semibold px-14 py-3 focus:outline-none">
                Apply
              </CustomButton>
            </div>

            <div className="space-y-8">
              {/* Job Description */}
              <div className="-mt-12">
                <h2 className="text-lg font-semibold text-[#1F2937] mb-3">
                  Job description
                </h2>
                <div className="space-y-4 text-sm text-[#4B5563] leading-relaxed max-w-4xl">
                  <p>
                    We are seeking a detail-oriented and proactive Payroll
                    Specialist to support our Finance function, specifically
                    managing payroll accounting, reconciliations, and
                    payroll-related financial reporting across multiple
                    international jurisdictions (excluding North America).
                  </p>
                  <p>
                    You will be responsible primarily for accurate
                    payroll-related accounting data, coordinating closely with
                    external payroll providers to ensure accounting accuracy,
                    compliance, and high-quality standards, and ensuring payroll
                    is correctly reflected in financial records and reporting.
                  </p>
                  <p>
                    This role emphasizes payroll related accounting tasks
                    (reconciliations, journal entries, compliance reporting)
                    rather than operational payroll tasks such as direct payslip
                    creation.
                  </p>
                </div>
              </div>

              {/* Perks */}
              <div>
                <h3 className="text-lg font-semibold text-[#1F2937] mb-4">
                  Perks
                </h3>
                <div className="flex flex-wrap gap-2">
                  <CustomBadge>Provident Fund</CustomBadge>
                  <CustomBadge>Joining Bonus</CustomBadge>
                  <CustomBadge>5-Days a week</CustomBadge>
                </div>
              </div>

              {/* Must have Skills */}
              <div>
                <h3 className="text-lg font-semibold text-[#1F2937] mb-4">
                  Must have Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  <CustomBadge>PHP</CustomBadge>
                  <CustomBadge>Finances</CustomBadge>
                  <CustomBadge>Quantitative Maths</CustomBadge>
                  <CustomBadge>Microsoft Suite</CustomBadge>
                </div>
              </div>

              {/* Qualifications */}
              <div>
                <h3 className="text-lg font-semibold text-[#1F2937] mb-4">
                  Qualifications
                </h3>
                <ul className="space-y-2 text-sm text-[#4B5563]">
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-[#6B7280] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Bachelor's degree in Graphic Design or a related field.
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-[#6B7280] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Minimum 6 months to 1 year of experience in graphic
                    designing.
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-[#6B7280] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Strong portfolio showcasing a variety of design projects.
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
                    A passion for design and a creative eye for detail.
                  </li>
                </ul>
              </div>

              {/* Key Responsibilities */}
              <div>
                <h3 className="text-lg font-semibold text-[#1F2937] mb-4">
                  Key Responsibilities
                </h3>
                <ul className="space-y-2 text-sm text-[#4B5563]">
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-[#6B7280] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Ensure accurate and timely payroll accounting and
                    reconciliations across multiple countries, in compliance
                    with local regulations.
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-[#6B7280] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Work closely with external payroll providers to maintain
                    high service standards and accuracy of payroll-related
                    financial data.
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-[#6B7280] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Prepare and provide detailed payroll-related journal entries
                    to the Finance team for accurate expense recognition.
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-[#6B7280] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Reconcile payroll tax payments, ensuring correct accounting
                    treatment and accurate reporting.
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-[#6B7280] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Support payroll-related audits and internal controls by
                    maintaining thorough payroll accounting documentation and
                    clear records.
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-[#6B7280] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Identify, evaluate, and manage external payroll providers to
                    ensure compliance standards, SLAs, and payroll accounting
                    accuracy.
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-[#6B7280] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Act as the primary point of contact internally for
                    payroll-related accounting queries and reconciliations.
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-[#6B7280] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Research, assess, and recommend improvements in payroll
                    accounting processes.
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-[#6B7280] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Support the financial analysis of employee benefit programs,
                    ensuring accurate accounting and cost-efficiency.
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Similar Jobs Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-[#1F2937]">
              Discover Similar Jobs
            </h2>
            <motion.div
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
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
    </div>
  );
}

// --- Similar Job Card Component ---
interface SimilarJobCardProps {
  itemVariants: Variants;
}

const SimilarJobCard: React.FC<SimilarJobCardProps> = ({ itemVariants }) => {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      variants={itemVariants}
    >
      <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
        <div className="flex items-start space-x-4 flex-1">
          <CustomAvatar className="w-10 h-10 bg-[#C5BCFF] text-white font-semibold text-base">
            R
          </CustomAvatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-[#1F2937] mb-1">
              Software Development Engineer
            </h3>
            <p className="text-sm text-[#6B7280] mb-3">Riverleaf Corp.</p>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-[#1F2937] mb-2">
                About Job
              </h4>
              <p className="text-sm text-[#4B5563] leading-relaxed">
                We are seeking a detail-oriented and proactive Payroll
                Specialist to support our Finance function, specifically
                managing payroll accounting, reconciliations, and
                payroll-related financial reporting across multiple
                international jurisdictions (excluding North America).
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
  );
};
