import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Mail,
  MoreHorizontal,
  MapPin,
  Clock,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function JobHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  return (
    <div>
      <div className="">
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

            {/* <div className="hidden md:flex flex-1 max-w-sm mx-10">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for a role"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-3 text-sm text-gray-400 bg-white border-0 rounded-full focus:outline-none focus:ring-0 placeholder-[#CFD7CF]"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#76FF82] p-2 rounded-full"
                >
                  <Search className="w-4 h-4 text-black" />
                </motion.button>
              </div>
            </div> */}


            {/* User icons - positioned to the far right */}
            {/* <div className="flex items-center space-x-3 ml-auto bg-white rounded-full">
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
                  R
                </motion.div>
              </Link>
            </div> */}

            {/* Hamburger menu */}
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
                {/* Mobile Search Bar */}
                <div className="md:hidden mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search for a role"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-6 py-3 text-sm text-gray-400 bg-white border-0 rounded-full focus:outline-none focus:ring-0 placeholder-[#CFD7CF]"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      
                      whileTap={{ scale: 0.95 }}
                      className="absolute right-2 top-1/2 cursor-pointer transform -translate-y-1/2 bg-[#76FF82] p-2 rounded-full"
                    >
                      <Search className="w-4 h-4 text-black" />
                    </motion.button>
                  </div>
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
      </div>
    </div>
  );
}

export default JobHeader;
