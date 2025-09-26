"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Mail,
  MoreHorizontal,
  MapPin,
  Clock,
  Menu,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "../context/UserContext";

// Define interfaces for type safety
interface JobListing {
  id: string;
  title: string;
  company: string;
  salary: string;
  salaryType: string;
  tags: string[];
  description: string;
  location: string;
  timePosted: string;
  jobType: string;
  experienceLevel: string;
  department: string;
}

interface ApiResponse {
  jobs: any[];
  pagination: {
    current: number;
    total: number;
    count: number;
    totalItems: number;
  };
}

const filterTabs = ["All", "Full-Time", "Remote"];

export default function JobComponent() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalItems: 0,
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const { user } = useUser();

  // Function to format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hrs ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} weeks ago`;
  };

  // Function to format salary
  const formatSalary = (salaryRange: any) => {
    if (!salaryRange) return { salary: "Negotiable", salaryType: "" };
    
    const { min, max, currency = "$" } = salaryRange;
    
    if (min && max) {
      return {
        salary: `${currency}${min}-${max}`,
        salaryType: "Per/Year"
      };
    } else if (min) {
      return {
        salary: `${currency}${min}+`,
        salaryType: "Per/Year"
      };
    } else if (max) {
      return {
        salary: `Up to ${currency}${max}`,
        salaryType: "Per/Year"
      };
    }
    
    return { salary: "Negotiable", salaryType: "" };
  };

  // Function to map API response to frontend format
  const mapJobData = (apiJobs: any[]): JobListing[] => {
    return apiJobs.map((job: any) => {
      const { salary, salaryType } = formatSalary(job.salaryRange);
      
      return {
        id: job.id,
        title: job.title,
        company: job.company?.companyName || "",
        salary,
        salaryType,
        tags: [
          job.department,
          job.experienceLevel,
          job.jobType,
          ...(job.requiredSkills?.slice(0, 2).map((skill: any) => skill.name) || [])
        ].filter(Boolean),
        description: job.description,
        location: job.location,
        timePosted: formatTimeAgo(job.postedDate),
        jobType: job.jobType,
        experienceLevel: job.experienceLevel,
        department: job.department,
      };
    });
  };

  // Function to fetch jobs from API
  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      // Add search query if exists
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      // Add job type filter if not "All"
      if (activeFilter !== "All") {
        // Map frontend filter to backend jobType
        const jobTypeMap: { [key: string]: string } = {
          "Part-Time": "part-time",
          "Full-Time": "full-time",
          "Remote": "remote",
          "On-site": "on-site",
        };
        
        if (jobTypeMap[activeFilter]) {
          params.append("jobType", jobTypeMap[activeFilter]);
        }
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_FIREBASE_API_URL}/api/jobs?${params}`;
      console.log("Fetching jobs from:", apiUrl);
      console.log("Search query:", searchQuery);
      console.log("Active filter:", activeFilter);

      const response = await fetch(apiUrl, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      console.log("API Response:", data);
      
      const mappedJobs = mapJobData(data.jobs);
      setJobListings(mappedJobs);
      setPagination(data.pagination);

    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      setError(err.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  // Fetch jobs on component mount and when filters change
  useEffect(() => {
    fetchJobs(1);
  }, [activeFilter, token]);

  // Handle search with debouncing
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchJobs(1);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(1);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header remains the same */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="px-4 sm:px-8 py-4"
      >
        <div className="flex items-center max-w-7xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="text-xl font-semibold text-black"
          >
            Compscope
          </motion.div>

          <div className="hidden md:flex flex-1 max-w-sm mx-10">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search for jobs, skills, or companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-3 pr-20 text-sm text-gray-700 bg-white border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#76FF82] placeholder-[#CFD7CF]"
              />
              {searchQuery && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchQuery("")}
                  className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#76FF82] p-2 rounded-full"
              >
                <Search className="w-4 h-4 text-black" />
              </motion.button>
            </form>
          </div>

          <div className="hidden lg:flex items-center space-x-10">
            <motion.span
              whileHover={{ y: -1 }}
              className="text-sm text-[#32343A] font-medium cursor-pointer"
            >
              Explore
            </motion.span>
            <motion.span
              whileHover={{ y: -1 }}
              className="text-sm text-[#32343A] font-medium cursor-pointer"
            >
              Find Jobs
            </motion.span>
            <motion.span
              whileHover={{ y: -1 }}
              className="text-sm text-[#32343A] font-medium cursor-pointer"
            >
              Hire a Engineer
            </motion.span>
          </div>

          <div className="flex items-center space-x-3 ml-auto bg-white rounded-full">
            <Link href="/notifications">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-3 rounded-full"
            >
              <Mail className="w-4 h-4 text-gray-600" />
            </motion.button>
            </Link>
            <Link href="/profile">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-8 h-8 bg-[#3159AB] p-5 rounded-full flex items-center justify-center text-white font-medium cursor-pointer"
              >
                <span>{user?.name ? user.name.charAt(0) : "NA"}</span>
              </motion.div>
            </Link>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMenu}
            className="lg:hidden ml-3 p-2 text-gray-600"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </motion.button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white rounded-xl mt-4 p-4 shadow-lg"
            >
              <div className="md:hidden mb-4">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="Search for jobs, skills, or companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-6 py-3 pr-20 text-sm text-gray-700 bg-white border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#76FF82] placeholder-[#CFD7CF]"
                  />
                  {searchQuery && (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSearchQuery("")}
                      className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  )}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#76FF82] p-2 rounded-full"
                  >
                    <Search className="w-4 h-4 text-black" />
                  </motion.button>
                </form>
              </div>

              <div className="space-y-3">
                <motion.div
                  whileHover={{ x: 4 }}
                  className="text-sm text-[#32343A] font-medium cursor-pointer py-2"
                >
                  Explore
                </motion.div>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="text-sm text-[#32343A] font-medium cursor-pointer py-2"
                >
                  Find Jobs
                </motion.div>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="text-sm text-[#32343A] font-medium cursor-pointer py-2"
                >
                  Hire a Engineer
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 md:px-20 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-medium text-black">
                {searchQuery ? `Search Results` : "Explore"}
              </h1>
              {searchQuery && (
                <p className="text-sm text-gray-500 mt-1">
                  Results for "{searchQuery}"
                </p>
              )}
            </div>
            {pagination.totalItems > 0 && (
              <p className="text-sm text-gray-600">
                Showing {jobListings.length} of {pagination.totalItems} jobs
              </p>
            )}
          </div>

          <div className="flex flex-wrap space-x-0 mb-5">
            {filterTabs.map((tab, index) => (
              <motion.button
                key={tab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -1 }}
                onClick={() => setActiveFilter(tab)}
                disabled={loading}
                className={`px-6 py-1 text-xs mx-2 mb-2 font-medium rounded-full transition-all disabled:opacity-50 ${
                  activeFilter === tab
                    ? "bg-[#fff] text-[#32343A] hover:text-gray-700"
                    : " bg-[#EBEBEB] text-[#32343A]"
                }`}
              >
                {tab}
              </motion.button>
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#76FF82]" />
              <span className="ml-2 text-gray-600">Loading jobs...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <p className="text-red-600 text-center">
                Error: {error}
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fetchJobs(1)}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-full text-sm mx-auto block"
              >
                Try Again
              </motion.button>
            </div>
          )}

          {/* No Jobs Found */}
          {!loading && !error && jobListings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">
                {searchQuery ? `No jobs found for "${searchQuery}"` : "No jobs found"}
              </p>
              <p className="text-gray-500 text-sm mb-4">
                {searchQuery 
                  ? "Try different keywords or check your spelling" 
                  : "Try adjusting your filters"
                }
              </p>
              {searchQuery && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSearchQuery("")}
                  className="bg-[#76FF82] text-black px-6 py-2 rounded-full text-sm font-medium"
                >
                  Clear Search
                </motion.button>
              )}
            </div>
          )}

          {/* Job Listings */}
          {!loading && !error && jobListings.length > 0 && (
            <div className="space-y-6">
              {jobListings.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -2, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}
                  className="bg-white rounded-xl p-6"
                >
                  <div className="flex flex-col lg:flex-row">
                    <div className="flex flex-1">
                      {/* <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="w-12 h-12 bg-[#C5BCFF] rounded-full flex items-center justify-center text-[#32343A] font-medium mr-4 flex-shrink-0"
                      >
                        {job.company.charAt(0)}
                      </motion.div> */}

                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-black mb-1">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          {job.company}
                        </p>

                        <div className="flex flex-wrap space-x-3 mb-6">
                          {job.tags.slice(0, 3).map((tag, tagIndex) => (
                            <motion.span
                              key={`${job.id}-${tagIndex}`}
                              whileHover={{ scale: 1.02 }}
                              className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full mb-2"
                            >
                              {tag}
                            </motion.span>
                          ))}
                        </div>

                        {/* <div className="mb-4">
                          <h4 className="text-sm font-medium text-black mb-2">
                            About Job
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {job.description}
                          </p>
                        </div> */}

                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{job.timePosted}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-between lg:ml-8 mt-4 lg:mt-0">
                      <div className="">
                        <div className="text-right mb-0 lg:mb-6">
                          <div className="text-2xl font-bold text-black">
                            {job.salary}
                          </div>
                          <div className="text-sm text-gray-500">
                            {job.salaryType}
                          </div>
                        </div>
                      </div>
                      <Link href={`/jobs/details?id=${job.id}`}>
                        <motion.button
                          whileHover={{
                            scale: 1.02,
                            boxShadow: "0 4px 12px rgba(118, 255, 130, 0.3)",
                          }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-[#76FF82] text-black font-medium px-6 py-2 rounded-full text-sm"
                        >
                          View Role
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && pagination.total > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                {Array.from({ length: Math.min(5, pagination.total) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <motion.button
                      key={page}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fetchJobs(page)}
                      disabled={loading}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-50 ${
                        pagination.current === page
                          ? "bg-[#76FF82] text-black"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
