"use client";

import { motion } from "framer-motion";

export default function StatsSection() {
  const stats = [
    { value: "70%", label: "Efficiency increase" },
    { value: "100%", label: "Clean energy" },
    { value: "50K+", label: "Tons CO2 saved" },
    { value: "30%", label: "Cost reduction" },
    { value: "$3M", label: "Annual savings" },
    { value: "10M+", label: "kWh generated" },
  ];

  return (
    <section className=" bg-white">
      <div className="max-w-7xl mx-auto px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          className="mt-16 bg-[#163A33] rounded-2xl p-8 text-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-[#9ff64f] mb-2">500+</div>
              <div className="text-white/80 text-sm">Happy Clients</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-[#9ff64f] mb-2">1000+</div>
              <div className="text-white/80 text-sm">Successful Matches</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-[#9ff64f] mb-2">98%</div>
              <div className="text-white/80 text-sm">Satisfaction Rate</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
