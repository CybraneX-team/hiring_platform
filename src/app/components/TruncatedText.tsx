"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  maxWords?: number;
  className?: string;
  showReadMore?: boolean;
  readMoreText?: string;
  readLessText?: string;
}

export default function TruncatedText({
  text,
  maxLength = 150,
  maxWords = 50,
  className = "",
  showReadMore = true,
  readMoreText = "Read more",
  readLessText = "Read less"
}: TruncatedTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Helper function to get word count
  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };
  
  // Helper function to truncate by words
  const truncateByWords = (text: string, maxWords: number) => {
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ');
  };
  
  // Determine truncation method and limits
  const useWordLimit = maxWords !== undefined;
  const wordCount = getWordCount(text);
  const shouldTruncate = useWordLimit ? wordCount > maxWords : text.length > maxLength;
  
  if (!text || !shouldTruncate) {
    return <span className={className}>{text}</span>;
  }

  const truncatedText = useWordLimit ? truncateByWords(text, maxWords) : text.substring(0, maxLength);
  const shouldShowButton = showReadMore && shouldTruncate;

  return (
    <div className={className}>
      <span>
        {isExpanded ? text : truncatedText}
        {!isExpanded && text.length > maxLength && "..."}
      </span>
      
      {shouldShowButton && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-1 text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
        >
          {isExpanded ? readLessText : readMoreText}
        </motion.button>
      )}
    </div>
  );
}
