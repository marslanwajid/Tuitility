class DecimalToFractionCalculatorLogic {
  constructor() {
    this.defaultValue = '0.75';
  }

  resetFormData() {
    return {
      decimalInput: this.defaultValue
    };
  }

  validateInput(value) {
    if (value === '') return true;
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num);
  }

  validateCalculation(formData) {
    const inputValue = formData.decimalInput.trim();
    if (!inputValue) {
      return { valid: false, error: 'Please enter a decimal number' };
    }

    const decimal = parseFloat(inputValue);
    if (isNaN(decimal)) {
      return { valid: false, error: 'Please enter a valid decimal number' };
    }

    if (!isFinite(decimal)) {
      return { valid: false, error: 'Please enter a finite decimal number' };
    }

    return { valid: true, decimal };
  }

  gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }

  decimalToFraction(decimal) {
    try {
      // Handle negative numbers
      const isNegative = decimal < 0;
      decimal = Math.abs(decimal);

      // Convert to string to count decimal places
      const decimalStr = decimal.toString();
      const decimalPlaces = decimalStr.includes('.') ? 
          decimalStr.split('.')[1].length : 0;

      // Convert to whole number
      const denominator = Math.pow(10, decimalPlaces);
      const numerator = decimal * denominator;

      // Find GCD to simplify
      const divisor = this.gcd(numerator, denominator);

      // Create simplified fraction
      const simplifiedNum = numerator / divisor;
      const simplifiedDen = denominator / divisor;

      // Convert to mixed number if applicable
      const wholePart = Math.floor(simplifiedNum / simplifiedDen);
      const remainder = simplifiedNum % simplifiedDen;

      return {
        original: {
          numerator: Math.round(numerator),
          denominator: denominator
        },
        simplified: {
          numerator: Math.round(simplifiedNum),
          denominator: Math.round(simplifiedDen)
        },
        mixed: {
          whole: wholePart,
          numerator: remainder,
          denominator: Math.round(simplifiedDen)
        },
        isNegative: isNegative,
        decimalInput: isNegative ? -decimal : decimal
      };
    } catch (error) {
      console.error('Error in decimalToFraction:', error);
      throw new Error('Failed to convert decimal to fraction');
    }
  }

  formatFraction(fraction) {
    const sign = fraction.isNegative ? '-' : '';
    return {
      original: `${sign}${fraction.original.numerator}/${fraction.original.denominator}`,
      simplified: `${sign}${fraction.simplified.numerator}/${fraction.simplified.denominator}`,
      mixed: fraction.mixed.whole === 0 ? 
             `${sign}${fraction.simplified.numerator}/${fraction.simplified.denominator}` :
             (fraction.mixed.numerator === 0 ?
              `${sign}${fraction.mixed.whole}` :
              `${sign}${fraction.mixed.whole} ${fraction.mixed.numerator}/${fraction.mixed.denominator}`)
    };
  }

  generateSteps(decimal, fraction) {
    const steps = [];
    const absDecimal = Math.abs(decimal);
    const decimalStr = absDecimal.toString();
    const decimalPlaces = decimalStr.includes('.') ? decimalStr.split('.')[1].length : 0;
    
    steps.push(`Input decimal = ${decimal}`);
    
    if (decimalPlaces > 0) {
      steps.push(`Count decimal places = ${decimalPlaces}`);
      steps.push(`Multiply by 10^${decimalPlaces} = ${Math.pow(10, decimalPlaces)}`);
      steps.push(`Initial fraction = ${fraction.original.numerator}/${fraction.original.denominator}`);
      
      if (fraction.original.numerator !== fraction.simplified.numerator) {
        const divisor = this.gcd(fraction.original.numerator, fraction.original.denominator);
        steps.push(`Find GCD(${fraction.original.numerator}, ${fraction.original.denominator}) = ${divisor}`);
        steps.push(`Simplify = ${fraction.simplified.numerator}/${fraction.simplified.denominator}`);
      } else {
        steps.push(`Fraction is already in simplest form`);
      }
      
      if (fraction.mixed.whole > 0) {
        steps.push(`Convert to mixed number = ${this.formatFraction(fraction).mixed}`);
      }
    } else {
      steps.push(`Whole number = ${decimal}/1`);
    }
    
    return steps;
  }

  calculate(formData) {
    const validation = this.validateCalculation(formData);
    
    if (!validation.valid) {
      return {
        error: validation.error,
        result: null,
        steps: []
      };
    }

    try {
      const decimal = validation.decimal;
      const fraction = this.decimalToFraction(decimal);
      const formattedFraction = this.formatFraction(fraction);
      const steps = this.generateSteps(decimal, fraction);

      return {
        result: {
          original: formattedFraction.original,
          simplified: formattedFraction.simplified,
          mixed: formattedFraction.mixed,
          decimal: decimal
        },
        steps: steps,
        error: null
      };
    } catch (error) {
      return {
        error: error.message || 'An error occurred during conversion',
        result: null,
        steps: []
      };
    }
  }
}

export default new DecimalToFractionCalculatorLogic();
