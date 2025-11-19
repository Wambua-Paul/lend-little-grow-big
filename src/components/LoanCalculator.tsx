import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export const LoanCalculator = () => {
  const [amount, setAmount] = useState(10000);
  const [term, setTerm] = useState(12);
  const [rate] = useState(10.5); // Fixed rate for simplicity

  const calculateMonthlyPayment = () => {
    const monthlyRate = rate / 100 / 12;
    const payment = (amount * monthlyRate * Math.pow(1 + monthlyRate, term)) / 
                   (Math.pow(1 + monthlyRate, term) - 1);
    return payment.toFixed(2);
  };

  const totalPayment = (parseFloat(calculateMonthlyPayment()) * term).toFixed(2);
  const totalInterest = (parseFloat(totalPayment) - amount).toFixed(2);

  return (
    <section id="calculator" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Loan Calculator
          </h2>
          <p className="text-muted-foreground">
            Estimate your monthly payments and plan your budget
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Calculate Your Loan</CardTitle>
            <CardDescription>Adjust the sliders to see your estimated payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Loan Amount</Label>
                <span className="font-semibold text-primary">KES {amount.toLocaleString()}</span>
              </div>
              <Slider
                value={[amount]}
                onValueChange={(value) => setAmount(value[0])}
                min={1000}
                max={1000000}
                step={10000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>KES 1,000</span>
                <span>KES 1,000,000</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Loan Term</Label>
                <span className="font-semibold text-primary">{term} months</span>
              </div>
              <Slider
                value={[term]}
                onValueChange={(value) => setTerm(value[0])}
                min={6}
                max={36}
                step={6}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>6 months</span>
                <span>36 months</span>
              </div>
            </div>

            <div className="pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-primary/5 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Monthly Payment</p>
                  <p className="text-2xl font-bold text-primary">KES {calculateMonthlyPayment()}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/5 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Payment</p>
                  <p className="text-2xl font-bold text-secondary">KES {totalPayment}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Interest</p>
                  <p className="text-2xl font-bold text-foreground">KES {totalInterest}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Estimated at {rate}% APR. Actual rates may vary based on creditworthiness.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
