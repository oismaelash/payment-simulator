import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import SupportedGatewaysSection from "@/components/landing/SupportedGatewaysSection";
import ProblemSection from "@/components/landing/ProblemSection";
import ComparisonSection from "@/components/landing/ComparisonSection";
import SolutionSection from "@/components/landing/SolutionSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import DeveloperExperienceSection from "@/components/landing/DeveloperExperienceSection";
import OpenSourceSection from "@/components/landing/OpenSourceSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <HeroSection />
        <SupportedGatewaysSection />
        <ProblemSection />
        <ComparisonSection />
        <SolutionSection />
        <HowItWorksSection />
        <FeaturesSection />
        <DeveloperExperienceSection />
        {/* <OpenSourceSection /> */}
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
