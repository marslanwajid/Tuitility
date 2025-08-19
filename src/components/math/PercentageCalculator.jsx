import React, { useState } from 'react';
import { ToolHero, ToolLayout, ContentSection, TableOfContents, FeedbackForm, FAQSection, MathFormula } from '../tool';
import { getRelatedTools } from '../../utils/toolHelpers';
import percentageCalculatorLogic from '../../assets/js/math/percentage-calculator.js';
import '../../assets/css/math/percentage-calculator.css';

const PercentageCalculator = () => {
  const [formData, setFormData] = useState(percentageCalculatorLogic.resetFormData());
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

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

  const handleSubmit = (e) => {
    e.preventDefault();
    calculate();
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

  // Content sections for the Percentage Calculator
  const contentSections = [
    {
      id: "introduction",
      title: "Introduction",
      intro: [
        "Percentages are a fundamental concept in mathematics and everyday life, representing parts of a whole as fractions of 100.",
        "Our Percentage Calculator provides comprehensive tools for all types of percentage calculations with step-by-step solutions and clear explanations."
      ]
    },
    {
      id: "what-are-percentages",
      title: "What are Percentages?",
      intro: [
        "A percentage is a way to express a number as a fraction of 100. The word 'percent' means 'per hundred' and is denoted by the symbol %."
      ],
      list: [
        "Percentages represent parts of a whole as fractions of 100",
        "Common examples: 50% = 50/100 = 0.5 = half",
        "Percentages are used in finance, statistics, and everyday calculations",
        "They provide a standardized way to compare different quantities"
      ]
    },
    {
      id: "calculation-types",
      title: "Types of Percentage Calculations",
      list: [
        "Basic percentage calculations (What is P% of X?)",
        "Percentage of a number (Y is what % of X?)",
        "Reverse percentage calculations (Y is P% of what?)",
        "Percentage increase and decrease calculations",
        "Percentage change calculations",
        "Compound percentage calculations"
      ],
      content: (
        <div>
          <p>Our calculator supports the following percentage operations:</p>
          <div style={{ marginTop: '1rem' }}>
            <MathFormula formula="Y = P\% \times X" variant="content" />
            <MathFormula formula="P\% = \frac{Y}{X} \times 100" variant="content" />
            <MathFormula formula="X = \frac{Y}{P\%} \times 100" variant="content" />
            <MathFormula formula="Y = X + (X \times P\%)" variant="content" />
            <MathFormula formula="Y = X - (X \times P\%)" variant="content" />
          </div>
        </div>
      )
    },
    {
      id: "how-to-use",
      title: "How to Use Percentage Calculator",
      steps: [
        "Select the type of percentage calculation you want to perform from the dropdown",
        "Enter the required values in the input fields that appear",
        "Click Calculate to see the result and detailed step-by-step solution",
        "Use Reset to clear all inputs and start over",
        "Review the solution steps to understand the calculation process"
      ]
    },
    {
      id: "examples",
      title: "Examples",
      examples: [
        {
          title: "Example 1: Basic Percentage",
          description: "What is 25% of 80?",
          solution: [
            { label: "Step 1", content: "Convert 25% to decimal: 25% = 0.25" },
            { label: "Step 2", content: "Multiply: 0.25 × 80 = 20" },
            { label: "Result", content: "25% of 80 is 20" }
          ],
          content: (
            <div>
              <p><strong>Problem:</strong> What is 25% of 80?</p>
              <div className="solution-steps">
                <h4>Solution:</h4>
                <ol>
                  <li>Convert percentage to decimal: <MathFormula formula="25\% = 0.25" variant="content" /></li>
                  <li>Multiply: <MathFormula formula="0.25 \times 80 = 20" variant="content" /></li>
                  <li>Result: <MathFormula formula="20" variant="result" /></li>
                </ol>
              </div>
            </div>
          )
        },
        {
          title: "Example 2: Percentage of a Number",
          description: "15 is what percentage of 60?",
          solution: [
            { label: "Step 1", content: "Divide: 15 ÷ 60 = 0.25" },
            { label: "Step 2", content: "Multiply by 100: 0.25 × 100 = 25%" },
            { label: "Result", content: "15 is 25% of 60" }
          ],
          content: (
            <div>
              <p><strong>Problem:</strong> 15 is what percentage of 60?</p>
              <div className="solution-steps">
                <h4>Solution:</h4>
                <ol>
                  <li>Divide: <MathFormula formula="\frac{15}{60} = 0.25" variant="content" /></li>
                  <li>Convert to percentage: <MathFormula formula="0.25 \times 100 = 25\%" variant="content" /></li>
                  <li>Result: <MathFormula formula="25\%" variant="result" /></li>
                </ol>
              </div>
            </div>
          )
        },
        {
          title: "Example 3: Percentage Increase",
          description: "What is 120 plus 15%?",
          solution: [
            { label: "Step 1", content: "Calculate 15% of 120: 120 × 0.15 = 18" },
            { label: "Step 2", content: "Add to original: 120 + 18 = 138" },
            { label: "Result", content: "120 plus 15% is 138" }
          ],
          content: (
            <div>
              <p><strong>Problem:</strong> What is 120 plus 15%?</p>
              <div className="solution-steps">
                <h4>Solution:</h4>
                <ol>
                  <li>Calculate 15% of 120: <MathFormula formula="120 \times 0.15 = 18" variant="content" /></li>
                  <li>Add to original: <MathFormula formula="120 + 18 = 138" variant="content" /></li>
                  <li>Result: <MathFormula formula="138" variant="result" /></li>
                </ol>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: "formulas",
      title: "Key Percentage Formulas",
      list: [
        "Basic percentage: Y = P% × X",
        "Percentage of a number: P% = (Y ÷ X) × 100",
        "Reverse percentage: X = Y ÷ (P% ÷ 100)",
        "Percentage increase: Y = X + (X × P%)",
        "Percentage decrease: Y = X - (X × P%)",
        "Percentage change: P% = ((Y - X) ÷ X) × 100"
      ]
    },
    {
      id: "significance",
      title: "Significance",
      list: [
        "Essential for financial calculations and budgeting",
        "Used in academic grading and statistics",
        "Important for business and sales calculations",
        "Critical for understanding data and trends",
        "Used in everyday situations like discounts and tips"
      ]
    },
    {
      id: "applications",
      title: "Applications",
      list: [
        "Financial calculations (interest, discounts, taxes)",
        "Academic grading and performance analysis",
        "Business and sales calculations",
        "Statistical analysis and data interpretation",
        "Everyday calculations (tips, discounts, sales)",
        "Scientific research and measurements"
      ]
    },
    {
      id: "faqs",
      title: "Frequently Asked Questions",
      content: (
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
        />
      )
    }
  ];

  // Table of Contents sections
  const tocSections = [
    { id: "introduction", title: "Introduction" },
    { id: "what-are-percentages", title: "What are Percentages?" },
    { id: "calculation-types", title: "Types of Calculations" },
    { id: "how-to-use", title: "How to Use" },
    { id: "examples", title: "Examples" },
    { id: "formulas", title: "Key Formulas" },
    { id: "significance", title: "Significance" },
    { id: "applications", title: "Applications" },
    { id: "faqs", title: "FAQs" }
  ];

  // Sidebar props - Math-specific related tools
  const sidebarProps = {
    relatedTools: getRelatedTools('math')
  };

  return (
    <div className="tool-page">
      <ToolHero 
        title="Percentage Calculator"
        icon="fas fa-percentage"
        description="Comprehensive percentage calculator with 14 different calculation types, step-by-step solutions, and detailed explanations for all percentage operations."
        features={[
          "14 calculation types",
          "Step-by-step solutions",
          "Dynamic form inputs",
          "Real-time validation"
        ]}
      />
      
      <ToolLayout sidebarProps={sidebarProps}>
        {/* Calculator Section */}
        <section className="calculator-section">
          <div className="percentage-calculator">
            <h2 className="calculator-title">
              <i className="fas fa-percentage"></i>
              Percentage Calculator
            </h2>
            
            <form className="calculator-form" onSubmit={handleSubmit}>
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

              <div className="form-actions">
                <button type="submit" className="btn-calculate">
                  <i className="fas fa-calculator"></i>
                  Calculate
                </button>
                <button type="button" className="btn-reset" onClick={handleReset}>
                  <i className="fas fa-redo"></i>
                  Reset
                </button>
              </div>
            </form>

            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-triangle"></i>
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className="result-section show">
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
          </div>
        </section>

        {/* Table of Contents & Feedback */}
        <section className="toc-feedback-section">
          <div className="toc-feedback-container">
            <TableOfContents sections={tocSections} />
            <FeedbackForm onSubmit={(data) => console.log('Feedback submitted:', data)} />
          </div>
        </section>

        {/* Content Section */}
        <ContentSection sections={contentSections} />
      </ToolLayout>
    </div>
  );
};

export default PercentageCalculator;
