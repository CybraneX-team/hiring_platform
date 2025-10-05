"use client"

import HeroSection from "./components/hero";
import OverviewSection from "./components/overview-section";
import FeaturesMarquee from "./components/features-marquee";
import StatsSection from "./components/sats-section";
import SolutionsSection from "./components/solution-section";
import BenefitsSection from "./components/benefits-section";
import ImpactSection from "./components/impact-section";
import DarkImpactSection from "./components/dark-impact";
import CTASection from "./components/cta-section";
import Footer from "./components/Footer";
import BackedSection from "./components/Backed";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { useUser } from "./context/UserContext";

export default function Home() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    let token = localStorage.getItem("token");
    if (token) {
      if (user && user.signedUpAs == "Company") {
        router.push("/company/profile");
      } else {
        router.push("/jobs");
      }
      return;
    }

    setReady(true);
  }, [user, router]);

  if (!ready) return <Loader className="animate-spin m-auto mt-20" />;

  return (
    <div className="min-h-screen bg-white ">

      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Who we Serve along with our industry coverage */}
      <OverviewSection />

      {/* Define • Match • Deliver */}
      <ImpactSection />

      {/* Why Choose ProjectMATCH? */}
      <FeaturesMarquee />

      {/* Globe Section */}
      <BenefitsSection />

      {/* Our Empowerment (sectors) */}
      <SolutionsSection />

      {/* Core disciplines section (9 grid cards section) */}
      <DarkImpactSection />

      {/* Backed Section */}
      <BackedSection />

      {/* Newsletter Section */}
      <CTASection />

      {/* Footer */}
      <Footer />


      {/* Unused Sections */}

      {/* How it works section */}
      {/* <WorksSection /> */}

      {/* About Section */}
      {/* <AboutSection /> */}

      {/* Testimonials Section */}
      {/* <TestimonialsSection /> */}
    </div>
  );
}
