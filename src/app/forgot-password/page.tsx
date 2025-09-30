"use client";

import type React from "react";
import { useState } from "react";
import { Input } from "@/app/components/ui/Input";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { easeOut } from "framer-motion";
import { toast } from "react-toastify";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
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

      localStorage.setItem("resetEmail", email);
      router.push("/forgot-password/otp");
      toast.success("OTP sent to your email");
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
            Forgot Password
          </h1>
          <p className="text-gray-600">
            Enter your email address to reset your password
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              placeholder="xyz@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 bg-white border-gray-200 rounded-lg px-4"
              required
            />
          </motion.div>

          <motion.button
            type="submit"
            className="w-full h-12 cursor-pointer rounded-lg text-black font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#76FF82" }}
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Reset Code"}
          </motion.button>
        </form>

        <motion.div className="text-center mt-6" variants={itemVariants}>
          <button
            onClick={() => router.push("/signin")}
            className="text-sm cursor-pointer text-gray-600 hover:text-gray-800 transition-colors"
          >
            Back to Login
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
