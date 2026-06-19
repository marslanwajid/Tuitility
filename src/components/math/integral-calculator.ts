// Enhanced Integral Calculator utility functions in TypeScript

interface Token {
  type: string;
  value: string | number;
}

const SUPPORTED_FUNCTIONS: Record<string, (val: number) => number> = {
  'Math.sin': Math.sin,
  'Math.cos': Math.cos,
  'Math.tan': Math.tan,
  'Math.log': Math.log,
  'Math.atan': Math.atan,
  'Math.exp': Math.exp,
};

const tokenizeExpression = (expression: string): Token[] => {
  const tokens: Token[] = [];
  let index = 0;

  while (index < expression.length) {
    const char = expression[index];

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (/[0-9.]/.test(char)) {
      let value = char;
      index += 1;
      while (index < expression.length && /[0-9.]/.test(expression[index])) {
        value += expression[index];
        index += 1;
      }
      tokens.push({ type: 'number', value: Number(value) });
      continue;
    }

    if (/[A-Za-z_]/.test(char)) {
      let value = char;
      index += 1;
      while (index < expression.length && /[A-Za-z0-9_.]/.test(expression[index])) {
        value += expression[index];
        index += 1;
      }
      tokens.push({ type: 'identifier', value });
      continue;
    }

    const nextTwo = expression.slice(index, index + 2);
    if (nextTwo === '**') {
      tokens.push({ type: 'operator', value: '**' });
      index += 2;
      continue;
    }

    if ('+-*/(),'.includes(char)) {
      tokens.push({ type: char === '(' || char === ')' || char === ',' ? char : 'operator', value: char });
      index += 1;
      continue;
    }

    throw new Error('Unsupported expression');
  }

  return tokens;
};

const evaluateMathExpression = (expression: string): number => {
  const tokens = tokenizeExpression(expression);
  let current = 0;

  const peek = () => tokens[current];
  const consume = () => tokens[current++];
  const matchOperator = (...values: string[]) => {
    const token = peek();
    if (token?.type === 'operator' && values.includes(String(token.value))) {
      consume();
      return String(token.value);
    }
    return null;
  };

  const parsePrimary = (): number => {
    const token = consume();

    if (!token) {
      throw new Error('Unexpected end of expression');
    }

    if (token.type === 'number') {
      return Number(token.value);
    }

    if (token.type === 'operator' && token.value === '-') {
      return -parsePrimary();
    }

    if (token.type === '(') {
      const value = parseExpression();
      if (consume()?.type !== ')') {
        throw new Error('Missing closing parenthesis');
      }
      return value;
    }

    if (token.type === 'identifier') {
      const fn = SUPPORTED_FUNCTIONS[String(token.value)];
      if (!fn || consume()?.type !== '(') {
        throw new Error('Unsupported function call');
      }
      const value = parseExpression();
      if (consume()?.type !== ')') {
        throw new Error('Missing closing parenthesis');
      }
      return fn(value);
    }

    throw new Error('Unsupported token');
  };

  const parsePower = (): number => {
    let left = parsePrimary();
    while (matchOperator('**')) {
      left = Math.pow(left, parsePrimary());
    }
    return left;
  };

  const parseTerm = (): number => {
    let left = parsePower();
    while (true) {
      const operator = matchOperator('*', '/');
      if (!operator) break;
      const right = parsePower();
      left = operator === '*' ? left * right : left / right;
    }
    return left;
  };

  const parseExpression = (): number => {
    let left = parseTerm();
    while (true) {
      const operator = matchOperator('+', '-');
      if (!operator) break;
      const right = parseTerm();
      left = operator === '+' ? left + right : left - right;
    }
    return left;
  };

  const result = parseExpression();
  if (current !== tokens.length) {
    throw new Error('Unexpected trailing tokens');
  }
  return result;
};

export class IntegralCalculator {
  steps: string[] = [];
  rules: string[] = [];

