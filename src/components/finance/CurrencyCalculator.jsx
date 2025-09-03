import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import CurrencyCalculatorJS from '../../assets/js/finance/currency-calculator.js'
import '../../assets/css/finance/currency-calculator.css'

const CurrencyCalculator = () => {
  const [amount, setAmount] = useState('100')
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('EUR')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [availableCurrencies, setAvailableCurrencies] = useState([])
  const [calculator, setCalculator] = useState(null)

  // Tool data
  const toolData = {
    name: 'Currency Calculator',
    description: 'Convert between 150+ world currencies with real-time exchange rates. Get accurate conversions, historical data, and currency information.',
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
    { name: 'Percentage Calculator', url: '/math/calculators/percentage-calculator', icon: 'fas fa-percentage' },
    { name: 'Fraction Calculator', url: '/math/calculators/fraction-calculator', icon: 'fas fa-divide' },
    { name: 'Decimal Calculator', url: '/math/calculators/decimal-calculator', icon: 'fas fa-calculator' },
    { name: 'Binary Calculator', url: '/math/calculators/binary-calculator', icon: 'fas fa-1' },
    { name: 'SSE Calculator', url: '/math/calculators/sse-calculator', icon: 'fas fa-chart-line' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-currency', title: 'What is Currency Conversion?' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'exchange-rates', title: 'Exchange Rates' },
    { id: 'popular-pairs', title: 'Popular Currency Pairs' },
    { id: 'significance', title: 'Significance' },
    { id: 'functionality', title: 'Functionality' },
    { id: 'applications', title: 'Applications' },
    { id: 'faqs', title: 'FAQs' }
  ];

  // Initialize calculator
  useEffect(() => {
    const initCalculator = async () => {
      try {
        const CurrencyCalculatorClass = (await import('../../assets/js/finance/currency-calculator.js')).default;
        const calc = new CurrencyCalculatorClass();
        setCalculator(calc);
        
        // Fetch initial exchange rates
        await calc.fetchExchangeRates('USD');
        setAvailableCurrencies(Object.keys(calc.exchangeRates));
        setLastUpdated(calc.getFormattedLastUpdated());
      } catch (error) {
        console.error('Error initializing calculator:', error);
        setError('Failed to initialize currency calculator');
      }
    };

    initCalculator();
  }, []);

  // Handle input changes
  const handleInputChange = (field, value) => {
    if (field === 'amount') {
      setAmount(value);
    } else if (field === 'fromCurrency') {
      setFromCurrency(value);
    } else if (field === 'toCurrency') {
      setToCurrency(value);
    }
  };

  // Convert currencies
  const convertCurrency = async () => {
    if (!calculator) {
      setError('Calculator not initialized');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Validate inputs
      const validation = calculator.validateInput(parseFloat(amount), fromCurrency, toCurrency);
      if (!validation.isValid) {
        setError(validation.errors.join(' '));
        return;
      }

      // Check if rates are stale
      if (calculator.areRatesStale()) {
        await calculator.fetchExchangeRates(fromCurrency);
        setLastUpdated(calculator.getFormattedLastUpdated());
      }

      // Perform conversion
      const conversionResult = calculator.convertCurrency(
        parseFloat(amount),
        fromCurrency,
        toCurrency
      );

      setResult(conversionResult);
    } catch (error) {
      setError(error.message);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    setAmount('100');
    setFromCurrency('USD');
    setToCurrency('EUR');
    setResult(null);
    setError('');
  };

  // Swap currencies
  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  // Get currency symbol
  const getCurrencySymbol = (currencyCode) => {
    if (!calculator) return currencyCode;
    return calculator.getCurrencySymbol(currencyCode);
  };

  // Get currency name
  const getCurrencyName = (currencyCode) => {
    if (!calculator) return currencyCode;
    const info = calculator.getCurrencyInfo(currencyCode);
    return info.name;
  };

  return (
    <ToolPageLayout 
      toolData={toolData} 
      tableOfContents={tableOfContents}
      categories={categories}
      relatedTools={relatedTools}
    >
      <CalculatorSection 
        title="Currency Calculator"
        onCalculate={convertCurrency}
        calculateButtonText="Convert Currency"
        error={error}
        result={null}
      >
        <div className="currency-calculator-form">
          <div className="currency-input-group">
            <label htmlFor="currency-amount" className="currency-input-label">
              Amount:
            </label>
            <input
              id="currency-amount"
              type="number"
              className="currency-input-field"
              value={amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="Enter amount"
              min="0"
              step="0.01"
            />
          </div>

          <div className="currency-conversion-row">
            <div className="currency-input-group">
              <label htmlFor="currency-from" className="currency-input-label">
                From Currency:
              </label>
              <select
                id="currency-from"
                className="currency-select-field"
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

            <button 
              type="button" 
              className="currency-swap-btn"
              onClick={swapCurrencies}
              title="Swap currencies"
            >
              <i className="fas fa-exchange-alt"></i>
            </button>

            <div className="currency-input-group">
              <label htmlFor="currency-to" className="currency-input-label">
                To Currency:
              </label>
              <select
                id="currency-to"
                className="currency-select-field"
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

          <div className="currency-calculator-actions">
            <button type="button" className="currency-btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>

          {lastUpdated && (
            <div className="currency-last-updated">
              <small>Last updated: {lastUpdated}</small>
            </div>
          )}
        </div>

        {/* Custom Results Section */}
        {result && (
          <div className="currency-calculator-result">
            <h3 className="currency-result-title">Currency Conversion Result</h3>
            <div className="currency-result-content">
              <div className="currency-result-main">
                <div className="currency-result-item">
                  <strong>Original Amount:</strong>
                  <span className="currency-result-value">
                    {getCurrencySymbol(result.fromCurrency)}{parseFloat(result.originalAmount).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} {result.fromCurrency}
                  </span>
                </div>
                <div className="currency-result-item">
                  <strong>Exchange Rate:</strong>
                  <span className="currency-result-value">
                    1 {result.fromCurrency} = {result.rate.toFixed(6)} {result.toCurrency}
                  </span>
                </div>
                <div className="currency-result-item">
                  <strong>Converted Amount:</strong>
                  <span className="currency-result-value currency-result-final">
                    {getCurrencySymbol(result.toCurrency)}{parseFloat(result.convertedAmount).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} {result.toCurrency}
                  </span>
                </div>
              </div>
              
              <div className="currency-rate-info">
                <h4>Rate Information</h4>
                <div className="currency-rate-details">
                  <p><strong>Base Currency:</strong> {result.fromCurrency}</p>
                  <p><strong>Target Currency:</strong> {result.toCurrency}</p>
                  <p><strong>Conversion Rate:</strong> {result.rate.toFixed(6)}</p>
                  <p><strong>Reverse Rate:</strong> {(1 / result.rate).toFixed(6)}</p>
                </div>
              </div>
            </div>
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
          The Currency Calculator is a powerful tool that allows you to convert between 150+ world currencies 
          using real-time exchange rates. Whether you're planning international travel, conducting business 
          across borders, or simply curious about currency values, this calculator provides accurate and 
          up-to-date conversion rates.
        </p>
        <p>
          Our calculator integrates with reliable exchange rate APIs to ensure you get the most current 
          rates available. It supports major world currencies including USD, EUR, GBP, JPY, and many more, 
          making it perfect for travelers, investors, and anyone working with international currencies.
        </p>
      </ContentSection>

      <ContentSection id="what-is-currency" title="What is Currency Conversion?">
        <p>
          Currency conversion is the process of exchanging one currency for another at a specific exchange rate. 
          Exchange rates fluctuate constantly based on various economic factors including:
        </p>
        <ul>
          <li>
            <span><strong>Economic Indicators:</strong> GDP growth, inflation rates, and employment data</span>
          </li>
          <li>
            <span><strong>Political Stability:</strong> Government policies and political events</span>
          </li>
          <li>
            <span><strong>Market Sentiment:</strong> Investor confidence and market speculation</span>
          </li>
          <li>
            <span><strong>Interest Rates:</strong> Central bank policies and monetary decisions</span>
          </li>
          <li>
            <span><strong>Trade Balances:</strong> Import/export relationships between countries</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Currency Calculator">
        <p>Using the currency calculator is simple and straightforward:</p>
        <ul className="usage-steps">
          <li>
            <span><strong>Enter Amount:</strong> Input the amount you want to convert in the first field.</span>
          </li>
          <li>
            <span><strong>Select Source Currency:</strong> Choose the currency you're converting from using the dropdown.</span>
          </li>
          <li>
            <span><strong>Select Target Currency:</strong> Choose the currency you want to convert to.</span>
          </li>
          <li>
            <span><strong>Convert:</strong> Click the "Convert Currency" button to get your result.</span>
          </li>
          <li>
            <span><strong>View Results:</strong> See the converted amount, exchange rate, and additional information.</span>
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
            <span><strong>Real-time Rates:</strong> Current exchange rates updated regularly</span>
          </li>
          <li>
            <span><strong>Accurate Calculations:</strong> Precise conversions using official rates</span>
          </li>
          <li>
            <span><strong>Rate Information:</strong> Both forward and reverse conversion rates</span>
          </li>
          <li>
            <span><strong>Currency Details:</strong> Full names and symbols for all supported currencies</span>
          </li>
        </ul>
        <p>
          <strong>Note:</strong> Exchange rates are typically updated every hour to ensure accuracy. 
          For critical financial decisions, always verify rates with your financial institution.
        </p>
      </ContentSection>

      <ContentSection id="popular-pairs" title="Popular Currency Pairs">
        <div className="popular-pairs-grid">
          <div className="pair-item">
            <h4><i className="fas fa-dollar-sign"></i> USD/EUR</h4>
            <p>US Dollar to Euro - Most traded currency pair globally</p>
          </div>
          <div className="pair-item">
            <h4><i className="fas fa-pound-sign"></i> USD/GBP</h4>
            <p>US Dollar to British Pound - Major forex pair</p>
          </div>
          <div className="pair-item">
            <h4><i className="fas fa-yen-sign"></i> USD/JPY</h4>
            <p>US Dollar to Japanese Yen - Popular Asian pair</p>
          </div>
          <div className="pair-item">
            <h4><i className="fas fa-euro-sign"></i> EUR/GBP</h4>
            <p>Euro to British Pound - European major pair</p>
          </div>
          <div className="pair-item">
            <h4><i className="fas fa-dollar-sign"></i> USD/CAD</h4>
            <p>US Dollar to Canadian Dollar - North American pair</p>
          </div>
          <div className="pair-item">
            <h4><i className="fas fa-dollar-sign"></i> USD/AUD</h4>
            <p>US Dollar to Australian Dollar - Pacific pair</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding currency conversion is essential in today's global economy:</p>
        <ul>
          <li>
            <span>Essential for international travel and expense planning</span>
          </li>
          <li>
            <span>Critical for international business and trade</span>
          </li>
          <li>
            <span>Important for investment decisions and portfolio management</span>
          </li>
          <li>
            <span>Useful for understanding global economic trends</span>
          </li>
          <li>
            <span>Helps in making informed financial decisions</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our Currency Calculator provides comprehensive functionality:</p>
        <ul>
          <li>
            <span><strong>150+ Currencies:</strong> Support for major and minor world currencies</span>
          </li>
          <li>
            <span><strong>Real-time Rates:</strong> Current exchange rates updated hourly</span>
          </li>
          <li>
            <span><strong>Accurate Calculations:</strong> Precise conversions with proper decimal handling</span>
          </li>
          <li>
            <span><strong>Currency Information:</strong> Full names, symbols, and country details</span>
          </li>
          <li>
            <span><strong>Quick Swap:</strong> Easy currency reversal with one click</span>
          </li>
          <li>
            <span><strong>Input Validation:</strong> Ensures valid amounts and currency selections</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-plane"></i> Travel Planning</h4>
            <p>Calculate expenses and budget for international trips</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-briefcase"></i> Business</h4>
            <p>International trade, pricing, and financial planning</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Investment</h4>
            <p>Foreign investment analysis and portfolio management</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-graduation-cap"></i> Education</h4>
            <p>Learning about global economics and currency markets</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-shopping-cart"></i> Shopping</h4>
            <p>International online shopping and price comparison</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-home"></i> Real Estate</h4>
            <p>International property investment and valuation</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection 
        faqs={[
          {
            question: "How often are exchange rates updated?",
            answer: "Exchange rates are updated every hour to ensure accuracy. For critical financial decisions, always verify rates with your financial institution."
          },
          {
            question: "Are the conversion rates accurate?",
            answer: "Yes, our calculator uses real-time exchange rates from reliable financial APIs. However, rates may vary slightly between different providers."
          },
          {
            question: "Can I convert between any two currencies?",
            answer: "Yes, you can convert between any of the 150+ supported currencies. The calculator automatically fetches the necessary exchange rates."
          },
          {
            question: "Why do exchange rates fluctuate?",
            answer: "Exchange rates fluctuate due to economic factors, political events, market sentiment, interest rates, and trade balances between countries."
          },
          {
            question: "Is there a fee for using the calculator?",
            answer: "No, our currency calculator is completely free to use. We don't charge any fees for currency conversions."
          },
          {
            question: "Can I use this for business transactions?",
            answer: "While our calculator provides accurate rates, for business transactions, always use your bank's or financial institution's rates."
          }
        ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  )
}

export default CurrencyCalculator
