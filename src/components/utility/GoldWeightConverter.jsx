import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import FeedbackForm from '../tool/FeedbackForm';
import TableOfContents from '../tool/TableOfContents';
import { toolCategories } from '../../data/toolCategories';
import '../../assets/css/utility/gold-weight-converter.css';

const GoldWeightConverter = () => {
  // Conversion Factors (as provided in user logic)
  const conversionFactors = {
    g: 1,
    kg: 1000,
    oz: 31.1035, // Troy ounce
    ct: 0.2, // Carat
    dwt: 1.55517, // Pennyweight
    gn: 0.0648, // Grain
    lb: 373.242, // Troy pound
    tola: 11.6638, // Tola
  };

  const unitNames = {
    g: 'Grams (g)',
    kg: 'Kilograms (kg)',
    oz: 'Troy Ounces (oz t)',
    ct: 'Carats (ct)',
    dwt: 'Pennyweight (dwt)',
    gn: 'Grains (gn)',
    lb: 'Troy Pounds (lb t)',
    tola: 'Tola'
  };

  const [state, setState] = useState({
      value: '',
      fromUnit: 'g',
      toUnit: 'oz',
      metal: 'gold'
  });

  const [result, setResult] = useState('0');
  const [allConversions, setAllConversions] = useState([]);

  // Logic adapted from user snippet
  const convertUnits = () => {
      const val = parseFloat(state.value);
      if (!state.value || isNaN(val) || val < 0) {
          setResult('0');
          setAllConversions([]);
          return;
      }

      const valueInGrams = val * conversionFactors[state.fromUnit];
      const finalResult = valueInGrams / conversionFactors[state.toUnit];

      setResult(formatResult(finalResult));
      generateAllConversions(valueInGrams);
  };

  const generateAllConversions = (grams) => {
      const conversions = [];
      for (const unit in conversionFactors) {
          const val = grams / conversionFactors[unit];
          conversions.push({
              unit: unit,
              name: unitNames[unit],
              value: formatResult(val)
          });
      }
      setAllConversions(conversions);
  };

  const formatResult = (val) => {
      if (val >= 1000) return val.toFixed(2);
      if (val >= 100) return val.toFixed(3);
      if (val >= 10) return val.toFixed(4);
      if (val >= 1) return val.toFixed(5);
      return val.toFixed(6);
  };

  const handleReset = () => {
      setState({
          value: '',
          fromUnit: 'g',
          toUnit: 'oz',
          metal: 'gold'
      });
      setResult('0');
      setAllConversions([]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
  };

  // Effect to auto-convert on change
  useEffect(() => {
      convertUnits();
  }, [state]);

  const handleChange = (field, e) => {
      setState(prev => ({ ...prev, [field]: e.target.value }));
  };

  // Tool Data
  const toolData = {
    name: "Gold Weight Converter",
    title: "Precious Metal Weight Converter",
    description: "Accurately convert weights for Gold, Silver, Platinum, and other precious metals between Grams, Troy Ounces, Carats, Pennyweights, and Tolas.",
    icon: "fas fa-coins",
    category: "Converters",
    breadcrumb: ["Utility", "Tools", "Converters"], 
    tags: ["gold", "silver", "weight", "converter", "troy ounce", "gram", "karat"]
  };
  

  const relatedTools = [
      { name: "Currency Calculator", url: "/finance/calculators/currency-calculator", icon: "fas fa-exchange-alt" },
      { name: "RGB to Pantone", url: "/utility-tools/converter-tools/rgb-to-pantone-converter", icon: "fas fa-palette" },
      { name: "ROI Calculator", url: "/finance/calculators/roi-calculator", icon: "fas fa-chart-line" },
      { name: "Percent to Fraction", url: "/math/calculators/percent-to-fraction-calculator", icon: "fas fa-percentage" },
      { name: "Sales Tax Calculator", url: "/finance/calculators/sales-tax-calculator", icon: "fas fa-receipt" }
  ];

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'features', title: 'Features' },
    { id: 'how-to-use', title: 'How to Use' },
    { id: 'units', title: 'Understanding Units' },
    { id: 'historical', title: 'Historical Context' },
    { id: 'applications', title: 'Market Applications' },
    { id: 'accuracy', title: 'Precision & Accuracy' },
    { id: 'tips', title: 'Trading Tips' },
    { id: 'faqs', title: 'FAQ' }
  ];

  const faqs = [
    { question: "What is a Troy Ounce?", answer: "A Troy Ounce (approx 31.1g) is the standard unit for precious metals, heavier than a standard 'Avoirdupois' ounce (28.35g)." },
    { question: "What is a Tola?", answer: "The Tola is a traditional South Asian unit of mass, now standardized as 11.6638038 grams, widely used for gold bars in India and Pakistan." },
    { question: "Does this work for Silver?", answer: "Yes! Weight is weight. Whether it's gold, silver, or platinum, 1 gram is always 1 gram." },
    { question: "Why Pennyweight (dwt)?", answer: "Pennyweight is an old unit equal to 24 grains or 1/20 of a troy ounce, still commonly used by jewelers for valuing small amounts of metal." }
  ];

  return (
    <ToolPageLayout
      toolData={toolData}
      categories={toolCategories}
      relatedTools={relatedTools}
      tableOfContents={tableOfContents}
    >
      <CalculatorSection title="Gold Weight Converter" icon="fas fa-coins">
          <div className="gold-converter-container">
              <div className="gw-converter-box">
                  
                  <div className="gw-metal-selector">
                      <label>Select Metal Type (Reference)</label>
                      <div className="gw-metal-select-wrapper">
                          <select value={state.metal} onChange={(e) => handleChange('metal', e)}>
                              <option value="gold">Gold</option>
                              <option value="silver">Silver</option>
                              <option value="platinum">Platinum</option>
                              <option value="palladium">Palladium</option>
                          </select>
                      </div>
                  </div>

                  <div className="gw-input-group-row">
                      <div className="gw-input-wrapper">
                          <label className="block mb-2 text-sm font-semibold text-gray-700">Weight to Convert</label>
                          <input 
                              type="number" 
                              value={state.value} 
                              onChange={(e) => handleChange('value', e)} 
                              placeholder="Enter weight..."
                              min="0"
                          />
                      </div>
                      <div className="gw-unit-select">
                          <label className="block mb-2 text-sm font-semibold text-gray-700">From Unit</label>
                          <select value={state.fromUnit} onChange={(e) => handleChange('fromUnit', e)}>
                              {Object.keys(unitNames).map(key => (
                                  <option key={key} value={key}>{unitNames[key]}</option>
                              ))}
                          </select>
                      </div>
                  </div>

                  <div className="gw-converter-arrow">
                      <i className="fas fa-arrow-down fa-2x"></i>
                  </div>

                  <div className="gw-input-group-full" style={{ marginTop: '20px' }}>
                      <div className="gw-unit-select">
                           <label className="block mb-2 text-sm font-semibold text-gray-700">To Unit</label>
                           <select value={state.toUnit} onChange={(e) => handleChange('toUnit', e)}>
                               {Object.keys(unitNames).map(key => (
                                   <option key={key} value={key}>{unitNames[key]}</option>
                               ))}
                           </select>
                      </div>
                  </div>

                  <div className="gw-result-display">
                      <button className="gw-copy-result-btn" onClick={handleCopy}>
                          <i className="fas fa-copy"></i> Copy
                      </button>
                      <span className="gw-result-value">{result}</span>
                      <span className="gw-result-unit">{unitNames[state.toUnit]}</span>
                  </div>

                  <div className="gw-action-buttons">
                      <button className="gw-reset-btn" onClick={handleReset}>
                          <i className="fas fa-undo"></i> Reset
                      </button>
                  </div>

                  {allConversions.length > 0 && (
                      <div className="gw-all-conversions-container">
                          <h4>Quick Reference Table (Based on Input)</h4>
                          <table className="gw-conversions-table">
                              <tbody>
                                  {allConversions.map((item) => (
                                      <tr key={item.unit}>
                                          <td>{item.name}</td>
                                          <td>{item.value}</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  )}

              </div>
          </div>
      </CalculatorSection>

      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName={toolData.name} />
      </div>

       <ContentSection id="introduction" title="Introduction">
            <div className="content-block">
                <p>Navigating the world of precious metals requires precise measurements. Our Gold Weight Converter is designed for investors, jewelers, and collectors who need to translate weights between standard metric units (grams, kilos) and traditional trade units like Troy Ounces and Tolas.</p>
            </div>
       </ContentSection>

       <ContentSection id="features" title="Key Features">
           <div className="content-block">
               <ul>
                   <li><strong>Comprehensive Unit Support:</strong> Convert between 8 different weight standards including Grams, Troy Ounces, Pennyweights, and Carats.</li>
                   <li><strong>Real-Time Table:</strong> Instantly see your input weight converted into ALL supported units simultaneously for quick comparison.</li>
                   <li><strong>Precision Formatting:</strong> Automatic decimal adjustments ensure accurate readings for even the smallest measurements (up to 6 decimal places).</li>
               </ul>
           </div>
       </ContentSection>

       <ContentSection id="units" title="Understanding Units of Measurement">
           <div className="content-block">
               <p>Precious metals use a unique system:</p>
               <ul>
                   <li><strong>Troy Ounce (oz t):</strong> The global standard for spot prices. One troy ounce is approx 31.1 grams, heavier than a kitchen ounce (28.35g).</li>
                   <li><strong>Carat (ct):</strong> Used for gemstones and pearls. 1 Carat = 0.2 Grams. Note: Don't confuse this with 'Karat', which measures purity.</li>
                   <li><strong>Pennyweight (dwt):</strong> A standard in the jewelry industry, equal to 1.555 grams.</li>
                   <li><strong>Tola:</strong> A South Asian standard, historically the weight of a rupee coin, now fixed at 11.66 grams.</li>
               </ul>
           </div>
       </ContentSection>

       <ContentSection id="how-to-use" title="How to Use">
            <div className="content-block">
                <ol>
                    <li><strong>Enter Weight:</strong> Type the amount of metal you have.</li>
                    <li><strong>Select Origin Unit:</strong> Choose the unit you are measuring FROM (e.g., Grams).</li>
                    <li><strong>Select Target Unit:</strong> Choose the unit you want to convert TO (e.g., Troy Ounces).</li>
                    <li><strong>View Results:</strong> The main result appears in the box, while a breakdown of other units appears below.</li>
                </ol>
            </div>
       </ContentSection>

       <ContentSection id="historical" title="Historical Context">
            <div className="content-block">
                <p>The "Troy" weights date back to the Middle Ages market of Troyes, France. The system survived specifically for precious metals because of its consistent use in coinage. The preservation of units like the Grain (based on a barely grain) connects modern finance to ancient agriculture.</p>
            </div>
       </ContentSection>

       <ContentSection id="applications" title="Market Applications">
            <div className="content-block">
                <p>Accurate conversion is critical for:</p>
                <ul>
                    <li><strong>Arbitrage:</strong> Buying in one unit market (e.g., Dubai Tola) and selling in another (London Troy Ounce).</li>
                    <li><strong>Jewelry Fabrication:</strong> Estimating casting weights in pennyweights from wax models.</li>
                    <li><strong>Scrap Gold:</strong> Calculating the melt value of old jewelry pieces.</li>
                </ul>
            </div>
       </ContentSection>

       <ContentSection id="accuracy" title="Precision & Accuracy">
            <div className="content-block">
                <p>We use industry-standard conversion factors (e.g., 1 oz t = 31.1034768 g) to ensure high precision. However, for large bullion transactions, always verify with certified assay scales.</p>
            </div>
       </ContentSection>

       <ContentSection id="tips" title="Trading Tips">
            <div className="content-block">
                <p>Always check if a price quote is per "Ounce" or "Troy Ounce". If you buy an "ounce" of gold on eBay that turns out to be an avoirdupois ounce (28g), you are losing about 10% of the value compared to a troy ounce (31g).</p>
            </div>
       </ContentSection>

       <FAQSection id="faqs" faqs={faqs} />
    </ToolPageLayout>
  );
};

export default GoldWeightConverter;
