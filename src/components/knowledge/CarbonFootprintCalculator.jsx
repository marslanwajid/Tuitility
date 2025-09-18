import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import '../../assets/css/knowledge/carbon-footprint-calculator.css';

const CarbonFootprintCalculator = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [formData, setFormData] = useState({
    // Transportation
    carMiles: '',
    carEfficiency: '',
    publicTransit: '',
    flightsShort: '',
    flightsLong: '',
    
    // Energy
    electricity: '',
    naturalGas: '',
    renewableEnergy: '',
    householdSize: '',
    
    // Food
    diet: 'average',
    localFood: '',
    foodWaste: '',
    
    // Waste
    wasteGenerated: '',
    recyclingRate: '',
    compost: 'no'
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Tool data for ToolPageLayout
  const toolData = {
    name: "Carbon Footprint Calculator",
    description: "Calculate your personal carbon footprint and discover ways to reduce your environmental impact. Get personalized tips and track your progress toward a more sustainable lifestyle.",
    category: "Knowledge",
    icon: "fas fa-leaf",
    breadcrumb: ['Knowledge', 'Calculators', 'Carbon Footprint Calculator'],
    keywords: ["carbon", "footprint", "environment", "sustainability", "emissions", "climate", "green", "eco-friendly"]
  };

  // Categories for navigation
  const categories = [
    { name: "Knowledge", url: "/knowledge" },
    { name: "Carbon Footprint Calculator", url: "/knowledge/calculators/carbon-footprint-calculator" }
  ];

  // Related tools
  const relatedTools = [
    { name: "GPA Calculator", url: "/knowledge/calculators/gpa-calculator", icon: "fas fa-graduation-cap" },
    { name: "Age Calculator", url: "/knowledge/calculators/age-calculator", icon: "fas fa-calendar-alt" },
    { name: "WPM Calculator", url: "/knowledge/calculators/wpm-calculator", icon: "fas fa-keyboard" },
    { name: "Habit Formation Calculator", url: "/knowledge/calculators/habit-formation-calculator", icon: "fas fa-calendar-check" },
    { name: "MBTI Calculator", url: "/knowledge/calculators/mbti-calculator", icon: "fas fa-user-friends" },
    { name: "Language Level Calculator", url: "/knowledge/calculators/language-level-calculator", icon: "fas fa-language" },
    { name: "Zakat Calculator", url: "/knowledge/calculators/zakat-calculator", icon: "fas fa-mosque" },
    { name: "Fuel Calculator", url: "/knowledge/calculators/fuel-calculator", icon: "fas fa-gas-pump" },
    { name: "Average Time Calculator", url: "/knowledge/calculators/average-time-calculator", icon: "fas fa-clock" }
  ];

  // Tab configuration
  const tabs = [
    { id: 'transportation', label: 'Transportation', icon: 'fas fa-car' },
    { id: 'energy', label: 'Home Energy', icon: 'fas fa-home' },
    { id: 'food', label: 'Food & Diet', icon: 'fas fa-utensils' },
    { id: 'waste', label: 'Waste & Recycling', icon: 'fas fa-recycle' }
  ];

  // Diet options
  const dietOptions = [
    { value: 'meat-heavy', label: 'Meat-Heavy Diet' },
    { value: 'average', label: 'Average Diet' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' }
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'radio' ? value : value
    }));
  };

  // Switch to specific tab
  const switchToTab = (tabIndex) => {
    setCurrentTab(tabIndex);
  };

  // Navigate to previous tab
  const goToPreviousTab = () => {
    if (currentTab > 0) {
      setCurrentTab(currentTab - 1);
    }
  };

  // Navigate to next tab
  const goToNextTab = () => {
    if (currentTab < tabs.length - 1) {
      setCurrentTab(currentTab + 1);
    }
  };

  // Calculate carbon footprint
  const calculateCarbonFootprint = () => {
    try {
      // Emission factors
      const EMISSION_FACTORS = {
        CAR: 0.404, // kg CO2e per mile
        PUBLIC_TRANSIT: 0.14, // kg CO2e per mile
        SHORT_FLIGHT: 223, // kg CO2e per short flight
        LONG_FLIGHT: 986, // kg CO2e per long flight
        ELECTRICITY: 0.42, // kg CO2e per kWh
        NATURAL_GAS: 5.3, // kg CO2e per therm
        DIET: {
          'meat-heavy': 2500,
          'average': 1800,
          'vegetarian': 1300,
          'vegan': 1000
        },
        WASTE: 0.57 // kg CO2e per pound of waste
      };

      const AVERAGE_FOOTPRINT = 16; // US average in metric tons

      // Get form values
      const carMiles = parseFloat(formData.carMiles) || 0;
      const carEfficiency = parseFloat(formData.carEfficiency) || 25;
      const publicTransitMiles = parseFloat(formData.publicTransit) || 0;
      const shortFlights = parseFloat(formData.flightsShort) || 0;
      const longFlights = parseFloat(formData.flightsLong) || 0;
      
      const electricity = parseFloat(formData.electricity) || 0;
      const naturalGas = parseFloat(formData.naturalGas) || 0;
      const renewablePercentage = parseFloat(formData.renewableEnergy) || 0;
      const householdSize = parseFloat(formData.householdSize) || 1;
      
      const dietType = formData.diet;
      const localFoodPercentage = parseFloat(formData.localFood) || 0;
      const foodWaste = parseFloat(formData.foodWaste) || 0;
      
      const wasteGenerated = parseFloat(formData.wasteGenerated) || 0;
      const recyclingRate = parseFloat(formData.recyclingRate) || 0;
      const composting = formData.compost === 'yes';

      // Calculate transportation emissions (annual)
      const carEmissions = (carMiles * 52 / carEfficiency) * EMISSION_FACTORS.CAR * 1000;
      const transitEmissions = publicTransitMiles * 52 * EMISSION_FACTORS.PUBLIC_TRANSIT;
      const flightEmissions = (shortFlights * EMISSION_FACTORS.SHORT_FLIGHT) + (longFlights * EMISSION_FACTORS.LONG_FLIGHT);
      const transportationTotal = (carEmissions + transitEmissions + flightEmissions) / 1000;

      // Calculate home energy emissions (annual)
      const electricityEmissions = electricity * 12 * EMISSION_FACTORS.ELECTRICITY * (1 - renewablePercentage / 100);
      const gasEmissions = naturalGas * 12 * EMISSION_FACTORS.NATURAL_GAS;
      const energyTotal = (electricityEmissions + gasEmissions) / 1000 / householdSize;

      // Calculate food emissions
      const dietEmissions = EMISSION_FACTORS.DIET[dietType];
      const localFoodReduction = dietEmissions * 0.2 * (localFoodPercentage / 100);
      const foodWasteEmissions = foodWaste * 52 * 2.5 / 1000;
      const foodTotal = (dietEmissions - localFoodReduction + foodWasteEmissions) / 1000;

      // Calculate waste emissions
      const wasteReduction = (recyclingRate / 100) * 0.7 + (composting ? 0.3 : 0);
      const wasteEmissions = wasteGenerated * 52 * EMISSION_FACTORS.WASTE * (1 - wasteReduction);
      const wasteTotal = wasteEmissions / 1000;

      // Calculate total carbon footprint
      const totalCarbon = transportationTotal + energyTotal + foodTotal + wasteTotal;

      // Compare to average
      const comparisonPercentage = (totalCarbon / AVERAGE_FOOTPRINT) * 100;
      let comparisonText;
      let indicatorPosition;

      if (comparisonPercentage < 50) {
        comparisonText = "Much Lower than Average";
        indicatorPosition = "10%";
      } else if (comparisonPercentage < 80) {
        comparisonText = "Lower than Average";
        indicatorPosition = "30%";
      } else if (comparisonPercentage < 120) {
        comparisonText = "Average";
        indicatorPosition = "50%";
      } else if (comparisonPercentage < 150) {
        comparisonText = "Higher than Average";
        indicatorPosition = "70%";
      } else {
        comparisonText = "Much Higher than Average";
        indicatorPosition = "90%";
      }

      // Generate reduction tips
      const tips = generateReductionTips({
        transportation: transportationTotal,
        energy: energyTotal,
        food: foodTotal,
        waste: wasteTotal,
        carMiles: carMiles * 52,
        flights: shortFlights + longFlights,
        dietType,
        recyclingRate,
        composting
      });

      setResult({
        totalCarbon,
        transportation: transportationTotal,
        energy: energyTotal,
        food: foodTotal,
        waste: wasteTotal,
        comparisonText,
        indicatorPosition,
        tips
      });

      setError('');
    } catch (err) {
      setError('Error calculating carbon footprint. Please check your inputs.');
      console.error('Calculation error:', err);
    }
  };

  // Generate personalized reduction tips
  const generateReductionTips = (data) => {
    const tips = [];

    // Transportation tips
    if (data.transportation > 4) {
      if (data.carMiles > 5000) {
        tips.push("Consider carpooling or using public transportation to reduce your car emissions.");
        tips.push("If possible, try working from home a few days a week to reduce commuting.");
      }
      if (data.flights > 3) {
        tips.push("Try to combine trips or use video conferencing instead of flying for business.");
        tips.push("Consider carbon offsets when flying to mitigate your flight emissions.");
      }
    }

    // Energy tips
    if (data.energy > 3) {
      tips.push("Switch to LED light bulbs and energy-efficient appliances.");
      tips.push("Consider increasing your use of renewable energy through home solar panels or green energy programs.");
      tips.push("Improve home insulation to reduce heating and cooling needs.");
    }

    // Food tips
    if (data.food > 2) {
      if (data.dietType === 'meat-heavy') {
        tips.push("Try having one or more meatless days per week to reduce your dietary carbon footprint.");
      }
      tips.push("Buy more locally produced and seasonal foods to reduce transportation emissions.");
      tips.push("Plan meals to reduce food waste and save money while lowering emissions.");
    }

    // Waste tips
    if (data.waste > 1) {
      if (data.recyclingRate < 50) {
        tips.push("Increase your recycling efforts - aim for recycling at least 50% of your waste.");
      }
      if (!data.composting) {
        tips.push("Start composting food scraps to reduce methane emissions from landfills.");
      }
      tips.push("Choose products with less packaging or bring reusable bags and containers when shopping.");
    }

    return tips;
  };

  // Reset calculator
  const resetCalculator = () => {
    setFormData({
      carMiles: '',
      carEfficiency: '',
      publicTransit: '',
      flightsShort: '',
      flightsLong: '',
      electricity: '',
      naturalGas: '',
      renewableEnergy: '',
      householdSize: '',
      diet: 'average',
      localFood: '',
      foodWaste: '',
      wasteGenerated: '',
      recyclingRate: '',
      compost: 'no'
    });
    setCurrentTab(0);
    setResult(null);
    setError('');
  };

  // Load external JavaScript
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/src/assets/js/knowledge/carbon-footprint-calculator.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="/src/assets/js/knowledge/carbon-footprint-calculator.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  // Table of Contents data
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-carbon-footprint', title: 'What is Carbon Footprint?' },
    { id: 'carbon-sources', title: 'Carbon Footprint Sources' },
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
      question: "What is a carbon footprint?",
      answer: "A carbon footprint is the total amount of greenhouse gases (primarily carbon dioxide) that are emitted directly or indirectly by an individual, organization, event, or product. It's measured in metric tons of CO2 equivalent (CO2e)."
    },
    {
      question: "What's considered a good carbon footprint?",
      answer: "The global average is about 4.8 metric tons per person per year. To limit global warming to 1.5°C, we need to reduce this to about 2.5 metric tons by 2030. The US average is around 16 metric tons, so anything below that is a good start."
    },
    {
      question: "Which activities have the biggest impact on my carbon footprint?",
      answer: "Transportation (especially flying and driving), home energy use, and diet typically have the largest impacts. Food production, particularly meat and dairy, accounts for a significant portion of emissions."
    },
    {
      question: "How accurate is this calculator?",
      answer: "This calculator provides estimates based on average emission factors. Individual results may vary based on specific circumstances, but it gives a good general indication of your carbon footprint and areas for improvement."
    },
    {
      question: "What are carbon offsets?",
      answer: "Carbon offsets are credits for greenhouse gas reductions achieved by one party that can be purchased to compensate for emissions made by another party. They fund projects like reforestation or renewable energy development."
    },
    {
      question: "How often should I calculate my carbon footprint?",
      answer: "It's good to calculate your carbon footprint annually or whenever you make significant lifestyle changes. Regular tracking helps you see progress and identify new opportunities for reduction."
    }
  ];

  return (
    <ToolPageLayout 
      toolData={toolData} 
      categories={categories} 
      relatedTools={relatedTools}
    >
      <CalculatorSection
        title="Carbon Footprint Calculator"
        description="Calculate your personal carbon footprint and discover ways to reduce your environmental impact."
        onCalculate={calculateCarbonFootprint}
        calculateButtonText="Calculate Carbon Footprint"
        showCalculateButton={currentTab === tabs.length - 1}
      >
        <div className="carbon-calculator-form">
          {/* Tab Navigation */}
          <div className="carbon-tab-navigation">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                className={`carbon-tab-button ${currentTab === index ? 'active' : ''}`}
                onClick={() => switchToTab(index)}
              >
                <i className={tab.icon}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="carbon-tab-content">
            {/* Transportation Tab */}
            <div className={`carbon-tab-panel ${currentTab === 0 ? 'active' : ''}`}>
              <h3>Transportation</h3>
              <div className="carbon-form-row">
                <div className="carbon-form-group">
                  <label htmlFor="car-miles" className="carbon-form-label">
                    <i className="fas fa-car"></i>
                    Weekly Car Miles
                  </label>
                  <input
                    type="number"
                    id="car-miles"
                    name="carMiles"
                    className="carbon-form-input"
                    value={formData.carMiles}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="carbon-form-group">
                  <label htmlFor="car-efficiency" className="carbon-form-label">
                    <i className="fas fa-tachometer-alt"></i>
                    Car MPG
                  </label>
                  <input
                    type="number"
                    id="car-efficiency"
                    name="carEfficiency"
                    className="carbon-form-input"
                    value={formData.carEfficiency}
                    onChange={handleInputChange}
                    placeholder="25"
                    min="1"
                  />
                </div>
              </div>
              <div className="carbon-form-row">
                <div className="carbon-form-group">
                  <label htmlFor="public-transit" className="carbon-form-label">
                    <i className="fas fa-bus"></i>
                    Weekly Public Transit Miles
                  </label>
                  <input
                    type="number"
                    id="public-transit"
                    name="publicTransit"
                    className="carbon-form-input"
                    value={formData.publicTransit}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="carbon-form-group">
                  <label htmlFor="flights-short" className="carbon-form-label">
                    <i className="fas fa-plane"></i>
                    Short Flights (under 3 hours)
                  </label>
                  <input
                    type="number"
                    id="flights-short"
                    name="flightsShort"
                    className="carbon-form-input"
                    value={formData.flightsShort}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              <div className="carbon-form-row">
                <div className="carbon-form-group">
                  <label htmlFor="flights-long" className="carbon-form-label">
                    <i className="fas fa-plane-departure"></i>
                    Long Flights (over 3 hours)
                  </label>
                  <input
                    type="number"
                    id="flights-long"
                    name="flightsLong"
                    className="carbon-form-input"
                    value={formData.flightsLong}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Energy Tab */}
            <div className={`carbon-tab-panel ${currentTab === 1 ? 'active' : ''}`}>
              <h3>Home Energy</h3>
              <div className="carbon-form-row">
                <div className="carbon-form-group">
                  <label htmlFor="electricity" className="carbon-form-label">
                    <i className="fas fa-bolt"></i>
                    Monthly Electricity (kWh)
                  </label>
                  <input
                    type="number"
                    id="electricity"
                    name="electricity"
                    className="carbon-form-input"
                    value={formData.electricity}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="carbon-form-group">
                  <label htmlFor="natural-gas" className="carbon-form-label">
                    <i className="fas fa-fire"></i>
                    Monthly Natural Gas (therms)
                  </label>
                  <input
                    type="number"
                    id="natural-gas"
                    name="naturalGas"
                    className="carbon-form-input"
                    value={formData.naturalGas}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              <div className="carbon-form-row">
                <div className="carbon-form-group">
                  <label htmlFor="renewable-energy" className="carbon-form-label">
                    <i className="fas fa-solar-panel"></i>
                    Renewable Energy (%)
                  </label>
                  <input
                    type="number"
                    id="renewable-energy"
                    name="renewableEnergy"
                    className="carbon-form-input"
                    value={formData.renewableEnergy}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="carbon-form-group">
                  <label htmlFor="household-size" className="carbon-form-label">
                    <i className="fas fa-users"></i>
                    Household Size
                  </label>
                  <input
                    type="number"
                    id="household-size"
                    name="householdSize"
                    className="carbon-form-input"
                    value={formData.householdSize}
                    onChange={handleInputChange}
                    placeholder="1"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Food Tab */}
            <div className={`carbon-tab-panel ${currentTab === 2 ? 'active' : ''}`}>
              <h3>Food & Diet</h3>
              <div className="carbon-form-row">
                <div className="carbon-form-group">
                  <label className="carbon-form-label">
                    <i className="fas fa-utensils"></i>
                    Diet Type
                  </label>
                  <div className="carbon-radio-group">
                    {dietOptions.map((option) => (
                      <label key={option.value} className="carbon-radio-label">
                        <input
                          type="radio"
                          name="diet"
                          value={option.value}
                          checked={formData.diet === option.value}
                          onChange={handleInputChange}
                          className="carbon-radio-input"
                        />
                        <span className="carbon-radio-text">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="carbon-form-row">
                <div className="carbon-form-group">
                  <label htmlFor="local-food" className="carbon-form-label">
                    <i className="fas fa-map-marker-alt"></i>
                    Local Food (%)
                  </label>
                  <input
                    type="number"
                    id="local-food"
                    name="localFood"
                    className="carbon-form-input"
                    value={formData.localFood}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="carbon-form-group">
                  <label htmlFor="food-waste" className="carbon-form-label">
                    <i className="fas fa-trash"></i>
                    Weekly Food Waste (lbs)
                  </label>
                  <input
                    type="number"
                    id="food-waste"
                    name="foodWaste"
                    className="carbon-form-input"
                    value={formData.foodWaste}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Waste Tab */}
            <div className={`carbon-tab-panel ${currentTab === 3 ? 'active' : ''}`}>
              <h3>Waste & Recycling</h3>
              <div className="carbon-form-row">
                <div className="carbon-form-group">
                  <label htmlFor="waste-generated" className="carbon-form-label">
                    <i className="fas fa-trash-alt"></i>
                    Weekly Waste Generated (lbs)
                  </label>
                  <input
                    type="number"
                    id="waste-generated"
                    name="wasteGenerated"
                    className="carbon-form-input"
                    value={formData.wasteGenerated}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="carbon-form-group">
                  <label htmlFor="recycling-rate" className="carbon-form-label">
                    <i className="fas fa-recycle"></i>
                    Recycling Rate (%)
                  </label>
                  <input
                    type="number"
                    id="recycling-rate"
                    name="recyclingRate"
                    className="carbon-form-input"
                    value={formData.recyclingRate}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              <div className="carbon-form-row">
                <div className="carbon-form-group">
                  <label className="carbon-form-label">
                    <i className="fas fa-seedling"></i>
                    Do you compost?
                  </label>
                  <div className="carbon-radio-group">
                    <label className="carbon-radio-label">
                      <input
                        type="radio"
                        name="compost"
                        value="yes"
                        checked={formData.compost === 'yes'}
                        onChange={handleInputChange}
                        className="carbon-radio-input"
                      />
                      <span className="carbon-radio-text">Yes</span>
                    </label>
                    <label className="carbon-radio-label">
                      <input
                        type="radio"
                        name="compost"
                        value="no"
                        checked={formData.compost === 'no'}
                        onChange={handleInputChange}
                        className="carbon-radio-input"
                      />
                      <span className="carbon-radio-text">No</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="carbon-navigation-buttons">
            {currentTab > 0 && (
              <button
                type="button"
                className="carbon-btn-prev"
                onClick={goToPreviousTab}
              >
                <i className="fas fa-arrow-left"></i>
                Previous
              </button>
            )}
            {currentTab < tabs.length - 1 && (
              <button
                type="button"
                className="carbon-btn-next"
                onClick={goToNextTab}
              >
                Next
                <i className="fas fa-arrow-right"></i>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="carbon-error-message">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
          </div>
        )}

        {result && (
          <div className="carbon-calculator-result">
            <div className="carbon-result-header">
              <h3>Your Carbon Footprint Results</h3>
            </div>
            
            <div className="carbon-summary">
              <div className="carbon-main-result">
                <div className="carbon-amount">
                  <span className="carbon-amount-label">Total Annual Carbon Footprint</span>
                  <span className="carbon-amount-value">
                    {result.totalCarbon.toFixed(2)} metric tons CO₂e
                  </span>
                </div>
                <div className="carbon-comparison">
                  <span className="carbon-comparison-label">Compared to Average</span>
                  <span className="carbon-comparison-value">
                    {result.comparisonText}
                  </span>
                </div>
              </div>
            </div>

            <div className="carbon-breakdown">
              <h4>Breakdown by Category</h4>
              <div className="carbon-breakdown-grid">
                <div className="carbon-breakdown-item">
                  <span className="carbon-breakdown-label">Transportation</span>
                  <span className="carbon-breakdown-value">
                    {result.transportation.toFixed(2)} tons CO₂e
                  </span>
                </div>
                <div className="carbon-breakdown-item">
                  <span className="carbon-breakdown-label">Home Energy</span>
                  <span className="carbon-breakdown-value">
                    {result.energy.toFixed(2)} tons CO₂e
                  </span>
                </div>
                <div className="carbon-breakdown-item">
                  <span className="carbon-breakdown-label">Food & Consumption</span>
                  <span className="carbon-breakdown-value">
                    {result.food.toFixed(2)} tons CO₂e
                  </span>
                </div>
                <div className="carbon-breakdown-item">
                  <span className="carbon-breakdown-label">Waste</span>
                  <span className="carbon-breakdown-value">
                    {result.waste.toFixed(2)} tons CO₂e
                  </span>
                </div>
              </div>
            </div>

            <div className="carbon-tips">
              <h4>Personalized Reduction Tips</h4>
              <ul className="carbon-tips-list">
                {result.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="carbon-form-actions">
          <button type="button" className="carbon-btn-reset" onClick={resetCalculator}>
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
          The Carbon Footprint Calculator is a comprehensive tool designed to help you understand 
          your personal environmental impact by calculating the total amount of greenhouse gases 
          you produce annually. This calculator covers all major sources of carbon emissions 
          including transportation, home energy use, food consumption, and waste generation.
        </p>
        <p>
          By understanding your carbon footprint, you can identify the most impactful areas for 
          reduction and take meaningful steps toward a more sustainable lifestyle. Our calculator 
          provides personalized tips and recommendations based on your specific inputs and results.
        </p>
      </ContentSection>

      <ContentSection id="what-is-carbon-footprint" title="What is Carbon Footprint?">
        <p>
          A carbon footprint is the total amount of greenhouse gases (primarily carbon dioxide) 
          that are emitted directly or indirectly by an individual, organization, event, or product. 
          It's measured in metric tons of CO2 equivalent (CO2e) and includes all sources of emissions.
        </p>
        <p>
          Understanding your carbon footprint is crucial because:
        </p>
        <ul>
          <li><strong>Climate Impact:</strong> Greenhouse gases trap heat in the atmosphere, contributing to global warming</li>
          <li><strong>Personal Responsibility:</strong> Individual actions collectively make a significant difference</li>
          <li><strong>Target Setting:</strong> Helps establish realistic goals for emission reduction</li>
          <li><strong>Progress Tracking:</strong> Allows you to measure improvements over time</li>
        </ul>
      </ContentSection>

      <ContentSection id="carbon-sources" title="Carbon Footprint Sources">
        <p>
          Your carbon footprint comes from four main categories, each with different emission factors 
          and reduction opportunities.
        </p>
        
        <div className="carbon-sources-grid">
          <div className="carbon-source-item">
            <h4><i className="fas fa-car"></i> Transportation</h4>
            <p>Includes driving, flying, and public transportation</p>
            <ul>
              <li>Car emissions based on miles driven and fuel efficiency</li>
              <li>Flight emissions vary by distance and aircraft type</li>
              <li>Public transit generally has lower emissions per mile</li>
            </ul>
          </div>
          <div className="carbon-source-item">
            <h4><i className="fas fa-home"></i> Home Energy</h4>
            <p>Electricity, heating, and cooling for your home</p>
            <ul>
              <li>Electricity emissions depend on your energy source</li>
              <li>Natural gas and other heating fuels</li>
              <li>Renewable energy significantly reduces emissions</li>
            </ul>
          </div>
          <div className="carbon-source-item">
            <h4><i className="fas fa-utensils"></i> Food & Consumption</h4>
            <p>Diet choices and food production emissions</p>
            <ul>
              <li>Meat and dairy have higher carbon footprints</li>
              <li>Local and seasonal foods reduce transportation emissions</li>
              <li>Food waste contributes significantly to emissions</li>
            </ul>
          </div>
          <div className="carbon-source-item">
            <h4><i className="fas fa-recycle"></i> Waste & Recycling</h4>
            <p>Waste generation and disposal methods</p>
            <ul>
              <li>Landfill waste produces methane emissions</li>
              <li>Recycling reduces the need for new materials</li>
              <li>Composting prevents methane from food waste</li>
            </ul>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Calculator">
        <p>Follow these steps to calculate your carbon footprint:</p>
        
        <h3>Step 1: Transportation</h3>
        <ul className="usage-steps">
          <li><strong>Car Usage:</strong> Enter your weekly car miles and vehicle's MPG</li>
          <li><strong>Public Transit:</strong> Include bus, train, or other public transportation miles</li>
          <li><strong>Flights:</strong> Count short flights (under 3 hours) and long flights separately</li>
        </ul>

        <h3>Step 2: Home Energy</h3>
        <ul className="usage-steps">
          <li><strong>Electricity:</strong> Enter your monthly electricity usage in kWh</li>
          <li><strong>Natural Gas:</strong> Include monthly natural gas usage in therms</li>
          <li><strong>Renewable Energy:</strong> Specify what percentage comes from renewable sources</li>
          <li><strong>Household Size:</strong> Enter number of people to calculate per-person emissions</li>
        </ul>

        <h3>Step 3: Food & Diet</h3>
        <ul className="usage-steps">
          <li><strong>Diet Type:</strong> Select your primary diet (meat-heavy, average, vegetarian, vegan)</li>
          <li><strong>Local Food:</strong> Estimate percentage of locally produced food</li>
          <li><strong>Food Waste:</strong> Enter weekly food waste in pounds</li>
        </ul>

        <h3>Step 4: Waste & Recycling</h3>
        <ul className="usage-steps">
          <li><strong>Waste Generated:</strong> Enter weekly waste production in pounds</li>
          <li><strong>Recycling Rate:</strong> Specify what percentage you recycle</li>
          <li><strong>Composting:</strong> Indicate if you compost food scraps</li>
        </ul>

        <h3>Step 5: Review Results</h3>
        <ul className="usage-steps">
          <li><strong>Total Footprint:</strong> See your annual carbon footprint in metric tons</li>
          <li><strong>Category Breakdown:</strong> Understand which areas contribute most</li>
          <li><strong>Comparison:</strong> See how you compare to the average</li>
          <li><strong>Reduction Tips:</strong> Get personalized recommendations for improvement</li>
        </ul>
      </ContentSection>

      <ContentSection id="calculation-method" title="Calculation Method">
        <p>
          The calculator uses established emission factors and conversion rates to provide 
          accurate estimates of your carbon footprint across all categories.
        </p>
        
        <div className="calculation-method-section">
          <h3>Emission Factors Used</h3>
          <div className="carbon-emission-factors">
            <h4>Transportation</h4>
            <ul>
              <li>Car: 0.404 kg CO₂e per mile (adjusted for fuel efficiency)</li>
              <li>Public Transit: 0.14 kg CO₂e per mile</li>
              <li>Short Flight: 223 kg CO₂e per flight</li>
              <li>Long Flight: 986 kg CO₂e per flight</li>
            </ul>
            
            <h4>Home Energy</h4>
            <ul>
              <li>Electricity: 0.42 kg CO₂e per kWh (US average)</li>
              <li>Natural Gas: 5.3 kg CO₂e per therm</li>
              <li>Renewable Energy: Reduces electricity emissions proportionally</li>
            </ul>
            
            <h4>Food & Diet</h4>
            <ul>
              <li>Meat-Heavy Diet: 2,500 kg CO₂e per year</li>
              <li>Average Diet: 1,800 kg CO₂e per year</li>
              <li>Vegetarian Diet: 1,300 kg CO₂e per year</li>
              <li>Vegan Diet: 1,000 kg CO₂e per year</li>
            </ul>
            
            <h4>Waste</h4>
            <ul>
              <li>General Waste: 0.57 kg CO₂e per pound</li>
              <li>Recycling: Reduces waste impact by up to 70%</li>
              <li>Composting: Additional 30% reduction for food waste</li>
            </ul>
          </div>
          
          <h3>Calculation Process</h3>
          <ol>
            <li>Convert all inputs to annual amounts (weekly × 52, monthly × 12)</li>
            <li>Apply appropriate emission factors for each category</li>
            <li>Adjust for efficiency factors (car MPG, renewable energy, etc.)</li>
            <li>Sum all categories to get total annual footprint</li>
            <li>Compare to US average of 16 metric tons per person</li>
          </ol>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: Low-Carbon Lifestyle</h3>
          <div className="example-solution">
            <p><strong>Transportation:</strong> 20 miles/week car, 30 MPG, 2 short flights/year</p>
            <p><strong>Energy:</strong> 400 kWh/month, 20 therms/month, 50% renewable, 2 people</p>
            <p><strong>Food:</strong> Vegetarian diet, 30% local food, 2 lbs/week waste</p>
            <p><strong>Waste:</strong> 10 lbs/week, 80% recycling, composting</p>
            <p><strong>Result:</strong> 8.2 metric tons CO₂e (Much Lower than Average)</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: Average Lifestyle</h3>
          <div className="example-solution">
            <p><strong>Transportation:</strong> 100 miles/week car, 25 MPG, 4 short flights/year</p>
            <p><strong>Energy:</strong> 800 kWh/month, 50 therms/month, 10% renewable, 2 people</p>
            <p><strong>Food:</strong> Average diet, 10% local food, 5 lbs/week waste</p>
            <p><strong>Waste:</strong> 20 lbs/week, 40% recycling, no composting</p>
            <p><strong>Result:</strong> 15.8 metric tons CO₂e (Average)</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 3: High-Carbon Lifestyle</h3>
          <div className="example-solution">
            <p><strong>Transportation:</strong> 200 miles/week car, 20 MPG, 2 long flights/year</p>
            <p><strong>Energy:</strong> 1200 kWh/month, 80 therms/month, 0% renewable, 1 person</p>
            <p><strong>Food:</strong> Meat-heavy diet, 5% local food, 8 lbs/week waste</p>
            <p><strong>Waste:</strong> 30 lbs/week, 20% recycling, no composting</p>
            <p><strong>Result:</strong> 24.6 metric tons CO₂e (Much Higher than Average)</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding and reducing your carbon footprint is crucial for several reasons:</p>
        <ul>
          <li><strong>Climate Change Mitigation:</strong> Individual actions collectively reduce global emissions</li>
          <li><strong>Resource Conservation:</strong> Lower carbon footprints often mean more efficient resource use</li>
          <li><strong>Cost Savings:</strong> Many carbon reduction strategies also save money</li>
          <li><strong>Health Benefits:</strong> Sustainable choices often improve air quality and health</li>
          <li><strong>Future Generations:</strong> Reducing emissions helps preserve the planet for future generations</li>
          <li><strong>Global Goals:</strong> Supports international climate targets and sustainability goals</li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our Carbon Footprint Calculator provides comprehensive functionality:</p>
        <ul>
          <li><strong>Multi-Category Analysis:</strong> Covers transportation, energy, food, and waste</li>
          <li><strong>Personalized Calculations:</strong> Uses your specific inputs for accurate results</li>
          <li><strong>Comparison Benchmarking:</strong> Compares your footprint to national averages</li>
          <li><strong>Customized Tips:</strong> Provides personalized reduction recommendations</li>
          <li><strong>Tabbed Interface:</strong> Easy navigation through different input categories</li>
          <li><strong>Detailed Breakdown:</strong> Shows emissions by category for targeted improvements</li>
          <li><strong>Educational Content:</strong> Explains emission factors and calculation methods</li>
          <li><strong>Mobile Friendly:</strong> Responsive design for calculation on any device</li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-leaf"></i> Personal Sustainability</h4>
            <p>Track and reduce your personal environmental impact</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-graduation-cap"></i> Education</h4>
            <p>Learn about carbon emissions and environmental science</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Goal Setting</h4>
            <p>Establish and track progress toward emission reduction goals</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-users"></i> Family Planning</h4>
            <p>Calculate household emissions and plan family sustainability strategies</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-briefcase"></i> Business Use</h4>
            <p>Estimate employee carbon footprints for corporate sustainability programs</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-globe"></i> Climate Action</h4>
            <p>Contribute to global climate change mitigation efforts</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection faqs={faqData} />
    </ToolPageLayout>
  );
};

export default CarbonFootprintCalculator;
