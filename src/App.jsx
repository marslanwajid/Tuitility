import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
// import './assets/css/tool-components.css'
import Home from './components/Home'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import SeoManager from './components/SeoManager'
import StaticPage from './components/StaticPage'
import AboutPage from './components/AboutPage'
import CookieBanner from './components/CookieBanner'
import ContactPage from './components/ContactPage'
import PrivacyPolicyPage from './components/PrivacyPolicyPage'
import TermsPage from './components/TermsPage'

// Lazily import pages
const MathCalculator = lazy(() => import('./pages/math/MathCalculator'))
const FinanceCalculator = lazy(() => import('./pages/finance/FinanceCalculator'))
const ScienceCalculator = lazy(() => import('./pages/science/ScienceCalculator'))
const HealthCalculator = lazy(() => import('./pages/health/HealthCalculator'))
const UtilityTools = lazy(() => import('./pages/utility/UtilityTools'))
const KnowledgeCalculator = lazy(() => import('./pages/knowledge/KnowledgeCalculator'))

// Lazily import utility tools
const WordCounter = lazy(() => import('./components/utility/WordCounter'))
const PasswordGenerator = lazy(() => import('./components/utility/PasswordGenerator'))
const QRCodeGenerator = lazy(() => import('./components/utility/QRCodeGenerator'))
const OCRPDFGenerator = lazy(() => import('./components/utility/OCRPDFGenerator'))
const MorseCodeTranslator = lazy(() => import('./components/utility/MorseCodeTranslator'))
const HtmlToMarkdownConverter = lazy(() => import('./components/utility/HtmlToMarkdownConverter'))
const GenZTranslator = lazy(() => import('./components/utility/GenZTranslator'))
const EnglishToIPATranslator = lazy(() => import('./components/utility/EnglishToIPATranslator'))
const AudioBitrateConverter = lazy(() => import('./components/utility/AudioBitrateConverter'))
const InstagramReelsDownloader = lazy(() => import('./components/utility/InstagramReelsDownloader'))
const TikTokDownloader = lazy(() => import('./components/utility/TikTokDownloader'))
const QRCodeScanner = lazy(() => import('./components/utility/QRCodeScanner'))
const ImageToWebP = lazy(() => import('./components/utility/image-tools/ImageToWebP'))
const AspectRatioConverter = lazy(() => import('./components/utility/image-tools/AspectRatioConverter'))
const ColorBlindnessSimulator = lazy(() => import('./components/utility/image-tools/ColorBlindnessSimulator'))
const RgbToPantoneConverter = lazy(() => import('./components/utility/RgbToPantoneConverter'))
const RgbToHexConverter = lazy(() => import('./components/utility/converter-tools/RgbToHexConverter'))
const GoldWeightConverter = lazy(() => import('./components/utility/GoldWeightConverter'))
const PdfToImageConverter = lazy(() => import('./components/utility/converter-tools/PdfToImageConverter'))
const PdfMerger = lazy(() => import('./components/utility/converter-tools/PdfMerger'))
const DeletePdfPages = lazy(() => import('./components/utility/converter-tools/DeletePdfPages'))
const PdfSplitter = lazy(() => import('./components/utility/converter-tools/PdfSplitter'))
const PdfOrganizer = lazy(() => import('./components/utility/converter-tools/PdfOrganizer'))
const TextCaseConverter = lazy(() => import('./components/utility/converter-tools/TextCaseConverter'))

// Lazily import knowledge calculators
const GPACalculator = lazy(() => import('./components/knowledge/GPACalculator'))
const AgeCalculator = lazy(() => import('./components/knowledge/AgeCalculator'))
const WPMCalculator = lazy(() => import('./components/knowledge/WPMCalculator'))
const HabitFormationCalculator = lazy(() => import('./components/knowledge/HabitFormationCalculator'))
const MBTICalculator = lazy(() => import('./components/knowledge/MBTICalculator'))
const LanguageLevelCalculator = lazy(() => import('./components/knowledge/LanguageLevelCalculator'))
const ZakatCalculator = lazy(() => import('./components/knowledge/ZakatCalculator'))
const FuelCalculator = lazy(() => import('./components/knowledge/FuelCalculator'))
const AverageTimeCalculator = lazy(() => import('./components/knowledge/AverageTimeCalculator'))
const CarbonFootprintCalculator = lazy(() => import('./components/knowledge/CarbonFootprintCalculator'))
const CareerAssessmentCalculator = lazy(() => import('./components/knowledge/CareerAssessmentCalculator'))
const TraumaAssessmentCalculator = lazy(() => import('./components/knowledge/TraumaAssessmentCalculator'))
const AnxietyAssessmentCalculator = lazy(() => import('./components/knowledge/AnxietyAssessmentCalculator'))

