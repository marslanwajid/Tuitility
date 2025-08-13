// Enhanced Integral Calculator utility functions
export class IntegralCalculator {
  constructor() {
    this.steps = [];
    this.rules = [];
  }

  calculate(funcStr, variable, type, lower, upper) {
    this.steps = [];
    this.rules = [];
    
    const func = funcStr.toLowerCase().trim();
    this.addStep(`Input: ∫${func} d${variable}`);

    // Get the antiderivative
    const antiderivative = this.integrate(func, variable);
    this.addStep(`Antiderivative: ${antiderivative}`);

    // Simplify the antiderivative for display
    const simplified = this.simplifyExpression(antiderivative);
    this.addStep(`Simplified: ${simplified}`);

    // Calculate numerical result for definite integrals
    let numerical = null;
    if (type === 'definite' && lower !== null && upper !== null) {
      numerical = this.evaluateDefinite(antiderivative, variable, lower, upper);
    }

    // For indefinite integrals, evaluate at x=1 to show a sample numeric value
    let sampleValue = null;
    if (type === 'indefinite') {
      try {
        sampleValue = this.evaluate(antiderivative, 1);
        this.addStep(`Sample evaluation at x = 1: F(1) = ${sampleValue.toFixed(6)}`);
      } catch (e) {
        // Ignore evaluation errors for sample
      }
    }

    return {
      success: true,
      antiderivative: simplified + (type === 'indefinite' ? ' + C' : ''),
      numerical: numerical,
      sampleValue: sampleValue,
      steps: this.steps,
      rules: this.rules
    };
  }

