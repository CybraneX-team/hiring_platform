import Header from "./components/header";
import HeroSection from "./components/hero";
import OverviewSection from "./components/overview-section";
import FeaturesMarquee from "./components/features-marquee";
import AboutSection from "./components/about-section";
import StatsSection from "./components/sats-section";
import SolutionsSection from "./components/solution-section";
import BenefitsSection from "./components/benefits-section";
import ImpactSection from "./components/impact-section";
import DarkImpactSection from "./components/dark-impact";
import WorksSection from "./components/HIW";
import TestimonialsSection from "./components/testimonials";
import CTASection from "./components/cta-section";
import Footer from "./components/Footer";
import BackedSection from "./components/Backed";

export default function Home() {
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
