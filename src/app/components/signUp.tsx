"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  Variants 
} from "framer-motion";
import { toast } from "react-toastify";
import { useUser } from "../context/UserContext";

export default function SignupPage() {
  const router = useRouter();
  const [useEmail, setUseEmail] = useState(true);
  const [otp, setotp] = useState("")
  const { userCreds, setUserCreds, setmode } = useUser();

  // Animation variants
  const containerVariants : Variants  = {
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

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      toast.info("Already logged in");
      router.push("/"); 
    }
  }, [router])
  async function verifyAccount(){
    const req = await fetch(`${process.env.NEXT_PUBLIC_FIREBASE_API_URL}/api/auth/register`
      , {
        method : "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body : JSON.stringify({
          name :  userCreds.name,
          email : userCreds.email,
          password : userCreds.password
        }), 
      }
    )
    const response = await req.json()
    if(response.message === "User already exists"){
      toast.info("User already exists")
      return 
    }
    if(response.message === "All fields are required"){
      toast.info("All fields are required")
      return 
    }
    
    if(req.ok){
      toast.success(response.message)
      router.push("/otp")
      setmode("register")
    }
  }
  return (
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
                className="h-12 bg-white border-gray-200 rounded-lg"
                onChange={(e)=>{setUserCreds({
                  ...userCreds,
                  name: e.target.value
                })}}
              />
            </motion.div>
          </motion.div>

          <motion.div className="space-y-2" variants={itemVariants}>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">
                {useEmail ? "Email" : "Phone"}
              </Label>
              {/* <motion.button
                onClick={() => setUseEmail(!useEmail)}
                className="text-xs text-gray-500 hover:text-gray-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {useEmail ? "Use phone instead" : "Use email instead"}
              </motion.button> */}
            </div>

            <div className="flex gap-2">
              <AnimatePresence mode="wait">
                {!useEmail && (
                  <motion.select
                    className="h-12 px-3 bg-white border border-gray-200 rounded-lg text-sm w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <option>+91</option>
                  </motion.select>
                )}
              </AnimatePresence>
              <motion.div
                className="flex-1"
                variants={inputVariants}
                whileFocus="focus"
              >
                <Input
                  placeholder={useEmail ? "Enter your email" : "1234 567 890"}
                  className="h-12 bg-white border-gray-200 rounded-lg flex-1"
                  type={useEmail ? "email" : "tel"}
                  onChange={(e)=>{setUserCreds({
                    ...userCreds,
                    email: e.target.value
                  })}}
                />
              </motion.div>
            </div>
          </motion.div>

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
                className="h-12 bg-white border-gray-200 rounded-lg"
                onChange={(e)=>{setUserCreds({
                  ...userCreds,
                  password : e.target.value
                })}}
              />
            </motion.div>
          </motion.div>

          <motion.button
            className="w-full h-12 rounded-lg text-black font-medium transition-opacity hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: "#76FF82" }}
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            onClick={verifyAccount}
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
                  alt="image"
                />
              </span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
