// Tool helpers for managing related tools by category

export const getRelatedTools = (toolCategory) => {
  const mathTools = [
    { name: "Fraction Calculator", icon: "fas fa-divide", link: "/math/calculators/fraction-calculator" },
    { name: "Binary Calculator", icon: "fas fa-calculator", link: "/math/calculators/binary-calculator" },
    { name: "Decimal Calculator", icon: "fas fa-calculator", link: "/math/calculators/decimal-calculator" },
    { name: "Percentage Calculator", icon: "fas fa-percent", link: "/math/calculators/percentage-calculator" },
    { name: "Decimal to Fraction", icon: "fas fa-exchange-alt", link: "/math/calculators/decimal-to-fraction-calculator" },
    { name: "LCM Calculator", icon: "fas fa-sort-numeric-up", link: "/math/calculators/lcm-calculator" },
    { name: "LCD Calculator", icon: "fas fa-sort-numeric-down", link: "/math/calculators/lcd-calculator" },
    { name: "Compare Fractions", icon: "fas fa-balance-scale", link: "/math/calculators/comparing-fractions-calculator" }
  ];

  const financeTools = [
            { name: "Mortgage Calculator", icon: "fas fa-home", link: "/finance/calculators/mortgage-calculator" },
    { name: "Loan Calculator", icon: "fas fa-hand-holding-usd", link: "/finance/calculators/loan-calculator" },
            { name: "Currency Converter", icon: "fas fa-exchange-alt", link: "/finance/calculators/currency-calculator" },
        { name: "House Affordability Calculator", icon: "fas fa-home", link: "/finance/calculators/house-affordability-calculator" },
        { name: "Compound Interest Calculator", icon: "fas fa-chart-area", link: "/finance/calculators/compound-interest-calculator" },
        { name: "ROI Calculator", icon: "fas fa-chart-line", link: "/finance/calculators/roi-calculator" },
        { name: "Credit Card Calculator", icon: "fas fa-credit-card", link: "/finance/calculators/credit-card-calculator" },
        { name: "Investment Calculator", icon: "fas fa-chart-line", link: "/finance/calculators/investment-calculator" },
        { name: "Tax Calculator", icon: "fas fa-file-invoice-dollar", link: "/finance/calculators/tax-calculator" },
        { name: "Retirement Calculator", icon: "fas fa-piggy-bank", link: "/finance/calculators/retirement-calculator" },
        { name: "Sales Tax Calculator", icon: "fas fa-receipt", link: "/finance/calculators/sales-tax-calculator" },
        { name: "Debt Payoff Calculator", icon: "fas fa-credit-card", link: "/finance/calculators/debt-payoff-calculator" },
        { name: "Insurance Calculator", icon: "fas fa-shield-alt", link: "/finance/calculators/insurance-calculator" },
        { name: "Budget Calculator", icon: "fas fa-calculator", link: "/finance/calculators/budget-calculator" },
        { name: "Rental Property Calculator", icon: "fas fa-home", link: "/finance/calculators/rental-property-calculator" },
        { name: "Debt Income Calculator", icon: "fas fa-balance-scale", link: "/finance/calculators/debt-income-calculator" },
        { name: "Down Payment Calculator", icon: "fas fa-home", link: "/finance/calculators/down-payment-calculator" },
        { name: "Present Value Calculator", icon: "fas fa-chart-line", link: "/finance/calculators/present-value-calculator" },
        { name: "Future Value Calculator", icon: "fas fa-chart-line", link: "/finance/calculators/future-value-calculator" }
  ];

  const scienceTools = [
    { name: "Gravity Calculator", icon: "fas fa-globe", link: "/science/calculators/gravity-calculator" },
    { name: "Work Power Calculator", icon: "fas fa-cogs", link: "/science/calculators/work-power-calculator" },
    { name: "DBm Watts Calculator", icon: "fas fa-bolt", link: "/science/calculators/dbm-watts-calculator" },
    { name: "DBm to Milliwatts Calculator", icon: "fas fa-broadcast-tower", link: "/science/calculators/dbm-milliwatts-calculator" },
    { name: "Capacitance Calculator", icon: "fas fa-microchip", link: "/science/calculators/capacitance-calculator" },
    { name: "Electric Flux Calculator", icon: "fas fa-lightning", link: "/science/calculators/electric-flux-calculator" },
    { name: "Average Atomic Mass Calculator", icon: "fas fa-atom", link: "/science/calculators/average-atomic-mass-calculator" },
    { name: "Wave Speed Calculator", icon: "fas fa-wave-square", link: "/science/calculators/wave-speed-calculator" },
    { name: "Unit Converter", icon: "fas fa-ruler", link: "/science/unit-converter" },
    { name: "Scientific Calculator", icon: "fas fa-calculator", link: "/science/scientific-calculator" },
    { name: "Physics Calculator", icon: "fas fa-atom", link: "/science/physics-calculator" },
    { name: "Chemistry Calculator", icon: "fas fa-flask", link: "/science/chemistry-calculator" }
  ];

  const healthTools = [
    { name: "BMI Calculator", icon: "fas fa-weight", link: "/health/calculators/bmi-calculator" },
    { name: "Calorie Calculator", icon: "fas fa-apple-alt", link: "/health/calculators/calorie-calculator" },
    { name: "Body Fat Calculator", icon: "fas fa-user", link: "/health/calculators/body-fat-calculator" },
    { name: "Water Intake Calculator", icon: "fas fa-tint", link: "/health/calculators/water-intake-calculator" },
    { name: "Weight Loss Calculator", icon: "fas fa-chart-line", link: "/health/calculators/weight-loss-calculator" },
    { name: "Weight Gain Calculator", icon: "fas fa-chart-line", link: "/health/calculators/weight-gain-calculator" },
    { name: "Ideal Weight Calculator", icon: "fas fa-balance-scale", link: "/health/calculators/ideal-body-weight-calculator" },
    { name: "Diabetes Risk Calculator", icon: "fas fa-chart-pie", link: "/health/calculators/diabetes-risk-calculator" }
  ];

  const utilityTools = [
    { name: "Text Tools", icon: "fas fa-font", link: "/utility-tools/text-tools" },
    { name: "Color Converter", icon: "fas fa-palette", link: "/utility-tools/color-converter" },
    { name: "Date Calculator", icon: "fas fa-calendar", link: "/utility-tools/date-calculator" },
    { name: "Password Generator", icon: "fas fa-key", link: "/utility-tools/password-generator" }
  ];

  const knowledgeTools = [
    { name: "Age Calculator", icon: "fas fa-birthday-cake", link: "/knowledge/age-calculator" },
    { name: "Time Calculator", icon: "fas fa-clock", link: "/knowledge/time-calculator" },
    { name: "Distance Calculator", icon: "fas fa-road", link: "/knowledge/distance-calculator" },
    { name: "Speed Calculator", icon: "fas fa-tachometer-alt", link: "/knowledge/speed-calculator" }
  ];

  switch (toolCategory) {
    case 'math':
      return mathTools;
    case 'finance':
      return financeTools;
    case 'science':
      return scienceTools;
    case 'health':
      return healthTools;
    case 'utility':
      return utilityTools;
    case 'knowledge':
      return knowledgeTools;
    default:
      return [];
  }
}; 