"use client";

import type React from "react";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Input } from "@/app/components/ui/Input";
import { Label } from "@/app/components/ui/label";
import Link from "next/link";
import Image from "next/image";

export default function SignupPage() {
  const [useEmail, setUseEmail] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
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

  return (
    <div className="min-h-screen bg-[#F5F5F5] ">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-16">
          <h1 className="text-lg font-medium text-gray-900">Logo</h1>
        </div>

        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-medium text-gray-900">
              Create an account
            </h2>
            <p className="text-sm text-gray-600">
              Have an account ?{" "}
              <Link href="/signin" className="text-gray-900 hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label
              htmlFor="fullname"
              className="text-sm font-medium text-gray-700"
            >
              Full Name
            </Label>
            <Input
              id="fullname"
              placeholder="John Doe"
              className="h-12 bg-white border-gray-200 rounded-lg"
            />
          </div>

          {/* Phone/Email */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">
                {useEmail ? "Email" : "Phone"}
              </Label>
              <button
                onClick={() => setUseEmail(!useEmail)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                {useEmail ? "Use phone instead" : "Use email instead"}
              </button>
            </div>

            <div className="flex gap-2">
              {!useEmail && (
                <select className="h-12 px-3 bg-white border border-gray-200 rounded-lg text-sm w-20 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>+91</option>
                </select>
              )}
              <Input
                placeholder={useEmail ? "Enter your email" : "1234 567 890"}
                className="h-12 bg-white border-gray-200 rounded-lg flex-1"
                type={useEmail ? "email" : "tel"}
              />
              <button className="text-black h-12 px-6 bg-[#DFDFDF] border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
                Get OTP
              </button>
            </div>
          </div>

          {/* OTP */}
          <div className="space-y-2 max-w-2/3">
            <Label className="text-sm font-medium text-gray-700">OTP</Label>
            <div className="flex gap-2 items-center">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="h-12 w-12 text-center bg-white border-gray-200 rounded-lg"
                  maxLength={1}
                />
              ))}
              <button
                className="p-4 rounded-lg flex items-center justify-center transition-colors"
                style={{ backgroundColor: "#17181D" }}
              >
                <ArrowRight className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="h-12 bg-white border-gray-200 rounded-lg"
            />
          </div>

          {/* Create Account Button */}
          <button
            className="w-full h-12 rounded-lg text-black font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#76FF82" }}
          >
            Create your account
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-gray-50 px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button className="h-12 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors">
              <span className="text-lg font-bold text-black">G</span>
            </button>
            <button className="h-12 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors">
              <span className="text-lg">
                <Image
                  src="/images/apple.png"
                  height={14}
                  width={11}
                  alt="image"
                />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
