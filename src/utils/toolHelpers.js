// Tool helpers for managing related tools by category

export const getRelatedTools = (toolCategory) => {
  const mathTools = [
    { name: "Fraction Calculator", icon: "fas fa-divide", link: "/math/calculators/fraction-calculator" },
    { name: "Fraction to Percent Calculator", icon: "fas fa-percentage", link: "/math/calculators/fraction-to-percent-calculator" },
    { name: "Binary Calculator", icon: "fas fa-calculator", link: "/math/calculators/binary-calculator" },
    { name: "Decimal Calculator", icon: "fas fa-calculator", link: "/math/calculators/decimal-calculator" },
    { name: "Percentage Calculator", icon: "fas fa-percent", link: "/math/calculators/percentage-calculator" },
    { name: "Decimal to Fraction", icon: "fas fa-exchange-alt", link: "/math/calculators/decimal-to-fraction-calculator" },
    { name: "LCM Calculator", icon: "fas fa-sort-numeric-up", link: "/math/calculators/lcm-calculator" },
    { name: "LCD Calculator", icon: "fas fa-sort-numeric-down", link: "/math/calculators/lcd-calculator" },
    { name: "Comparing Decimals", icon: "fas fa-balance-scale", link: "/math/calculators/comparing-decimals-calculator" },
    { name: "Compare Fractions", icon: "fas fa-balance-scale", link: "/math/calculators/comparing-fractions-calculator" }
  ];

  const financeTools = [
    { name: "Mortgage Calculator", icon: "fas fa-home", link: "/finance/mortgage-calculator" },
    { name: "Loan Calculator", icon: "fas fa-hand-holding-usd", link: "/finance/loan-calculator" },
    { name: "Currency Converter", icon: "fas fa-exchange-alt", link: "/finance/currency-calculator" },
    { name: "Compound Interest", icon: "fas fa-chart-area", link: "/finance/compound-interest-calculator" },
    { name: "ROI Calculator", icon: "fas fa-trending-up", link: "/finance/roi-calculator" }
  ];

  const scienceTools = [
    { name: "Unit Converter", icon: "fas fa-ruler", link: "/science/unit-converter" },
    { name: "Scientific Calculator", icon: "fas fa-calculator", link: "/science/scientific-calculator" },
    { name: "Physics Calculator", icon: "fas fa-atom", link: "/science/physics-calculator" },
    { name: "Chemistry Calculator", icon: "fas fa-flask", link: "/science/chemistry-calculator" }
  ];

  const healthTools = [
    { name: "BMI Calculator", icon: "fas fa-weight", link: "/health/bmi-calculator" },
    { name: "Calorie Calculator", icon: "fas fa-fire", link: "/health/calorie-calculator" },
    { name: "Body Fat Calculator", icon: "fas fa-user", link: "/health/body-fat-calculator" },
    { name: "Heart Rate Calculator", icon: "fas fa-heartbeat", link: "/health/heart-rate-calculator" }
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