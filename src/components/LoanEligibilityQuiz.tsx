import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { LOAN_TIERS, LoanTier } from "@/lib/loanTiers";
import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

const quizSchema = z.object({
  businessType: z.string().min(1, "Please select a business type"),
  yearsInBusiness: z.string().min(1, "Please select years in business"),
  monthlyRevenue: z.string().min(1, "Please enter monthly revenue"),
  loanPurpose: z.string().min(1, "Please select a loan purpose"),
  estimatedAmount: z.string().min(1, "Please select an estimated amount"),
});

type QuizFormData = z.infer<typeof quizSchema>;

export const LoanEligibilityQuiz = () => {
  const [step, setStep] = useState(1);
  const [recommendation, setRecommendation] = useState<LoanTier | null>(null);

  const form = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      businessType: "",
      yearsInBusiness: "",
      monthlyRevenue: "",
      loanPurpose: "",
      estimatedAmount: "",
    },
  });

  const calculateRecommendation = (data: QuizFormData): LoanTier => {
    const revenue = parseInt(data.monthlyRevenue);
    const years = parseInt(data.yearsInBusiness);
    const estimatedAmount = parseInt(data.estimatedAmount);

    // Score-based recommendation
    let score = 0;

    // Years in business scoring
    if (years >= 5) score += 3;
    else if (years >= 3) score += 2;
    else if (years >= 1) score += 1;

    // Revenue scoring
    if (revenue >= 500000) score += 3;
    else if (revenue >= 200000) score += 2;
    else if (revenue >= 100000) score += 1;

    // Use estimated amount to find the appropriate tier
    const tierByAmount = LOAN_TIERS.find(
      (tier) => estimatedAmount >= tier.minAmount && estimatedAmount <= tier.maxAmount
    );

    // If score is low, recommend a lower tier for safety
    if (score <= 2 && tierByAmount) {
      const tierIndex = LOAN_TIERS.indexOf(tierByAmount);
      return tierIndex > 0 ? LOAN_TIERS[tierIndex - 1] : LOAN_TIERS[0];
    }

    return tierByAmount || LOAN_TIERS[0];
  };

  const onSubmit = (data: QuizFormData) => {
    const recommendedTier = calculateRecommendation(data);
    setRecommendation(recommendedTier);
    setStep(4);
  };

  const nextStep = async () => {
    const fields = [
      ["businessType"],
      ["yearsInBusiness", "monthlyRevenue"],
      ["loanPurpose", "estimatedAmount"],
    ];

    const isValid = await form.trigger(fields[step - 1] as any);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const resetQuiz = () => {
    setStep(1);
    setRecommendation(null);
    form.reset();
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section className="py-20 px-4 bg-muted/50">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Find Your Perfect Loan Tier
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Answer a few questions about your business and we'll recommend the best loan tier for your needs
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step < 4 ? `Step ${step} of 3` : "Your Recommendation"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Tell us about your business"}
              {step === 2 && "Share your business performance"}
              {step === 3 && "What are you looking for?"}
              {step === 4 && "Based on your answers, here's what we recommend"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step < 4 ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {step === 1 && (
                    <FormField
                      control={form.control}
                      name="businessType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your business type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="retail">Retail</SelectItem>
                              <SelectItem value="manufacturing">Manufacturing</SelectItem>
                              <SelectItem value="services">Services</SelectItem>
                              <SelectItem value="agriculture">Agriculture</SelectItem>
                              <SelectItem value="technology">Technology</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {step === 2 && (
                    <>
                      <FormField
                        control={form.control}
                        name="yearsInBusiness"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Years in Business</FormLabel>
                            <FormControl>
                              <RadioGroup onValueChange={field.onChange} value={field.value}>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="0" id="years-0" />
                                  <label htmlFor="years-0" className="cursor-pointer">Less than 1 year</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="1" id="years-1" />
                                  <label htmlFor="years-1" className="cursor-pointer">1-2 years</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="3" id="years-3" />
                                  <label htmlFor="years-3" className="cursor-pointer">3-4 years</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="5" id="years-5" />
                                  <label htmlFor="years-5" className="cursor-pointer">5+ years</label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="monthlyRevenue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Average Monthly Revenue (KES)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g., 150000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <FormField
                        control={form.control}
                        name="loanPurpose"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Loan Purpose</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="What will you use the loan for?" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="working_capital">Working Capital</SelectItem>
                                <SelectItem value="equipment">Equipment Purchase</SelectItem>
                                <SelectItem value="expansion">Business Expansion</SelectItem>
                                <SelectItem value="inventory">Inventory</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="estimatedAmount"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Estimated Loan Amount Needed</FormLabel>
                            <FormControl>
                              <RadioGroup onValueChange={field.onChange} value={field.value}>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="25000" id="amount-1" />
                                  <label htmlFor="amount-1" className="cursor-pointer">KES 1,000 - 50,000</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="125000" id="amount-2" />
                                  <label htmlFor="amount-2" className="cursor-pointer">KES 50,001 - 200,000</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="350000" id="amount-3" />
                                  <label htmlFor="amount-3" className="cursor-pointer">KES 200,001 - 500,000</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="750000" id="amount-4" />
                                  <label htmlFor="amount-4" className="cursor-pointer">KES 500,001 - 1,000,000</label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <div className="flex justify-between pt-4">
                    {step > 1 && (
                      <Button type="button" variant="outline" onClick={prevStep}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Previous
                      </Button>
                    )}
                    {step < 3 ? (
                      <Button type="button" onClick={nextStep} className="ml-auto">
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button type="submit" className="ml-auto">
                        Get Recommendation
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            ) : (
              recommendation && (
                <div className="space-y-6">
                  <div className="text-center">
                    <Badge className="mb-4 bg-primary">Recommended for You</Badge>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      {recommendation.name}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {recommendation.description}
                    </p>
                  </div>

                  <div className="bg-muted rounded-lg p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Interest Rate</p>
                        <p className="text-2xl font-bold text-primary">
                          {recommendation.interestRate}% <span className="text-sm font-normal">APR</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Loan Range</p>
                        <p className="text-sm font-semibold">
                          {formatAmount(recommendation.minAmount)} - {formatAmount(recommendation.maxAmount)}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t space-y-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Flexible Terms</p>
                          <p className="text-sm text-muted-foreground">
                            {recommendation.availableTerms.join(", ")} months
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Quick Approval</p>
                          <p className="text-sm text-muted-foreground">
                            24-48 hours processing time
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Transparent Pricing</p>
                          <p className="text-sm text-muted-foreground">
                            No hidden fees or charges
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={resetQuiz} variant="outline" className="flex-1">
                      Retake Quiz
                    </Button>
                    <Button className="flex-1" onClick={() => {
                      const applicationSection = document.getElementById('loan-application');
                      applicationSection?.scrollIntoView({ behavior: 'smooth' });
                    }}>
                      Apply Now
                    </Button>
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
