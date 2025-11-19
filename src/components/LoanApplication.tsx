import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export const LoanApplication = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    businessAddress: "",
    businessRegistration: "",
    yearsInBusiness: "",
    monthlyRevenue: "",
    loanAmount: "",
    loanPurpose: "",
    requestedTerm: "",
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit a loan application.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("loan_applications").insert({
        user_id: user.id,
        business_name: formData.businessName,
        business_type: formData.businessType,
        business_address: formData.businessAddress,
        business_registration: formData.businessRegistration || null,
        years_in_business: parseFloat(formData.yearsInBusiness),
        monthly_revenue: parseFloat(formData.monthlyRevenue),
        loan_amount: parseFloat(formData.loanAmount),
        loan_purpose: formData.loanPurpose,
        requested_term: parseInt(formData.requestedTerm),
      });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "We'll review your application and contact you within 24-48 hours.",
      });

      setFormData({
        businessName: "",
        businessType: "",
        businessAddress: "",
        businessRegistration: "",
        yearsInBusiness: "",
        monthlyRevenue: "",
        loanAmount: "",
        loanPurpose: "",
        requestedTerm: "",
      });

      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="apply" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Apply for a Loan
          </h2>
          <p className="text-muted-foreground">
            Fill out the form below to start your loan application
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Business Loan Application</CardTitle>
            <CardDescription>
              Please provide accurate information to help us process your application quickly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  required
                  placeholder="ABC Company Inc."
                  value={formData.businessName}
                  onChange={(e) => handleInputChange("businessName", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type *</Label>
                  <Select
                    required
                    value={formData.businessType}
                    onValueChange={(value) => handleInputChange("businessType", value)}
                  >
                    <SelectTrigger id="businessType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                      <SelectItem value="LLC">LLC</SelectItem>
                      <SelectItem value="Corporation">Corporation</SelectItem>
                      <SelectItem value="Partnership">Partnership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsInBusiness">Years in Business *</Label>
                  <Select
                    required
                    value={formData.yearsInBusiness}
                    onValueChange={(value) => handleInputChange("yearsInBusiness", value)}
                  >
                    <SelectTrigger id="yearsInBusiness">
                      <SelectValue placeholder="Select years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">Less than 1 year</SelectItem>
                      <SelectItem value="1.5">1-2 years</SelectItem>
                      <SelectItem value="3.5">2-5 years</SelectItem>
                      <SelectItem value="7">5+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessAddress">Business Address *</Label>
                <Input
                  id="businessAddress"
                  required
                  placeholder="123 Main St, City, State"
                  value={formData.businessAddress}
                  onChange={(e) => handleInputChange("businessAddress", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Business Registration Number</Label>
                <Input
                  id="registrationNumber"
                  placeholder="Optional"
                  value={formData.businessRegistration}
                  onChange={(e) => handleInputChange("businessRegistration", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyRevenue">Monthly Revenue (KES) *</Label>
                <Input
                  id="monthlyRevenue"
                  type="number"
                  required
                  placeholder="50000"
                  min="0"
                  value={formData.monthlyRevenue}
                  onChange={(e) => handleInputChange("monthlyRevenue", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Requested Loan Amount (KES) *</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    required
                    placeholder="25000"
                    min="1000"
                    max="500000"
                    value={formData.loanAmount}
                    onChange={(e) => handleInputChange("loanAmount", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loanTerm">Loan Term *</Label>
                  <Select
                    required
                    value={formData.requestedTerm}
                    onValueChange={(value) => handleInputChange("requestedTerm", value)}
                  >
                    <SelectTrigger id="loanTerm">
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                      <SelectItem value="24">24 months</SelectItem>
                      <SelectItem value="36">36 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="loanPurpose">Loan Purpose *</Label>
                <Textarea
                  id="loanPurpose"
                  required
                  placeholder="Describe how you plan to use the loan funds..."
                  className="min-h-[100px]"
                  value={formData.loanPurpose}
                  onChange={(e) => handleInputChange("loanPurpose", e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
