import { FileText, CheckCircle, DollarSign, TrendingUp } from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      icon: FileText,
      title: "1. Apply Online",
      description: "Complete our simple application form in under 10 minutes. No paperwork hassle.",
    },
    {
      icon: CheckCircle,
      title: "2. Get Approved",
      description: "Receive a decision within 24-48 hours. We review applications 7 days a week.",
    },
    {
      icon: DollarSign,
      title: "3. Receive Funds",
      description: "Once approved, funds are deposited directly into your business account.",
    },
    {
      icon: TrendingUp,
      title: "4. Grow Your Business",
      description: "Use the loan to expand inventory, hire staff, or invest in marketing.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get funded in four simple steps. Our streamlined process makes it easy 
            to access the capital your business needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative flex flex-col items-center text-center p-6 rounded-xl bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
            >
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                <step.icon className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