// Lazily import math calculators
const FractionCalculator = lazy(() => import('./components/math/FractionCalculator'))
const FractionToPercentCalculator = lazy(() => import('./components/math/FractionToPercentCalculator'))
const BinaryCalculatorTool = lazy(() => import('./components/tool/BinaryCalculatorTool'))
const ComparingDecimalsCalculator = lazy(() => import('./components/math/ComparingDecimalsCalculator'))
const ComparingFractionsCalculator = lazy(() => import('./components/math/ComparingFractionsCalculator'))
const DecimalCalculator = lazy(() => import('./components/math/DecimalCalculator'))
const DecimalToFractionCalculator = lazy(() => import('./components/math/DecimalToFractionCalculator'))
const DerivativeCalculator = lazy(() => import('./components/math/DerivativeCalculator'))
const ImproperFractionToMixedCalculator = lazy(() => import('./components/math/ImproperFractionToMixedCalculator'))
const IntegralCalculator = lazy(() => import('./components/math/IntegralCalculator'))
const PercentageCalculator = lazy(() => import('./components/math/PercentageCalculator'))
const PercentToFractionCalculator = lazy(() => import('./components/math/PercentToFractionCalculator'))
const LCMCalculator = lazy(() => import('./components/math/LCMCalculator'))
const LCDCalculator = lazy(() => import('./components/math/LCDCalculator'))
const SSECalculator = lazy(() => import('./components/math/SSECalculator'))

// Lazily import finance calculators
const CurrencyCalculator = lazy(() => import('./components/finance/CurrencyCalculator'))
const LoanCalculator = lazy(() => import('./components/finance/LoanCalculator'))
const MortgageCalculator = lazy(() => import('./components/finance/MortgageCalculator'))
const AmortizationCalculator = lazy(() => import('./components/finance/AmortizationCalculator'))
const HouseAffordabilityCalculator = lazy(() => import('./components/finance/HouseAffordabilityCalculator'))
const CompoundInterestCalculator = lazy(() => import('./components/finance/CompoundInterestCalculator'))
const ROICalculator = lazy(() => import('./components/finance/ROICalculator'))
const BusinessLoanCalculator = lazy(() => import('./components/finance/BusinessLoanCalculator'))
const CreditCardCalculator = lazy(() => import('./components/finance/CreditCardCalculator'))
const InvestmentCalculator = lazy(() => import('./components/finance/InvestmentCalculator'))
const TaxCalculator = lazy(() => import('./components/finance/TaxCalculator'))
const RetirementCalculator = lazy(() => import('./components/finance/RetirementCalculator'))
const SalesTaxCalculator = lazy(() => import('./components/finance/SalesTaxCalculator'))
const DebtPayoffCalculator = lazy(() => import('./components/finance/DebtPayoffCalculator'))
const InsuranceCalculator = lazy(() => import('./components/finance/InsuranceCalculator'))
const BudgetCalculator = lazy(() => import('./components/finance/BudgetCalculator'))
const RentalPropertyCalculator = lazy(() => import('./components/finance/RentalPropertyCalculator'))
const DebtIncomeCalculator = lazy(() => import('./components/finance/DebtIncomeCalculator'))
const DownPaymentCalculator = lazy(() => import('./components/finance/DownPaymentCalculator'))
const PresentValueCalculator = lazy(() => import('./components/finance/PresentValueCalculator'))
const FutureValueCalculator = lazy(() => import('./components/finance/FutureValueCalculator'))

// Lazily import science calculators
const WaveSpeedCalculator = lazy(() => import('./components/science/WaveSpeedCalculator'))
const GravityCalculator = lazy(() => import('./components/science/GravityCalculator'))
const WorkPowerCalculator = lazy(() => import('./components/science/WorkPowerCalculator'))
const DBmWattsCalculator = lazy(() => import('./components/science/DBmWattsCalculator'))
const DBmMilliwattsCalculator = lazy(() => import('./components/science/DBmMilliwattsCalculator'))
const CapacitanceCalculator = lazy(() => import('./components/science/CapacitanceCalculator'))
const ElectricFluxCalculator = lazy(() => import('./components/science/ElectricFluxCalculator'))
const AverageAtomicMassCalculator = lazy(() => import('./components/science/AverageAtomicMassCalculator'))

// Lazily import health calculators
const BMICalculator = lazy(() => import('./components/health/BMICalculator'))
const BodyFatCalculator = lazy(() => import('./components/health/BodyFatCalculator'))
const IdealWeightCalculator = lazy(() => import('./components/health/IdealWeightCalculator'))
const DiabetesRiskCalculator = lazy(() => import('./components/health/DiabetesRiskCalculator'))
const CalorieBurnCalculator = lazy(() => import('./components/health/CalorieBurnCalculator'))
const DRICalculator = lazy(() => import('./components/health/DRICalculator'))
const BRICalculator = lazy(() => import('./components/health/BRICalculator'))
const CalorieCalculator = lazy(() => import('./components/health/CalorieCalculator'))
const WaterIntakeCalculator = lazy(() => import('./components/health/WaterIntakeCalculator'))
const WeightLossCalculator = lazy(() => import('./components/health/WeightLossCalculator'))
const WeightGainCalculator = lazy(() => import('./components/health/WeightGainCalculator'))


