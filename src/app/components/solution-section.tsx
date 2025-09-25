"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X } from "lucide-react"

export default function SolutionsSection() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null)

  const solutions = [
    {
      title: "Oil & Gas",
      description:
        "Full lifecycle support: upstream, midstream, downstream projects, shutdowns, inspections, maintenance, and execution.",
      bgColor: "bg-[#3EA442]",
      roles: [
        "Pipeline QC Inspector (cross country + station works)",
        "Pressure Vessel QC Inspector",
        "Storage Tank QC Inspector",
        "Piping & Welding QC Inspector",
        "Rotating Equipment QC Inspector",
        "Electrical System QC Inspector (EX equipment, MCC, etc.)",
        "Instrumentation & Loop Check QC Inspector",
        "Pre-Commissioning / Commissioning QC Inspector",
        "Cathodic Protection QC Inspector",
        "Coating & Wrapping QC Inspector (for U/G pipeline)",
      ],
    },
    {
      title: "Solar Energy",
      description:
        "Full lifecycle support: upstream, midstream, downstream projects, shutdowns, inspections, maintenance, and execution.",
      bgColor: "bg-[#3EA442]",
      roles: [
        "Module Installation QC Inspector",
        "PV Structure / MMS QC Inspector",
        "DC Cable Laying QC Inspector",
        "Inverter QC Inspector",
        "String Combiner Box QC Inspector",
        "Earthing & Lightning Protection QC Inspector",
        "Grid Connectivity QC Inspector",
        "Civil Works QC Inspector (for foundations, roads, fencing)",
        "Transformer & Switchyard QC Inspector",
        "BESS (Battery Energy Storage) QC Inspector (optional but emerging)",
      ],
    },
    {
      title: "Offshore Projects",
      description: "Commissioning, shutdowns, and infrastructure development.",
      bgColor: "bg-[#3EA442]",
      roles: [
        "Drone Inspection Coordinator (for solar & wind asset QA)",
        "AI-Based Image QA Analyst (used in solar farm defects)",
        "Welding Procedure Qualification (WPQR) Specialist",
        "Third-Party / Client-Side QC Coordinator",
        "GIS-Based QC Inspector (solar/wind site layouts)",
      ],
      hasViewRoles: true,
    },
    {
      title: "Green Hydrogen",
      description:
        "Full lifecycle support: upstream, midstream, downstream projects, shutdowns, inspections, maintenance, and execution.",
      bgColor: "bg-[#3EA442]",
      roles: [
        "Electrolyzer Package QC Inspector",
        "Process Piping QC Inspector",
        "Skid / Module Assembly QC Inspector",
        "Mechanical Rotating Equipment QC Inspector",
        "Control System / PLC-DCS QC Inspector",
        "Gas Storage QC Inspector",
        "Compressor / Booster QC Inspector",
        "Utility Systems QC Inspector (Water, Air, Nitrogen)",
        "Fire & Gas Detection QC Inspector",
        "Hydrogen Safety QC Inspector",
      ],
      hasViewRoles: true,
    },
    {
      title: "Green Hydrogen",
      description:
        "Full lifecycle support: upstream, midstream, downstream projects, shutdowns, inspections, maintenance, and execution.",
      bgColor: "bg-[#3EA442]",
      roles: [
        "Electrolyzer Package QC Inspector",
        "Process Piping QC Inspector",
        "Skid / Module Assembly QC Inspector",
        "Mechanical Rotating Equipment QC Inspector",
        "Control System / PLC-DCS QC Inspector",
        "Gas Storage QC Inspector",
        "Compressor / Booster QC Inspector",
        "Utility Systems QC Inspector (Water, Air, Nitrogen)",
        "Fire & Gas Detection QC Inspector",
        "Hydrogen Safety QC Inspector",
      ],
      hasViewRoles: true,
    },
    {
      title: "Green Hydrogen",
      description:
        "Full lifecycle support: upstream, midstream, downstream projects, shutdowns, inspections, maintenance, and execution.",
      bgColor: "bg-[#3EA442]",
      roles: [
        "Electrolyzer Package QC Inspector",
        "Process Piping QC Inspector",
        "Skid / Module Assembly QC Inspector",
        "Mechanical Rotating Equipment QC Inspector",
        "Control System / PLC-DCS QC Inspector",
        "Gas Storage QC Inspector",
        "Compressor / Booster QC Inspector",
        "Utility Systems QC Inspector (Water, Air, Nitrogen)",
        "Fire & Gas Detection QC Inspector",
        "Hydrogen Safety QC Inspector",
      ],
      hasViewRoles: true,
    },
  ]

  const handleCardClick = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index)
  }

  const handleCloseCard = (e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedCard(null)
  }

  return (
    <section className="py-14 bg-white" id="sectors">
      <div className="max-w-[100rem] mx-auto px-6">
        <motion.div
          className="flex justify-between items-center mb-16"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div>
            <h2 className="text-2xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight">Core Sectors</h2>
          </div>
          <button
            className="relative flex mt-10 items-center text-black/80 hover:text-black text-xs md:text-sm rounded-lg transition-colors underline-offset-4 font-medium group focus:outline-none"
            style={{ paddingBottom: 7, paddingRight: 15, letterSpacing: 4 }}
          >
            <span
              className="relative pb-5 uppercase"
              style={{ paddingBottom: 20, display: "inline-block" }}
            >
              <span
                className="relative inline-flex items-center after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[60%] after:h-[2px] after:bg-black after:scale-x-0 after:origin-bottom-right after:transition-transform after:duration-200 group-hover:after:scale-x-100 group-hover:after:origin-bottom-left"
                style={{ position: "relative", display: "inline-flex", paddingBottom: 4 }}
              >
                View All&nbsp;
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="10"
                  viewBox="0 0 46 16"
                  className="ml-1 transition-transform duration-300 ease-in-out -translate-x-2 group-hover:translate-x-0 group-active:scale-90"
                  style={{ minWidth: 30 }}
                >
                  <path
                    d="M8,0,6.545,1.455l5.506,5.506H-30V9.039H12.052L6.545,14.545,8,16l8-8Z"
                    transform="translate(30)"
                    fill="currentColor"
                  />
                </svg>
              </span>
            </span>
          </button>
        </motion.div>

        <div className="relative overflow-x-auto overflow-y-hidden scrollbar-hide">
          <div className="flex items-start gap-8 w-max p-4">
            {solutions.map((solution, index) => {
              const isExpanded = expandedCard === index
              return (
                <motion.div
                  key={index}
                  layout={isExpanded ? "position" : false}
                  className={`
                    ${solution.bgColor} text-white rounded-3xl relative overflow-visible cursor-pointer flex-none shrink-0
                    border border-white/20
                    transition-[width,height,box-shadow,transform,opacity] duration-300
                    ${isExpanded
                      ? "w-[32rem] md:w-[40rem] h-auto p-10 ring-2 ring-white/20 z-10"
                      : "w-80 h-72 p-8"
                    }
                    flex flex-col justify-between
                  `}
                  onClick={() => handleCardClick(index)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  whileHover={isExpanded ? {} : { y: -5, scale: 1.02 }}
                  transition={{
                    layout: isExpanded
                      ? { type: "spring", stiffness: 180, damping: 22 }
                      : undefined,
                    duration: 0.4,
                  }}
                >
                  <div className="pointer-events-none absolute inset-0" />
                  <div className="relative z-10 flex flex-col h-full">
                    {isExpanded && (
                      <button
                        onClick={handleCloseCard}
                        className="absolute top-5 right-5 text-white hover:text-gray-200 transition-colors z-20 pointer-events-auto"
                      >
                        <X size={24} />
                      </button>
                    )}

                    <motion.h3
                      layout={isExpanded ? true : false}
                      className={`
                        text-2xl md:text-3xl font-extrabold mb-2 text-left tracking-tight
                        ${isExpanded ? "mt-2" : ""}
                      `}
                    >
                      {solution.title}
                    </motion.h3>

                    <AnimatePresence initial={false}>
                      {!isExpanded && (
                        <motion.p
                          className="text-base md:text-lg text-white/95 mb-4 leading-relaxed font-medium text-left"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          {solution.description}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          layout
                          className="mt-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <div className="border border-white/30 rounded-xl bg-white/10 p-6 mb-4">
                            <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
                              {solution.roles.map((role, roleIndex) => (
                                <motion.div
                                  key={roleIndex}
                                  className="flex items-start gap-3 mb-2"
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.02 * roleIndex, duration: 0.25 }}
                                >
                                  <span className="text-white/80 text-base font-semibold min-w-[24px]">{roleIndex + 1}.</span>
                                  <span className="text-white text-base leading-relaxed">{role}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                          {solution.hasViewRoles && (
                            <div className="mt-4 pt-4 border-t border-white/20 text-right">
                              <button className="text-white underline underline-offset-4 text-base font-semibold hover:text-white/80 transition-colors">
                                View Roles &gt;&gt;
                              </button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
      {/* Scroll Indicator */}
      <div
        className="relative flex flex-col items-center"
        style={{
          transform: "rotate(270deg)",
          width: "30px",
          height: "50px",
          marginLeft: "50%",
          marginBottom: "16px",
          cursor: "pointer",
        }}
      >
        <div
          className="absolute left-0 top-0"
          style={{
            width: "30px",
            height: "50px",
            border: "3px solid green",
            borderRadius: "50px",
            boxSizing: "border-box",
          }}
        ></div>
        <div
          className="absolute"
          style={{
            left: "50%",
            bottom: "30px",
            width: "6px",
            height: "6px",
            marginLeft: "-3px",
            backgroundColor: "green",
            borderRadius: "100%",
            boxShadow: "0px -5px 3px 1px #2a547066",
            animation: "scrolldown-anim 2s infinite",
          }}
        ></div>
        <div
          className="flex flex-col items-center"
          style={{
            paddingTop: "6px",
            marginLeft: "-3px",
            marginTop: "48px",
            width: "30px",
          }}
        >
          <div
            style={{
              marginTop: "-6px",
              border: "solid green",
              borderWidth: "0 3px 3px 0",
              display: "inline-block",
              width: "10px",
              height: "10px",
              transform: "rotate(45deg)",
              animation: "pulse54012 500ms ease-in-out infinite alternate",
              opacity: 0.5,
            }}
          ></div>
          <div
            style={{
              marginTop: "-6px",
              border: "solid green",
              borderWidth: "0 3px 3px 0",
              display: "inline-block",
              width: "10px",
              height: "10px",
              transform: "rotate(45deg)",
              animation: "pulse54012 500ms ease-in-out infinite alternate 250ms",
              opacity: 0.5,
            }}
          ></div>
        </div>
        <style>
          {`
            @keyframes scrolldown-anim {
              0% {
                opacity: 0;
                height: 6px;
              }
              40% {
                opacity: 1;
                height: 10px;
              }
              80% {
                transform: translate(0, 20px);
                height: 10px;
                opacity: 0;
              }
              100% {
                height: 3px;
                opacity: 0;
              }
            }
            @keyframes pulse54012 {
              from {
                opacity: 0;
              }
              to {
                opacity: 0.5;
              }
            }
          `}
        </style>
      </div>
    </section>
  )
}
