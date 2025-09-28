"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Input } from "@/app/components/ui/Input";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { easeOut } from "framer-motion";
import { toast } from "react-toastify";

export default function ForgotPasswordOtp() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const resetEmail = localStorage.getItem("resetEmail");
    if (!resetEmail) {
      router.push("/forgot-password");
      return;
    }
    setEmail(resetEmail);
  }, [router]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 3) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const verifyOTP = async () => {
    const finalOTP = otp.join("");
    if (finalOTP.length !== 4) {
      toast.error("Please enter complete OTP");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_FIREBASE_API_URL}/auth/verify-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: finalOTP })
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

      localStorage.setItem("resetOTP", finalOTP);
      router.push("/forgot-password/reset");
      toast.success("OTP verified successfully");
    } catch (error: any) {
      toast.error(`Something went wrong: ${error.message}`);
    } finally {
      setIsVerifying(false);
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

  const Loader = () => {
    const messages = [
      "Verifying your OTP...",
      "Checking security codes...",
      "Almost there...",
    ];

    const [currentMessage, setCurrentMessage] = useState(messages[0]);

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentMessage((prev) => {
          const currentIndex = messages.indexOf(prev);
          return messages[(currentIndex + 1) % messages.length];
        });
      }, 800);

      return () => clearInterval(interval);
    }, []);

    return (
      <motion.div
        className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center text-center px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-20 h-20 border-[5px] border-t-[#76FF82] border-gray-300 rounded-full animate-spin mb-6"
          initial={{ scale: 0.8 }}
          animate={{ scale: [1, 1.1, 1], rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        />
        <motion.p
          key={currentMessage}
          className="text-gray-800 text-lg font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
        >
          {currentMessage}
        </motion.p>
      </motion.div>
    );
  };

  return (
    <>
      {isVerifying && <Loader />}
      <motion.div
        className="min-h-screen bg-[#F5F5F5]"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="container mx-auto px-6 py-8">
          <motion.div className="mb-16" variants={itemVariants}>
            <h1 className="text-lg font-medium text-gray-900">Logo</h1>
          </motion.div>

          <motion.div variants={itemVariants}>
            <motion.button
              className="rounded-full px-6 py-1 text-[#32343A] bg-[#DFDFDF] md:ml-52 md:mt-10 cursor-pointer"
              onClick={() => router.push("/forgot-password")}
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
            >
              Back
            </motion.button>
          </motion.div>

          <div className="max-w-md mx-auto space-y-6 mb-5">
            <motion.div className="text-center space-y-2" variants={itemVariants}>
              <h2 className="text-2xl md:text-3xl font-medium text-gray-900">
                Verify Reset Code
              </h2>
              <p className="text-base text-gray-600 mt-8">
                Enter the Verification Code <br />
                Sent to {email}
              </p>
            </motion.div>

            <motion.div className="mt-5" variants={itemVariants}>
              <div className="flex gap-2 items-center mt-5">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="h-12 w-12 text-center bg-white border-gray-200 rounded-lg mt-5"
                    maxLength={1}
                  />
                ))}
                <motion.button
                  className="p-4 px-8 rounded-lg flex items-center justify-center transition-colors mt-5 cursor-pointer"
                  style={{ backgroundColor: "#17181D" }}
                  variants={buttonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={verifyOTP}
                >
                  <ArrowRight className="h-4 w-4 text-white" />
                </motion.button>
              </div>
            </motion.div>

            <motion.button
              className="w-full h-12 rounded-lg text-black font-medium transition-opacity hover:opacity-90 mt-10 cursor-pointer"
              style={{ backgroundColor: "#76FF82" }}
              variants={buttonVariants}
              initial="initial"
              onClick={verifyOTP}
              whileHover="hover"
              whileTap="tap"
              disabled={isVerifying}
            >
              {isVerifying ? "Verifying..." : "Verify Code"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
