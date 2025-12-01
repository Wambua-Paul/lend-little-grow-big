import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Bell, BellOff, Calendar, DollarSign, Loader2, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentSchedule {
  id: string;
  loan_amount: number;
  interest_rate: number;
  loan_term: number;
  monthly_payment: number;
  start_date: string;
  next_payment_date: string;
  total_paid: number;
  remaining_balance: number;
  status: string;
  reminder_enabled: boolean;
  reminder_days_before: number;
}

export function PaymentScheduleManager() {
  const [schedules, setSchedules] = useState<PaymentSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    loan_amount: "",
    interest_rate: "",
    loan_term: "",
    start_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("payment_schedules")
        .select("*")
        .eq("user_id", user.id)
        .order("next_payment_date", { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load payment schedules",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMonthlyPayment = (principal: number, annualRate: number, months: number) => {
    const monthlyRate = annualRate / 100 / 12;
    return (
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1)
    );
  };

  const calculateNextPaymentDate = (startDate: string) => {
    const start = new Date(startDate);
    start.setMonth(start.getMonth() + 1);
    return start.toISOString().split('T')[0];
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const loanAmount = parseFloat(formData.loan_amount);
      const interestRate = parseFloat(formData.interest_rate);
      const loanTerm = parseInt(formData.loan_term);

      const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanTerm);
      const nextPaymentDate = calculateNextPaymentDate(formData.start_date);

      const { error } = await supabase.from("payment_schedules").insert({
        user_id: user.id,
        loan_amount: loanAmount,
        interest_rate: interestRate,
        loan_term: loanTerm,
        monthly_payment: monthlyPayment,
        start_date: formData.start_date,
        next_payment_date: nextPaymentDate,
        remaining_balance: loanAmount,
        status: "active",
        reminder_enabled: true,
        reminder_days_before: 3,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment schedule created successfully",
      });

      setFormData({
        loan_amount: "",
        interest_rate: "",
        loan_term: "",
        start_date: new Date().toISOString().split('T')[0],
      });
      setShowForm(false);
      fetchSchedules();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleReminder = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from("payment_schedules")
        .update({ reminder_enabled: !currentValue })
        .eq("id", id);

      if (error) throw error;

      setSchedules(schedules.map(s => 
        s.id === id ? { ...s, reminder_enabled: !currentValue } : s
      ));

      toast({
        title: "Success",
        description: `Reminders ${!currentValue ? 'enabled' : 'disabled'}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update reminder settings",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment schedule?")) return;

    try {
      const { error } = await supabase
        .from("payment_schedules")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setSchedules(schedules.filter(s => s.id !== id));
      toast({
        title: "Success",
        description: "Payment schedule deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "completed":
        return "bg-blue-500";
      case "defaulted":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getDaysUntilPayment = (nextPaymentDate: string) => {
    const today = new Date();
    const paymentDate = new Date(nextPaymentDate);
    const diffTime = paymentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Payment Schedules</CardTitle>
              <CardDescription>
                Manage your loan payment schedules and reminders
              </CardDescription>
            </div>
            {!showForm && (
              <Button onClick={() => setShowForm(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Schedule
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleCreate} className="space-y-4 mb-6 p-4 border rounded-lg bg-muted/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loan_amount">Loan Amount (KES)</Label>
                  <Input
                    id="loan_amount"
                    type="number"
                    value={formData.loan_amount}
                    onChange={(e) => setFormData({ ...formData, loan_amount: e.target.value })}
                    placeholder="100000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interest_rate">Annual Interest Rate (%)</Label>
                  <Input
                    id="interest_rate"
                    type="number"
                    step="0.1"
                    value={formData.interest_rate}
                    onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                    placeholder="10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loan_term">Loan Term (months)</Label>
                  <Input
                    id="loan_term"
                    type="number"
                    value={formData.loan_term}
                    onChange={(e) => setFormData({ ...formData, loan_term: e.target.value })}
                    placeholder="12"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Schedule"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {schedules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payment schedules yet. Add one to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => {
                const daysUntil = getDaysUntilPayment(schedule.next_payment_date);
                const isUpcoming = daysUntil <= schedule.reminder_days_before && daysUntil >= 0;

                return (
                  <Card key={schedule.id} className={isUpcoming ? "border-primary" : ""}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(schedule.status)}>
                              {schedule.status.toUpperCase()}
                            </Badge>
                            {isUpcoming && schedule.reminder_enabled && (
                              <Badge variant="outline" className="text-primary">
                                Payment Due in {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {schedule.loan_term} month loan at {schedule.interest_rate}% APR
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(schedule.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Loan Amount</p>
                          <p className="text-sm font-semibold">
                            KES {schedule.loan_amount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Monthly Payment</p>
                          <p className="text-sm font-semibold">
                            KES {schedule.monthly_payment.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Remaining Balance</p>
                          <p className="text-sm font-semibold">
                            KES {schedule.remaining_balance.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Next Payment</p>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <p className="text-sm font-semibold">
                              {new Date(schedule.next_payment_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                          {schedule.reminder_enabled ? (
                            <Bell className="h-4 w-4 text-primary" />
                          ) : (
                            <BellOff className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm text-muted-foreground">
                            Reminders {schedule.reminder_days_before} days before payment
                          </span>
                        </div>
                        <Switch
                          checked={schedule.reminder_enabled}
                          onCheckedChange={() => handleToggleReminder(schedule.id, schedule.reminder_enabled)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {schedules.some(s => {
        const days = getDaysUntilPayment(s.next_payment_date);
        return days <= s.reminder_days_before && days >= 0 && s.reminder_enabled;
      }) && (
        <Alert className="border-primary bg-primary/5">
          <Bell className="h-4 w-4 text-primary" />
          <AlertDescription>
            You have upcoming payments! Make sure to complete them on time to avoid late fees.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
