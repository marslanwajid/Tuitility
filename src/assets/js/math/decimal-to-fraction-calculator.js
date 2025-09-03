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
    if (value === '') return false;
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num);
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
        decimalInput: isNegative ? -decimal : decimal,
        decimalPlaces: decimalPlaces,
        divisor: divisor
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
        steps.push(`Find GCD(${fraction.original.numerator}, ${fraction.original.denominator}) = ${fraction.divisor}`);
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
    let result, steps, error, formattedFraction;

    try {
      const inputValue = formData.decimalInput.trim();
      
      if (!inputValue) {
        error = 'Please enter a decimal number.';
        return { result, steps, error, formattedFraction };
      }

      const decimal = parseFloat(inputValue);
      
      if (isNaN(decimal)) {
        error = 'Please enter a valid decimal number.';
        return { result, steps, error, formattedFraction };
      }

      if (!isFinite(decimal)) {
        error = 'Please enter a finite decimal number.';
        return { result, steps, error, formattedFraction };
      }

      const fraction = this.decimalToFraction(decimal);
      formattedFraction = this.formatFraction(fraction);
      steps = this.generateSteps(decimal, fraction);

      result = {
        decimal: decimal,
        fraction: fraction,
        formatted: formattedFraction
      };

    } catch (err) {
      error = 'An error occurred during calculation.';
      console.error('Calculation error:', err);
    }

    return {
      result,
      steps,
      error,
      formattedFraction
    };
  }

  getCalculationTypeLabel(value) {
    return 'Decimal to Fraction Conversion';
  }
}

export default new DecimalToFractionCalculatorLogic();