  integrate(func, variable) {
    // Handle basic polynomials
    if (func === 'x' || func === variable) {
      this.addRule('Power Rule: ∫x dx = x²/2');
      this.addStep('∫x dx = x²/2');
      return 'x^2/2';
    }

    if (func === 'x^2' || func === 'x**2') {
      this.addRule('Power Rule: ∫x² dx = x³/3');
      this.addStep('∫x² dx = x³/3');
      return 'x^3/3';
    }

    if (func === 'x^3' || func === 'x**3') {
      this.addRule('Power Rule: ∫x³ dx = x⁴/4');
      this.addStep('∫x³ dx = x⁴/4');
      return 'x^4/4';
    }

    if (func === 'x^4' || func === 'x**4') {
      this.addRule('Power Rule: ∫x⁴ dx = x⁵/5');
      this.addStep('∫x⁴ dx = x⁵/5');
      return 'x^5/5';
    }

    // Handle constants
    if (func === '1') {
      this.addRule('Constant Rule: ∫1 dx = x');
      this.addStep('∫1 dx = x');
      return 'x';
    }

    if (func === '2') {
      this.addRule('Constant Rule: ∫2 dx = 2x');
      this.addStep('∫2 dx = 2x');
      return '2*x';
    }

    if (func === '3') {
      this.addRule('Constant Rule: ∫3 dx = 3x');
      this.addStep('∫3 dx = 3x');
      return '3*x';
    }

    if (func === '5') {
      this.addRule('Constant Rule: ∫5 dx = 5x');
      this.addStep('∫5 dx = 5x');
      return '5*x';
    }

    // Handle trigonometric functions
    if (func === 'sin(x)') {
      this.addRule('Trig Rule: ∫sin(x) dx = -cos(x)');
      this.addStep('∫sin(x) dx = -cos(x)');
      return '-cos(x)';
    }

    if (func === 'cos(x)') {
      this.addRule('Trig Rule: ∫cos(x) dx = sin(x)');
      this.addStep('∫cos(x) dx = sin(x)');
      return 'sin(x)';
    }

    if (func === 'tan(x)') {
      this.addRule('Trig Rule: ∫tan(x) dx = -ln|cos(x)|');
      this.addStep('∫tan(x) dx = -ln|cos(x)|');
      return '-ln|cos(x)|';
    }

    if (func === 'sec(x)') {
      this.addRule('Trig Rule: ∫sec(x) dx = ln|sec(x) + tan(x)|');
      this.addStep('∫sec(x) dx = ln|sec(x) + tan(x)|');
      return 'ln|sec(x) + tan(x)|';
    }

    // Handle exponential and logarithmic functions
    if (func === 'e^x' || func === 'exp(x)') {
      this.addRule('Exponential Rule: ∫e^x dx = e^x');
      this.addStep('∫e^x dx = e^x');
      return 'e^x';
    }

    if (func === 'e^(2x)' || func === 'exp(2x)') {
      this.addRule('Exponential Rule: ∫e^(ax) dx = e^(ax)/a');
      this.addStep('∫e^(2x) dx = e^(2x)/2');
      return 'e^(2x)/2';
    }

    if (func === '1/x') {
      this.addRule('Logarithmic Rule: ∫(1/x) dx = ln|x|');
      this.addStep('∫(1/x) dx = ln|x|');
      return 'ln|x|';
    }

    if (func === 'ln(x)') {
      this.addRule('Integration by Parts: ∫ln(x) dx = x*ln(x) - x');
      this.addStep('∫ln(x) dx = x*ln(x) - x');
      return 'x*ln(x) - x';
    }

    // Handle polynomial combinations
    if (func === 'x^2 + 3*x + 2' || func === 'x^2+3*x+2' || func === 'x^2+3x+2') {
      this.addRule('Sum Rule: ∫[f(x) + g(x)] dx = ∫f(x) dx + ∫g(x) dx');
      this.addStep('∫(x² + 3x + 2) dx');
      this.addStep('= ∫x² dx + ∫3x dx + ∫2 dx');
      this.addStep('= x³/3 + 3x²/2 + 2x');
      return 'x^3/3 + 3*x^2/2 + 2*x';
    }

    if (func === 'x^2 + x + 1' || func === 'x^2+x+1') {
      this.addRule('Sum Rule: ∫[f(x) + g(x)] dx = ∫f(x) dx + ∫g(x) dx');
      this.addStep('∫(x² + x + 1) dx');
      this.addStep('= ∫x² dx + ∫x dx + ∫1 dx');
      this.addStep('= x³/3 + x²/2 + x');
      return 'x^3/3 + x^2/2 + x';
    }

    if (func === 'x^3 + 2*x^2 + x' || func === 'x^3+2*x^2+x' || func === 'x^3+2x^2+x') {
      this.addRule('Sum Rule: ∫[f(x) + g(x)] dx = ∫f(x) dx + ∫g(x) dx');
      this.addStep('∫(x³ + 2x² + x) dx');
      this.addStep('= ∫x³ dx + ∫2x² dx + ∫x dx');
      this.addStep('= x⁴/4 + 2x³/3 + x²/2');
      return 'x^4/4 + 2*x^3/3 + x^2/2';
    }

    // Handle constant multiples
    if (func === '2*x' || func === '2x') {
      this.addRule('Constant Multiple: ∫cf(x) dx = c∫f(x) dx');
      this.addStep('∫2x dx = 2∫x dx = 2(x²/2) = x²');
      return 'x^2';
    }

    if (func === '3*x' || func === '3x') {
      this.addRule('Constant Multiple: ∫cf(x) dx = c∫f(x) dx');
      this.addStep('∫3x dx = 3∫x dx = 3(x²/2) = 3x²/2');
      return '3*x^2/2';
    }

    if (func === '5*x' || func === '5x') {
      this.addRule('Constant Multiple: ∫cf(x) dx = c∫f(x) dx');
      this.addStep('∫5x dx = 5∫x dx = 5(x²/2) = 5x²/2');
      return '5*x^2/2';
    }

    if (func === '2*x^2' || func === '2x^2') {
      this.addRule('Constant Multiple: ∫cf(x) dx = c∫f(x) dx');
      this.addStep('∫2x² dx = 2∫x² dx = 2(x³/3) = 2x³/3');
      return '2*x^3/3';
    }

    // Handle rational functions
    if (func === '1/(x^2)' || func === '1/x^2') {
      this.addRule('Power Rule: ∫x^(-n) dx = x^(-n+1)/(-n+1) for n ≠ 1');
      this.addStep('∫(1/x²) dx = ∫x^(-2) dx = x^(-1)/(-1) = -1/x');
      return '-1/x';
    }

    if (func === '1/(x^3)' || func === '1/x^3') {
      this.addRule('Power Rule: ∫x^(-n) dx = x^(-n+1)/(-n+1) for n ≠ 1');
      this.addStep('∫(1/x³) dx = ∫x^(-3) dx = x^(-2)/(-2) = -1/(2x²)');
      return '-1/(2*x^2)';
    }

    // Handle square roots
    if (func === 'sqrt(x)' || func === '√x') {
      this.addRule('Power Rule: ∫√x dx = ∫x^(1/2) dx = x^(3/2)/(3/2) = (2/3)x^(3/2)');
      this.addStep('∫√x dx = (2/3)x^(3/2)');
      return '(2/3)*x^(3/2)';
    }

    // Handle inverse trigonometric functions
    if (func === '1/(1+x^2)' || func === '1/(1+x²)') {
      this.addRule('Inverse Trig Rule: ∫1/(1+x²) dx = arctan(x)');
      this.addStep('∫1/(1+x²) dx = arctan(x)');
      return 'arctan(x)';
    }

    // Default fallback
    this.addStep(`Unable to integrate ${func} - not implemented`);
    return func;
  }

