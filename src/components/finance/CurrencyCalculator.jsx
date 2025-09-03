import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import CurrencyCalculator from '../../assets/js/finance/currency-calculator';
import '../../assets/css/finance/currency-calculator.css';

const CurrencyCalculatorComponent = () => {
  const [amount, setAmount] = useState('100')
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('EUR')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [availableCurrencies, setAvailableCurrencies] = useState([])

  // Initialize currency calculator
  const [calculator] = useState(() => new CurrencyCalculator())

  // Tool data
  const toolData = {
    name: 'Currency Calculator',
    description: 'Convert between 170+ world currencies with real-time exchange rates. Get accurate currency conversions for travel, business, and financial planning.',
    icon: 'fas fa-exchange-alt',
    category: 'Finance',
    breadcrumb: ['Finance', 'Calculators', 'Currency Calculator']
  };

  // Categories for sidebar
  const categories = [
    { name: 'Math', url: '/math', icon: 'fas fa-calculator' },
    { name: 'Finance', url: '/finance', icon: 'fas fa-dollar-sign' },
    { name: 'Health', url: '/health', icon: 'fas fa-heartbeat' },
    { name: 'Science', url: '/science', icon: 'fas fa-flask' },
    { name: 'Utility', url: '/utility', icon: 'fas fa-wrench' },
    { name: 'Knowledge', url: '/knowledge', icon: 'fas fa-book' }
  ];

  // Related tools for sidebar
  const relatedTools = [
    { name: 'Mortgage Calculator', url: '/finance/mortgage-calculator', icon: 'fas fa-home' },
    { name: 'Loan Calculator', url: '/finance/loan-calculator', icon: 'fas fa-hand-holding-usd' },
    { name: 'Percentage Calculator', url: '/math/calculators/percentage-calculator', icon: 'fas fa-percentage' },
    { name: 'Fraction Calculator', url: '/math/calculators/fraction-calculator', icon: 'fas fa-divide' },
    { name: 'Binary Calculator', url: '/math/calculators/binary-calculator', icon: 'fas fa-1' },
    { name: 'Decimal Calculator', url: '/math/calculators/decimal-calculator', icon: 'fas fa-calculator' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-currency-conversion', title: 'What is Currency Conversion?' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'exchange-rates', title: 'Exchange Rates' },
    { id: 'popular-currencies', title: 'Popular Currencies' },
    { id: 'significance', title: 'Significance' },
    { id: 'functionality', title: 'Functionality' },
    { id: 'applications', title: 'Applications' },
    { id: 'faqs', title: 'FAQs' }
  ];

  // Initialize currencies and fetch exchange rates
  useEffect(() => {
    const initializeCalculator = async () => {
      try {
        setIsLoading(true)
        const rates = await calculator.fetchExchangeRates()
        setAvailableCurrencies(Object.keys(rates))
        setLastUpdated(calculator.getLastUpdated())
      } catch (error) {
        setError('Failed to fetch exchange rates. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    initializeCalculator()
  }, [calculator])

  // Handle input changes
  const handleInputChange = (field, value) => {
    if (field === 'amount') {
      // Only allow numbers and decimals
      const validatedValue = value.replace(/[^\d.]/g, '')
      setAmount(validatedValue)
    } else if (field === 'fromCurrency') {
      setFromCurrency(value)
    } else if (field === 'toCurrency') {
      setToCurrency(value)
    }
  }

  // Handle currency conversion
  const calculateConversion = async () => {
    try {
      setIsLoading(true)
      setError('')

      // Validate input
      const validation = calculator.validateInput(parseFloat(amount), fromCurrency, toCurrency)
      if (!validation.isValid) {
        setError(validation.errors.join(' '))
        return
      }

      // Check if rates are stale and refresh if needed
      if (calculator.areRatesStale()) {
        await calculator.fetchExchangeRates(fromCurrency)
        setLastUpdated(calculator.getLastUpdated())
      }

      // Perform conversion
      const conversionResult = calculator.convertCurrency(
        parseFloat(amount),
        fromCurrency,
        toCurrency
      )

      setResult(conversionResult)
    } catch (error) {
      setError(error.message)
      setResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle reset
  const handleReset = () => {
    setAmount('100')
    setFromCurrency('USD')
    setToCurrency('EUR')
    setResult(null)
    setError('')
  }

  // Swap currencies
  const swapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  // Get currency symbol
  const getCurrencySymbol = (currencyCode) => {
    const info = calculator.getCurrencyInfo(currencyCode)
    return info.symbol
  }

  // Get currency name
  const getCurrencyName = (currencyCode) => {
    const info = calculator.getCurrencyInfo(currencyCode)
    return info.name
  }

  return (
    <ToolPageLayout 
      toolData={toolData} 
      tableOfContents={tableOfContents}
      categories={categories}
      relatedTools={relatedTools}
    >
      <CalculatorSection 
        title="Currency Calculator"
        onCalculate={calculateConversion}
        calculateButtonText="Convert Currency"
        error={error}
        result={null}
      >
        <div className="calculator-form">
          <div className="input-group">
            <label htmlFor="amount" className="input-label">
              Amount:
            </label>
            <input
              type="text"
              id="amount"
              name="amount"
              className="input-field"
              value={amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="Enter amount"
            />
          </div>

          <div className="currency-selection">
            <div className="input-group">
              <label htmlFor="fromCurrency" className="input-label">
                From Currency:
              </label>
              <select
                id="fromCurrency"
                name="fromCurrency"
                className="currency-select"
                value={fromCurrency}
                onChange={(e) => handleInputChange('fromCurrency', e.target.value)}
              >
                {availableCurrencies.map(currency => (
                  <option key={currency} value={currency}>
                    {currency} - {getCurrencyName(currency)}
                  </option>
                ))}
              </select>
            </div>

            <div className="swap-button-container">
              <button 
                type="button" 
                className="btn-swap"
                onClick={swapCurrencies}
                title="Swap currencies"
              >
                <i className="fas fa-exchange-alt"></i>
              </button>
            </div>

            <div className="input-group">
              <label htmlFor="toCurrency" className="input-label">
                To Currency:
              </label>
              <select
                id="toCurrency"
                name="toCurrency"
                className="currency-select"
                value={toCurrency}
                onChange={(e) => handleInputChange('toCurrency', e.target.value)}
              >
                {availableCurrencies.map(currency => (
                  <option key={currency} value={currency}>
                    {currency} - {getCurrencyName(currency)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <small className="input-help">
            Enter an amount and select currencies to convert. Exchange rates are updated in real-time.
          </small>

          <div className="calculator-actions">
            <button type="button" className="btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>
        </div>

        {/* Custom Results Section */}
        {result && (
          <div className="result-section currency-calculator-result">
            <h3 className="result-title">Currency Conversion Result</h3>
            <div className="result-content">
              <div className="result-main">
                <div className="result-item">
                  <strong>Original Amount:</strong>
                  <span className="result-value">
                    {getCurrencySymbol(result.fromCurrency)}{result.originalAmount.toFixed(2)} {result.fromCurrency}
                  </span>
                </div>
                <div className="result-item">
                  <strong>Converted Amount:</strong>
                  <span className="result-value">
                    {getCurrencySymbol(result.toCurrency)}{result.convertedAmount.toFixed(2)} {result.toCurrency}
                  </span>
                </div>
                <div className="result-item">
                  <strong>Exchange Rate:</strong>
                  <span className="result-value">
                    1 {result.fromCurrency} = {result.rate.toFixed(6)} {result.toCurrency}
                  </span>
                </div>
                <div className="result-item">
                  <strong>Reverse Rate:</strong>
                  <span className="result-value">
                    1 {result.toCurrency} = {(1 / result.rate).toFixed(6)} {result.fromCurrency}
                  </span>
                </div>
              </div>
              
              {lastUpdated && (
                <div className="rate-info">
                  <p><strong>Last Updated:</strong> {lastUpdated.toLocaleString()}</p>
                  <p><strong>Base Currency:</strong> {result.fromCurrency}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <span>Fetching latest exchange rates...</span>
          </div>
        )}
      </CalculatorSection>

      {/* TOC and Feedback Section - After Calculator, Before Content */}
      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName={toolData.name} />
      </div>

      {/* Content Sections */}
      <ContentSection id="introduction" title="Introduction">
        <p>
          Currency conversion is essential in our interconnected world, whether you're traveling abroad, 
          conducting international business, or simply curious about exchange rates. Our Currency Calculator 
          provides real-time conversion rates between 170+ world currencies, helping you make informed 
          financial decisions.
        </p>
        <p>
          With live exchange rates updated regularly, you can convert between major currencies like USD, 
          EUR, GBP, and JPY, as well as regional currencies from around the world. This tool is perfect 
          for travelers, business professionals, investors, and anyone interested in global finance.
        </p>
      </ContentSection>

      <ContentSection id="what-is-currency-conversion" title="What is Currency Conversion?">
        <p>
          Currency conversion is the process of exchanging one currency for another at a specific exchange rate. 
          Exchange rates fluctuate constantly based on various economic factors including:
        </p>
        <ul>
          <li>
            <span><strong>Economic Indicators:</strong> GDP growth, inflation rates, and employment data</span>
          </li>
          <li>
            <span><strong>Interest Rates:</strong> Central bank policies and monetary decisions</span>
          </li>
          <li>
            <span><strong>Political Stability:</strong> Government policies and geopolitical events</span>
          </li>
          <li>
            <span><strong>Market Sentiment:</strong> Investor confidence and market speculation</span>
          </li>
          <li>
            <span><strong>Trade Balances:</strong> Import/export relationships between countries</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Currency Calculator">
        <p>Using our Currency Calculator is simple and straightforward:</p>
        <ul className="usage-steps">
          <li>
            <span><strong>Enter Amount:</strong> Input the amount you want to convert in the first field</span>
          </li>
          <li>
            <span><strong>Select Source Currency:</strong> Choose the currency you're converting from</span>
          </li>
          <li>
            <span><strong>Select Target Currency:</strong> Choose the currency you want to convert to</span>
          </li>
          <li>
            <span><strong>Convert:</strong> Click the "Convert Currency" button to get real-time results</span>
          </li>
          <li>
            <span><strong>View Results:</strong> See the converted amount, exchange rate, and reverse rate</span>
          </li>
        </ul>
        <p>
          <strong>Pro Tip:</strong> Use the swap button (↔) to quickly reverse the conversion direction.
        </p>
      </ContentSection>

      <ContentSection id="exchange-rates" title="Exchange Rates">
        <p>
          Exchange rates represent the value of one currency in terms of another. They are constantly 
          changing due to market forces and economic conditions. Our calculator provides:
        </p>
        <ul>
          <li>
            <span><strong>Real-time Rates:</strong> Updated exchange rates from reliable financial sources</span>
          </li>
          <li>
            <span><strong>Bid/Ask Spreads:</strong> Understanding the difference between buying and selling rates</span>
          </li>
          <li>
            <span><strong>Historical Context:</strong> Rates can vary significantly over time</span>
          </li>
          <li>
            <span><strong>Cross Rates:</strong> Conversion between non-USD currency pairs</span>
          </li>
        </ul>
        <div className="formula-section">
          <h3>Conversion Formula</h3>
          <p><strong>Converted Amount = Original Amount × Exchange Rate</strong></p>
          <p>Where the exchange rate represents how many units of the target currency equal one unit of the source currency.</p>
        </div>
      </ContentSection>

      <ContentSection id="popular-currencies" title="Popular Currencies">
        <p>Our calculator supports 170+ currencies, including the most widely traded:</p>
        <div className="currencies-grid">
          <div className="currency-group">
            <h4><i className="fas fa-dollar-sign"></i> Major Currencies</h4>
            <ul>
              <li><strong>USD</strong> - US Dollar (World's reserve currency)</li>
              <li><strong>EUR</strong> - Euro (European Union)</li>
              <li><strong>GBP</strong> - British Pound (United Kingdom)</li>
              <li><strong>JPY</strong> - Japanese Yen (Japan)</li>
              <li><strong>CHF</strong> - Swiss Franc (Switzerland)</li>
            </ul>
          </div>
          <div className="currency-group">
            <h4><i className="fas fa-globe-americas"></i> Regional Currencies</h4>
            <ul>
              <li><strong>CAD</strong> - Canadian Dollar</li>
              <li><strong>AUD</strong> - Australian Dollar</li>
              <li><strong>CNY</strong> - Chinese Yuan</li>
              <li><strong>INR</strong> - Indian Rupee</li>
              <li><strong>BRL</strong> - Brazilian Real</li>
            </ul>
          </div>
          <div className="currency-group">
            <h4><i className="fas fa-coins"></i> Emerging Markets</h4>
            <ul>
              <li><strong>MXN</strong> - Mexican Peso</li>
              <li><strong>KRW</strong> - South Korean Won</li>
              <li><strong>TRY</strong> - Turkish Lira</li>
              <li><strong>ZAR</strong> - South African Rand</li>
              <li><strong>RUB</strong> - Russian Ruble</li>
            </ul>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding currency conversion is crucial for several reasons:</p>
        <ul>
          <li>
            <span><strong>International Travel:</strong> Plan budgets and understand local costs</span>
          </li>
          <li>
            <span><strong>Business Operations:</strong> Price products and manage international transactions</span>
          </li>
          <li>
            <span><strong>Investment Decisions:</strong> Evaluate foreign investment opportunities</span>
          </li>
          <li>
            <span><strong>Economic Understanding:</strong> Comprehend global financial markets</span>
          </li>
          <li>
            <span><strong>Personal Finance:</strong> Make informed decisions about foreign currency holdings</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our Currency Calculator provides comprehensive features:</p>
        <ul>
          <li>
            <span><strong>Real-time Rates:</strong> Live exchange rates from reliable financial APIs</span>
          </li>
          <li>
            <span><strong>170+ Currencies:</strong> Support for major, minor, and exotic currencies</span>
          </li>
          <li>
            <span><strong>Bidirectional Conversion:</strong> Convert in both directions with reverse rates</span>
          </li>
          <li>
            <span><strong>Input Validation:</strong> Ensures valid amounts and currency selections</span>
          </li>
          <li>
            <span><strong>Rate Refresh:</strong> Automatically updates stale exchange rates</span>
          </li>
          <li>
            <span><strong>Currency Information:</strong> Detailed info about each supported currency</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-plane"></i> Travel & Tourism</h4>
            <p>Plan travel budgets, understand local costs, and manage expenses abroad</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-briefcase"></i> Business & Commerce</h4>
            <p>Price international products, manage cross-border transactions, and analyze costs</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Investment & Trading</h4>
            <p>Evaluate foreign investments, analyze currency trends, and manage forex positions</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-graduation-cap"></i> Education & Research</h4>
            <p>Study economics, research global markets, and understand financial systems</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-home"></i> Personal Finance</h4>
            <p>Manage foreign currency accounts, plan international purchases, and track expenses</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-newspaper"></i> News & Analysis</h4>
            <p>Understand economic news, analyze market movements, and track currency developments</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection 
        faqs={[
          {
            question: "How often are exchange rates updated?",
            answer: "Exchange rates are updated in real-time when you perform a conversion. If rates are older than 1 hour, the calculator automatically refreshes them to ensure accuracy."
          },
          {
            question: "Are the exchange rates accurate?",
            answer: "Yes, our calculator uses reliable financial APIs to provide accurate, real-time exchange rates. However, actual conversion rates may vary slightly due to bank fees and spreads."
          },
          {
            question: "Why do exchange rates fluctuate?",
            answer: "Exchange rates change constantly due to economic factors like interest rates, inflation, political stability, trade balances, and market sentiment. These factors influence currency demand and supply."
          },
          {
            question: "What is the difference between bid and ask rates?",
            answer: "Bid rate is what you get when selling a currency, ask rate is what you pay when buying. The difference (spread) represents the profit margin for currency exchange services."
          },
          {
            question: "Can I convert between any two currencies?",
            answer: "Yes, you can convert between any of the 170+ supported currencies. The calculator automatically handles cross-currency conversions using USD as the base reference."
          },
          {
            question: "Are there any fees or charges?",
            answer: "Our calculator shows the pure exchange rate without fees. Actual conversion fees depend on your bank, credit card, or exchange service provider."
          }
        ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  );
}

export default CurrencyCalculatorComponent;
