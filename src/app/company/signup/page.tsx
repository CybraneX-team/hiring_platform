"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Input } from "@/app/components/ui/Input";
import { Label } from "@/app/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  easeInOut,
  easeOut,
  easeIn,
} from "framer-motion";

export default function SignupPage() {
  const router = useRouter();

  // Animation variants
  const containerVariants = {
    hidden: "",
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
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 },
    },
  };

  const socialButtonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 },
    },
  };

  const inputVariants = {
    focus: {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-[#F5F5F5]"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container mx-auto px-6 py-8">
        <motion.div className="mb-10" variants={itemVariants}>
          <h1 className="text-lg font-medium text-gray-900">Logo</h1>
        </motion.div>

        <div className="max-w-md mx-auto space-y-6">
          <motion.div className="text-center space-y-2" variants={itemVariants}>
            <h2 className="text-2xl md:text-3xl font-medium text-gray-900">
              Create an account
            </h2>
            <p className="text-sm text-gray-600">
              Have an account ?{" "}
              <Link href="/signin" className="text-gray-900 hover:underline">
                Sign in
              </Link>
            </p>
          </motion.div>

          {/* Full Name */}
          <motion.div className="space-y-2" variants={itemVariants}>
            <Label
              htmlFor="fullname"
              className="text-sm font-medium text-gray-700"
            >
              Full Name
            </Label>
            <motion.div variants={inputVariants} whileFocus="focus">
              <Input
                id="fullname"
                placeholder="John Doe"
                className="h-12 bg-white border-gray-200 rounded-lg focus:!ring-black focus:!border-black focus:!outline-none focus:!ring-[1px]"
              />
            </motion.div>
          </motion.div>

          {/* Organization Email */}
          <motion.div className="space-y-2" variants={itemVariants}>
            <Label
              htmlFor="orgEmail"
              className="text-sm font-medium text-gray-700"
            >
              Organization Email
            </Label>
            <motion.div variants={inputVariants} whileFocus="focus">
              <Input
                id="orgEmail"
                type="email"
                placeholder="you@organization.com"
                className="h-12 bg-white border-gray-200 rounded-lg focus:!ring-black focus:!border-black focus:!outline-none focus:!ring-[1px]"
              />
            </motion.div>
          </motion.div>

          {/* Organization Name */}
          <motion.div className="space-y-2" variants={itemVariants}>
            <Label
              htmlFor="orgName"
              className="text-sm font-medium text-gray-700"
            >
              Organization Name
            </Label>
            <motion.div variants={inputVariants} whileFocus="focus">
              <Input
                id="orgName"
                placeholder="Your Organization"
                className="h-12 bg-white border-gray-200 rounded-lg focus:!ring-black focus:!border-black focus:!outline-none focus:!ring-[1px]"
              />
            </motion.div>
          </motion.div>

          {/* GST Number */}
          <motion.div className="space-y-2" variants={itemVariants}>
            <Label htmlFor="gst" className="text-sm font-medium text-gray-700">
              Organization GST Number
            </Label>
            <motion.div variants={inputVariants} whileFocus="focus">
              <Input
                id="gst"
                placeholder="22AAAAA0000A1Z5"
                className="h-12 bg-white border-gray-200 rounded-lg focus:!ring-black focus:!border-black focus:!outline-none focus:!ring-[1px]"
              />
            </motion.div>
          </motion.div>

          {/* Password */}
          <motion.div className="space-y-2" variants={itemVariants}>
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </Label>
            <motion.div variants={inputVariants} whileFocus="focus">
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="h-12 bg-white border-gray-200 rounded-lg focus:!ring-black focus:!border-black focus:!outline-none focus:!ring-[1px]"
              />
            </motion.div>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            className="w-full h-12 rounded-lg text-black font-medium transition-opacity hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: "#76FF82" }}
            onClick={() => router.push("/otp")}
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
          >
            <motion.span initial={{ opacity: 1 }} whileHover={{ opacity: 0.9 }}>
              Verify your account
            </motion.span>
          </motion.button>

          {/* Divider */}
          <motion.div className="relative" variants={itemVariants}>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#F5F5F5] px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </motion.div>

          {/* Social Buttons */}
          <motion.div
            className="grid grid-cols-2 gap-3"
            variants={itemVariants}
          >
            <motion.button
              className="h-12 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors"
              variants={socialButtonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
            >
              <span className="text-lg font-bold text-black">G</span>
            </motion.button>
            <motion.button
              className="h-12 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors"
              variants={socialButtonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
            >
              <span className="text-lg">
                <Image
                  src="/images/apple.png"
                  height={14}
                  width={11}
                  alt="Apple"
                />
              </span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
