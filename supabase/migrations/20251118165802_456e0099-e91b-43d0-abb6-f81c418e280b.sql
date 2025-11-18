-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create loan status enum
CREATE TYPE public.loan_status AS ENUM (
  'pending',
  'under_review',
  'approved',
  'rejected',
  'disbursed',
  'completed'
);

-- Create loan applications table
CREATE TABLE public.loan_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Business Information
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  business_address TEXT NOT NULL,
  business_registration TEXT,
  years_in_business NUMERIC NOT NULL,
  monthly_revenue NUMERIC NOT NULL,
  
  -- Loan Details
  loan_amount NUMERIC NOT NULL,
  loan_purpose TEXT NOT NULL,
  requested_term INTEGER NOT NULL,
  
  -- Status Tracking
  status public.loan_status NOT NULL DEFAULT 'pending',
  status_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on loan_applications
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for loan_applications
CREATE POLICY "Users can view their own applications"
  ON public.loan_applications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications"
  ON public.loan_applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending applications"
  ON public.loan_applications
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger for profiles updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for loan_applications updated_at
CREATE TRIGGER set_loan_applications_updated_at
  BEFORE UPDATE ON public.loan_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();