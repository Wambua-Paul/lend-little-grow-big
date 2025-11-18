import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";

export const Hero = () => {
  const scrollToApply = () => {
    const element = document.getElementById("apply");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium">
            <Zap className="h-4 w-4" />
            Fast approval in 24-48 hours
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Fuel Your Business
            <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Growth Today
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Access microloans from $1,000 to $50,000 designed for small businesses. 
            Simple application, flexible terms, and competitive rates.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg"
              onClick={scrollToApply}
              className="bg-primary hover:bg-primary/90 text-primary-foreground group"
            >
              Apply for a Loan
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" })}
            >
              Calculate Payment
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Competitive Rates</h3>
              <p className="text-sm text-muted-foreground text-center">
                Starting from 8.5% APR with flexible repayment terms
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-lg">Secure Process</h3>
              <p className="text-sm text-muted-foreground text-center">
                Bank-level security to protect your business information
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Quick Funding</h3>
              <p className="text-sm text-muted-foreground text-center">
                Receive funds in your account within 48 hours of approval
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
