class LCMCalculatorLogic {
  constructor() {
    this.defaultValue = '12, 18, 24';
    this.methods = [
      { value: 'none', label: 'Direct Method' },
      { value: 'listing', label: 'Listing Multiples' },
      { value: 'prime', label: 'Prime Factorization' },
      { value: 'gcf', label: 'GCF Method' },
      { value: 'cake', label: 'Cake/Ladder Method' },
      { value: 'division', label: 'Division Method' }
    ];
  }

  resetFormData() {
    return {
      numbers: this.defaultValue,
      method: 'none'
    };
  }

  validateInput(value) {
    if (!value || value.trim() === '') return false;
    const numbers = value.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n > 0);
    return numbers.length >= 2;
  }

  gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      let t = b;
      b = a % b;
      a = t;
    }
    return a;
  }

  lcm(a, b) {
    return Math.abs((a * b) / this.gcd(a, b));
  }

  getPrimeFactors(n) {
    const factors = [];
    let divisor = 2;
    
    while (n > 1) {
      while (n % divisor === 0) {
        factors.push(divisor);
        n /= divisor;
      }
      divisor++;
      
      if (divisor > Math.sqrt(n)) {
        if (n > 1) {
          factors.push(n);
          break;
        }
      }
    }
    return factors;
  }

  calculateDirectMethod(numbers) {
    let result = numbers[0];
    let steps = ['Direct Method:'];
    
    for (let i = 1; i < numbers.length; i++) {
      const oldResult = result;
      result = this.lcm(result, numbers[i]);
      steps.push(`LCM(${oldResult}, ${numbers[i]}) = ${result}`);
    }
    
    steps.push(`Therefore, LCM of (${numbers.join(', ')}) = ${result}`);
    return { result, steps };
  }

  calculateByListing(numbers) {
    let steps = ['Solution (Listing Multiples):', `Value: (${numbers.join(', ')})`, 'Find and list multiples of each number until the first common multiple is found.'];
    
    let max = Math.max(...numbers);
    let lcmValue = max;
    let found = false;
    const maxIterations = 100000;
    let iterations = 0;

    while (!found && iterations < maxIterations) {
      found = numbers.every(num => lcmValue % num === 0);
      if (!found) lcmValue += max;
      iterations++;
    }

    if (iterations === maxIterations) {
      let result = numbers[0];
      for (let i = 1; i < numbers.length; i++) {
        result = this.lcm(result, numbers[i]);
      }
      lcmValue = result;
    }

    steps.push('Multiples of each number:');
    numbers.forEach(num => {
      let multiples = `${num}`;
      for (let i = 2; i <= Math.min(5, Math.floor(lcmValue/num)); i++) {
        multiples += `, ${num * i}`;
      }
      multiples += `, ..., ${lcmValue}`;
      steps.push(`• Multiples of ${num}: ${multiples}`);
    });

    steps.push(`Therefore, LCM of (${numbers.join(', ')}) = ${lcmValue}`);
    return { result: lcmValue, steps };
  }

  calculateByPrimeFactorization(numbers) {
    let steps = ['Prime Factorization Method:'];
    
    const allFactors = numbers.map(num => {
      const factors = this.getPrimeFactors(num);
      steps.push(`Prime factors of ${num} = ${factors.join(' × ')}`);
      return factors;
    });

    const maxFactors = new Map();
    allFactors.forEach(factors => {
      const factorCount = new Map();
      factors.forEach(factor => {
        factorCount.set(factor, (factorCount.get(factor) || 0) + 1);
      });
      
      factorCount.forEach((count, factor) => {
        if (!maxFactors.has(factor) || maxFactors.get(factor) < count) {
          maxFactors.set(factor, count);
        }
      });
    });

    let result = 1;
    let factorString = '';
    maxFactors.forEach((count, factor) => {
      factorString += `${factor}^${count} × `;
      result *= Math.pow(factor, count);
    });
    factorString = factorString.slice(0, -3);

    steps.push('Taking highest power of each prime factor:');
    steps.push(factorString);
    steps.push(`LCM = ${result}`);
    return { result, steps };
  }

  calculateByGCF(numbers) {
    let steps = ['Solution (GCF Method):', `Value: (${numbers.join(', ')})`, 'LCM = (a × b) / GCF(a,b)'];
    
    let result = numbers[0];
    
    for (let i = 1; i < numbers.length; i++) {
      const currentGCD = this.gcd(result, numbers[i]);
      const oldResult = result;
      result = (result * numbers[i]) / currentGCD;
      steps.push(`LCM of (${oldResult}, ${numbers[i]}) = ${result}`);
    }
    
    steps.push(`Therefore, LCM of (${numbers.join(', ')}) = ${result}`);
    return { result, steps };
  }

  calculateByCakeLadder(numbers) {
    let steps = ['Solution (Cake / Ladder Method):', `Value: (${numbers.join(', ')})`];
    
    let currentNumbers = [...numbers];
    let result = 1;
    let primeFactors = [];
    
    steps.push('Prime factorization table:');
    let tableSteps = [];
    
    while (!currentNumbers.every(n => n === 1)) {
      let smallestPrime = 2;
      while (!currentNumbers.some(n => n % smallestPrime === 0)) {
        smallestPrime++;
      }
      
      let row = [`Prime: ${smallestPrime}`];
      currentNumbers = currentNumbers.map(n => {
        const newN = n % smallestPrime === 0 ? n / smallestPrime : n;
        row.push(`${n} → ${newN}`);
        return newN;
      });
      tableSteps.push(row);
      primeFactors.push(smallestPrime);
      result *= smallestPrime;
    }

    steps.push('The LCM is the product of the numbers in the left column.');
    steps.push(`LCM = (${primeFactors.join(') (')})`);
    steps.push(`LCM = ${result}`);
    steps.push(`Therefore, LCM of (${numbers.join(', ')}) = ${result}`);
    
    return { result, steps, tableSteps };
  }

  calculateByDivision(numbers) {
    let steps = ['Solution (Division Method):', `Value: (${numbers.join(', ')})`, 'Write the numbers in the top row.', 'Divide the numbers by prime numbers until all become 1.'];
    
    let currentNumbers = [...numbers];
    let result = 1;
    let primeFactors = [];
    
    steps.push('Division table:');
    let tableSteps = [];
    
    while (!currentNumbers.every(n => n === 1)) {
      let divisor = 2;
      while (!currentNumbers.some(n => n % divisor === 0)) {
        divisor++;
      }
      
      let row = [`Divisor: ${divisor}`];
      currentNumbers = currentNumbers.map(n => {
        const newN = n % divisor === 0 ? n / divisor : n;
        row.push(`${n} → ${newN}`);
        return newN;
      });
      tableSteps.push(row);
      primeFactors.push(divisor);
      result *= divisor;
    }
    
    steps.push('You need to find the product of the prime numbers in the first column to get the LCM.');
    steps.push(`LCM = (${primeFactors.join(') (')})`);
    steps.push(`LCM = ${result}`);
    steps.push(`Therefore, LCM of (${numbers.join(', ')}) = ${result}`);
    
    return { result, steps, tableSteps };
  }

  calculate(formData) {
    let result, steps, error, tableSteps;

    try {
      const numbersInput = formData.numbers.trim();
      
      if (!numbersInput) {
        error = 'Please enter numbers.';
        return { result, steps, error, tableSteps };
      }

      // Parse and validate numbers
      const numbers = numbersInput.split(',')
        .map(n => parseInt(n.trim()))
        .filter(n => !isNaN(n) && n > 0);
      
      if (numbers.length < 2) {
        error = 'Please enter at least two valid positive numbers.';
        return { result, steps, error, tableSteps };
      }

      if (numbers.some(n => n > 1000000)) {
        error = 'Numbers must be less than 1,000,000 for performance reasons.';
        return { result, steps, error, tableSteps };
      }

      const method = formData.method || 'none';
      let calculationResult;
      
      switch(method) {
        case 'none':
          calculationResult = this.calculateDirectMethod(numbers);
          break;
        case 'listing':
          calculationResult = this.calculateByListing(numbers);
          break;
        case 'prime':
          calculationResult = this.calculateByPrimeFactorization(numbers);
          break;
        case 'gcf':
          calculationResult = this.calculateByGCF(numbers);
          break;
        case 'cake':
          calculationResult = this.calculateByCakeLadder(numbers);
          break;
        case 'division':
          calculationResult = this.calculateByDivision(numbers);
          break;
        default:
          calculationResult = this.calculateDirectMethod(numbers);
      }

      result = calculationResult.result;
      steps = calculationResult.steps;
      tableSteps = calculationResult.tableSteps;

    } catch (err) {
      error = 'An error occurred during calculation.';
      console.error('Calculation error:', err);
    }

    return {
      result,
      steps,
      error,
      tableSteps
    };
  }

  getMethods() {
    return this.methods;
  }

  getCalculationTypeLabel(value) {
    return 'LCM Calculator';
  }
}

export default new LCMCalculatorLogic();
