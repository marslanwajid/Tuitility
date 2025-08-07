class ComparingDecimalsCalculatorLogic {
  constructor() {
    this.defaultValue = {
      firstDecimal: '3.14',
      secondDecimal: '2.71'
    };
  }

  resetFormData() {
    return {
      firstDecimal: this.defaultValue.firstDecimal,
      secondDecimal: this.defaultValue.secondDecimal
    };
  }

  validateInput(value) {
    if (value === '') return true;
    // Allow numbers, decimal point, and negative sign
    const pattern = /^-?\d*\.?\d*$/;
    return pattern.test(value);
  }

  validateCalculation(formData) {
    const firstDecimalInput = formData.firstDecimal.trim();
    const secondDecimalInput = formData.secondDecimal.trim();

    if (!firstDecimalInput) {
      return { valid: false, error: 'Please enter the first decimal number' };
    }

    if (!secondDecimalInput) {
      return { valid: false, error: 'Please enter the second decimal number' };
    }

    const firstDecimal = parseFloat(firstDecimalInput);
    const secondDecimal = parseFloat(secondDecimalInput);

    if (isNaN(firstDecimal)) {
      return { valid: false, error: 'Please enter a valid first decimal number' };
    }

    if (isNaN(secondDecimal)) {
      return { valid: false, error: 'Please enter a valid second decimal number' };
    }

    return { valid: true, firstDecimal, secondDecimal };
  }

  generateSteps(firstDecimal, secondDecimal) {
    const steps = [];
    
    steps.push('Step 1: Identify the decimal numbers');
    steps.push(`First decimal: ${firstDecimal}`);
    steps.push(`Second decimal: ${secondDecimal}`);
    
    steps.push('');
    steps.push('Step 2: Compare the numbers');
    
    if (firstDecimal !== secondDecimal) {
      const diff = Math.abs(firstDecimal - secondDecimal);
      steps.push(`Difference: |${firstDecimal} - ${secondDecimal}| = ${diff}`);
      
      if (firstDecimal > secondDecimal) {
        steps.push(`Since ${firstDecimal} > ${secondDecimal}, the first number is larger`);
      } else {
        steps.push(`Since ${firstDecimal} < ${secondDecimal}, the second number is larger`);
      }
    } else {
      steps.push(`Both numbers are exactly equal: ${firstDecimal} = ${secondDecimal}`);
    }

    steps.push('');
    steps.push('Step 3: Final result');
    
    let comparison = '';
    let symbol = '';
    let explanation = '';

    if (firstDecimal > secondDecimal) {
      comparison = `${firstDecimal} > ${secondDecimal}`;
      symbol = '>';
      explanation = `${firstDecimal} is greater than ${secondDecimal}`;
    } else if (firstDecimal < secondDecimal) {
      comparison = `${firstDecimal} < ${secondDecimal}`;
      symbol = '<';
      explanation = `${firstDecimal} is less than ${secondDecimal}`;
    } else {
      comparison = `${firstDecimal} = ${secondDecimal}`;
      symbol = '=';
      explanation = `${firstDecimal} is equal to ${secondDecimal}`;
    }

    steps.push(explanation);
    steps.push(`Mathematical representation: ${firstDecimal} ${symbol} ${secondDecimal}`);

    return {
      steps,
      comparison,
      symbol,
      explanation,
      difference: Math.abs(firstDecimal - secondDecimal)
    };
  }

  calculate(formData) {
    const validation = this.validateCalculation(formData);
    
    if (!validation.valid) {
      return {
        error: validation.error,
        result: null,
        steps: [],
        comparison: null,
        symbol: null,
        explanation: null,
        difference: null
      };
    }

    try {
      const { firstDecimal, secondDecimal } = validation;
      const stepResult = this.generateSteps(firstDecimal, secondDecimal);
      
      return {
        result: {
          firstDecimal,
          secondDecimal,
          comparison: stepResult.comparison,
          explanation: stepResult.explanation,
          symbol: stepResult.symbol,
          difference: stepResult.difference
        },
        steps: stepResult.steps,
        comparison: stepResult.comparison,
        symbol: stepResult.symbol,
        explanation: stepResult.explanation,
        difference: stepResult.difference,
        error: null
      };
    } catch (error) {
      return {
        error: error.message || 'An error occurred during calculation',
        result: null,
        steps: [],
        comparison: null,
        symbol: null,
        explanation: null,
        difference: null
      };
    }
  }
}

export default new ComparingDecimalsCalculatorLogic();
