/**
 * Currency Calculator - JavaScript Utility Functions
 * Handles currency conversion, API integration, and calculations
 */

class CurrencyCalculator {
  constructor() {
    this.API_KEY = '29806ca0329170a3c8348241';
    this.API_BASE_URL = 'https://v6.exchangerate-api.com/v6';
    this.exchangeRates = {};
    this.lastUpdated = null;
    this.baseCurrency = 'USD';
  }

  /**
   * Fetch exchange rates from the API
   * @param {string} baseCurrency - Base currency for rates (default: USD)
   * @returns {Promise<Object>} Exchange rates object
   */
  async fetchExchangeRates(baseCurrency = 'USD') {
    try {
      const url = `${this.API_BASE_URL}/${this.API_KEY}/latest/${baseCurrency}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.result === "success") {
        this.exchangeRates = data.conversion_rates;
        this.lastUpdated = new Date();
        this.baseCurrency = baseCurrency;
        return this.exchangeRates;
      } else {
        throw new Error('Failed to fetch exchange rates');
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      throw new Error('Failed to fetch exchange rates. Please try again later.');
    }
  }

  /**
   * Get exchange rate between two currencies
   * @param {string} fromCurrency - Source currency code
   * @param {string} toCurrency - Target currency code
   * @returns {number|null} Exchange rate or null if not available
   */
  getExchangeRate(fromCurrency, toCurrency) {
    if (!this.exchangeRates[fromCurrency] || !this.exchangeRates[toCurrency]) {
      return null;
    }
    
    const fromRate = this.exchangeRates[fromCurrency];
    const toRate = this.exchangeRates[toCurrency];
    return toRate / fromRate;
  }

  /**
   * Convert amount from one currency to another
   * @param {number} amount - Amount to convert
   * @param {string} fromCurrency - Source currency code
   * @param {string} toCurrency - Target currency code
   * @returns {Object} Conversion result with amount and rate
   */
  convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return {
        originalAmount: amount,
        convertedAmount: amount,
        rate: 1,
        fromCurrency,
        toCurrency
      };
    }

    const rate = this.getExchangeRate(fromCurrency, toCurrency);
    
    if (rate === null) {
      throw new Error('Exchange rate not available for selected currencies');
    }

    const convertedAmount = amount * rate;
    
    return {
      originalAmount: amount,
      convertedAmount: convertedAmount,
      rate: rate,
      fromCurrency,
      toCurrency
    };
  }

  /**
   * Get all available currencies
   * @returns {Array} Array of currency codes
   */
  getAvailableCurrencies() {
    return Object.keys(this.exchangeRates);
  }

  /**
   * Format currency amount with proper formatting
   * @param {number} amount - Amount to format
   * @param {string} currencyCode - Currency code
   * @param {Object} options - Formatting options
   * @returns {string} Formatted currency string
   */
  formatCurrency(amount, currencyCode, options = {}) {
    const defaultOptions = {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      style: 'decimal'
    };
    
    const formatOptions = { ...defaultOptions, ...options };
    
    try {
      return amount.toLocaleString('en-US', formatOptions);
    } catch (error) {
      return amount.toFixed(2);
    }
  }

  /**
   * Get currency information
   * @param {string} currencyCode - Currency code
   * @returns {Object} Currency information
   */
  getCurrencyInfo(currencyCode) {
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
      UZS: { name: 'Uzbekistani Som', country: 'Uzbekistan', symbol: 'som' },
      AFN: { name: 'Afghan Afghani', country: 'Afghanistan', symbol: '؋' },
      IRR: { name: 'Iranian Rial', country: 'Iran', symbol: '﷼' },
      IQD: { name: 'Iraqi Dinar', country: 'Iraq', symbol: 'ع.د' },
      SYP: { name: 'Syrian Pound', country: 'Syria', symbol: '£' },
      YER: { name: 'Yemeni Rial', country: 'Yemen', symbol: '﷼' },
      SDG: { name: 'Sudanese Pound', country: 'Sudan', symbol: 'ج.س.' },
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
      PYG: { name: 'Paraguayan Guaraní', country: 'Paraguay', symbol: '₲' },
      GYD: { name: 'Guyanese Dollar', country: 'Guyana', symbol: 'G$' },
      SRD: { name: 'Surinamese Dollar', country: 'Suriname', symbol: '$' },
      FJD: { name: 'Fiji Dollar', country: 'Fiji', symbol: 'FJ$' },
      WST: { name: 'Samoan Tālā', country: 'Samoa', symbol: 'T' },
      TOP: { name: 'Tongan Paʻanga', country: 'Tonga', symbol: 'T$' },
      VUV: { name: 'Vanuatu Vatu', country: 'Vanuatu', symbol: 'VT' },
      SBD: { name: 'Solomon Islands Dollar', country: 'Solomon Islands', symbol: 'SI$' },
      PGK: { name: 'Papua New Guinean Kina', country: 'Papua New Guinea', symbol: 'K' },
      NZD: { name: 'New Zealand Dollar', country: 'New Zealand', symbol: 'NZ$' },
      XPF: { name: 'CFP Franc', country: 'French Polynesia', symbol: '₣' },
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
      CRC: { name: 'Costa Rican Colón', country: 'Costa Rica', symbol: '₡' },
      PAB: { name: 'Panamanian Balboa', country: 'Panama', symbol: 'B/.' },
      ISK: { name: 'Icelandic Króna', country: 'Iceland', symbol: 'kr' },
      FOK: { name: 'Faroese Króna', country: 'Faroe Islands', symbol: 'kr' },
      GGP: { name: 'Guernsey Pound', country: 'Guernsey', symbol: '£' },
      JEP: { name: 'Jersey Pound', country: 'Jersey', symbol: '£' },
      IMP: { name: 'Manx Pound', country: 'Isle of Man', symbol: '£' },
      FKP: { name: 'Falkland Islands Pound', country: 'Falkland Islands', symbol: '£' },
      SHP: { name: 'Saint Helena Pound', country: 'Saint Helena', symbol: '£' },
      GIP: { name: 'Gibraltar Pound', country: 'Gibraltar', symbol: '£' },
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
      LYD: { name: 'Libyan Dinar', country: 'Libya', symbol: 'ل.د' },
      MRU: { name: 'Mauritanian Ouguiya', country: 'Mauritania', symbol: 'UM' },
      MVR: { name: 'Maldivian Rufiyaa', country: 'Maldives', symbol: 'Rf' },
      BIF: { name: 'Burundian Franc', country: 'Burundi', symbol: 'FBu' },
      CDF: { name: 'Congolese Franc', country: 'Democratic Republic of the Congo', symbol: 'FC' },
      XAF: { name: 'Central African CFA Franc', country: 'Central African Economic and Monetary Community', symbol: 'FCFA' },
      XOF: { name: 'West African CFA Franc', country: 'West African Economic and Monetary Union', symbol: 'CFA' },
      XDR: { name: 'Special Drawing Rights', country: 'International Monetary Fund', symbol: 'SDR' }
    };

    return currencyInfo[currencyCode] || { 
      name: currencyCode, 
      country: 'Unknown', 
      symbol: currencyCode 
    };
  }

  /**
   * Validate currency input
   * @param {number} amount - Amount to validate
   * @param {string} fromCurrency - Source currency
   * @param {string} toCurrency - Target currency
   * @returns {Object} Validation result
   */
  validateInput(amount, fromCurrency, toCurrency) {
    const errors = [];

    if (!amount || isNaN(amount) || amount <= 0) {
      errors.push('Please enter a valid amount greater than 0.');
    }

    if (!fromCurrency || !toCurrency) {
      errors.push('Please select both currencies.');
    }

    if (fromCurrency === toCurrency) {
      errors.push('Please select different currencies for conversion.');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Get last updated timestamp
   * @returns {Date|null} Last updated timestamp
   */
  getLastUpdated() {
    return this.lastUpdated;
  }

  /**
   * Format last updated timestamp
   * @returns {string} Formatted timestamp
   */
  getFormattedLastUpdated() {
    if (!this.lastUpdated) {
      return 'Never';
    }
    return this.lastUpdated.toLocaleString();
  }

  /**
   * Check if rates are stale (older than 1 hour)
   * @returns {boolean} True if rates are stale
   */
  areRatesStale() {
    if (!this.lastUpdated) {
      return true;
    }
    
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    return (Date.now() - this.lastUpdated.getTime()) > oneHour;
  }

  /**
   * Get popular currency pairs
   * @returns {Array} Array of popular currency pairs
   */
  getPopularPairs() {
    return [
      { from: 'USD', to: 'EUR', name: 'US Dollar to Euro' },
      { from: 'USD', to: 'GBP', name: 'US Dollar to British Pound' },
      { from: 'USD', to: 'JPY', name: 'US Dollar to Japanese Yen' },
      { from: 'EUR', to: 'USD', name: 'Euro to US Dollar' },
      { from: 'GBP', to: 'USD', name: 'British Pound to US Dollar' },
      { from: 'EUR', to: 'GBP', name: 'Euro to British Pound' },
      { from: 'USD', to: 'CAD', name: 'US Dollar to Canadian Dollar' },
      { from: 'USD', to: 'AUD', name: 'US Dollar to Australian Dollar' },
      { from: 'USD', to: 'CHF', name: 'US Dollar to Swiss Franc' },
      { from: 'USD', to: 'CNY', name: 'US Dollar to Chinese Yuan' }
    ];
  }

  /**
   * Calculate percentage change between two rates
   * @param {number} oldRate - Old exchange rate
   * @param {number} newRate - New exchange rate
   * @returns {number} Percentage change
   */
  calculatePercentageChange(oldRate, newRate) {
    if (oldRate === 0) return 0;
    return ((newRate - oldRate) / oldRate) * 100;
  }

  /**
   * Get currency symbol
   * @param {string} currencyCode - Currency code
   * @returns {string} Currency symbol
   */
  getCurrencySymbol(currencyCode) {
    const info = this.getCurrencyInfo(currencyCode);
    return info.symbol;
  }

  /**
   * Format exchange rate for display
   * @param {number} rate - Exchange rate
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted rate
   */
  formatExchangeRate(rate, decimals = 6) {
    return rate.toFixed(decimals);
  }
}

// Utility functions for currency conversion
export const currencyUtils = {
  /**
   * Convert amount using provided rate
   * @param {number} amount - Amount to convert
   * @param {number} rate - Exchange rate
   * @returns {number} Converted amount
   */
  convertAmount: (amount, rate) => {
    return amount * rate;
  },

  /**
   * Calculate reverse rate
   * @param {number} rate - Exchange rate
   * @returns {number} Reverse rate
   */
  getReverseRate: (rate) => {
    return 1 / rate;
  },

  /**
   * Format currency amount with symbol
   * @param {number} amount - Amount to format
   * @param {string} currencyCode - Currency code
   * @returns {string} Formatted amount with symbol
   */
  formatWithSymbol: (amount, currencyCode) => {
    const symbols = {
      USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', INR: '₹',
      CAD: 'C$', AUD: 'A$', CHF: 'CHF', SEK: 'kr', NOK: 'kr', DKK: 'kr'
    };
    
    const symbol = symbols[currencyCode] || currencyCode;
    return `${symbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  },

  /**
   * Validate currency code format
   * @param {string} currencyCode - Currency code to validate
   * @returns {boolean} True if valid
   */
  isValidCurrencyCode: (currencyCode) => {
    return /^[A-Z]{3}$/.test(currencyCode);
  },

  /**
   * Get currency name from code
   * @param {string} currencyCode - Currency code
   * @returns {string} Currency name
   */
  getCurrencyName: (currencyCode) => {
    const calculator = new CurrencyCalculator();
    const info = calculator.getCurrencyInfo(currencyCode);
    return info.name;
  }
};

// Export the main class
export default CurrencyCalculator;
