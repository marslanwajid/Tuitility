class PercentageCalculatorLogic {
  constructor() {
    this.calculationTypes = [
      { value: 'percent-of', label: 'What is P% of X?' },
      { value: 'y-percent-of-x', label: 'Y is what % of X?' },
      { value: 'y-is-p-of-what', label: 'Y is P% of what?' },
      { value: 'what-percent-of-x-is-y', label: 'What % of X is Y?' },
      { value: 'p-of-what-is-y', label: 'P% of what is Y?' },
      { value: 'y-out-of-what-is-p', label: 'Y out of what is P%?' },
      { value: 'what-out-of-x-is-p', label: 'What out of X is P%?' },
      { value: 'y-out-of-x-is-what', label: 'Y out of X is what %?' },
      { value: 'x-plus-p-is-what', label: 'X plus P% is what?' },
      { value: 'x-plus-what-is-y', label: 'X plus what % is Y?' },
      { value: 'what-plus-p-is-y', label: 'What plus P% is Y?' },
      { value: 'x-minus-p-is-what', label: 'X minus P% is what?' },
      { value: 'x-minus-what-is-y', label: 'X minus what % is Y?' },
      { value: 'what-minus-p-is-y', label: 'What minus P% is Y?' }
    ];
  }

  resetFormData() {
    return {
      calculationType: 'percent-of',
      p1: '', x1: '', // What is P% of X?
      y2: '', x2: '', // Y is what % of X?
      y3: '', p3: '', // Y is P% of what?
      x4: '', y4: '', // What % of X is Y?
      p5: '', y5: '', // P% of what is Y?
      y6: '', p6: '', // Y out of what is P%?
      x7: '', p7: '', // What out of X is P%?
      y8: '', x8: '', // Y out of X is what %?
      x9: '', p9: '', // X plus P% is what?
      x10: '', y10: '', // X plus what % is Y?
      p11: '', y11: '', // What plus P% is Y?
      x12: '', p12: '', // X minus P% is what?
      x13: '', y13: '', // X minus what % is Y?
      p14: '', y14: ''  // What minus P% is Y?
    };
  }

  validateInput(value) {
    if (value === '') return true;
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num);
  }

  validateCalculation(formData) {
    const type = formData.calculationType;
    
    switch(type) {
      case 'percent-of':
        return this.validateInputs(formData.p1, formData.x1);
      case 'y-percent-of-x':
        return this.validateInputs(formData.y2, formData.x2);
      case 'y-is-p-of-what':
        return this.validateInputs(formData.y3, formData.p3);
      case 'what-percent-of-x-is-y':
        return this.validateInputs(formData.x4, formData.y4);
      case 'p-of-what-is-y':
        return this.validateInputs(formData.p5, formData.y5);
      case 'y-out-of-what-is-p':
        return this.validateInputs(formData.y6, formData.p6);
      case 'what-out-of-x-is-p':
        return this.validateInputs(formData.x7, formData.p7);
      case 'y-out-of-x-is-what':
        return this.validateInputs(formData.y8, formData.x8);
      case 'x-plus-p-is-what':
        return this.validateInputs(formData.x9, formData.p9);
      case 'x-plus-what-is-y':
        return this.validateInputs(formData.x10, formData.y10);
      case 'what-plus-p-is-y':
        return this.validateInputs(formData.p11, formData.y11);
      case 'x-minus-p-is-what':
        return this.validateInputs(formData.x12, formData.p12);
      case 'x-minus-what-is-y':
        return this.validateInputs(formData.x13, formData.y13);
      case 'what-minus-p-is-y':
        return this.validateInputs(formData.p14, formData.y14);
      default:
        return false;
    }
  }

  validateInputs(...values) {
    return values.every(val => {
      const num = parseFloat(val);
      return !isNaN(num) && isFinite(num) && val !== null && val !== undefined && val !== '';
    });
  }

  calculate(formData) {
    const type = formData.calculationType;
    let result, steps, error;

    try {
      switch(type) {
        case 'percent-of':
          const p1 = parseFloat(formData.p1);
          const x1 = parseFloat(formData.x1);
          if (!this.validateInputs(p1, x1)) {
            error = 'Please enter valid numbers for both P and X.';
            break;
          }
          result = (p1 / 100) * x1;
          steps = [
            `What is ${p1}% of ${x1}?`,
            `Equation: Y = P% × X`,
            `Y = ${p1}% × ${x1}`,
            `Converting percent to decimal:`,
            `Y = (${p1}/100) × ${x1}`,
            `Y = ${(p1/100).toFixed(4)} × ${x1}`,
            `Y = ${result.toFixed(2)}`
          ];
          result = result.toFixed(2);
          break;

        case 'y-percent-of-x':
          const y2 = parseFloat(formData.y2);
          const x2 = parseFloat(formData.x2);
          if (!this.validateInputs(y2, x2)) {
            error = 'Please enter valid numbers for both Y and X.';
            break;
          }
          if (x2 === 0) {
            error = 'X cannot be zero (division by zero).';
            break;
          }
          result = (y2 / x2) * 100;
          steps = [
            `${y2} is What % of ${x2}?`,
            `Equation: P% = (Y ÷ X) × 100`,
            `P% = (${y2} ÷ ${x2}) × 100`,
            `P% = ${(y2/x2).toFixed(4)} × 100`,
            `P% = ${result.toFixed(2)}%`
          ];
          result = result.toFixed(2) + '%';
          break;

        case 'y-is-p-of-what':
          const y3 = parseFloat(formData.y3);
          const p3 = parseFloat(formData.p3);
          if (!this.validateInputs(y3, p3)) {
            error = 'Please enter valid numbers for both Y and P.';
            break;
          }
          if (p3 === 0) {
            error = 'P cannot be zero (division by zero).';
            break;
          }
          result = y3 / (p3/100);
          steps = [
            `${y3} is ${p3}% of What?`,
            `Equation: X = Y ÷ (P% ÷ 100)`,
            `X = ${y3} ÷ (${p3} ÷ 100)`,
            `X = ${y3} ÷ ${(p3/100).toFixed(4)}`,
            `X = ${result.toFixed(2)}`
          ];
          result = result.toFixed(2);
          break;

        case 'what-percent-of-x-is-y':
          const x4 = parseFloat(formData.x4);
          const y4 = parseFloat(formData.y4);
          if (!this.validateInputs(x4, y4)) {
            error = 'Please enter valid numbers for both X and Y.';
            break;
          }
          if (x4 === 0) {
            error = 'X cannot be zero (division by zero).';
            break;
          }
          result = (y4 / x4) * 100;
          steps = [
            `What % of ${x4} is ${y4}?`,
            `Equation: P% = (Y ÷ X) × 100`,
            `P% = (${y4} ÷ ${x4}) × 100`,
            `P% = ${(y4/x4).toFixed(4)} × 100`,
            `P% = ${result.toFixed(2)}%`
          ];
          result = result.toFixed(2) + '%';
          break;

        case 'p-of-what-is-y':
          const p5 = parseFloat(formData.p5);
          const y5 = parseFloat(formData.y5);
          if (!this.validateInputs(p5, y5)) {
            error = 'Please enter valid numbers for both P and Y.';
            break;
          }
          if (p5 === 0) {
            error = 'P cannot be zero (division by zero).';
            break;
          }
          result = y5 / (p5/100);
          steps = [
            `${p5}% of What is ${y5}?`,
            `Equation: X = Y ÷ (P% ÷ 100)`,
            `X = ${y5} ÷ (${p5} ÷ 100)`,
            `X = ${y5} ÷ ${(p5/100).toFixed(4)}`,
            `X = ${result.toFixed(2)}`
          ];
          result = result.toFixed(2);
          break;

        case 'y-out-of-what-is-p':
          const y6 = parseFloat(formData.y6);
          const p6 = parseFloat(formData.p6);
          if (!this.validateInputs(y6, p6)) {
            error = 'Please enter valid numbers for both Y and P.';
            break;
          }
          if (p6 === 0) {
            error = 'P cannot be zero (division by zero).';
            break;
          }
          result = (y6 * 100) / p6;
          steps = [
            `${y6} out of What is ${p6}%?`,
            `Equation: X = (Y × 100) ÷ P%`,
            `X = (${y6} × 100) ÷ ${p6}`,
            `X = ${y6 * 100} ÷ ${p6}`,
            `X = ${result.toFixed(2)}`
          ];
          result = result.toFixed(2);
          break;

        case 'what-out-of-x-is-p':
          const x7 = parseFloat(formData.x7);
          const p7 = parseFloat(formData.p7);
          if (!this.validateInputs(x7, p7)) {
            error = 'Please enter valid numbers for both X and P.';
            break;
          }
          result = (x7 * p7) / 100;
          steps = [
            `What out of ${x7} is ${p7}%?`,
            `Equation: Y = (X × P%) ÷ 100`,
            `Y = (${x7} × ${p7}) ÷ 100`,
            `Y = ${x7 * p7} ÷ 100`,
            `Y = ${result.toFixed(2)}`
          ];
          result = result.toFixed(2);
          break;

        case 'y-out-of-x-is-what':
          const y8 = parseFloat(formData.y8);
          const x8 = parseFloat(formData.x8);
          if (!this.validateInputs(y8, x8)) {
            error = 'Please enter valid numbers for both Y and X.';
            break;
          }
          if (x8 === 0) {
            error = 'X cannot be zero (division by zero).';
            break;
          }
          result = (y8 / x8) * 100;
          steps = [
            `${y8} out of ${x8} is What %?`,
            `Equation: P% = (Y ÷ X) × 100`,
            `P% = (${y8} ÷ ${x8}) × 100`,
            `P% = ${(y8/x8).toFixed(4)} × 100`,
            `P% = ${result.toFixed(2)}%`
          ];
          result = result.toFixed(2) + '%';
          break;

        case 'x-plus-p-is-what':
          const x9 = parseFloat(formData.x9);
          const p9 = parseFloat(formData.p9);
          if (!this.validateInputs(x9, p9)) {
            error = 'Please enter valid numbers for both X and P.';
            break;
          }
          result = x9 + (x9 * p9 / 100);
          steps = [
            `${x9} plus ${p9}% is What?`,
            `Equation: Y = X + (X × P% ÷ 100)`,
            `Y = ${x9} + (${x9} × ${p9} ÷ 100)`,
            `Y = ${x9} + ${(x9 * p9 / 100).toFixed(2)}`,
            `Y = ${result.toFixed(2)}`
          ];
          result = result.toFixed(2);
          break;

        case 'x-plus-what-is-y':
          const x10 = parseFloat(formData.x10);
          const y10 = parseFloat(formData.y10);
          if (!this.validateInputs(x10, y10)) {
            error = 'Please enter valid numbers for both X and Y.';
            break;
          }
          if (x10 === 0) {
            error = 'X cannot be zero (division by zero).';
            break;
          }
          result = ((y10 - x10) / x10) * 100;
          steps = [
            `${x10} plus What % is ${y10}?`,
            `Equation: P% = ((Y - X) ÷ X) × 100`,
            `P% = ((${y10} - ${x10}) ÷ ${x10}) × 100`,
            `P% = (${y10 - x10} ÷ ${x10}) × 100`,
            `P% = ${((y10 - x10) / x10).toFixed(4)} × 100`,
            `P% = ${result.toFixed(2)}%`
          ];
          result = result.toFixed(2) + '%';
          break;

        case 'what-plus-p-is-y':
          const p11 = parseFloat(formData.p11);
          const y11 = parseFloat(formData.y11);
          if (!this.validateInputs(p11, y11)) {
            error = 'Please enter valid numbers for both P and Y.';
            break;
          }
          if ((1 + p11/100) === 0) {
            error = 'Invalid calculation: 1 + P%/100 cannot equal zero.';
            break;
          }
          result = y11 / (1 + p11/100);
          steps = [
            `What plus ${p11}% is ${y11}?`,
            `Equation: X = Y ÷ (1 + P% ÷ 100)`,
            `X = ${y11} ÷ (1 + ${p11} ÷ 100)`,
            `X = ${y11} ÷ (1 + ${(p11/100).toFixed(4)})`,
            `X = ${y11} ÷ ${(1 + p11/100).toFixed(4)}`,
            `X = ${result.toFixed(2)}`
          ];
          result = result.toFixed(2);
          break;

        case 'x-minus-p-is-what':
          const x12 = parseFloat(formData.x12);
          const p12 = parseFloat(formData.p12);
          if (!this.validateInputs(x12, p12)) {
            error = 'Please enter valid numbers for both X and P.';
            break;
          }
          result = x12 - (x12 * p12 / 100);
          steps = [
            `${x12} minus ${p12}% is What?`,
            `Equation: Y = X - (X × P% ÷ 100)`,
            `Y = ${x12} - (${x12} × ${p12} ÷ 100)`,
            `Y = ${x12} - ${(x12 * p12 / 100).toFixed(2)}`,
            `Y = ${result.toFixed(2)}`
          ];
          result = result.toFixed(2);
          break;

        case 'x-minus-what-is-y':
          const x13 = parseFloat(formData.x13);
          const y13 = parseFloat(formData.y13);
          if (!this.validateInputs(x13, y13)) {
            error = 'Please enter valid numbers for both X and Y.';
            break;
          }
          if (x13 === 0) {
            error = 'X cannot be zero (division by zero).';
            break;
          }
          result = ((x13 - y13) / x13) * 100;
          steps = [
            `${x13} minus What % is ${y13}?`,
            `Equation: P% = ((X - Y) ÷ X) × 100`,
            `P% = ((${x13} - ${y13}) ÷ ${x13}) × 100`,
            `P% = (${x13 - y13} ÷ ${x13}) × 100`,
            `P% = ${((x13 - y13) / x13).toFixed(4)} × 100`,
            `P% = ${result.toFixed(2)}%`
          ];
          result = result.toFixed(2) + '%';
          break;

        case 'what-minus-p-is-y':
          const p14 = parseFloat(formData.p14);
          const y14 = parseFloat(formData.y14);
          if (!this.validateInputs(p14, y14)) {
            error = 'Please enter valid numbers for both P and Y.';
            break;
          }
          if ((1 - p14/100) === 0) {
            error = 'Invalid calculation: 1 - P%/100 cannot equal zero.';
            break;
          }
          if ((1 - p14/100) < 0) {
            error = 'Invalid calculation: P% cannot be greater than 100% for this operation.';
            break;
          }
          result = y14 / (1 - p14/100);
          steps = [
            `What minus ${p14}% is ${y14}?`,
            `Equation: X = Y ÷ (1 - P% ÷ 100)`,
            `X = ${y14} ÷ (1 - ${p14} ÷ 100)`,
            `X = ${y14} ÷ (1 - ${(p14/100).toFixed(4)})`,
            `X = ${y14} ÷ ${(1 - p14/100).toFixed(4)}`,
            `X = ${result.toFixed(2)}`
          ];
          result = result.toFixed(2);
          break;

        default:
          error = 'Invalid calculation type.';
      }
    } catch (err) {
      error = 'An error occurred during calculation.';
    }

    return {
      result: result,
      steps: steps,
      error: error
    };
  }

  getCalculationTypeLabel(value) {
    const type = this.calculationTypes.find(t => t.value === value);
    return type ? type.label : value;
  }
}

export default new PercentageCalculatorLogic();
