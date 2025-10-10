"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function ImpactSection() {
  return (
    <section className="bg-white py-8 sm:py-12 md:py-0">
      <div className="max-w-[100rem] mx-auto px-4 sm:px-6 md:px-6">
        {/* Section heading outside the box */}
        <div className="mb-6 sm:mb-8 md:mb-20 text-center">
          <h2 className="text-[#163A33] font-bold tracking-tight text-xl sm:text-2xl md:text-6xl">How it works</h2>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative rounded-2xl ring-1 ring-gray-200 overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left copy */}
            <div className="px-4 sm:px-6 md:px-10 py-8 sm:py-10 md:py-14">
              <div className="max-w-3xl">
                <p className="tracking-wide font-bold text-[#163A33] mb-5 sm:mb-4 mt-1 text-lg sm:text-xl md:text-3xl">
                  Define • Match • Deliver
                </p>
                <p className="text-justify text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed mb-6 sm:mb-8 md:mb-10">
                  Start by defining your project’s scope, timeline, and budget in just a few clicks. Our AI Talent Match instantly connects you with verified professionals who fit your requirements. Review expert profiles, check credentials, and select the best match for your needs. Collaborate seamlessly with built-in tools for communication, document sharing, and milestone tracking. Manage contracts and payments securely, ensuring transparency and peace of mind from project kickoff to closeout. Experience a streamlined process that saves you time and delivers results.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mt-8 sm:mt-12 md:mt-20">
                  <Link href="/signup" className="inline-flex">
                    <motion.button
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className="cursor-pointer w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-[#17181D] text-white md:font-medium md:px-7 md:py-3 px-4 py-2.5 text-xs md:text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#163A33]/30"
                    >
                      Get Started
                    </motion.button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right illustration */}
            <div className="relative bg-[#F6FBF7] p-4 sm:p-6 md:p-8 lg:p-10 md:border-l md:border-gray-200">
              <div className="absolute inset-0 opacity-60" aria-hidden="true" style={{
                backgroundImage: "repeating-linear-gradient(0deg, #EAF5EE, #EAF5EE 1px, transparent 1px, transparent 18px), repeating-linear-gradient(90deg, #EAF5EE, #EAF5EE 1px, transparent 1px, transparent 18px)"
              }} />
              <div className="relative h-[280px] sm:h-[320px] md:h-[380px]">
                {/* Motive: AI hub connecting Projects and Professionals, with sectors */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 700 420" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="ProjectMATCH flow">
                  {/* defs */}
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#76FF83" />
                    </marker>
                    <filter id="hubShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#163A33" floodOpacity="0.15" />
                    </filter>
                  </defs>

                  {/* Center hub (rendered later to appear above arrows) */}

                  {/* Projects card */}
                  <rect x="30" y="135" width="200" height="64" rx="10" fill="#FFFFFF" stroke="#D5EBDD"/>
                  <text x="130" y="161" textAnchor="middle" fontSize="16" fill="#163A33" fontFamily="Inter, ui-sans-serif, system-ui">Define Project</text>
                  <text x="130" y="178" textAnchor="middle" fontSize="14" fill="#6B7280" fontFamily="Inter, ui-sans-serif, system-ui">Scope • Timeline • Budget</text>
                  <path d="M 230 167 L 295 170" stroke="#76FF83" strokeWidth="2" markerEnd="url(#arrow)"/>

                  {/* Professionals card */}
                  <rect x="470" y="135" width="250" height="64" rx="10" fill="#FFFFFF" stroke="#D5EBDD"/>
                  <text x="590" y="161" textAnchor="middle" fontSize="16" fill="#163A33" fontFamily="Inter, ui-sans-serif, system-ui">Verified Experts</text>
                  <text x="590" y="178" textAnchor="middle" fontSize="14" fill="#6B7280" fontFamily="Inter, ui-sans-serif, system-ui">Skills • Certifications • Availability</text>
                  <path d="M 398 170 L 470 167" stroke="#76FF83" strokeWidth="2" markerEnd="url(#arrow)"/>

                  {/* Outcome */}
                  <rect x="270" y="250" width="170" height="48" rx="10" fill="#FFFFFF" stroke="#D5EBDD"/>
                  <text x="350" y="272" textAnchor="middle" fontSize="16" fill="#163A33" fontFamily="Inter, ui-sans-serif, system-ui">Deliver Securely</text>
                  <text x="350" y="286" textAnchor="middle" fontSize="12" fill="#6B7280" fontFamily="Inter, ui-sans-serif, system-ui">Milestones • Payments</text>
                  <path d="M 350 218 L 350 250" stroke="#76FF83" strokeWidth="2" markerEnd="url(#arrow)"/>

                  {/* Sector chips */}
                  <g>
                    <rect x="560" y="37" width="100" height="30" rx="13" fill="#FFFFFF" stroke="#E0F5E6"/>
                    <text x="610" y="57" textAnchor="middle" fontSize="14" fill="#163A33" fontFamily="Inter, ui-sans-serif, system-ui">Oil & Gas</text>
                    <path d="M 370 150 C 460 130, 545 98, 565 73" stroke="#9BE3A7" strokeWidth="2" markerEnd="url(#arrow)"/>

                    <rect x="565" y="295" width="100" height="30" rx="13" fill="#FFFFFF" stroke="#E0F5E6"/>
                    <text x="615" y="315" textAnchor="middle" fontSize="14" fill="#163A33" fontFamily="Inter, ui-sans-serif, system-ui">Green Hydrogen</text>
                    <path d="M 370 182 C 460 210, 545 255, 589 293" stroke="#9BE3A7" strokeWidth="2" markerEnd="url(#arrow)"/>

                    <rect x="30" y="37" width="100" height="30" rx="13" fill="#FFFFFF" stroke="#E0F5E6"/>
                    <text x="80" y="57" textAnchor="middle" fontSize="14" fill="#163A33" fontFamily="Inter, ui-sans-serif, system-ui">Solar Energy</text>
                    <path d="M 330 150 C 250 130, 125 98, 85 73" stroke="#9BE3A7" strokeWidth="2" markerEnd="url(#arrow)"/>

                    <rect x="25" y="290" width="120" height="30" rx="13" fill="#FFFFFF" stroke="#E0F5E6"/>
                    <text x="85" y="310" textAnchor="middle" fontSize="14" fill="#163A33" fontFamily="Inter, ui-sans-serif, system-ui">Wind & Infra</text>
                    <path d="M 330 182 C 240 210, 120 255, 85 293" stroke="#9BE3A7" strokeWidth="2" markerEnd="url(#arrow)"/>
                  </g>

                  {/* Center hub (draw last so it sits above connectors) */}
                  <g filter="url(#hubShadow)">
                    <circle cx="350" cy="170" r="55" fill="#FFFFFF" stroke="#76FF83" strokeWidth="2" />
                    <text x="350" y="166" textAnchor="middle" fontSize="14" fill="#163A33" fontFamily="Inter, ui-sans-serif, system-ui">AI Talent Match</text>
                    <text x="350" y="184" textAnchor="middle" fontSize="12" fill="#6B7280" fontFamily="Inter, ui-sans-serif, system-ui">Verified • Best‑fit</text>
                  </g>
                </svg>

                {/* small legend */}
                <div className="absolute bottom-2 sm:bottom-3 left-0 right-0 flex justify-center">
                  <div className="rounded-md bg-white/85 backdrop-blur px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-[11px] md:text-xs text-gray-700 ring-1 ring-gray-200">
                    Projects → AI Match → Professionals → Deliver • Sectors connected by AI
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
