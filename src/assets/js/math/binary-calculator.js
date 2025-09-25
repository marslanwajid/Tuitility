// Binary Calculator Logic
export class BinaryCalculatorLogic {
  constructor() {
    this.formData = {
      firstNumber: '101010',
      secondNumber: '11011',
      operator: '+',
      firstNumberType: 'binary',
      secondNumberType: 'binary'
    };
  }

  // Input validation for different number systems
  validateInput(value, type) {
    let pattern;
    switch(type) {
      case 'binary':
        pattern = /^[01]*$/;
        break;
      case 'decimal':
        pattern = /^\d*$/;
        break;
      case 'hexadecimal':
        pattern = /^[0-9A-Fa-f]*$/;
        break;
      case 'octal':
        pattern = /^[0-7]*$/;
        break;
      default:
        return true;
    }
    return pattern.test(value);
  }

  // Convert number to decimal
  convertToDecimal(number, type) {
    try {
      if (!number || number.trim() === '') return null;
      
      number = number.trim();
      
      switch(type) {
        case 'binary':
          if (!/^[01]+$/.test(number)) return null;
          return parseInt(number, 2);
        case 'decimal':
          if (!/^\d+$/.test(number)) return null;
          return parseInt(number, 10);
        case 'hexadecimal':
          if (!/^[0-9A-Fa-f]+$/.test(number)) return null;
          return parseInt(number, 16);
        case 'octal':
          if (!/^[0-7]+$/.test(number)) return null;
          return parseInt(number, 8);
        default:
          return null;
      }
    } catch (error) {
      console.error('Conversion error:', error);
      return null;
    }
  }

  // Format binary with spaces
  formatBinary(binary) {
    return binary.replace(/\B(?=(\d{4})+(?!\d))/g, " ");
  }

  // Format decimal with commas
  formatDecimal(decimal) {
    return decimal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Main calculation function
  calculate(formData) {
    try {
      const { firstNumber, secondNumber, operator, firstNumberType, secondNumberType } = formData;

      if (!firstNumber) {
        return { error: "Please enter the first number" };
      }

      if (operator !== 'NOT' && !secondNumber) {
        return { error: "Please enter the second number" };
      }

      // Convert inputs to decimal for calculation
      const num1 = this.convertToDecimal(firstNumber, firstNumberType);
      const num2 = operator !== 'NOT' ? this.convertToDecimal(secondNumber, secondNumberType) : 0;

      if (num1 === null) {
        return { error: `Invalid ${firstNumberType} number: ${firstNumber}` };
      }

      if (operator !== 'NOT' && num2 === null) {
        return { error: `Invalid ${secondNumberType} number: ${secondNumber}` };
      }

      let result;
      let steps = [];

      // Format the steps
      steps.push('Step 1: Convert inputs to decimal');
      steps.push(`${firstNumber}(${firstNumberType}) = ${num1}(decimal)`);
      if (operator !== 'NOT') {
        steps.push(`${secondNumber}(${secondNumberType}) = ${num2}(decimal)`);
      }

      steps.push('Step 2: Perform operation');
      
      switch(operator) {
        case '+':
          result = num1 + num2;
          steps.push(`${num1} + ${num2} = ${result}`);
          break;
        case '-':
          result = num1 - num2;
          steps.push(`${num1} - ${num2} = ${result}`);
          break;
        case '*':
          result = num1 * num2;
          steps.push(`${num1} × ${num2} = ${result}`);
          break;
        case '/':
          if (num2 === 0) {
            throw new Error("Cannot divide by zero!");
          }
          result = Math.floor(num1 / num2);
          steps.push(`${num1} ÷ ${num2} = ${result} (integer division)`);
          break;
        case 'AND':
          result = num1 & num2;
          steps.push(`${num1.toString(2)} AND ${num2.toString(2)} = ${result.toString(2)}`);
          steps.push(`Decimal result: ${result}`);
          break;
        case 'OR':
          result = num1 | num2;
          steps.push(`${num1.toString(2)} OR ${num2.toString(2)} = ${result.toString(2)}`);
          steps.push(`Decimal result: ${result}`);
          break;
        case 'XOR':
          result = num1 ^ num2;
          steps.push(`${num1.toString(2)} XOR ${num2.toString(2)} = ${result.toString(2)}`);
          steps.push(`Decimal result: ${result}`);
          break;
        case 'NOT':
          const bitWidth = Math.max(8, Math.ceil(Math.log2(num1 + 1)));
          const mask = (1 << bitWidth) - 1;
          result = (~num1) & mask;
          let binary = num1.toString(2).padStart(bitWidth, '0');
          let resultBinary = result.toString(2).padStart(bitWidth, '0');
          steps.push(`NOT ${binary} = ${resultBinary} (${bitWidth}-bit)`);
          steps.push(`Decimal result: ${result}`);
          break;
      }

      // Handle negative results for display
      const displayResult = result;
      const binaryResult = result < 0 ? 
        (result >>> 0).toString(2) : 
        result.toString(2);

      return {
        success: true,
        result: {
          binary: this.formatBinary(binaryResult),
          decimal: this.formatDecimal(displayResult),
          hexadecimal: `0x${(result >>> 0).toString(16).toUpperCase()}`,
          octal: `0${(result >>> 0).toString(8)}`,
          steps: steps
        }
      };

    } catch (error) {
      console.error('Calculation error:', error);
      return { error: 'Error: ' + error.message };
    }
  }

  // Reset form data
  resetFormData() {
    return {
      firstNumber: '101010',
      secondNumber: '11011',
      operator: '+',
      firstNumberType: 'binary',
      secondNumberType: 'binary'
    };
  }
}

// Export default instance
export default new BinaryCalculatorLogic(); 