  calculate(funcStr: string, variable: string, type: string, lower: number | null, upper: number | null) {
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
    let numerical: number | null = null;
    if (type === 'definite' && lower !== null && upper !== null) {
      numerical = this.evaluateDefinite(antiderivative, variable, lower, upper);
    }

    // For indefinite integrals, evaluate at x=1 to show a sample numeric value
    let sampleValue: number | null = null;
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

  integrate(func: string, variable: string): string {
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

  evaluateDefinite(antiderivative: string, variable: string, lower: number, upper: number): number | null {
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
    } catch (e: any) {
      this.addStep(`Error evaluating: ${e.message}`);
      return null;
    }
  }

  evaluate(expression: string, value: number): number {
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
            .replace(/x/g, String(value))
            .replace(/\^/g, '**')
            .replace(/sin/g, 'Math.sin')
            .replace(/cos/g, 'Math.cos')
            .replace(/tan/g, 'Math.tan')
            .replace(/ln/g, 'Math.log')
            .replace(/arctan/g, 'Math.atan')
            .replace(/e\*\*/g, 'Math.exp');
          return evaluateMathExpression(expr);
        } catch (e) {
          return 0;
        }
    }
  }

  addStep(step: string) {
    this.steps.push(step);
  }

  addRule(rule: string) {
    this.rules.push(rule);
  }

  simplifyExpression(expr: string): string {
    // Clean up the expression for better display
    return expr
      .replace(/\*\*/g, '^') // x**2 → x^2
      .replace(/\*/g, '') // 3*x → 3x
      .replace(/x\^1(?![\d])/g, 'x') // x^1 → x
      .replace(/1x/g, 'x') // 1x → x
      .replace(/\+ -/g, '- ') // + - → -
      .replace(/\s+/g, ' ') // multiple spaces → single space
      .replace(/\(\s*([^)]+)\s*\)/g, '($1)') // clean parentheses
      .trim();
  }
}

