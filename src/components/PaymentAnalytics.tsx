import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, CheckCircle, Clock, DollarSign, Calendar } from "lucide-react";
import { format, parseISO, startOfMonth, subMonths } from "date-fns";

interface PaymentHistory {
  id: string;
  payment_date: string;
  amount_paid: number;
  principal_paid: number;
  interest_paid: number;
  payment_schedule_id: string;
}

interface PaymentSchedule {
  id: string;
  next_payment_date: string;
  monthly_payment: number;
  total_paid: number | null;
  remaining_balance: number;
  loan_amount: number;
}

export function PaymentAnalytics() {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [schedules, setSchedules] = useState<PaymentSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [historyResult, schedulesResult] = await Promise.all([
      supabase
        .from("payment_history")
        .select("*")
        .eq("user_id", user.id)
        .order("payment_date", { ascending: true }),
      supabase
        .from("payment_schedules")
        .select("*")
        .eq("user_id", user.id)
    ]);

    if (historyResult.data) setPaymentHistory(historyResult.data);
    if (schedulesResult.data) setSchedules(schedulesResult.data);
    setIsLoading(false);
  };

  // Calculate monthly payment trends (last 6 months)
  const getMonthlyTrends = () => {
    const months: { [key: string]: { total: number; principal: number; interest: number } } = {};
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const key = format(monthStart, "MMM yyyy");
      months[key] = { total: 0, principal: 0, interest: 0 };
    }

    paymentHistory.forEach((payment) => {
      const monthKey = format(parseISO(payment.payment_date), "MMM yyyy");
      if (months[monthKey]) {
        months[monthKey].total += payment.amount_paid;
        months[monthKey].principal += payment.principal_paid;
        months[monthKey].interest += payment.interest_paid;
      }
    });

    return Object.entries(months).map(([month, data]) => ({
      month,
      total: data.total,
      principal: data.principal,
      interest: data.interest,
    }));
  };

  // Calculate on-time payment percentage
  const getOnTimeStats = () => {
    if (paymentHistory.length === 0) return { onTime: 0, late: 0, percentage: 0 };
    
    let onTime = 0;
    let late = 0;

    paymentHistory.forEach((payment) => {
      const schedule = schedules.find(s => s.id === payment.payment_schedule_id);
      if (schedule) {
        const paymentDate = parseISO(payment.payment_date);
        const dueDate = parseISO(schedule.next_payment_date);
        if (paymentDate <= dueDate) {
          onTime++;
        } else {
          late++;
        }
      } else {
        onTime++; // Assume on-time if no schedule found
      }
    });

    const total = onTime + late;
    return {
      onTime,
      late,
      percentage: total > 0 ? Math.round((onTime / total) * 100) : 100,
    };
  };

  // Payment breakdown by type
  const getPaymentBreakdown = () => {
    const totalPrincipal = paymentHistory.reduce((sum, p) => sum + p.principal_paid, 0);
    const totalInterest = paymentHistory.reduce((sum, p) => sum + p.interest_paid, 0);
    
    return [
      { name: "Principal", value: totalPrincipal, color: "hsl(var(--primary))" },
      { name: "Interest", value: totalInterest, color: "hsl(var(--muted-foreground))" },
    ];
  };

  // Summary statistics
  const getSummaryStats = () => {
    const totalPaid = paymentHistory.reduce((sum, p) => sum + p.amount_paid, 0);
    const totalRemaining = schedules.reduce((sum, s) => sum + s.remaining_balance, 0);
    const totalLoanAmount = schedules.reduce((sum, s) => sum + s.loan_amount, 0);
    const avgPayment = paymentHistory.length > 0 
      ? totalPaid / paymentHistory.length 
      : 0;

    return { totalPaid, totalRemaining, totalLoanAmount, avgPayment, paymentCount: paymentHistory.length };
  };

  const monthlyTrends = getMonthlyTrends();
  const onTimeStats = getOnTimeStats();
  const paymentBreakdown = getPaymentBreakdown();
  const summaryStats = getSummaryStats();

  const chartConfig = {
    total: { label: "Total", color: "hsl(var(--primary))" },
    principal: { label: "Principal", color: "hsl(var(--chart-1))" },
    interest: { label: "Interest", color: "hsl(var(--chart-2))" },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summaryStats.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.paymentCount} payments made
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Balance</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summaryStats.totalRemaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.totalLoanAmount > 0 
                ? `${Math.round((1 - summaryStats.totalRemaining / summaryStats.totalLoanAmount) * 100)}% paid off`
                : "No active loans"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {onTimeStats.percentage}%
            </div>
            <p className="text-xs text-muted-foreground">
              {onTimeStats.onTime} on-time, {onTimeStats.late} late
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Payment</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summaryStats.avgPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Per payment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Payment Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Payment Trends
            </CardTitle>
            <CardDescription>Last 6 months payment activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="principal" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="interest" stackId="a" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Payment Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Breakdown
            </CardTitle>
            <CardDescription>Principal vs Interest distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              {paymentBreakdown[0].value + paymentBreakdown[1].value > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {paymentBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      formatter={(value: number) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No payment data available yet</p>
                </div>
              )}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-sm">Principal: ${paymentBreakdown[0].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                <span className="text-sm">Interest: ${paymentBreakdown[1].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cumulative Payment Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Progress Over Time</CardTitle>
          <CardDescription>Cumulative payments made</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px]">
            <LineChart 
              data={monthlyTrends.reduce((acc, curr, idx) => {
                const prevTotal = idx > 0 ? acc[idx - 1].cumulative : 0;
                acc.push({ ...curr, cumulative: prevTotal + curr.total });
                return acc;
              }, [] as Array<typeof monthlyTrends[0] & { cumulative: number }>)}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="cumulative" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
