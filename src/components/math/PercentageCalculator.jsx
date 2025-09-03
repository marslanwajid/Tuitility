import React, { useState } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import percentageCalculatorLogic from '../../assets/js/math/percentage-calculator.js';
import '../../assets/css/math/percentage-calculator.css';

const PercentageCalculator = () => {
  const [formData, setFormData] = useState(percentageCalculatorLogic.resetFormData());
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Tool data
  const toolData = {
    name: 'Percentage Calculator',
    description: 'Comprehensive percentage calculator with 14 different calculation types, step-by-step solutions, and detailed explanations for all percentage operations.',
    icon: 'fas fa-percentage',
    category: 'Math',
    breadcrumb: ['Math', 'Calculators', 'Percentage Calculator']
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
    { name: 'Fraction Calculator', url: '/math/calculators/fraction-calculator', icon: 'fas fa-divide' },
    { name: 'Fraction to Percent', url: '/math/calculators/fraction-to-percent-calculator', icon: 'fas fa-percentage' },
    { name: 'Comparing Fractions', url: '/math/calculators/comparing-fractions-calculator', icon: 'fas fa-balance-scale' },
    { name: 'Comparing Decimals', url: '/math/calculators/comparing-decimals-calculator', icon: 'fas fa-sort-numeric-up' },
    { name: 'Decimal Calculator', url: '/math/calculators/decimal-calculator', icon: 'fas fa-calculator' },
    { name: 'Binary Calculator', url: '/math/calculators/binary-calculator', icon: 'fas fa-1' },
    { name: 'LCD Calculator', url: '/math/calculators/lcd-calculator', icon: 'fas fa-sort-numeric-down' },
    { name: 'LCM Calculator', url: '/math/calculators/lcm-calculator', icon: 'fas fa-sort-numeric-up' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-are-percentages', title: 'What are Percentages?' },
    { id: 'calculation-types', title: 'Types of Calculations' },
    { id: 'how-to-use', title: 'How to Use' },
    { id: 'examples', title: 'Examples' },
    { id: 'formulas', title: 'Key Formulas' },
    { id: 'significance', title: 'Significance' },
    { id: 'applications', title: 'Applications' },
    { id: 'faqs', title: 'FAQs' }
  ];

  const handleInputChange = (field, value) => {
    if (percentageCalculatorLogic.validateInput(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSelectChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculate = () => {
    const calculationResult = percentageCalculatorLogic.calculate(formData);
    
    if (calculationResult.error) {
      setError(calculationResult.error);
      setResult(null);
    } else {
      setResult(calculationResult);
      setError('');
    }
  };



  const handleReset = () => {
    setFormData(percentageCalculatorLogic.resetFormData());
    setResult(null);
    setError('');
  };

  // Render input set based on calculation type
  const renderInputSet = () => {
    const type = formData.calculationType;
    
    switch(type) {
      case 'percent-of':
        return (
          <div className="input-set">
            <div className="form-group">
              <label htmlFor="p1">Percentage (P%)</label>
              <input
                type="text"
                id="p1"
                value={formData.p1}
                onChange={(e) => handleInputChange('p1', e.target.value)}
                placeholder="Enter percentage"
              />
            </div>
            <div className="form-group">
              <label htmlFor="x1">Number (X)</label>
              <input
                type="text"
                id="x1"
                value={formData.x1}
                onChange={(e) => handleInputChange('x1', e.target.value)}
                placeholder="Enter number"
              />
            </div>
          </div>
        );

      case 'y-percent-of-x':
        return (
          <div className="input-set">
            <div className="form-group">
              <label htmlFor="y2">Number (Y)</label>
              <input
                type="text"
                id="y2"
                value={formData.y2}
                onChange={(e) => handleInputChange('y2', e.target.value)}
                placeholder="Enter number"
              />
            </div>
            <div className="form-group">
              <label htmlFor="x2">Total (X)</label>
              <input
                type="text"
                id="x2"
                value={formData.x2}
                onChange={(e) => handleInputChange('x2', e.target.value)}
                placeholder="Enter total"
              />
            </div>
          </div>
        );

      case 'y-is-p-of-what':
        return (
          <div className="input-set">
            <div className="form-group">
              <label htmlFor="y3">Number (Y)</label>
              <input
                type="text"
                id="y3"
                value={formData.y3}
                onChange={(e) => handleInputChange('y3', e.target.value)}
                placeholder="Enter number"
              />
            </div>
            <div className="form-group">
              <label htmlFor="p3">Percentage (P%)</label>
              <input
                type="text"
                id="p3"
                value={formData.p3}
                onChange={(e) => handleInputChange('p3', e.target.value)}
                placeholder="Enter percentage"
              />
            </div>
          </div>
        );

      case 'what-percent-of-x-is-y':
        return (
          <div className="input-set">
            <div className="form-group">
              <label htmlFor="x4">Total (X)</label>
              <input
                type="text"
                id="x4"
                value={formData.x4}
                onChange={(e) => handleInputChange('x4', e.target.value)}
                placeholder="Enter total"
              />
            </div>
            <div className="form-group">
              <label htmlFor="y4">Number (Y)</label>
              <input
                type="text"
                id="y4"
                value={formData.y4}
                onChange={(e) => handleInputChange('y4', e.target.value)}
                placeholder="Enter number"
              />
            </div>
          </div>
        );

      case 'p-of-what-is-y':
        return (
          <div className="input-set">
            <div className="form-group">
              <label htmlFor="p5">Percentage (P%)</label>
              <input
                type="text"
                id="p5"
                value={formData.p5}
                onChange={(e) => handleInputChange('p5', e.target.value)}
                placeholder="Enter percentage"
              />
            </div>
            <div className="form-group">
              <label htmlFor="y5">Number (Y)</label>
              <input
                type="text"
                id="y5"
                value={formData.y5}
                onChange={(e) => handleInputChange('y5', e.target.value)}
                placeholder="Enter number"
              />
            </div>
          </div>
        );

      case 'y-out-of-what-is-p':
        return (
          <div className="input-set">
            <div className="form-group">
              <label htmlFor="y6">Number (Y)</label>
              <input
                type="text"
                id="y6"
                value={formData.y6}
                onChange={(e) => handleInputChange('y6', e.target.value)}
                placeholder="Enter number"
              />
            </div>
            <div className="form-group">
              <label htmlFor="p6">Percentage (P%)</label>
              <input
                type="text"
                id="p6"
                value={formData.p6}
                onChange={(e) => handleInputChange('p6', e.target.value)}
                placeholder="Enter percentage"
              />
            </div>
          </div>
        );

      case 'what-out-of-x-is-p':
        return (
          <div className="input-set">
            <div className="form-group">
              <label htmlFor="x7">Total (X)</label>
              <input
                type="text"
                id="x7"
                value={formData.x7}
                onChange={(e) => handleInputChange('x7', e.target.value)}
                placeholder="Enter total"
              />
            </div>
            <div className="form-group">
              <label htmlFor="p7">Percentage (P%)</label>
              <input
                type="text"
                id="p7"
                value={formData.p7}
                onChange={(e) => handleInputChange('p7', e.target.value)}
                placeholder="Enter percentage"
              />
            </div>
          </div>
        );

      case 'y-out-of-x-is-what':
        return (
          <div className="input-set">
            <div className="form-group">
              <label htmlFor="y8">Number (Y)</label>
              <input
                type="text"
                id="y8"
                value={formData.y8}
                onChange={(e) => handleInputChange('y8', e.target.value)}
                placeholder="Enter number"
              />
            </div>
            <div className="form-group">
              <label htmlFor="x8">Total (X)</label>
              <input
                type="text"
                id="x8"
                value={formData.x8}
                onChange={(e) => handleInputChange('x8', e.target.value)}
                placeholder="Enter total"
              />
            </div>
          </div>
        );

      case 'x-plus-p-is-what':
        return (
          <div className="input-set">
            <div className="form-group">
              <label htmlFor="x9">Number (X)</label>
              <input
                type="text"
                id="x9"
                value={formData.x9}
                onChange={(e) => handleInputChange('x9', e.target.value)}
                placeholder="Enter number"
              />
            </div>
            <div className="form-group">
              <label htmlFor="p9">Percentage Increase (P%)</label>
              <input
                type="text"
                id="p9"
                value={formData.p9}
                onChange={(e) => handleInputChange('p9', e.target.value)}
                placeholder="Enter percentage"
              />
            </div>
          </div>
        );

      case 'x-plus-what-is-y':
        return (
          <div className="input-set">
            <div className="form-group">
              <label htmlFor="x10">Original Number (X)</label>
              <input
                type="text"
                id="x10"
                value={formData.x10}
                onChange={(e) => handleInputChange('x10', e.target.value)}
                placeholder="Enter original number"
              />
            </div>
            <div className="form-group">
              <label htmlFor="y10">Final Number (Y)</label>
              <input
                type="text"
                id="y10"
                value={formData.y10}
                onChange={(e) => handleInputChange('y10', e.target.value)}
                placeholder="Enter final number"
              />
            </div>
          </div>
        );

      case 'what-plus-p-is-y':
        return (
          <div className="input-set">
            <div className="form-group">
              <label htmlFor="p11">Percentage Increase (P%)</label>
              <input
                type="text"
                id="p11"
                value={formData.p11}
                onChange={(e) => handleInputChange('p11', e.target.value)}
                placeholder="Enter percentage"
              />
            </div>
            <div className="form-group">
              <label htmlFor="y11">Final Number (Y)</label>
              <input
                type="text"
                id="y11"
                value={formData.y11}
                onChange={(e) => handleInputChange('y11', e.target.value)}
                placeholder="Enter final number"
              />
            </div>
          </div>
        );

      case 'x-minus-p-is-what':
        return (
          <div className="input-set">
            <div className="form-group">
              <label htmlFor="x12">Number (X)</label>
              <input
                type="text"
                id="x12"
                value={formData.x12}
                onChange={(e) => handleInputChange('x12', e.target.value)}
                placeholder="Enter number"
              />
            </div>
            <div className="form-group">
              <label htmlFor="p12">Percentage Decrease (P%)</label>
              <input
                type="text"
                id="p12"
                value={formData.p12}
                onChange={(e) => handleInputChange('p12', e.target.value)}
                placeholder="Enter percentage"
              />
            </div>
          </div>
        );

      case 'x-minus-what-is-y':
        return (
          <div className="input-set">
            <div className="form-group">
              <label htmlFor="x13">Original Number (X)</label>
              <input
                type="text"
                id="x13"
                value={formData.x13}
                onChange={(e) => handleInputChange('x13', e.target.value)}
                placeholder="Enter original number"
              />
            </div>
            <div className="form-group">
              <label htmlFor="y13">Final Number (Y)</label>
              <input
                type="text"
                id="y13"
                value={formData.y13}
                onChange={(e) => handleInputChange('y13', e.target.value)}
                placeholder="Enter final number"
              />
            </div>
          </div>
        );

      case 'what-minus-p-is-y':
        return (
          <div className="input-set">
            <div className="form-group">
              <label htmlFor="p14">Percentage Decrease (P%)</label>
              <input
                type="text"
                id="p14"
                value={formData.p14}
                onChange={(e) => handleInputChange('p14', e.target.value)}
                placeholder="Enter percentage"
              />
            </div>
            <div className="form-group">
              <label htmlFor="y14">Final Number (Y)</label>
              <input
                type="text"
                id="y14"
                value={formData.y14}
                onChange={(e) => handleInputChange('y14', e.target.value)}
                placeholder="Enter final number"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };



  return (
    <ToolPageLayout 
      toolData={toolData} 
      tableOfContents={tableOfContents}
      categories={categories}
      relatedTools={relatedTools}
    >
      <CalculatorSection 
        title="Percentage Calculator"
        onCalculate={calculate}
        calculateButtonText="Calculate"
        error={error}
        result={null}
      >
        <div className="calculator-form">
              <div className="form-row">
                <div className="form-group calculation-type-group">
                  <label htmlFor="calculation-type">Calculation Type</label>
                  <select
                    id="calculation-type"
                    value={formData.calculationType}
                    onChange={(e) => handleSelectChange('calculationType', e.target.value)}
                  >
                    {percentageCalculatorLogic.calculationTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="input-sets-container">
                {renderInputSet()}
              </div>

          <div className="calculator-actions">
                <button type="button" className="btn-reset" onClick={handleReset}>
                  <i className="fas fa-redo"></i>
                  Reset
                </button>
              </div>
              </div>

        {/* Custom Results Section */}
            {result && (
          <div className="result-section percentage-calculator-result">
                <h3 className="result-title">
                  <i className="fas fa-check-circle"></i>
                  Result
                </h3>
                <div className="result-display">
                  <div className="results-container">
                    <div className="result-row">
                      <span className="result-label">Result:</span>
                      <span className="result-value">{result.result}</span>
                    </div>
                  </div>
                  
                  <div className="solution-steps">
                    <h4>
                      <i className="fas fa-list-ol"></i>
                      Solution Steps
                    </h4>
                    <div className="steps-container">
                      {result.steps.map((step, index) => (
                        <div key={index} className="step">
                          {step}
                        </div>
                      ))}
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
          Percentages are a fundamental concept in mathematics and everyday life, representing parts of a whole as fractions of 100.
        </p>
        <p>
          Our Percentage Calculator provides comprehensive tools for all types of percentage calculations with step-by-step solutions and clear explanations.
        </p>
      </ContentSection>

      <ContentSection id="what-are-percentages" title="What are Percentages?">
        <p>
          A percentage is a way to express a number as a fraction of 100. The word 'percent' means 'per hundred' and is denoted by the symbol %.
        </p>
        <ul>
          <li>
            <i className="fas fa-check"></i>
            <span>Percentages represent parts of a whole as fractions of 100</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span>Common examples: 50% = 50/100 = 0.5 = half</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span>Percentages are used in finance, statistics, and everyday calculations</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span>They provide a standardized way to compare different quantities</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="calculation-types" title="Types of Percentage Calculations">
        <p>Our calculator supports the following percentage operations:</p>
        <ul>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Basic percentage calculations:</strong> What is P% of X?</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Percentage of a number:</strong> Y is what % of X?</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Reverse percentage calculations:</strong> Y is P% of what?</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Percentage increase and decrease calculations</strong></span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Percentage change calculations</strong></span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Compound percentage calculations</strong></span>
          </li>
        </ul>
        <div className="formula-section">
          <h3>Key Percentage Formulas</h3>
          <div className="math-formula" id="percentage-formula-1">Y = P% × X</div>
          <div className="math-formula" id="percentage-formula-2">P% = (Y ÷ X) × 100</div>
          <div className="math-formula" id="percentage-formula-3">X = Y ÷ (P% ÷ 100)</div>
          <div className="math-formula" id="percentage-formula-4">Y = X + (X × P%)</div>
          <div className="math-formula" id="percentage-formula-5">Y = X - (X × P%)</div>
        </div>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Percentage Calculator">
        <p>Using the percentage calculator is straightforward:</p>
        <ul className="usage-steps">
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Select Calculation Type:</strong> Choose from 14 different percentage calculation types</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Enter Values:</strong> Input the required numbers in the fields that appear</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Calculate:</strong> Click "Calculate" to see the result and detailed step-by-step solution</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Reset:</strong> Use Reset to clear all inputs and start over</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Review Steps:</strong> Review the solution steps to understand the calculation process</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: Basic Percentage</h3>
          <p><strong>Problem:</strong> What is 25% of 80?</p>
          <div className="example-solution">
            <p><strong>Step 1:</strong> Convert percentage to decimal: 25% = 0.25</p>
            <p><strong>Step 2:</strong> Multiply: 0.25 × 80 = 20</p>
            <p><strong>Result:</strong> 25% of 80 is 20</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: Percentage of a Number</h3>
          <p><strong>Problem:</strong> 15 is what percentage of 60?</p>
          <div className="example-solution">
            <p><strong>Step 1:</strong> Divide: 15 ÷ 60 = 0.25</p>
            <p><strong>Step 2:</strong> Convert to percentage: 0.25 × 100 = 25%</p>
            <p><strong>Result:</strong> 15 is 25% of 60</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 3: Percentage Increase</h3>
          <p><strong>Problem:</strong> What is 120 plus 15%?</p>
          <div className="example-solution">
            <p><strong>Step 1:</strong> Calculate 15% of 120: 120 × 0.15 = 18</p>
            <p><strong>Step 2:</strong> Add to original: 120 + 18 = 138</p>
            <p><strong>Result:</strong> 120 plus 15% is 138</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="formulas" title="Key Percentage Formulas">
        <p>The fundamental formulas for percentage calculations:</p>
        <ul>
          <li><strong>Basic percentage:</strong> Y = P% × X</li>
          <li><strong>Percentage of a number:</strong> P% = (Y ÷ X) × 100</li>
          <li><strong>Reverse percentage:</strong> X = Y ÷ (P% ÷ 100)</li>
          <li><strong>Percentage increase:</strong> Y = X + (X × P%)</li>
          <li><strong>Percentage decrease:</strong> Y = X - (X × P%)</li>
          <li><strong>Percentage change:</strong> P% = ((Y - X) ÷ X) × 100</li>
        </ul>
        <div className="formula-section">
          <h3>Mathematical Formulas</h3>
          <div className="math-formula" id="percentage-formula-1">Y = P% × X</div>
          <div className="math-formula" id="percentage-formula-2">P% = (Y ÷ X) × 100</div>
          <div className="math-formula" id="percentage-formula-3">X = Y ÷ (P% ÷ 100)</div>
          <div className="math-formula-4">Y = X + (X × P%)</div>
          <div className="math-formula" id="percentage-formula-5">Y = X - (X × P%)</div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding percentages is crucial in mathematics for several reasons:</p>
        <ul>
          <li>
            <i className="fas fa-check"></i>
            <span>Essential for financial calculations and budgeting</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span>Used in academic grading and statistics</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span>Important for business and sales calculations</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span>Critical for understanding data and trends</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span>Used in everyday situations like discounts and tips</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-dollar-sign"></i>Financial Calculations</h4>
            <p>Interest rates, discounts, taxes, and investment returns</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-graduation-cap"></i>Academic Grading</h4>
            <p>Performance analysis and grade calculations</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i>Business Analytics</h4>
            <p>Sales performance, growth rates, and market analysis</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-bar"></i>Statistical Analysis</h4>
            <p>Data interpretation and trend analysis</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-shopping-cart"></i>Everyday Calculations</h4>
            <p>Tips, discounts, sales, and personal finance</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-flask"></i>Scientific Research</h4>
            <p>Experimental results and measurement analysis</p>
          </div>
    </div>
      </ContentSection>

      <FAQSection 
        faqs={[
          {
            question: "What is the difference between percentage and decimal?",
            answer: "A percentage is a number expressed as a fraction of 100 (e.g., 25%), while a decimal is a number expressed in base-10 notation (e.g., 0.25). To convert percentage to decimal, divide by 100."
          },
          {
            question: "How do I calculate percentage increase?",
            answer: "To calculate percentage increase, subtract the original value from the new value, divide by the original value, and multiply by 100. Formula: ((New - Original) ÷ Original) × 100."
          },
          {
            question: "Can percentages be greater than 100%?",
            answer: "Yes, percentages can be greater than 100%. This typically indicates an increase of more than the original amount. For example, 150% means 1.5 times the original value."
          },
          {
            question: "How do I calculate reverse percentage?",
            answer: "Reverse percentage is used when you know the result and the percentage, but need to find the original value. Formula: Original = Result ÷ (1 + Percentage/100) for increases, or Original = Result ÷ (1 - Percentage/100) for decreases."
          },
          {
            question: "What is compound percentage?",
            answer: "Compound percentage occurs when a percentage change is applied multiple times. Each calculation uses the result of the previous calculation as the new base value, leading to exponential growth or decay."
          }
        ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  );
};

export default PercentageCalculator;
