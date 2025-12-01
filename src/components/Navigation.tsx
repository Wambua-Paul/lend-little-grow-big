import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export const Navigation = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
            onClick={() => navigate("/repayment")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Repayment Schedule
          </button>
          {user && (
            <button
              onClick={() => navigate("/payments")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Payments
            </button>
          )}
          <button
            onClick={() => scrollToSection("apply")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Apply Now
          </button>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="hidden md:inline-flex"
              >
                Dashboard
              </Button>
              <Button onClick={() => supabase.auth.signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};
