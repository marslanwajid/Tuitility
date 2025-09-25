// Decimal Calculator Logic
export class DecimalCalculatorLogic {
  constructor() {
    this.resetFormData();
  }

  validateInput(value) {
    // Allow empty string, numbers, decimals, and negative numbers
    if (value === '') return true;
    
    // Check if it's a valid number (including decimals and negatives)
    const numberRegex = /^-?\d*\.?\d+$/;
    return numberRegex.test(value);
  }

  formatNumber(number) {
    if (Number.isInteger(number)) {
      return number.toString();
    }
    // Remove trailing zeros after decimal point
    return parseFloat(number.toFixed(10)).toString();
  }

  roundNumber(number, roundingFactor) {
    if (roundingFactor === 'none') return number;
    
    const factor = parseFloat(roundingFactor);
    return Math.round(number / factor) * factor;
  }

  calculate(formData) {
    try {
      const { num1, num2, operation, rounding } = formData;
      
      // Validate inputs
      if (!this.validateInput(num1) || !this.validateInput(num2)) {
        return { error: 'Please enter valid numbers' };
      }

      const number1 = parseFloat(num1);
      const number2 = parseFloat(num2);
      
      if (isNaN(number1) || isNaN(number2)) {
        return { error: 'Please enter valid numbers' };
      }

      let result;
      let steps = [];

      // Perform calculation based on operation
      switch (operation) {
        case '+':
          result = number1 + number2;
          steps.push(`Step 1: ${this.formatNumber(number1)} + ${this.formatNumber(number2)}`);
          steps.push(`Step 2: Result = ${this.formatNumber(result)}`);
          break;

        case '-':
          result = number1 - number2;
          steps.push(`Step 1: ${this.formatNumber(number1)} - ${this.formatNumber(number2)}`);
          steps.push(`Step 2: Result = ${this.formatNumber(result)}`);
          break;

        case '*':
          result = number1 * number2;
          steps.push(`Step 1: ${this.formatNumber(number1)} × ${this.formatNumber(number2)}`);
          steps.push(`Step 2: Result = ${this.formatNumber(result)}`);
          break;

        case '/':
          if (number2 === 0) {
            return { error: 'Cannot divide by zero' };
          }
          result = number1 / number2;
          steps.push(`Step 1: ${this.formatNumber(number1)} ÷ ${this.formatNumber(number2)}`);
          steps.push(`Step 2: Result = ${this.formatNumber(result)}`);
          break;

        case '^':
          result = Math.pow(number1, number2);
          steps.push(`Step 1: ${this.formatNumber(number1)}^${this.formatNumber(number2)}`);
          steps.push(`Step 2: Result = ${this.formatNumber(result)}`);
          break;

        case 'root':
          if (number2 < 0 && number1 % 2 === 0) {
            return { error: 'Even root of negative number is undefined' };
          }
          result = Math.pow(number2, 1 / number1);
          steps.push(`Step 1: ${this.formatNumber(number1)}√${this.formatNumber(number2)}`);
          steps.push(`Step 2: Result = ${this.formatNumber(result)}`);
          break;

        case 'log':
          if (number1 <= 0 || number1 === 1) {
            return { error: 'Invalid base for logarithm (must be positive and not equal to 1)' };
          }
          if (number2 <= 0) {
            return { error: 'Cannot take logarithm of non-positive number' };
          }
          result = Math.log(number2) / Math.log(number1);
          steps.push(`Step 1: log${this.formatNumber(number1)}(${this.formatNumber(number2)})`);
          steps.push(`Step 2: Result = ${this.formatNumber(result)}`);
          break;

        default:
          return { error: 'Invalid operation selected' };
      }

      // Apply rounding if selected
      let finalResult = result;
      if (rounding !== 'none') {
        const originalResult = result;
        finalResult = this.roundNumber(result, rounding);
        if (finalResult !== result) {
          steps.push(`Step 3: Rounded to ${rounding}: ${this.formatNumber(originalResult)} → ${this.formatNumber(finalResult)}`);
        }
      }

      return {
        result: {
          decimal: this.formatNumber(finalResult),
          steps: steps
        }
      };

    } catch (error) {
      console.error('Calculation error:', error);
      return { error: error.message || 'An error occurred during calculation' };
    }
  }

  resetFormData() {
    return {
      num1: '12.5',
      num2: '4.2',
      operation: '+',
      rounding: '0.01'
    };
  }
}

export default new DecimalCalculatorLogic(); 