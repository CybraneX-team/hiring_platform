"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from "lucide-react";
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
import { useUser } from "@/app/context/UserContext";
import { toast } from "react-toastify";

export default function SignupPage() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      toast.info("You are already logged in");
      router.push("/company/profile"); // or homepage
    }
  }, [user, router]);

  const { setUserCreds, setmode } = useUser();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    organizationEmail: "",
    companyName: "",
    gstNumber: "",
    password: "",
  });
  const [shouldNavigate, setShouldNavigate] = useState(false);
  
  // GSTIN Validation States
  const [gstinValidation, setGstinValidation] = useState({
    isValidating: false,
    isValid: false,
    hasBeenValidated: false,
    error: "",
    companyDetails: null as {
      tradeName?: string;
      state?: string;
      registrationType?: string;
    } | null,
  });

  // GSTIN Format Validation
  const validateGSTINFormat = (gstin: string): boolean => {
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  };

  // GSTIN Verification Function
  const handleGSTINValidation = async (gstin: string) => {
    if (!gstin.trim()) {
      setGstinValidation({
        isValidating: false,
        isValid: false,
        hasBeenValidated: false,
        error: "",
        companyDetails: null,
      });
      return;
    }

    // Format validation first
    if (!validateGSTINFormat(gstin)) {
      setGstinValidation({
        isValidating: false,
        isValid: false,
        hasBeenValidated: true,
        error: "Invalid GSTIN format. Please enter a valid 15-character GSTIN.",
        companyDetails: null,
      });
      return;
    }

    setGstinValidation(prev => ({ ...prev, isValidating: true, error: "" }));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/company/verify-gstin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gstin }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setGstinValidation({
          isValidating: false,
          isValid: true,
          hasBeenValidated: true,
          error: "",
          companyDetails: {
            tradeName: data.tradeName,
            state: data.state,
            registrationType: data.registrationType,
          },
        });
        
        // Auto-populate company name with trade name from GSTIN (or keep it blank if no trade name)
        setFormData(prev => ({ ...prev, companyName: data.tradeName || "" }));
      } else {
        setGstinValidation({
          isValidating: false,
          isValid: false,
          hasBeenValidated: true,
          error: data.message || "GSTIN verification failed",
          companyDetails: null,
        });
      }
    } catch (error) {
      setGstinValidation({
        isValidating: false,
        isValid: false,
        hasBeenValidated: true,
        error: "Unable to verify GSTIN. Please check your connection and try again.",
        companyDetails: null,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });

    // Real-time GSTIN validation with debounce
    if (id === "gstNumber") {
      // Clear organization name when GSTIN changes (will be repopulated if verification succeeds)
      setFormData(prev => ({ ...prev, [id]: value, companyName: "" }));
      setGstinValidation(prev => ({ ...prev, hasBeenValidated: false }));
      
      // Debounce validation to avoid too many API calls
      const timeoutId = setTimeout(() => {
        handleGSTINValidation(value);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  useEffect(() => {
    if (shouldNavigate) {
      router.push("/otp");
      setShouldNavigate(false);
    }
  }, [shouldNavigate, router]);

  const handleSignup = async () => {
    // Validate form fields
    if (!formData.fullName || !formData.organizationEmail || !formData.companyName || !formData.gstNumber || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check GSTIN validation status
    if (!gstinValidation.isValid) {
      if (!gstinValidation.hasBeenValidated) {
        toast.error("Please wait for GSTIN verification to complete");
        return;
      } else {
        toast.error("Please provide a valid GSTIN before proceeding");
        return;
      }
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/company/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName: formData.companyName,
            gstNumber: formData.gstNumber,
            organizationEmail: formData.organizationEmail,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        // Handle specific error types from backend
        switch (data.error) {
          case "INVALID_GSTIN_FORMAT":
            toast.error("Invalid GSTIN format. Please check your GSTIN number.");
            break;
          case "GSTIN_VERIFICATION_FAILED":
            toast.error("GSTIN verification failed. Please ensure your GSTIN is valid and active.");
            break;
          case "COMPANY_ALREADY_EXISTS":
            toast.error("A company with this name or GSTIN already exists.");
            break;
          case "USER_ALREADY_EXISTS":
            toast.error("An account with this email already exists.");
            break;
          default:
            toast.error(data.message || "Failed to send OTP");
        }
        return;
      }

      // Success - show GSTIN verification details if available
      if (data.gstinDetails) {
        toast.success(`GSTIN verified for ${data.gstinDetails.tradeName || 'your company'}`);
      }

      // Store signup data in session/localStorage to use later in OTP verification
      localStorage.setItem("signupData", JSON.stringify(formData));
      setUserCreds({
        id: data.id,
        name: formData.fullName,
        email: formData.organizationEmail,
        password: formData.password,
        companyName: formData.companyName,
        gstNumber: formData.gstNumber,
      });
      setmode("company");
      router.push("/otp"); // go to OTP page
      setShouldNavigate(true);
    } catch (err: any) {
      console.error("Signup error:", err);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
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
          <Link href="/" className="flex flex-col items-center">
            <Image
              src="/logo.png"
              alt="ProjectMATCH by Compscope"
              width={200}
              height={80}
              className="h-16 sm:h-16 md:h-16 lg:h-16 xl:h-24 w-auto"
              priority
            />
            <p className="text-xs mb-2 sm:text-xs md:text-sm text-gray-600 font-black -mt-1">
               <span className="text-[#3EA442] font-bold">by Compscope</span>
            </p>
          </Link>
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

          {/* GST Number - Now First Field */}
          <motion.div className="space-y-2" variants={itemVariants}>
            <Label
              htmlFor="gstNumber"
              className="text-sm font-medium text-gray-700"
            >
              Organization GST Number
            </Label>
            <motion.div 
              className="relative" 
              variants={inputVariants} 
              whileFocus="focus"
            >
              <Input
                id="gstNumber"
                onChange={handleChange}
                value={formData.gstNumber}
                placeholder="22AAAAA0000A1Z5"
                className={`h-12 bg-white border-gray-200 rounded-lg focus:!ring-black focus:!border-black focus:!outline-none focus:!ring-[1px] pr-12 ${
                  gstinValidation.hasBeenValidated 
                    ? gstinValidation.isValid 
                      ? "border-green-500" 
                      : "border-red-500"
                    : ""
                }`}
              />
              {/* Validation Status Icon */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {gstinValidation.isValidating ? (
                  <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                ) : gstinValidation.hasBeenValidated ? (
                  gstinValidation.isValid ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )
                ) : null}
              </div>
            </motion.div>
            
            {/* Validation Messages */}
            <AnimatePresence>
              {gstinValidation.error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm text-red-600"
                >
                  {gstinValidation.error}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Organization Name - Auto-populated from GSTIN */}
          <motion.div className="space-y-2" variants={itemVariants}>
            <Label
              htmlFor="companyName"
              className="text-sm font-medium text-gray-700"
            >
              Organization Name
            </Label>
            <motion.div variants={inputVariants} whileFocus="focus">
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Your Organization"
                className="h-12 bg-white border-gray-200 rounded-lg focus:!ring-black focus:!border-black focus:!outline-none focus:!ring-[1px]"
              />
            </motion.div>
            {gstinValidation.isValid && gstinValidation.companyDetails?.tradeName && formData.companyName === gstinValidation.companyDetails.tradeName && (
              <p className="text-xs text-green-600">✓ Auto-populated from GSTIN verification</p>
            )}
          </motion.div>

          {/* Full Name */}
          <motion.div className="space-y-2" variants={itemVariants}>
            <Label
              htmlFor="fullName"
              className="text-sm font-medium text-gray-700"
            >
              Full Name
            </Label>
            <motion.div variants={inputVariants} whileFocus="focus">
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="h-12 bg-white border-gray-200 rounded-lg focus:!ring-black focus:!border-black focus:!outline-none focus:!ring-[1px]"
              />
            </motion.div>
          </motion.div>

          {/* Organization Email */}
          <motion.div className="space-y-2" variants={itemVariants}>
            <Label
              htmlFor="organizationEmail"
              className="text-sm font-medium text-gray-700"
            >
              Organization Email
            </Label>
            <motion.div variants={inputVariants} whileFocus="focus">
              <Input
                id="organizationEmail"
                value={formData.organizationEmail}
                onChange={handleChange}
                type="email"
                placeholder="you@organization.com"
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
            <motion.div
              className="relative"
              variants={inputVariants}
              whileFocus="focus"
            >
              <Input
                id="password"
                value={formData.password}
                onChange={handleChange}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="h-12 bg-white border-gray-200 rounded-lg focus:!ring-black focus:!border-black focus:!outline-none focus:!ring-[1px] pr-12"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </motion.div>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            disabled={loading || !gstinValidation.isValid || gstinValidation.isValidating}
            className={`w-full h-12 rounded-lg font-medium transition-all duration-200 ${
              loading || !gstinValidation.isValid || gstinValidation.isValidating
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "text-black hover:opacity-90 cursor-pointer"
            }`}
            style={{ 
              backgroundColor: loading || !gstinValidation.isValid || gstinValidation.isValidating 
                ? "#D1D5DB" 
                : "#76FF82" 
            }}
            onClick={handleSignup}
            variants={buttonVariants}
            initial="initial"
            whileHover={loading || !gstinValidation.isValid || gstinValidation.isValidating ? "initial" : "hover"}
            whileTap={loading || !gstinValidation.isValid || gstinValidation.isValidating ? "initial" : "tap"}
          >
            <motion.span initial={{ opacity: 1 }} whileHover={{ opacity: 0.9 }}>
              {loading ? "Sending OTP..." : "Verify your account"}
            </motion.span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