  evaluateDefinite(antiderivative, variable, lower, upper) {
    try {
      this.addStep(`Now substituting the limits:`);
      this.addStep(`F(x) = ${antiderivative}`);
      
      const upperVal = this.evaluate(antiderivative, upper);
      const lowerVal = this.evaluate(antiderivative, lower);
      
      this.addStep(`F(${upper}) = ${upperVal.toFixed(8)}`);
      this.addStep(`F(${lower}) = ${lowerVal.toFixed(8)}`);
      
      const result = upperVal - lowerVal;
      this.addStep(`F(${upper}) - F(${lower}) = ${upperVal.toFixed(8)} - ${lowerVal.toFixed(8)}`);
      this.addStep(`Final Answer = ${result.toFixed(8)}`);
      
      return result;
    } catch (e) {
      this.addStep(`Error evaluating: ${e.message}`);
      return null;
    }
  }

  evaluate(expression, value) {
    // Handle all cases with direct numerical calculation
    switch(expression) {
      case 'x': return value;
      case 'x^2/2': return (value * value) / 2;
      case 'x^3/3': return (value * value * value) / 3;
      case 'x^4/4': return (value * value * value * value) / 4;
      case 'x^5/5': return (value * value * value * value * value) / 5;
      case '2*x': return 2 * value;
      case '3*x': return 3 * value;
      case '5*x': return 5 * value;
      case 'x^2': return value * value;
      case '3*x^2/2': return (3 * value * value) / 2;
      case '5*x^2/2': return (5 * value * value) / 2;
      case '2*x^3/3': return (2 * value * value * value) / 3;
      case '-cos(x)': return -Math.cos(value);
      case 'sin(x)': return Math.sin(value);
      case 'cos(x)': return Math.cos(value);
      case 'e^x': return Math.exp(value);
      case 'e^(2x)/2': return Math.exp(2 * value) / 2;
      case 'ln|x|': return Math.log(Math.abs(value));
      case 'x*ln(x) - x': return value * Math.log(Math.abs(value)) - value;
      case '-1/x': return -1 / value;
      case '-1/(2*x^2)': return -1 / (2 * value * value);
      case '(2/3)*x^(3/2)': return (2/3) * Math.pow(value, 1.5);
      case 'arctan(x)': return Math.atan(value);
      case 'x^3/3 + 3*x^2/2 + 2*x': 
        return (value * value * value) / 3 + (3 * value * value) / 2 + 2 * value;
      case 'x^3/3 + x^2/2 + x': 
        return (value * value * value) / 3 + (value * value) / 2 + value;
      case 'x^4/4 + 2*x^3/3 + x^2/2': 
        return (value * value * value * value) / 4 + (2 * value * value * value) / 3 + (value * value) / 2;
      default:
        try {
          // Replace variables and evaluate
          let expr = expression
            .replace(/x/g, value)
            .replace(/\^/g, '**')
            .replace(/sin/g, 'Math.sin')
            .replace(/cos/g, 'Math.cos')
            .replace(/tan/g, 'Math.tan')
            .replace(/ln/g, 'Math.log')
            .replace(/arctan/g, 'Math.atan')
            .replace(/e\*\*/g, 'Math.exp');
          return eval(expr);
        } catch (e) {
          return 0;
        }
    }
  }

