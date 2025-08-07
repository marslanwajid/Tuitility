class ComparingFractionsCalculatorLogic {
  constructor() {
    this.defaultValue = {
      firstValue: '3/4',
      secondValue: '2/3'
    };
  }

  resetFormData() {
    return {
      firstValue: this.defaultValue.firstValue,
      secondValue: this.defaultValue.secondValue
    };
  }

  validateInput(value) {
    if (value === '') return true;
    // Allow fractions, mixed numbers, decimals, and percentages
    const pattern = /^[-+]?(\d*\.?\d+%?|\d+\/\d+|\d+\s+\d+\/\d+)$/;
    return pattern.test(value);
  }

  parseValue(value) {
    try {
      value = value.trim();
      if (!value) {
        throw new Error('Empty value provided');
      }

      if (value.includes('%')) {
        const percentValue = parseFloat(value.replace('%', ''));
        if (isNaN(percentValue)) {
          throw new Error('Invalid percentage format');
        }
        return percentValue / 100;
      } else if (value.includes('/')) {
        const parts = value.split(' ');
        let whole = 0, num = 0, den = 1;
        
        if (parts.length === 2) {
          // Mixed number (e.g., "2 3/5")
          whole = parseInt(parts[0]);
          if (isNaN(whole)) {
            throw new Error('Invalid whole number in mixed fraction');
          }
          
          const fraction = parts[1].split('/');
          if (fraction.length !== 2) {
            throw new Error('Invalid fraction format in mixed number');
          }
          
          num = parseInt(fraction[0]);
          den = parseInt(fraction[1]);
          
          if (isNaN(num) || isNaN(den) || den === 0) {
            throw new Error('Invalid numerator or denominator in mixed fraction');
          }
          
          return whole + (num / den);
        } else {
          // Simple fraction (e.g., "3/4")
          const fraction = parts[0].split('/');
          if (fraction.length !== 2) {
            throw new Error('Invalid fraction format');
          }
          
          num = parseInt(fraction[0]);
          den = parseInt(fraction[1]);
          
          if (isNaN(num) || isNaN(den) || den === 0) {
            throw new Error('Invalid numerator or denominator');
          }
          
          return num / den;
        }
      } else {
        // Decimal number
        const decimal = parseFloat(value);
        if (isNaN(decimal)) {
          throw new Error('Invalid decimal number');
        }
        return decimal;
      }
    } catch (error) {
      throw new Error(`Error parsing "${value}": ${error.message}`);
    }
  }

  validateCalculation(formData) {
    const firstValueInput = formData.firstValue.trim();
    const secondValueInput = formData.secondValue.trim();

    if (!firstValueInput) {
      return { valid: false, error: 'Please enter the first value' };
    }

    if (!secondValueInput) {
      return { valid: false, error: 'Please enter the second value' };
    }

    try {
      const firstDecimal = this.parseValue(firstValueInput);
      const secondDecimal = this.parseValue(secondValueInput);

      return { 
        valid: true, 
        firstValue: firstValueInput,
        secondValue: secondValueInput,
        firstDecimal, 
        secondDecimal 
      };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  generateSteps(firstValue, secondValue, firstDecimal, secondDecimal) {
    const steps = [];
    
    steps.push('Step 1: Convert both values to decimal form');
    steps.push(`First value: ${firstValue} = ${firstDecimal.toFixed(6)}`);
    steps.push(`Second value: ${secondValue} = ${secondDecimal.toFixed(6)}`);
    
    steps.push('');
    steps.push('Step 2: Compare the decimal values');
    
    let comparison = '';
    let comparisonSymbol = '';
    
    if (Math.abs(firstDecimal - secondDecimal) < 0.0000001) {
      // Handle floating point precision issues
      comparison = `${firstValue} = ${secondValue}`;
      comparisonSymbol = '=';
      steps.push(`Since ${firstDecimal.toFixed(6)} = ${secondDecimal.toFixed(6)}, the values are equal`);
    } else if (firstDecimal > secondDecimal) {
      comparison = `${firstValue} > ${secondValue}`;
      comparisonSymbol = '>';
      steps.push(`Since ${firstDecimal.toFixed(6)} > ${secondDecimal.toFixed(6)}, the first value is larger`);
    } else {
      comparison = `${firstValue} < ${secondValue}`;
      comparisonSymbol = '<';
      steps.push(`Since ${firstDecimal.toFixed(6)} < ${secondDecimal.toFixed(6)}, the second value is larger`);
    }

    steps.push('');
    steps.push('Step 3: Final result');
    steps.push(comparison);

    return {
      steps,
      comparison,
      comparisonSymbol,
      firstDecimal,
      secondDecimal
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
        comparisonSymbol: null,
        firstDecimal: null,
        secondDecimal: null
      };
    }

    try {
      const { firstValue, secondValue, firstDecimal, secondDecimal } = validation;
      const stepResult = this.generateSteps(firstValue, secondValue, firstDecimal, secondDecimal);
      
      return {
        result: {
          firstValue,
          secondValue,
          firstDecimal,
          secondDecimal,
          comparison: stepResult.comparison,
          comparisonSymbol: stepResult.comparisonSymbol
        },
        steps: stepResult.steps,
        comparison: stepResult.comparison,
        comparisonSymbol: stepResult.comparisonSymbol,
        firstDecimal: stepResult.firstDecimal,
        secondDecimal: stepResult.secondDecimal,
        error: null
      };
    } catch (error) {
      return {
        error: error.message || 'An error occurred during calculation',
        result: null,
        steps: [],
        comparison: null,
        comparisonSymbol: null,
        firstDecimal: null,
        secondDecimal: null
      };
    }
  }
}

export default new ComparingFractionsCalculatorLogic();
