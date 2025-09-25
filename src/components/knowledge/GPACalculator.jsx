import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import '../../assets/css/knowledge/gpa-calculator.css'

// GPA Calculator Logic Class
class GPACalculatorLogic {
  constructor() {
    this.gradePoints = {
      'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0
    };
    this.gradeClassifications = {
      'Excellent': { min: 3.7, max: 4.0, color: '#2ecc71' },
      'Very Good': { min: 3.3, max: 3.69, color: '#27ae60' },
      'Good': { min: 3.0, max: 3.29, color: '#f1c40f' },
      'Satisfactory': { min: 2.7, max: 2.99, color: '#e67e22' },
      'Below Average': { min: 2.0, max: 2.69, color: '#e74c3c' },
      'Poor': { min: 1.0, max: 1.99, color: '#c0392b' },
      'Failing': { min: 0.0, max: 0.99, color: '#8b5cf6' }
    };
  }

  calculateGPA(courses) {
    let totalPoints = 0;
    let totalCredits = 0;
    let details = [];

    courses.forEach((course, index) => {
      if (course.grade && course.credits && course.credits > 0) {
        const points = this.gradePoints[course.grade] * course.credits;
        totalPoints += points;
        totalCredits += course.credits;
        details.push({
          course: course.name || `Course ${index + 1}`,
          grade: course.grade,
          credits: course.credits,
          points: points
        });
      }
    });

    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    const classification = this.getGradeClassification(gpa);

    return {
      gpa: Math.round(gpa * 100) / 100,
      totalPoints: Math.round(totalPoints * 100) / 100,
      totalCredits,
      details,
      classification
    };
  }

  calculateCGPA(semesters) {
    let totalPoints = 0;
    let totalCredits = 0;
    let details = [];

    semesters.forEach((semester, index) => {
      if (semester.gpa && semester.credits && semester.credits > 0) {
        const points = semester.gpa * semester.credits;
        totalPoints += points;
        totalCredits += semester.credits;
        details.push({
          semester: semester.name || `Semester ${index + 1}`,
          gpa: semester.gpa,
          credits: semester.credits,
          points: points
        });
      }
    });

    const cgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    const classification = this.getGradeClassification(cgpa);

    return {
      cgpa: Math.round(cgpa * 100) / 100,
      totalPoints: Math.round(totalPoints * 100) / 100,
      totalCredits,
      details,
      classification
    };
  }

  getGradeClassification(gpa) {
    for (const [name, range] of Object.entries(this.gradeClassifications)) {
      if (gpa >= range.min && gpa <= range.max) {
        return { name, color: range.color };
      }
    }
    return { name: 'Failing', color: '#8b5cf6' };
  }
}

