"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft, Menu, X } from "lucide-react";
import type { ViewType } from "@/app/types";

interface HeaderProps {
  currentView: ViewType;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onBack: () => void;
  onNavigate?: (view: ViewType) => void;
}

export default function Header({
  currentView,
  searchQuery,
  setSearchQuery,
  onBack,
  onNavigate,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="px-4 sm:px-6 lg:px-8 py-4 bg-white shadow-sm"
    >
      <div className="flex items-center max-w-7xl mx-auto">
        <div className="flex items-center">
          {currentView !== "companies" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="mr-2 sm:mr-4 p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </motion.button>
          )}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="text-lg sm:text-xl font-semibold text-black"
          >
            Admin Panel
          </motion.div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md w-full mx-4 lg:mx-10">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 lg:px-6 py-2 lg:py-3 text-sm text-gray-400 bg-[#F5F5F5] border-0 rounded-full focus:outline-none focus:ring-0 placeholder-[#CFD7CF]"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#76FF82] p-2 rounded-full"
              >
                <Search className="w-3 h-3 lg:w-4 lg:h-4 text-black" />
              </motion.button>
            </div>
          </div>
          {/* Desktop Analytics Navigation */}
          <div className="hidden lg:flex items-center space-x-6 ml-8">
            <motion.button
              whileHover={{ y: -1 }}
              onClick={() => onNavigate && onNavigate("analytics")}
              className={`text-sm font-medium cursor-pointer transition-colors ${
                currentView === "analytics"
                  ? "text-[#76FF82]"
                  : "text-[#32343A] hover:text-[#76FF82]"
              }`}
            >
              Analytics
            </motion.button>
            <motion.button
              whileHover={{ y: -1 }}
              onClick={() => onNavigate && onNavigate("companies")}
              className={`text-sm font-medium cursor-pointer transition-colors ${
                currentView === "companies"
                  ? "text-[#76FF82]"
                  : "text-[#32343A] hover:text-[#76FF82]"
              }`}
            >
              Companies
            </motion.button>
            <motion.button
              whileHover={{ y: -1 }}
              onClick={() => onNavigate && onNavigate("inspect")}
              className={`text-sm font-medium cursor-pointer transition-colors ${
                currentView === "inspect" || currentView === "inspect-detail"
                  ? "text-[#76FF82]"
                  : "text-[#32343A] hover:text-[#76FF82]"
              }`}
            >
              Inspector
            </motion.button>
          </div>
        </div>
        {/* Desktop Admin Profile */}
        <div className="hidden sm:flex items-center space-x-3 ml-auto bg-[#F5F5F5] rounded-full px-3 lg:px-4 py-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-6 h-6 lg:w-8 lg:h-8 bg-[#3159AB] rounded-full flex items-center justify-center text-white font-medium cursor-pointer text-xs lg:text-sm"
          >
            A
          </motion.div>
          <span className="text-xs lg:text-sm font-medium text-gray-700">
            Admin
          </span>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleMenu}
          className="sm:hidden ml-auto p-2 text-gray-600"
        >
          {isMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="sm:hidden bg-white mt-4 p-4 border-t border-gray-100"
          >
            {/* Mobile Search */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-gray-400 bg-[#F5F5F5] border-0 rounded-full focus:outline-none focus:ring-0 placeholder-[#CFD7CF]"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#76FF82] p-2 rounded-full"
                >
                  <Search className="w-4 h-4 text-black" />
                </motion.button>
              </div>
            </div>

            {/* Mobile Analytics Navigation */}
            <div className="space-y-3 mt-4">
              <motion.button
                whileHover={{ x: 4 }}
                onClick={() => onNavigate && onNavigate("analytics")}
                className={`block text-sm font-medium cursor-pointer py-2 transition-colors ${
                  currentView === "analytics"
                    ? "text-[#76FF82]"
                    : "text-[#32343A] hover:text-[#76FF82]"
                }`}
              >
                Analytics
              </motion.button>
              <motion.button
                whileHover={{ x: 4 }}
                onClick={() => onNavigate && onNavigate("companies")}
                className={`block text-sm font-medium cursor-pointer py-2 transition-colors ${
                  currentView === "companies"
                    ? "text-[#76FF82]"
                    : "text-[#32343A] hover:text-[#76FF82]"
                }`}
              >
                Companies
              </motion.button>
            </div>

            {/* Mobile Admin Profile */}
            <div className="flex items-center space-x-3 bg-[#F5F5F5] rounded-full px-4 py-2 mt-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-8 h-8 bg-[#3159AB] rounded-full flex items-center justify-center text-white font-medium cursor-pointer"
              >
                A
              </motion.div>
              <span className="text-sm font-medium text-gray-700">Admin</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
