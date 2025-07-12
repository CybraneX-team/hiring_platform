"use client";

import { useState } from "react";
import { Input } from "@/app/components/ui/Input";
import { Label } from "@/app/components/ui/label";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [usePhone, setUsePhone] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="container mx-auto px-6 py-8">
        {/* Logo - positioned at start */}
        <div className="mb-16">
          <h1 className="text-lg font-medium text-gray-900">Logo</h1>
        </div>

        {/* Main Form - centered */}
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-medium text-gray-900">
              Log in your account
            </h2>
            <p className="text-sm text-gray-600">
              Don't have an account ?{" "}
              <Link href="/signup" className="text-gray-900 hover:underline">
                Create account
              </Link>
            </p>
          </div>

          {/* Email/Phone */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">
                {usePhone ? "Phone" : "Email"}
              </Label>
              <button
                onClick={() => setUsePhone(!usePhone)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                {usePhone ? "Use email instead" : "Use phone number instead"}
              </button>
            </div>

            {usePhone ? (
              <div className="flex gap-2">
                <select className="h-12 px-3 bg-white border border-gray-200 rounded-lg text-sm w-20 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>+91</option>
                </select>
                <Input
                  placeholder="1234 567 890"
                  className="h-12 bg-white border-gray-200 rounded-lg flex-1"
                  type="tel"
                />
              </div>
            ) : (
              <Input
                placeholder="xyz@email.com"
                className="h-12 bg-white border-gray-200 rounded-lg"
                type="email"
              />
            )}
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

          {/* Log In Button */}
          <button
            className="w-full h-12 rounded-lg text-black font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#76FF82" }}
          >
            Log In
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
