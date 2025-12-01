import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line } from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoanComparison } from "@/components/LoanComparison";
import { EarlyPaymentCalculator } from "@/components/EarlyPaymentCalculator";
import { RefinancingCalculator } from "@/components/RefinancingCalculator";

type PaymentDetail = {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

export default function Repayment() {
  const [loanAmount, setLoanAmount] = useState<string>("100000");
  const [interestRate, setInterestRate] = useState<string>("10");
  const [loanTerm, setLoanTerm] = useState<string>("12");
  const [schedule, setSchedule] = useState<PaymentDetail[]>([]);
  const [chartType, setChartType] = useState<"area" | "bar" | "line">("area");

  const calculateSchedule = () => {
    const principal = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate) / 100;
    const monthlyRate = annualRate / 12;
    const months = parseInt(loanTerm);

    if (isNaN(principal) || isNaN(annualRate) || isNaN(months) || principal <= 0 || months <= 0) {
      return;
    }

    // Calculate monthly payment using amortization formula
    const monthlyPayment = 
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
      (Math.pow(1 + monthlyRate, months) - 1);

    let remainingBalance = principal;
    const paymentSchedule: PaymentDetail[] = [];

    for (let month = 1; month <= months; month++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance = Math.max(0, remainingBalance - principalPayment);

      paymentSchedule.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: remainingBalance,
      });
    }

    setSchedule(paymentSchedule);
  };

  const totalPayment = schedule.reduce((sum, p) => sum + p.payment, 0);
  const totalInterest = schedule.reduce((sum, p) => sum + p.interest, 0);
  const totalPrincipal = schedule.reduce((sum, p) => sum + p.principal, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pt-20">
        <section className="py-12 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Loan Repayment Calculator
              </h1>
              <p className="text-muted-foreground">
                Calculate your loan payments and see a detailed breakdown of principal vs interest
              </p>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Loan Details</CardTitle>
                <CardDescription>Enter your loan information to calculate the repayment schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Loan Amount (KES)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      placeholder="100000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate">Annual Interest Rate (%)</Label>
                    <Input
                      id="rate"
                      type="number"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      placeholder="10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="term">Loan Term (months)</Label>
                    <Input
                      id="term"
                      type="number"
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(e.target.value)}
                      placeholder="12"
                    />
                  </div>
                </div>
                <Button onClick={calculateSchedule} className="w-full md:w-auto">
                  Calculate Repayment Schedule
                </Button>
              </CardContent>
            </Card>

            {schedule.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Total Payment</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">
                        KES {totalPayment.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Total Principal</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-secondary">
                        KES {totalPrincipal.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Total Interest</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        KES {totalInterest.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Total Payment Composition</CardTitle>
                      <CardDescription>Proportion of principal vs interest</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Principal', value: totalPrincipal },
                              { name: 'Interest', value: totalInterest },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            <Cell fill="hsl(var(--secondary))" />
                            <Cell fill="hsl(var(--primary))" />
                          </Pie>
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
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>Payment Breakdown Over Time</CardTitle>
                          <CardDescription>Visual representation of principal and interest payments</CardDescription>
                        </div>
                        <Tabs value={chartType} onValueChange={(value) => setChartType(value as "area" | "bar" | "line")}>
                          <TabsList>
                            <TabsTrigger value="area">Area</TabsTrigger>
                            <TabsTrigger value="bar">Bar</TabsTrigger>
                            <TabsTrigger value="line">Line</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      {chartType === "area" ? (
                        <AreaChart
                          data={schedule.map(p => ({
                            month: `Month ${p.month}`,
                            Principal: parseFloat(p.principal.toFixed(2)),
                            Interest: parseFloat(p.interest.toFixed(2)),
                          }))}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="month" 
                            className="text-xs"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
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
                          <Area
                            type="monotone"
                            dataKey="Principal"
                            stackId="1"
                            stroke="hsl(var(--secondary))"
                            fill="hsl(var(--secondary))"
                            fillOpacity={0.6}
                          />
                          <Area
                            type="monotone"
                            dataKey="Interest"
                            stackId="1"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.6}
                          />
                        </AreaChart>
                      ) : chartType === "bar" ? (
                        <BarChart
                          data={schedule.map(p => ({
                            month: `Month ${p.month}`,
                            Principal: parseFloat(p.principal.toFixed(2)),
                            Interest: parseFloat(p.interest.toFixed(2)),
                          }))}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="month" 
                            className="text-xs"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
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
                          <Bar
                            dataKey="Principal"
                            stackId="1"
                            fill="hsl(var(--secondary))"
                          />
                          <Bar
                            dataKey="Interest"
                            stackId="1"
                            fill="hsl(var(--primary))"
                          />
                        </BarChart>
                      ) : (
                        <LineChart
                          data={schedule.map(p => ({
                            month: `Month ${p.month}`,
                            Principal: parseFloat(p.principal.toFixed(2)),
                            Interest: parseFloat(p.interest.toFixed(2)),
                          }))}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="month" 
                            className="text-xs"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
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
                          <Line
                            type="monotone"
                            dataKey="Principal"
                            stroke="hsl(var(--secondary))"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="Interest"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                          />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Schedule</CardTitle>
                    <CardDescription>Monthly breakdown of principal and interest payments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Month</TableHead>
                            <TableHead className="text-right">Payment</TableHead>
                            <TableHead className="text-right">Principal</TableHead>
                            <TableHead className="text-right">Interest</TableHead>
                            <TableHead className="text-right">Remaining Balance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {schedule.map((payment) => (
                            <TableRow key={payment.month}>
                              <TableCell className="font-medium">
                                <Badge variant="outline">{payment.month}</Badge>
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                KES {payment.payment.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="text-right text-secondary">
                                KES {payment.principal.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="text-right text-muted-foreground">
                                KES {payment.interest.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="text-right">
                                KES {payment.balance.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            <div className="mt-12">
              <EarlyPaymentCalculator />
            </div>

            <div className="mt-12">
              <RefinancingCalculator />
            </div>

            <div className="mt-12">
              <LoanComparison />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
