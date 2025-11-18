import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export const Navigation = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">GrowthFund</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            How it Works
          </button>
          <button
            onClick={() => scrollToSection("calculator")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Calculator
          </button>
          <button
            onClick={() => scrollToSection("apply")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Apply Now
          </button>
        </div>

        <Button 
          onClick={() => scrollToSection("apply")}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Get Started
        </Button>
      </div>
    </nav>
  );
};
