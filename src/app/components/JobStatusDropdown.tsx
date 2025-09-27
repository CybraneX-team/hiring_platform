'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Job Status Dropdown Component - Fixed Both Issues
const JobStatusDropdown = ({ 
  value, 
  onChange, 
  jobId,
  isUpdating = false 
}: {
  value: string;
  onChange: (status: string, jobId: string) => void;
  jobId: string;
  isUpdating?: boolean;
}) => {
  // ✅ FIXED: Each dropdown has its own unique state using jobId
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const statusOptions = [
    { 
      value: "Open", 
      label: "Open", 
      dotColor: "bg-emerald-500",
      textColor: "text-emerald-700",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200"
    },
    { 
      value: "Paused", 
      label: "Paused", 
      dotColor: "bg-amber-500",
      textColor: "text-amber-700",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200"
    },
    { 
      value: "Closed", 
      label: "Closed", 
      dotColor: "bg-red-500",
      textColor: "text-red-700",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    }
  ];

  // ✅ FIXED: Better position calculation that doesn't move with scroll
  const calculatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();

      // Use viewport coordinates, not scroll-dependent coordinates
      setDropdownPosition({
        top: rect.bottom + 8, // Just below the button
        left: rect.right - 140, // Right-aligned to button
        width: Math.max(rect.width, 140)
      });
    }
  };

  // Handle dropdown toggle
  const handleToggle = () => {
    if (!isUpdating) {
      if (!isOpen) {
        calculatePosition();
      }
      setIsOpen(!isOpen);
    }
  };

  // ✅ FIXED: Better event handling - close on scroll to prevent weird positioning
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // ✅ FIXED: Close dropdown on scroll instead of trying to reposition
    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false); // Just close it - better UX
      }
    };

    // ✅ FIXED: Close dropdown on resize
    const handleResize = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const selectedOption = statusOptions.find(option => option.value === value);

  const buildButtonClassName = () => {
    let baseClasses = "inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border transition-all duration-200 min-w-[110px] justify-between";

    if (selectedOption) {
      baseClasses += ` ${selectedOption.textColor} ${selectedOption.bgColor} ${selectedOption.borderColor}`;
    } else {
      baseClasses += " text-gray-600 bg-gray-50 border-gray-200";
    }

    if (isUpdating) {
      baseClasses += " opacity-50 cursor-not-allowed";
    } else {
      baseClasses += " hover:shadow-sm cursor-pointer hover:border-gray-300";
    }

    return baseClasses;
  };

  const buildOptionClassName = (option: any) => {
    let baseClasses = "w-full px-3 py-2.5 text-left text-sm transition-colors flex items-center gap-3 border-none";

    if (option.value === value) {
      baseClasses += ` ${option.bgColor} ${option.textColor}`;
    } else {
      baseClasses += " text-gray-700 hover:bg-gray-50 hover:text-gray-900";
    }

    return baseClasses;
  };

  return (
    <>
      <div className="relative">
        <motion.button
          ref={buttonRef}
          type="button"
          onClick={handleToggle}
          disabled={isUpdating}
          className={buildButtonClassName()}
          whileTap={{ scale: isUpdating ? 1 : 0.98 }}
        >
          <div className="flex items-center gap-2">
            {isUpdating ? (
              <div className="w-2 h-2 border border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className={`w-2 h-2 rounded-full ${selectedOption?.dotColor || 'bg-gray-400'}`} />
            )}
            <span className="text-sm">
              {isUpdating ? 'Updating...' : (selectedOption?.label || value)}
            </span>
          </div>

          {!isUpdating && (
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 opacity-60" />
            </motion.div>
          )}
        </motion.button>
      </div>

      {/* ✅ FIXED: Portal with viewport-based positioning */}
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && !isUpdating && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="fixed bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                minWidth: dropdownPosition.width,
                zIndex: 9999,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
            >
              {statusOptions.map((option) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value, jobId);
                    setIsOpen(false);
                  }}
                  className={buildOptionClassName(option)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className={`w-2 h-2 rounded-full ${option.dotColor}`} />
                  <span className="font-medium">{option.label}</span>
                  {option.value === value && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default JobStatusDropdown;