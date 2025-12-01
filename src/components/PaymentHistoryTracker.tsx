import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, DollarSign, Loader2, Plus } from "lucide-react";
import confetti from "canvas-confetti";

interface PaymentSchedule {
  id: string;
  loan_amount: number;
  monthly_payment: number;
  remaining_balance: number;
}

interface PaymentHistory {
  id: string;
  payment_date: string;
  amount_paid: number;
  principal_paid: number;
  interest_paid: number;
  payment_method: string;
  transaction_reference: string;
  notes: string;
}

export function PaymentHistoryTracker() {
  const [schedules, setSchedules] = useState<PaymentSchedule[]>([]);
  const [history, setHistory] = useState<PaymentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    schedule_id: "",
    amount_paid: "",
    principal_paid: "",
    interest_paid: "",
    payment_method: "",
    transaction_reference: "",
    notes: "",
    payment_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [schedulesResult, historyResult] = await Promise.all([
        supabase
          .from("payment_schedules")
          .select("id, loan_amount, monthly_payment, remaining_balance")
          .eq("user_id", user.id)
          .eq("status", "active"),
        supabase
          .from("payment_history")
          .select("*")
          .eq("user_id", user.id)
          .order("payment_date", { ascending: false }),
      ]);

      if (schedulesResult.error) throw schedulesResult.error;
      if (historyResult.error) throw historyResult.error;

      setSchedules(schedulesResult.data || []);
      setHistory(historyResult.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load payment data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRecording(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const amountPaid = parseFloat(formData.amount_paid);
      const principalPaid = parseFloat(formData.principal_paid);
      const interestPaid = parseFloat(formData.interest_paid);

      // Insert payment history
      const { error: historyError } = await supabase.from("payment_history").insert({
        user_id: user.id,
        payment_schedule_id: formData.schedule_id,
        payment_date: formData.payment_date,
        amount_paid: amountPaid,
        principal_paid: principalPaid,
        interest_paid: interestPaid,
        payment_method: formData.payment_method,
        transaction_reference: formData.transaction_reference,
        notes: formData.notes,
      });

      if (historyError) throw historyError;

      // Update payment schedule
      const schedule = schedules.find(s => s.id === formData.schedule_id);
      if (schedule) {
        const newRemainingBalance = schedule.remaining_balance - principalPaid;
        const newTotalPaid = schedule.loan_amount - newRemainingBalance;

        const nextPaymentDate = new Date(formData.payment_date);
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

        const { error: updateError } = await supabase
          .from("payment_schedules")
          .update({
            total_paid: newTotalPaid,
            remaining_balance: Math.max(0, newRemainingBalance),
            next_payment_date: nextPaymentDate.toISOString().split('T')[0],
            status: newRemainingBalance <= 0 ? 'completed' : 'active',
          })
          .eq("id", formData.schedule_id);

        if (updateError) throw updateError;

        if (newRemainingBalance <= 0) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });

          toast({
            title: "Loan Completed! 🎉",
            description: "Congratulations! You've paid off this loan completely.",
          });
        } else {
          toast({
            title: "Success",
            description: "Payment recorded successfully",
          });
        }
      }

      setFormData({
        schedule_id: "",
        amount_paid: "",
        principal_paid: "",
        interest_paid: "",
        payment_method: "",
        transaction_reference: "",
        notes: "",
        payment_date: new Date().toISOString().split('T')[0],
      });
      setDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRecording(false);
    }
  };

  const totalPaid = history.reduce((sum, h) => sum + h.amount_paid, 0);
  const totalPrincipal = history.reduce((sum, h) => sum + h.principal_paid, 0);
  const totalInterest = history.reduce((sum, h) => sum + h.interest_paid, 0);

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
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                Track all your loan payments and transactions
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={schedules.length === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
                  <DialogDescription>
                    Enter the details of your loan payment
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRecordPayment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="schedule">Payment Schedule</Label>
                    <Select
                      value={formData.schedule_id}
                      onValueChange={(value) => setFormData({ ...formData, schedule_id: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a schedule" />
                      </SelectTrigger>
                      <SelectContent>
                        {schedules.map((schedule) => (
                          <SelectItem key={schedule.id} value={schedule.id}>
                            Loan of KES {schedule.loan_amount.toLocaleString()} (Monthly: KES {schedule.monthly_payment.toFixed(2)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount_paid">Amount Paid (KES)</Label>
                      <Input
                        id="amount_paid"
                        type="number"
                        step="0.01"
                        value={formData.amount_paid}
                        onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payment_date">Payment Date</Label>
                      <Input
                        id="payment_date"
                        type="date"
                        value={formData.payment_date}
                        onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="principal_paid">Principal Paid</Label>
                      <Input
                        id="principal_paid"
                        type="number"
                        step="0.01"
                        value={formData.principal_paid}
                        onChange={(e) => setFormData({ ...formData, principal_paid: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interest_paid">Interest Paid</Label>
                      <Input
                        id="interest_paid"
                        type="number"
                        step="0.01"
                        value={formData.interest_paid}
                        onChange={(e) => setFormData({ ...formData, interest_paid: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment_method">Payment Method</Label>
                    <Input
                      id="payment_method"
                      value={formData.payment_method}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                      placeholder="e.g., M-Pesa, Bank Transfer"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transaction_reference">Transaction Reference</Label>
                    <Input
                      id="transaction_reference"
                      value={formData.transaction_reference}
                      onChange={(e) => setFormData({ ...formData, transaction_reference: e.target.value })}
                      placeholder="e.g., REF123456"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any additional notes..."
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isRecording}>
                    {isRecording ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Recording...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Record Payment
                      </>
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {history.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Total Paid</p>
                  </div>
                  <p className="text-2xl font-bold">
                    KES {totalPaid.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">Principal Paid</p>
                  <p className="text-2xl font-bold text-secondary">
                    KES {totalPrincipal.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">Interest Paid</p>
                  <p className="text-2xl font-bold text-foreground">
                    KES {totalInterest.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payment history yet. Record your first payment to get started.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Interest</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        KES {payment.amount_paid.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        KES {payment.principal_paid.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        KES {payment.interest_paid.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.payment_method || "N/A"}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {payment.transaction_reference || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
