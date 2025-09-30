"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "motion/react"

export default function SolutionsSection() {
  const [showAll, setShowAll] = useState(false)
  const easeEmphatic: number[] = [0.22, 1, 0.36, 1]

  const solutions = [
    {
      title: "Oil & Gas",
      iconSrc: "/flaticon_assets/oil-barrel.png",
      heroSrc: "/coreSectors/oil-and-gas.png",
      marketSize: "USD 6.1T (2024) → USD 8.8T (2034), CAGR 3.7%",
      challenge: "Shutdowns, audits, and pipelines often stall due to sudden skill shortages.",
      impact: "AI-driven access to certified inspectors & QA/QC professionals, deployed on-demand to reduce downtime and ensure compliance.",
    },
    {
      title: "Solar Energy",
      iconSrc: "/flaticon_assets/solar-energy.png",
      heroSrc: "/coreSectors/solar-energy.png",
      marketSize: "USD 122B (2024) → USD 390B (2034), CAGR 12.3%",
      challenge: "Remote projects and seasonal peaks create manpower gaps, delaying commissioning.",
      impact: "Verified solar engineers & quality specialists, ready to deploy for fast, efficient, and reliable execution.",
    },
    {
      title: "Wind Energy",
      iconSrc: "/flaticon_assets/wind-energy.png",
      heroSrc: "/coreSectors/windmill.png",
      marketSize: "USD 99B (2024) → USD 143.5B (2032), CAGR 4.7%",
      challenge: "Scarcity of specialists in turbine commissioning, blade inspection & remote sites.",
      impact: "Regionally available wind energy experts, scaling workforce dynamically with project needs.",
    },
    {
      title: "Green Hydrogen",
      iconSrc: "/flaticon_assets/hydrogen.png",
      heroSrc: "/coreSectors/green-hydrogen.png",
      marketSize: "USD 12.3B (2025) → USD 199B (2034), CAGR 41.5%",
      challenge: "Limited workforce experienced in electrolyzers, hydrogen pipelines & storage.",
      impact: "Global network of hydrogen-ready professionals accelerating safe, compliant project deployment.",
    },
    {
      title: "Industrial Infrastructure",
      iconSrc: "/flaticon_assets/mega-industry.png",
      heroSrc: "/coreSectors/mega-industry.png",
      marketSize: "Multi-billion-dollar global EPC & industrial projects expanding rapidly",
      challenge: "Managing fluctuating manpower needs across disciplines without overstaffing.",
      impact: "Verified, contract-ready specialists across civil, mechanical, electrical, and instrumentation—scalable for every project phase.",
    }
  ]

  // Footer → sector jump: ensure the required card is visible and scrolled into view
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('expandSector')
      if (stored) {
        const sectorIndex = solutions.findIndex(s => s.title === stored)
        if (sectorIndex !== -1) {
          if (sectorIndex > 2) setShowAll(true)
          setTimeout(() => {
            const cardElement = document.querySelector(`[data-card-index="${sectorIndex}"]`)
            if (cardElement) {
              cardElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          }, 250)
        }
        sessionStorage.removeItem('expandSector')
      }
    } catch (_) {}

    const handleExpandSector = (event: CustomEvent) => {
      const { sectorName } = event.detail
      const sectorIndex = solutions.findIndex(s => s.title === sectorName)
      if (sectorIndex !== -1) {
        if (sectorIndex > 2) setShowAll(true)
        setTimeout(() => {
          const cardElement = document.querySelector(`[data-card-index="${sectorIndex}"]`)
          if (cardElement) {
            cardElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 150)
      }
    }

    window.addEventListener('expandSector', handleExpandSector as EventListener)
    return () => window.removeEventListener('expandSector', handleExpandSector as EventListener)
  }, [])

  return (
    <section className="py-8 sm:py-12 md:py-14 bg-white" id="sectors">
      <div className="max-w-[83rem] mx-auto px-4 sm:px-6 md:px-6">
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 md:mb-16"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight ml-0 sm:ml-5">Our Empowerment</h2>
          </div>
        </motion.div>

        <div className="space-y-8 sm:space-y-10 md:space-y-12">
          {solutions.map((solution, index) => {
            if (!showAll && index >= 3) return null
            const isReversed = (index % 2) === 1
            return (
              <motion.div
                key={solution.title}
                data-card-index={index}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center rounded-2xl ring-1 ring-gray-200 p-4 sm:p-6 md:p-8 bg-white"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, ease: easeEmphatic as any }}
              >
                <div className={`${isReversed ? 'md:order-2' : ''}`}>
                  <Image
                    src={(solution as any).heroSrc}
                    alt={solution.title}
                    width={900}
                    height={600}
                    className="w-full h-56 sm:h-64 md:h-72 lg:h-80 object-cover rounded-xl"
                  />
                </div>
                <div className={`${isReversed ? 'md:order-1' : ''}`}>
                  {/* <div className="inline-flex items-center gap-2 bg-[#A6F56B]/20 text-[#163A33] px-3 py-1 rounded-md mb-3">
                    <Image src={solution.iconSrc} alt={`${solution.title} icon`} width={22} height={22} className="w-5 h-5" />
                    <span className="text-xs font-semibold uppercase tracking-wide">{solution.title}</span>
                  </div> */}
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#163A33] mb-3">{solution.title}</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-[#163A33] font-semibold text-sm sm:text-base">Market Size</h4>
                      <p className="text-gray-700 text-sm sm:text-base">{solution.marketSize}</p>
                    </div>
                    <div>
                      <h4 className="text-[#163A33] font-semibold text-sm sm:text-base">Challenge</h4>
                      <p className="text-gray-700 text-sm sm:text-base">{solution.challenge}</p>
                    </div>
                    <div>
                      <h4 className="text-[#163A33] font-semibold text-sm sm:text-base">ProjectMATCH Impact</h4>
                      <p className="text-gray-700 text-sm sm:text-base">{solution.impact}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {!showAll && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setShowAll(true)}
              className="cursor-pointer bg-[#9ff64f] text-black px-6 py-2.5 rounded-lg font-medium hover:bg-[#69a34b] transition-colors text-sm md:text-base"
            >
              View more
            </button>
          </div>
        )}
      </div>
    </section>
  )
}