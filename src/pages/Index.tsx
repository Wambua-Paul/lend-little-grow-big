import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { LoanCalculator } from "@/components/LoanCalculator";
import { LoanApplication } from "@/components/LoanApplication";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <HowItWorks />
      <LoanCalculator />
      <LoanApplication />
      <Footer />
    </div>
  );
};

export default Index;
