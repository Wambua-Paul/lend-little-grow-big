import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export const LoanApplication = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Application Submitted!",
      description: "We'll review your application and contact you within 24-48 hours.",
    });
    
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" required placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" required placeholder="Doe" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" required placeholder="john@business.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" type="tel" required placeholder="+1 (555) 000-0000" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input id="businessName" required placeholder="ABC Company Inc." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type *</Label>
                  <Select required>
                    <SelectTrigger id="businessType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sole">Sole Proprietorship</SelectItem>
                      <SelectItem value="llc">LLC</SelectItem>
                      <SelectItem value="corp">Corporation</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsInBusiness">Years in Business *</Label>
                  <Select required>
                    <SelectTrigger id="yearsInBusiness">
                      <SelectValue placeholder="Select years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">Less than 1 year</SelectItem>
                      <SelectItem value="1-2">1-2 years</SelectItem>
                      <SelectItem value="2-5">2-5 years</SelectItem>
                      <SelectItem value="5+">5+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Requested Loan Amount *</Label>
                  <Select required>
                    <SelectTrigger id="loanAmount">
                      <SelectValue placeholder="Select amount" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                      <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                      <SelectItem value="10000-25000">$10,000 - $25,000</SelectItem>
                      <SelectItem value="25000-50000">$25,000 - $50,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loanPurpose">Loan Purpose *</Label>
                  <Select required>
                    <SelectTrigger id="loanPurpose">
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inventory">Inventory</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="expansion">Business Expansion</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="revenue">Annual Revenue *</Label>
                <Input id="revenue" required placeholder="$100,000" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Additional Details</Label>
                <Textarea
                  id="details"
                  placeholder="Tell us more about your business and how you plan to use the loan..."
                  rows={4}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By submitting this form, you agree to our terms of service and privacy policy.
                Your information is secure and confidential.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
