// Job Preview Modal Component
import { motion } from "framer-motion";
import { X } from "lucide-react";

export const JobPreviewModal = ({
  isOpen,
  onClose,
  onConfirm,
  jobData,
  isPosting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  jobData: any;
  isPosting: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">
            Preview Job Post
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex cursor-pointer items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-6">
            {/* Job Title */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {jobData.title}
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {jobData.jobType}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {jobData.experienceLevel}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {jobData.noOfOpenings} Openings
                </span>
              </div>
            </div>

            {/* Pay Range */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Pay Range
              </h4>
              <p className="text-lg font-semibold text-gray-900">
                {jobData.payRange}{" "}
                <span className="text-sm font-normal text-gray-600">
                  ({jobData.payRangeType})
                </span>
              </p>
              {jobData.fatIncluded && (
                <span className="inline-block mt-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                  FAT Included
                </span>
              )}
            </div>

            {/* Work Duration */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Work Duration
              </h4>
              <p className="text-sm text-gray-900">
                {new Date(jobData.workStartDate).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}{" "}
                -{" "}
                {new Date(jobData.workEndDate).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Location */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Location
              </h4>
              <p className="text-sm text-gray-900">{jobData.workLocation}</p>
            </div>

            {/* Experience */}
            {jobData.experience && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Experience
                </h4>
                <p className="text-sm text-gray-900">{jobData.experience}</p>
              </div>
            )}

            {/* Description */}
            {jobData.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Job Description
                </h4>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {jobData.description}
                </p>
              </div>
            )}

            {/* Company Perks */}
            {jobData.companyPerks.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Company Perks
                </h4>
                <div className="flex flex-wrap gap-2">
                  {jobData.companyPerks.map((perk: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {perk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Required Skillset */}
            {jobData.requiredSkillset.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Required Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {jobData.requiredSkillset.map(
                    (skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Education Qualifications */}
            {jobData.educationQualifications.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Education Qualifications
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {jobData.educationQualifications.map(
                    (qual: string, index: number) => (
                      <li key={index} className="text-sm text-gray-900">
                        {qual}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {/* Responsibilities */}
            {jobData.responsibilities.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Responsibilities
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {jobData.responsibilities.map(
                    (resp: string, index: number) => (
                      <li key={index} className="text-sm text-gray-900">
                        {resp}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {/* Mandatory Certificates */}
            {jobData.mandatoryCertificates.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Mandatory Certificates
                </h4>
                <div className="flex flex-wrap gap-2">
                  {jobData.mandatoryCertificates.map(
                    (cert: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm"
                      >
                        {cert}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Custom Questions */}
            {jobData.customQuestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Custom Questions
                </h4>
                <div className="space-y-3">
                  {jobData.customQuestions.map(
                    (question: any, index: number) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {index + 1}. {question.question}
                        </p>
                        <p className="text-xs text-gray-500 mb-2">
                          Type: {question.type}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {question.options.map(
                            (option: string, optIndex: number) => (
                              <span
                                key={optIndex}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                              >
                                {option}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            disabled={isPosting}
            className="px-6 py-2 cursor-pointer border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Edit
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConfirm}
            disabled={isPosting}
            className={`px-6 py-2 cursor-pointer rounded-lg text-sm font-medium text-black transition-colors ${
              isPosting
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#76FF82] hover:bg-green-300"
            }`}
          >
            {isPosting ? "Posting..." : "Confirm & Post"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
