class FractionToPercentCalculatorLogic {
  constructor() {
    this.defaultValues = {
      simple: {
        numerator: '3',
        denominator: '4'
      },
      mixed: {
        whole: '1',
        numerator: '2',
        denominator: '3'
      }
    };
  }

  resetFormData(type = 'simple') {
    if (type === 'simple') {
      return {
        numerator: this.defaultValues.simple.numerator,
        denominator: this.defaultValues.simple.denominator
      };
    } else {
      return {
        whole: this.defaultValues.mixed.whole,
        numerator: this.defaultValues.mixed.numerator,
        denominator: this.defaultValues.mixed.denominator
      };
    }
  }

  validateInput(value) {
    if (value === '') return true;
    // Allow positive numbers only
    const pattern = /^[0-9]*\.?[0-9]+$/;
    return pattern.test(value);
  }

  validateCalculation(formData, type = 'simple') {
    if (type === 'simple') {
      const numerator = parseFloat(formData.numerator);
      const denominator = parseFloat(formData.denominator);

      if (isNaN(numerator) || isNaN(denominator)) {
        return { valid: false, error: 'Please enter valid numbers' };
      }

      if (denominator === 0) {
        return { valid: false, error: 'Denominator cannot be zero' };
      }

      return { 
        valid: true, 
        numerator, 
        denominator,
        whole: 0
      };
    } else {
      const whole = parseFloat(formData.whole) || 0;
      const numerator = parseFloat(formData.numerator);
      const denominator = parseFloat(formData.denominator);

      if (isNaN(numerator) || isNaN(denominator)) {
        return { valid: false, error: 'Please enter valid numbers' };
      }

      if (denominator === 0) {
        return { valid: false, error: 'Denominator cannot be zero' };
      }

      return { 
        valid: true, 
        numerator, 
        denominator,
        whole
      };
    }
  }

  formatDecimal(number) {
    if (!isFinite(number)) {
      return 'Undefined';
    }
    
    // Round to 4 decimal places and remove trailing zeros
    let str = number.toFixed(4);
    str = str.replace(/\.?0+$/, "");
    return str;
  }

  generateSteps(numerator, denominator, whole = 0, type = 'simple') {
    const steps = [];
    let inputDisplay = '';
    let finalNumerator = numerator;

    if (type === 'simple') {
      inputDisplay = `${numerator}/${denominator}`;
      steps.push(`Start with fraction: ${numerator}/${denominator}`);
    } else {
      inputDisplay = `${whole} ${numerator}/${denominator}`;
      steps.push(`Start with mixed number: ${whole} ${numerator}/${denominator}`);
      
      // Convert to improper fraction
      finalNumerator = (whole * denominator) + numerator;
      steps.push(`Convert to improper fraction: (${whole} × ${denominator}) + ${numerator} = ${finalNumerator}/${denominator}`);
    }

    // Calculate decimal
    const decimal = finalNumerator / denominator;
    steps.push(`Divide: ${finalNumerator} ÷ ${denominator} = ${this.formatDecimal(decimal)}`);
    
    // Calculate percentage
    const percentage = decimal * 100;
    steps.push(`Multiply by 100: ${this.formatDecimal(decimal)} × 100 = ${this.formatDecimal(percentage)}%`);

    return {
      steps,
      inputDisplay,
      decimal: this.formatDecimal(decimal),
      percentage: this.formatDecimal(percentage)
    };
  }

  calculate(formData, type = 'simple') {
    const validation = this.validateCalculation(formData, type);
    
    if (!validation.valid) {
      return {
        error: validation.error,
        result: null,
        steps: [],
        inputDisplay: '',
        decimal: '',
        percentage: ''
      };
    }

    try {
      const { numerator, denominator, whole } = validation;
      const stepResult = this.generateSteps(numerator, denominator, whole, type);
      
      return {
        result: {
          inputDisplay: stepResult.inputDisplay,
          decimal: stepResult.decimal,
          percentage: stepResult.percentage,
          steps: stepResult.steps
        },
        steps: stepResult.steps,
        inputDisplay: stepResult.inputDisplay,
        decimal: stepResult.decimal,
        percentage: stepResult.percentage,
        error: null
      };
    } catch (error) {
      return {
        error: error.message || 'An error occurred during calculation',
        result: null,
        steps: [],
        inputDisplay: '',
        decimal: '',
        percentage: ''
      };
    }
  }
}

export default new FractionToPercentCalculatorLogic();
