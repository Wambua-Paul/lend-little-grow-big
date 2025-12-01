-- Create payment_schedules table
CREATE TABLE public.payment_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  loan_application_id UUID REFERENCES public.loan_applications(id) ON DELETE SET NULL,
  loan_amount NUMERIC NOT NULL,
  interest_rate NUMERIC NOT NULL,
  loan_term INTEGER NOT NULL,
  monthly_payment NUMERIC NOT NULL,
  start_date DATE NOT NULL,
  next_payment_date DATE NOT NULL,
  total_paid NUMERIC DEFAULT 0,
  remaining_balance NUMERIC NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'defaulted')),
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_days_before INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment_history table
CREATE TABLE public.payment_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payment_schedule_id UUID NOT NULL REFERENCES public.payment_schedules(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  amount_paid NUMERIC NOT NULL,
  principal_paid NUMERIC NOT NULL,
  interest_paid NUMERIC NOT NULL,
  payment_method TEXT,
  transaction_reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.payment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_schedules
CREATE POLICY "Users can view their own payment schedules"
  ON public.payment_schedules
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment schedules"
  ON public.payment_schedules
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment schedules"
  ON public.payment_schedules
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment schedules"
  ON public.payment_schedules
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for payment_history
CREATE POLICY "Users can view their own payment history"
  ON public.payment_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment history"
  ON public.payment_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment history"
  ON public.payment_history
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create updated_at trigger for payment_schedules
CREATE TRIGGER update_payment_schedules_updated_at
  BEFORE UPDATE ON public.payment_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_payment_schedules_user_id ON public.payment_schedules(user_id);
CREATE INDEX idx_payment_schedules_next_payment ON public.payment_schedules(next_payment_date) WHERE status = 'active';
CREATE INDEX idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX idx_payment_history_schedule_id ON public.payment_history(payment_schedule_id);
CREATE INDEX idx_payment_history_payment_date ON public.payment_history(payment_date);