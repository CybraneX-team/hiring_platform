"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Clock, 
  TrendingUp,
  Star,
  Users,
  Briefcase,
  Filter,
  ChevronDown,
  ExternalLink
} from "lucide-react";
import apiClient from "../utils/api";

interface JobMatch {
  job: {
    id: string;
    title: string;
    company: any;
    location: string;
    salaryRange: {
      min: number;
      max: number;
      currency: string;
    };
    jobType: string;
    experienceLevel: string;
    department: string;
    description: string;
  };
  matchScore: number;
  subScores: {
    skillsScore: number;
    distanceScore: number;
    availabilityScore: number;
    ratingScore: number;
  };
  matchReason: string;
  skillBreakdown: Array<{
    skill: string;
    candidateLevel: string;
    requiredLevel: string;
    score: number;
    explanation: string;
  }>;
  recommendations: string[];
}

interface JobMatchingProps {
  resumeId: string;
  userId: string;
}

export default function JobMatching({ resumeId, userId }: JobMatchingProps) {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<JobMatch | null>(null);
  const [filters, setFilters] = useState({
    minScore: 50,
    jobType: "",
    experienceLevel: "",
    department: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);

  useEffect(() => {
    fetchJobMatches();
  }, [resumeId]);

  const fetchJobMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.post(`/api/resume/${resumeId}/match-jobs`, {
        limit: 20,
        minScore: filters.minScore
      });

      setMatches(response.data.matches);
      
      // Show processing time if available
      if (response.data.processingTime) {
        console.log(`Job matching completed in ${response.data.processingTime}ms`);
      }
      
    } catch (error: any) {
      console.error('Error fetching job matches:', error);
      
      let errorMessage = 'Failed to find job matches';
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Job matching is taking longer than expected. This usually happens with complex matching algorithms. Please try again.';
      } else if (error.response?.status === 408) {
        errorMessage = error.response.data.message || 'Request timeout - please try again with a lower match score threshold.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToJob = async (jobId: string) => {
    try {
      setApplyingTo(jobId);
      
      const response = await apiClient.post(`/api/resume/${resumeId}/apply/${jobId}`, {
        coverLetter: "" // Could be enhanced to include a cover letter modal
      });

      // Update the UI to show application submitted
      alert('Application submitted successfully!');
      
    } catch (error: any) {
      console.error('Error applying to job:', error);
      alert(error.response?.data?.message || 'Failed to apply to job');
    } finally {
      setApplyingTo(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getMatchBadge = (score: number) => {
    if (score >= 90) return { text: "Excellent Match", color: "bg-green-500" };
    if (score >= 75) return { text: "Great Match", color: "bg-blue-500" };
    if (score >= 60) return { text: "Good Match", color: "bg-yellow-500" };
    return { text: "Potential Match", color: "bg-gray-500" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Finding perfect job matches...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={fetchJobMatches}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Job Matches Found</h2>
        <p className="text-blue-100 mb-4">
          We found {matches.length} jobs that match your profile
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-2xl font-bold">
              {matches.filter(m => m.matchScore >= 80).length}
            </div>
            <div className="text-sm text-blue-100">Excellent Matches</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-2xl font-bold">
              {matches.filter(m => m.matchScore >= 60 && m.matchScore < 80).length}
            </div>
            <div className="text-sm text-blue-100">Good Matches</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-2xl font-bold">
              {Math.round(matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length) || 0}%
            </div>
            <div className="text-sm text-blue-100">Average Match</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-900">Filters</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
            showFilters ? 'rotate-180' : ''
          }`} />
        </button>
        
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Match Score
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.minScore}
                    onChange={(e) => setFilters(prev => ({ ...prev, minScore: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-500">{filters.minScore}%</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Type
                  </label>
                  <select
                    value={filters.jobType}
                    onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Level
                  </label>
                  <select
                    value={filters.experienceLevel}
                    onChange={(e) => setFilters(prev => ({ ...prev, experienceLevel: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">All Levels</option>
                    <option value="Entry">Entry Level</option>
                    <option value="Mid">Mid Level</option>
                    <option value="Senior">Senior Level</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={fetchJobMatches}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Job Matches */}
      <div className="space-y-4">
        {matches.map((match, index) => {
          const badge = getMatchBadge(match.matchScore);
          
          return (
            <motion.div
              key={match.job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Job Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {match.job.title}
                      </h3>
                      <p className="text-gray-600">{match.job.company.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${badge.color}`}>
                        {badge.text}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(match.matchScore)}`}>
                        {Math.round(match.matchScore)}% Match
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {match.job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      ${match.job.salaryRange.min.toLocaleString()} - ${match.job.salaryRange.max.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {match.job.jobType}
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {match.job.experienceLevel}
                    </div>
                  </div>

                  {/* Match Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        {Math.round(match.subScores.skillsScore)}%
                      </div>
                      <div className="text-xs text-gray-500">Skills</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {Math.round(match.subScores.distanceScore)}%
                      </div>
                      <div className="text-xs text-gray-500">Location</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600">
                        {Math.round(match.subScores.availabilityScore)}%
                      </div>
                      <div className="text-xs text-gray-500">Availability</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-yellow-600">
                        {Math.round(match.subScores.ratingScore)}%
                      </div>
                      <div className="text-xs text-gray-500">Profile</div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {match.matchReason}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 lg:w-40">
                  <button
                    onClick={() => handleApplyToJob(match.job.id)}
                    disabled={applyingTo === match.job.id}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                  >
                    {applyingTo === match.job.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Applying...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        Apply Now
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedMatch(selectedMatch?.job.id === match.job.id ? null : match)}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {selectedMatch?.job.id === match.job.id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
              </div>

              {/* Detailed Analysis */}
              <AnimatePresence>
                {selectedMatch?.job.id === match.job.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-6 pt-6 border-t border-gray-200"
                  >
                    <div className="space-y-6">
                      {/* Job Description */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Job Description</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {match.job.description}
                        </p>
                      </div>

                      {/* Skill Analysis */}
                      {match.skillBreakdown.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Skills Analysis</h4>
                          <div className="space-y-2">
                            {match.skillBreakdown.map((skill, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <span className="font-medium text-gray-900">{skill.skill}</span>
                                  <div className="text-sm text-gray-500">
                                    Your level: {skill.candidateLevel} | Required: {skill.requiredLevel}
                                  </div>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(skill.score)}`}>
                                  {skill.score}%
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {match.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">AI Recommendations</h4>
                          <ul className="space-y-2">
                            {match.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {matches.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Job Matches Found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters or upload a more detailed resume.
          </p>
          <button
            onClick={fetchJobMatches}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search Again
          </button>
        </div>
      )}
    </div>
  );
}
