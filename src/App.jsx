import React from 'react'
import { Routes, Route } from 'react-router-dom'
// import './assets/css/tool-components.css'
import Home from './components/Home'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import MathCalculator from './pages/math/MathCalculator'
import FinanceCalculator from './pages/finance/FinanceCalculator'
import ScienceCalculator from './pages/science/ScienceCalculator'
import HealthCalculator from './pages/health/HealthCalculator'
import UtilityTools from './pages/utility/UtilityTools'
import WordCounter from './components/utility/WordCounter'
import PasswordGenerator from './components/utility/PasswordGenerator'
import QRCodeGenerator from './components/utility/QRCodeGenerator'
import OCRPDFGenerator from './components/utility/OCRPDFGenerator'
import MorseCodeTranslator from './components/utility/MorseCodeTranslator'
import HtmlToMarkdownConverter from './components/utility/HtmlToMarkdownConverter'
import GenZTranslator from './components/utility/GenZTranslator'
import EnglishToIPATranslator from './components/utility/EnglishToIPATranslator'
import AudioBitrateConverter from './components/utility/AudioBitrateConverter'
import InstagramReelsDownloader from './components/utility/InstagramReelsDownloader'
import TikTokDownloader from './components/utility/TikTokDownloader'
import QRCodeScanner from './components/utility/QRCodeScanner'
import ImageToWebP from './components/utility/image-tools/ImageToWebP'
import RgbToPantoneConverter from './components/utility/RgbToPantoneConverter'
import GoldWeightConverter from './components/utility/GoldWeightConverter'
import KnowledgeCalculator from './pages/knowledge/KnowledgeCalculator'
import GPACalculator from './components/knowledge/GPACalculator'
import AgeCalculator from './components/knowledge/AgeCalculator'
import WPMCalculator from './components/knowledge/WPMCalculator'
import HabitFormationCalculator from './components/knowledge/HabitFormationCalculator'
import MBTICalculator from './components/knowledge/MBTICalculator'
import LanguageLevelCalculator from './components/knowledge/LanguageLevelCalculator'
import ZakatCalculator from './components/knowledge/ZakatCalculator'
import FuelCalculator from './components/knowledge/FuelCalculator'
import AverageTimeCalculator from './components/knowledge/AverageTimeCalculator'
import CarbonFootprintCalculator from './components/knowledge/CarbonFootprintCalculator'
import CareerAssessmentCalculator from './components/knowledge/CareerAssessmentCalculator'
import TraumaAssessmentCalculator from './components/knowledge/TraumaAssessmentCalculator'
import AnxietyAssessmentCalculator from './components/knowledge/AnxietyAssessmentCalculator'
import FractionCalculator from './components/math/FractionCalculator'
import FractionToPercentCalculator from './components/math/FractionToPercentCalculator'
import BinaryCalculatorTool from './components/tool/BinaryCalculatorTool'
import ComparingDecimalsCalculator from './components/math/ComparingDecimalsCalculator'
import ComparingFractionsCalculator from './components/math/ComparingFractionsCalculator'
import DecimalCalculator from './components/math/DecimalCalculator'
import DecimalToFractionCalculator from './components/math/DecimalToFractionCalculator'
import DerivativeCalculator from './components/math/DerivativeCalculator'
import ImproperFractionToMixedCalculator from './components/math/ImproperFractionToMixedCalculator'
import IntegralCalculator from './components/math/IntegralCalculator'
import PercentageCalculator from './components/math/PercentageCalculator'
import PercentToFractionCalculator from './components/math/PercentToFractionCalculator'
import LCMCalculator from './components/math/LCMCalculator'
import LCDCalculator from './components/math/LCDCalculator'
// import FractionToPercentCalculator from './components/math/FractionToPercentCalculator'
// import PercentToFractionCalculator from './components/math/PercentToFractionCalculator'
import SSECalculator from './components/math/SSECalculator'
import CurrencyCalculator from './components/finance/CurrencyCalculator'
import LoanCalculator from './components/finance/LoanCalculator'
import MortgageCalculator from './components/finance/MortgageCalculator'
import AmortizationCalculator from './components/finance/AmortizationCalculator'
import HouseAffordabilityCalculator from './components/finance/HouseAffordabilityCalculator'
import CompoundInterestCalculator from './components/finance/CompoundInterestCalculator'
import ROICalculator from './components/finance/ROICalculator'
import BusinessLoanCalculator from './components/finance/BusinessLoanCalculator'
import CreditCardCalculator from './components/finance/CreditCardCalculator'
import InvestmentCalculator from './components/finance/InvestmentCalculator'
import TaxCalculator from './components/finance/TaxCalculator'
import RetirementCalculator from './components/finance/RetirementCalculator'
import SalesTaxCalculator from './components/finance/SalesTaxCalculator'
import DebtPayoffCalculator from './components/finance/DebtPayoffCalculator'
import InsuranceCalculator from './components/finance/InsuranceCalculator'
import BudgetCalculator from './components/finance/BudgetCalculator'
import RentalPropertyCalculator from './components/finance/RentalPropertyCalculator'
import DebtIncomeCalculator from './components/finance/DebtIncomeCalculator'
import DownPaymentCalculator from './components/finance/DownPaymentCalculator'
import PresentValueCalculator from './components/finance/PresentValueCalculator'
import FutureValueCalculator from './components/finance/FutureValueCalculator'
import WaveSpeedCalculator from './components/science/WaveSpeedCalculator'
import GravityCalculator from './components/science/GravityCalculator'
import WorkPowerCalculator from './components/science/WorkPowerCalculator'
import DBmWattsCalculator from './components/science/DBmWattsCalculator'
import DBmMilliwattsCalculator from './components/science/DBmMilliwattsCalculator'
import CapacitanceCalculator from './components/science/CapacitanceCalculator'
import ElectricFluxCalculator from './components/science/ElectricFluxCalculator'
import AverageAtomicMassCalculator from './components/science/AverageAtomicMassCalculator'
import BMICalculator from './components/health/BMICalculator'
import BodyFatCalculator from './components/health/BodyFatCalculator'
import IdealWeightCalculator from './components/health/IdealWeightCalculator'
import DiabetesRiskCalculator from './components/health/DiabetesRiskCalculator'
import CalorieBurnCalculator from './components/health/CalorieBurnCalculator'
import DRICalculator from './components/health/DRICalculator'
import BRICalculator from './components/health/BRICalculator'
import CalorieCalculator from './components/health/CalorieCalculator'
import WaterIntakeCalculator from './components/health/WaterIntakeCalculator'
import WeightLossCalculator from './components/health/WeightLossCalculator'
import WeightGainCalculator from './components/health/WeightGainCalculator'
// import CurrencyCalculator from './components/finance/CurrencyCalculator'


