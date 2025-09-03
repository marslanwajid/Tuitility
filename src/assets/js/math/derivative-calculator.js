// Derivative Calculator Utility Functions

// Compute derivative of a function
export const computeDerivative = (func, variable, order) => {
  const steps = []
  const rules = []
  
  steps.push(`**STEP 1: Original Function**`)
  steps.push(`f(${variable}) = ${func}`)
  steps.push('')

  let currentFunction = func
  
  for (let i = 0; i < order; i++) {
    steps.push(`**STEP ${i + 2}: Finding ${getOrdinalNumber(i + 1)} Derivative**`)
    
    const derivative = differentiate(currentFunction, variable, steps, rules)
    currentFunction = derivative
    
    steps.push(`f${'\''.repeat(i + 1)}(${variable}) = ${derivative}`)
    steps.push('')
  }

  return {
    derivative: currentFunction,
    steps: steps,
    rules: rules
  }
}

// Differentiate a single expression
const differentiate = (expression, variable, steps, rules) => {
  // Handle basic polynomial terms
  if (isPolynomial(expression)) {
    return differentiatePolynomial(expression, variable, steps, rules)
  }
  
  // Handle sum of terms (split by + and -)
  if (expression.includes('+') || (expression.includes('-') && expression.indexOf('-') > 0)) {
    return differentiateSumOfTerms(expression, variable, steps, rules)
  }
  
  // Handle single terms
  return differentiateSingleTerm(expression, variable, steps, rules)
}

// Check if expression is polynomial
const isPolynomial = (expr) => {
  return /^[\d\w\^\+\-\*\s\.]+$/.test(expr) && !expr.includes('sin') && !expr.includes('cos') && !expr.includes('ln')
}

// Differentiate polynomial
const differentiatePolynomial = (expression, variable, steps, rules) => {
  steps.push(`**Differentiating Polynomial:** ${expression}`)
  steps.push(`Using Sum Rule: (f + g)' = f' + g'`)
  rules.push("Sum Rule")
  
  // Split into terms
  const terms = splitPolynomialTerms(expression)
  const derivativeTerms = []
  
  for (let i = 0; i < terms.length; i++) {
    const term = terms[i].trim()
    if (term) {
      steps.push(`Term ${i + 1}: ${term}`)
      const termDerivative = differentiateSingleTerm(term, variable, steps, rules)
      derivativeTerms.push(termDerivative)
      steps.push(`→ ${termDerivative}`)
    }
  }
  
  const result = derivativeTerms.join(' + ').replace(/\+ -/g, '- ').replace(/\+ 0/g, '').replace(/^0 \+ /, '')
  steps.push(`**Result:** ${result}`)
  
  return result || '0'
}

// Split polynomial into terms
const splitPolynomialTerms = (expression) => {
  const terms = []
  let current = ''
  let isNegative = false
  
  for (let i = 0; i < expression.length; i++) {
    const char = expression[i]
    
    if (char === '+' && i > 0) {
      terms.push(isNegative ? '-' + current : current)
      current = ''
      isNegative = false
    } else if (char === '-' && i > 0) {
      terms.push(isNegative ? '-' + current : current)
      current = ''
      isNegative = true
    } else if (char === '-' && i === 0) {
      isNegative = true
    } else if (char !== ' ') {
      current += char
    }
  }
  
  if (current) {
    terms.push(isNegative ? '-' + current : current)
  }
  
  return terms
}

// Differentiate sum of terms
const differentiateSumOfTerms = (expression, variable, steps, rules) => {
  steps.push(`**Applying Sum Rule to:** ${expression}`)
  rules.push("Sum Rule")
  
  const terms = splitPolynomialTerms(expression)
  const derivatives = []
  
  for (const term of terms) {
    if (term.trim()) {
      const derivative = differentiateSingleTerm(term.trim(), variable, steps, rules)
      derivatives.push(derivative)
      steps.push(`d/d${variable}[${term}] = ${derivative}`)
    }
  }
  
  return derivatives.join(' + ').replace(/\+ -/g, '- ').replace(/\+ 0/g, '').replace(/^0 \+ /, '') || '0'
}

