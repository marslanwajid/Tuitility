import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import '../../assets/css/knowledge/age-calculator.css'

// Age Calculator Logic Class
class AgeCalculatorLogic {
  constructor() {
    this.ageCategories = {
      infant: { min: 0, max: 1, label: 'Infant', color: '#e91e63' },
      toddler: { min: 1, max: 3, label: 'Toddler', color: '#9c27b0' },
      preschooler: { min: 3, max: 5, label: 'Preschooler', color: '#673ab7' },
      child: { min: 5, max: 12, label: 'Child', color: '#3f51b5' },
      teenager: { min: 12, max: 18, label: 'Teenager', color: '#2196f3' },
      youngAdult: { min: 18, max: 30, label: 'Young Adult', color: '#00bcd4' },
      adult: { min: 30, max: 50, label: 'Adult', color: '#4caf50' },
      middleAge: { min: 50, max: 65, label: 'Middle Age', color: '#ff9800' },
      senior: { min: 65, max: 100, label: 'Senior', color: '#f44336' }
    };
  }

  calculate(formData) {
    const birthDate = this.parseDate(formData.birthDate, formData.birthTime);
    const calculationDate = this.parseDate(formData.calculationDate, formData.calculationTime);

    if (!birthDate || !calculationDate) {
      throw new Error('Invalid date format');
    }

    if (birthDate > calculationDate) {
      throw new Error('Birth date cannot be in the future');
    }

    const ageDetails = this.calculateAgeDetails(birthDate, calculationDate);
    const nextBirthday = this.calculateNextBirthday(birthDate, calculationDate);
    const ageCategory = this.getAgeCategory(ageDetails.years);

    return {
      ...ageDetails,
      nextBirthday,
      ageCategory,
      birthDate,
      calculationDate
    };
  }