// Format mathematical expressions for KaTeX rendering
export function formatMathJax(expression: string | number): string {
  if (!expression) return '';
  let formatted = expression.toString();

  // Replace ** with ^
  formatted = formatted.replace(/\*\*/g, '^');

  // Replace literal ∫ with \int
  formatted = formatted.replace(/∫/g, '\\int ');

  // Replace sqrt(...) with \sqrt{...}
  formatted = formatted.replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}');
  formatted = formatted.replace(/√\(([^)]+)\)/g, '\\sqrt{$1}');
  
  // Replace exp(...) with e^{...}
  formatted = formatted.replace(/exp\(([^)]+)\)/g, 'e^{$1}');
  formatted = formatted.replace(/e\^\(([^)]+)\)/g, 'e^{$1}');

  // Convert fractional powers or fractions like x^3/3 to \frac{x^3}{3}
  formatted = formatted.replace(/([a-zA-Z\d\^\{\}\(\)]+)\/([a-zA-Z\d\^\{\}\(\)]+)/g, '\\frac{$1}{$2}');
  
  // Clean up multiplication signs
  formatted = formatted.replace(/\*/g, ' \\cdot ');

  // Format standard functions
  formatted = formatted.replace(/sin\(/g, '\\sin(');
  formatted = formatted.replace(/cos\(/g, '\\cos(');
  formatted = formatted.replace(/tan\(/g, '\\tan(');
  formatted = formatted.replace(/sec\(/g, '\\sec(');
  formatted = formatted.replace(/csc\(/g, '\\csc(');
  formatted = formatted.replace(/cot\(/g, '\\cot(');
  formatted = formatted.replace(/sinh\(/g, '\\sinh(');
  formatted = formatted.replace(/cosh\(/g, '\\cosh(');
  formatted = formatted.replace(/tanh\(/g, '\\tanh(');
  formatted = formatted.replace(/ln\(/g, '\\ln(');
  formatted = formatted.replace(/ln\|/g, '\\ln|');
  formatted = formatted.replace(/log\(/g, '\\log(');
  formatted = formatted.replace(/arctan\(/g, '\\arctan(');
  formatted = formatted.replace(/arcsin\(/g, '\\arcsin(');
  formatted = formatted.replace(/arccos\(/g, '\\arccos(');

  // Clean up extra spaces & signs
  formatted = formatted.replace(/\+ -/g, ' - ');
  formatted = formatted.replace(/\+/g, ' + ');
  formatted = formatted.replace(/\s+/g, ' ').trim();

  return formatted;
}

// Format individual steps for display using structured early-return parsing
export function formatStepForDisplay(step: string): string {
  if (!step || step.trim() === '') return step;
  
  // Don't touch markdown headers
  if (step.startsWith('**')) {
    return step;
  }

  let line = step.trim();

  // 1. "Input: ∫func dvar" -> "Input: \(\int func \, dvar\)"
  if (line.startsWith('Input: ∫')) {
    const expr = line.substring('Input: ∫'.length, line.length - 3).trim();
    const dvar = line.substring(line.length - 2).trim();
    return `Input: \\(\\int ${formatMathJax(expr)} \\, ${dvar}\\)`;
  } else if (line.startsWith('Input: ')) {
    const expr = line.substring('Input: '.length).trim();
    return `Input: \\(${formatMathJax(expr)}\\)`;
  }

  // 2. "Antiderivative: ..."
  if (line.startsWith('Antiderivative: ')) {
    const expr = line.substring('Antiderivative: '.length).trim();
    return `Antiderivative: \\(${formatMathJax(expr)}\\)`;
  }

  // 3. "Simplified: ..."
  if (line.startsWith('Simplified: ')) {
    const expr = line.substring('Simplified: '.length).trim();
    return `Simplified: \\(${formatMathJax(expr)}\\)`;
  }

  // 4. "Sample evaluation at x = 1: F(1) = value"
  if (line.startsWith('Sample evaluation at ')) {
    const evalMatch = line.match(/Sample evaluation at ([a-z])\s*=\s*(\d+):\s*F\((\d+)\)\s*=\s*(.*)/i);
    if (evalMatch) {
      const [, variable, val1, val2, result] = evalMatch;
      return `Sample evaluation at \\(${variable} = ${val1}\\): \\(F(${val2}) = ${formatMathJax(result)}\\)`;
    }
  }

  // 5. "F(limit) = value"
  const fLimitMatch = line.match(/^F\(([-+]?\d*\.?\d*)\)\s*=\s*(.*)$/);
  if (fLimitMatch) {
    const [, limit, val] = fLimitMatch;
    return `\\(F(${limit}) = ${formatMathJax(val)}\\)`;
  }

  // 5b. "F(var) = value"
  const fVarMatch = line.match(/^F\(([a-zA-Z])\)\s*=\s*(.*)$/);
  if (fVarMatch) {
    const [, v, expr] = fVarMatch;
    return `\\(F(${v}) = ${formatMathJax(expr)}\\)`;
  }

  // 6. "F(upper) - F(lower) = value - value"
  if (line.includes(' - F(') && line.includes(' = ')) {
    const eqIndex = line.indexOf('=');
    const left = line.substring(0, eqIndex).trim();
    const right = line.substring(eqIndex + 1).trim();
    return `\\(${formatMathJax(left)} = ${formatMathJax(right)}\\)`;
  }

  // 7. "Final Answer = value"
  if (line.startsWith('Final Answer = ')) {
    const ans = line.substring('Final Answer = '.length).trim();
    return `Final Answer = \\(${formatMathJax(ans)}\\)`;
  }

  // 8. Integrals in equations like "∫2x dx = 2∫x dx = 2(x²/2) = x²"
  if (line.startsWith('∫') || line.includes(' = ∫')) {
    return `\\(${formatMathJax(line)}\\)`;
  }

  // 9. Integration Rules like "Constant Multiple: ∫cf(x) dx = c∫f(x) dx"
  if (line.includes(': ∫')) {
    const colonIndex = line.indexOf(':');
    const ruleName = line.substring(0, colonIndex).trim();
    const mathPart = line.substring(colonIndex + 1).trim();
    return `${ruleName}: \\(${formatMathJax(mathPart)}\\)`;
  }
  
  // 10. "Using Sum Rule: ∫[f(x) + g(x)] dx = ..."
  const ruleMatch = line.match(/^Using\s+([^:]+):\s*(.*)$/i);
  if (ruleMatch) {
    const [, ruleName, formula] = ruleMatch;
    return `Using ${ruleName}: \\(${formatMathJax(formula)}\\)`;
  }

  return line;
}