// Differentiate single term
const differentiateSingleTerm = (term, variable, steps, rules) => {
  term = term.trim()
  
  // Remove leading +
  if (term.startsWith('+')) {
    term = term.substring(1)
  }
  
  // Handle constants
  if (!term.includes(variable)) {
    steps.push(`${term} is constant → derivative = 0`)
    rules.push("Constant Rule")
    return '0'
  }
  
  // Handle just the variable (x → 1)
  if (term === variable) {
    steps.push(`d/d${variable}[${variable}] = 1`)
    rules.push("Power Rule")
    return '1'
  }
  
  // Handle negative variable (-x → -1)
  if (term === '-' + variable) {
    steps.push(`d/d${variable}[-${variable}] = -1`)
    rules.push("Power Rule")
    return '-1'
  }
  
  // Handle coefficient * variable (like 3x, -2x)
  const coeffMatch = term.match(new RegExp(`^(-?\\d*\\.?\\d*)\\*?${variable}$`))
  if (coeffMatch) {
    const coeff = coeffMatch[1] === '' ? '1' : coeffMatch[1] === '-' ? '-1' : coeffMatch[1]
    steps.push(`d/d${variable}[${term}] = ${coeff} (coefficient becomes derivative)`)
    rules.push("Linear Rule")
    return coeff
  }
  
  // Handle power terms (x^n, ax^n)
  const powerMatch = term.match(new RegExp(`^(-?\\d*\\.?\\d*)\\*?${variable}\\^(-?\\d+\\.?\\d*)$`)) ||
                    term.match(new RegExp(`^(-?\\d*\\.?\\d*)\\*?${variable}\\*\\*(-?\\d+\\.?\\d*)$`))
  
  if (powerMatch) {
    return applyPowerRule(powerMatch, variable, term, steps, rules)
  }
  
  // Handle trigonometric functions
  if (term.includes('sin(') || term.includes('cos(') || term.includes('tan(')) {
    return differentiateTrigFunction(term, variable, steps, rules)
  }
  
  // Handle exponential and logarithmic
  if (term.includes('ln(') || term.includes('log(') || term.includes('e^') || term.includes('exp(')) {
    return differentiateExpLogFunction(term, variable, steps, rules)
  }
  
  // Handle product (like x*sin(x))
  if (term.includes('*') && !term.includes('^') && !term.includes('**')) {
    return applyProductRule(term, variable, steps, rules)
  }
  
  return term
}

// Apply power rule
const applyPowerRule = (match, variable, originalTerm, steps, rules) => {
  const coeff = match[1] === '' ? 1 : match[1] === '-' ? -1 : parseFloat(match[1])
  const exponent = parseFloat(match[2])
  
  steps.push(`**Power Rule Applied:** d/d${variable}[x^n] = n·x^(n-1)`)
  steps.push(`Original: ${originalTerm}`)
  steps.push(`Coefficient: ${coeff}, Exponent: ${exponent}`)
  
  const newCoeff = coeff * exponent
  const newExponent = exponent - 1
  
  let result
  if (newExponent === 0) {
    result = newCoeff.toString()
  } else if (newExponent === 1) {
    result = newCoeff === 1 ? variable : newCoeff === -1 ? `-${variable}` : `${newCoeff}*${variable}`
  } else {
    result = newCoeff === 1 ? `${variable}^${newExponent}` : `${newCoeff}*${variable}^${newExponent}`
  }
  
  steps.push(`New coefficient: ${coeff} × ${exponent} = ${newCoeff}`)
  steps.push(`New exponent: ${exponent} - 1 = ${newExponent}`)
  steps.push(`Result: ${result}`)
  rules.push("Power Rule")
  
  return result
}

// Differentiate trigonometric function
const differentiateTrigFunction = (term, variable, steps, rules) => {
  if (term.includes(`sin(${variable})`)) {
    steps.push(`d/d${variable}[sin(${variable})] = cos(${variable})`)
    rules.push("Sine Rule")
    return term.replace(`sin(${variable})`, `cos(${variable})`)
  }
  
  if (term.includes(`cos(${variable})`)) {
    steps.push(`d/d${variable}[cos(${variable})] = -sin(${variable})`)
    rules.push("Cosine Rule")
    return term.replace(`cos(${variable})`, `-sin(${variable})`)
  }
  
  if (term.includes(`tan(${variable})`)) {
    steps.push(`d/d${variable}[tan(${variable})] = sec^2(${variable})`)
    rules.push("Tangent Rule")
    return term.replace(`tan(${variable})`, `sec^2(${variable})`)
  }
  
  return term
}

// Differentiate exponential and logarithmic function
const differentiateExpLogFunction = (term, variable, steps, rules) => {
  if (term.includes(`ln(${variable})`)) {
    steps.push(`d/d${variable}[ln(${variable})] = 1/${variable}`)
    rules.push("Natural Logarithm Rule")
    return term.replace(`ln(${variable})`, `1/${variable}`)
  }
  
  if (term.includes(`e^${variable}`) || term.includes(`exp(${variable})`)) {
    steps.push(`d/d${variable}[e^${variable}] = e^${variable}`)
    rules.push("Exponential Rule")
    return term
  }
  
  return term
}

