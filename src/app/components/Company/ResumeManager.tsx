"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Eye, Download, Star, Trophy, Target, Clock } from "lucide-react";
import apiClient from "../../utils/api";

interface Resume {
  _id: string;
  filename: string;
  uploadDate: string;
  isAnonymous: boolean;
  skills: string[];
  experience?: string;
  education?: string;
}

interface Job {
  id: string; // Changed from _id to id
  title: string;
  department: string;
  requiredSkills: Array<{
    name: string;
    level: string;
    required: boolean;
  }>;
}

interface MatchingScore {
  resumeId: string;
  jobId: string;
  score: number;
  breakdown: {
    skillsMatch: number;
    experienceMatch: number;
    overallCompatibility: number;
  };
}

export default function ResumeManager() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [matchingScores, setMatchingScores] = useState<MatchingScore[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch resumes and jobs on component mount
  useEffect(() => {
    fetchResumes();
    fetchJobs();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await apiClient.get("/api/resume");
      setResumes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      setResumes([]); // Set empty array on error
    }
  };

  const fetchJobs = async () => {
    try {
      const response : any = await apiClient.get("/api/jobs");
      // API returns {jobs: [...]} so we need to access .jobs
      const jobsData = response.data.jobs || response.data;
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]); // Set empty array on error
    }
  };

  const handleJobMatch = async () => {
    if (!selectedJob || !resumes || resumes.length === 0) return;

    setIsLoading(true);
    try {
      // For each resume, calculate match score with the selected job
      const scores = await Promise.all(
        resumes.map(async (resume) => {
          try {
            const response : any = await apiClient.post(`/api/resume/${resume._id}/match-jobs`, {
              limit: 20,
              minScore: 0 // Get score even if low
            });
            
            // Find the match for our specific job if it exists in the results
            const matches = response.data.matches || [];
            const jobMatch = matches.find((match: any) => match.job.id === selectedJob);
            
            return {
              resumeId: resume._id,
              jobId: selectedJob,
              score: jobMatch ? jobMatch.matchScore : 0,
              breakdown: jobMatch ? {
                skillsMatch: jobMatch.subScores?.skillsScore || 0,
                experienceMatch: jobMatch.subScores?.availabilityScore || 0,
                overallCompatibility: jobMatch.matchScore || 0
              } : {
                skillsMatch: 0,
                experienceMatch: 0,
                overallCompatibility: 0
              }
            };
          } catch (error) {
            console.error(`Error matching resume ${resume._id}:`, error);
            return {
              resumeId: resume._id,
              jobId: selectedJob,
              score: 0,
              breakdown: {
                skillsMatch: 0,
                experienceMatch: 0,
                overallCompatibility: 0
              }
            };
          }
        })
      );
      
      setMatchingScores(scores);
    } catch (error) {
      console.error("Error matching resumes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMatchingScore = (resumeId: string) => {
    const match = matchingScores.find(score => score.resumeId === resumeId);
    return match ? match.score : 0;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    if (score >= 40) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const sortedResumes = selectedJob 
    ? [...resumes].sort((a, b) => getMatchingScore(b._id) - getMatchingScore(a._id))
    : resumes;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Resume Management</h2>
        <p className="text-gray-600">
          View and match uploaded resumes against your job openings to find the best candidates.
        </p>
      </div>

      {/* Job Selection */}
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Against Job Opening</h3>
        <div className="flex gap-4">
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a job to match against</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} - {job.department}
              </option>
            ))}
          </select>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleJobMatch}
            disabled={!selectedJob || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Matching..." : "Run Match"}
          </motion.button>
        </div>

        {selectedJob && matchingScores.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <Trophy className="w-5 h-5" />
              <span className="font-medium">
                Found {matchingScores.filter(s => s.score > 50).length} potential matches 
                out of {resumes?.length || 0} resumes
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Resumes List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Uploaded Resumes ({resumes?.length || 0})
        </h3>

        {!resumes || resumes.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Resumes Yet</h3>
            <p className="text-gray-600">
              Candidates haven't uploaded any resumes yet. Share your job application link to start receiving applications.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sortedResumes.map((resume) => {
              const score = getMatchingScore(resume._id);
              const match = matchingScores.find(s => s.resumeId === resume._id);
              
              return (
                <motion.div
                  key={resume._id}
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold text-gray-900">{resume.filename}</h4>
                        {resume.isAnonymous && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            Anonymous
                          </span>
                        )}
                        {selectedJob && score > 0 && (
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(score)}`}>
                            {score}% Match
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Upload Date</p>
                          <p className="text-sm text-gray-900">
                            {new Date(resume.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                        
                        {(resume.skills && resume.skills.length > 0) && (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Skills</p>
                            <div className="flex flex-wrap gap-1">
                              {(resume.skills || []).slice(0, 5).map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                              {(resume.skills && resume.skills.length > 5) && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  +{(resume.skills?.length || 0) - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {match && (
                        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Target className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-gray-700">Skills</span>
                            </div>
                            <p className="text-lg font-bold text-green-600">{match.breakdown.skillsMatch}%</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-gray-700">Experience</span>
                            </div>
                            <p className="text-lg font-bold text-blue-600">{match.breakdown.experienceMatch}%</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Star className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-medium text-gray-700">Overall</span>
                            </div>
                            <p className="text-lg font-bold text-purple-600">{match.breakdown.overallCompatibility}%</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        title="View Resume"
                      >
                        <Eye className="w-5 h-5" />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                        title="Download Resume"
                      >
                        <Download className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}