// Derivative Calculator Utility Functions in TypeScript

interface Token {
  type: string;
  value: string | number;
}

const SUPPORTED_FUNCTIONS: Record<string, (val: number) => number> = {
  'Math.sin': Math.sin,
  'Math.cos': Math.cos,
  'Math.tan': Math.tan,
  'Math.log': Math.log,
  'Math.log10': Math.log10,
  'Math.sqrt': Math.sqrt,
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

// Compute derivative of a function
export const computeDerivative = (func: string, variable: string, order: number) => {
  const steps: string[] = [];
  const rules: string[] = [];
  
  steps.push(`**STEP 1: Original Function**`);
  steps.push(`f(${variable}) = ${func}`);
  steps.push('');

  let currentFunction = func;
  
  for (let i = 0; i < order; i++) {
    steps.push(`**STEP ${i + 2}: Finding ${getOrdinalNumber(i + 1)} Derivative**`);
    
    const derivative = differentiate(currentFunction, variable, steps, rules);
    currentFunction = derivative;
    
    steps.push(`f${'\''.repeat(i + 1)}(${variable}) = ${derivative}`);
    steps.push('');
  }

  return {
    derivative: currentFunction,
    steps: steps,
    rules: Array.from(new Set(rules))
  };
};

// Differentiate a expression
const differentiate = (expression: string, variable: string, steps: string[], rules: string[]): string => {
  const cleanExpr = expression.trim();
  
  // Handle basic polynomial terms
  if (isPolynomial(cleanExpr)) {
    return differentiatePolynomial(cleanExpr, variable, steps, rules);
  }
  
  // Handle sum of terms (split by + and -)
  if (cleanExpr.includes('+') || (cleanExpr.includes('-') && cleanExpr.indexOf('-') > 0)) {
    return differentiateSumOfTerms(cleanExpr, variable, steps, rules);
  }
  
  // Handle single terms
  return differentiateSingleTerm(cleanExpr, variable, steps, rules);
};

// Check if expression is polynomial
const isPolynomial = (expr: string): boolean => {
  return /^[\d\w\^\+\-\*\s\.]+$/.test(expr) && !expr.includes('sin') && !expr.includes('cos') && !expr.includes('tan') && !expr.includes('ln') && !expr.includes('log');
};

// Differentiate polynomial
const differentiatePolynomial = (expression: string, variable: string, steps: string[], rules: string[]): string => {
  steps.push(`**Differentiating Polynomial:** ${expression}`);
  steps.push(`Using Sum Rule: (f + g)' = f' + g'`);
  rules.push("Sum Rule");
  
  // Split into terms
  const terms = splitPolynomialTerms(expression);
  const derivativeTerms: string[] = [];
  
  for (let i = 0; i < terms.length; i++) {
    const term = terms[i].trim();
    if (term) {
      steps.push(`Term ${i + 1}: ${term}`);
      const termDerivative = differentiateSingleTerm(term, variable, steps, rules);
      derivativeTerms.push(termDerivative);
      steps.push(`→ ${termDerivative}`);
    }
  }
  
  const result = derivativeTerms.join(' + ').replace(/\+ -/g, '- ').replace(/\+ 0/g, '').replace(/^0 \+ /, '');
  steps.push(`**Result:** ${result}`);
  
  return result || '0';
};

// Split polynomial into terms
const splitPolynomialTerms = (expression: string): string[] => {
  const terms: string[] = [];
  let current = '';
  let isNegative = false;
  
  for (let i = 0; i < expression.length; i++) {
    const char = expression[i];
    
    if (char === '+' && i > 0) {
      terms.push(isNegative ? '-' + current : current);
      current = '';
      isNegative = false;
    } else if (char === '-' && i > 0) {
      terms.push(isNegative ? '-' + current : current);
      current = '';
      isNegative = true;
    } else if (char === '-' && i === 0) {
      isNegative = true;
    } else if (char !== ' ') {
      current += char;
    }
  }
  
  if (current) {
    terms.push(isNegative ? '-' + current : current);
  }
  
  return terms;
};

// Differentiate sum of terms
const differentiateSumOfTerms = (expression: string, variable: string, steps: string[], rules: string[]): string => {
  steps.push(`**Applying Sum Rule to:** ${expression}`);
  rules.push("Sum Rule");
  
  const terms = splitPolynomialTerms(expression);
  const derivatives: string[] = [];
  
  for (const term of terms) {
    if (term.trim()) {
      const derivative = differentiateSingleTerm(term.trim(), variable, steps, rules);
      derivatives.push(derivative);
      steps.push(`d/d${variable}[${term}] = ${derivative}`);
    }
  }
  
  return derivatives.join(' + ').replace(/\+ -/g, '- ').replace(/\+ 0/g, '').replace(/^0 \+ /, '') || '0';
};

// Differentiate single term
const differentiateSingleTerm = (term: string, variable: string, steps: string[], rules: string[]): string => {
  let cleanTerm = term.trim();
  
  // Remove leading +
  if (cleanTerm.startsWith('+')) {
    cleanTerm = cleanTerm.substring(1);
  }
  
  // Handle constants
  if (!cleanTerm.includes(variable)) {
    steps.push(`${cleanTerm} is constant → derivative = 0`);
    rules.push("Constant Rule");
    return '0';
  }
  
  // Handle just the variable (x → 1)
  if (cleanTerm === variable) {
    steps.push(`d/d${variable}[${variable}] = 1`);
    rules.push("Power Rule");
    return '1';
  }
  
  // Handle negative variable (-x → -1)
  if (cleanTerm === '-' + variable) {
    steps.push(`d/d${variable}[-${variable}] = -1`);
    rules.push("Power Rule");
    return '-1';
  }
  
  // Handle coefficient * variable (like 3x, -2x)
  const coeffMatch = cleanTerm.match(new RegExp(`^(-?\\d*\\.?\\d*)\\*?${variable}$`));
  if (coeffMatch) {
    const coeff = coeffMatch[1] === '' ? '1' : coeffMatch[1] === '-' ? '-1' : coeffMatch[1];
    steps.push(`d/d${variable}[${cleanTerm}] = ${coeff} (coefficient becomes derivative)`);
    rules.push("Linear Rule");
    return coeff;
  }
  
  // Handle power terms (x^n, ax^n)
  const powerMatch = cleanTerm.match(new RegExp(`^(-?\\d*\\.?\\d*)\\*?${variable}\\^(-?\\d+\\.?\\d*)$`)) ||
                     cleanTerm.match(new RegExp(`^(-?\\d*\\.?\\d*)\\*?${variable}\\*\\*(-?\\d+\\.?\\d*)$`));
  
  if (powerMatch) {
    return applyPowerRule(powerMatch, variable, cleanTerm, steps, rules);
  }
  
  // Handle trigonometric functions
  if (cleanTerm.includes('sin(') || cleanTerm.includes('cos(') || cleanTerm.includes('tan(')) {
    return differentiateTrigFunction(cleanTerm, variable, steps, rules);
  }
  
  // Handle exponential and logarithmic
  if (cleanTerm.includes('ln(') || cleanTerm.includes('log(') || cleanTerm.includes('e^') || cleanTerm.includes('exp(')) {
    return differentiateExpLogFunction(cleanTerm, variable, steps, rules);
  }
  
  // Handle product (like x*sin(x))
  if (cleanTerm.includes('*') && !cleanTerm.includes('^') && !cleanTerm.includes('**')) {
    return applyProductRule(cleanTerm, variable, steps, rules);
  }
  
  return cleanTerm;
};

// Apply power rule
const applyPowerRule = (match: RegExpMatchArray, variable: string, originalTerm: string, steps: string[], rules: string[]): string => {
  const coeff = match[1] === '' ? 1 : match[1] === '-' ? -1 : parseFloat(match[1]);
  const exponent = parseFloat(match[2]);
  
  steps.push(`**Power Rule Applied:** d/d${variable}[x^n] = n·x^(n-1)`);
  steps.push(`Original: ${originalTerm}`);
  steps.push(`Coefficient: ${coeff}, Exponent: ${exponent}`);
  
  const newCoeff = coeff * exponent;
  const newExponent = exponent - 1;
  
  let result;
  if (newExponent === 0) {
    result = newCoeff.toString();
  } else if (newExponent === 1) {
    result = newCoeff === 1 ? variable : newCoeff === -1 ? `-${variable}` : `${newCoeff}*${variable}`;
  } else {
    result = newCoeff === 1 ? `${variable}^${newExponent}` : `${newCoeff}*${variable}^${newExponent}`;
  }
  
  steps.push(`New coefficient: ${coeff} × ${exponent} = ${newCoeff}`);
  steps.push(`New exponent: ${exponent} - 1 = ${newExponent}`);
  steps.push(`Result: ${result}`);
  rules.push("Power Rule");
  
  return result;
};

// Differentiate trigonometric function
const differentiateTrigFunction = (term: string, variable: string, steps: string[], rules: string[]): string => {
  if (term.includes(`sin(${variable})`)) {
    steps.push(`d/d${variable}[sin(${variable})] = cos(${variable})`);
    rules.push("Sine Rule");
    return term.replace(`sin(${variable})`, `cos(${variable})`);
  }
  
  if (term.includes(`cos(${variable})`)) {
    steps.push(`d/d${variable}[cos(${variable})] = -sin(${variable})`);
    rules.push("Cosine Rule");
    return term.replace(`cos(${variable})`, `-sin(${variable})`);
  }
  
  if (term.includes(`tan(${variable})`)) {
    steps.push(`d/d${variable}[tan(${variable})] = sec^2(${variable})`);
    rules.push("Tangent Rule");
    return term.replace(`tan(${variable})`, `sec^2(${variable})`);
  }
  
  return term;
};

// Differentiate exponential and logarithmic function
const differentiateExpLogFunction = (term: string, variable: string, steps: string[], rules: string[]): string => {
  if (term.includes(`ln(${variable})`)) {
    steps.push(`d/d${variable}[ln(${variable})] = 1/${variable}`);
    rules.push("Natural Logarithm Rule");
    return term.replace(`ln(${variable})`, `1/${variable}`);
  }
  
  if (term.includes(`e^${variable}`) || term.includes(`exp(${variable})`)) {
    steps.push(`d/d${variable}[e^${variable}] = e^${variable}`);
    rules.push("Exponential Rule");
    return term;
  }
  
  return term;
};

// Apply product rule
const applyProductRule = (term: string, variable: string, steps: string[], rules: string[]): string => {
  steps.push(`**Product Rule:** (fg)' = f'g + fg'`);
  rules.push("Product Rule");
  
  const parts = term.split('*');
  if (parts.length === 2) {
    const f = parts[0];
    const g = parts[1];
    
    const fPrime = differentiateSingleTerm(f, variable, steps, rules);
    const gPrime = differentiateSingleTerm(g, variable, steps, rules);
    
    steps.push(`f = ${f}, g = ${g}`);
    steps.push(`f' = ${fPrime}, g' = ${gPrime}`);
    
    const result = `${fPrime}*${g} + ${f}*${gPrime}`;
    steps.push(`Result: ${fPrime}*${g} + ${f}*${gPrime}`);
    
    return result;
  }
  
  return term;
};

// Evaluate expression at a point
export const evaluateAtPoint = (expression: string | number, variable: string, xValue: number): number | null => {
  // Replace variable with the numerical value
  let expr = expression.toString();
  
  // Handle basic mathematical operations
  expr = expr.replace(new RegExp(`\\b${variable}\\b`, 'g'), String(xValue));
  expr = expr.replace(/\^/g, '**');
  
  // Handle mathematical functions
  expr = expr.replace(/sin\(/g, 'Math.sin(');
  expr = expr.replace(/cos\(/g, 'Math.cos(');
  expr = expr.replace(/tan\(/g, 'Math.tan(');
  expr = expr.replace(/ln\(/g, 'Math.log(');
  expr = expr.replace(/log\(/g, 'Math.log10(');
  expr = expr.replace(/sqrt\(/g, 'Math.sqrt(');
  
  // Handle e^x
  expr = expr.replace(/e\*\*/g, 'Math.exp(');
  expr = expr.replace(/exp\(/g, 'Math.exp(');
  
  try {
    return evaluateMathExpression(expr);
  } catch (e) {
    console.error('Error evaluating expression:', e);
    return null;
  }
};

// Get ordinal number
const getOrdinalNumber = (num: number): string => {
  const ordinals = ['', '1st', '2nd', '3rd', '4th'];
  return ordinals[num] || `${num}th`;
};

// Format MathJax expression
export const formatMathJax = (expression: string | number): string => {
  if (!expression) return '';
  
  let formatted = expression.toString();
  
  // Replace ** with ^
  formatted = formatted.replace(/\*\*/g, '^');
  
  // Replace literal ∫ with \int
  formatted = formatted.replace(/∫/g, '\\int ');
  
  // Replace sqrt(...) with \sqrt{...}
  formatted = formatted.replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}');
  
  // Replace exp(...) with e^{...}
  formatted = formatted.replace(/exp\(([^)]+)\)/g, 'e^{$1}');
  
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
  
  // Handle fractions - convert A/B to \frac{A}{B}
  formatted = formatted.replace(/([a-zA-Z\d\^\{\}\(\)]+)\/([a-zA-Z\d\^\{\}\(\)]+)/g, '\\frac{$1}{$2}');
  
  // Clean up multiplication symbols
  formatted = formatted.replace(/\*/g, ' \\cdot ');
  
  // Handle negative signs properly
  formatted = formatted.replace(/\+ -/g, ' - ');
  formatted = formatted.replace(/^-/, '-');
  
  // Clean up extra spaces
  formatted = formatted.replace(/\s+/g, ' ').trim();
  
  return formatted;
};

// Format step for display using structured early-return parsing
export const formatStepForDisplay = (step: string): string => {
  if (!step || step.trim() === '') return step;
  
  // Don't touch markdown headers
  if (step.startsWith('**')) {
    return step;
  }
  
  let line = step.trim();
  
  // 1. "Input: ..."
  if (line.startsWith('Input: ')) {
    const expr = line.substring('Input: '.length).trim();
    return `Input: \\(${formatMathJax(expr)}\\)`;
  }
  
  // 2. "Original: ..."
  if (line.startsWith('Original: ')) {
    const expr = line.substring('Original: '.length).trim();
    return `Original: \\(${formatMathJax(expr)}\\)`;
  }
  
  // 3. "Result: ..."
  if (line.startsWith('Result: ')) {
    const expr = line.substring('Result: '.length).trim();
    return `Result: \\(${formatMathJax(expr)}\\)`;
  }
  
  // 4. "Term \d+: ..."
  const termMatch = line.match(/^Term\s+(\d+):\s*(.*)$/i);
  if (termMatch) {
    const [, num, expr] = termMatch;
    return `Term ${num}: \\(${formatMathJax(expr)}\\)`;
  }
  
  // 5. "New coefficient: ..."
  if (line.startsWith('New coefficient: ')) {
    const expr = line.substring('New coefficient: '.length).trim();
    return `New coefficient: \\(${formatMathJax(expr)}\\)`;
  }
  
  // 6. "New exponent: ..."
  if (line.startsWith('New exponent: ')) {
    const expr = line.substring('New exponent: '.length).trim();
    return `New exponent: \\(${formatMathJax(expr)}\\)`;
  }
  
  // 7. "Coefficient: ..., Exponent: ..."
  const coeffExpMatch = line.match(/^Coefficient:\s*([^,]+),\s*Exponent:\s*(.*)$/i);
  if (coeffExpMatch) {
    const [, coeff, exp] = coeffExpMatch;
    return `Coefficient: \\(${formatMathJax(coeff)}\\), Exponent: \\(${formatMathJax(exp)}\\)`;
  }
  
  // 8. "d/dx[expr] = derivative"
  const ddxMatch = line.match(/^d\/d([a-zA-Z])\[([^\]]+)\]\s*=\s*(.*)$/);
  if (ddxMatch) {
    const [, variable, expr, deriv] = ddxMatch;
    return `\\(\\frac{d}{d${variable}}[${formatMathJax(expr)}] = ${formatMathJax(deriv)}\\)`;
  }
  
  // 9. "f'(x) = ..." or "f(x) = ..."
  const funcMatch = line.match(/^([fF][']*)\(([a-zA-Z])\)\s*=\s*(.*)$/);
  if (funcMatch) {
    const [, name, variable, expr] = funcMatch;
    return `\\(${name}(${variable}) = ${formatMathJax(expr)}\\)`;
  }
  
  // 10. "→ ..."
  if (line.startsWith('→')) {
    const expr = line.substring(1).trim();
    return `→ \\(${formatMathJax(expr)}\\)`;
  }
  
  // 11. "Substituting x = 2:"
  const subMatch = line.match(/^Substituting\s+([a-z])\s*=\s*([^:]+):/i);
  if (subMatch) {
    const [, variable, val] = subMatch;
    return `Substituting \\(${variable} = ${val}\\):`;
  }
  
  // 12. "Using Sum Rule: (f + g)' = f' + g'"
  const ruleMatch = line.match(/^Using\s+([^:]+):\s*(.*)$/i);
  if (ruleMatch) {
    const [, ruleName, formula] = ruleMatch;
    return `Using ${ruleName}: \\(${formatMathJax(formula)}\\)`;
  }
  
  return line;
};
