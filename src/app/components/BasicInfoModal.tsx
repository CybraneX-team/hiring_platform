import React from 'react'
import { AnimatePresence, motion, Variants } from "framer-motion";
import { ArrowLeft, MapPin, Clock, Download, Pencil, X, Plus, Trash2 } from "lucide-react";
import { backdropVariants, modalVariants } from './Companyapplicants';


export const   BasicInfoModal = ({ basicInfo, setBasicInfo, onClose, onSubmit, isUpdating }: any) =>{
  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Basic Information</h2>
            <p className="text-sm text-gray-500 mt-0.5">Update your profile details</p>
          </div>
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={basicInfo.name}
                onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#76FF82] focus:border-[#76FF82] outline-none transition-all text-gray-900 placeholder:text-gray-400"
                required
                disabled={isUpdating}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Years of Experience
              </label>
              <input
                type="text"
                value={basicInfo.yearsOfExp}
                onChange={(e) => setBasicInfo({ ...basicInfo, yearsOfExp: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#76FF82] focus:border-[#76FF82] outline-none transition-all text-gray-900 placeholder:text-gray-400"
                disabled={isUpdating}
                placeholder="e.g., 5 or 5+"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Bio
              </label>
              <textarea
                value={basicInfo.bio}
                onChange={(e) => setBasicInfo({ ...basicInfo, bio: e.target.value })}
                rows={4}
                disabled={isUpdating}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#76FF82] focus:border-[#76FF82] outline-none transition-all resize-none text-gray-900 placeholder:text-gray-400"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Skills
              </label>
              <input
                type="text"
                value={basicInfo.skills}
                onChange={(e) => setBasicInfo({ ...basicInfo, skills: e.target.value })}
                disabled={isUpdating}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#76FF82] focus:border-[#76FF82] outline-none transition-all text-gray-900 placeholder:text-gray-400"
                placeholder="Comma separated: React, Node.js, TypeScript"
              />
              <p className="mt-1.5 text-xs text-gray-500">Separate each skill with a comma</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Languages
              </label>
              <input
                type="text"
                value={basicInfo.languages}
                onChange={(e) => setBasicInfo({ ...basicInfo, languages: e.target.value })}
                disabled={isUpdating}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#76FF82] focus:border-[#76FF82] outline-none transition-all text-gray-900 placeholder:text-gray-400"
                placeholder="Comma separated: English, Hindi, Spanish"
              />
              <p className="mt-1.5 text-xs text-gray-500">Separate each language with a comma</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={basicInfo.phoneNumber}
                onChange={(e) => setBasicInfo({ ...basicInfo, phoneNumber: e.target.value })}
                disabled={isUpdating}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#76FF82] focus:border-[#76FF82] outline-none transition-all text-gray-900 placeholder:text-gray-400"
                placeholder="+91 00000 00000"
              />
            </div>
          </div>
        </form>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="flex-1 px-6 py-3 cursor-pointer border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={onSubmit}
            disabled={isUpdating}
            className="flex-1 px-6 py-3 cursor-pointer bg-[#76FF82] rounded-xl text-black font-semibold hover:bg-[#66ee72] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}