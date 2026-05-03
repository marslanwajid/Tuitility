import React from 'react'
import CategoryPage from '../../components/CategoryPage'

const MathCalculator = () => {
  const mathTools = [
    { name: 'Fraction Calculator', desc: 'Add, subtract, multiply, and divide fractions with simplified answers, decimals, mixed numbers, and step-by-step working. Best paired with LCD, LCM, and fraction comparison tools for full fraction workflows.', url: '/math/calculators/fraction-calculator', category: 'Fractions', icon: 'fas fa-divide' },
    { name: 'Percentage Calculator', desc: 'Solve percentage increase, decrease, reverse percentage, and part-of-total problems with clear step-by-step explanations. Useful before moving into sales tax, discount, and finance percentage scenarios.', url: '/math/calculators/percentage-calculator', category: 'Percentages', icon: 'fas fa-percentage' },
    { name: 'Decimal to Fraction', desc: 'Convert terminating decimals into simplified fractions and mixed numbers for exact math, measurement, and worksheet use, then continue into fraction comparison or percent conversion.', url: '/math/calculators/decimal-to-fraction-calculator', category: 'Conversions', icon: 'fas fa-arrows-alt-h' },
    { name: 'LCM Calculator', desc: 'Find the least common multiple of two or more numbers using multiple methods including prime factorization and GCD-based solving, especially for denominator matching and schedule-based problems.', url: '/math/calculators/lcm-calculator', category: 'Number Theory', icon: 'fas fa-sort-numeric-up' },
    { name: 'Binary Calculator', desc: 'Calculate and convert binary, decimal, hexadecimal, and octal values for arithmetic, logic, and number system practice, then branch into science and computing-focused number conversion tasks.', url: '/math/calculators/binary-calculator', category: 'Number Systems', icon: 'fas fa-1' },
    { name: 'LCD Calculator', desc: 'Find the least common denominator and rewrite fractions as equivalent fractions with a shared denominator for easier solving, ordering, and comparison.', url: '/math/calculators/lcd-calculator', category: 'Number Theory', icon: 'fas fa-sort-numeric-down' },
    { name: 'Compare Fractions', desc: 'Compare fractions, mixed numbers, decimals, and percentages by converting them into a common value with guided steps and cross-format reasoning.', url: '/math/calculators/comparing-fractions-calculator', category: 'Fractions', icon: 'fas fa-balance-scale' },
    { name: 'Decimal Calculator', desc: 'Perform decimal arithmetic, powers, roots, and logarithms with exact output and selectable rounding precision for school math, business math, and general quantitative work.', url: '/math/calculators/decimal-calculator', category: 'Decimals', icon: 'fas fa-calculator' },
    { name: 'Compare Decimals', desc: 'Compare decimal values by place value, check which number is greater, and see the exact difference between them before converting to fractions or percentages when needed.', url: '/math/calculators/comparing-decimals-calculator', category: 'Decimals', icon: 'fas fa-balance-scale' },
    { name: 'Fraction to Percent', desc: 'Convert simple fractions and mixed numbers into percentages and decimals with fully explained conversion steps for grading, ratios, and finance-style percent interpretation.', url: '/math/calculators/fraction-to-percent-calculator', category: 'Conversions', icon: 'fas fa-percentage' },
    { name: 'Percent to Fraction', desc: 'Turn whole and decimal percentages into simplified fractions using exact conversion logic and GCD-based reduction, especially for algebra and probability work.', url: '/math/calculators/percent-to-fraction-calculator', category: 'Conversions', icon: 'fas fa-percentage' },
    { name: 'SSE Calculator', desc: 'Calculate sum of squared errors for actual and predicted values to evaluate model accuracy in statistics, regression, and machine learning study.', url: '/math/calculators/sse-calculator', category: 'Statistics', icon: 'fas fa-chart-line' },
    { name: 'Derivative Calculator', desc: 'Differentiate polynomial, trigonometric, exponential, and logarithmic functions with symbolic steps and point evaluation, then move naturally into integrals and science rate-of-change problems.', url: '/math/calculators/derivative-calculator', category: 'Calculus', icon: 'fas fa-function' },
    { name: 'Integral Calculator', desc: 'Solve definite and indefinite integrals with antiderivatives, rules applied, and optional numerical evaluation for area, accumulation, and applied science problems.', url: '/math/calculators/integral-calculator', category: 'Calculus', icon: 'fas fa-integral' },
    { name: 'Improper to Mixed', desc: 'Convert improper fractions into mixed numbers by quotient and remainder with educational step-by-step explanations, then continue into fraction arithmetic and comparison.', url: '/math/calculators/improper-fraction-to-mixed-calculator', category: 'Fractions', icon: 'fas fa-layer-group' }
  ]

  const categories = [
    { id: 'all', name: 'All Tools', icon: 'fas fa-th' },
    { id: 'Fractions', name: 'Fractions', icon: 'fas fa-divide' },
    { id: 'Percentages', name: 'Percentages', icon: 'fas fa-percentage' },
    { id: 'Conversions', name: 'Conversions', icon: 'fas fa-exchange-alt' },
    { id: 'Number Theory', name: 'Number Theory', icon: 'fas fa-sort-numeric-up' },
    { id: 'Number Systems', name: 'Number Systems', icon: 'fas fa-1' },
    { id: 'Decimals', name: 'Decimals', icon: 'fas fa-calculator' },
    { id: 'Statistics', name: 'Statistics', icon: 'fas fa-chart-line' },
    { id: 'Calculus', name: 'Calculus', icon: 'fas fa-function' }
  ]

  return (
    <CategoryPage
      title="Math Calculators"
      description="Explore math calculators for fractions, percentages, decimals, calculus, number systems, statistics, and conversions. Use the category as an internal math hub for linked workflows like fraction to percent, decimal to fraction, LCM to LCD, and derivative to integral solving with step-by-step explanations."
      tools={mathTools}
      categories={categories}
      searchPlaceholder="Search math calculators..."
      baseUrl=""
    />
  )
}

export default MathCalculator 
