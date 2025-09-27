"use client";

import { motion } from "motion/react";
import { Shield, Building2, Star, Brain, FileText, Target, Zap, Users, Clock, Globe, CheckCircle, TrendingUp, Award, Settings } from "lucide-react";

export default function FeaturesMarquee() {
  const marquee1Features = [
    {
      icon: Shield,
      title: "Verified & Qualified Engineers",
      description: "All engineers are thoroughly vetted and certified"
    },
    {
      icon: Building2,
      title: "Top Companies",
      description: "Connect with leading energy and infrastructure companies"
    },
    {
      icon: Star,
      title: "Rating System",
      description: "Better feedback system for engineer performance tracking"
    },
    {
      icon: Brain,
      title: "AI Matching",
      description: "Intelligent matching of talent with project requirements"
    },
    {
      icon: FileText,
      title: "AI Resume Assist",
      description: "AI-powered resume optimization and enhancement"
    },
    {
      icon: Target,
      title: "AI Scoring",
      description: "Advanced scoring system for candidate evaluation"
    },
    {
      icon: Zap,
      title: "AI Assisted Job Creation",
      description: "Smart job posting with AI-generated descriptions"
    }
  ];

  const marquee2Features = [
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Seamless collaboration tools for project teams"
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Instant notifications and project status updates"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Access to talent and projects worldwide"
    },
    {
      icon: CheckCircle,
      title: "Quality Assurance",
      description: "Comprehensive quality checks and compliance"
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description: "Detailed insights and performance metrics"
    },
    {
      icon: Award,
      title: "Industry Recognition",
      description: "Certified professionals with industry credentials"
    },
    {
      icon: Settings,
      title: "Custom Workflows",
      description: "Tailored processes for different project types"
    }
  ];

  // Create continuous loops for each marquee with their respective features
  const marquee1Items = [...marquee1Features, ...marquee1Features];
  const marquee2Items = [...marquee2Features, ...marquee2Features];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#163A33] mb-4">
            Why Choose ProjectMATCH?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Advanced AI-powered platform with comprehensive features for the energy sector
          </p>
        </motion.div>

        {/* First Marquee */}
        <div className="relative overflow-hidden mb-8">
          <motion.div
            className="flex whitespace-nowrap"
            animate={{
              x: ["0%", "-100%"],
            }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {marquee1Items.map((feature, index) => (
              <div
                key={`marquee-1-${index}`}
                className="flex-shrink-0 mx-4 group"
              >
                <div className="bg-white rounded-2xl p-6 w-auto shadow-t-lg border border-gray-100 hover:shadow-t-xl transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#9ff64f] rounded-full p-3 flex-shrink-0">
                      <feature.icon className="w-10 h-10 text-[#163A33]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[#163A33] font-semibold text-lg mb-2 leading-tight">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-md leading-relaxed break-words">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Second Marquee */}
        <div className="relative overflow-hidden">
          <motion.div
            className="flex whitespace-nowrap"
            animate={{
              x: ["-100%", "0%"],
            }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {marquee2Items.map((feature, index) => (
              <div
                key={`marquee-2-${index}`}
                className="flex-shrink-0 mx-4 group"
              >
                <div className="bg-white rounded-2xl p-6 w-auto shadow-t-lg border border-gray-100 hover:shadow-t-xl transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#9ff64f] rounded-full p-3 flex-shrink-0">
                      <feature.icon className="w-10 h-10 text-[#163A33]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[#163A33] font-semibold text-lg mb-2 leading-tight">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-md leading-relaxed break-words">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