const App = () => {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Add more routes here as needed */}
        <Route path="/math" element={<MathCalculator />} />
            <Route path="/math/calculators/binary-calculator" element={<BinaryCalculatorTool />} />
            <Route path="/math/calculators/comparing-decimals-calculator" element={<ComparingDecimalsCalculator />} />
            <Route path="/math/calculators/comparing-fractions-calculator" element={<ComparingFractionsCalculator />} />
            <Route path="/math/calculators/decimal-calculator" element={<DecimalCalculator />} />
            <Route path="/math/calculators/decimal-to-fraction-calculator" element={<DecimalToFractionCalculator />} />
            <Route path="/math/calculators/derivative-calculator" element={<DerivativeCalculator />} />
            <Route path="/math/calculators/fraction-calculator" element={<FractionCalculator />} />
            <Route path="/math/calculators/fraction-to-percent-calculator" element={<FractionToPercentCalculator />} />
            <Route path="/math/calculators/improper-fraction-to-mixed-calculator" element={<ImproperFractionToMixedCalculator />} />
            <Route path="/math/calculators/integral-calculator" element={<IntegralCalculator />} />
            <Route path="/math/calculators/lcd-calculator" element={<LCDCalculator />} />
            <Route path="/math/calculators/lcm-calculator" element={<LCMCalculator />} />
            <Route path="/math/calculators/percentage-calculator" element={<PercentageCalculator />} />
            <Route path="/math/calculators/percent-to-fraction-calculator" element={<PercentToFractionCalculator />} />
            <Route path="/math/calculators/sse-calculator" element={<SSECalculator />} />
        <Route path="/finance" element={<FinanceCalculator />} />
            <Route path="/finance/calculators/currency-calculator" element={<CurrencyCalculator />} />
            <Route path="/finance/calculators/loan-calculator" element={<LoanCalculator />} />
            <Route path="/finance/calculators/mortgage-calculator" element={<MortgageCalculator />} />
            <Route path="/finance/calculators/amortization-calculator" element={<AmortizationCalculator />} />
            <Route path="/finance/calculators/house-affordability-calculator" element={<HouseAffordabilityCalculator />} />
            <Route path="/finance/calculators/compound-interest-calculator" element={<CompoundInterestCalculator />} />
            <Route path="/finance/calculators/roi-calculator" element={<ROICalculator />} />
            <Route path="/finance/calculators/business-loan-calculator" element={<BusinessLoanCalculator />} />
            <Route path="/finance/calculators/credit-card-calculator" element={<CreditCardCalculator />} />
            <Route path="/finance/calculators/investment-calculator" element={<InvestmentCalculator />} />
            <Route path="/finance/calculators/tax-calculator" element={<TaxCalculator />} />
            <Route path="/finance/calculators/retirement-calculator" element={<RetirementCalculator />} />
            <Route path="/finance/calculators/sales-tax-calculator" element={<SalesTaxCalculator />} />
            <Route path="/finance/calculators/debt-payoff-calculator" element={<DebtPayoffCalculator />} />
            <Route path="/finance/calculators/insurance-calculator" element={<InsuranceCalculator />} />
            <Route path="/finance/calculators/budget-calculator" element={<BudgetCalculator />} />
            <Route path="/finance/calculators/rental-property-calculator" element={<RentalPropertyCalculator />} />
            <Route path="/finance/calculators/debt-income-calculator" element={<DebtIncomeCalculator />} />
            <Route path="/finance/calculators/down-payment-calculator" element={<DownPaymentCalculator />} />
            <Route path="/finance/calculators/present-value-calculator" element={<PresentValueCalculator />} />
            <Route path="/finance/calculators/future-value-calculator" element={<FutureValueCalculator />} />
        <Route path="/science" element={<ScienceCalculator />} />
            <Route path="/science/calculators/wave-speed-calculator" element={<WaveSpeedCalculator />} />
            <Route path="/science/calculators/gravity-calculator" element={<GravityCalculator />} />
            <Route path="/science/calculators/work-power-calculator" element={<WorkPowerCalculator />} />
            <Route path="/science/calculators/dbm-watts-calculator" element={<DBmWattsCalculator />} />
            <Route path="/science/calculators/dbm-milliwatts-calculator" element={<DBmMilliwattsCalculator />} />
            <Route path="/science/calculators/capacitance-calculator" element={<CapacitanceCalculator />} />
            <Route path="/science/calculators/electric-flux-calculator" element={<ElectricFluxCalculator />} />
            <Route path="/science/calculators/average-atomic-mass-calculator" element={<AverageAtomicMassCalculator />} />
        
        <Route path="/health" element={<HealthCalculator />} />
            <Route path="/health/calculators/bmi-calculator" element={<BMICalculator />} />
            <Route path="/health/calculators/body-fat-calculator" element={<BodyFatCalculator />} />
            <Route path="/health/calculators/ideal-body-weight-calculator" element={<IdealWeightCalculator />} />
            <Route path="/health/calculators/diabetes-risk-calculator" element={<DiabetesRiskCalculator />} />
            <Route path="/health/calculators/calorie-burn-calculator" element={<CalorieBurnCalculator />} />
            <Route path="/health/calculators/dri-calculator" element={<DRICalculator />} />
            <Route path="/health/calculators/bri-calculator" element={<BRICalculator />} />
            <Route path="/health/calculators/calorie-calculator" element={<CalorieCalculator />} />
            <Route path="/health/calculators/water-intake-calculator" element={<WaterIntakeCalculator />} />
            <Route path="/health/calculators/weight-loss-calculator" element={<WeightLossCalculator />} />
            <Route path="/health/calculators/weight-gain-calculator" element={<WeightGainCalculator />} />
        <Route path="/utility-tools" element={<UtilityTools />} />
            <Route path="/utility-tools/image-tools/image-to-webp-converter" element={<ImageToWebP />} />
            <Route path="/utility-tools/password-generator" element={<PasswordGenerator />} />
            <Route path="/utility-tools/qr-code-generator" element={<QRCodeGenerator />} />
            <Route path="/utility-tools/word-counter" element={<WordCounter />} />
            <Route path="/utility-tools/ocr-pdf-generator" element={<OCRPDFGenerator />} />
            <Route path="/utility-tools/morse-code-translator" element={<MorseCodeTranslator />} />
            <Route path="/utility-tools/html-to-markdown-converter" element={<HtmlToMarkdownConverter />} />
            <Route path="/utility-tools/html-to-markdown-converter" element={<HtmlToMarkdownConverter />} />
            <Route path="/utility-tools/genz-translator" element={<GenZTranslator />} />
            <Route path="/utility-tools/english-to-ipa-translator" element={<EnglishToIPATranslator />} />
            <Route path="/utility-tools/audio-bitrate-converter" element={<AudioBitrateConverter />} />
          <Route path="/utility-tools/converter-tools/reels-downloader" element={<InstagramReelsDownloader />} />
          <Route path="/utility-tools/converter-tools/tiktok-downloader" element={<TikTokDownloader />} />
          <Route path="/utility-tools/converter-tools/qr-code-scanner" element={<QRCodeScanner />} />
          <Route path="/utility-tools/converter-tools/rgb-to-pantone-converter" element={<RgbToPantoneConverter />} />
          <Route path="/utility-tools/converter-tools/gold-precious-metal-weight-converter" element={<GoldWeightConverter />} />
        <Route path="/knowledge" element={<KnowledgeCalculator />} />
            <Route path="/knowledge/calculators/gpa-calculator" element={<GPACalculator />} />
            <Route path="/knowledge/calculators/age-calculator" element={<AgeCalculator />} />
            <Route path="/knowledge/calculators/wpm-calculator" element={<WPMCalculator />} />
            <Route path="/knowledge/calculators/habit-formation-calculator" element={<HabitFormationCalculator />} />
            <Route path="/knowledge/calculators/mbti-calculator" element={<MBTICalculator />} />
            <Route path="/knowledge/calculators/language-level-calculator" element={<LanguageLevelCalculator />} />
            <Route path="/knowledge/calculators/zakat-calculator" element={<ZakatCalculator />} />
            <Route path="/knowledge/calculators/fuel-calculator" element={<FuelCalculator />} />
            <Route path="/knowledge/calculators/average-time-calculator" element={<AverageTimeCalculator />} />
            <Route path="/knowledge/calculators/carbon-footprint-calculator" element={<CarbonFootprintCalculator />} />
            <Route path="/knowledge/calculators/career-assessment-calculator" element={<CareerAssessmentCalculator />} />
            <Route path="/knowledge/calculators/trauma-assessment-calculator" element={<TraumaAssessmentCalculator />} />
            <Route path="/knowledge/calculators/anxiety-assessment-calculator" element={<AnxietyAssessmentCalculator />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App