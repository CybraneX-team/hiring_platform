"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import { X } from "lucide-react"

export default function SolutionsSection() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
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

  const handleCardClick = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index)
  }

  const handleCloseCard = (e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedCard(null)
  }

  // Listen for custom events from footer to expand specific sectors
  useEffect(() => {
    const handleExpandSector = (event: CustomEvent) => {
      const { sectorName } = event.detail;
      const sectorIndex = solutions.findIndex(solution => solution.title === sectorName);
      if (sectorIndex !== -1) {
        setExpandedCard(sectorIndex);
        
        // Scroll to the expanded card horizontally
        setTimeout(() => {
          const cardElement = document.querySelector(`[data-card-index="${sectorIndex}"]`);
          if (cardElement) {
            cardElement.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'center'
            });
          }
        }, 100); // Small delay to ensure the card is expanded
      }
    };

    window.addEventListener('expandSector', handleExpandSector as EventListener);
    
    return () => {
      window.removeEventListener('expandSector', handleExpandSector as EventListener);
    };
  }, []);

  return (
    <section className="py-14 bg-white" id="sectors">
      <div className="max-w-[83rem] mx-auto px-6">
        <motion.div
          className="flex justify-between items-center mb-16"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div>
            <h2 className="text-2xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight ml-5">Our Empowerment</h2>
          </div>
          <button
            className="relative flex mt-10 items-center text-black/80 hover:text-black text-xs md:text-sm rounded-lg transition-colors underline-offset-4 font-medium group focus:outline-none"
            style={{ paddingBottom: 7, paddingRight: 15, letterSpacing: 4 }}
          >
            <span
              className="relative pb-5 uppercase"
              style={{ paddingBottom: 20, display: "inline-block" }}
            >
              {/* <span
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
              </span> */}
            </span>
          </button>
        </motion.div>

        <div className="relative overflow-x-auto overflow-y-hidden scrollbar-hide flex">
          <motion.div layout className="flex items-start gap-10 w-max p-4">
            {solutions.map((solution, index) => {
              const isExpanded = expandedCard === index
              return (
                <motion.div
                  key={index}
                  data-card-index={index}
                  layout="position"
                  className={`
                    bg-[#163A37] text-white rounded-xl relative overflow-visible cursor-pointer flex-none shrink-0
                    border border-white/10
                    transition-[width] duration-450
                    ${isExpanded
                      ? "w-[32rem] md:w-[50rem] h-[30rem] p-10 ring-2 ring-emerald-300/20 z-10 overflow-hidden"
                      : "w-96 h-[30rem] p-8 overflow-hidden"
                    }
                    flex flex-col justify-between
                  `}
                  onClick={() => handleCardClick(index)}
                  initial={false}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    layout: isExpanded
                      ? { type: "spring", stiffness: 160, damping: 22 }
                      : { duration: 0 },
                  }}
                >
                  <div className="pointer-events-none absolute inset-0" />
                  <div className="absolute -top-2 -right-2 bg-[#A6F56B] rounded-lg p-2 shadow-2xl">
                    {solution.iconSrc && (
                      <Image src={solution.iconSrc} alt={`${solution.title} icon`} width={28} height={28} className="object-contain" />
                    )}
                  </div>
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
                        text-2xl md:text-3xl font-extrabold mb-2 text-left tracking-tight text-[#A6F56B]
                        ${isExpanded ? "mt-2" : ""}
                      `}
                    >
                      {solution.title}
                    </motion.h3>

                    {/* Replaced description with a media preview inside the tile */}
                    {!isExpanded && (solution as any).heroSrc && (
                      <div className="relative mt-2">
                        <Image
                          src={(solution as any).heroSrc}
                          alt={`${solution.title}`}
                          width={900}
                          height={300}
                          className="object-cover w-full h-32 md:h-auto rounded-2xl border border-white/10"
                        />
                      </div>
                    )}
                    {!isExpanded && (
                      <div className="mt-4 flex items-center gap-2 text-[#A6F56B] font-semibold">
                        <span className="underline underline-offset-4 ">Learn more</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="-translate-x-1 transition-transform">
                          <path d="M5 12h14" />
                          <path d="M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    )}

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          layout
                          className="mt-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3, ease: easeEmphatic as any }}
                        >
                          {/* Expanded view: large media image at right within card bounds */}
                        <motion.div
                          className="border border-white/10 rounded-xl bg-white/5 p-6 mb-0"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.35, ease: easeEmphatic as any }}
                        >
                          <div className="space-y-6">
                            {/* Market Size */}
                            <div>
                              <h4 className="text-[#A6F56B] font-bold text-lg mb-2">Market Size</h4>
                              <p className="text-white/90 text-base">{solution.marketSize}</p>
                            </div>
                            
                            {/* Challenge */}
                            <div>
                              <h4 className="text-[#A6F56B] font-bold text-lg mb-2">Challenge</h4>
                              <p className="text-white/90 text-base">{solution.challenge}</p>
                            </div>
                            
                            {/* ProjectMATCH Impact */}
                            <div>
                              <h4 className="text-[#A6F56B] font-bold text-lg mb-2">ProjectMATCH Impact</h4>
                              <p className="text-white/90 text-base">{solution.impact}</p>
                            </div>
                          </div>
                        </motion.div>
                          {/* Removed footer CTA to keep height stable */}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
      {/* Scroll Indicator  */}
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
