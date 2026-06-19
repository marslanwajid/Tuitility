import dynamic from 'next/dynamic';

export const CALCULATOR_REGISTRY: Record<string, React.ComponentType<any>> = {
  '/math/calculators/fraction-calculator': dynamic(
    () => import('./math/FractionCalculator'),
    { ssr: false }
  ),
  '/math/calculators/percentage-calculator': dynamic(
    () => import('./math/PercentageCalculator'),
    { ssr: false }
  ),
  '/math/calculators/comparing-fractions-calculator': dynamic(
    () => import('./math/ComparingFractionsCalculator'),
    { ssr: false }
  ),
  '/math/calculators/comparing-decimals-calculator': dynamic(
    () => import('./math/ComparingDecimalsCalculator'),
    { ssr: false }
  ),
  '/math/calculators/fraction-to-percent-calculator': dynamic(
    () => import('./math/FractionToPercentCalculator'),
    { ssr: false }
  ),
  '/math/calculators/improper-fraction-to-mixed-calculator': dynamic(
    () => import('./math/ImproperFractionToMixedCalculator'),
    { ssr: false }
  ),
  '/math/calculators/percent-to-fraction-calculator': dynamic(
    () => import('./math/PercentToFractionCalculator'),
    { ssr: false }
  ),
  '/math/calculators/sse-calculator': dynamic(
    () => import('./math/SSECalculator'),
    { ssr: false }
  ),
  '/math/calculators/lcm-calculator': dynamic(
    () => import('./math/LcmCalculator'),
    { ssr: false }
  ),
  '/math/calculators/decimal-to-fraction-calculator': dynamic(
    () => import('./math/DecimalToFractionCalculator'),
    { ssr: false }
  ),
  '/math/calculators/binary-calculator': dynamic(
    () => import('./math/BinaryCalculator'),
    { ssr: false }
  ),
  '/math/calculators/lcd-calculator': dynamic(
    () => import('./math/LcdCalculator'),
    { ssr: false }
  ),
  '/math/calculators/decimal-calculator': dynamic(
    () => import('./math/DecimalCalculator'),
    { ssr: false }
  ),
  '/math/calculators/derivative-calculator': dynamic(
    () => import('./math/DerivativeCalculator'),
    { ssr: false }
  ),
  '/math/calculators/integral-calculator': dynamic(
    () => import('./math/IntegralCalculator'),
    { ssr: false }
  ),
  '/finance/calculators/mortgage-calculator': dynamic(
    () => import('./finance/MortgageCalculator'),
    { ssr: false }
  ),
  '/finance/calculators/amortization-calculator': dynamic(
    () => import('./finance/AmortizationCalculator'),
    { ssr: false }
  ),
  '/finance/calculators/loan-calculator': dynamic(
    () => import('./finance/LoanCalculator'),
    { ssr: false }
  ),
  '/finance/calculators/house-affordability-calculator': dynamic(
    () => import('./finance/HouseAffordabilityCalculator'),
    { ssr: false }
  ),
  '/finance/calculators/compound-interest-calculator': dynamic(
    () => import('./finance/CompoundInterestCalculator'),
    { ssr: false }
  ),
  '/finance/calculators/currency-calculator': dynamic(
    () => import('./finance/CurrencyCalculator'),
    { ssr: false }
  ),
  '/finance/calculators/roi-calculator': dynamic(
    () => import('./finance/ROICalculator'),
    { ssr: false }
  ),
  '/finance/calculators/business-loan-calculator': dynamic(
    () => import('./finance/BusinessLoanCalculator'),
    { ssr: false }
  ),
  '/finance/calculators/credit-card-calculator': dynamic(
    () => import('./finance/CreditCardCalculator'),
    { ssr: false }
  ),
  '/finance/calculators/investment-calculator': dynamic(
    () => import('./finance/InvestmentCalculator'),
    { ssr: false }
  ),
  '/finance/calculators/tax-calculator': dynamic(
    () => import('./finance/TaxCalculator'),
    { ssr: false }
  ),
  '/finance/calculators/retirement-calculator': dynamic(
    () => import('./finance/RetirementCalculator'),
    { ssr: false }
  ),
  '/finance/calculators/sales-tax-calculator': dynamic(
    () => import('./finance/SalesTaxCalculator'),
    { ssr: false }
  ),
  '/finance/calculators/debt-payoff-calculator': dynamic(
    () => import('./finance/DebtPayoffCalculator'),
    { ssr: false }
  ),
  '/finance/calculators/insurance-calculator': dynamic(
    () => import('./finance/InsuranceCalculator'),
    { ssr: false }
  ),
  '/finance/calculators/budget-calculator': dynamic(
    () => import('./finance/BudgetCalculator'),
    { ssr: false }
  ),
  '/finance/calculators/rental-property-calculator': dynamic(
    () => import('./finance/RentalPropertyCalculator'),
    { ssr: false }
  ),
  '/finance/calculators/debt-income-calculator': dynamic(
    () => import('./finance/DebtIncomeCalculator'),
    { ssr: false }
  ),
  '/finance/calculators/down-payment-calculator': dynamic(
    () => import('./finance/DownPaymentCalculator'),
    { ssr: false }
  ),
  '/finance/calculators/present-value-calculator': dynamic(
    () => import('./finance/PresentValueCalculator'),
    { ssr: false }
  ),
  '/finance/calculators/future-value-calculator': dynamic(
    () => import('./finance/FutureValueCalculator'),
    { ssr: false }
  ),
  '/health/calculators/bmi-calculator': dynamic(
    () => import('./health/BMICalculator'),
    { ssr: false }
  ),
  '/health/calculators/calorie-calculator': dynamic(
    () => import('./health/CalorieCalculator'),
    { ssr: false }
  ),
  '/health/calculators/calorie-burn-calculator': dynamic(
    () => import('./health/CalorieBurnCalculator'),
    { ssr: false }
  ),
  '/health/calculators/water-intake-calculator': dynamic(
    () => import('./health/WaterIntakeCalculator'),
    { ssr: false }
  ),
  '/health/calculators/weight-loss-calculator': dynamic(
    () => import('./health/WeightLossCalculator'),
    { ssr: false }
  ),
  '/health/calculators/weight-gain-calculator': dynamic(
    () => import('./health/WeightGainCalculator'),
    { ssr: false }
  ),
  '/health/calculators/body-fat-calculator': dynamic(
    () => import('./health/BodyFatCalculator'),
    { ssr: false }
  ),
  '/health/calculators/ideal-body-weight-calculator': dynamic(
    () => import('./health/IdealWeightCalculator'),
    { ssr: false }
  ),
  '/health/calculators/diabetes-risk-calculator': dynamic(
    () => import('./health/DiabetesRiskCalculator'),
    { ssr: false }
  ),
  '/health/calculators/dri-calculator': dynamic(
    () => import('./health/DRICalculator'),
    { ssr: false }
  ),
  '/health/calculators/bri-calculator': dynamic(
    () => import('./health/BRICalculator'),
    { ssr: false }
  ),
  '/science/calculators/wave-speed-calculator': dynamic(
    () => import('./science/WaveSpeedCalculator'),
    { ssr: false }
  ),
  '/science/calculators/gravity-calculator': dynamic(
    () => import('./science/GravityCalculator'),
    { ssr: false }
  ),
  '/science/calculators/work-power-calculator': dynamic(
    () => import('./science/WorkPowerCalculator'),
    { ssr: false }
  ),
  '/science/calculators/dbm-watts-calculator': dynamic(
    () => import('./science/DBmWattsCalculator'),
    { ssr: false }
  ),
  '/science/calculators/average-atomic-mass-calculator': dynamic(
    () => import('./science/AverageAtomicMassCalculator'),
    { ssr: false }
  ),
  '/science/calculators/dbm-milliwatts-calculator': dynamic(
    () => import('./science/DBmMilliwattsCalculator'),
    { ssr: false }
  ),
  '/science/calculators/capacitance-calculator': dynamic(
    () => import('./science/CapacitanceCalculator'),
    { ssr: false }
  ),
  '/science/calculators/electric-flux-calculator': dynamic(
    () => import('./science/ElectricFluxCalculator'),
    { ssr: false }
  ),
  '/knowledge/calculators/gpa-calculator': dynamic(
    () => import('./knowledge/GPACalculator'),
    { ssr: false }
  ),
  '/knowledge/calculators/age-calculator': dynamic(
    () => import('./knowledge/AgeCalculator'),
    { ssr: false }
  ),
  '/knowledge/calculators/wpm-calculator': dynamic(
    () => import('./knowledge/WPMCalculator'),
    { ssr: false }
  ),
  '/knowledge/calculators/habit-formation-calculator': dynamic(
    () => import('./knowledge/HabitFormationCalculator'),
    { ssr: false }
  ),
  '/knowledge/calculators/language-level-calculator': dynamic(
    () => import('./knowledge/LanguageLevelCalculator'),
    { ssr: false }
  ),
  '/knowledge/calculators/fuel-calculator': dynamic(
    () => import('./knowledge/FuelCalculator'),
    { ssr: false }
  ),
  '/knowledge/calculators/average-time-calculator': dynamic(
    () => import('./knowledge/AverageTimeCalculator'),
    { ssr: false }
  ),
  '/knowledge/calculators/career-assessment-calculator': dynamic(
    () => import('./knowledge/CareerAssessmentCalculator'),
    { ssr: false }
  ),
  '/knowledge/calculators/trauma-assessment-calculator': dynamic(
    () => import('./knowledge/TraumaAssessmentCalculator'),
    { ssr: false }
  ),
  '/knowledge/calculators/anxiety-assessment-calculator': dynamic(
    () => import('./knowledge/AnxietyAssessmentCalculator'),
    { ssr: false }
  ),
  '/knowledge/calculators/mbti-calculator': dynamic(
    () => import('./knowledge/MBTICalculator'),
    { ssr: false }
  ),
  '/knowledge/calculators/carbon-footprint-calculator': dynamic(
    () => import('./knowledge/CarbonFootprintCalculator'),
    { ssr: false }
  ),
  '/knowledge/calculators/zakat-calculator': dynamic(
    () => import('./knowledge/ZakatCalculator'),
    { ssr: false }
  ),
  '/utility-tools/image-tools/image-to-webp-converter': dynamic(
    () => import('./utility/ImageToWebP'),
    { ssr: false }
  ),
  '/utility-tools/image-tools/image-converter': dynamic(
    () => import('./utility/ImageConverter'),
    { ssr: false }
  ),
  '/utility-tools/word-counter': dynamic(
    () => import('./utility/WordCounter'),
    { ssr: false }
  ),
  '/utility-tools/password-generator': dynamic(
    () => import('./utility/PasswordGenerator'),
    { ssr: false }
  ),
  '/utility-tools/qr-code-generator': dynamic(
    () => import('./utility/QRCodeGenerator'),
    { ssr: false }
  ),
  '/utility-tools/ocr-pdf-generator': dynamic(
    () => import('./utility/OcrPdfGenerator'),
    { ssr: false }
  ),
};

export default CALCULATOR_REGISTRY;
