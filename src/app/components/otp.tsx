"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Input } from "@/app/components/ui/Input";
import { Label } from "@/app/components/ui/label";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { easeOut } from "framer-motion";
import { useUser } from "../context/UserContext";
import { toast } from "react-toastify";

export default function Otp() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [enteredOtp, setenteredOtp] = useState("");
  const { userCreds, setuser, setUserCreds, mode, loginCreds } = useUser();
  const [loggingIn, setloggingIn] = useState(false);

  const finalMode = mode
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

  const otpToSent = () => {
    otp.forEach((e) => {
      let s = "";
      s += e;
      setenteredOtp(s);
      return enteredOtp;
    });
  };
  async function verifyOTP() {
    try {
      setloggingIn(true);

      // Collect OTP from array
      let finalOTP = otp.join("");

      let url = "";
      let body: any = {};

      if (mode === "register") {
        // Inspector OTP verification
        url = `${process.env.NEXT_PUBLIC_FIREBASE_API_URL}/api/auth/verify-otp`;
        body = {
          name: userCreds.name,
          email: loginCreds?.email || userCreds.email,
          password: loginCreds?.password || userCreds.password,
          otp: finalOTP,
          mode,
        };
      } else if (mode === "company") {
        // Company OTP verification (different API!)
        url = `${process.env.NEXT_PUBLIC_FIREBASE_API_URL}/company/verify-company-otp`;
        body = {
          fullName: userCreds.name,
          companyName: userCreds.companyName,
          gstNumber: userCreds.gstNumber,
          businessEmail: userCreds.email, // backend expects "businessEmail"
          password: userCreds.password,
          otpRecived: finalOTP,
        };
      }

      const makeReq = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const response = await makeReq.json();

      if (!makeReq.ok) {
        toast.info(response.message || "OTP verification failed");
        return;
      }

      // ✅ store user + token
      setUserCreds({ name: "", email: "", password: "" });
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      // Redirect differently
      if (mode === "company") {
        router.push("/company/profile");
      } else {
        router.push("/jobs");
      }
    } catch (error: any) {
      toast.error(`Something went wrong : ${error.message}`);
    } finally {
      setloggingIn(false);
    }
  }

  // Animation variants
  const containerVariants: Variants = {
    hidden: {
      opacity: 0,
    },
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
  const Loader = () => {
    const messages = [
      "Verifying your identity...",
      "Encrypting data securely...",
      "Fetching your credentials from hyperspace...",
      "Polishing the pixels...",
      "Casting some JavaScript spells ✨...",
      "Calling the backend wizards...",
      "Sharpening the UX blades...",
      "One more moment... making it perfect!",
    ];

    const [currentMessage, setCurrentMessage] = useState(messages[0]);

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentMessage((prev) => {
          const currentIndex = messages.indexOf(prev);
          return messages[(currentIndex + 1) % messages.length];
        });
      }, 550);

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
      {loggingIn && <Loader />}
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
              onClick={() => router.push("/signup")}
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
            >
              Back
            </motion.button>
          </motion.div>

          <div className="max-w-md mx-auto space-y-6 mb-5">
            <motion.div
              className="text-center space-y-2"
              variants={itemVariants}
            >
              <h2 className="text-2xl md:text-3xl font-medium text-gray-900">
                Create an account
              </h2>
              <p className="text-base text-gray-600 mt-8">
                Enter the Verification Code <br />
                Sent to your Mail Address
              </p>
            </motion.div>

            {/* OTP Input */}
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

            {/* Submit Button */}
            <motion.button
              className="w-full h-12 rounded-lg text-black font-medium transition-opacity  capitalize
            hover:opacity-90 mt-10 cursor-pointer"
              style={{ backgroundColor: "#76FF82" }}
              variants={buttonVariants}
              initial="initial"
              onClick={verifyOTP}
              whileHover="hover"
              whileTap="tap"
            >
              {mode === "register"
                ? "Create your account"
                : "Log in to your account"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
