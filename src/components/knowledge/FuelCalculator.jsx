import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import '../../assets/css/knowledge/fuel-calculator.css';

const FuelCalculator = () => {
  const [formData, setFormData] = useState({
    distance: '',
    fuelEfficiency: '',
    fuelPrice: '',
    isRoundTrip: false,
    distanceUnit: 'miles',
    efficiencyUnit: 'mpg',
    currency: 'usd',
    passengers: 1
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Tool data for ToolPageLayout
  const toolData = {
    name: "Fuel Cost Calculator",
    description: "Calculate your fuel costs for any trip with our comprehensive fuel calculator. Get accurate estimates for single or round trips, with support for multiple units and currencies.",
    category: "Knowledge",
    icon: "fas fa-gas-pump",
    breadcrumb: ['Knowledge', 'Calculators', 'Fuel Cost Calculator'],
    keywords: ["fuel", "cost", "trip", "gas", "mileage", "efficiency", "travel", "budget"]
  };

  // Categories for navigation
  const categories = [
    { name: "Knowledge", url: "/knowledge" },
    { name: "Fuel Cost Calculator", url: "/knowledge/calculators/fuel-calculator" }
  ];

  // Related tools
  const relatedTools = [
    { name: "GPA Calculator", url: "/knowledge/calculators/gpa-calculator", icon: "fas fa-graduation-cap" },
    { name: "Age Calculator", url: "/knowledge/calculators/age-calculator", icon: "fas fa-calendar-alt" },
    { name: "WPM Calculator", url: "/knowledge/calculators/wpm-calculator", icon: "fas fa-keyboard" },
    { name: "Habit Formation Calculator", url: "/knowledge/calculators/habit-formation-calculator", icon: "fas fa-calendar-check" },
    { name: "MBTI Calculator", url: "/knowledge/calculators/mbti-calculator", icon: "fas fa-user-friends" },
    { name: "Language Level Calculator", url: "/knowledge/calculators/language-level-calculator", icon: "fas fa-language" },
    { name: "Zakat Calculator", url: "/knowledge/calculators/zakat-calculator", icon: "fas fa-mosque" }
  ];

  // Currency options
  const currencyOptions = [
    { value: 'usd', label: 'USD - US Dollar ($)' },
    { value: 'eur', label: 'EUR - Euro (€)' },
    { value: 'gbp', label: 'GBP - British Pound (£)' }
  ];

  // Distance unit options
  const distanceUnitOptions = [
    { value: 'miles', label: 'Miles' },
    { value: 'kilometers', label: 'Kilometers' }
  ];

  // Efficiency unit options
  const efficiencyUnitOptions = [
    { value: 'mpg', label: 'MPG (Miles per Gallon)' },
    { value: 'kpl', label: 'km/L (Kilometers per Liter)' }
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Calculate fuel cost
  const calculateFuelCost = () => {
    try {
      const { distance, fuelEfficiency, fuelPrice, isRoundTrip, distanceUnit, efficiencyUnit, currency, passengers } = formData;
      
      // Validation
      if (!distance || distance <= 0) {
        setError('Please enter a valid distance.');
        return;
      }

      if (!fuelEfficiency || fuelEfficiency <= 0) {
        setError('Please enter a valid fuel efficiency.');
        return;
      }

      if (!fuelPrice || fuelPrice <= 0) {
        setError('Please enter a valid fuel price.');
        return;
      }

      // Convert all measurements to a standard unit (miles and gallons)
      let standardDistance = parseFloat(distance);
      let standardEfficiency = parseFloat(fuelEfficiency);

      // Convert kilometers to miles if needed
      if (distanceUnit === 'kilometers') {
        standardDistance = standardDistance * 0.621371;
      }

      // Convert km/L to MPG if needed
      if (efficiencyUnit === 'kpl') {
        standardEfficiency = standardEfficiency * 2.35215;
      }

      // Calculate total distance
      const totalDistance = isRoundTrip ? standardDistance * 2 : standardDistance;

      // Calculate fuel needed
      const fuelNeeded = totalDistance / standardEfficiency;

      // Calculate total cost
      const totalCost = fuelNeeded * parseFloat(fuelPrice);
      
      // Calculate cost per person
      const costPerPerson = totalCost / parseInt(passengers);

      setResult({
        totalCost,
        costPerPerson,
        totalDistance,
        fuelNeeded,
        standardEfficiency,
        fuelPrice: parseFloat(fuelPrice),
        passengers: parseInt(passengers),
        currency,
        isRoundTrip,
        distanceUnit,
        efficiencyUnit
      });

      setError('');
    } catch (err) {
      setError('Error calculating fuel cost. Please check your inputs.');
      console.error('Calculation error:', err);
    }
  };

  // Reset calculator
  const resetCalculator = () => {
    setFormData({
      distance: '',
      fuelEfficiency: '',
      fuelPrice: '',
      isRoundTrip: false,
      distanceUnit: 'miles',
      efficiencyUnit: 'mpg',
      currency: 'usd',
      passengers: 1
    });
    setResult(null);
    setError('');
  };

  // Format number with commas and 2 decimal places
  const formatNumber = (num) => {
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Get currency symbol
  const getCurrencySymbol = (currency) => {
    const symbols = {
      'usd': '$',
      'eur': '€',
      'gbp': '£'
    };
    return symbols[currency] || '$';
  };

  // Load external JavaScript
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/src/assets/js/knowledge/fuel-calculator.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="/src/assets/js/knowledge/fuel-calculator.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  // Table of Contents data
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-fuel-cost', title: 'What is Fuel Cost?' },
    { id: 'fuel-efficiency', title: 'Fuel Efficiency' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'calculation-method', title: 'Calculation Method' },
    { id: 'examples', title: 'Examples' },
    { id: 'significance', title: 'Significance' },
    { id: 'functionality', title: 'Functionality' },
    { id: 'applications', title: 'Applications' }
  ];

  // FAQ data
  const faqData = [
    {
      question: "How accurate is the fuel cost calculation?",
      answer: "The calculation is based on the fuel efficiency and price you provide. Accuracy depends on real-world driving conditions, traffic, weather, and vehicle maintenance. Consider it an estimate for planning purposes."
    },
    {
      question: "What's the difference between MPG and km/L?",
      answer: "MPG (Miles per Gallon) is used in the US and measures how many miles a vehicle can travel on one gallon of fuel. km/L (Kilometers per Liter) is used in many other countries and measures kilometers per liter of fuel."
    },
    {
      question: "Should I use city or highway fuel efficiency?",
      answer: "Use the fuel efficiency that best matches your trip conditions. City driving typically has lower efficiency due to stop-and-go traffic, while highway driving is more efficient. For mixed trips, use an average of both."
    },
    {
      question: "How do I find my vehicle's fuel efficiency?",
      answer: "Check your vehicle's manual, fuel economy label, or use online databases. You can also calculate it by dividing miles driven by gallons used over several fill-ups. Many modern vehicles display real-time fuel efficiency."
    },
    {
      question: "Does the calculator account for different fuel types?",
      answer: "The calculator works with any fuel type (gasoline, diesel, etc.) as long as you enter the correct price per gallon/liter. Make sure to use the appropriate price for your fuel type."
    },
    {
      question: "Can I calculate costs for multiple passengers?",
      answer: "Yes! Enter the number of passengers to see both total cost and cost per person. This is helpful for carpooling or family trips where you want to split fuel costs."
    }
  ];

  return (
    <ToolPageLayout 
      toolData={toolData} 
      categories={categories} 
      relatedTools={relatedTools}
    >
      <CalculatorSection
        title="Fuel Cost Calculator"
        description="Calculate your fuel costs for any trip with accurate estimates and multiple unit support."
        onCalculate={calculateFuelCost}
        calculateButtonText="Calculate Fuel Cost"
        showCalculateButton={true}
      >
        <div className="fuel-calculator-form">
          <div className="fuel-form-section">
            <h3>Trip Information</h3>
            <div className="fuel-form-row">
              <div className="fuel-form-group">
                <label htmlFor="distance" className="fuel-form-label">
                  <i className="fas fa-route"></i>
                  Distance
                </label>
                <input
                  type="number"
                  id="distance"
                  name="distance"
                  className="fuel-form-input"
                  value={formData.distance}
                  onChange={handleInputChange}
                  placeholder="0"
                  step="0.1"
                  min="0"
                />
              </div>
              <div className="fuel-form-group">
                <label htmlFor="distance-unit" className="fuel-form-label">
                  <i className="fas fa-ruler"></i>
                  Distance Unit
                </label>
                <select
                  id="distance-unit"
                  name="distanceUnit"
                  className="fuel-form-select"
                  value={formData.distanceUnit}
                  onChange={handleInputChange}
                >
                  {distanceUnitOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="fuel-form-row">
              <div className="fuel-form-group">
                <label htmlFor="fuel-efficiency" className="fuel-form-label">
                  <i className="fas fa-tachometer-alt"></i>
                  Fuel Efficiency
                </label>
                <input
                  type="number"
                  id="fuel-efficiency"
                  name="fuelEfficiency"
                  className="fuel-form-input"
                  value={formData.fuelEfficiency}
                  onChange={handleInputChange}
                  placeholder="0"
                  step="0.1"
                  min="0"
                />
              </div>
              <div className="fuel-form-group">
                <label htmlFor="efficiency-unit" className="fuel-form-label">
                  <i className="fas fa-chart-line"></i>
                  Efficiency Unit
                </label>
                <select
                  id="efficiency-unit"
                  name="efficiencyUnit"
                  className="fuel-form-select"
                  value={formData.efficiencyUnit}
                  onChange={handleInputChange}
                >
                  {efficiencyUnitOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="fuel-form-section">
            <h3>Fuel & Cost Information</h3>
            <div className="fuel-form-row">
              <div className="fuel-form-group">
                <label htmlFor="fuel-price" className="fuel-form-label">
                  <i className="fas fa-dollar-sign"></i>
                  Fuel Price
                </label>
                <input
                  type="number"
                  id="fuel-price"
                  name="fuelPrice"
                  className="fuel-form-input"
                  value={formData.fuelPrice}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="fuel-form-group">
                <label htmlFor="currency" className="fuel-form-label">
                  <i className="fas fa-coins"></i>
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  className="fuel-form-select"
                  value={formData.currency}
                  onChange={handleInputChange}
                >
                  {currencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="fuel-form-section">
            <h3>Trip Options</h3>
            <div className="fuel-form-row">
              <div className="fuel-form-group">
                <label htmlFor="passengers" className="fuel-form-label">
                  <i className="fas fa-users"></i>
                  Number of Passengers
                </label>
                <input
                  type="number"
                  id="passengers"
                  name="passengers"
                  className="fuel-form-input"
                  value={formData.passengers}
                  onChange={handleInputChange}
                  placeholder="1"
                  min="1"
                  max="20"
                />
              </div>
              <div className="fuel-form-group">
                <div className="fuel-checkbox-group">
                  <input
                    type="checkbox"
                    id="round-trip"
                    name="isRoundTrip"
                    className="fuel-form-checkbox"
                    checked={formData.isRoundTrip}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="round-trip" className="fuel-checkbox-label">
                    <i className="fas fa-exchange-alt"></i>
                    Round Trip
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="fuel-error-message">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
          </div>
        )}

        {result && (
          <div className="fuel-calculator-result">
            <div className="fuel-result-header">
              <h3>Trip Cost Breakdown</h3>
            </div>
            
            <div className="fuel-summary">
              <div className="fuel-main-result">
                {result.passengers > 1 ? (
                  <>
                    <div className="fuel-amount">
                      <span className="fuel-amount-label">Total Trip Cost</span>
                      <span className="fuel-amount-value">
                        {getCurrencySymbol(result.currency)}{formatNumber(result.totalCost)}
                      </span>
                    </div>
                    <div className="fuel-per-person">
                      <span className="fuel-per-person-label">Cost Per Person</span>
                      <span className="fuel-per-person-value">
                        {getCurrencySymbol(result.currency)}{formatNumber(result.costPerPerson)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="fuel-amount">
                    <span className="fuel-amount-label">Total Fuel Cost</span>
                    <span className="fuel-amount-value">
                      {getCurrencySymbol(result.currency)}{formatNumber(result.totalCost)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="fuel-breakdown">
              <h4>Calculation Details</h4>
              <div className="fuel-breakdown-grid">
                <div className="fuel-breakdown-item">
                  <span className="fuel-breakdown-label">Distance</span>
                  <span className="fuel-breakdown-value">
                    {formatNumber(result.totalDistance)} miles {result.isRoundTrip ? '(Round Trip)' : ''}
                  </span>
                </div>
                <div className="fuel-breakdown-item">
                  <span className="fuel-breakdown-label">Fuel Required</span>
                  <span className="fuel-breakdown-value">
                    {formatNumber(result.fuelNeeded)} gallons
                  </span>
                </div>
                <div className="fuel-breakdown-item">
                  <span className="fuel-breakdown-label">Fuel Price</span>
                  <span className="fuel-breakdown-value">
                    {getCurrencySymbol(result.currency)}{formatNumber(result.fuelPrice)} per gallon
                  </span>
                </div>
                <div className="fuel-breakdown-item">
                  <span className="fuel-breakdown-label">Fuel Efficiency</span>
                  <span className="fuel-breakdown-value">
                    {formatNumber(result.standardEfficiency)} MPG
                  </span>
                </div>
                {result.passengers > 1 && (
                  <div className="fuel-breakdown-item">
                    <span className="fuel-breakdown-label">Passengers</span>
                    <span className="fuel-breakdown-value">
                      Splitting cost between {result.passengers} passengers
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="fuel-tips">
              <h4>Fuel Saving Tips</h4>
              <ul className="fuel-tips-list">
                <li>Maintain steady speeds and avoid aggressive acceleration and braking</li>
                <li>Keep your vehicle well-maintained with regular oil changes and tire pressure checks</li>
                <li>Remove unnecessary weight from your vehicle to improve fuel efficiency</li>
                <li>Use cruise control on highways to maintain consistent speed</li>
                <li>Plan your route to avoid heavy traffic and construction zones</li>
                <li>Consider carpooling or combining trips to reduce overall fuel consumption</li>
              </ul>
            </div>
          </div>
        )}

        <div className="fuel-form-actions">
          <button type="button" className="fuel-btn-reset" onClick={resetCalculator}>
            <i className="fas fa-undo"></i>
            Reset Calculator
          </button>
        </div>
      </CalculatorSection>

      {/* TOC and Feedback Section */}
      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName={toolData.name} />
      </div>

      {/* Content Sections */}
      <ContentSection id="introduction" title="Introduction">
        <p>
          The Fuel Cost Calculator is a practical tool that helps you estimate the fuel expenses for any 
          trip, whether it's a daily commute, weekend getaway, or long-distance journey. By inputting 
          your trip distance, vehicle's fuel efficiency, and current fuel prices, you can get accurate 
          cost estimates to help with budgeting and trip planning.
        </p>
        <p>
          Our calculator supports multiple units of measurement (miles/kilometers, MPG/km per liter) 
          and currencies, making it useful for travelers worldwide. It also accounts for round trips 
          and can calculate cost per person for carpooling or family trips.
        </p>
      </ContentSection>

      <ContentSection id="what-is-fuel-cost" title="What is Fuel Cost?">
        <p>
          Fuel cost refers to the total amount of money spent on fuel for a specific trip or journey. 
          It's calculated by determining how much fuel your vehicle will consume based on distance 
          and fuel efficiency, then multiplying by the current fuel price.
        </p>
        <p>
          Understanding fuel costs is essential for:
        </p>
        <ul>
          <li><strong>Trip Planning:</strong> Budgeting for travel expenses</li>
          <li><strong>Vehicle Comparison:</strong> Comparing fuel costs between different vehicles</li>
          <li><strong>Route Optimization:</strong> Choosing the most cost-effective routes</li>
          <li><strong>Expense Tracking:</strong> Monitoring transportation costs</li>
        </ul>
      </ContentSection>

      <ContentSection id="fuel-efficiency" title="Fuel Efficiency">
        <p>
          Fuel efficiency measures how effectively a vehicle uses fuel to travel a certain distance. 
          It's typically expressed as miles per gallon (MPG) in the US or kilometers per liter (km/L) 
          in other countries.
        </p>
        
        <div className="fuel-efficiency-grid">
          <div className="fuel-efficiency-item">
            <h4><i className="fas fa-car"></i> City Driving</h4>
            <p>Lower efficiency due to stop-and-go traffic, frequent acceleration, and idling</p>
            <ul>
              <li>Typical range: 15-25 MPG</li>
              <li>Factors: Traffic lights, congestion, short trips</li>
            </ul>
          </div>
          <div className="fuel-efficiency-item">
            <h4><i className="fas fa-highway"></i> Highway Driving</h4>
            <p>Higher efficiency due to steady speeds and minimal stopping</p>
            <ul>
              <li>Typical range: 25-40 MPG</li>
              <li>Factors: Consistent speed, minimal braking</li>
            </ul>
          </div>
          <div className="fuel-efficiency-item">
            <h4><i className="fas fa-balance-scale"></i> Combined Efficiency</h4>
            <p>Average of city and highway driving for mixed-use scenarios</p>
            <ul>
              <li>Typical range: 20-30 MPG</li>
              <li>Best for: General trip planning</li>
            </ul>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Calculator">
        <p>Follow these steps to calculate your fuel costs:</p>
        
        <h3>Step 1: Enter Trip Information</h3>
        <ul className="usage-steps">
          <li><strong>Distance:</strong> Enter the total distance of your trip</li>
          <li><strong>Distance Unit:</strong> Choose between miles or kilometers</li>
          <li><strong>Round Trip:</strong> Check the box if you're calculating a round trip</li>
        </ul>

        <h3>Step 2: Enter Vehicle Information</h3>
        <ul className="usage-steps">
          <li><strong>Fuel Efficiency:</strong> Enter your vehicle's fuel efficiency</li>
          <li><strong>Efficiency Unit:</strong> Choose MPG (US) or km/L (metric)</li>
          <li><strong>Use Realistic Values:</strong> Consider city vs highway driving conditions</li>
        </ul>

        <h3>Step 3: Enter Cost Information</h3>
        <ul className="usage-steps">
          <li><strong>Fuel Price:</strong> Enter current fuel price per gallon/liter</li>
          <li><strong>Currency:</strong> Select your preferred currency</li>
          <li><strong>Passengers:</strong> Enter number of people to split costs</li>
        </ul>

        <h3>Step 4: Review Results</h3>
        <ul className="usage-steps">
          <li><strong>Total Cost:</strong> See your estimated fuel expenses</li>
          <li><strong>Cost Per Person:</strong> View individual costs for group trips</li>
          <li><strong>Calculation Details:</strong> Review the breakdown of your calculation</li>
        </ul>
      </ContentSection>

      <ContentSection id="calculation-method" title="Calculation Method">
        <p>
          The fuel cost calculation follows a systematic approach that converts all measurements 
          to standard units for accurate computation.
        </p>
        
        <div className="calculation-method-section">
          <h3>Step-by-Step Calculation</h3>
          <ol>
            <li><strong>Convert Units:</strong> Convert distance and efficiency to standard units (miles and MPG)</li>
            <li><strong>Calculate Total Distance:</strong> Multiply by 2 if round trip</li>
            <li><strong>Determine Fuel Needed:</strong> Divide total distance by fuel efficiency</li>
            <li><strong>Calculate Total Cost:</strong> Multiply fuel needed by fuel price</li>
            <li><strong>Calculate Per Person Cost:</strong> Divide total cost by number of passengers</li>
          </ol>
          
          <h3>Conversion Factors</h3>
          <div className="fuel-conversion-factors">
            <p><strong>Distance:</strong> 1 kilometer = 0.621371 miles</p>
            <p><strong>Efficiency:</strong> 1 km/L = 2.35215 MPG</p>
          </div>
          
          <h3>Formula</h3>
          <div className="fuel-formula">
            <p><strong>Total Distance = Distance × (Round Trip ? 2 : 1)</strong></p>
            <p><strong>Fuel Needed = Total Distance ÷ Fuel Efficiency</strong></p>
            <p><strong>Total Cost = Fuel Needed × Fuel Price</strong></p>
            <p><strong>Cost Per Person = Total Cost ÷ Number of Passengers</strong></p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: Daily Commute</h3>
          <div className="example-solution">
            <p><strong>Distance:</strong> 25 miles (one way)</p>
            <p><strong>Fuel Efficiency:</strong> 28 MPG</p>
            <p><strong>Fuel Price:</strong> $3.50 per gallon</p>
            <p><strong>Round Trip:</strong> Yes (50 miles total)</p>
            <p><strong>Fuel Needed:</strong> 50 ÷ 28 = 1.79 gallons</p>
            <p><strong>Total Cost:</strong> 1.79 × $3.50 = $6.27</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: Family Road Trip</h3>
          <div className="example-solution">
            <p><strong>Distance:</strong> 300 miles (one way)</p>
            <p><strong>Fuel Efficiency:</strong> 32 MPG</p>
            <p><strong>Fuel Price:</strong> $3.25 per gallon</p>
            <p><strong>Round Trip:</strong> Yes (600 miles total)</p>
            <p><strong>Passengers:</strong> 4 people</p>
            <p><strong>Fuel Needed:</strong> 600 ÷ 32 = 18.75 gallons</p>
            <p><strong>Total Cost:</strong> 18.75 × $3.25 = $60.94</p>
            <p><strong>Cost Per Person:</strong> $60.94 ÷ 4 = $15.24</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 3: International Trip (Metric)</h3>
          <div className="example-solution">
            <p><strong>Distance:</strong> 200 kilometers</p>
            <p><strong>Fuel Efficiency:</strong> 12 km/L</p>
            <p><strong>Fuel Price:</strong> €1.40 per liter</p>
            <p><strong>Round Trip:</strong> No</p>
            <p><strong>Fuel Needed:</strong> 200 ÷ 12 = 16.67 liters</p>
            <p><strong>Total Cost:</strong> 16.67 × €1.40 = €23.34</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding and calculating fuel costs is important for several reasons:</p>
        <ul>
          <li><strong>Budget Planning:</strong> Helps create accurate travel budgets and expense forecasts</li>
          <li><strong>Vehicle Selection:</strong> Compare fuel costs between different vehicles when purchasing</li>
          <li><strong>Route Optimization:</strong> Choose the most cost-effective routes for regular commutes</li>
          <li><strong>Environmental Awareness:</strong> Understanding fuel consumption promotes eco-friendly driving</li>
          <li><strong>Expense Tracking:</strong> Monitor transportation costs for business or personal accounting</li>
          <li><strong>Trip Planning:</strong> Make informed decisions about travel methods and destinations</li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our Fuel Cost Calculator provides comprehensive functionality:</p>
        <ul>
          <li><strong>Multi-Unit Support:</strong> Calculate in miles/kilometers and MPG/km per liter</li>
          <li><strong>Multi-Currency Support:</strong> Support for USD, EUR, and GBP with proper symbols</li>
          <li><strong>Round Trip Calculation:</strong> Automatically doubles distance for round trips</li>
          <li><strong>Passenger Cost Splitting:</strong> Calculate individual costs for group trips</li>
          <li><strong>Real-Time Conversion:</strong> Automatic unit conversion for accurate calculations</li>
          <li><strong>Detailed Breakdown:</strong> Shows all calculation steps and intermediate values</li>
          <li><strong>Fuel Saving Tips:</strong> Provides practical advice for reducing fuel consumption</li>
          <li><strong>Mobile Friendly:</strong> Responsive design for calculation on any device</li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-route"></i> Trip Planning</h4>
            <p>Plan and budget for road trips, vacations, and business travel</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-car"></i> Vehicle Comparison</h4>
            <p>Compare fuel costs between different vehicles when shopping</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-users"></i> Carpooling</h4>
            <p>Calculate fair cost sharing for carpooling and ride-sharing</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-briefcase"></i> Business Expenses</h4>
            <p>Track and calculate business travel fuel expenses for reimbursement</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Budget Management</h4>
            <p>Include fuel costs in monthly transportation budgets</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-leaf"></i> Environmental Planning</h4>
            <p>Understand fuel consumption for eco-friendly travel decisions</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection faqs={faqData} />
    </ToolPageLayout>
  );
};

export default FuelCalculator;

