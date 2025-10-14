import React from 'react';
import { AnimatePresence, motion, Variants } from "framer-motion";
import { ArrowLeft, MapPin, Clock, Download, Pencil, X, Plus, Trash2 } from "lucide-react";
import { backdropVariants, modalVariants } from './Companyapplicants';

export const AcademicsModal = ({ academics, setAcademics, onClose, onSubmit, isUpdating }: any) => {
  const addAcademic = () => {
    setAcademics([
      ...academics,
      { institure: "", Degree: "", period: "", GPA: "", description: "" },
    ]);
  };

  const removeAcademic = (index: number) => {
    setAcademics(academics.filter((_: any, i: number) => i !== index));
  };

  const updateAcademic = (index: number, field: string, value: string) => {
    const updated = [...academics];
    updated[index][field] = value;
    setAcademics(updated);
  };

  return (
    <motion.div
      key="academics-modal"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 px-6 py-5 z-10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">Edit Education</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <p className="text-sm text-gray-600">Add or update your educational background</p>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto px-6 py-6">
          {academics.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">No education added yet</p>
              <button
                type="button"
                onClick={addAcademic}
                className="px-4 py-2 bg-[#76FF82] text-black rounded-lg font-medium hover:bg-[#6ee879] transition-colors"
              >
                Add Your First Education
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {academics.map((academic: any, index: number) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    {/* Header with number and delete */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Education #{index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeAcademic(index)}
                        disabled={isUpdating}
                        className="p-2 cursor-pointer hover:bg-red-50 rounded-lg transition-colors group disabled:opacity-50"
                        aria-label="Remove education"
                      >
                        <Trash2 className="w-5 h-5 text-red-600 group-hover:text-red-700" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Degree *
                        </label>
                        <input
                          type="text"
                          value={academic.Degree}
                          onChange={(e) => updateAcademic(index, "Degree", e.target.value)}
                          disabled={isUpdating}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#76FF82] focus:border-[#76FF82] outline-none transition-all text-gray-900 placeholder:text-gray-400"
                          placeholder="e.g., Bachelor of Computer Science"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Institution *
                        </label>
                        <input
                          type="text"
                          value={academic.institure}
                          onChange={(e) => updateAcademic(index, "institure", e.target.value)}
                          disabled={isUpdating}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#76FF82] focus:border-[#76FF82] outline-none transition-all text-gray-900 placeholder:text-gray-400"
                          placeholder="e.g., University Name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Period *
                        </label>
                        <input
                          type="text"
                          value={academic.period}
                          onChange={(e) => updateAcademic(index, "period", e.target.value)}
                          disabled={isUpdating}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#76FF82] focus:border-[#76FF82] outline-none transition-all text-gray-900 placeholder:text-gray-400"
                          placeholder="e.g., 2019 - 2023"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          GPA
                        </label>
                        <input
                          type="text"
                          value={academic.GPA}
                          onChange={(e) => updateAcademic(index, "GPA", e.target.value)}
                          disabled={isUpdating}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#76FF82] focus:border-[#76FF82] outline-none transition-all text-gray-900 placeholder:text-gray-400"
                          placeholder="e.g., 3.8/4.0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={academic.description}
                          onChange={(e) => updateAcademic(index, "description", e.target.value)}
                          rows={2}
                          disabled={isUpdating}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#76FF82] focus:border-[#76FF82] outline-none transition-all resize-none text-gray-900 placeholder:text-gray-400"
                          placeholder="Optional: Add achievements or relevant coursework"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addAcademic}
                disabled={isUpdating}
                className="mt-6 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-[#76FF82] hover:bg-[#76FF82]/5 hover:text-black transition-all inline-flex items-center justify-center gap-2 font-medium disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                Add Another Education
              </button>
            </>
          )}
        </form>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white rounded-b-2xl border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="px-6 py-2.5 cursor-pointer border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={onSubmit} 
            disabled={isUpdating}
            className="px-6 py-2.5 bg-[#76FF82] cursor-pointer text-black rounded-xl font-medium hover:bg-[#6ee879] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