const GPACalculator = () => {
  const [formData, setFormData] = useState({
    calculatorType: 'gpa',
    courses: [{ name: '', grade: '', credits: '' }],
    semesters: [{ name: '', gpa: '', credits: '' }]
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [calculator] = useState(new GPACalculatorLogic());

  const toolData = {
    name: 'GPA & CGPA Calculator',
    description: 'Calculate your Grade Point Average and Cumulative Grade Point Average with precision. Track your academic performance across semesters and courses.',
    icon: 'fas fa-graduation-cap',
    category: 'Knowledge',
    breadcrumb: ['Knowledge', 'Calculators', 'GPA & CGPA Calculator']
  };

  const categories = [
    { name: 'Knowledge', url: '/knowledge', icon: 'fas fa-graduation-cap' },
    { name: 'Math', url: '/math', icon: 'fas fa-calculator' },
    { name: 'Finance', url: '/finance', icon: 'fas fa-dollar-sign' },
    { name: 'Health', url: '/health', icon: 'fas fa-heartbeat' },
    { name: 'Science', url: '/science', icon: 'fas fa-flask' }
  ];

  const relatedTools = [
    { name: 'Age Calculator', url: '/knowledge/calculators/age-calculator', icon: 'fas fa-calendar-alt' },
    { name: 'WPM Calculator', url: '/knowledge/calculators/word-per-minute', icon: 'fas fa-keyboard' },
    { name: 'Love Calculator', url: '/knowledge/calculators/love-calculator', icon: 'fas fa-heart' },
    { name: 'MBTI Personality', url: '/knowledge/calculators/mbti-calculator', icon: 'fas fa-user-friends' },
    { name: 'Carbon Footprint', url: '/knowledge/calculators/carbon-footprint-calculator', icon: 'fas fa-leaf' }
  ];

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-gpa', title: 'What is GPA/CGPA?' },
    { id: 'grade-system', title: 'Grade Point System' },
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
      question: "What's the difference between GPA and CGPA?",
      answer: "GPA (Grade Point Average) is calculated for a single semester or term, while CGPA (Cumulative Grade Point Average) is the average of all semesters combined."
    },
    {
      question: "How do I convert letter grades to grade points?",
      answer: "Most institutions use a 4.0 scale: A=4.0, A-=3.7, B+=3.3, B=3.0, B-=2.7, C+=2.3, C=2.0, C-=1.7, D+=1.3, D=1.0, F=0.0. Check with your institution for their specific scale."
    },
    {
      question: "What if my institution uses a different grading scale?",
      answer: "You can still use this calculator by converting your grades to the 4.0 scale. For example, if your institution uses A=90-100, B=80-89, etc., you can map these to the corresponding grade points."
    },
    {
      question: "How many decimal places should I use?",
      answer: "Most institutions report GPA to 2-3 decimal places. This calculator provides results to 2 decimal places, which is standard practice."
    },
    {
      question: "Can I calculate GPA for incomplete semesters?",
      answer: "Yes, you can calculate GPA for any number of courses, even if you haven't completed all courses for a semester. Just enter the courses you have grades for."
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCourseChange = (index, field, value) => {
    const newCourses = [...formData.courses];
    newCourses[index] = { ...newCourses[index], [field]: value };
    setFormData(prev => ({ ...prev, courses: newCourses }));
  };

  const handleSemesterChange = (index, field, value) => {
    const newSemesters = [...formData.semesters];
    newSemesters[index] = { ...newSemesters[index], [field]: value };
    setFormData(prev => ({ ...prev, semesters: newSemesters }));
  };

  const addCourse = () => {
    setFormData(prev => ({
      ...prev,
      courses: [...prev.courses, { name: '', grade: '', credits: '' }]
    }));
  };

  const removeCourse = (index) => {
    if (formData.courses.length > 1) {
      const newCourses = formData.courses.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, courses: newCourses }));
    }
  };

  const addSemester = () => {
    setFormData(prev => ({
      ...prev,
      semesters: [...prev.semesters, { name: '', gpa: '', credits: '' }]
    }));
  };

  const removeSemester = (index) => {
    if (formData.semesters.length > 1) {
      const newSemesters = formData.semesters.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, semesters: newSemesters }));
    }
  };

  const resetCalculator = () => {
    setFormData({
      calculationType: 'GPA',
      courses: [{ name: '', grade: '', credits: '' }],
      semesters: [{ name: '', gpa: '', credits: '' }]
    });
    setResult(null);
    setError('');
  };

  const calculateGPA = () => {
    setError('');
    
    const validCourses = formData.courses.filter(course => 
      course.grade && course.credits && parseFloat(course.credits) > 0
    );

    if (validCourses.length === 0) {
      setError('Please enter at least one course with a valid grade and credit hours.');
      return;
    }

    const result = calculator.calculateGPA(validCourses);
    setResult({ type: 'GPA', ...result });
  };

  const calculateCGPA = () => {
    setError('');
    
    const validSemesters = formData.semesters.filter(semester => 
      semester.gpa && semester.credits && parseFloat(semester.credits) > 0 && 
      parseFloat(semester.gpa) >= 0 && parseFloat(semester.gpa) <= 4
    );

    if (validSemesters.length === 0) {
      setError('Please enter at least one semester with a valid GPA (0-4) and credit hours.');
      return;
    }

    const result = calculator.calculateCGPA(validSemesters);
    setResult({ type: 'CGPA', ...result });
  };

  const handleCalculate = () => {
    if (formData.calculatorType === 'gpa') {
      calculateGPA();
    } else {
      calculateCGPA();
    }
  };

  useEffect(() => {
    if (result) {
      const resultElement = document.getElementById('gpa-result-section');
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
        title="GPA & CGPA Calculator"
        onCalculate={handleCalculate}
        calculateButtonText={formData.calculatorType === 'gpa' ? "Calculate GPA" : "Calculate CGPA"}
        error={error}
        result={null}
      >
        <div className="gpa-calculator-form">
          {/* Calculator Type Selection */}
          <div className="gpa-section-title">Calculator Type</div>
          <div className="gpa-input-row">
            <div className="gpa-input-group">
              <label className="gpa-input-label">Select Calculator:</label>
              <select
                className="gpa-select-field"
                value={formData.calculatorType}
                onChange={(e) => handleInputChange('calculatorType', e.target.value)}
              >
                <option value="gpa">GPA Calculator (Single Semester)</option>
                <option value="cgpa">CGPA Calculator (Multiple Semesters)</option>
              </select>
            </div>
          </div>

          {/* GPA Calculator */}
          {formData.calculatorType === 'gpa' && (
            <>
              <div className="gpa-section-title">Course Information</div>
              {formData.courses.map((course, index) => (
                <div key={index} className="gpa-input-row">
                  <div className="gpa-input-group">
                    <label className="gpa-input-label">Course Name:</label>
                    <input
                      type="text"
                      className="gpa-input-field"
                      value={course.name}
                      onChange={(e) => handleCourseChange(index, 'name', e.target.value)}
                      placeholder="e.g., Mathematics 101"
                    />
                  </div>
                  <div className="gpa-input-group">
                    <label className="gpa-input-label">Grade:</label>
                    <select
                      className="gpa-select-field"
                      value={course.grade}
                      onChange={(e) => handleCourseChange(index, 'grade', e.target.value)}
                    >
                      <option value="">Select Grade</option>
                      <option value="A">A (4.0)</option>
                      <option value="A-">A- (3.7)</option>
                      <option value="B+">B+ (3.3)</option>
                      <option value="B">B (3.0)</option>
                      <option value="B-">B- (2.7)</option>
                      <option value="C+">C+ (2.3)</option>
                      <option value="C">C (2.0)</option>
                      <option value="C-">C- (1.7)</option>
                      <option value="D+">D+ (1.3)</option>
                      <option value="D">D (1.0)</option>
                      <option value="F">F (0.0)</option>
                    </select>
                  </div>
                  <div className="gpa-input-group">
                    <label className="gpa-input-label">Credit Hours:</label>
                    <input
                      type="number"
                      className="gpa-input-field"
                      value={course.credits}
                      onChange={(e) => handleCourseChange(index, 'credits', e.target.value)}
                      placeholder="e.g., 3"
                      min="1"
                      max="6"
                    />
                  </div>
                  {formData.courses.length > 1 && (
                    <button
                      type="button"
                      className="gpa-remove-button"
                      onClick={() => removeCourse(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="gpa-add-button" onClick={addCourse}>
                + Add Another Course
              </button>
            </>
          )}

          {/* CGPA Calculator */}
          {formData.calculatorType === 'cgpa' && (
            <>
              <div className="gpa-section-title">Semester Information</div>
              {formData.semesters.map((semester, index) => (
                <div key={index} className="gpa-input-row">
                  <div className="gpa-input-group">
                    <label className="gpa-input-label">Semester Name:</label>
                    <input
                      type="text"
                      className="gpa-input-field"
                      value={semester.name}
                      onChange={(e) => handleSemesterChange(index, 'name', e.target.value)}
                      placeholder="e.g., Fall 2023"
                    />
                  </div>
                  <div className="gpa-input-group">
                    <label className="gpa-input-label">GPA:</label>
                    <input
                      type="number"
                      className="gpa-input-field"
                      value={semester.gpa}
                      onChange={(e) => handleSemesterChange(index, 'gpa', e.target.value)}
                      placeholder="e.g., 3.5"
                      step="0.01"
                      min="0"
                      max="4"
                    />
                  </div>
                  <div className="gpa-input-group">
                    <label className="gpa-input-label">Total Credits:</label>
                    <input
                      type="number"
                      className="gpa-input-field"
                      value={semester.credits}
                      onChange={(e) => handleSemesterChange(index, 'credits', e.target.value)}
                      placeholder="e.g., 15"
                      min="1"
                    />
                  </div>
                  {formData.semesters.length > 1 && (
                    <button
                      type="button"
                      className="gpa-remove-button"
                      onClick={() => removeSemester(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="gpa-add-button" onClick={addSemester}>
                + Add Another Semester
              </button>
            </>
          )}
        </div>

        {/* Form Actions */}
        <div className="gpa-form-actions">
          <button type="button" className="gpa-btn-reset" onClick={resetCalculator}>
            <i className="fas fa-redo"></i>
            Reset
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div id="gpa-result-section" className="gpa-result-section">
            <div className="gpa-result-header">
              <h3>Calculation Results</h3>
            </div>
            <div className="gpa-result-content">
              <div className="gpa-result-main">
                <div className="gpa-result-value" style={{ color: result.classification.color }}>
                  {result.type}: {result.gpa || result.cgpa}
                </div>
                <div className="gpa-result-classification" style={{ color: result.classification.color }}>
                  {result.classification.name}
                </div>
              </div>
              <div className="gpa-result-details">
                <div className="gpa-result-item">
                  <span className="gpa-result-label">Total Points:</span>
                  <span className="gpa-result-value-small">{result.totalPoints}</span>
                </div>
                <div className="gpa-result-item">
                  <span className="gpa-result-label">Total Credits:</span>
                  <span className="gpa-result-value-small">{result.totalCredits}</span>
                </div>
              </div>
              <div className="gpa-calculation-breakdown">
                <h4>Calculation Breakdown:</h4>
                {result.details.map((detail, index) => (
                  <div key={index} className="gpa-breakdown-item">
                    <span className="gpa-breakdown-name">{detail.course || detail.semester}:</span>
                    <span className="gpa-breakdown-calculation">
                      {result.type === 'GPA' 
                        ? `${detail.grade} × ${detail.credits} credits = ${detail.points.toFixed(2)} points`
                        : `${detail.gpa} × ${detail.credits} credits = ${detail.points.toFixed(2)} points`
                      }
                    </span>
                  </div>
                ))}
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
          The GPA & CGPA Calculator is a comprehensive academic performance assessment tool that helps you 
          calculate your Grade Point Average and Cumulative Grade Point Average with precision. This tool 
          enables students to track their academic progress, understand their performance levels, and 
          plan their academic journey effectively.
        </p>
        <p>
          Our calculator supports both single-semester GPA calculations and multi-semester CGPA calculations, 
          providing detailed breakdowns, grade classifications, and comprehensive educational content about 
          academic grading systems and their significance.
        </p>
      </ContentSection>

      <ContentSection id="what-is-gpa" title="What is GPA/CGPA?">
        <p>
          GPA (Grade Point Average) and CGPA (Cumulative Grade Point Average) are standardized numerical 
          representations of academic performance used by educational institutions worldwide.
        </p>
        
        <div className="gpa-definition-grid">
          <div className="gpa-definition-item">
            <h4><i className="fas fa-calculator"></i> GPA (Grade Point Average)</h4>
            <p>Calculated for a single semester or academic term, representing your average performance across all courses in that period.</p>
          </div>
          <div className="gpa-definition-item">
            <h4><i className="fas fa-chart-line"></i> CGPA (Cumulative Grade Point Average)</h4>
            <p>Calculated across multiple semesters, representing your overall academic performance throughout your academic career.</p>
          </div>
        </div>

        <h3>Grade Classifications</h3>
        <ul>
          <li><strong>Excellent (3.7-4.0):</strong> Outstanding academic performance</li>
          <li><strong>Very Good (3.3-3.69):</strong> Above average performance</li>
          <li><strong>Good (3.0-3.29):</strong> Satisfactory performance</li>
          <li><strong>Satisfactory (2.7-2.99):</strong> Acceptable performance</li>
          <li><strong>Below Average (2.0-2.69):</strong> Needs improvement</li>
          <li><strong>Poor (1.0-1.99):</strong> Unsatisfactory performance</li>
          <li><strong>Failing (0.0-0.99):</strong> Academic failure</li>
        </ul>
      </ContentSection>

      <ContentSection id="grade-system" title="Grade Point System">
        <p>Most institutions use a 4.0 scale for grade points. Here's the standard conversion system:</p>
        
        <div className="gpa-grade-table">
          <table>
            <thead>
              <tr>
                <th>Letter Grade</th>
                <th>Grade Points</th>
                <th>Percentage Range</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>A</td><td>4.0</td><td>90-100%</td><td>Excellent</td></tr>
              <tr><td>A-</td><td>3.7</td><td>87-89%</td><td>Very Good</td></tr>
              <tr><td>B+</td><td>3.3</td><td>83-86%</td><td>Good Plus</td></tr>
              <tr><td>B</td><td>3.0</td><td>80-82%</td><td>Good</td></tr>
              <tr><td>B-</td><td>2.7</td><td>77-79%</td><td>Good Minus</td></tr>
              <tr><td>C+</td><td>2.3</td><td>73-76%</td><td>Satisfactory Plus</td></tr>
              <tr><td>C</td><td>2.0</td><td>70-72%</td><td>Satisfactory</td></tr>
              <tr><td>C-</td><td>1.7</td><td>67-69%</td><td>Satisfactory Minus</td></tr>
              <tr><td>D+</td><td>1.3</td><td>63-66%</td><td>Passing Plus</td></tr>
              <tr><td>D</td><td>1.0</td><td>60-62%</td><td>Passing</td></tr>
              <tr><td>F</td><td>0.0</td><td>Below 60%</td><td>Failing</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Alternative Grading Systems</h3>
        <p>Some institutions use different scales:</p>
        <ul>
          <li><strong>5.0 Scale:</strong> A=5.0, B=4.0, C=3.0, D=2.0, F=0.0</li>
          <li><strong>100 Point Scale:</strong> Direct percentage to GPA conversion</li>
          <li><strong>Letter Only:</strong> Some institutions use letter grades without numerical equivalents</li>
        </ul>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Calculator">
        <p>Follow these steps to calculate your GPA or CGPA:</p>
        
        <h3>Step 1: Select Calculator Type</h3>
        <ul className="usage-steps">
          <li><strong>GPA Calculator:</strong> For single semester calculations</li>
          <li><strong>CGPA Calculator:</strong> For multiple semester calculations</li>
        </ul>

        <h3>Step 2: Enter Course Information (GPA)</h3>
        <ul className="usage-steps">
          <li><strong>Course Name:</strong> Enter the course title (e.g., Mathematics 101)</li>
          <li><strong>Grade:</strong> Select your letter grade from the dropdown</li>
          <li><strong>Credit Hours:</strong> Enter the number of credit hours (1-6)</li>
          <li><strong>Add Courses:</strong> Click "+ Add Another Course" for additional courses</li>
        </ul>

        <h3>Step 3: Enter Semester Information (CGPA)</h3>
        <ul className="usage-steps">
          <li><strong>Semester Name:</strong> Enter semester identifier (e.g., Fall 2023)</li>
          <li><strong>GPA:</strong> Enter the GPA for that semester (0.0-4.0)</li>
          <li><strong>Total Credits:</strong> Enter total credit hours for the semester</li>
          <li><strong>Add Semesters:</strong> Click "+ Add Another Semester" for additional semesters</li>
        </ul>

        <h3>Step 4: Calculate and Review</h3>
        <ul className="usage-steps">
          <li><strong>Calculate:</strong> Click the calculate button to get your results</li>
          <li><strong>Review:</strong> Check your GPA/CGPA, classification, and detailed breakdown</li>
        </ul>
      </ContentSection>

      <ContentSection id="calculation-method" title="Calculation Method">
        <p>
          The GPA and CGPA calculations use a weighted average system based on credit hours. 
          Each grade is converted to a numerical value, multiplied by credit hours, and then 
          averaged across all courses or semesters.
        </p>
        
        <div className="calculation-method-section">
          <h3>GPA Calculation Formula</h3>
          <div className="gpa-formula">
            <p><strong>GPA = Σ(Grade Points × Credit Hours) / Σ(Credit Hours)</strong></p>
            <p>Where:</p>
            <ul>
              <li>Grade Points = Numerical value of letter grade (A=4.0, B=3.0, etc.)</li>
              <li>Credit Hours = Number of credits for each course</li>
              <li>Σ = Sum of all courses in the semester</li>
            </ul>
          </div>

          <h3>CGPA Calculation Formula</h3>
          <div className="gpa-formula">
            <p><strong>CGPA = Σ(Semester GPA × Semester Credits) / Σ(Semester Credits)</strong></p>
            <p>Where:</p>
            <ul>
              <li>Semester GPA = GPA for each individual semester</li>
              <li>Semester Credits = Total credit hours for each semester</li>
              <li>Σ = Sum of all semesters</li>
            </ul>
          </div>

          <h3>Calculation Steps</h3>
          <ol>
            <li><strong>Convert Grades:</strong> Transform letter grades to numerical values</li>
            <li><strong>Calculate Points:</strong> Multiply grade points by credit hours</li>
            <li><strong>Sum Totals:</strong> Add all points and credit hours</li>
            <li><strong>Compute Average:</strong> Divide total points by total credits</li>
            <li><strong>Round Result:</strong> Round to 2 decimal places for final GPA/CGPA</li>
          </ol>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: Single Semester GPA Calculation</h3>
          <div className="gpa-example">
            <p><strong>Courses:</strong></p>
            <ul>
              <li>Mathematics 101: A (4.0) × 3 credits = 12.0 points</li>
              <li>Physics 201: B+ (3.3) × 4 credits = 13.2 points</li>
              <li>Chemistry 101: A- (3.7) × 3 credits = 11.1 points</li>
              <li>English 101: B (3.0) × 3 credits = 9.0 points</li>
            </ul>
            <p><strong>Calculation:</strong></p>
            <p>Total Points: 12.0 + 13.2 + 11.1 + 9.0 = 45.3</p>
            <p>Total Credits: 3 + 4 + 3 + 3 = 13</p>
            <p><strong>GPA: 45.3 ÷ 13 = 3.48 (Very Good)</strong></p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: Multi-Semester CGPA Calculation</h3>
          <div className="gpa-example">
            <p><strong>Semesters:</strong></p>
            <ul>
              <li>Fall 2022: GPA 3.2 × 15 credits = 48.0 points</li>
              <li>Spring 2023: GPA 3.5 × 16 credits = 56.0 points</li>
              <li>Fall 2023: GPA 3.8 × 14 credits = 53.2 points</li>
            </ul>
            <p><strong>Calculation:</strong></p>
            <p>Total Weighted Points: 48.0 + 56.0 + 53.2 = 157.2</p>
            <p>Total Credits: 15 + 16 + 14 = 45</p>
            <p><strong>CGPA: 157.2 ÷ 45 = 3.49 (Very Good)</strong></p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 3: Grade Improvement Impact</h3>
          <div className="gpa-example">
            <p><strong>Scenario:</strong> Improving one grade from C to B in a 3-credit course</p>
            <p><strong>Impact:</strong></p>
            <ul>
              <li>Previous: C (2.0) × 3 credits = 6.0 points</li>
              <li>Improved: B (3.0) × 3 credits = 9.0 points</li>
              <li>Difference: 3.0 points</li>
              <li>GPA Impact: 3.0 ÷ total credits = GPA improvement</li>
            </ul>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding and tracking your GPA/CGPA is crucial for several reasons:</p>
        <ul>
          <li><strong>Academic Progress:</strong> Monitor your performance over time</li>
          <li><strong>Graduation Requirements:</strong> Ensure you meet minimum GPA requirements</li>
          <li><strong>Scholarship Eligibility:</strong> Maintain grades for financial aid</li>
          <li><strong>Graduate School:</strong> Meet admission requirements for advanced programs</li>
          <li><strong>Career Opportunities:</strong> Many employers consider academic performance</li>
          <li><strong>Personal Development:</strong> Identify areas for academic improvement</li>
          <li><strong>Goal Setting:</strong> Set realistic academic targets</li>
          <li><strong>Time Management:</strong> Plan study time based on course difficulty</li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our GPA & CGPA Calculator provides comprehensive functionality:</p>
        <ul>
          <li><strong>Dual Calculator Types:</strong> Both GPA and CGPA calculation modes</li>
          <li><strong>Dynamic Input Management:</strong> Add/remove courses and semesters as needed</li>
          <li><strong>Comprehensive Grade System:</strong> Support for all standard letter grades</li>
          <li><strong>Automatic Classification:</strong> Grade performance interpretation</li>
          <li><strong>Detailed Breakdown:</strong> Step-by-step calculation display</li>
          <li><strong>Credit Hour Validation:</strong> Proper input validation and error handling</li>
          <li><strong>Educational Content:</strong> Comprehensive information about grading systems</li>
          <li><strong>Responsive Design:</strong> Works on all devices and screen sizes</li>
          <li><strong>Accessibility Features:</strong> Screen reader compatible and keyboard navigation</li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-graduation-cap"></i> Academic Planning</h4>
            <p>Plan course loads and academic goals</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Performance Tracking</h4>
            <p>Monitor academic progress over time</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-trophy"></i> Scholarship Applications</h4>
            <p>Calculate GPA for scholarship requirements</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-university"></i> Graduate School</h4>
            <p>Prepare applications for advanced programs</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-briefcase"></i> Job Applications</h4>
            <p>Provide accurate GPA information to employers</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-target"></i> Goal Setting</h4>
            <p>Set realistic academic performance targets</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-calculator"></i> Grade Planning</h4>
            <p>Calculate required grades to achieve target GPA</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-clipboard-check"></i> Academic Advising</h4>
            <p>Support academic counseling and guidance</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection faqs={faqData} />
    </ToolPageLayout>
  )
}

export default GPACalculator