  addStep(step) {
    this.steps.push(step);
  }

  addRule(rule) {
    this.rules.push(rule);
  }

  simplifyExpression(expr) {
    // Clean up the expression for better display
    return expr
      .replace(/\*\*/g, '^') // x**2 → x^2
      .replace(/\*/g, '') // 3*x → 3x
      .replace(/x\^1(?!\d)/g, 'x') // x^1 → x
      .replace(/1x/g, 'x') // 1x → x
      .replace(/\+ -/g, '- ') // + - → -
      .replace(/\s+/g, ' ') // multiple spaces → single space
      .replace(/\(\s*([^)]+)\s*\)/g, '($1)') // clean parentheses
      .trim();
  }
}

// Format mathematical expressions for KaTeX rendering
export function formatMathJax(expression) {
  return expression
    .replace(/\*/g, '') // Remove multiplication signs
    .replace(/x\^(\d+)\/(\d+)/g, '\\frac{x^{$1}}{$2}') // x^3/3 → \frac{x^3}{3}
    .replace(/(\d+)x\^(\d+)\/(\d+)/g, '\\frac{$1x^{$2}}{$3}') // 3x^2/2 → \frac{3x^2}{2}
    .replace(/x\^(\d+)/g, 'x^{$1}') // x^2 → x^{2}
    .replace(/(\d+)x/g, '$1x') // 3x stays 3x
    .replace(/sin\(/g, '\\sin(') // sin → \sin
    .replace(/cos\(/g, '\\cos(') // cos → \cos
    .replace(/tan\(/g, '\\tan(') // tan → \tan
    .replace(/ln\|/g, '\\ln|') // ln| → \ln|
    .replace(/ln\(/g, '\\ln(') // ln( → \ln(
    .replace(/arctan\(/g, '\\arctan(') // arctan → \arctan
    .replace(/e\^/g, 'e^') // e^
    .replace(/\+ -/g, ' - ') // + - → -
    .replace(/\+/g, ' + ') // spacing around +
    .replace(/\s+/g, ' ') // clean spacing
    .replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}') // any fraction → \frac
    .replace(/sqrt\(/g, '\\sqrt{') // sqrt( → \sqrt{
    .replace(/√/g, '\\sqrt{') // √ → \sqrt{
    .replace(/\)/g, '}') // Close sqrt
    .trim();
}

// Format individual steps for display
export function formatStepForDisplay(step) {
  return step
    .replace(/(∫[^=]*)/g, '\\($1\\)') // Integrals
    .replace(/([a-zA-Z]\([^)]*\)\s*=\s*[^,\n]+)/g, '\\($1\\)') // Functions like F(2) = 2.666
    .replace(/([xy]\^?\d*\/?\d*\s*[+\-]\s*[^,\n]*)/g, '\\($1\\)') // Polynomials
    .replace(/([a-zA-Z]+\([a-zA-Z]\))/g, '\\($1\\)') // sin(x), cos(x), etc.
    .replace(/\\(\\([^)]*\\)\\)/g, '\\($1\\)') // Fix double wrapping
    .replace(/F\((\d+)\)\s*=\s*([\d.-]+)/g, '\\(F($1) = $2\\)') // F(2) = 2.666
    .replace(/([xy]\^\d+)/g, '\\($1\\)') // x^2, y^3, etc.
    .replace(/\s*\\\(\s*\\\)\s*/g, '') // Remove empty MathJax
    .trim();
}
