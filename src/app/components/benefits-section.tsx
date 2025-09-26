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
    <section className="relative h-[100vh] bg-white py-12 md:py-20 overflow-hidden">
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

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Left: headline and CTA */}
          <div>
            <p className="text-sm text-gray-500 mb-2">COMPSCOPE</p>
            <motion.h2
              className="text-3xl md:text-5xl font-semibold leading-tight tracking-tight text-[#163A33]"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              ProjectMATCH
              <br /> Connecting Talent to the Projects!
            </motion.h2>
            <p className="mt-3 text-sm md:text-base text-gray-600 md:max-w-xl leading-relaxed">
              Access verified experts or high‑value projects in oil, gas, green energy, and heavy infrastructure — instantly, securely, and intelligently powered by AI.
            </p>
            <a
              href="#"
              className="inline-flex mt-6 h-10 items-center justify-center rounded px-5 text-sm font-medium text-[#163A33] bg-[white] ring-1 ring-[#163A33] hover:bg-[#163A33] hover:text-white transition-colors"
            >
              Smart Hiring
            </a>
            <a
              href="#"
              className="inline-flex mt-3 md:mt-6 h-10 items-center justify-center rounded px-5 text-sm font-medium text-white bg-[#163A33] md:ml-3"
            >
              Smart Working
            </a>

            {/* How it works (moved below CTAs) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-68 text-[#163A33]">
              <div className="rounded-xl ring-1 ring-gray-200 bg-white p-4">
                <p className="text-sm font-semibold mb-1">1) Define your project</p>
                <p className="text-sm text-gray-600">Share scope, timeline, and budget.</p>
              </div>
              <div className="rounded-xl ring-1 ring-gray-200 bg-white p-4">
                <p className="text-sm font-semibold mb-1">2) AI Talent Match</p>
                <p className="text-sm text-gray-600">Instantly connects you with verified experts.</p>
              </div>
              <div className="rounded-xl ring-1 ring-gray-200 bg-white p-4">
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
                src="/images/about.png"
                alt="Clean energy"
                className="w-full h-56 md:h-72 object-cover"
              />
              <div className="bg-[#A6F56B] text-[#163A33] p-6 md:p-8">
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#e7ffd6] text-[#163A33] font-bold">✳</span>
                  <div className="w-full">
                    <p className="text-base md:text-lg leading-relaxed font-medium">
                      {blurb}
                    </p>
                  </div>
                </div>
                {/* Professional 2-column list of benefits */}
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {benefits.map((b, i) => (
                    <div key={i} className="relative pl-5">
                      <span className="absolute left-0 top-2 h-2 w-2 rounded-full bg-[#163A33]" />
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
