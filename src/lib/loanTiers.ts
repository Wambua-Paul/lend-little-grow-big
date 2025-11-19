export type LoanTier = {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  interestRate: number;
  availableTerms: number[];
  description: string;
};

export const LOAN_TIERS: LoanTier[] = [
  {
    id: "micro",
    name: "Micro Loan",
    minAmount: 1000,
    maxAmount: 50000,
    interestRate: 12,
    availableTerms: [6, 12],
    description: "Perfect for small business needs and quick cash flow solutions",
  },
  {
    id: "small",
    name: "Small Loan",
    minAmount: 50001,
    maxAmount: 200000,
    interestRate: 10.5,
    availableTerms: [6, 12, 24],
    description: "Ideal for business expansion and moderate investments",
  },
  {
    id: "medium",
    name: "Medium Loan",
    minAmount: 200001,
    maxAmount: 500000,
    interestRate: 9.5,
    availableTerms: [12, 24, 36],
    description: "Suitable for significant business growth and equipment purchases",
  },
  {
    id: "large",
    name: "Large Loan",
    minAmount: 500001,
    maxAmount: 1000000,
    interestRate: 8.5,
    availableTerms: [12, 24, 36],
    description: "For major business investments and large-scale operations",
  },
];

export const getLoanTier = (amount: number): LoanTier => {
  return (
    LOAN_TIERS.find(
      (tier) => amount >= tier.minAmount && amount <= tier.maxAmount
    ) || LOAN_TIERS[0]
  );
};
