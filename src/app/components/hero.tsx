"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";

import React from "react";
import Link from "next/link";
import Header from "./header";

export default function HeroSection() {
  return (
    <>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-[#01010162]">
        {" "}
        <Header />
      </div>

      <section className="relative h-screen flex items-center justify-start">
        <div className="relative z-10 text-white max-w-[90%] mx-auto md:px-6 w-full">
          <div className="max-w-4xl mt-30">
            <h1 className="text-3xl md:text-5xl font-semibold mb-6 leading-tight">
             Exceptional Projects and Talent in 
              <br />
            energy and Infra Sector at one place
            </h1>
            <p className="md:text-lg text-base mb-8 text-white leading-relaxed">
              Talent and opportunity converge with precision and innovation.
            </p>
            <div className="flex gap-4">
              <Link href="/signup">
                <button className="bg-[#3EA442] hover:bg-[#6ef07a] text-white rounded-md font-medium px-10 py-2.5 w-40 text-xs md:text-sm transition-colors">
                  Find a job
                </button>
              </Link>
              <Link href="/company/signup">
                <button className="bg-[#3EA442] text-white rounded-md px-10 py-2.5 w-44 md:w-48 transition-colors text-xs md:text-sm font-medium whitespace-nowrap">
                  Hire an Engineer
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}