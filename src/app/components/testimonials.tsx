"use client";

import { motion } from "motion/react";
import { Star, Quote } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Sustainability Director",
      company: "GreenTech Corp",
      content:
        "ProjectMATCH connected us with exceptional talent for our renewable energy projects. The platform's AI matching was incredibly accurate, and we found the perfect engineers within days.",
      rating: 5,
      avatar: "/professional-woman-avatar.png",
    },
    {
      name: "Michael Rodriguez",
      role: "Operations Manager",
      company: "EcoManufacturing",
      content:
        "The quality of professionals on ProjectMATCH is outstanding. We've built our entire project team through the platform, and the results speak for themselves.",
      rating: 5,
      avatar: "/professional-man-avatar.png",
    },
    {
      name: "Emily Johnson",
      role: "CEO",
      company: "CleanEnergy Solutions",
      content:
        "ProjectMATCH has revolutionized how we hire. The verification process gives us confidence, and the talent pool is exactly what we need for energy projects.",
      rating: 5,
      avatar: "/professional-woman-ceo-avatar.png",
    },
    {
      name: "David Park",
      role: "Facility Manager",
      company: "Industrial Dynamics",
      content:
        "Outstanding platform for finding specialized talent. The engineers we've hired through ProjectMATCH have exceeded our expectations in every project.",
      rating: 5,
      avatar: "/professional-man-manager-avatar.png",
    },
    {
      name: "Lisa Wang",
      role: "Environmental Officer",
      company: "TechCorp Industries",
      content:
        "ProjectMATCH made it easy to find certified professionals for our infrastructure projects. The platform's focus on energy and infrastructure is exactly what we needed.",
      rating: 5,
      avatar: "/professional-woman-environmental-officer.png",
    },
    {
      name: "James Thompson",
      role: "Plant Director",
      company: "Manufacturing Plus",
      content:
        "The best talent platform for energy professionals. ProjectMATCH delivered exactly what we needed for our plant operations and maintenance projects.",
      rating: 5,
      avatar: "/professional-man-plant-director.png",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <p className="text-[#9ff64f] font-semibold mb-4 text-sm uppercase tracking-wider">
            TESTIMONIALS
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#163A33] mb-4">
            What Our Clients Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hear from industry leaders who trust ProjectMATCH for their talent needs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                {/* Quote Icon */}
                <div className="flex justify-between items-start mb-6">
                  <Quote className="w-8 h-8 text-[#9ff64f] opacity-60" />
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#9ff64f] text-[#9ff64f]" />
                    ))}
                  </div>
                </div>

                {/* Testimonial Content */}
                <p className="text-gray-700 leading-relaxed mb-6 flex-grow">
                  "{testimonial.content}"
                </p>

                {/* Author Info */}
                <div className="flex items-center">
                  <div
                    className="w-12 h-12 bg-cover bg-center rounded-full mr-4 flex-shrink-0 ring-2 ring-[#9ff64f]/20"
                    style={{
                      backgroundImage: `url('${testimonial.avatar}')`,
                    }}
                  ></div>
                  <div>
                    <h4 className="font-bold text-[#163A33] text-sm">
                      {testimonial.name}
                    </h4>
                    <p className="text-xs text-gray-600">{testimonial.role}</p>
                    <p className="text-xs text-[#9ff64f] font-semibold">
                      {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
