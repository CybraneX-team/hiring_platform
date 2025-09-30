// components/ApplyButton.tsx
"use client";
import { useState } from "react";

interface ApplyButtonProps {
  jobId: string;
  userId?: string;
  disabled?: boolean;
}

const ApplyButton: React.FC<ApplyButtonProps> = ({ jobId, userId, disabled }) => {
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  const handleApply = async () => {
    if (!userId) {
      alert("Please login to apply");
      return;
    }

    setIsApplying(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId,
          userId,
          coverLetter: coverLetter.trim() || undefined
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setApplied(true);
        setShowApplicationForm(false);
        alert(
          `Application submitted successfully!\n\n` +
          `AI Match Score: ${data.matchScore}%\n` +
          `Analysis: ${data.aiAnalysis?.matchReason || 'Processing...'}`
        );
      } else {
        alert(data.message || "Failed to apply for job");
      }
    } catch (error) {
      console.error("Error applying:", error);
      alert("Failed to apply for job. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };

  if (applied) {
    return (
      <button 
        disabled 
        className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center"
      >
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Application Submitted
      </button>
    );
  }

  if (showApplicationForm) {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
        <h3 className="font-semibold text-gray-900">Complete Your Application</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cover Letter (Optional)
          </label>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Tell us why you're interested in this position and what makes you a great fit..."
            className="w-full p-3 border rounded-lg h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1">
            {coverLetter.length}/500 characters
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleApply}
            disabled={isApplying}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center"
          >
            {isApplying ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Match...
              </>
            ) : (
              "Submit Application"
            )}
          </button>
          <button
            onClick={() => {
              setShowApplicationForm(false);
              setCoverLetter("");
            }}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded">
          <div className="flex items-start">
            <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <span className="font-medium">AI Matching Active:</span> Our AI will analyze your profile against job requirements including location proximity, skills alignment, experience level, and education to provide an instant compatibility score.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowApplicationForm(true)}
      disabled={disabled || isApplying}
      className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      Apply Now
    </button>
  );
};

export default ApplyButton;
