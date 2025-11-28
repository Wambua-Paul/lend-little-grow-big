import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingDown, Calendar, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type ScheduleComparison = {
  originalMonths: number;
  newMonths: number;
  monthsSaved: number;
  originalInterest: number;
  newInterest: number;
  interestSaved: number;
  originalTotalPayment: number;
  newTotalPayment: number;
};

export function EarlyPaymentCalculator() {
  const [loanAmount, setLoanAmount] = useState<string>("100000");
  const [interestRate, setInterestRate] = useState<string>("10");
  const [loanTerm, setLoanTerm] = useState<string>("12");
  const [extraPayment, setExtraPayment] = useState<string>("0");
  const [comparison, setComparison] = useState<ScheduleComparison | null>(null);

  const calculateWithExtraPayment = () => {
    const principal = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate) / 100;
    const monthlyRate = annualRate / 12;
    const months = parseInt(loanTerm);
    const extra = parseFloat(extraPayment);

    if (isNaN(principal) || isNaN(annualRate) || isNaN(months) || isNaN(extra) || principal <= 0 || months <= 0 || extra < 0) {
      return;
    }

    // Calculate original schedule
    const monthlyPayment = 
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
      (Math.pow(1 + monthlyRate, months) - 1);

    let originalBalance = principal;
    let originalTotalInterest = 0;

    for (let month = 1; month <= months; month++) {
      const interestPayment = originalBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      originalBalance = Math.max(0, originalBalance - principalPayment);
      originalTotalInterest += interestPayment;
    }

    // Calculate schedule with extra payment
    let newBalance = principal;
    let newTotalInterest = 0;
    let newMonths = 0;
    const maxMonths = months * 2; // Safety limit

    while (newBalance > 0.01 && newMonths < maxMonths) {
      newMonths++;
      const interestPayment = newBalance * monthlyRate;
      const principalPayment = Math.min(monthlyPayment + extra - interestPayment, newBalance);
      newBalance = Math.max(0, newBalance - principalPayment);
      newTotalInterest += interestPayment;
    }

    setComparison({
      originalMonths: months,
      newMonths,
      monthsSaved: months - newMonths,
      originalInterest: originalTotalInterest,
      newInterest: newTotalInterest,
      interestSaved: originalTotalInterest - newTotalInterest,
      originalTotalPayment: principal + originalTotalInterest,
      newTotalPayment: principal + newTotalInterest,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-primary" />
            Early Payment Calculator
          </CardTitle>
          <CardDescription>
            See how making extra payments can reduce your loan term and save on interest
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="early-amount">Loan Amount (KES)</Label>
              <Input
                id="early-amount"
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                placeholder="100000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="early-rate">Interest Rate (%)</Label>
              <Input
                id="early-rate"
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="early-term">Loan Term (months)</Label>
              <Input
                id="early-term"
                type="number"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
                placeholder="12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="extra-payment" className="text-primary font-semibold">
                Extra Monthly Payment (KES)
              </Label>
              <Input
                id="extra-payment"
                type="number"
                value={extraPayment}
                onChange={(e) => setExtraPayment(e.target.value)}
                placeholder="0"
                className="border-primary"
              />
            </div>
          </div>
          <Button onClick={calculateWithExtraPayment} className="w-full md:w-auto">
            Calculate Impact
          </Button>
        </CardContent>
      </Card>

      {comparison && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <CardDescription>Time Saved</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {comparison.originalMonths} months
                    </Badge>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <Badge variant="default" className="text-xs">
                      {comparison.newMonths} months
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {comparison.monthsSaved} months
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pay off {((comparison.monthsSaved / comparison.originalMonths) * 100).toFixed(1)}% faster
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-secondary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-secondary" />
                  <CardDescription>Interest Saved</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-secondary">
                    KES {comparison.interestSaved.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Save {((comparison.interestSaved / comparison.originalInterest) * 100).toFixed(1)}% on interest
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/20">
              <CardHeader className="pb-3">
                <CardDescription>Total Savings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-accent">
                    KES {comparison.interestSaved.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total payment reduced from KES {comparison.originalTotalPayment.toLocaleString('en-KE', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Comparison Overview</CardTitle>
              <CardDescription>See the impact of extra payments on your loan</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      name: 'Loan Term',
                      Original: comparison.originalMonths,
                      'With Extra Payment': comparison.newMonths,
                    },
                    {
                      name: 'Total Interest',
                      Original: comparison.originalInterest,
                      'With Extra Payment': comparison.newInterest,
                    },
                    {
                      name: 'Total Payment',
                      Original: comparison.originalTotalPayment,
                      'With Extra Payment': comparison.newTotalPayment,
                    },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis 
                    className="text-xs"
                    tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                    formatter={(value: number, name: string) => [
                      name.includes('Term') 
                        ? `${value} months`
                        : `KES ${value.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`,
                      name
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="Original" fill="hsl(var(--muted))" />
                  <Bar dataKey="With Extra Payment" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
