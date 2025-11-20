import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LOAN_TIERS } from "@/lib/loanTiers";
import { CheckCircle2 } from "lucide-react";

export const LoanTierComparison = () => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Compare Loan Tiers
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the right loan tier for your business needs with transparent rates and flexible terms
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {LOAN_TIERS.map((tier, index) => (
            <Card 
              key={tier.id} 
              className={`relative transition-all hover:shadow-lg ${
                index === 1 ? 'border-primary shadow-md scale-105' : ''
              }`}
            >
              {index === 1 && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-primary">
                    {tier.interestRate}%
                    <span className="text-base font-normal text-muted-foreground ml-1">APR</span>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Loan Amount</p>
                      <p className="text-sm text-muted-foreground">
                        {formatAmount(tier.minAmount)} - {formatAmount(tier.maxAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Flexible Terms</p>
                      <p className="text-sm text-muted-foreground">
                        {tier.availableTerms.join(", ")} months
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Quick Processing</p>
                      <p className="text-sm text-muted-foreground">
                        24-48 hours approval
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">No Hidden Fees</p>
                      <p className="text-sm text-muted-foreground">
                        Transparent pricing
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
