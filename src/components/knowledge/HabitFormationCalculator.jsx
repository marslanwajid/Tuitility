import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import ResultSection from '../tool/ResultSection';
import TableOfContents from '../tool/TableOfContents';
import MathFormula from '../tool/MathFormula';
import FeedbackForm from '../tool/FeedbackForm';
import '../../assets/css/knowledge/habit-formation-calculator.css';

const HabitFormationCalculator = () => {
  const [formData, setFormData] = useState({
    habitType: '',
    dailyTime: 10,
    motivationLevel: 'medium',
    previousAttempt: 'no',
    complexity: 'medium'
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [tips, setTips] = useState('');

  useEffect(() => {
    // Load the JavaScript logic
    const script = document.createElement('script');
    script.src = '/src/assets/js/knowledge/habit-formation-calculator.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateHabitFormation = () => {
    setError('');
    
    if (!formData.habitType.trim()) {
      setError('Please enter a habit type.');
      return;
    }

    // Base days (research suggests average is around 66 days)
    let baseDays = 66;
    
    // Adjust based on motivation level
    let motivationFactor = 1;
    if (formData.motivationLevel === 'high') {
      motivationFactor = 0.8; // Reduces time by 20%
    } else if (formData.motivationLevel === 'low') {
      motivationFactor = 1.3; // Increases time by 30%
    }
    
    // Adjust based on previous attempts
    let previousFactor = 1;
    if (formData.previousAttempt === 'yes') {
      previousFactor = 0.9; // Reduces time by 10% if tried before
    }
    
    // Adjust based on daily time commitment
    let timeFactor = 1;
    if (formData.dailyTime < 5) {
      timeFactor = 1.2; // Very short habits take longer to form
    } else if (formData.dailyTime > 30) {
      timeFactor = 0.9; // Longer daily practice can form habits faster
    }
    
    // Adjust based on complexity
    let complexityFactor = 1;
    if (formData.complexity === 'simple') {
      complexityFactor = 0.8;
    } else if (formData.complexity === 'complex') {
      complexityFactor = 1.4;
    }
    
    // Calculate estimated days
    const estimatedDays = Math.round(baseDays * motivationFactor * previousFactor * timeFactor * complexityFactor);
    
    // Calculate range (±15%)
    const minDays = Math.round(estimatedDays * 0.85);
    const maxDays = Math.round(estimatedDays * 1.15);
    
    // Calculate success probability
    const successProbability = calculateSuccessProbability(formData.motivationLevel, formData.complexity, formData.previousAttempt);
    
    // Calculate target date
    const targetDate = calculateTargetDate(estimatedDays);
    
    setResult({
      estimatedDays,
      minDays,
      maxDays,
      successProbability,
      targetDate,
      habitType: formData.habitType
    });

    // Generate tips
    generateTips(formData.motivationLevel, formData.complexity, formData.dailyTime, estimatedDays);
  };

  const calculateSuccessProbability = (motivation, complexity, previousAttempt) => {
    let probability = 70; // Base probability
    
    // Adjust based on motivation
    if (motivation === 'high') {
      probability += 15;
    } else if (motivation === 'low') {
      probability -= 15;
    }
    
    // Adjust based on complexity
    if (complexity === 'simple') {
      probability += 10;
    } else if (complexity === 'complex') {
      probability -= 10;
    }
    
    // Adjust based on previous attempts
    if (previousAttempt === 'yes') {
      probability += 5;
    }
    
    // Ensure probability is between 0-100
    return Math.min(Math.max(probability, 0), 100);
  };

  const calculateTargetDate = (days) => {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + days);
    
    return targetDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const generateTips = (motivation, complexity, dailyTime, days) => {
    let tipsContent = '';
    
    // Motivation-based tips
    if (motivation === 'low') {
      tipsContent += '<li>Start with a very small version of your habit to build momentum.</li>';
      tipsContent += '<li>Set up visual reminders in your environment to prompt your habit.</li>';
      tipsContent += '<li>Find an accountability partner to keep you on track.</li>';
    } else if (motivation === 'medium') {
      tipsContent += '<li>Track your progress daily to maintain motivation.</li>';
      tipsContent += '<li>Reward yourself after completing your habit consistently for a week.</li>';
    } else {
      tipsContent += '<li>Challenge yourself by gradually increasing the difficulty of your habit.</li>';
      tipsContent += '<li>Consider teaching or sharing your habit journey with others to stay committed.</li>';
    }
    
    // Complexity-based tips
    if (complexity === 'complex') {
      tipsContent += '<li>Break down your habit into smaller sub-habits to make it more manageable.</li>';
      tipsContent += '<li>Focus on mastering one aspect at a time before adding complexity.</li>';
    }
    
    // Time-based tips
    if (dailyTime > 30) {
      tipsContent += '<li>Consider splitting your practice into multiple shorter sessions throughout the day.</li>';
    }
    
    // General tips
    tipsContent += '<li>The "21-day habit myth" is not scientifically accurate. Research shows most habits take between 18-254 days to form, with 66 days being the average.</li>';
    tipsContent += `<li>Stay consistent! Missing a day occasionally won't derail your progress, but try not to miss two days in a row during these ${days} days.</li>`;
    tipsContent += '<li>Stack your new habit onto an existing habit to make it easier to remember.</li>';
    tipsContent += '<li>Add a reminder to your calendar for daily practice and a milestone check-in every 7 days.</li>';
    
    setTips(tipsContent);
  };

  const resetCalculator = () => {
    setFormData({
      habitType: '',
      dailyTime: 10,
      motivationLevel: 'medium',
      previousAttempt: 'no',
      complexity: 'medium'
    });
    setResult(null);
    setError('');
    setTips('');
  };

  const toolData = {
    name: "Habit Formation Calculator",
    description: "Calculate how long it takes to form a new habit based on scientific research. Get personalized estimates, success probability, and actionable tips for building lasting habits.",
    icon: "fas fa-calendar-check",
    category: "Knowledge",
    breadcrumb: ["Knowledge", "Calculators", "Habit Formation Calculator"]
  };

  const categories = [
    { name: "Knowledge", url: "/knowledge", icon: "fas fa-graduation-cap" },
    { name: "Math", url: "/math", icon: "fas fa-calculator" },
    { name: "Finance", url: "/finance", icon: "fas fa-dollar-sign" },
    { name: "Health", url: "/health", icon: "fas fa-heartbeat" },
    { name: "Science", url: "/science", icon: "fas fa-flask" }
  ];

  const relatedTools = [
    { name: "GPA Calculator", url: "/knowledge/calculators/gpa-calculator", icon: "fas fa-graduation-cap" },
    { name: "Age Calculator", url: "/knowledge/calculators/age-calculator", icon: "fas fa-calendar-alt" },
    { name: "WPM Calculator", url: "/knowledge/calculators/wpm-calculator", icon: "fas fa-keyboard" },
    { name: "Love Calculator", url: "/knowledge/calculators/love-calculator", icon: "fas fa-heart" },
    { name: "MBTI Personality", url: "/knowledge/calculators/mbti-calculator", icon: "fas fa-user-friends" }
  ];

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction', level: 2 },
    { id: 'what-is-habit-formation', title: 'What is Habit Formation?', level: 2 },
    { id: 'habit-formation-factors', title: 'Factors Affecting Habit Formation', level: 2 },
    { id: 'how-to-use', title: 'How to Use', level: 2 },
    { id: 'calculation-method', title: 'Calculation Method', level: 2 },
    { id: 'examples', title: 'Examples', level: 2 },
    { id: 'significance', title: 'Significance', level: 2 },
    { id: 'functionality', title: 'Functionality', level: 2 },
    { id: 'applications', title: 'Applications', level: 2 },
    { id: 'faqs', title: 'FAQs', level: 2 }
  ];

  const faqData = [
    {
      question: "How long does it really take to form a habit?",
      answer: "Research shows that habit formation takes anywhere from 18 to 254 days, with an average of 66 days. The time varies significantly based on the person, the habit, and the circumstances."
    },
    {
      question: "What factors affect how quickly I can form a habit?",
      answer: "Key factors include motivation level, habit complexity, daily time commitment, previous attempts, consistency, and environmental factors. Our calculator considers these variables to provide personalized estimates."
    },
    {
      question: "Is the 21-day rule for habit formation true?",
      answer: "No, the 21-day rule is a myth. While some simple habits might form in 21 days, research shows that most habits take much longer to become automatic, with 66 days being the average."
    },
    {
      question: "What if I miss a day? Will it ruin my progress?",
      answer: "Missing a day occasionally won't derail your progress. However, try not to miss two days in a row, as this can break the habit formation process. Consistency is more important than perfection."
    },
    {
      question: "How can I increase my chances of success?",
      answer: "Start small, be consistent, track your progress, stack new habits onto existing ones, create environmental cues, and find an accountability partner. Our calculator provides personalized tips based on your specific situation."
    },
    {
      question: "What's the difference between simple and complex habits?",
      answer: "Simple habits are easy to perform and require minimal effort (like drinking a glass of water). Complex habits involve multiple steps or significant effort (like learning a new language). Complex habits typically take longer to form."
    }
  ];

  return (
    <ToolPageLayout
      toolData={toolData}
      categories={categories}
      relatedTools={relatedTools}
    >
      <CalculatorSection 
        title="Habit Formation Calculator"
        onCalculate={calculateHabitFormation}
        calculateButtonText="Calculate Habit Formation Time"
        error={error}
        result={null}
      >
        <form id="habit-formation-form" className="habit-formation-form">
          <div className="habit-form-group">
            <label className="habit-input-label">What habit do you want to form?</label>
            <input
              type="text"
              className="habit-input-field"
              id="habit-type"
              value={formData.habitType}
              onChange={(e) => handleInputChange('habitType', e.target.value)}
              placeholder="e.g., Exercise, Reading, Meditation"
              required
            />
          </div>

          <div className="habit-form-group">
            <label className="habit-input-label">Daily time commitment (minutes)</label>
            <input
              type="number"
              className="habit-input-field"
              id="habit-daily-time"
              value={formData.dailyTime}
              onChange={(e) => handleInputChange('dailyTime', parseInt(e.target.value))}
              min="1"
              max="120"
              required
            />
          </div>

          <div className="habit-form-group">
            <label className="habit-input-label">How motivated are you?</label>
            <div className="habit-radio-group">
              <label className="habit-radio-label">
                <input
                  type="radio"
                  name="motivation"
                  value="low"
                  checked={formData.motivationLevel === 'low'}
                  onChange={(e) => handleInputChange('motivationLevel', e.target.value)}
                />
                <span className="habit-radio-text">Low - I'm not very motivated</span>
              </label>
              <label className="habit-radio-label">
                <input
                  type="radio"
                  name="motivation"
                  value="medium"
                  checked={formData.motivationLevel === 'medium'}
                  onChange={(e) => handleInputChange('motivationLevel', e.target.value)}
                />
                <span className="habit-radio-text">Medium - I'm somewhat motivated</span>
              </label>
              <label className="habit-radio-label">
                <input
                  type="radio"
                  name="motivation"
                  value="high"
                  checked={formData.motivationLevel === 'high'}
                  onChange={(e) => handleInputChange('motivationLevel', e.target.value)}
                />
                <span className="habit-radio-text">High - I'm very motivated</span>
              </label>
            </div>
          </div>

          <div className="habit-form-group">
            <label className="habit-input-label">Have you tried this habit before?</label>
            <div className="habit-radio-group">
              <label className="habit-radio-label">
                <input
                  type="radio"
                  name="previous-attempt"
                  value="no"
                  checked={formData.previousAttempt === 'no'}
                  onChange={(e) => handleInputChange('previousAttempt', e.target.value)}
                />
                <span className="habit-radio-text">No - This is my first attempt</span>
              </label>
              <label className="habit-radio-label">
                <input
                  type="radio"
                  name="previous-attempt"
                  value="yes"
                  checked={formData.previousAttempt === 'yes'}
                  onChange={(e) => handleInputChange('previousAttempt', e.target.value)}
                />
                <span className="habit-radio-text">Yes - I've tried before</span>
              </label>
            </div>
          </div>

          <div className="habit-form-group">
            <label className="habit-input-label">How complex is this habit?</label>
            <div className="habit-radio-group">
              <label className="habit-radio-label">
                <input
                  type="radio"
                  name="complexity"
                  value="simple"
                  checked={formData.complexity === 'simple'}
                  onChange={(e) => handleInputChange('complexity', e.target.value)}
                />
                <span className="habit-radio-text">Simple - Easy to do</span>
              </label>
              <label className="habit-radio-label">
                <input
                  type="radio"
                  name="complexity"
                  value="medium"
                  checked={formData.complexity === 'medium'}
                  onChange={(e) => handleInputChange('complexity', e.target.value)}
                />
                <span className="habit-radio-text">Medium - Moderate effort</span>
              </label>
              <label className="habit-radio-label">
                <input
                  type="radio"
                  name="complexity"
                  value="complex"
                  checked={formData.complexity === 'complex'}
                  onChange={(e) => handleInputChange('complexity', e.target.value)}
                />
                <span className="habit-radio-text">Complex - Requires significant effort</span>
              </label>
            </div>
          </div>

        </form>

        {/* Form Actions */}
        <div className="habit-form-actions">
          <button type="button" className="habit-btn-reset" onClick={resetCalculator}>
            <i className="fas fa-redo"></i>
            Reset
          </button>
        </div>

        {result && (
          <div className="habit-formation-calculator-result">
            <h3 className="habit-result-title">Habit Formation Assessment Results</h3>
            <div className="habit-result-content">
              <div className="habit-result-main">
                <div className="habit-result-item">
                  <strong>Estimated Time:</strong>
                  <span className="habit-result-value habit-result-final">
                    {result.estimatedDays} days
                  </span>
                </div>
                <div className="habit-result-item">
                  <strong>Habit Type:</strong>
                  <span className="habit-result-value">
                    {result.habitType}
                  </span>
                </div>
                <div className="habit-result-item">
                  <strong>Time Range:</strong>
                  <span className="habit-result-value">
                    {result.minDays} to {result.maxDays} days
                  </span>
                </div>
                <div className="habit-result-item">
                  <strong>Target Date:</strong>
                  <span className="habit-result-value">
                    {result.targetDate}
                  </span>
                </div>
                <div className="habit-result-item">
                  <strong>Success Probability:</strong>
                  <span className="habit-result-value">
                    {result.successProbability}%
                  </span>
                </div>
              </div>
              
              <div className="habit-progress-section">
                <h4 className="habit-progress-title">Success Probability</h4>
                <div className="habit-progress-bar">
                  <div className="habit-progress-fill" style={{ width: `${result.successProbability}%` }}></div>
                  <div className="habit-progress-text">{result.successProbability}%</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tips && (
          <div className="habit-formation-calculator-result">
            <h3 className="habit-result-title">Personalized Tips</h3>
            <div className="habit-result-content">
              <div className="habit-tips-content">
                <ul className="habit-tips-list">
                  {tips.split('<li>').slice(1).map((tip, index) => (
                    <li key={index} dangerouslySetInnerHTML={{ __html: tip.replace('</li>', '') }} />
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="habit-error-message">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
          </div>
        )}
      </CalculatorSection>

      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName={toolData.name} />
      </div>

      <ContentSection id="introduction">
        <h2>Introduction</h2>
        <p>
          The Habit Formation Calculator is a scientifically-based tool that helps you understand how long it takes to form new habits. 
          Based on research from University College London, this calculator provides personalized estimates for habit formation time, 
          considering various factors that influence the process.
        </p>
        <p>
          Whether you want to start exercising, reading daily, or learning a new skill, understanding the realistic timeline for habit 
          formation can help you set proper expectations and increase your chances of success. Our calculator provides not just estimates, 
          but also personalized tips and strategies to help you build lasting habits.
        </p>
      </ContentSection>

      <ContentSection id="what-is-habit-formation">
        <h2>What is Habit Formation?</h2>
        <div className="habit-definition-grid">
          <div className="habit-definition-item">
            <h3><i className="fas fa-brain"></i> Automatic Behavior</h3>
            <p>Habits are behaviors that become automatic through repetition, requiring minimal conscious effort to perform.</p>
          </div>
          <div className="habit-definition-item">
            <h3><i className="fas fa-clock"></i> Time Investment</h3>
            <p>Research shows habit formation takes 18-254 days, with 66 days being the average for most people.</p>
          </div>
          <div className="habit-definition-item">
            <h3><i className="fas fa-repeat"></i> Consistency</h3>
            <p>Regular repetition is crucial for habit formation, with consistency being more important than perfection.</p>
          </div>
          <div className="habit-definition-item">
            <h3><i className="fas fa-target"></i> Goal Achievement</h3>
            <p>Habits are the foundation for achieving long-term goals and creating lasting positive changes in your life.</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="habit-formation-factors">
        <h2>Factors Affecting Habit Formation</h2>
        <div className="habit-factors-grid">
          <div className="habit-factor-item">
            <h3><i className="fas fa-fire"></i> Motivation Level</h3>
            <p>Higher motivation can reduce formation time by up to 20%, while low motivation can increase it by 30%.</p>
          </div>
          <div className="habit-factor-item">
            <h3><i className="fas fa-cogs"></i> Habit Complexity</h3>
            <p>Simple habits form faster than complex ones. Breaking complex habits into smaller steps can help.</p>
          </div>
          <div className="habit-factor-item">
            <h3><i className="fas fa-history"></i> Previous Attempts</h3>
            <p>Having tried the habit before can reduce formation time by 10% due to existing neural pathways.</p>
          </div>
          <div className="habit-factor-item">
            <h3><i className="fas fa-stopwatch"></i> Daily Time Commitment</h3>
            <p>Very short habits (under 5 minutes) or very long ones (over 30 minutes) may take longer to form.</p>
          </div>
          <div className="habit-factor-item">
            <h3><i className="fas fa-calendar-check"></i> Consistency</h3>
            <p>Missing days occasionally is okay, but missing two days in a row can significantly impact progress.</p>
          </div>
          <div className="habit-factor-item">
            <h3><i className="fas fa-home"></i> Environment</h3>
            <p>Your physical and social environment plays a crucial role in supporting or hindering habit formation.</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="how-to-use">
        <h2>How to Use the Habit Formation Calculator</h2>
        <div className="habit-usage-steps">
          <h3>Step 1: Define Your Habit</h3>
          <ul className="usage-steps">
            <li><strong>Enter Habit Type:</strong> Specify exactly what habit you want to form</li>
            <li><strong>Set Time Commitment:</strong> Choose how many minutes per day you'll dedicate</li>
            <li><strong>Be Specific:</strong> The more specific your habit, the more accurate the estimate</li>
          </ul>

          <h3>Step 2: Assess Your Situation</h3>
          <ul className="usage-steps">
            <li><strong>Motivation Level:</strong> Honestly assess your current motivation</li>
            <li><strong>Previous Attempts:</strong> Indicate if you've tried this habit before</li>
            <li><strong>Complexity:</strong> Rate how complex or simple the habit is</li>
          </ul>

          <h3>Step 3: Get Your Estimate</h3>
          <ul className="usage-steps">
            <li><strong>Calculate:</strong> Click the calculate button to get your personalized estimate</li>
            <li><strong>Review Results:</strong> Check the estimated time range and success probability</li>
            <li><strong>Plan Accordingly:</strong> Use the target date to set realistic expectations</li>
          </ul>

          <h3>Step 4: Follow Personalized Tips</h3>
          <ul className="usage-steps">
            <li><strong>Read Tips:</strong> Review the personalized tips based on your inputs</li>
            <li><strong>Implement Strategies:</strong> Apply the recommended strategies to your habit formation</li>
            <li><strong>Track Progress:</strong> Monitor your progress and adjust as needed</li>
          </ul>
        </div>
      </ContentSection>

      <ContentSection id="calculation-method">
        <h2>Calculation Method</h2>
        <div className="habit-calculation-method">
          <h3>Base Formula</h3>
          <MathFormula formula="Estimated\ Days = Base\ Days \times Motivation\ Factor \times Previous\ Factor \times Time\ Factor \times Complexity\ Factor" />
          
          <h3>Base Days</h3>
          <p>Research from University College London suggests that the average time to form a habit is 66 days, which serves as our base calculation.</p>
          
          <h3>Adjustment Factors</h3>
          <div className="habit-calculation-example">
            <p><strong>Motivation Level:</strong></p>
            <ul>
              <li>High motivation: 0.8 (reduces time by 20%)</li>
              <li>Medium motivation: 1.0 (no change)</li>
              <li>Low motivation: 1.3 (increases time by 30%)</li>
            </ul>
            
            <p><strong>Previous Attempts:</strong></p>
            <ul>
              <li>First attempt: 1.0 (no change)</li>
              <li>Previous attempts: 0.9 (reduces time by 10%)</li>
            </ul>
            
            <p><strong>Daily Time Commitment:</strong></p>
            <ul>
              <li>Under 5 minutes: 1.2 (increases time by 20%)</li>
              <li>5-30 minutes: 1.0 (no change)</li>
              <li>Over 30 minutes: 0.9 (reduces time by 10%)</li>
            </ul>
            
            <p><strong>Complexity:</strong></p>
            <ul>
              <li>Simple: 0.8 (reduces time by 20%)</li>
              <li>Medium: 1.0 (no change)</li>
              <li>Complex: 1.4 (increases time by 40%)</li>
            </ul>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="examples">
        <h2>Habit Formation Examples</h2>
        <div className="habit-examples-grid">
          <div className="habit-example-item">
            <h3>Simple Habits</h3>
            <p><strong>Examples:</strong> Drinking water, taking vitamins, making bed</p>
            <p><strong>Time Range:</strong> 18-45 days</p>
            <p><strong>Success Rate:</strong> 85-95%</p>
          </div>
          <div className="habit-example-item">
            <h3>Medium Habits</h3>
            <p><strong>Examples:</strong> Exercise, reading, meditation</p>
            <p><strong>Time Range:</strong> 45-90 days</p>
            <p><strong>Success Rate:</strong> 70-85%</p>
          </div>
          <div className="habit-example-item">
            <h3>Complex Habits</h3>
            <p><strong>Examples:</strong> Learning language, playing instrument</p>
            <p><strong>Time Range:</strong> 90-254 days</p>
            <p><strong>Success Rate:</strong> 50-70%</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance">
        <h2>Significance of Habit Formation</h2>
        <div className="habit-significance-grid">
          <div className="habit-significance-item">
            <h3><i className="fas fa-trophy"></i> Goal Achievement</h3>
            <p>Habits are the building blocks of long-term success. Understanding formation time helps set realistic expectations and increases success rates.</p>
          </div>
          <div className="habit-significance-item">
            <h3><i className="fas fa-heart"></i> Health & Wellness</h3>
            <p>Healthy habits like exercise, proper nutrition, and sleep are crucial for physical and mental well-being.</p>
          </div>
          <div className="habit-significance-item">
            <h3><i className="fas fa-briefcase"></i> Professional Development</h3>
            <p>Workplace habits like time management, continuous learning, and networking are essential for career growth.</p>
          </div>
          <div className="habit-significance-item">
            <h3><i className="fas fa-graduation-cap"></i> Personal Growth</h3>
            <p>Learning new skills, reading, and self-reflection habits contribute to personal development and life satisfaction.</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="functionality">
        <h2>Habit Formation Calculator Functionality</h2>
        <div className="habit-functionality-grid">
          <div className="habit-functionality-item">
            <h3><i className="fas fa-calculator"></i> Personalized Estimates</h3>
            <p>Get customized habit formation time estimates based on your specific situation and circumstances.</p>
          </div>
          <div className="habit-functionality-item">
            <h3><i className="fas fa-chart-line"></i> Success Probability</h3>
            <p>Calculate your likelihood of success based on motivation, complexity, and other factors.</p>
          </div>
          <div className="habit-functionality-item">
            <h3><i className="fas fa-calendar-alt"></i> Target Dates</h3>
            <p>Get specific target dates for when your habit should become automatic.</p>
          </div>
          <div className="habit-functionality-item">
            <h3><i className="fas fa-lightbulb"></i> Personalized Tips</h3>
            <p>Receive customized advice and strategies based on your habit type and situation.</p>
          </div>
          <div className="habit-functionality-item">
            <h3><i className="fas fa-chart-bar"></i> Progress Tracking</h3>
            <p>Understand the realistic timeline and range for habit formation to track your progress effectively.</p>
          </div>
          <div className="habit-functionality-item">
            <h3><i className="fas fa-mobile-alt"></i> Mobile Friendly</h3>
            <p>Access the calculator on any device to plan and track your habit formation journey.</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="applications">
        <h2>Applications of Habit Formation</h2>
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-dumbbell"></i> Health & Fitness</h4>
            <p>Form habits for exercise, healthy eating, sleep schedules, and wellness routines.</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-book"></i> Learning & Education</h4>
            <p>Develop study habits, reading routines, and continuous learning practices.</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-briefcase"></i> Professional Development</h4>
            <p>Build work habits like time management, networking, and skill development.</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-users"></i> Relationships</h4>
            <p>Form habits for communication, quality time, and relationship maintenance.</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-piggy-bank"></i> Financial Management</h4>
            <p>Develop saving habits, budgeting routines, and financial planning practices.</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-brain"></i> Mental Health</h4>
            <p>Build habits for mindfulness, stress management, and emotional well-being.</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection faqs={faqData} />
      <FeedbackForm />
    </ToolPageLayout>
  );
};

export default HabitFormationCalculator;

