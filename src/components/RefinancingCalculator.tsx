import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingDown, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type LoanComparison = {
  currentMonthlyPayment: number;
  currentTotalPayment: number;
  currentTotalInterest: number;
  currentRemainingTerm: number;
  newMonthlyPayment: number;
  newTotalPayment: number;
  newTotalInterest: number;
  newTerm: number;
  monthlySavings: number;
  totalSavings: number;
  breakEvenMonths: number;
};

export function RefinancingCalculator() {
  const [currentBalance, setCurrentBalance] = useState<string>("80000");
  const [currentRate, setCurrentRate] = useState<string>("12");
  const [remainingTerm, setRemainingTerm] = useState<string>("18");
  const [newRate, setNewRate] = useState<string>("9");
  const [newTerm, setNewTerm] = useState<string>("18");
  const [refinancingCosts, setRefinancingCosts] = useState<string>("2000");
  const [comparison, setComparison] = useState<LoanComparison | null>(null);

  const calculateRefinancing = () => {
    const balance = parseFloat(currentBalance);
    const currentAnnualRate = parseFloat(currentRate) / 100;
    const currentMonthlyRate = currentAnnualRate / 12;
    const remainingMonths = parseInt(remainingTerm);
    const newAnnualRate = parseFloat(newRate) / 100;
    const newMonthlyRate = newAnnualRate / 12;
    const newMonths = parseInt(newTerm);
    const costs = parseFloat(refinancingCosts);

    if (
      isNaN(balance) || isNaN(currentAnnualRate) || isNaN(remainingMonths) ||
      isNaN(newAnnualRate) || isNaN(newMonths) || isNaN(costs) ||
      balance <= 0 || remainingMonths <= 0 || newMonths <= 0
    ) {
      return;
    }

    // Calculate current loan monthly payment
    const currentMonthlyPayment =
      (balance * currentMonthlyRate * Math.pow(1 + currentMonthlyRate, remainingMonths)) /
      (Math.pow(1 + currentMonthlyRate, remainingMonths) - 1);

    const currentTotalPayment = currentMonthlyPayment * remainingMonths;
    const currentTotalInterest = currentTotalPayment - balance;

    // Calculate new loan monthly payment
    const newMonthlyPayment =
      (balance * newMonthlyRate * Math.pow(1 + newMonthlyRate, newMonths)) /
      (Math.pow(1 + newMonthlyRate, newMonths) - 1);

    const newTotalPayment = newMonthlyPayment * newMonths + costs;
    const newTotalInterest = (newMonthlyPayment * newMonths) - balance;

    // Calculate savings
    const monthlySavings = currentMonthlyPayment - newMonthlyPayment;
    const totalSavings = currentTotalPayment - newTotalPayment;
    
    // Calculate break-even point (when refinancing costs are recovered)
    const breakEvenMonths = costs / Math.abs(monthlySavings);

    setComparison({
      currentMonthlyPayment,
      currentTotalPayment,
      currentTotalInterest,
      currentRemainingTerm: remainingMonths,
      newMonthlyPayment,
      newTotalPayment,
      newTotalInterest,
      newTerm: newMonths,
      monthlySavings,
      totalSavings,
      breakEvenMonths,
    });
  };

  const isWorthRefinancing = comparison && comparison.totalSavings > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Loan Refinancing Calculator</CardTitle>
        <CardDescription>
          Compare your current loan with potential refinancing options to see if refinancing makes sense
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Loan Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Current Loan</h3>
            <div className="space-y-2">
              <Label htmlFor="current-balance">Remaining Balance (KES)</Label>
              <Input
                id="current-balance"
                type="number"
                value={currentBalance}
                onChange={(e) => setCurrentBalance(e.target.value)}
                placeholder="80000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current-rate">Current Interest Rate (%)</Label>
              <Input
                id="current-rate"
                type="number"
                step="0.1"
                value={currentRate}
                onChange={(e) => setCurrentRate(e.target.value)}
                placeholder="12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remaining-term">Remaining Term (months)</Label>
              <Input
                id="remaining-term"
                type="number"
                value={remainingTerm}
                onChange={(e) => setRemainingTerm(e.target.value)}
                placeholder="18"
              />
            </div>
          </div>

          {/* New Loan Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Refinancing Option</h3>
            <div className="space-y-2">
              <Label htmlFor="new-rate">New Interest Rate (%)</Label>
              <Input
                id="new-rate"
                type="number"
                step="0.1"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                placeholder="9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-term">New Term (months)</Label>
              <Input
                id="new-term"
                type="number"
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                placeholder="18"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refinancing-costs">Refinancing Costs (KES)</Label>
              <Input
                id="refinancing-costs"
                type="number"
                value={refinancingCosts}
                onChange={(e) => setRefinancingCosts(e.target.value)}
                placeholder="2000"
              />
            </div>
          </div>
        </div>

        <Button onClick={calculateRefinancing} className="w-full md:w-auto">
          Calculate Refinancing Impact
        </Button>

        {comparison && (
          <div className="space-y-6 mt-6">
            {/* Recommendation Alert */}
            <Alert className={isWorthRefinancing ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-amber-500 bg-amber-50 dark:bg-amber-950"}>
              <AlertCircle className={`h-4 w-4 ${isWorthRefinancing ? "text-green-600" : "text-amber-600"}`} />
              <AlertDescription className={isWorthRefinancing ? "text-green-800 dark:text-green-200" : "text-amber-800 dark:text-amber-200"}>
                {isWorthRefinancing ? (
                  <>
                    <strong>Refinancing is recommended!</strong> You could save KES {Math.abs(comparison.totalSavings).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} over the life of the loan.
                    {comparison.breakEvenMonths > 0 && (
                      <> You'll break even after {Math.ceil(comparison.breakEvenMonths)} months.</>
                    )}
                  </>
                ) : (
                  <>
                    <strong>Refinancing may not be worth it.</strong> You would pay KES {Math.abs(comparison.totalSavings).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} more over the life of the loan.
                  </>
                )}
              </AlertDescription>
            </Alert>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Monthly Payment Change</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold flex items-center gap-2 ${comparison.monthlySavings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {comparison.monthlySavings > 0 ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
                    {comparison.monthlySavings > 0 ? '-' : '+'}KES {Math.abs(comparison.monthlySavings).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {comparison.monthlySavings > 0 ? 'Savings' : 'Additional cost'} per month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Savings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold flex items-center gap-2 ${comparison.totalSavings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {comparison.totalSavings > 0 ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
                    {comparison.totalSavings > 0 ? '-' : '+'}KES {Math.abs(comparison.totalSavings).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Over the life of the loan
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Break-Even Point</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {comparison.monthlySavings > 0 ? Math.ceil(comparison.breakEvenMonths) : 'N/A'}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {comparison.monthlySavings > 0 ? 'Months to recover costs' : 'No break-even'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Comparison Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Comparison</CardTitle>
                <CardDescription>Side-by-side comparison of loan metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        metric: 'Monthly Payment',
                        Current: comparison.currentMonthlyPayment,
                        Refinanced: comparison.newMonthlyPayment,
                      },
                      {
                        metric: 'Total Interest',
                        Current: comparison.currentTotalInterest,
                        Refinanced: comparison.newTotalInterest,
                      },
                      {
                        metric: 'Total Cost',
                        Current: comparison.currentTotalPayment,
                        Refinanced: comparison.newTotalPayment,
                      },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="metric" className="text-xs" />
                    <YAxis
                      className="text-xs"
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                      formatter={(value: number) => [
                        `KES ${value.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                        ''
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="Current" fill="hsl(var(--primary))" />
                    <Bar dataKey="Refinanced" fill="hsl(var(--secondary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Detailed Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 pb-2 border-b">
                    <div className="font-semibold text-foreground">Metric</div>
                    <div className="font-semibold text-center text-foreground">Current Loan</div>
                    <div className="font-semibold text-center text-foreground">Refinanced Loan</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="text-muted-foreground">Monthly Payment</div>
                    <div className="text-center">
                      <Badge variant="outline">
                        KES {comparison.currentMonthlyPayment.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <Badge variant={comparison.newMonthlyPayment < comparison.currentMonthlyPayment ? "default" : "secondary"}>
                        KES {comparison.newMonthlyPayment.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="text-muted-foreground">Total Interest</div>
                    <div className="text-center">
                      KES {comparison.currentTotalInterest.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-center">
                      KES {comparison.newTotalInterest.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="text-muted-foreground">Total Payment</div>
                    <div className="text-center">
                      KES {comparison.currentTotalPayment.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-center">
                      KES {comparison.newTotalPayment.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="text-muted-foreground">Loan Term</div>
                    <div className="text-center">
                      {comparison.currentRemainingTerm} months
                    </div>
                    <div className="text-center">
                      {comparison.newTerm} months
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 items-center pt-2 border-t">
                    <div className="text-muted-foreground">Refinancing Costs</div>
                    <div className="text-center">-</div>
                    <div className="text-center text-red-600">
                      KES {parseFloat(refinancingCosts).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
