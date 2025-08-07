console.log('Fraction to percent calculator script loaded');

window.addEventListener('error', function(event) {
  console.error('Caught unhandled error:', event.error);
});

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded');
  
  const fractionToPercentForm = document.getElementById('calculator-form');
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  // Set default values
  setDefaultValues();

  // Tab switching functionality
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.getAttribute('data-tab');
      
      // Remove active class from all buttons and tabs
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked button and corresponding tab
      button.classList.add('active');
      const targetTab = document.getElementById(tabId);
      if (targetTab) {
        targetTab.classList.add('active');
      }
      
      // Reset form and hide results when switching tabs
      if (fractionToPercentForm) {
        fractionToPercentForm.reset();
        setDefaultValues();
        hideResult();
      }
    });
  });

  console.log('Form found:', !!fractionToPercentForm);
  
  if (fractionToPercentForm) {
    fractionToPercentForm.addEventListener('submit', function(e) {
      e.preventDefault();
      console.log('Form submitted');
      
      try {
        const activeTab = document.querySelector('.tab-content.active');
        if (!activeTab) {
          throw new Error('No active tab found');
        }
        
        const result = calculateFractionToPercent(activeTab);
        displayResult(result);
      } catch (error) {
        console.error('Error in form submission:', error);
        displayError('Calculation error. Please check your inputs and try again.');
      }
    });

    fractionToPercentForm.addEventListener('reset', function() {
      setTimeout(() => {
        setDefaultValues();
        hideResult();
      }, 10);
    });
  }

  // Set default values for demonstration
  function setDefaultValues() {
    try {
      const activeTab = document.querySelector('.tab-content.active');
      if (!activeTab) return;
      
      const tabId = activeTab.id;
      
      if (tabId === 'tab-1') {
        // Simple fraction: 3/4
        const numeratorInput = activeTab.querySelector('[name="numerator"]');
        const denominatorInput = activeTab.querySelector('[name="denominator"]');
        
        if (numeratorInput && denominatorInput) {
          numeratorInput.value = '3';
          denominatorInput.value = '4';
        }
      } else if (tabId === 'tab-2') {
        // Mixed number: 1 2/3
        const wholeInput = activeTab.querySelector('[name="whole"]');
        const numeratorInput = activeTab.querySelector('[name="numerator"]');
        const denominatorInput = activeTab.querySelector('[name="denominator"]');
        
        if (wholeInput && numeratorInput && denominatorInput) {
          wholeInput.value = '1';
          numeratorInput.value = '2';
          denominatorInput.value = '3';
        }
      }
    } catch (error) {
      console.error('Error setting default values:', error);
    }
  }

  // Calculation functions
  function calculateFractionToPercent(activeTab) {
    const tabId = activeTab.id;
    let numerator, denominator, whole = 0;
    let steps = [];
    let inputDisplay = '';

    if (tabId === 'tab-1') {
      // Simple fraction
      numerator = parseFloat(activeTab.querySelector('[name="numerator"]').value);
      denominator = parseFloat(activeTab.querySelector('[name="denominator"]').value);
      
      if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
        throw new Error('Please enter valid numbers. Denominator cannot be zero.');
      }
      
      inputDisplay = `${numerator}/${denominator}`;
      steps.push(`Start with fraction: ${numerator}/${denominator}`);
      
    } else if (tabId === 'tab-2') {
      // Mixed number
      whole = parseFloat(activeTab.querySelector('[name="whole"]').value) || 0;
      numerator = parseFloat(activeTab.querySelector('[name="numerator"]').value);
      denominator = parseFloat(activeTab.querySelector('[name="denominator"]').value);
      
      if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
        throw new Error('Please enter valid numbers. Denominator cannot be zero.');
      }
      
      inputDisplay = `${whole} ${numerator}/${denominator}`;
      steps.push(`Start with mixed number: ${whole} ${numerator}/${denominator}`);
      
      // Convert to improper fraction
      const improperNumerator = (whole * denominator) + numerator;
      steps.push(`Convert to improper fraction: (${whole} × ${denominator}) + ${numerator} = ${improperNumerator}/${denominator}`);
      
      numerator = improperNumerator;
    }

    // Calculate decimal
    const decimal = numerator / denominator;
    steps.push(`Divide: ${numerator} ÷ ${denominator} = ${formatDecimal(decimal)}`);
    
    // Calculate percentage
    const percentage = decimal * 100;
    steps.push(`Multiply by 100: ${formatDecimal(decimal)} × 100 = ${formatDecimal(percentage)}%`);

    return {
      inputDisplay: inputDisplay,
      percentage: formatDecimal(percentage),
      decimal: formatDecimal(decimal),
      steps: steps
    };
  }

  function formatDecimal(number) {
    if (!isFinite(number)) {
      return 'Undefined';
    }
    
    // Round to 4 decimal places and remove trailing zeros
    let str = number.toFixed(4);
    str = str.replace(/\.?0+$/, "");
    return str;
  }

  function displayResult(result) {
    try {
      const resultSection = document.getElementById('result-section');
      const percentageValue = document.getElementById('percentage-value');
      const decimalValue = document.getElementById('decimal-value');
      const stepsContainer = document.getElementById('steps');
      
      if (!resultSection || !percentageValue || !decimalValue || !stepsContainer) {
        throw new Error('Result display elements not found');
      }

      // Show result section
      resultSection.style.display = 'block';
      
      // Display main results
      percentageValue.textContent = `${result.percentage}%`;
      decimalValue.textContent = result.decimal;
      
      // Display calculation steps
      stepsContainer.innerHTML = result.steps
        .map(step => `<div class="step">${step}</div>`)
        .join('');
      
      // Scroll to results
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
    } catch (error) {
      console.error('Error displaying result:', error);
      displayError('Error displaying results');
    }
  }

  function displayError(message) {
    try {
      const resultSection = document.getElementById('result-section');
      const percentageValue = document.getElementById('percentage-value');
      const decimalValue = document.getElementById('decimal-value');
      
      if (resultSection && percentageValue && decimalValue) {
        resultSection.style.display = 'block';
        percentageValue.innerHTML = `<span style="color: #e74c3c; font-weight: bold;">${message}</span>`;
        decimalValue.textContent = '';
        
        const stepsContainer = document.getElementById('steps');
        if (stepsContainer) {
          stepsContainer.innerHTML = '';
        }
      }
    } catch (error) {
      console.error('Error displaying error message:', error);
    }
  }

  function hideResult() {
    try {
      const resultSection = document.getElementById('result-section');
      if (resultSection) {
        resultSection.style.display = 'none';
      }
    } catch (error) {
      console.error('Error hiding result:', error);
    }
  }

  // Input validation and formatting
  document.addEventListener('input', function(e) {
    if (e.target.classList.contains('input-field')) {
      // Ensure positive numbers only
      let value = e.target.value.replace(/[^0-9.]/g, '');
      
      // Special handling for denominators (cannot be 0)
      if (e.target.classList.contains('bottom') && value === '0') {
        value = '1';
      }
      
      e.target.value = value;
    }
  });

  // Performance optimization for scroll events
  let ticking = false;
  function handleScroll() {
    // Scroll handling code if needed
  }
  
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  });
});