// Apply product rule
const applyProductRule = (term, variable, steps, rules) => {
  steps.push(`**Product Rule:** (fg)' = f'g + fg'`)
  rules.push("Product Rule")
  
  const parts = term.split('*')
  if (parts.length === 2) {
    const f = parts[0]
    const g = parts[1]
    
    const fPrime = differentiateSingleTerm(f, variable, steps, rules)
    const gPrime = differentiateSingleTerm(g, variable, steps, rules)
    
    steps.push(`f = ${f}, g = ${g}`)
    steps.push(`f' = ${fPrime}, g' = ${gPrime}`)
    
    const result = `${fPrime}*${g} + ${f}*${gPrime}`
    steps.push(`Result: ${fPrime}*${g} + ${f}*${gPrime}`)
    
    return result
  }
  
  return term
}

// Evaluate expression at a point
export const evaluateAtPoint = (expression, variable, xValue) => {
  // Replace variable with the numerical value
  let expr = expression.toString()
  
  // Handle basic mathematical operations
  expr = expr.replace(new RegExp(`\\b${variable}\\b`, 'g'), xValue)
  expr = expr.replace(/\^/g, '**')
  
  // Handle mathematical functions
  expr = expr.replace(/sin\(/g, 'Math.sin(')
  expr = expr.replace(/cos\(/g, 'Math.cos(')
  expr = expr.replace(/tan\(/g, 'Math.tan(')
  expr = expr.replace(/ln\(/g, 'Math.log(')
  expr = expr.replace(/log\(/g, 'Math.log10(')
  expr = expr.replace(/sqrt\(/g, 'Math.sqrt(')
  
  // Handle e^x
  expr = expr.replace(/e\*\*/g, 'Math.exp(')
  expr = expr.replace(/exp\(/g, 'Math.exp(')
  
  try {
    const result = eval(expr)
    return result
  } catch (e) {
    console.error('Error evaluating expression:', e)
    return null
  }
}

// Get ordinal number
const getOrdinalNumber = (num) => {
  const ordinals = ['', '1st', '2nd', '3rd', '4th']
  return ordinals[num] || `${num}th`
}

// Format MathJax expression
export const formatMathJax = (expression) => {
  if (!expression) return ''
  
  let formatted = expression.toString()
  
  // Replace ** and ^ with proper exponents
  formatted = formatted.replace(/\*\*/g, '^')
  formatted = formatted.replace(/\^/g, '^')
  
  // Format functions properly
  formatted = formatted.replace(/sin\(/g, '\\sin(')
  formatted = formatted.replace(/cos\(/g, '\\cos(')
  formatted = formatted.replace(/tan\(/g, '\\tan(')
  formatted = formatted.replace(/ln\(/g, '\\ln(')
  formatted = formatted.replace(/log\(/g, '\\log(')
  formatted = formatted.replace(/sqrt\(/g, '\\sqrt{')
  formatted = formatted.replace(/exp\(/g, 'e^{')
  
  // Handle fractions
  formatted = formatted.replace(/(\d+)\/(\w+)/g, '\\frac{$1}{$2}')
  formatted = formatted.replace(/1\/(\w+)/g, '\\frac{1}{$1}')
  formatted = formatted.replace(/(\w+)\/(\w+)/g, '\\frac{$1}{$2}')
  
  // Clean up multiplication symbols
  formatted = formatted.replace(/\*/g, ' \\cdot ')
  
  // Handle negative signs properly
  formatted = formatted.replace(/\+ -/g, ' - ')
  formatted = formatted.replace(/^-/, '-')
  
  // Clean up extra spaces
  formatted = formatted.replace(/\s+/g, ' ').trim()
  
  return formatted
}

// Format step for display
export const formatStepForDisplay = (step) => {
  if (!step || step.trim() === '') return step
  
  // Don't format headers and empty lines - but keep them as-is
  if (step.startsWith('**') || step.includes('STEP') || step.trim() === '') {
    return step
  }
  
  let formatted = step
  
  // Handle function expressions like f(x) = expression, f'(x) = expression
  formatted = formatted.replace(/f([']*)\(([^)]+)\)\s*=\s*([^\n,]+)/g, (match, primes, variable, expression) => {
    return `f${primes}(${variable}) = \\(${formatMathJax(expression)}\\)`
  })
  
  // Handle derivative notation d/dx[...] = ...
  formatted = formatted.replace(/d\/d([^[]+)\[([^\]]+)\]\s*=\s*([^\n,\(]+)/g, (match, variable, expression, derivative) => {
    return `\\(\\frac{d}{d${variable}}[${formatMathJax(expression)}] = ${formatMathJax(derivative)}\\)`
  })
  
  // Handle arrows with expressions
  formatted = formatted.replace(/→\s*([x\d\+\-\*\^\/\(\)\.\w\s]+)$/g, (match, expression) => {
    return `→ \\(${formatMathJax(expression.trim())}\\)`
  })
  
  // Handle expressions after colons (like "Result: 3x^2 + 4x")
  formatted = formatted.replace(/:\s*([x\d\+\-\*\^\/\(\)\.\w\s]+)$/g, (match, expression) => {
    return `: \\(${formatMathJax(expression.trim())}\\)`
  })
  
  // Handle standalone mathematical expressions in parentheses or at end of sentence
  formatted = formatted.replace(/\b([x\d]+\^[x\d]+(?:\s*[\+\-]\s*[x\d\^]+)*)\b/g, (match, expression) => {
    return `\\(${formatMathJax(expression)}\\)`
  })
  
  // Handle coefficient expressions like "3x^2", "4x", etc when they appear standalone
  formatted = formatted.replace(/\b(\d+\*?[a-z]\^?\d*|\d+\*?[a-z])\b/g, (match, expression) => {
    return `\\(${formatMathJax(expression)}\\)`
  })
  
  // Handle simple fractions like "1/x"
  formatted = formatted.replace(/\b(\d+\/[a-z]+)\b/g, (match, expression) => {
    return `\\(${formatMathJax(expression)}\\)`
  })
  
  // Handle mathematical operations in explanations
  formatted = formatted.replace(/(\d+)\s*×\s*(\d+)\s*=\s*(\d+)/g, (match, num1, num2, result) => {
    return `\\(${num1} \\times ${num2} = ${result}\\)`
  })
  
  formatted = formatted.replace(/(\w+)\s*-\s*(\d+)\s*=\s*(\w+)/g, (match, expr1, num, result) => {
    return `\\(${expr1} - ${num} = ${result}\\)`
  })
  
  // Handle terms like "Term 1: x^3", "Term 2: 2x^2"
  formatted = formatted.replace(/Term\s+\d+:\s*([x\d\+\-\*\^\/\(\)\.\w]+)/g, (match, expression) => {
    return match.replace(expression, `\\(${formatMathJax(expression.trim())}\\)`)
  })
  
  // Handle "Coefficient: ..., Exponent: ..." expressions
  formatted = formatted.replace(/Coefficient:\s*([x\d\+\-\*\^\/\(\)\.\w]+),\s*Exponent:\s*([x\d\+\-\*\^\/\(\)\.\w]+)/g, (match, coeff, exp) => {
    return `Coefficient: \\(${formatMathJax(coeff)}\\), Exponent: \\(${formatMathJax(exp)}\\)`
  })
  
  // Handle "New coefficient: ..." and "New exponent: ..." lines
  formatted = formatted.replace(/(New coefficient|New exponent):\s*([x\d\+\-\*\^\/\(\)\.\w\s]+)$/g, (match, label, expression) => {
    return `${label}: \\(${formatMathJax(expression.trim())}\\)`
  })
  
  // Handle "Original: ..." lines
  formatted = formatted.replace(/Original:\s*([x\d\+\-\*\^\/\(\)\.\w\s]+)$/g, (match, expression) => {
    return `Original: \\(${formatMathJax(expression.trim())}\\)`
  })
  
  // Handle expressions in the format "f = expression, g = expression"
  formatted = formatted.replace(/f\s*=\s*([^,]+),\s*g\s*=\s*([^,\n]+)/g, (match, fExpr, gExpr) => {
    return `f = \\(${formatMathJax(fExpr.trim())}\\), g = \\(${formatMathJax(gExpr.trim())}\\)`
  })
  
  // Handle "f' = expression, g' = expression"
  formatted = formatted.replace(/f'\s*=\s*([^,]+),\s*g'\s*=\s*([^,\n]+)/g, (match, fPrimeExpr, gPrimeExpr) => {
    return `f' = \\(${formatMathJax(fPrimeExpr.trim())}\\), g' = \\(${formatMathJax(gPrimeExpr.trim())}\\)`
  })
  
  // Handle numerical substitutions like "Substituting x = 2:"
  formatted = formatted.replace(/Substituting\s+([a-z])\s*=\s*([x\d\+\-\*\^\/\(\)\.\w]+):/g, (match, variable, value) => {
    return `Substituting \\(${variable} = ${value}\\):`
  })
  
  return formatted
}
