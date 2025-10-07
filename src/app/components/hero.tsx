"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";

import React from "react";
import Link from "next/link";
import Header from "./header";
import Image from "next/image";
import { motion } from "motion/react";
import { useUser } from "../context/UserContext";

export default function HeroSection() {
  const { user } = useUser();
  const profileHref =
    (user?.signedUpAs || "")?.toLowerCase() === "company"
      ? "/company/profile"
      : "/profile";
  return (
    <>
      <div className="absolute inset-0">
        {/* Desktop Image */}
        <Image
          src="/images/3.png"
          fill
          alt="Energy and Infrastructure Background"
          className="hidden lg:block object-cover object-center"
          priority
          sizes="100vw"
        />

        {/* iPad/Tablet Image - positioned to show more of the engineer */}
        <Image
          src="/images/3.png"
          fill
          alt="Energy and Infrastructure Background"
          className="hidden md:block lg:hidden object-cover object-right"
          priority
          sizes="100vw"
        />

        {/* Mobile Image */}
        <Image
          src="/images/mobile_hero.jpg"
          fill
          alt="Energy and Infrastructure Background"
          className="block md:hidden object-cover object-center"
          priority
          sizes="100vw"
        />
      </div>

      <div className="absolute inset-0 bg-[#01010162]">
        {" "}
        <Header />
      </div>

      <section className="relative h-screen flex items-center justify-start">
        <div className="relative z-10 text-white max-w-[90%] mx-auto md:px-6 w-full">
          <div className="max-w-5xl mt-24 md:mt-28">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-xs md:text-sm tracking-[0.2em] uppercase text-white/80 mb-3"
            >
              by Compscope
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
              className="text-3xl md:text-5xl font-semibold mb-5 leading-tight"
            >
              ProjectMATCH 
              <br/>Connecting Talent to the Projects!
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.22 }}
              className="flex gap-3 flex-wrap"
            >
              {user ? (
                <Link href={profileHref}>
                  <button className="cursor-pointer bg-[#3EA442] hover:bg-[#6ef07a] text-white rounded-md font-semibold px-6 md:px-8 py-2.5 text-xs md:text-sm transition-colors">
                    Go to Profile
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/company/signup">
                    <button className="cursor-pointer bg-[#3EA442] hover:bg-[#6ef07a] text-white rounded-md font-semibold px-6 md:px-8 py-2.5 text-xs md:text-sm transition-colors">
                      Hire an Engineer
                    </button>
                  </Link>
                  <Link href="/signup">
                    <button className="cursor-pointer bg-white/10 hover:bg-white/20 text-white rounded-md px-6 md:px-8 py-2.5 text-xs md:text-sm font-semibold backdrop-blur-sm ring-1 ring-white/20">
                      Find a Job
                    </button>
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
