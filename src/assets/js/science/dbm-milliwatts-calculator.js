class DBmMilliwattsCalculator {
  constructor() {
    this.referencePower = 1; // 1 mW reference for dBm
  }

  validateInputs(dbm, milliwatts) {
    const errors = [];

    // Check if at least one input is provided
    if ((!dbm || dbm === '') && (!milliwatts || milliwatts === '')) {
      errors.push('Please enter either a DBm value or a milliwatts value.');
      return errors;
    }

    // Validate DBm input if provided
    if (dbm && dbm !== '') {
      const dbmNum = parseFloat(dbm);
      if (isNaN(dbmNum)) {
        errors.push('Please enter a valid DBm value.');
      } else if (dbmNum < -200 || dbmNum > 200) {
        errors.push('DBm value should be between -200 and 200 dBm.');
      }
    }

    // Validate milliwatts input if provided
    if (milliwatts && milliwatts !== '') {
      const milliwattsNum = parseFloat(milliwatts);
      if (isNaN(milliwattsNum)) {
        errors.push('Please enter a valid milliwatts value.');
      } else if (milliwattsNum <= 0) {
        errors.push('Milliwatts value must be greater than 0.');
      } else if (milliwattsNum > 1000000) {
        errors.push('Milliwatts value should be less than 1,000,000 mW.');
      }
    }

    return errors;
  }

  calculateDBmToMilliwatts(dbm, milliwatts) {
    let resultDBm, resultMilliwatts;

    // If DBm is provided, calculate milliwatts
    if (dbm && dbm !== '') {
      resultDBm = parseFloat(dbm);
      resultMilliwatts = Math.pow(10, resultDBm / 10);
    }
    // If milliwatts is provided, calculate DBm
    else if (milliwatts && milliwatts !== '') {
      resultMilliwatts = parseFloat(milliwatts);
      resultDBm = 10 * Math.log10(resultMilliwatts);
    }

    // Calculate watts
    const watts = resultMilliwatts / 1000;

    // Determine power level category
    const powerLevel = this.categorizePowerLevel(resultDBm);
    const typicalUse = this.getTypicalUse(resultDBm);
    const signalStrength = this.getSignalStrength(resultDBm);

    // Create calculation steps
    const calculationSteps = this.createCalculationSteps(resultDBm, resultMilliwatts);

    return {
      dbm: resultDBm,
      milliwatts: resultMilliwatts,
      watts: watts,
      powerLevel: powerLevel,
      typicalUse: typicalUse,
      signalStrength: signalStrength,
      calculationSteps: calculationSteps
    };
  }

  categorizePowerLevel(dbm) {
    if (dbm >= 50) return 'Very High Power';
    if (dbm >= 30) return 'High Power';
    if (dbm >= 10) return 'Medium Power';
    if (dbm >= 0) return 'Low Power';
    if (dbm >= -30) return 'Very Low Power';
    if (dbm >= -60) return 'Micro Power';
    return 'Nano Power';
  }

  getTypicalUse(dbm) {
    if (dbm >= 50) return 'High-power RF transmitters, radar systems';
    if (dbm >= 30) return 'Cell towers, broadcast transmitters';
    if (dbm >= 20) return 'WiFi routers, wireless access points';
    if (dbm >= 10) return 'Bluetooth devices, small transmitters';
    if (dbm >= 0) return 'Portable devices, sensors';
    if (dbm >= -30) return 'Received signals, low-power devices';
    if (dbm >= -60) return 'Weak received signals, noise floor';
    return 'Very weak signals, background noise';
  }

  getSignalStrength(dbm) {
    if (dbm >= 30) return 'Excellent';
    if (dbm >= 20) return 'Very Good';
    if (dbm >= 10) return 'Good';
    if (dbm >= 0) return 'Fair';
    if (dbm >= -20) return 'Poor';
    if (dbm >= -40) return 'Very Poor';
    if (dbm >= -60) return 'Weak';
    return 'Very Weak';
  }

  createCalculationSteps(dbm, milliwatts) {
    const steps = [];

    // Step 1: Given values
    steps.push({
      title: 'Given Values',
      content: `<ul><li>Power in dBm: ${this.formatNumber(dbm, 2)} dBm</li><li>Power in milliwatts: ${this.formatNumber(milliwatts, 4)} mW</li></ul>`
    });

    // Step 2: Formula application
    if (dbm !== undefined) {
      steps.push({
        title: 'DBm to Milliwatts Formula',
        content: `<ul><li>Formula: <span class="math-formula">P(mW) = 10^{(\\text{dBm} / 10)}</span></li><li>Substitution: <span class="math-formula">P(mW) = 10^{(${this.formatNumber(dbm, 2)} / 10)}</span></li></ul>`
      });

      steps.push({
        title: 'Calculation Steps',
        content: `<ul><li>Divide dBm by 10: <span class="math-formula">${this.formatNumber(dbm, 2)} ÷ 10 = ${this.formatNumber(dbm / 10, 4)}</span></li><li>Calculate 10 raised to power: <span class="math-formula">10^{${this.formatNumber(dbm / 10, 4)}} = ${this.formatNumber(milliwatts, 4)}</span></li></ul>`
      });
    } else {
      steps.push({
        title: 'Milliwatts to DBm Formula',
        content: `<ul><li>Formula: <span class="math-formula">\\text{dBm} = 10 \\times \\log_{10}(P(mW))</span></li><li>Substitution: <span class="math-formula">\\text{dBm} = 10 \\times \\log_{10}(${this.formatNumber(milliwatts, 4)})</span></li></ul>`
      });

      steps.push({
        title: 'Calculation Steps',
        content: `<ul><li>Calculate log₁₀: <span class="math-formula">\\log_{10}(${this.formatNumber(milliwatts, 4)}) = ${this.formatNumber(Math.log10(milliwatts), 4)}</span></li><li>Multiply by 10: <span class="math-formula">10 \\times ${this.formatNumber(Math.log10(milliwatts), 4)} = ${this.formatNumber(dbm, 2)}</span></li></ul>`
      });
    }

    // Step 3: Final results
    steps.push({
      title: 'Final Results',
      content: `<ul><li>Power in dBm: <span class="math-formula">${this.formatNumber(dbm, 2)} \\text{ dBm}</span></li><li>Power in milliwatts: <span class="math-formula">${this.formatNumber(milliwatts, 4)} \\text{ mW}</span></li><li>Power in watts: <span class="math-formula">${this.formatNumber(milliwatts / 1000, 6)} \\text{ W}</span></li></ul>`
    });

    return steps;
  }

  formatNumber(value, decimals = 4) {
    if (value === undefined || value === null || isNaN(value)) {
      return '0';
    }
    return parseFloat(value).toFixed(decimals);
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  formatPercentage(value) {
    return `${parseFloat(value).toFixed(2)}%`;
  }

  // Utility method to convert any power unit to dBm
  convertToDBm(power, unit) {
    let milliwatts;
    
    switch (unit.toLowerCase()) {
      case 'mw':
      case 'milliwatts':
        milliwatts = power;
        break;
      case 'w':
      case 'watts':
        milliwatts = power * 1000;
        break;
      case 'uw':
      case 'microwatts':
        milliwatts = power / 1000;
        break;
      case 'nw':
      case 'nanowatts':
        milliwatts = power / 1000000;
        break;
      default:
        throw new Error('Unsupported power unit');
    }
    
    return 10 * Math.log10(milliwatts);
  }

  // Utility method to convert dBm to any power unit
  convertFromDBm(dbm, unit) {
    const milliwatts = Math.pow(10, dbm / 10);
    
    switch (unit.toLowerCase()) {
      case 'mw':
      case 'milliwatts':
        return milliwatts;
      case 'w':
      case 'watts':
        return milliwatts / 1000;
      case 'uw':
      case 'microwatts':
        return milliwatts * 1000;
      case 'nw':
      case 'nanowatts':
        return milliwatts * 1000000;
      default:
        throw new Error('Unsupported power unit');
    }
  }

  // Get power level reference information
  getPowerLevelReference() {
    return {
      '0 dBm': '1 mW (reference point)',
      '10 dBm': '10 mW',
      '20 dBm': '100 mW',
      '30 dBm': '1 W',
      '-10 dBm': '0.1 mW',
      '-20 dBm': '0.01 mW',
      '-30 dBm': '0.001 mW (1 μW)',
      '-60 dBm': '0.000001 mW (1 nW)'
    };
  }

  // Get typical power levels for different applications
  getTypicalPowerLevels() {
    return {
      'WiFi Router': '15-20 dBm',
      'Bluetooth Device': '0-10 dBm',
      'Cell Phone (transmit)': '20-30 dBm',
      'Cell Phone (receive)': '-50 to -100 dBm',
      'FM Radio Station': '50-100 dBm',
      'Satellite TV': '-60 to -80 dBm',
      'GPS Signal': '-130 to -150 dBm',
      'Noise Floor': '-90 to -100 dBm'
    };
  }
}

export default DBmMilliwattsCalculator;
