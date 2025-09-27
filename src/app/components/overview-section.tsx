"use client";

import { motion } from "motion/react";
import Image from "next/image";

export default function OverviewSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Who We Serve */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-24"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#163A33] mb-4">
              Who We Serve
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connecting the right talent with the right opportunities in energy and infrastructure
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
            {/* For Engineers */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="group flex-1"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="flex h-full">
                  {/* Left side - Green background with icon */}
                  <div className="bg-[#A6F56B] w-32 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Image
                      src="/flaticon_assets/engineer.png"
                      alt="Engineers"
                      width={64}
                      height={64}
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  
                  {/* Right side - Content */}
                  <div className="flex-1 p-8">
                    <div className="mb-6">
                      <h3 className="text-3xl font-bold text-[#163A33] mb-2">For Engineers</h3>
                      <p className="text-gray-600">Find your next career opportunity</p>
                    </div>
                    
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#A6F56B] rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-[#163A33] font-medium">Explore jobs in energy & infrastructure</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#A6F56B] rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-[#163A33] font-medium">Showcase your profile & skills</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#A6F56B] rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-[#163A33] font-medium">Get matched with top companies</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* For Companies */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              className="group flex-1"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="flex h-full">
                  {/* Left side - Green background with icon */}
                  <div className="bg-[#A6F56B] w-32 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Image
                      src="/flaticon_assets/organization.png"
                      alt="Companies"
                      width={64}
                      height={64}
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  
                  {/* Right side - Content */}
                  <div className="flex-1 p-8">
                    <div className="mb-6">
                      <h3 className="text-3xl font-bold text-[#163A33] mb-2">For Companies</h3>
                      <p className="text-gray-600">Build your dream team</p>
                    </div>
                    
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#A6F56B] rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-[#163A33] font-medium">Access a pool of verified engineers</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#A6F56B] rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-[#163A33] font-medium">Post jobs & hire faster</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#A6F56B] rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-[#163A33] font-medium">Build strong project teams</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Our Industry Coverage */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-24"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#163A33] mb-4">
              Our Industry Coverage
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Specialized expertise across key energy and infrastructure sectors
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {[
              { 
                image: "/flaticon_assets/oil-and-gas.png", 
                label: "Oil & Gas", 
                color: "bg-orange-50 border-orange-200" 
              },
              { 
                image: "/flaticon_assets/solar-for-overview.png", 
                label: "Solar Energy", 
                color: "bg-yellow-50 border-yellow-200" 
              },
              { 
                image: "/flaticon_assets/wind-turbine.png", 
                label: "Wind Energy", 
                color: "bg-blue-50 border-blue-200" 
              },
              { 
                image: "/flaticon_assets/infrastructure.png", 
                label: "Infrastructure", 
                color: "bg-gray-50 border-gray-200" 
              },
              { 
                image: "/flaticon_assets/green-energy.png", 
                label: "Green Energy", 
                color: "bg-green-50 border-green-200" 
              },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
                className="group"
              >
                <div className={`${item.color} rounded-2xl p-6 border-2 hover:shadow-lg transition-all duration-300 group-hover:scale-105`}>
                  <div className="text-center">
                    <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Image
                        src={item.image}
                        alt={item.label}
                        width={32}
                        height={32}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <h3 className="font-semibold text-[#163A33] text-sm md:text-base">{item.label}</h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div> */}
      </div>
    </section>
  );
}
