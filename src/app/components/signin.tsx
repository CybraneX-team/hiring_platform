"use client";

import { useEffect, useState } from "react";
import { Input } from "@/app/components/ui/Input";
import { Label } from "@/app/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { easeOut, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useUser } from "../context/UserContext";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [usePhone, setUsePhone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    loginCreds,
    setLoginCreds,
    mode,
    setmode,
    setuser,
    setUserCreds,
    setprofile,
  } = useUser();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      toast.info("Already logged in");
      router.push("/profile");
    }
  }, [router]);

  
  const handleGoogleSignIn = () => {


    window.location.href = `${process.env.NEXT_PUBLIC_FIREBASE_API_URL}/api/auth/google`;
  };

  const login = async () => {
    const makeReq = await fetch(
      `${process.env.NEXT_PUBLIC_FIREBASE_API_URL}/api/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginCreds.email,
          password: loginCreds.password,
        }),
      }
    );
    if (makeReq.ok == false) {
      const response = await makeReq.json();
      toast.info(response.message);
      return;
    }

    if (makeReq.ok) {
      const response = await makeReq.json();
      setuser(response.user);
      setprofile(response.profile);
      setUserCreds({
        name: "",
        email: "",
        password: "",
      });
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("profile", JSON.stringify(response.profile));
      router.push("/profile");
    }
  };

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

  return (
    <motion.div
      className="min-h-screen bg-[#F5F5F5]"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container mx-auto px-6 py-8">
        <motion.div className="mb-16" variants={itemVariants}>
                <Link href="/" className="flex items-center">
        <Image
          src="/logo.png"
          alt="ProjectMATCH by Compscope"
          width={200}
          height={80}
          className="h-8 md:h-24 w-auto"
          priority
        />
      </Link>
        </motion.div>

        <div className="max-w-md mx-auto space-y-6">
          <motion.div className="text-center space-y-2" variants={itemVariants}>
            <h2 className="text-2xl md:text-3xl font-medium text-gray-900">
              Log in your account
            </h2>
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/signup" className="text-gray-900 hover:underline">
                Create account
              </Link>
            </p>
          </motion.div>

          {/* Email / Phone */}
          <motion.div className="space-y-2" variants={itemVariants}>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">
                {usePhone ? "Phone" : "Email"}
              </Label>
              <Link
                href="/forgot-password"
              >
                <motion.button
                  // onClick={() => setUsePhone(!usePhone)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Forgot Password
                </motion.button>
              </Link>
            </div>

         
              <Input
                placeholder="xyz@email.com"
                className="h-12 bg-white border-gray-200 rounded-lg"
                type="email"
                onChange={(e) => {
                  setLoginCreds({
                    ...loginCreds,
                    email: e.target.value,
                  });
                }}
              />
          
          </motion.div>

          {/* Password with Eye Toggle */}
          <motion.div className="space-y-2" variants={itemVariants}>
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="h-12 bg-white border-gray-200 rounded-lg pr-10"
                onChange={(e) => {
                  setLoginCreds({
                    ...loginCreds,
                    password: e.target.value,
                  });
                }}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Login Button */}
          <motion.button
            className="w-full h-12 rounded-lg text-black font-medium hover:cursor-pointer transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#76FF82" }}
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            onClick={login}
          >
            Log In
          </motion.button>

          {/* Divider */}
          <motion.div className="relative" variants={itemVariants}>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-gray-50 px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </motion.div>

          {/* Social Buttons */}
        <motion.div
            className="grid  gap-3 cursor-pointer"
            variants={itemVariants}
          >
            <motion.button
              className="h-12 bg-white border cursor-pointer border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors"
              initial="initial"
              whileHover="hover"
              onClick={handleGoogleSignIn}
              whileTap="tap"
            >
              <span className="text-lg font-bold text-black">G</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
