"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/app/components/ui/Input";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { easeOut } from "framer-motion";
import { toast } from "react-toastify";

export default function ResetPassword() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    const resetEmail = localStorage.getItem("resetEmail");
    const resetOTP = localStorage.getItem("resetOTP");
    if (!resetEmail || !resetOTP) {
      router.push("/forgot-password");
      return;
    }
    setEmail(resetEmail);
    setOtp(resetOTP);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_FIREBASE_API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          otp, 
          newPassword 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.isGoogleAccount) {
          toast.info(data.message);
        } else {
          toast.error(data.message);
        }
        return;
      }

      // Clear stored data
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("resetOTP");
      
      toast.success("Password reset successfully");
      router.push("/login");
    } catch (error: any) {
      toast.error(`Something went wrong: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: easeOut,
      },
    },
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98, transition: { duration: 0.1 } },
  };

  return (
    <motion.div
      className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className="w-full max-w-md bg-white rounded-lg p-8 shadow-sm"
        variants={itemVariants}
      >
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <h1 className="text-2xl md:text-3xl font-medium text-gray-900 mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600">
            Enter your new password
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-12 bg-white border-gray-200 rounded-lg px-4 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-12 bg-white border-gray-200 rounded-lg px-4 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </motion.div>

          <motion.button
            type="submit"
            className="w-full h-12 rounded-lg text-black font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#76FF82" }}
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating Password..." : "Update Password"}
          </motion.button>
        </form>

        <motion.div className="text-center mt-6" variants={itemVariants}>
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Back to Login
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
