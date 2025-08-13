import React, { useState, useEffect } from 'react';
import {
  ToolHero,
  ToolLayout,
  ContentSection,
  TableOfContents,
  FeedbackForm,
  FAQSection,
  MathFormula
} from '../tool';
import '../../assets/css/finance/currency-calculator.css';

const CurrencyCalculator = () => {
  const [formData, setFormData] = useState({
    amount: '',
    fromCurrency: 'USD',
    toCurrency: 'EUR'
  });
  const [exchangeRates, setExchangeRates] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const currencyInfo = {
    USD: { name: 'US Dollar', country: 'United States', symbol: '$' },
    EUR: { name: 'Euro', country: 'European Union', symbol: '€' },
    GBP: { name: 'British Pound', country: 'United Kingdom', symbol: '£' },
    JPY: { name: 'Japanese Yen', country: 'Japan', symbol: '¥' },
    CNY: { name: 'Chinese Yuan', country: 'China', symbol: '¥' },
    INR: { name: 'Indian Rupee', country: 'India', symbol: '₹' },
    CAD: { name: 'Canadian Dollar', country: 'Canada', symbol: 'C$' },
    AUD: { name: 'Australian Dollar', country: 'Australia', symbol: 'A$' },
    CHF: { name: 'Swiss Franc', country: 'Switzerland', symbol: 'CHF' },
    SEK: { name: 'Swedish Krona', country: 'Sweden', symbol: 'kr' },
    NOK: { name: 'Norwegian Krone', country: 'Norway', symbol: 'kr' },
    DKK: { name: 'Danish Krone', country: 'Denmark', symbol: 'kr' },
    PLN: { name: 'Polish Złoty', country: 'Poland', symbol: 'zł' },
    CZK: { name: 'Czech Koruna', country: 'Czech Republic', symbol: 'Kč' },
    HUF: { name: 'Hungarian Forint', country: 'Hungary', symbol: 'Ft' },
    RUB: { name: 'Russian Ruble', country: 'Russia', symbol: '₽' },
    TRY: { name: 'Turkish Lira', country: 'Turkey', symbol: '₺' },
    BRL: { name: 'Brazilian Real', country: 'Brazil', symbol: 'R$' },
    MXN: { name: 'Mexican Peso', country: 'Mexico', symbol: '$' },
    ARS: { name: 'Argentine Peso', country: 'Argentina', symbol: '$' },
    CLP: { name: 'Chilean Peso', country: 'Chile', symbol: '$' },
    COP: { name: 'Colombian Peso', country: 'Colombia', symbol: '$' },
    PEN: { name: 'Peruvian Sol', country: 'Peru', symbol: 'S/' },
    UYU: { name: 'Uruguayan Peso', country: 'Uruguay', symbol: '$' },
    VES: { name: 'Venezuelan Bolívar', country: 'Venezuela', symbol: 'Bs' },
    KRW: { name: 'South Korean Won', country: 'South Korea', symbol: '₩' },
    SGD: { name: 'Singapore Dollar', country: 'Singapore', symbol: 'S$' },
    THB: { name: 'Thai Baht', country: 'Thailand', symbol: '฿' },
    MYR: { name: 'Malaysian Ringgit', country: 'Malaysia', symbol: 'RM' },
    IDR: { name: 'Indonesian Rupiah', country: 'Indonesia', symbol: 'Rp' },
    PHP: { name: 'Philippine Peso', country: 'Philippines', symbol: '₱' },
    VND: { name: 'Vietnamese Đồng', country: 'Vietnam', symbol: '₫' },
    HKD: { name: 'Hong Kong Dollar', country: 'Hong Kong', symbol: 'HK$' },
    TWD: { name: 'New Taiwan Dollar', country: 'Taiwan', symbol: 'NT$' },
    ILS: { name: 'Israeli New Shekel', country: 'Israel', symbol: '₪' },
    AED: { name: 'UAE Dirham', country: 'United Arab Emirates', symbol: 'د.إ' },
    SAR: { name: 'Saudi Riyal', country: 'Saudi Arabia', symbol: 'ر.س' },
    QAR: { name: 'Qatari Riyal', country: 'Qatar', symbol: 'ر.ق' },
    KWD: { name: 'Kuwaiti Dinar', country: 'Kuwait', symbol: 'د.ك' },
    BHD: { name: 'Bahraini Dinar', country: 'Bahrain', symbol: '.د.ب' },
    OMR: { name: 'Omani Rial', country: 'Oman', symbol: 'ر.ع.' },
    JOD: { name: 'Jordanian Dinar', country: 'Jordan', symbol: 'د.ا' },
    LBP: { name: 'Lebanese Pound', country: 'Lebanon', symbol: 'ل.ل' },
    EGP: { name: 'Egyptian Pound', country: 'Egypt', symbol: 'ج.م' },
    ZAR: { name: 'South African Rand', country: 'South Africa', symbol: 'R' },
    NGN: { name: 'Nigerian Naira', country: 'Nigeria', symbol: '₦' },
    KES: { name: 'Kenyan Shilling', country: 'Kenya', symbol: 'KSh' },
    GHS: { name: 'Ghanaian Cedi', country: 'Ghana', symbol: 'GH₵' },
    MAD: { name: 'Moroccan Dirham', country: 'Morocco', symbol: 'د.م.' },
    TND: { name: 'Tunisian Dinar', country: 'Tunisia', symbol: 'د.ت' },
    DZD: { name: 'Algerian Dinar', country: 'Algeria', symbol: 'د.ج' },
    UGX: { name: 'Ugandan Shilling', country: 'Uganda', symbol: 'USh' },
    TZS: { name: 'Tanzanian Shilling', country: 'Tanzania', symbol: 'TSh' },
    MWK: { name: 'Malawian Kwacha', country: 'Malawi', symbol: 'MK' },
    ZMW: { name: 'Zambian Kwacha', country: 'Zambia', symbol: 'ZK' },
    BWP: { name: 'Botswana Pula', country: 'Botswana', symbol: 'P' },
    MUR: { name: 'Mauritian Rupee', country: 'Mauritius', symbol: '₨' },
    SCR: { name: 'Seychellois Rupee', country: 'Seychelles', symbol: '₨' },
    LKR: { name: 'Sri Lankan Rupee', country: 'Sri Lanka', symbol: 'Rs' },
    PKR: { name: 'Pakistani Rupee', country: 'Pakistan', symbol: '₨' },
    BDT: { name: 'Bangladeshi Taka', country: 'Bangladesh', symbol: '৳' },
    NPR: { name: 'Nepalese Rupee', country: 'Nepal', symbol: '₨' },
    MMK: { name: 'Myanmar Kyat', country: 'Myanmar', symbol: 'K' },
    KHR: { name: 'Cambodian Riel', country: 'Cambodia', symbol: '៛' },
    LAK: { name: 'Lao Kip', country: 'Laos', symbol: '₭' },
    MNT: { name: 'Mongolian Tögrög', country: 'Mongolia', symbol: '₮' },
    BYN: { name: 'Belarusian Ruble', country: 'Belarus', symbol: 'Br' },
    UAH: { name: 'Ukrainian Hryvnia', country: 'Ukraine', symbol: '₴' },
    MDL: { name: 'Moldovan Leu', country: 'Moldova', symbol: 'L' },
    RON: { name: 'Romanian Leu', country: 'Romania', symbol: 'lei' },
    BGN: { name: 'Bulgarian Lev', country: 'Bulgaria', symbol: 'лв' },
    HRK: { name: 'Croatian Kuna', country: 'Croatia', symbol: 'kn' },
    RSD: { name: 'Serbian Dinar', country: 'Serbia', symbol: 'дин.' },
    ALL: { name: 'Albanian Lek', country: 'Albania', symbol: 'L' },
    MKD: { name: 'Macedonian Denar', country: 'North Macedonia', symbol: 'ден' },
    GEL: { name: 'Georgian Lari', country: 'Georgia', symbol: '₾' },
    AMD: { name: 'Armenian Dram', country: 'Armenia', symbol: '֏' },
    AZN: { name: 'Azerbaijani Manat', country: 'Azerbaijan', symbol: '₼' },
    KZT: { name: 'Kazakhstani Tenge', country: 'Kazakhstan', symbol: '₸' },
    KGS: { name: 'Kyrgyzstani Som', country: 'Kyrgyzstan', symbol: 'с' },
    TJS: { name: 'Tajikistani Somoni', country: 'Tajikistan', symbol: 'ЅM' },
    TMT: { name: 'Turkmenistan Manat', country: 'Turkmenistan', symbol: 'T' },
    UZS: { name: 'Uzbekistani Som', country: 'Uzbekistan', symbol: "so'm" },
    AFN: { name: 'Afghan Afghani', country: 'Afghanistan', symbol: '\u060B' },
    IRR: { name: 'Iranian Rial', country: 'Iran', symbol: '\ufdfc' },
    IQD: { name: 'Iraqi Dinar', country: 'Iraq', symbol: '\u0639.\u062F' },
    SYP: { name: 'Syrian Pound', country: 'Syria', symbol: '\u00A3' },
    YER: { name: 'Yemeni Rial', country: 'Yemen', symbol: '\ufdfc' },
    SDG: { name: 'Sudanese Pound', country: 'Sudan', symbol: '\u062C.\u0633.' },
    SSP: { name: 'South Sudanese Pound', country: 'South Sudan', symbol: 'SSP' },
    SOS: { name: 'Somali Shilling', country: 'Somalia', symbol: 'S' },
    ETB: { name: 'Ethiopian Birr', country: 'Ethiopia', symbol: 'Br' },
    ERN: { name: 'Eritrean Nakfa', country: 'Eritrea', symbol: 'Nfk' },
    DJF: { name: 'Djiboutian Franc', country: 'Djibouti', symbol: 'Fdj' },
    KMF: { name: 'Comorian Franc', country: 'Comoros', symbol: 'CF' },
    MGA: { name: 'Malagasy Ariary', country: 'Madagascar', symbol: 'Ar' },
    MZN: { name: 'Mozambican Metical', country: 'Mozambique', symbol: 'MT' },
    ZWL: { name: 'Zimbabwean Dollar', country: 'Zimbabwe', symbol: 'Z$' },
    BOB: { name: 'Bolivian Boliviano', country: 'Bolivia', symbol: 'Bs' },
    PYG: { name: 'Paraguayan Guaraní', country: 'Paraguay', symbol: '\u20B2' },
    GYD: { name: 'Guyanese Dollar', country: 'Guyana', symbol: 'G$' },
    SRD: { name: 'Surinamese Dollar', country: 'Suriname', symbol: '$' },
    FJD: { name: 'Fiji Dollar', country: 'Fiji', symbol: 'FJ$' },
    WST: { name: 'Samoan Tālā', country: 'Samoa', symbol: 'T' },
    TOP: { name: 'Tongan Paʻanga', country: 'Tonga', symbol: 'T$' },
    VUV: { name: 'Vanuatu Vatu', country: 'Vanuatu', symbol: 'VT' },
    SBD: { name: 'Solomon Islands Dollar', country: 'Solomon Islands', symbol: 'SI$' },
    PGK: { name: 'Papua New Guinean Kina', country: 'Papua New Guinea', symbol: 'K' },
    NZD: { name: 'New Zealand Dollar', country: 'New Zealand', symbol: 'NZ$' },
    XPF: { name: 'CFP Franc', country: 'French Polynesia', symbol: '\u20A3' },
    XCD: { name: 'East Caribbean Dollar', country: 'Eastern Caribbean', symbol: 'EC$' },
    BBD: { name: 'Barbadian Dollar', country: 'Barbados', symbol: 'Bds$' },
    TTD: { name: 'Trinidad and Tobago Dollar', country: 'Trinidad and Tobago', symbol: 'TT$' },
    JMD: { name: 'Jamaican Dollar', country: 'Jamaica', symbol: 'J$' },
    HTG: { name: 'Haitian Gourde', country: 'Haiti', symbol: 'G' },
    DOP: { name: 'Dominican Peso', country: 'Dominican Republic', symbol: 'RD$' },
    CUP: { name: 'Cuban Peso', country: 'Cuba', symbol: '$' },
    BZD: { name: 'Belize Dollar', country: 'Belize', symbol: 'BZ$' },
    GTQ: { name: 'Guatemalan Quetzal', country: 'Guatemala', symbol: 'Q' },
    HNL: { name: 'Honduran Lempira', country: 'Honduras', symbol: 'L' },
    NIO: { name: 'Nicaraguan Córdoba', country: 'Nicaragua', symbol: 'C$' },
    CRC: { name: 'Costa Rican Colón', country: 'Costa Rica', symbol: '\u20A1' },
    PAB: { name: 'Panamanian Balboa', country: 'Panama', symbol: 'B/.' },
    ISK: { name: 'Icelandic Króna', country: 'Iceland', symbol: 'kr' },
    FOK: { name: 'Faroese Króna', country: 'Faroe Islands', symbol: 'kr' },
    GGP: { name: 'Guernsey Pound', country: 'Guernsey', symbol: '\u00A3' },
    JEP: { name: 'Jersey Pound', country: 'Jersey', symbol: '\u00A3' },
    IMP: { name: 'Manx Pound', country: 'Isle of Man', symbol: '\u00A3' },
    FKP: { name: 'Falkland Islands Pound', country: 'Falkland Islands', symbol: '\u00A3' },
    SHP: { name: 'Saint Helena Pound', country: 'Saint Helena', symbol: '\u00A3' },
    GIP: { name: 'Gibraltar Pound', country: 'Gibraltar', symbol: '\u00A3' },
    TVD: { name: 'Tuvaluan Dollar', country: 'Tuvalu', symbol: '$' },
    KID: { name: 'Kiribati Dollar', country: 'Kiribati', symbol: '$' },
    CVE: { name: 'Cape Verdean Escudo', country: 'Cape Verde', symbol: '$' },
    STN: { name: 'São Tomé and Príncipe Dobra', country: 'São Tomé and Príncipe', symbol: 'Db' },
    GMD: { name: 'Gambian Dalasi', country: 'Gambia', symbol: 'D' },
    GNF: { name: 'Guinean Franc', country: 'Guinea', symbol: 'FG' },
    SLL: { name: 'Sierra Leonean Leone', country: 'Sierra Leone', symbol: 'Le' },
    SLE: { name: 'Sierra Leonean Leone', country: 'Sierra Leone', symbol: 'Le' },
    LRD: { name: 'Liberian Dollar', country: 'Liberia', symbol: 'L$' },
    LSL: { name: 'Lesotho Loti', country: 'Lesotho', symbol: 'L' },
    SZL: { name: 'Swazi Lilangeni', country: 'Eswatini', symbol: 'L' },
    LYD: { name: 'Libyan Dinar', country: 'Libya', symbol: '\u0644.\u062F' },
    MRU: { name: 'Mauritanian Ouguiya', country: 'Mauritania', symbol: 'UM' },
    MVR: { name: 'Maldivian Rufiyaa', country: 'Maldives', symbol: 'Rf' },
    BIF: { name: 'Burundian Franc', country: 'Burundi', symbol: 'FBu' },
    CDF: { name: 'Congolese Franc', country: 'Democratic Republic of the Congo', symbol: 'FC' },
    XAF: { name: 'Central African CFA Franc', country: 'Central African Economic and Monetary Community', symbol: 'FCFA' },
    XOF: { name: 'West African CFA Franc', country: 'West African Economic and Monetary Union', symbol: 'CFA' },
    XDR: { name: 'Special Drawing Rights', country: 'International Monetary Fund', symbol: 'SDR' }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const validateInputs = () => {
    const { amount, fromCurrency, toCurrency } = formData;
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return false;
    }

    if (!fromCurrency || !toCurrency) {
      setError('Please select both currencies.');
      return false;
    }

    if (fromCurrency === toCurrency) {
      setError('Please select different currencies for conversion.');
      return false;
    }

    return true;
  };

  const fetchExchangeRates = async () => {
    setLoading(true);
    try {
      const API_KEY = '29806ca0329170a3c8348241';
      const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;
      
      const response = await fetch(API_URL);
      const data = await response.json();
      
      if (data.result === "success") {
        setExchangeRates(data.conversion_rates);
        setLastUpdated(new Date().toLocaleString());
        setError('');
      } else {
        throw new Error('Failed to fetch exchange rates');
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      setError('Error fetching exchange rates. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getExchangeRate = (fromCurrency, toCurrency) => {
    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
      return null;
    }
    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];
    return toRate / fromRate;
  };

  const convertCurrency = () => {
    if (!validateInputs()) return;

    try {
      const { amount, fromCurrency, toCurrency } = formData;
      const rate = getExchangeRate(fromCurrency, toCurrency);
      
      if (rate === null) {
        setError('Exchange rate not available for selected currencies.');
        return;
      }

      const convertedAmount = parseFloat(amount) * rate;
      
      setResult({
        originalAmount: parseFloat(amount),
        convertedAmount: convertedAmount,
        fromCurrency,
        toCurrency,
        rate,
        fromInfo: currencyInfo[fromCurrency] || { name: fromCurrency, country: 'Unknown', symbol: fromCurrency },
        toInfo: currencyInfo[toCurrency] || { name: toCurrency, country: 'Unknown', symbol: toCurrency }
      });
      setError('');
    } catch (error) {
      setError('Error calculating conversion. Please try again.');
      setResult(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    convertCurrency();
  };

  const handleReset = () => {
    setFormData({
      amount: '',
      fromCurrency: 'USD',
      toCurrency: 'EUR'
    });
    setResult(null);
    setError('');
  };

  const swapCurrencies = () => {
    setFormData(prev => ({
      ...prev,
      fromCurrency: prev.toCurrency,
      toCurrency: prev.fromCurrency
    }));
  };

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const relatedTools = [
    { name: 'Mortgage Calculator', path: '/finance/mortgage-calculator', icon: 'fas fa-home' },
    { name: 'Loan Calculator', path: '/finance/loan-calculator', icon: 'fas fa-hand-holding-usd' },
    { name: 'Compound Interest Calculator', path: '/finance/compound-interest-calculator', icon: 'fas fa-chart-area' },
    { name: 'ROI Calculator', path: '/finance/roi-calculator', icon: 'fas fa-trending-up' },
    { name: 'Amortization Calculator', path: '/finance/amortization-calculator', icon: 'fas fa-chart-line' },
    { name: 'Business Loan Calculator', path: '/finance/business-loan-calculator', icon: 'fas fa-briefcase' }
  ];

  const categories = [
    {
      name: 'Currency & Exchange',
      tools: [
        { name: 'Currency Calculator', path: '/finance/currency-calculator' },
        { name: 'Mortgage Calculator', path: '/finance/mortgage-calculator' },
        { name: 'Loan Calculator', path: '/finance/loan-calculator' }
      ]
    },
    {
      name: 'Investment Calculators',
      tools: [
        { name: 'Compound Interest Calculator', path: '/finance/compound-interest-calculator' },
        { name: 'ROI Calculator', path: '/finance/roi-calculator' }
      ]
    },
    {
      name: 'Business Finance',
      tools: [
        { name: 'Business Loan Calculator', path: '/finance/business-loan-calculator' },
        { name: 'Amortization Calculator', path: '/finance/amortization-calculator' }
      ]
    }
  ];

  // Content sections for the Currency Calculator
  const contentSections = [
    {
      id: "what-is-currency",
      title: "What is a Currency Calculator?",
      intro: [
        "A currency calculator is a financial tool that helps you convert between different world currencies using real-time exchange rates. It provides accurate conversion rates and helps you understand the value of money across different countries and regions."
      ],
      list: [
        "Real-time Exchange Rates: Uses current market rates for accurate conversions",
        "Global Currency Support: Supports 170+ world currencies",
        "Instant Calculations: Provides immediate conversion results",
        "Historical Context: Shows exchange rate information",
        "User-friendly Interface: Easy-to-use design for quick conversions"
      ]
    },
    {
      id: "currency-formula",
      title: "Currency Conversion Formula",
      intro: [
        "Currency conversion uses a simple mathematical formula based on exchange rates."
      ],
      content: (
        <div>
          <div className="formula-section">
            <h3>Currency Conversion Formula</h3>
            <div className="math-formula">
              Converted Amount = Original Amount × Exchange Rate
            </div>
            <p>Where:</p>
            <ul>
              <li><strong>Original Amount</strong> = Amount in source currency</li>
              <li><strong>Exchange Rate</strong> = Rate from source to target currency</li>
              <li><strong>Converted Amount</strong> = Result in target currency</li>
            </ul>
            <div className="example-box">
              <h4>Example:</h4>
              <p>Converting 100 USD to EUR with rate 0.85 EUR/USD:</p>
              <p>100 USD × 0.85 = 85 EUR</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "how-to-use",
      title: "How to Use the Currency Calculator",
      intro: [
        "Follow these simple steps to convert between currencies accurately."
      ],
      steps: [
        "Enter the amount you want to convert",
        "Select the source currency (currency you're converting from)",
        "Select the target currency (currency you're converting to)",
        "Click 'Convert Currency' to see the result",
        "View the exchange rate and converted amount",
        "Use the swap button to quickly reverse the conversion"
      ]
    },
    {
      id: "understanding-results",
      title: "Understanding Your Results",
      intro: [
        "The calculator provides detailed information to help you understand currency conversion."
      ],
      list: [
        "Exchange Rate: The current rate between the two currencies",
        "Original Amount: The amount you entered in the source currency",
        "Converted Amount: The result in the target currency",
        "Currency Information: Full names and countries for each currency",
        "Last Updated: When the exchange rates were last refreshed",
        "Real-time Data: Rates are updated regularly for accuracy"
      ]
    },
    {
      id: "factors-affecting-rates",
      title: "Factors Affecting Exchange Rates",
      intro: [
        "Exchange rates are influenced by various economic and political factors."
      ],
      content: (
        <div className="factors-grid">
          <div className="factor-item">
            <h4><i className="fas fa-chart-line"></i>Economic Performance</h4>
            <p>Strong economic growth typically strengthens a currency, while economic weakness can weaken it. GDP growth, employment rates, and economic indicators all play a role.</p>
          </div>
          <div className="factor-item">
            <h4><i className="fas fa-percentage"></i>Interest Rates</h4>
            <p>Higher interest rates attract foreign investment, increasing demand for the currency and strengthening its value. Central bank policies significantly impact rates.</p>
          </div>
          <div className="factor-item">
            <h4><i className="fas fa-balance-scale"></i>Inflation Rates</h4>
            <p>Lower inflation rates typically strengthen a currency, while high inflation can weaken it. Purchasing power parity affects long-term exchange rates.</p>
          </div>
          <div className="factor-item">
            <h4><i className="fas fa-globe"></i>Political Stability</h4>
            <p>Political uncertainty and instability can weaken a currency, while stable governments and policies typically strengthen it. Elections and policy changes matter.</p>
          </div>
          <div className="factor-item">
            <h4><i className="fas fa-handshake"></i>Trade Balances</h4>
            <p>Countries with trade surpluses (exporting more than importing) typically have stronger currencies, while trade deficits can weaken currencies.</p>
          </div>
          <div className="factor-item">
            <h4><i className="fas fa-users"></i>Market Sentiment</h4>
            <p>Investor confidence and market sentiment can cause rapid currency movements. News, rumors, and market psychology all influence rates.</p>
          </div>
        </div>
      )
    },
    {
      id: "tips-for-users",
      title: "Tips for Currency Conversion",
      intro: [
        "Use these strategies to get the best value when converting currencies."
      ],
      list: [
        "Check multiple sources for exchange rates to find the best deal",
        "Be aware of fees and commissions charged by banks and exchange services",
        "Consider timing - exchange rates fluctuate throughout the day",
        "Use credit cards with no foreign transaction fees when traveling",
        "Keep track of exchange rates for planning future transactions",
        "Understand that rates shown are mid-market rates (actual rates may differ)",
        "Consider using currency converter apps for real-time rates",
        "Plan large currency exchanges during favorable rate periods"
      ]
    },
    {
      id: "common-mistakes",
      title: "Common Currency Conversion Mistakes",
      intro: [
        "Avoid these common pitfalls when dealing with currency conversion."
      ],
      list: [
        "Not accounting for exchange fees and commissions in calculations",
        "Using outdated exchange rates for current transactions",
        "Ignoring the difference between buy and sell rates",
        "Not considering the timing of currency exchanges",
        "Forgetting to check for hidden fees in international transactions",
        "Relying on a single source for exchange rate information",
        "Not understanding the impact of market volatility on rates",
        "Ignoring the difference between official and black market rates"
      ]
    }
  ];

  return (
    <div className="tool-page">
      <ToolHero
        title="Currency Calculator"
        description="Convert between 170+ world currencies with real-time exchange rates. Get accurate currency conversions for travel, business, and international transactions."
        icon="fas fa-exchange-alt"
        features={[
          "Real-time exchange rates",
          "170+ world currencies",
          "Instant conversions",
          "Currency information"
        ]}
      />

      <div className="container">
        <div className="tool-main">
          <ToolLayout
            sidebarProps={{
              relatedTools,
              categories
            }}
          >
            {/* Calculator Section */}
            <section className="calculator-section">
              <h2 className="section-title">
                <i className="fas fa-calculator"></i>
                Currency Calculator
              </h2>

              <form className="calculator-form" onSubmit={handleSubmit}>
                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="amount" className="input-label">
                      Amount:
                    </label>
                    <input
                      type="number"
                      id="amount"
                      className="input-field"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      placeholder="e.g., 100"
                      min="0"
                      step="0.01"
                    />
                    <small className="input-help">
                      Enter the amount you want to convert
                    </small>
                  </div>
                </div>

                <div className="currency-selectors">
                  <div className="input-row">
                    <div className="input-group">
                      <label htmlFor="from-currency" className="input-label">
                        From Currency:
                      </label>
                      <select
                        id="from-currency"
                        className="input-field"
                        value={formData.fromCurrency}
                        onChange={(e) => handleInputChange('fromCurrency', e.target.value)}
                      >
                        {Object.keys(currencyInfo).map(currency => (
                          <option key={currency} value={currency}>
                            {currency} - {currencyInfo[currency].name}
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
                      <label htmlFor="to-currency" className="input-label">
                        To Currency:
                      </label>
                      <select
                        id="to-currency"
                        className="input-field"
                        value={formData.toCurrency}
                        onChange={(e) => handleInputChange('toCurrency', e.target.value)}
                      >
                        {Object.keys(currencyInfo).map(currency => (
                          <option key={currency} value={currency}>
                            {currency} - {currencyInfo[currency].name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="calculator-actions">
                  <button type="submit" className="btn-calculate" disabled={loading}>
                    <i className="fas fa-calculator"></i>
                    {loading ? 'Loading...' : 'Convert Currency'}
                  </button>
                  <button type="button" className="btn-reset" onClick={handleReset}>
                    <i className="fas fa-redo"></i>
                    Reset
                  </button>
                </div>

                {lastUpdated && (
                  <div className="rate-info">
                    <small>
                      <i className="fas fa-clock"></i>
                      Last updated: {lastUpdated}
                    </small>
                  </div>
                )}
              </form>

              {/* Results Section */}
              {error && (
                <section className="result-section error show">
                  <div className="result-content">
                    <i className="fas fa-exclamation-triangle"></i>
                    {error}
                  </div>
                </section>
              )}

              {result && (
                <section className="result-section show">
                  <h3 className="result-title">
                    <i className="fas fa-check-circle"></i>
                    Currency Conversion Results
                  </h3>
                  <div className="result-content">
                    <div className="result-main">
                      <div className="conversion-display">
                        <div className="amount-display">
                          <span className="original-amount">
                            {result.originalAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} {result.fromCurrency}
                          </span>
                          <i className="fas fa-arrow-right"></i>
                          <span className="converted-amount">
                            {result.convertedAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} {result.toCurrency}
                          </span>
                        </div>
                      </div>

                      <div className="result-item">
                        <strong>Exchange Rate:</strong>
                        <div className="rate-display">
                          1 {result.fromCurrency} = {result.rate.toFixed(6)} {result.toCurrency}
                        </div>
                      </div>

                      <div className="currency-info-grid">
                        <div className="currency-info">
                          <h4>From Currency</h4>
                          <p><strong>{result.fromCurrency}</strong> - {result.fromInfo.name}</p>
                          <p><small>{result.fromInfo.country}</small></p>
                        </div>
                        <div className="currency-info">
                          <h4>To Currency</h4>
                          <p><strong>{result.toCurrency}</strong> - {result.toInfo.name}</p>
                          <p><small>{result.toInfo.country}</small></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </section>

            {/* Table of Contents & Feedback */}
            <div className="toc-feedback-section">
              <div className="toc-feedback-container">
                <TableOfContents
                  sections={[
                    { id: "what-is-currency", title: "What is a Currency Calculator?" },
                    { id: "currency-formula", title: "Currency Conversion Formula" },
                    { id: "how-to-use", title: "How to Use" },
                    { id: "understanding-results", title: "Understanding Results" },
                    { id: "factors-affecting-rates", title: "Factors Affecting Rates" },
                    { id: "tips-for-users", title: "Tips for Users" },
                    { id: "common-mistakes", title: "Common Mistakes to Avoid" },
                    { id: "faq", title: "FAQ" }
                  ]}
                />
                <FeedbackForm
                  title="Feedback"
                  icon="fas fa-comment"
                />
              </div>
            </div>

            {/* Content Sections */}
            <ContentSection sections={contentSections} />

            <FAQSection
              title="Frequently Asked Questions"
              id="faq"
              faqs={[
                {
                  question: "How often are exchange rates updated?",
                  answer: "Exchange rates are updated in real-time throughout the day. The rates reflect current market conditions and are sourced from reliable financial data providers. The 'Last Updated' timestamp shows when the rates were last refreshed."
                },
                {
                  question: "Why do exchange rates fluctuate?",
                  answer: "Exchange rates fluctuate due to various factors including economic performance, interest rates, inflation, political stability, trade balances, and market sentiment. These factors influence the supply and demand for different currencies."
                },
                {
                  question: "Are the rates shown the same as bank rates?",
                  answer: "The rates shown are mid-market rates (the average of buy and sell rates). Banks and currency exchange services typically add a markup or commission, so the actual rate you receive may differ from the displayed rate."
                },
                {
                  question: "What's the difference between buy and sell rates?",
                  answer: "The buy rate is what you pay when purchasing foreign currency, while the sell rate is what you receive when selling foreign currency. The difference (spread) is how currency exchange services make money."
                },
                {
                  question: "How accurate are the currency conversions?",
                  answer: "The conversions are based on real-time exchange rates from reliable financial data sources. However, actual rates may vary slightly due to market fluctuations and any fees or commissions charged by exchange services."
                },
                {
                  question: "Can I convert any amount of currency?",
                  answer: "Yes, you can convert any amount, but be aware that very large amounts may require special handling by banks or currency exchange services. Some services have minimum or maximum limits for transactions."
                }
              ]}
            />
          </ToolLayout>
        </div>
      </div>
    </div>
  );
};

export default CurrencyCalculator;
