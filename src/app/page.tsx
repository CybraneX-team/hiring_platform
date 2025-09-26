import Header from "./components/header";
import HeroSection from "./components/hero";
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
      {/* <Header /> */}
      <HeroSection />
      {/* <AboutSection /> */}
      {/* <StatsSection /> */}
      <div className=" mt-10">
        <BenefitsSection />
      </div>
      <SolutionsSection />
      <ImpactSection />
      <DarkImpactSection />
      <WorksSection />
      <BackedSection />
      {/* <TestimonialsSection /> */}
      <CTASection />
      <Footer />
    </div>
  );
}
