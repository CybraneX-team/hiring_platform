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
  LogOut,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "../context/UserContext";
import { handleLogout } from "../Helper/logout";
import { useRouter } from "next/navigation";

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
  noOfOpenings: number;
  totalApplications: number;
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

const filterTabs = ["All", "Short Term", "Long Term"];

export default function JobComponent() {
  const [activeFilter, setActiveFilter] = useState("All");
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [allJobs, setAllJobs] = useState<JobListing[]>([]);
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

  const { user, setprofile, setuser } = useUser();

  // Function to format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hrs ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} weeks ago`;
  };

  // Function to get last 4 comma-separated parts of location
  const getLastFourParts = (location: string) => {
    if (!location || location === "Location unavailable") return location;
    const parts = location.split(',').map(part => part.trim()).filter(part => part.length > 0);
    if (parts.length <= 4) return location;
    return parts.slice(-4).join(', ');
  };

  const truncateText = (text: string, max: number = 30) => {
    if (!text) return text;
    return text.length > max ? `${text.slice(0, max)}...` : text;
  };

  // Function to format salary and type from API (no hardcoded per/year)
// Function to format salary and type from API with payoff percentage deduction
const formatSalary = (salaryRange: any, payRangeType?: string, payoffPercentage?: number) => {
  if (!salaryRange) return { salary: "Negotiable", salaryType: payRangeType || "" };

  const { min, max, currency = "₹", period } = salaryRange;
  const derivedType = period || payRangeType || "";
  const payoff = payoffPercentage || 0;

  // Calculate amounts after deducting payoff percentage
  const calculateDeductedAmount = (amount: number) => {
    return Math.round(amount - (amount * payoff / 100));
  };

  if (min && max) {
    // If min and max are the same, show single value with deduction
    if (min === max) {
      const deductedAmount = calculateDeductedAmount(min);
      return {
        salary: `${currency}${deductedAmount.toLocaleString()}`,
        salaryType: derivedType,
      };
    }
    // Different min and max - show range with deductions
    const deductedMin = calculateDeductedAmount(min);
    const deductedMax = calculateDeductedAmount(max);
    return {
      salary: `${currency}${deductedMin.toLocaleString()}-${deductedMax.toLocaleString()}`,
      salaryType: derivedType,
    };
  } else if (min) {
    const deductedMin = calculateDeductedAmount(min);
    return {
      salary: `${currency}${deductedMin.toLocaleString()}+`,
      salaryType: derivedType,
    };
  } else if (max) {
    const deductedMax = calculateDeductedAmount(max);
    return {
      salary: `Up to ${currency}${deductedMax.toLocaleString()}`,
      salaryType: derivedType,
    };
  }

  return { salary: "Negotiable", salaryType: derivedType };
};


  // Normalize period text coming from API (e.g., "Per/Year" -> "Year", "per/monthly" -> "Monthly")
  const normalizePeriod = (t?: string) => {
    if (!t) return "";
    const cleaned = String(t).replace(/^per\/?/i, "").replace(/^\//, "").trim();
    // Capitalize first letter
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  // Function to map API response to frontend format
// Function to map API response to frontend format
const mapJobData = (apiJobs: any[]): any => {
  return apiJobs.map((job: any) => {
    const { salary, salaryType } = formatSalary(
      job.salaryRange, 
      job.payRangeType,
      job.payoffAmountPercentage // Pass the payoff percentage
    );
    // Only show period strictly from API-provided payRangeType
    const period = normalizePeriod(job.payRangeType || "");
    return {
      id: job.id,
      title: job.title,
      company: job.company?.companyName || "",
      salary,
      salaryType: period,
      description: job.description,
      location: job.location,
      timePosted: formatTimeAgo(job.postedDate),
      jobType: job.jobType,
      experienceLevel: job.experienceLevel,
      department: job.department,
      noOfOpenings: job.noOfOpenings,
      totalApplications: job.totalApplications,
      payoffAmountPercentage: job.payoffAmountPercentage, // Store for future reference
    };
  });
};


  // Function to filter jobs based on active filter
  const filterJobs = (jobs: JobListing[], filter: string): JobListing[] => {
    if (filter === "All") return jobs;

    return jobs.filter((job) => {
      const jobType = (job.jobType || "").toLowerCase();

      switch (filter) {
        case "Long Term":
          return jobType.includes("long term") || jobType.includes("long-term") || jobType === "longterm";
        case "Short Term":
          return jobType.includes("short term") || jobType.includes("short-term") || jobType === "shortterm";
        default:
          return true;
      }
    });
  };

  // Function to fetch jobs from API
  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "100", // Fetch more jobs to allow client-side filtering
      });

      // Add search query if exists
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/jobs?${params}`;

      const response = await fetch(apiUrl, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      try {
        // Log a lightweight snapshot to compare list payload period fields
        // eslint-disable-next-line no-console
        console.log("[JobsList] period snapshot", data.jobs.map((j: any) => ({
          id: j.id,
          title: j.title,
          payRangeType: j.payRangeType,
          salaryRangePeriod: j.salaryRange?.period,
        })));
      } catch {}

      let mappedJobs = mapJobData(data.jobs);

      // If payRangeType is missing in list payload, fetch details for only those jobs to enrich period
      const jobsMissingPeriod = data.jobs.filter((j: any) => !j?.payRangeType && !j?.salaryRange?.period);
      if (jobsMissingPeriod.length > 0) {
        try {
          const periodResults = await Promise.all(
            jobsMissingPeriod.map(async (j: any) => {
              try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${j.id}`, { headers: { 'Content-Type': 'application/json' } });
                if (!res.ok) return null;
                const jd = await res.json();
                return { id: j.id, period: jd?.payRangeType || jd?.salaryRange?.period || '' };
              } catch {
                return null;
              }
            })
          );
          const override: Record<string, string> = {};
          periodResults.forEach((r) => { if (r?.id && r?.period) override[r.id] = r.period; });
          if (Object.keys(override).length) {
            mappedJobs = mappedJobs.map((m: any) => ({
              ...m,
              salaryType: normalizePeriod(override[m.id] || m.salaryType),
            }));
          }
        } catch {}
      }

      setAllJobs(mappedJobs);

      // Apply current filter to the fetched jobs
      const filteredJobs = filterJobs(mappedJobs, activeFilter);
      setJobListings(filteredJobs);

      // Update pagination based on filtered results
      setPagination({
        current: 1,
        total: Math.ceil(filteredJobs.length / 20),
        totalItems: filteredJobs.length,
      });
    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      setError(err.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    if (allJobs.length > 0) {
      const filteredJobs = filterJobs(allJobs, filter);
      setJobListings(filteredJobs);
      setPagination({
        current: 1,
        total: Math.ceil(filteredJobs.length / 20),
        totalItems: filteredJobs.length,
      });
    }
  };

  // Fetch jobs on component mount and when search changes
  useEffect(() => {
    fetchJobs(1);
  }, [token]);

  // Handle search with debouncing
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchJobs(1);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  // Apply filter when activeFilter changes
  useEffect(() => {
    if (allJobs.length > 0) {
      const filteredJobs = filterJobs(allJobs, activeFilter);
      setJobListings(filteredJobs);
      setPagination({
        current: 1,
        total: Math.ceil(filteredJobs.length / 20),
        totalItems: filteredJobs.length,
      });
    }
  }, [activeFilter, allJobs]);

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
        className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4"
      >
        <div className="flex items-center w-full">
          <Link href="/" className="flex items-center gap-1">
            <Image
              src="/black_logo.png"
              alt="ProjectMATCH by Compscope"
              width={200}
              height={80}
              className="h-16 sm:h-16 md:h-16 lg:h-16 xl:h-28 w-auto"
              priority
            />
            <div className={`leading-tight text-black`}>
              <div className="text-xs sm:text-sm md:text-base lg:text-2xl font-black">
                ProjectMATCH
              </div>
              <div className="text-[10px] sm:text-xs md:text-sm text-gray-600">
                <span className="text-[#3EA442] font-bold">by Compscope</span>
              </div>
            </div>
          </Link>

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
          {token && (
            <button
              className="cursor-pointer relative left-24 ml-2 p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              onClick={() =>
                handleLogout(setToken, setuser, setprofile, router)
              }
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}

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
              {activeFilter !== "All" && (
                <p className="text-sm text-gray-500 mt-1">
                  Showing {activeFilter} positions
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
                onClick={() => handleFilterChange(tab)}
                disabled={loading}
                className={`px-6 py-1 text-xs mx-2 mb-2  cursor-pointer font-medium rounded-full transition-all disabled:opacity-50 ${activeFilter === tab
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
              <p className="text-red-600 text-center">Error: {error}</p>
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
                {searchQuery
                  ? `No jobs found for "${searchQuery}"`
                  : activeFilter !== "All"
                    ? `No ${activeFilter} jobs found`
                    : "No jobs found"}
              </p>
              <p className="text-gray-500 text-sm mb-4">
                {searchQuery
                  ? "Try different keywords or check your spelling"
                  : activeFilter !== "All"
                    ? "Try selecting a different filter or search for specific roles"
                    : "Try adjusting your filters"}
              </p>
              <div className="flex gap-3 justify-center">
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
                {activeFilter !== "All" && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleFilterChange("All")}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-full text-sm font-medium"
                  >
                    Show All Jobs
                  </motion.button>
                )}
              </div>
            </div>
          )}

          {/* Job Listings */}
          {!loading && !error && jobListings.length > 0 && (
            <div className="space-y-6">
              {jobListings.map((job: any, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{
                    y: -2,
                    boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                  }}
                  className="bg-white rounded-xl p-6"
                >
                  <div className="flex flex-col lg:flex-row">
                    <div className="flex flex-1">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-lg font-medium text-black">
                            {job.title}
                          </h3>
                          {job.jobType && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                              {job.jobType}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                          {job.company}
                        </p>

                        <div className="flex flex-wrap space-x-3 mb-6">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Applications
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              {job.totalApplications || 0}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Positions
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              {job.noOfOpenings || 1}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span title={getLastFourParts(job.location)}>{truncateText(getLastFourParts(job.location), 30)}</span>
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
                          {job.salaryType && (
                            <div className="text-sm font-normal text-gray-500">{job.salaryType}</div>
                          )}
                        </div>
                      </div>
                      <Link href={`/jobs/details?id=${job.id}`}>
                        <motion.button
                          whileHover={{
                            scale: 1.02,
                            boxShadow: "0 4px 12px rgba(118, 255, 130, 0.3)",
                          }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-[#76FF82] text-black font-medium cursor-pointer px-6 py-2 rounded-full text-sm"
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

          {/* Pagination - Only show if there are many jobs */}
          {!loading && !error && pagination.total > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                {Array.from(
                  { length: Math.min(5, pagination.total) },
                  (_, i) => {
                    const page = i + 1;
                    return (
                      <motion.button
                        key={page}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          // For client-side pagination, you might want to implement chunking
                          // For now, all filtered results are shown
                        }}
                        disabled={loading}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-50 ${pagination.current === page
                          ? "bg-[#76FF82] text-black"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                          }`}
                      >
                        {page}
                      </motion.button>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
