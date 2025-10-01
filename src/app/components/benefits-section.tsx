"use client";

import { motion } from "motion/react";
import dynamic from "next/dynamic";
const WorldMap: any = dynamic(() => import("@/components/ui/world-map").then((m:any)=> m.default ?? m), { ssr: false, loading: () => <div /> });

const ACCENT = "#76FF83";

const blurb =
  "Match specialist talent to scopes in minutes. Verified, compliance-ready professionals and secure end‑to‑end project management.";

const benefits = [
  {
    title: "AI-driven talent and project matching",
    content:
      "Match specialist talent to technical scopes in minutes. Our engine ranks candidates by skills, certifications, availability, and project fit.",
  },
  {
    title: "Verified professionals and compliance-ready profiles",
    content:
      "Profiles include credential checks, safety cards, and region-specific compliance flags ready for audit.",
  },
  {
    title: "Industry-focused: Energy",
    content:
      "Purpose-built for oil & gas, infrastructure, hydrogen, solar, and wind with workflows that reflect real field operations.",
  },
  {
    title: "Secure end-to-end project management",
    content:
      "From requisition to closeout: scoped work orders, secure document exchange, milestone tracking, and clean handover packages.",
  },
];

export default function BenefitsSection() {
  return (
    <section className="relative min-h-screen bg-white py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 overflow-hidden">
      {/* World map background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <WorldMap
          className="opacity-60"
          dots={[
            // { start: { lat: 80.2008, lng: -149.4937 }, end: { lat: 34.0522, lng: -118.2437 } },
            // { start: { lat: 64.2008, lng: -149.4937 }, end: { lat: -15.7975, lng: -47.8919 } },
            // { start: { lat: -15.7975, lng: -47.8919 }, end: { lat: 38.7223, lng: -9.1393 } },
            // { start: { lat: 51.5074, lng: -0.1278 }, end: { lat: 28.6139, lng: 77.209 } },
            // { start: { lat: 28.6139, lng: 77.209 }, end: { lat: 43.1332, lng: 131.9113 } },
            // { start: { lat: 28.6139, lng: 77.209 }, end: { lat: -1.2921, lng: 36.8219 } },
          ]}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16 items-start">
          {/* Left: headline and CTA */}
          <div>
            {/* <p className="text-xs sm:text-sm text-gray-500 mb-2">COMPSCOPE</p> */}
            <motion.h2
              className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-[#163A33]"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              Exceptional Projects and Talent in Energy and Infra Sector at one place
            </motion.h2>
            <p className="mt-3 text-sm sm:text-base md:text-base text-gray-600 md:max-w-xl leading-relaxed">
              Access verified experts or high-value projects in oil, gas, green energy, and heavy infrastructure — instantly, securely, and intelligently powered by AI.
            </p>

            {/* How it works (stacked vertically to utilize left empty space) */}
            <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-[19rem] flex flex-col gap-3 sm:gap-4 text-[#163A33]">
              <div className="rounded-xl ring-1 ring-gray-200 bg-white p-4 sm:p-5 md:p-6 shadow-sm">
                <p className="text-sm font-semibold mb-1">1) Define your project</p>
                <p className="text-sm text-gray-600">Share scope, timeline, and budget.</p>
              </div>
              <div className="rounded-xl ring-1 ring-gray-200 bg-white p-4 sm:p-5 md:p-6 shadow-sm">
                <p className="text-sm font-semibold mb-1">2) AI Talent Match</p>
                <p className="text-sm text-gray-600">Instantly connects you with verified experts.</p>
              </div>
              <div className="rounded-xl ring-1 ring-gray-200 bg-white p-4 sm:p-5 md:p-6 shadow-sm">
                <p className="text-sm font-semibold mb-1">3) Collaborate & Deliver</p>
                <p className="text-sm text-gray-600">Track milestones, communicate, and complete payments securely.</p>
              </div>
            </div>
          </div>

          {/* Right: media + lime info card */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="rounded-xl overflow-hidden ring-1 ring-gray-200 bg-white"
            >
              <img
                src="/images/solar-wind.png"
                alt="Clean energy"
                className="w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 object-cover"
              />
              <div className="bg-[#A6F56B] text-[#163A33] p-4 sm:p-6 md:p-8 lg:p-10">
                <div className="flex items-start gap-3 sm:gap-4">
                  <span className="mt-1 inline-flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-md bg-[#e7ffd6] text-[#163A33] font-bold text-sm sm:text-base">✳</span>
                  <div className="w-full">
                    <p className="text-base md:text-base leading-relaxed font-medium">
                      {blurb}
                    </p>
                  </div>
                </div>
                {/* Professional 2-column list of benefits */}
                <div className="mt-4 sm:mt-5 md:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-3 sm:gap-y-4">
                  {benefits.map((b, i) => (
                    <div key={i} className="relative pl-4 sm:pl-5">
                      <span className="absolute left-0 top-1.5 sm:top-2 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#163A33]" />
                      <p className="font-semibold text-sm md:text-base leading-snug">{b.title}</p>
                      <p className="text-sm text-[#163A33]/80 leading-relaxed mt-1">{b.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            
          </div>
        </div>
      </div>
    </section>
  );
}
