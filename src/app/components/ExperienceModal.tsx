import React from 'react';
import { AnimatePresence, motion, Variants } from "framer-motion";
import { ArrowLeft, MapPin, Clock, Download, Pencil, X, Plus, Trash2 } from "lucide-react";
import { backdropVariants, modalVariants } from './Companyapplicants';

export const ExperienceModal = ({ experiences, setExperiences, onClose, onSubmit, isUpdating }: any) => {
  const addExperience = () => {
    setExperiences([
      ...experiences,
      { company: "", title: "", period: "", description: "", points: [] },
    ]);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_: any, i: number) => i !== index));
  };

  const updateExperience = (index: number, field: string, value: any) => {
    const updated = [...experiences];
    updated[index][field] = value;
    setExperiences(updated);
  };

  const updatePoint = (expIndex: number, pointIndex: number, value: string) => {
    const updated = [...experiences];
    if (!updated[expIndex].points) updated[expIndex].points = [];
    updated[expIndex].points[pointIndex] = { point: value };
    setExperiences(updated);
  };

  const addPoint = (expIndex: number) => {
    const updated = [...experiences];
    if (!updated[expIndex].points) updated[expIndex].points = [];
    updated[expIndex].points.push({ point: "" });
    setExperiences(updated);
  };

  const removePoint = (expIndex: number, pointIndex: number) => {
    const updated = [...experiences];
    updated[expIndex].points = updated[expIndex].points.filter((_: any, i: number) => i !== pointIndex);
    setExperiences(updated);
  };

  return (
    <motion.div
      key="experience-modal"
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
            <h2 className="text-2xl font-bold text-gray-900">Edit Work Experience</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <p className="text-sm text-gray-600">Add or update your professional experience</p>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto px-6 py-6">
          {experiences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">No work experience added yet</p>
              <button
                type="button"
                onClick={addExperience}
                className="px-4 py-2 bg-[#76FF82] text-black rounded-lg font-medium hover:bg-[#6ee879] transition-colors"
              >
                Add Your First Experience
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {experiences.map((exp: any, expIndex: number) => (
                  <div key={expIndex} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    {/* Header with number and delete */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Experience #{expIndex + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeExperience(expIndex)}
                        disabled={isUpdating}
                        className="p-2 cursor-pointer hover:bg-red-50 rounded-lg transition-colors group disabled:opacity-50"
                        aria-label="Remove experience"
                      >
                        <Trash2 className="w-5 h-5 text-red-600 group-hover:text-red-700" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Job Title *
                        </label>
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => updateExperience(expIndex, "title", e.target.value)}
                          disabled={isUpdating}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#76FF82] focus:border-[#76FF82] outline-none transition-all text-gray-900 placeholder:text-gray-400"
                          required
                          placeholder="e.g., Senior Software Engineer"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company *
                        </label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(expIndex, "company", e.target.value)}
                          disabled={isUpdating}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#76FF82] focus:border-[#76FF82] outline-none transition-all text-gray-900 placeholder:text-gray-400"
                          required
                          placeholder="e.g., Tech Company Inc."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Period *
                        </label>
                        <input
                          type="text"
                          value={exp.period}
                          onChange={(e) => updateExperience(expIndex, "period", e.target.value)}
                          disabled={isUpdating}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#76FF82] focus:border-[#76FF82] outline-none transition-all text-gray-900 placeholder:text-gray-400"
                          placeholder="e.g., Jan 2020 - Dec 2023 or 2020 - 2023"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Key Responsibilities
                        </label>
                        {exp.points && exp.points.length > 0 ? (
                          <div className="space-y-3">
                            {exp.points.map((point: any, pointIndex: number) => (
                              <div key={pointIndex} className="flex gap-2">
                                <textarea
                                  value={typeof point === 'string' ? point : point.point}
                                  onChange={(e) => updatePoint(expIndex, pointIndex, e.target.value)}
                                  disabled={isUpdating}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#76FF82] focus:border-[#76FF82] outline-none transition-all resize-none text-gray-900 placeholder:text-gray-400"
                                  placeholder="Describe a key responsibility or achievement"
                                  rows={2}
                                />
                                <button
                                  type="button"
                                  onClick={() => removePoint(expIndex, pointIndex)}
                                  disabled={isUpdating}
                                  className="p-2.5  h-fit cursor-pointer hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => addPoint(expIndex)}
                          disabled={isUpdating}
                          className="mt-3 px-4 py-2.5 text-sm border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#76FF82] hover:bg-[#76FF82]/5 hover:text-black transition-all inline-flex items-center gap-2 font-medium disabled:opacity-50 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          Add Responsibility
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description (Optional)
                        </label>
                        <textarea
                          value={exp.description}
                          onChange={(e) => updateExperience(expIndex, "description", e.target.value)}
                          rows={3}
                          disabled={isUpdating}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#76FF82] focus:border-[#76FF82] outline-none transition-all resize-none text-gray-900 placeholder:text-gray-400"
                          placeholder="Overall description of the role"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addExperience}
                disabled={isUpdating}
                className="mt-6 w-full  px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-[#76FF82] hover:bg-[#76FF82]/5 hover:text-black transition-all inline-flex items-center justify-center gap-2 font-medium disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                Add Another Experience
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
            className="px-6 py-2.5 border cursor-pointer border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUpdating}
            onClick={onSubmit}
            className="px-6 cursor-pointer py-2.5 bg-[#76FF82] text-black rounded-xl font-medium hover:bg-[#6ee879] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
