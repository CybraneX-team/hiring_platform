"use client"

import type React from "react"

import { useState } from "react"
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
    <section className="py-24 bg-white" id="sectors">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center mb-16">
          <div>
            <h2 className="text-4xl md:text-5xl font-medium text-gray-900 leading-tight">Core Sectors</h2>
          </div>
          <button className="text-black font-light text-sm rounded-lg transition-colors">View all →</button>
        </div>

  <div className="overflow-x-auto">
  <div className="flex gap-6 w-max">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className={`${solution.bgColor} text-white rounded-2xl  relative overflow-hidden cursor-pointer transition-all duration-500 ease-in-out ${
                expandedCard === index
                  ? "w-[120%] p-8  "
                  : expandedCard !== null
                    ? "hidden md:hidden lg:hidden  "
                    : "p-8 w-72 "
              }`}
              onClick={() => handleCardClick(index)}
            >
              <div className="relative z-10">
                {expandedCard === index && (
                  <button
                    onClick={handleCloseCard}
                    className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors z-20"
                  >
                    <X size={24} />
                  </button>
                )}

                <h3 className="text-xl mb-4 font-semibold">{solution.title}</h3>

                {expandedCard !== index && (
                  <p className="text-sm text-white mb-6 leading-relaxed">{solution.description}</p>
                )}

                {expandedCard === index && (
                  <div className="mt-8 animate-in fade-in duration-300">
                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-2">
                      {solution.roles.map((role, roleIndex) => (
                        <div key={roleIndex} className="flex items-start gap-3 mb-3">
                          <span className="text-white/80 text-sm font-medium min-w-[20px]">{roleIndex + 1}.</span>
                          <span className="text-white text-sm leading-relaxed">{role}</span>
                        </div>
                      ))}
                    </div>

                    {solution.hasViewRoles && (
                      <div className="mt-8 pt-6 border-t border-white/20">
                        <button className="text-white underline text-sm hover:text-white/80 transition-colors">
                          View Roles &gt;&gt;
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        </div>

        {expandedCard === null && (
          <button className="bg-transparent text-black border border-black rounded-md px-10 py-3 w-44 transition-colors text-sm font-medium mt-10">
            View Roles →
          </button>
        )}
      </div>
    </section>
  )
}