  parseDate(dateString, timeString) {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;

    if (timeString) {
      const [hours, minutes] = timeString.split(':');
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else {
      date.setHours(0, 0, 0, 0);
    }

    return date;
  }

  calculateAgeDetails(birthDate, currentDate) {
    const startDate = new Date(birthDate);
    const endDate = new Date(currentDate);
    
    // Calculate total values
    const totalMilliseconds = endDate - startDate;
    const totalSeconds = Math.floor(totalMilliseconds / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = this.calculateTotalMonths(startDate, endDate);
    const totalYears = Math.floor(totalMonths / 12);
    
    // Calculate years, months, days
    let years = 0;
    let months = 0;
    let days = 0;
    
    let tempDate = new Date(startDate);
    
    // Calculate years
    while (true) {
      const nextYearDate = new Date(tempDate);
      nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
      
      if (nextYearDate <= endDate) {
        years++;
        tempDate = nextYearDate;
      } else {
        break;
      }
    }
    
    // Calculate months
    while (true) {
      const nextMonthDate = new Date(tempDate);
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      
      if (nextMonthDate <= endDate) {
        months++;
        tempDate = nextMonthDate;
      } else {
        break;
      }
    }
    
    // Calculate remaining days
    days = Math.floor((endDate - tempDate) / (1000 * 60 * 60 * 24));
    
    return {
      years,
      months,
      days,
      totalYears,
      totalMonths,
      totalWeeks,
      totalDays,
      totalHours,
      totalMinutes,
      totalSeconds
    };
  }

  calculateTotalMonths(startDate, endDate) {
    const years = endDate.getFullYear() - startDate.getFullYear();
    const months = endDate.getMonth() - startDate.getMonth();
    
    return years * 12 + months + (endDate.getDate() >= startDate.getDate() ? 0 : -1);
  }

  calculateNextBirthday(birthDate, currentDate) {
    const birthMonth = birthDate.getMonth();
    const birthDay = birthDate.getDate();
    
    let nextBirthday = new Date(currentDate.getFullYear(), birthMonth, birthDay);
    
    if (nextBirthday < currentDate) {
      nextBirthday.setFullYear(currentDate.getFullYear() + 1);
    }
    
    const daysUntil = Math.ceil((nextBirthday - currentDate) / (1000 * 60 * 60 * 24));
    const dayOfWeek = nextBirthday.toLocaleDateString('en-US', { weekday: 'long' });
    
    return {
      date: nextBirthday,
      daysUntil,
      dayOfWeek
    };
  }

  getAgeCategory(age) {
    for (const [key, category] of Object.entries(this.ageCategories)) {
      if (age >= category.min && age < category.max) {
        return { name: category.label, color: category.color, key };
      }
    }
    return { name: 'Centenarian', color: '#795548', key: 'centenarian' };
  }

  validateInputs(formData) {
    const errors = [];
    
    if (!formData.birthDate) {
      errors.push('Birth date is required');
    }
    
    if (formData.birthDate && formData.calculationDate) {
      const birthDate = this.parseDate(formData.birthDate, formData.birthTime);
      const calculationDate = this.parseDate(formData.calculationDate, formData.calculationTime);
      
      if (birthDate && calculationDate && birthDate > calculationDate) {
        errors.push('Birth date cannot be in the future');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

const AgeCalculator = () => {
  const [formData, setFormData] = useState({
    birthDate: '',
    birthTime: '',
    calculationDate: '',
    calculationTime: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [calculator] = useState(new AgeCalculatorLogic());

  const toolData = {
    name: 'Age Calculator',
    description: 'Calculate your exact age in years, months, days, hours, minutes, and seconds. Get detailed age breakdowns, next birthday information, and age category classification.',
    icon: 'fas fa-calendar-alt',
    category: 'Knowledge',
    breadcrumb: ['Knowledge', 'Calculators', 'Age Calculator']
  };

  const categories = [
    { name: 'Knowledge', url: '/knowledge', icon: 'fas fa-graduation-cap' },
    { name: 'Math', url: '/math', icon: 'fas fa-calculator' },
    { name: 'Finance', url: '/finance', icon: 'fas fa-dollar-sign' },
    { name: 'Health', url: '/health', icon: 'fas fa-heartbeat' },
    { name: 'Science', url: '/science', icon: 'fas fa-flask' }
  ];

  const relatedTools = [
    { name: 'GPA Calculator', url: '/knowledge/calculators/gpa-calculator', icon: 'fas fa-graduation-cap' },
    { name: 'WPM Calculator', url: '/knowledge/calculators/word-per-minute', icon: 'fas fa-keyboard' },
    { name: 'Love Calculator', url: '/knowledge/calculators/love-calculator', icon: 'fas fa-heart' },
    { name: 'MBTI Personality', url: '/knowledge/calculators/mbti-calculator', icon: 'fas fa-user-friends' },
    { name: 'Carbon Footprint', url: '/knowledge/calculators/carbon-footprint-calculator', icon: 'fas fa-leaf' }
  ];

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-age', title: 'What is Age Calculation?' },
    { id: 'age-categories', title: 'Age Categories' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'calculation-method', title: 'Calculation Method' },
    { id: 'examples', title: 'Examples' },
    { id: 'significance', title: 'Significance' },
    { id: 'functionality', title: 'Functionality' },
    { id: 'applications', title: 'Applications' },
    { id: 'faqs', title: 'FAQs' }
  ];

  const faqData = [
    {
      question: "How accurate is the age calculation?",
      answer: "The age calculator provides precise calculations down to the second. It accounts for leap years, different month lengths, and time zones to give you the most accurate age possible."
    },
    {
      question: "Can I calculate age for future dates?",
      answer: "No, the birth date cannot be in the future. However, you can calculate what your age will be on any future date by setting the calculation date to that future date."
    },
    {
      question: "What if I don't know my exact birth time?",
      answer: "You can leave the birth time field empty, and the calculator will use midnight (00:00) as the default time. This will still give you an accurate age calculation."
    },
    {
      question: "How does the calculator handle leap years?",
      answer: "The calculator automatically accounts for leap years when calculating age. It correctly handles February 29th births and leap year transitions."
    },
    {
      question: "What age categories are used?",
      answer: "The calculator uses standard age categories: Infant (0-1), Toddler (1-3), Preschooler (3-5), Child (5-12), Teenager (12-18), Young Adult (18-30), Adult (30-50), Middle Age (50-65), and Senior (65+)."
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const calculateAge = () => {
    setError('');
    
    const validation = calculator.validateInputs(formData);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    try {
      const result = calculator.calculate(formData);
      setResult(result);
    } catch (err) {
      setError(err.message);
    }
  };

  const resetCalculator = () => {
    setFormData({
      birthDate: '',
      birthTime: '',
      calculationDate: '',
      calculationTime: ''
    });
    setResult(null);
    setError('');
  };

  useEffect(() => {
    // Set default calculation date to today
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const formattedTime = today.toTimeString().slice(0, 5);
    
    setFormData(prev => ({
      ...prev,
      calculationDate: formattedDate,
      calculationTime: formattedTime
    }));
  }, []);

  useEffect(() => {
    if (result) {
      const resultElement = document.getElementById('age-result-section');
      if (resultElement) {
        resultElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [result]);

  return (
    <ToolPageLayout 
      toolData={toolData} 
      tableOfContents={tableOfContents}
      categories={categories}
      relatedTools={relatedTools}
    >
      <CalculatorSection 
        title="Age Calculator"
        onCalculate={calculateAge}
        calculateButtonText="Calculate Age"
        error={error}
        result={null}
      >
        <div className="age-calculator-form">
          <div className="age-section-title">Birth Information</div>
          <div className="age-input-row">
            <div className="age-input-group">
              <label htmlFor="age-birth-date" className="age-input-label">
                Birth Date:
              </label>
              <input
                type="date"
                id="age-birth-date"
                className="age-input-field"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                required
              />
            </div>
            <div className="age-input-group">
              <label htmlFor="age-birth-time" className="age-input-label">
                Birth Time (Optional):
              </label>
              <input
                type="time"
                id="age-birth-time"
                className="age-input-field"
                value={formData.birthTime}
                onChange={(e) => handleInputChange('birthTime', e.target.value)}
              />
            </div>
          </div>

          <div className="age-section-title">Calculation Date</div>
          <div className="age-input-row">
            <div className="age-input-group">
              <label htmlFor="age-calculation-date" className="age-input-label">
                Calculate Age On:
              </label>
              <input
                type="date"
                id="age-calculation-date"
                className="age-input-field"
                value={formData.calculationDate}
                onChange={(e) => handleInputChange('calculationDate', e.target.value)}
                required
              />
            </div>
            <div className="age-input-group">
              <label htmlFor="age-calculation-time" className="age-input-label">
                Time (Optional):
              </label>
              <input
                type="time"
                id="age-calculation-time"
                className="age-input-field"
                value={formData.calculationTime}
                onChange={(e) => handleInputChange('calculationTime', e.target.value)}
              />
            </div>
          </div>

          <div className="age-form-actions">
            <button type="button" className="age-reset-button" onClick={resetCalculator}>
              Reset Calculator
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div id="age-result-section" className="age-result-section">
            <div className="age-result-header">
              <h3>Age Calculation Results</h3>
            </div>
            <div className="age-result-content">
              <div className="age-result-main">
                <div className="age-result-value" style={{ color: result.ageCategory.color }}>
                  {result.years} years, {result.months} months, {result.days} days
                </div>
                <div className="age-result-category" style={{ color: result.ageCategory.color }}>
                  {result.ageCategory.name}
                </div>
              </div>
              
              <div className="age-result-details">
                <div className="age-result-item">
                  <span className="age-result-label">Total Years:</span>
                  <span className="age-result-value-small">{result.totalYears}</span>
                </div>
                <div className="age-result-item">
                  <span className="age-result-label">Total Months:</span>
                  <span className="age-result-value-small">{result.totalMonths}</span>
                </div>
                <div className="age-result-item">
                  <span className="age-result-label">Total Weeks:</span>
                  <span className="age-result-value-small">{result.totalWeeks.toLocaleString()}</span>
                </div>
                <div className="age-result-item">
                  <span className="age-result-label">Total Days:</span>
                  <span className="age-result-value-small">{result.totalDays.toLocaleString()}</span>
                </div>
                <div className="age-result-item">
                  <span className="age-result-label">Total Hours:</span>
                  <span className="age-result-value-small">{result.totalHours.toLocaleString()}</span>
                </div>
                <div className="age-result-item">
                  <span className="age-result-label">Total Minutes:</span>
                  <span className="age-result-value-small">{result.totalMinutes.toLocaleString()}</span>
                </div>
              </div>

              <div className="age-next-birthday">
                <h4>Next Birthday</h4>
                <div className="age-birthday-info">
                  <div className="age-birthday-item">
                    <span className="age-birthday-label">Days Until:</span>
                    <span className="age-birthday-value">{result.nextBirthday.daysUntil}</span>
                  </div>
                  <div className="age-birthday-item">
                    <span className="age-birthday-label">Day of Week:</span>
                    <span className="age-birthday-value">{result.nextBirthday.dayOfWeek}</span>
                  </div>
                  <div className="age-birthday-item">
                    <span className="age-birthday-label">Date:</span>
                    <span className="age-birthday-value">
                      {result.nextBirthday.date.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CalculatorSection>

      {/* TOC and Feedback Section */}
      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName={toolData.name} />
      </div>

      {/* Content Sections */}
      <ContentSection id="introduction" title="Introduction">
        <p>
          The Age Calculator is a comprehensive tool that calculates your exact age in multiple formats 
          including years, months, days, hours, minutes, and seconds. This precision calculator helps you 
          understand your age in different contexts and provides detailed breakdowns for various purposes.
        </p>
        <p>
          Our calculator supports both date and time inputs, accounts for leap years, and provides 
          age category classifications along with next birthday information. Perfect for personal use, 
          legal documentation, or educational purposes.
        </p>
      </ContentSection>

      <ContentSection id="what-is-age" title="What is Age Calculation?">
        <p>
          Age calculation is the process of determining the time elapsed since a person's birth date. 
          It involves precise mathematical calculations that account for various factors including 
          leap years, different month lengths, and time zones.
        </p>
        
        <div className="age-definition-grid">
          <div className="age-definition-item">
            <h4><i className="fas fa-calendar-day"></i> Chronological Age</h4>
            <p>The actual time that has passed since birth, measured in years, months, and days.</p>
          </div>
          <div className="age-definition-item">
            <h4><i className="fas fa-clock"></i> Precise Age</h4>
            <p>Age calculated down to hours, minutes, and seconds for maximum accuracy.</p>
          </div>
        </div>

        <h3>Age Calculation Components</h3>
        <ul>
          <li><strong>Years:</strong> Complete calendar years since birth</li>
          <li><strong>Months:</strong> Additional months beyond complete years</li>
          <li><strong>Days:</strong> Remaining days beyond complete months</li>
          <li><strong>Hours:</strong> Total hours lived (approximate)</li>
          <li><strong>Minutes:</strong> Total minutes lived (approximate)</li>
          <li><strong>Seconds:</strong> Total seconds lived (approximate)</li>
        </ul>
      </ContentSection>

      <ContentSection id="age-categories" title="Age Categories">
        <p>Age categories help classify individuals into different life stages based on their chronological age:</p>
        
        <div className="age-categories-grid">
          <div className="age-category-item" style={{ borderLeftColor: '#e91e63' }}>
            <h4><i className="fas fa-baby"></i> Infant (0-1 years)</h4>
            <p>Newborn to 12 months old</p>
          </div>
          <div className="age-category-item" style={{ borderLeftColor: '#9c27b0' }}>
            <h4><i className="fas fa-child"></i> Toddler (1-3 years)</h4>
            <p>Learning to walk and talk</p>
          </div>
          <div className="age-category-item" style={{ borderLeftColor: '#673ab7' }}>
            <h4><i className="fas fa-puzzle-piece"></i> Preschooler (3-5 years)</h4>
            <p>Pre-school age, developing social skills</p>
          </div>
          <div className="age-category-item" style={{ borderLeftColor: '#3f51b5' }}>
            <h4><i className="fas fa-graduation-cap"></i> Child (5-12 years)</h4>
            <p>Elementary school age</p>
          </div>
          <div className="age-category-item" style={{ borderLeftColor: '#2196f3' }}>
            <h4><i className="fas fa-music"></i> Teenager (12-18 years)</h4>
            <p>Adolescent years, high school age</p>
          </div>
          <div className="age-category-item" style={{ borderLeftColor: '#00bcd4' }}>
            <h4><i className="fas fa-user-graduate"></i> Young Adult (18-30 years)</h4>
            <p>College and early career years</p>
          </div>
          <div className="age-category-item" style={{ borderLeftColor: '#4caf50' }}>
            <h4><i className="fas fa-briefcase"></i> Adult (30-50 years)</h4>
            <p>Established career and family years</p>
          </div>
          <div className="age-category-item" style={{ borderLeftColor: '#ff9800' }}>
            <h4><i className="fas fa-home"></i> Middle Age (50-65 years)</h4>
            <p>Pre-retirement years</p>
          </div>
          <div className="age-category-item" style={{ borderLeftColor: '#f44336' }}>
            <h4><i className="fas fa-heart"></i> Senior (65+ years)</h4>
            <p>Retirement and golden years</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Calculator">
        <p>Follow these steps to calculate your exact age:</p>
        
        <h3>Step 1: Enter Birth Information</h3>
        <ul className="usage-steps">
          <li><strong>Birth Date:</strong> Select your birth date using the date picker</li>
          <li><strong>Birth Time:</strong> Optionally enter your birth time for precise calculation</li>
        </ul>

        <h3>Step 2: Set Calculation Date</h3>
        <ul className="usage-steps">
          <li><strong>Calculate Age On:</strong> Choose the date to calculate your age (defaults to today)</li>
          <li><strong>Time:</strong> Optionally specify the time for precise calculation</li>
        </ul>

        <h3>Step 3: Calculate and Review</h3>
        <ul className="usage-steps">
          <li><strong>Calculate:</strong> Click the "Calculate Age" button</li>
          <li><strong>Review:</strong> Check your age breakdown, category, and next birthday information</li>
        </ul>

        <h3>Step 4: Reset (Optional)</h3>
        <ul className="usage-steps">
          <li><strong>Reset:</strong> Click "Reset Calculator" to clear all inputs and start over</li>
        </ul>
      </ContentSection>

      <ContentSection id="calculation-method" title="Calculation Method">
        <p>
          The age calculation uses precise date and time arithmetic to determine the exact time elapsed 
          between birth and the calculation date. The method accounts for leap years, varying month lengths, 
          and time differences.
        </p>
        
        <div className="calculation-method-section">
          <h3>Calculation Process</h3>
          <ol>
            <li><strong>Parse Dates:</strong> Convert input dates and times to JavaScript Date objects</li>
            <li><strong>Validate Input:</strong> Ensure birth date is not in the future</li>
            <li><strong>Calculate Totals:</strong> Determine total milliseconds, seconds, minutes, hours, days, weeks, months, and years</li>
            <li><strong>Break Down Age:</strong> Calculate years, months, and days separately</li>
            <li><strong>Determine Category:</strong> Classify age into appropriate life stage category</li>
            <li><strong>Calculate Next Birthday:</strong> Determine when the next birthday will occur</li>
          </ol>

          <h3>Leap Year Handling</h3>
          <p>The calculator automatically accounts for leap years:</p>
          <ul>
            <li>Leap years occur every 4 years (except century years not divisible by 400)</li>
            <li>February 29th births are handled correctly</li>
            <li>Age calculations remain accurate across leap year transitions</li>
          </ul>

          <h3>Time Zone Considerations</h3>
          <p>For maximum accuracy:</p>
          <ul>
            <li>Use local time for both birth and calculation dates</li>
            <li>Consider time zone differences for international calculations</li>
            <li>Daylight saving time changes are handled automatically</li>
          </ul>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: Basic Age Calculation</h3>
          <div className="age-example">
            <p><strong>Birth Date:</strong> January 15, 1990</p>
            <p><strong>Calculation Date:</strong> January 15, 2024</p>
            <p><strong>Result:</strong></p>
            <ul>
              <li>Age: 34 years, 0 months, 0 days</li>
              <li>Category: Adult</li>
              <li>Total Days: 12,419 days</li>
              <li>Next Birthday: January 15, 2025 (365 days)</li>
            </ul>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: Precise Time Calculation</h3>
          <div className="age-example">
            <p><strong>Birth:</strong> March 10, 2000 at 2:30 PM</p>
            <p><strong>Calculation:</strong> March 10, 2024 at 10:15 AM</p>
            <p><strong>Result:</strong></p>
            <ul>
              <li>Age: 24 years, 0 months, 0 days</li>
              <li>Category: Young Adult</li>
              <li>Total Hours: 210,384 hours</li>
              <li>Next Birthday: March 10, 2025 (365 days)</li>
            </ul>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 3: Leap Year Birth</h3>
          <div className="age-example">
            <p><strong>Birth Date:</strong> February 29, 2000 (Leap Year)</p>
            <p><strong>Calculation Date:</strong> February 28, 2024</p>
            <p><strong>Result:</strong></p>
            <ul>
              <li>Age: 23 years, 11 months, 30 days</li>
              <li>Category: Young Adult</li>
              <li>Next Birthday: February 28, 2025 (non-leap year)</li>
            </ul>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding your exact age is important for various reasons:</p>
        <ul>
          <li><strong>Legal Purposes:</strong> Age verification for legal documents and contracts</li>
          <li><strong>Medical Records:</strong> Accurate age for medical assessments and treatments</li>
          <li><strong>Educational Planning:</strong> Age-appropriate educational programs and milestones</li>
          <li><strong>Insurance:</strong> Age-based insurance calculations and premiums</li>
          <li><strong>Retirement Planning:</strong> Understanding time until retirement eligibility</li>
          <li><strong>Personal Milestones:</strong> Tracking life achievements and goals</li>
          <li><strong>Genealogical Research:</strong> Family history and ancestry documentation</li>
          <li><strong>Statistical Analysis:</strong> Demographic studies and population research</li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our Age Calculator provides comprehensive functionality:</p>
        <ul>
          <li><strong>Precise Calculations:</strong> Age calculated down to seconds</li>
          <li><strong>Multiple Formats:</strong> Years, months, days, hours, minutes, seconds</li>
          <li><strong>Date and Time Input:</strong> Support for both date and time specifications</li>
          <li><strong>Age Categories:</strong> Automatic classification into life stage categories</li>
          <li><strong>Next Birthday:</strong> Calculation of days until next birthday</li>
          <li><strong>Leap Year Support:</strong> Accurate handling of leap years and February 29th</li>
          <li><strong>Input Validation:</strong> Comprehensive error checking and validation</li>
          <li><strong>Responsive Design:</strong> Works on all devices and screen sizes</li>
          <li><strong>Educational Content:</strong> Detailed information about age calculation methods</li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-id-card"></i> Legal Documentation</h4>
            <p>Age verification for legal documents</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-heartbeat"></i> Medical Records</h4>
            <p>Accurate age for medical assessments</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-graduation-cap"></i> Educational Planning</h4>
            <p>Age-appropriate program enrollment</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-shield-alt"></i> Insurance</h4>
            <p>Age-based insurance calculations</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-piggy-bank"></i> Retirement Planning</h4>
            <p>Time until retirement eligibility</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-birthday-cake"></i> Birthday Planning</h4>
            <p>Countdown to next birthday</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-tree"></i> Genealogy</h4>
            <p>Family history documentation</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-bar"></i> Demographics</h4>
            <p>Population and statistical studies</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection faqs={faqData} />
    </ToolPageLayout>
  )
}

export default AgeCalculator
