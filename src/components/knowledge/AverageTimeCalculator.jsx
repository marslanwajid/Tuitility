import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import '../../assets/css/knowledge/average-time-calculator.css';

const AverageTimeCalculator = () => {
  const [timeEntries, setTimeEntries] = useState([
    { id: 1, hours: '', minutes: '', seconds: '', milliseconds: '' }
  ]);
  const [showMilliseconds, setShowMilliseconds] = useState(false);
  const [calculationMethod, setCalculationMethod] = useState('mean');
  const [excludeOutliers, setExcludeOutliers] = useState(false);
  const [outlierThreshold, setOutlierThreshold] = useState(2);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Tool data for ToolPageLayout
  const toolData = {
    name: "Average Time Calculator",
    description: "Calculate the average, median, and mode of multiple time entries with advanced statistical analysis. Perfect for timing analysis, performance measurement, and data processing.",
    category: "Knowledge",
    icon: "fas fa-clock",
    breadcrumb: ['Knowledge', 'Calculators', 'Average Time Calculator'],
    keywords: ["average", "time", "statistics", "median", "mode", "performance", "timing", "analysis"]
  };

  // Categories for navigation
  const categories = [
    { name: "Knowledge", url: "/knowledge" },
    { name: "Average Time Calculator", url: "/knowledge/calculators/average-time-calculator" }
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
    { name: "Fuel Calculator", url: "/knowledge/calculators/fuel-calculator", icon: "fas fa-gas-pump" }
  ];

  // Calculation method options
  const calculationMethodOptions = [
    { value: 'mean', label: 'Mean (Average)' },
    { value: 'median', label: 'Median' },
    { value: 'mode', label: 'Mode' },
    { value: 'all', label: 'All Methods' }
  ];

  // Add new time entry
  const addTimeEntry = () => {
    const newId = Math.max(...timeEntries.map(entry => entry.id)) + 1;
    setTimeEntries([...timeEntries, { 
      id: newId, 
      hours: '', 
      minutes: '', 
      seconds: '', 
      milliseconds: '' 
    }]);
  };

  // Remove time entry
  const removeTimeEntry = (id) => {
    if (timeEntries.length > 1) {
      setTimeEntries(timeEntries.filter(entry => entry.id !== id));
    }
  };

  // Update time entry
  const updateTimeEntry = (id, field, value) => {
    setTimeEntries(timeEntries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  // Calculate average time
  const calculateAverage = () => {
    try {
      // Validate and collect time values
      const times = [];
      const validEntries = [];

      for (let i = 0; i < timeEntries.length; i++) {
        const entry = timeEntries[i];
        const hours = parseInt(entry.hours) || 0;
        const minutes = parseInt(entry.minutes) || 0;
        const seconds = parseInt(entry.seconds) || 0;
        const milliseconds = parseInt(entry.milliseconds) || 0;

        // Validate time values
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || 
            seconds < 0 || seconds > 59 || milliseconds < 0 || milliseconds > 999) {
          setError(`Invalid time value in entry ${i + 1}. Please check your inputs.`);
          return;
        }

        // Check if entry has at least some value
        if (hours > 0 || minutes > 0 || seconds > 0 || milliseconds > 0) {
          // Convert to milliseconds for calculations
          const totalMs = (hours * 3600000) + (minutes * 60000) + (seconds * 1000) + milliseconds;
          times.push(totalMs);
          validEntries.push(entry);
        }
      }

      if (times.length === 0) {
        setError('Please add at least one valid time entry.');
        return;
      }

      // Process times based on options
      let processedTimes = [...times];
      let outliers = [];

      // Handle outliers if option is selected
      if (excludeOutliers) {
        const result = removeOutliers(processedTimes, outlierThreshold);
        processedTimes = result.filteredData;
        outliers = result.outliers;
      }

      // Calculate statistics based on selected method
      const results = {};

      // Always calculate mean
      results.mean = calculateMean(processedTimes);

      // Calculate other statistics based on selected method
      if (calculationMethod === 'median' || calculationMethod === 'all') {
        results.median = calculateMedian(processedTimes);
      }

      if (calculationMethod === 'mode' || calculationMethod === 'all') {
        results.mode = calculateMode(processedTimes);
      }

      // Calculate additional statistics
      const min = Math.min(...processedTimes);
      const max = Math.max(...processedTimes);
      const range = max - min;
      const stdDev = calculateStandardDeviation(processedTimes);

      setResult({
        ...results,
        processedTimes,
        outliers,
        min,
        max,
        range,
        stdDev,
        totalEntries: timeEntries.length,
        validEntries: validEntries.length
      });

      setError('');
    } catch (err) {
      setError('Error calculating average time. Please check your inputs.');
      console.error('Calculation error:', err);
    }
  };

  // Calculate mean (average)
  const calculateMean = (times) => {
    if (times.length === 0) return 0;
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  };

  // Calculate median (middle value)
  const calculateMedian = (times) => {
    if (times.length === 0) return 0;
    
    const sortedTimes = [...times].sort((a, b) => a - b);
    const middle = Math.floor(sortedTimes.length / 2);
    
    if (sortedTimes.length % 2 === 0) {
      return (sortedTimes[middle - 1] + sortedTimes[middle]) / 2;
    } else {
      return sortedTimes[middle];
    }
  };

  // Calculate mode (most common value)
  const calculateMode = (times) => {
    if (times.length === 0) return 0;
    
    // Round to nearest second for mode calculation
    const roundedTimes = times.map(time => Math.round(time / 1000) * 1000);
    
    const frequency = {};
    let maxFrequency = 0;
    let mode = roundedTimes[0];
    
    roundedTimes.forEach(time => {
      frequency[time] = (frequency[time] || 0) + 1;
      
      if (frequency[time] > maxFrequency) {
        maxFrequency = frequency[time];
        mode = time;
      }
    });
    
    // If all values appear the same number of times, return the mean
    if (Object.values(frequency).every(count => count === maxFrequency)) {
      return calculateMean(times);
    }
    
    return mode;
  };

  // Calculate standard deviation
  const calculateStandardDeviation = (times) => {
    if (times.length <= 1) return 0;
    
    const mean = calculateMean(times);
    const squaredDifferences = times.map(time => Math.pow(time - mean, 2));
    const variance = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / times.length;
    
    return Math.sqrt(variance);
  };

  // Remove outliers using standard deviation method
  const removeOutliers = (data, threshold) => {
    const mean = calculateMean(data);
    const stdDev = calculateStandardDeviation(data);
    
    const outliers = [];
    const filteredData = data.filter(value => {
      const zScore = Math.abs((value - mean) / stdDev);
      const isOutlier = zScore > threshold;
      
      if (isOutlier) {
        outliers.push(value);
      }
      
      return !isOutlier;
    });
    
    return { filteredData, outliers };
  };

  // Format milliseconds to time string
  const formatTime = (ms, includeMs = true) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = ms % 1000;
    
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    
    if (includeMs) {
      const formattedMs = String(milliseconds).padStart(3, '0');
      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMs}`;
    } else {
      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }
  };

  // Reset calculator
  const resetCalculator = () => {
    setTimeEntries([{ id: 1, hours: '', minutes: '', seconds: '', milliseconds: '' }]);
    setCalculationMethod('mean');
    setExcludeOutliers(false);
    setOutlierThreshold(2);
    setResult(null);
    setError('');
  };

  // Load external JavaScript
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/src/assets/js/knowledge/average-time-calculator.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="/src/assets/js/knowledge/average-time-calculator.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  // Table of Contents data
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-average-time', title: 'What is Average Time?' },
    { id: 'statistical-methods', title: 'Statistical Methods' },
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
      question: "What's the difference between mean, median, and mode?",
      answer: "Mean is the arithmetic average of all values. Median is the middle value when data is sorted. Mode is the most frequently occurring value. Each method has different strengths depending on your data distribution."
    },
    {
      question: "When should I exclude outliers?",
      answer: "Exclude outliers when you have extreme values that don't represent typical performance. This is useful for timing analysis where occasional system delays or errors create unrealistic data points."
    },
    {
      question: "What's a good outlier threshold?",
      answer: "A threshold of 2 standard deviations is common, meaning values more than 2 standard deviations from the mean are considered outliers. You can adjust this based on your data and requirements."
    },
    {
      question: "Should I include milliseconds in my calculations?",
      answer: "Include milliseconds for high-precision timing (like performance benchmarks). For general timing analysis, seconds are usually sufficient. The calculator works with both precision levels."
    },
    {
      question: "How many time entries should I use?",
      answer: "More entries generally provide better statistical accuracy. For reliable averages, aim for at least 10-20 entries. For performance analysis, 50+ entries are recommended."
    },
    {
      question: "Can I use this for different types of timing data?",
      answer: "Yes! This calculator works for any time-based data: race times, processing speeds, response times, task durations, or any other timing measurements you need to analyze."
    }
  ];

  return (
    <ToolPageLayout 
      toolData={toolData} 
      categories={categories} 
      relatedTools={relatedTools}
    >
      <CalculatorSection
        title="Average Time Calculator"
        description="Calculate the average, median, and mode of multiple time entries with advanced statistical analysis."
        onCalculate={calculateAverage}
        calculateButtonText="Calculate Average"
        showCalculateButton={true}
      >
        <div className="avg-time-calculator-form">
          <div className="avg-time-form-section">
            <h3>Time Entries</h3>
            <div className="avg-time-entries-container" id="time-entries">
              {timeEntries.map((entry, index) => (
                <div key={entry.id} className="avg-time-entry">
                  <div className="avg-time-entry-number">
                    {index + 1}
                  </div>
                  <div className="avg-time-input-container">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      placeholder="HH"
                      className="avg-time-part avg-time-hours"
                      value={entry.hours}
                      onChange={(e) => updateTimeEntry(entry.id, 'hours', e.target.value)}
                    />
                    <span>:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="MM"
                      className="avg-time-part avg-time-minutes"
                      value={entry.minutes}
                      onChange={(e) => updateTimeEntry(entry.id, 'minutes', e.target.value)}
                    />
                    <span>:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="SS"
                      className="avg-time-part avg-time-seconds"
                      value={entry.seconds}
                      onChange={(e) => updateTimeEntry(entry.id, 'seconds', e.target.value)}
                    />
                    <span className={`avg-time-optional-ms ${!showMilliseconds ? 'hidden' : ''}`}>.</span>
                    <input
                      type="number"
                      min="0"
                      max="999"
                      placeholder="MS"
                      className={`avg-time-part avg-time-milliseconds avg-time-optional-ms ${!showMilliseconds ? 'hidden' : ''}`}
                      value={entry.milliseconds}
                      onChange={(e) => updateTimeEntry(entry.id, 'milliseconds', e.target.value)}
                    />
                  </div>
                  <div className="avg-time-entry-actions">
                    <button
                      className="avg-time-remove-entry"
                      onClick={() => removeTimeEntry(entry.id)}
                      disabled={timeEntries.length <= 1}
                      title="Remove this entry"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="avg-time-add-entry"
              onClick={addTimeEntry}
            >
              <i className="fas fa-plus"></i>
              Add Time Entry
            </button>
          </div>

          <div className="avg-time-form-section">
            <h3>Calculation Options</h3>
            <div className="avg-time-form-row">
              <div className="avg-time-form-group">
                <label htmlFor="calculation-method" className="avg-time-form-label">
                  <i className="fas fa-calculator"></i>
                  Calculation Method
                </label>
                <select
                  id="calculation-method"
                  className="avg-time-form-select"
                  value={calculationMethod}
                  onChange={(e) => setCalculationMethod(e.target.value)}
                >
                  {calculationMethodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="avg-time-form-group">
                <div className="avg-time-checkbox-group">
                  <input
                    type="checkbox"
                    id="show-milliseconds"
                    className="avg-time-form-checkbox"
                    checked={showMilliseconds}
                    onChange={(e) => setShowMilliseconds(e.target.checked)}
                  />
                  <label htmlFor="show-milliseconds" className="avg-time-checkbox-label">
                    <i className="fas fa-stopwatch"></i>
                    Show Milliseconds
                  </label>
                </div>
              </div>
            </div>
            <div className="avg-time-form-row">
              <div className="avg-time-form-group">
                <div className="avg-time-checkbox-group">
                  <input
                    type="checkbox"
                    id="exclude-outliers"
                    className="avg-time-form-checkbox"
                    checked={excludeOutliers}
                    onChange={(e) => setExcludeOutliers(e.target.checked)}
                  />
                  <label htmlFor="exclude-outliers" className="avg-time-checkbox-label">
                    <i className="fas fa-filter"></i>
                    Exclude Outliers
                  </label>
                </div>
              </div>
              {excludeOutliers && (
                <div className="avg-time-form-group">
                  <label htmlFor="outlier-threshold" className="avg-time-form-label">
                    <i className="fas fa-chart-line"></i>
                    Outlier Threshold (σ)
                  </label>
                  <input
                    type="number"
                    id="outlier-threshold"
                    className="avg-time-form-input"
                    value={outlierThreshold}
                    onChange={(e) => setOutlierThreshold(parseFloat(e.target.value))}
                    min="1"
                    max="5"
                    step="0.1"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="avg-time-error-message">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
          </div>
        )}

        {result && (
          <div className="avg-time-calculator-result">
            <div className="avg-time-result-header">
              <h3>Time Analysis Results</h3>
            </div>
            
            <div className="avg-time-summary">
              <div className="avg-time-main-result">
                <div className="avg-time-amount">
                  <span className="avg-time-amount-label">Mean (Average)</span>
                  <span className="avg-time-amount-value">
                    {formatTime(result.mean, showMilliseconds)}
                  </span>
                </div>
                {(calculationMethod === 'median' || calculationMethod === 'all') && (
                  <div className="avg-time-median">
                    <span className="avg-time-median-label">Median</span>
                    <span className="avg-time-median-value">
                      {formatTime(result.median, showMilliseconds)}
                    </span>
                  </div>
                )}
                {(calculationMethod === 'mode' || calculationMethod === 'all') && (
                  <div className="avg-time-mode">
                    <span className="avg-time-mode-label">Mode</span>
                    <span className="avg-time-mode-value">
                      {formatTime(result.mode, showMilliseconds)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="avg-time-breakdown">
              <h4>Detailed Analysis</h4>
              <div className="avg-time-breakdown-grid">
                <div className="avg-time-breakdown-item">
                  <span className="avg-time-breakdown-label">Total Entries</span>
                  <span className="avg-time-breakdown-value">
                    {result.totalEntries}
                  </span>
                </div>
                <div className="avg-time-breakdown-item">
                  <span className="avg-time-breakdown-label">Valid Entries</span>
                  <span className="avg-time-breakdown-value">
                    {result.validEntries}
                  </span>
                </div>
                {excludeOutliers && (
                  <div className="avg-time-breakdown-item">
                    <span className="avg-time-breakdown-label">Outliers Excluded</span>
                    <span className="avg-time-breakdown-value">
                      {result.outliers.length}
                    </span>
                  </div>
                )}
                <div className="avg-time-breakdown-item">
                  <span className="avg-time-breakdown-label">Minimum Time</span>
                  <span className="avg-time-breakdown-value">
                    {formatTime(result.min, showMilliseconds)}
                  </span>
                </div>
                <div className="avg-time-breakdown-item">
                  <span className="avg-time-breakdown-label">Maximum Time</span>
                  <span className="avg-time-breakdown-value">
                    {formatTime(result.max, showMilliseconds)}
                  </span>
                </div>
                <div className="avg-time-breakdown-item">
                  <span className="avg-time-breakdown-label">Time Range</span>
                  <span className="avg-time-breakdown-value">
                    {formatTime(result.range, showMilliseconds)}
                  </span>
                </div>
                <div className="avg-time-breakdown-item">
                  <span className="avg-time-breakdown-label">Standard Deviation</span>
                  <span className="avg-time-breakdown-value">
                    {formatTime(result.stdDev, showMilliseconds)}
                  </span>
                </div>
              </div>
            </div>

            <div className="avg-time-tips">
              <h4>Analysis Tips</h4>
              <ul className="avg-time-tips-list">
                <li>Mean is most affected by outliers, while median is more robust</li>
                <li>Use mode to identify the most common performance level</li>
                <li>Standard deviation shows how consistent your times are</li>
                <li>Exclude outliers when analyzing typical performance</li>
                <li>Include more entries for more reliable statistical results</li>
                <li>Consider the context when interpreting your results</li>
              </ul>
            </div>
          </div>
        )}

        <div className="avg-time-form-actions">
          <button type="button" className="avg-time-btn-reset" onClick={resetCalculator}>
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
          The Average Time Calculator is a powerful statistical tool designed to analyze multiple time 
          entries and calculate various statistical measures including mean, median, and mode. This 
          calculator is perfect for performance analysis, timing studies, and data processing where 
          you need to understand the central tendencies of your time-based data.
        </p>
        <p>
          Our calculator supports advanced features like outlier detection and exclusion, multiple 
          statistical methods, and detailed analysis including standard deviation and range. Whether 
          you're analyzing race times, processing speeds, or any other timing data, this tool provides 
          comprehensive statistical insights.
        </p>
      </ContentSection>

      <ContentSection id="what-is-average-time" title="What is Average Time?">
        <p>
          Average time refers to the central tendency of a set of time measurements. There are three 
          main types of averages commonly used in time analysis, each providing different insights 
          into your data.
        </p>
        <p>
          Understanding these different averages is crucial for accurate data interpretation:
        </p>
        <ul>
          <li><strong>Mean (Arithmetic Average):</strong> Sum of all times divided by the number of entries</li>
          <li><strong>Median (Middle Value):</strong> The middle value when all times are sorted</li>
          <li><strong>Mode (Most Common):</strong> The time value that appears most frequently</li>
        </ul>
      </ContentSection>

      <ContentSection id="statistical-methods" title="Statistical Methods">
        <p>
          Different statistical methods provide different insights into your time data. Understanding 
          when to use each method is key to accurate analysis.
        </p>
        
        <div className="statistical-methods-grid">
          <div className="statistical-method-item">
            <h4><i className="fas fa-calculator"></i> Mean (Average)</h4>
            <p>Most commonly used measure of central tendency</p>
            <ul>
              <li>Best for: Normally distributed data</li>
              <li>Use when: All values are equally important</li>
              <li>Limitation: Sensitive to outliers</li>
            </ul>
          </div>
          <div className="statistical-method-item">
            <h4><i className="fas fa-balance-scale"></i> Median</h4>
            <p>Middle value that divides data into two equal halves</p>
            <ul>
              <li>Best for: Skewed data or when outliers are present</li>
              <li>Use when: You want a robust measure</li>
              <li>Advantage: Not affected by extreme values</li>
            </ul>
          </div>
          <div className="statistical-method-item">
            <h4><i className="fas fa-chart-bar"></i> Mode</h4>
            <p>Most frequently occurring value in the dataset</p>
            <ul>
              <li>Best for: Identifying common performance levels</li>
              <li>Use when: Looking for typical values</li>
              <li>Note: May not exist or be unique</li>
            </ul>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Calculator">
        <p>Follow these steps to analyze your time data:</p>
        
        <h3>Step 1: Add Time Entries</h3>
        <ul className="usage-steps">
          <li><strong>Enter Times:</strong> Add your time measurements in HH:MM:SS format</li>
          <li><strong>Add More Entries:</strong> Click "Add Time Entry" to include additional measurements</li>
          <li><strong>Remove Entries:</strong> Use the X button to remove unwanted entries (minimum 1 required)</li>
        </ul>

        <h3>Step 2: Configure Options</h3>
        <ul className="usage-steps">
          <li><strong>Calculation Method:</strong> Choose mean, median, mode, or all methods</li>
          <li><strong>Milliseconds:</strong> Toggle to include or exclude millisecond precision</li>
          <li><strong>Outlier Detection:</strong> Enable to exclude extreme values from analysis</li>
        </ul>

        <h3>Step 3: Review Results</h3>
        <ul className="usage-steps">
          <li><strong>Statistical Measures:</strong> Review mean, median, and mode results</li>
          <li><strong>Detailed Analysis:</strong> Check range, standard deviation, and outlier information</li>
          <li><strong>Interpretation:</strong> Use the analysis tips to understand your results</li>
        </ul>
      </ContentSection>

      <ContentSection id="calculation-method" title="Calculation Method">
        <p>
          The calculator uses standard statistical formulas to compute each measure, with special 
          handling for time data and outlier detection.
        </p>
        
        <div className="calculation-method-section">
          <h3>Statistical Formulas</h3>
          <div className="avg-time-formula">
            <p><strong>Mean:</strong> μ = (Σx) / n</p>
            <p><strong>Median:</strong> Middle value of sorted data</p>
            <p><strong>Mode:</strong> Most frequent value</p>
            <p><strong>Standard Deviation:</strong> σ = √(Σ(x - μ)² / n)</p>
          </div>
          
          <h3>Outlier Detection</h3>
          <p>
            Outliers are detected using the Z-score method. Values with |Z-score| &gt; threshold 
            are considered outliers, where Z-score = (value - mean) / standard deviation.
          </p>
          
          <h3>Time Conversion</h3>
          <p>
            All times are converted to milliseconds for calculation, then converted back to 
            the appropriate time format for display. This ensures accurate mathematical operations.
          </p>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: Race Times</h3>
          <div className="example-solution">
            <p><strong>Times:</strong> 2:15:30, 2:18:45, 2:16:12, 2:14:58, 2:17:33</p>
            <p><strong>Mean:</strong> 2:16:35.6</p>
            <p><strong>Median:</strong> 2:16:12</p>
            <p><strong>Range:</strong> 3:47</p>
            <p><strong>Use Case:</strong> Analyzing marathon performance consistency</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: Processing Times (with outliers)</h3>
          <div className="example-solution">
            <p><strong>Times:</strong> 1.2s, 1.3s, 1.1s, 1.4s, 1.2s, 15.7s (outlier), 1.3s</p>
            <p><strong>Mean (with outliers):</strong> 3.2s</p>
            <p><strong>Mean (outliers excluded):</strong> 1.25s</p>
            <p><strong>Median:</strong> 1.3s</p>
            <p><strong>Use Case:</strong> System performance analysis</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 3: Response Times</h3>
          <div className="example-solution">
            <p><strong>Times:</strong> 150ms, 145ms, 152ms, 148ms, 150ms, 149ms</p>
            <p><strong>Mean:</strong> 149.0ms</p>
            <p><strong>Mode:</strong> 150ms (appears twice)</p>
            <p><strong>Standard Deviation:</strong> 2.5ms</p>
            <p><strong>Use Case:</strong> API response time monitoring</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding time averages is crucial for several reasons:</p>
        <ul>
          <li><strong>Performance Analysis:</strong> Identify typical performance levels and consistency</li>
          <li><strong>Quality Control:</strong> Monitor system performance and detect anomalies</li>
          <li><strong>Optimization:</strong> Identify areas for improvement in processes or systems</li>
          <li><strong>Benchmarking:</strong> Compare performance across different conditions or systems</li>
          <li><strong>Predictive Analysis:</strong> Use historical averages to predict future performance</li>
          <li><strong>Decision Making:</strong> Make informed decisions based on statistical evidence</li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our Average Time Calculator provides comprehensive functionality:</p>
        <ul>
          <li><strong>Multiple Statistical Methods:</strong> Calculate mean, median, and mode with one click</li>
          <li><strong>Outlier Detection:</strong> Automatically identify and optionally exclude extreme values</li>
          <li><strong>Flexible Precision:</strong> Support for both second and millisecond precision</li>
          <li><strong>Dynamic Entry Management:</strong> Add or remove time entries as needed</li>
          <li><strong>Comprehensive Analysis:</strong> Includes range, standard deviation, and detailed statistics</li>
          <li><strong>Input Validation:</strong> Ensures all time values are within valid ranges</li>
          <li><strong>Educational Content:</strong> Provides tips and explanations for result interpretation</li>
          <li><strong>Mobile Friendly:</strong> Responsive design for analysis on any device</li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-running"></i> Sports & Fitness</h4>
            <p>Analyze race times, workout durations, and performance metrics</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-cogs"></i> System Performance</h4>
            <p>Monitor processing times, response times, and system efficiency</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Data Analysis</h4>
            <p>Statistical analysis of time-based datasets and trends</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-tasks"></i> Project Management</h4>
            <p>Track task durations and estimate project timelines</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-flask"></i> Scientific Research</h4>
            <p>Analyze experimental timing data and measurement consistency</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-industry"></i> Quality Control</h4>
            <p>Monitor production times and identify process improvements</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection faqs={faqData} />
    </ToolPageLayout>
  );
};

export default AverageTimeCalculator;
