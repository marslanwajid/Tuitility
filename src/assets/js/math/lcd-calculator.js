class LCDCalculatorLogic {
  constructor() {
    this.defaultValue = '1/4, 1/6, 1/8';
  }

  resetFormData() {
    return {
      numbers: this.defaultValue
    };
  }

  validateInput(value) {
    if (value === '') return true;
    const fractions = value.split(',').map(str => str.trim());
    return fractions.every(fraction => this.isValidFraction(fraction));
  }

  isValidFraction(str) {
    try {
      this.parseFraction(str);
      return true;
    } catch (error) {
      return false;
    }
  }

  validateCalculation(formData) {
    const numbersInput = formData.numbers.trim();
    if (!numbersInput) {
      return { valid: false, error: 'Please enter some numbers or fractions' };
    }

    const inputArray = numbersInput.split(',');
    if (inputArray.length < 2) {
      return { valid: false, error: 'Please enter at least 2 numbers or fractions separated by commas' };
    }

    try {
      const fractions = inputArray.map(str => this.parseFraction(str.trim()));
      return { valid: true, fractions };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  findGCD(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      let t = b;
      b = a % b;
      a = t;
    }
    return a;
  }

  findLCM(a, b) {
    return Math.abs(a * b) / this.findGCD(a, b);
  }

  findLCMOfArray(arr) {
    let lcm = arr[0];
    for (let i = 1; i < arr.length; i++) {
      lcm = this.findLCM(lcm, arr[i]);
    }
    return lcm;
  }

  parseFraction(str) {
    try {
      str = str.trim();
      let whole = 0, num = 0, den = 1;

      if (str.includes(' ')) {
        // Mixed number
        let parts = str.split(' ');
        whole = parseInt(parts[0]);
        let fraction = parts[1].split('/');
        num = parseInt(fraction[0]);
        den = parseInt(fraction[1]);
        num = whole * den + num;
      } else if (str.includes('/')) {
        // Fraction
        let parts = str.split('/');
        num = parseInt(parts[0]);
        den = parseInt(parts[1]);
      } else {
        // Whole number
        num = parseInt(str);
        den = 1;
      }

      // Validate the result
      if (isNaN(num) || isNaN(den) || den === 0) {
        throw new Error('Invalid fraction');
      }

      return { numerator: num, denominator: den };
    } catch (error) {
      throw new Error(`Invalid input: "${str}"`);
    }
  }

  formatFraction(fraction) {
    if (fraction.denominator === 1) {
      return fraction.numerator.toString();
    }
    return `${fraction.numerator}/${fraction.denominator}`;
  }

  formatOriginalInput(fraction) {
    if (fraction.denominator === 1) {
      return fraction.numerator.toString();
    }
    const whole = Math.floor(fraction.numerator / fraction.denominator);
    const remainder = fraction.numerator % fraction.denominator;
    if (whole > 0 && remainder > 0) {
      return `${whole} ${remainder}/${fraction.denominator}`;
    }
    return `${fraction.numerator}/${fraction.denominator}`;
  }

  formatFractionForDisplay(fraction) {
    if (fraction.denominator === 1) {
      return fraction.numerator.toString();
    }
    return `\\frac{${fraction.numerator}}{${fraction.denominator}}`;
  }

  formatOriginalInputForDisplay(fraction) {
    if (fraction.denominator === 1) {
      return fraction.numerator.toString();
    }
    const whole = Math.floor(fraction.numerator / fraction.denominator);
    const remainder = fraction.numerator % fraction.denominator;
    if (whole > 0 && remainder > 0) {
      return `${whole}\\;\\frac{${remainder}}{${fraction.denominator}}`;
    }
    return `\\frac{${fraction.numerator}}{${fraction.denominator}}`;
  }

  generateSteps(fractions, lcd, equivalentFractions) {
    const steps = [
      'Step 1: Rewrite the input values as fractions:',
      `\\[${fractions.map(f => this.formatFractionForDisplay(f)).join(',\\;')}\\]`,
      '',
      'Step 2: Find the least common multiple of the denominators:',
      `Denominators: ${fractions.map(f => f.denominator).join(', ')}`,
      `\\[\\text{LCD} = \\text{LCM}(${fractions.map(f => f.denominator).join(', ')}) = ${lcd}\\]`,
      '',
      'Step 3: Convert each fraction to have the LCD as denominator:'
    ];

    equivalentFractions.forEach(ef => {
      const originalStr = this.formatOriginalInputForDisplay(ef.original);
      steps.push(
        `\\[${originalStr} = ${this.formatFractionForDisplay(ef.original)} \\times \\frac{${ef.multiplier}}{${ef.multiplier}} = \\frac{${ef.result.numerator}}{${ef.result.denominator}}\\]`
      );
    });

    return steps;
  }

  calculate(formData) {
    const validation = this.validateCalculation(formData);
    
    if (!validation.valid) {
      return {
        error: validation.error,
        result: null,
        steps: [],
        equivalentFractions: []
      };
    }

    try {
      const fractions = validation.fractions;
      
      // Get all denominators
      const denominators = fractions.map(f => f.denominator);
      
      // Calculate LCD
      const lcd = this.findLCMOfArray(denominators);
      
      // Calculate equivalent fractions
      const equivalentFractions = fractions.map(f => {
        const multiplier = lcd / f.denominator;
        return {
          original: f,
          multiplier: multiplier,
          result: {
            numerator: f.numerator * multiplier,
            denominator: lcd
          }
        };
      });

      // Generate steps
      const steps = this.generateSteps(fractions, lcd, equivalentFractions);

      return {
        result: lcd,
        steps: steps,
        equivalentFractions: equivalentFractions,
        fractions: fractions,
        error: null
      };
    } catch (error) {
      return {
        error: error.message || 'An error occurred during calculation',
        result: null,
        steps: [],
        equivalentFractions: []
      };
    }
  }
}

export default new LCDCalculatorLogic();
