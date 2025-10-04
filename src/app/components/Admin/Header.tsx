"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft, Menu, X, Bell } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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

  const getSearchPlaceholder = () => {
    switch (currentView) {
      case "analytics":
        return "Search not available in analytics view";
      case "companies":
        return "Search companies by name, industry, location...";
      case "roles":
        return "Search roles by title, department, location...";
      case "applications":
      case "applications-list":
        return "Search applications by name, email, role...";
      case "inspect":
      case "inspect-detail":
        return "Search inspector profiles...";
      default:
        return "Search...";
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="px-4 sm:px-6 lg:px-8 py-4 bg-white shadow-sm"
    >
      <div className="flex items-center justify-between w-full">
        {/* Left Section - Back button and Title */}
        <div className="flex items-center flex-shrink-0">
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
          <Link href="/" className="flex items-center gap-1 mr-2">
            <Image
              src="/black_logo.png"
              alt="ProjectMATCH by Compscope"
              width={180}
              height={72}
              className="h-10 sm:h-10 md:h-12 lg:h-12 xl:h-16 w-auto"
              priority
            />
            <div className={`leading-tight text-black hidden md:block`}>
              <div className="text-sm md:text-base font-black">ProjectMATCH</div>
              <div className="text-[10px] md:text-xs text-gray-600">
                <span className="text-[#3EA442] font-bold">by Compscope</span>
              </div>
            </div>
          </Link>

          {/* <motion.div
            whileHover={{ scale: 1.02 }}
            className="text-base sm:text-lg font-semibold text-black whitespace-nowrap"
          >
            Admin Panel
          </motion.div> */}
        </div>

        {/* Center Section - Desktop Search (hidden on analytics) */}
        {currentView !== "analytics" && (
          <div className="hidden md:flex flex-1 justify-center px-4 lg:px-8">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder={getSearchPlaceholder()}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-3 text-sm border-0 rounded-full focus:outline-none placeholder-[#CFD7CF] bg-white text-gray-700 focus:ring-2 focus:ring-[#76FF82]"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-[#76FF82]"
              >
                <Search className="w-4 h-4 text-black" />
              </motion.button>
            </div>
          </div>
        )}

        {/* Right Section - Navigation and Profile */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <motion.button
              whileHover={{ y: -1 }}
              onClick={() => onNavigate && onNavigate("analytics")}
              className={`text-sm font-medium cursor-pointer transition-colors whitespace-nowrap ${
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
              className={`text-sm font-medium cursor-pointer transition-colors whitespace-nowrap ${
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
              className={`text-sm font-medium cursor-pointer transition-colors whitespace-nowrap ${
                currentView === "inspect" || currentView === "inspect-detail"
                  ? "text-[#76FF82]"
                  : "text-[#32343A] hover:text-[#76FF82]"
              }`}
            >
              Inspector
            </motion.button>
          </div>

          {/* Desktop Admin Profile with Bell Icon */}
          <div className="hidden sm:flex items-center space-x-3 bg-[#F5F5F5] rounded-full px-3 lg:px-4 py-2 flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-6 h-6 lg:w-8 lg:h-8 bg-[#3159AB] rounded-full flex items-center justify-center text-white font-medium cursor-pointer text-xs lg:text-sm flex-shrink-0"
            >
              A
            </motion.div>
            <span className="text-xs lg:text-sm font-medium text-gray-700 whitespace-nowrap">
              Admin
            </span>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMenu}
            className="sm:hidden p-2 text-gray-600 flex-shrink-0"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </motion.button>
        </div>
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
            {/* Mobile Search (hidden on analytics) */}
            {currentView !== "analytics" && (
              <div className="mb-4">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder={getSearchPlaceholder()}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-[#F5F5F5] border-0 rounded-full focus:outline-none focus:ring-0 placeholder-[#CFD7CF] text-gray-400"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-[#76FF82]"
                  >
                    <Search className="w-4 h-4 text-black" />
                  </motion.button>
                </div>
              </div>
            )}

            {/* Mobile Navigation */}
            <div className="space-y-3 mt-4">
              <motion.button
                whileHover={{ x: 4 }}
                onClick={() => {
                  onNavigate && onNavigate("analytics");
                  setIsMenuOpen(false);
                }}
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
                onClick={() => {
                  onNavigate && onNavigate("companies");
                  setIsMenuOpen(false);
                }}
                className={`block text-sm font-medium cursor-pointer py-2 transition-colors ${
                  currentView === "companies"
                    ? "text-[#76FF82]"
                    : "text-[#32343A] hover:text-[#76FF82]"
                }`}
              >
                Companies
              </motion.button>
              <motion.button
                whileHover={{ x: 4 }}
                onClick={() => {
                  onNavigate && onNavigate("inspect");
                  setIsMenuOpen(false);
                }}
                className={`block text-sm font-medium cursor-pointer py-2 transition-colors ${
                  currentView === "inspect" || currentView === "inspect-detail"
                    ? "text-[#76FF82]"
                    : "text-[#32343A] hover:text-[#76FF82]"
                }`}
              >
                Inspector
              </motion.button>
            </div>

            {/* Mobile Admin Profile */}
            <div className="flex items-center space-x-3 bg-[#F5F5F5] rounded-full px-4 py-2 mt-4 w-fit">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Link href="/notifications">
                  <Bell className="w-4 h-4 text-gray-600" />
                </Link>
              </motion.button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-8 h-8 bg-[#3159AB] rounded-full flex items-center justify-center text-white font-medium cursor-pointer flex-shrink-0"
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