const App = () => {
  return (
    <>
      <ScrollToTop />
      <SeoManager />
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
            <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-and-conditions" element={<TermsPage />} />
          <Route
            path="/privacy-policy-legacy"
            element={
              <StaticPage
                title="Privacy Policy"
                description="Review how Tuitility handles privacy, cookies, consent, and browser-based processing."
                canonicalPath="/privacy-policy"
              >
                <p>
                  Tuitility values privacy and operates on a user-side processing model. Most of
                  our calculators and utility tools process information directly in your browser, which
                  means your inputs and uploaded files stay on your device. We do not collect or store
                  any data from the tools themselves.
                </p>
                <p>
                  We may use cookies for essential site functions and user preferences. We do not
                  use tracking or analytics cookies. A consent banner is shown so visitors are 
                  informed of our cookie usage.
                </p>
                <h2>Third-Party Services</h2>
                <p>
                  Some features may call external services such as exchange-rate APIs or AI tools.
                  When that happens, only the data required for that feature should be sent. We aim to
                  use reputable providers and avoid unnecessary sharing of personal information.
                </p>
                <h2>Files and User Inputs</h2>
                <p>
                  Several tools, especially PDF, text, and image utilities, are designed to process
                  content locally in your browser. However, users should avoid uploading confidential
                  legal, financial, medical, or personal documents unless they understand the specific
                  tool flow and are comfortable with the risk.
                </p>
                <h2>Contact</h2>
                <p>
                  For privacy questions or removal requests, email{' '}
                  <a href="mailto:wajidmarslan@gmail.com">wajidmarslan@gmail.com</a>.
                </p>
              </StaticPage>
            }
          />
          <Route
            path="/terms-and-conditions-legacy"
            element={
              <StaticPage
                title="Terms and Conditions"
                description="Read the Tuitility terms and conditions covering acceptable use, informational limitations, user responsibility, and service policies."
                canonicalPath="/terms-and-conditions"
              >
                <h2>Acceptance of Terms</h2>
                <p>
                  By using Tuitility, you agree to use the site lawfully and responsibly. These tools
                  are provided for general informational and productivity purposes and may not be
                  suitable as a substitute for professional advice.
                </p>
                <h2>Tool Accuracy and User Responsibility</h2>
                <p>
                  We work to keep calculators and utility tools accurate and useful, but results may
                  still depend on the assumptions, formulas, data sources, and inputs provided by the
                  user. You are responsible for checking important results before relying on them for
                  financial, legal, medical, academic, or business decisions.
                </p>
                <h2>Acceptable Use</h2>
                <p>
                  You agree not to misuse the site, interfere with site operation, attempt to exploit
                  vulnerabilities, or use the tools for illegal, abusive, or fraudulent purposes.
                </p>
                <h2>Contact</h2>
                <p>
                  Questions about these terms can be sent to{' '}
                  <a href="mailto:wajidmarslan@gmail.com">wajidmarslan@gmail.com</a>.
                </p>
              </StaticPage>
            }
          />
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
          <Route path="/utility-tools/genz-translator" element={<GenZTranslator />} />
          <Route path="/utility-tools/english-to-ipa-translator" element={<EnglishToIPATranslator />} />
          <Route path="/utility-tools/audio-bitrate-converter" element={<AudioBitrateConverter />} />
          <Route path="/utility-tools/converter-tools/reels-downloader" element={<InstagramReelsDownloader />} />
          <Route path="/utility-tools/converter-tools/tiktok-downloader" element={<TikTokDownloader />} />
          <Route path="/utility-tools/converter-tools/qr-code-scanner" element={<QRCodeScanner />} />
          <Route path="/utility-tools/image-tools/aspect-ratio-converter" element={<AspectRatioConverter />} />
          <Route path="/utility-tools/image-tools/color-blindness-simulator" element={<ColorBlindnessSimulator />} />
          <Route path="/utility-tools/converter-tools/rgb-to-pantone-converter" element={<RgbToPantoneConverter />} />
          <Route path="/utility-tools/converter-tools/rgb-to-hex-converter" element={<RgbToHexConverter />} />

          <Route path="/utility-tools/converter-tools/gold-precious-metal-weight-converter" element={<GoldWeightConverter />} />
          <Route path="/utility-tools/converter-tools/pdf-to-image-converter" element={<PdfToImageConverter />} />
          <Route path="/utility-tools/converter-tools/merge-pdf" element={<PdfMerger />} />
          <Route path="/utility-tools/converter-tools/delete-pdf-pages" element={<DeletePdfPages />} />
          <Route path="/utility-tools/converter-tools/split-pdf" element={<PdfSplitter />} />
          <Route path="/utility-tools/converter-tools/organize-pdf-pages" element={<PdfOrganizer />} />
          <Route path="/utility-tools/converter-tools/text-case-converter" element={<TextCaseConverter />} />
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
          <Route
            path="*"
            element={
              <StaticPage
                title="Page Not Found"
                description="The page you requested could not be found. Browse Tuitility categories to discover calculators and tools."
                canonicalPath="/404"
              >
                <h2>Try one of these sections</h2>
                <p>
                  Visit Math, Finance, Health, Science, Utility Tools, or Knowledge to continue
                  exploring the site.
                </p>
              </StaticPage>
            }
          />
        </Routes>
      </Suspense>
      <CookieBanner />
      <Footer />
    </>
  )
}

export default App
