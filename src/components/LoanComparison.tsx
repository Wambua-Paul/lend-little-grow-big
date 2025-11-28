import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

type LoanScenario = {
  id: string;
  name: string;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  totalPrincipal: number;
};

export function LoanComparison() {
  const [scenarios, setScenarios] = useState<LoanScenario[]>([]);
  const [newScenario, setNewScenario] = useState({
    name: "",
    loanAmount: "100000",
    interestRate: "10",
    loanTerm: "12",
  });

  const calculateScenario = () => {
    const principal = parseFloat(newScenario.loanAmount);
    const annualRate = parseFloat(newScenario.interestRate) / 100;
    const monthlyRate = annualRate / 12;
    const months = parseInt(newScenario.loanTerm);

    if (isNaN(principal) || isNaN(annualRate) || isNaN(months) || principal <= 0 || months <= 0) {
      return;
    }

    // Calculate monthly payment using amortization formula
    const monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - principal;

    const scenario: LoanScenario = {
      id: Date.now().toString(),
      name: newScenario.name || `Scenario ${scenarios.length + 1}`,
      loanAmount: principal,
      interestRate: annualRate * 100,
      loanTerm: months,
      monthlyPayment,
      totalPayment,
      totalInterest,
      totalPrincipal: principal,
    };

    if (scenarios.length < 3) {
      setScenarios([...scenarios, scenario]);
      setNewScenario({
        name: "",
        loanAmount: "100000",
        interestRate: "10",
        loanTerm: "12",
      });
    }
  };

  const removeScenario = (id: string) => {
    setScenarios(scenarios.filter((s) => s.id !== id));
  };

  const clearAll = () => {
    setScenarios([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Compare Loan Scenarios</h2>
          <p className="text-muted-foreground">Add up to 3 scenarios to compare side-by-side</p>
        </div>
        {scenarios.length > 0 && (
          <Button variant="outline" onClick={clearAll}>
            Clear All
          </Button>
        )}
      </div>

      {scenarios.length < 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Add Scenario</CardTitle>
            <CardDescription>Enter loan details for a new comparison scenario</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="scenario-name">Scenario Name</Label>
                <Input
                  id="scenario-name"
                  type="text"
                  value={newScenario.name}
                  onChange={(e) => setNewScenario({ ...newScenario, name: e.target.value })}
                  placeholder="e.g., Option A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scenario-amount">Loan Amount (KES)</Label>
                <Input
                  id="scenario-amount"
                  type="number"
                  value={newScenario.loanAmount}
                  onChange={(e) => setNewScenario({ ...newScenario, loanAmount: e.target.value })}
                  placeholder="100000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scenario-rate">Annual Rate (%)</Label>
                <Input
                  id="scenario-rate"
                  type="number"
                  step="0.1"
                  value={newScenario.interestRate}
                  onChange={(e) => setNewScenario({ ...newScenario, interestRate: e.target.value })}
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scenario-term">Term (months)</Label>
                <Input
                  id="scenario-term"
                  type="number"
                  value={newScenario.loanTerm}
                  onChange={(e) => setNewScenario({ ...newScenario, loanTerm: e.target.value })}
                  placeholder="12"
                />
              </div>
            </div>
            <Button onClick={calculateScenario} className="w-full md:w-auto">
              Add Scenario
            </Button>
          </CardContent>
        </Card>
      )}

      {scenarios.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scenarios.map((scenario) => (
              <Card key={scenario.id} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => removeScenario(scenario.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardHeader>
                  <CardTitle className="text-lg">{scenario.name}</CardTitle>
                  <CardDescription>
                    KES {scenario.loanAmount.toLocaleString()} @ {scenario.interestRate}% for {scenario.loanTerm} months
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Monthly Payment</div>
                    <div className="text-xl font-bold text-primary">
                      KES {scenario.monthlyPayment.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Payment</div>
                    <div className="text-lg font-semibold">
                      KES {scenario.totalPayment.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Interest</div>
                    <div className="text-lg font-semibold">
                      KES {scenario.totalInterest.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Comparison</CardTitle>
              <CardDescription>Side-by-side comparison of all metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Metric</TableHead>
                      {scenarios.map((scenario) => (
                        <TableHead key={scenario.id} className="text-right">
                          {scenario.name}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Loan Amount</TableCell>
                      {scenarios.map((scenario) => (
                        <TableCell key={scenario.id} className="text-right">
                          KES {scenario.loanAmount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Interest Rate</TableCell>
                      {scenarios.map((scenario) => (
                        <TableCell key={scenario.id} className="text-right">
                          {scenario.interestRate}%
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Loan Term</TableCell>
                      {scenarios.map((scenario) => (
                        <TableCell key={scenario.id} className="text-right">
                          {scenario.loanTerm} months
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Monthly Payment</TableCell>
                      {scenarios.map((scenario) => {
                        const isLowest = scenario.monthlyPayment === Math.min(...scenarios.map(s => s.monthlyPayment));
                        return (
                          <TableCell key={scenario.id} className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              KES {scenario.monthlyPayment.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              {isLowest && scenarios.length > 1 && <Badge variant="secondary">Lowest</Badge>}
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Payment</TableCell>
                      {scenarios.map((scenario) => (
                        <TableCell key={scenario.id} className="text-right">
                          KES {scenario.totalPayment.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Principal</TableCell>
                      {scenarios.map((scenario) => (
                        <TableCell key={scenario.id} className="text-right text-secondary">
                          KES {scenario.totalPrincipal.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Interest</TableCell>
                      {scenarios.map((scenario) => {
                        const isLowest = scenario.totalInterest === Math.min(...scenarios.map(s => s.totalInterest));
                        return (
                          <TableCell key={scenario.id} className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              KES {scenario.totalInterest.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              {isLowest && scenarios.length > 1 && <Badge variant="secondary">Lowest</Badge>}
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Interest as % of Loan</TableCell>
                      {scenarios.map((scenario) => {
                        const percentage = (scenario.totalInterest / scenario.loanAmount) * 100;
                        return (
                          <TableCell key={scenario.id} className="text-right">
                            {percentage.toFixed(2)}%
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
