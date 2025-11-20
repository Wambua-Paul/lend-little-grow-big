import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { LoanTierComparison } from "@/components/LoanTierComparison";
import { LoanEligibilityQuiz } from "@/components/LoanEligibilityQuiz";
import { LoanCalculator } from "@/components/LoanCalculator";
import { LoanApplication } from "@/components/LoanApplication";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <HowItWorks />
      <LoanTierComparison />
      <LoanEligibilityQuiz />
      <LoanCalculator />
      <LoanApplication />
      <Footer />
    </div>
  );
};

export default Index;
