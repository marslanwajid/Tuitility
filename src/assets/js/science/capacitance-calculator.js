class CapacitanceCalculator {
  constructor() {
    this.faradMultipliers = {
      'pF': 1e-12,  // picofarads
      'nF': 1e-9,   // nanofarads
      'μF': 1e-6,   // microfarads
      'mF': 1e-3,   // millifarads
      'F': 1        // farads
    };
  }

  validateInputs(energy, voltage) {
    const errors = [];

    // Check if both inputs are provided
    if (!energy || energy === '') {
      errors.push('Please enter the energy value in Joules.');
    } else {
      const energyNum = parseFloat(energy);
      if (isNaN(energyNum)) {
        errors.push('Please enter a valid energy value.');
      } else if (energyNum <= 0) {
        errors.push('Energy must be greater than 0.');
      } else if (energyNum > 1000000) {
        errors.push('Energy value should be less than 1,000,000 J.');
      }
    }

    if (!voltage || voltage === '') {
      errors.push('Please enter the voltage value in Volts.');
    } else {
      const voltageNum = parseFloat(voltage);
      if (isNaN(voltageNum)) {
        errors.push('Please enter a valid voltage value.');
      } else if (voltageNum <= 0) {
        errors.push('Voltage must be greater than 0.');
      } else if (voltageNum > 1000000) {
        errors.push('Voltage value should be less than 1,000,000 V.');
      }
    }

    return errors;
  }

  calculateCapacitance(energy, voltage) {
    // Calculate capacitance using the formula: C = 2E / V²
    const capacitance = (2 * energy) / Math.pow(voltage, 2);

    // Determine capacitor type and characteristics
    const capacitorType = this.categorizeCapacitor(capacitance);
    const typicalUse = this.getTypicalUse(capacitance);
    const energyDensity = this.calculateEnergyDensity(energy, capacitance);
    const capacitanceRange = this.getCapacitanceRange(capacitance);

    // Create calculation steps
    const calculationSteps = this.createCalculationSteps(energy, voltage, capacitance);

    return {
      capacitance: capacitance,
      energy: energy,
      voltage: voltage,
      capacitorType: capacitorType,
      typicalUse: typicalUse,
      energyDensity: energyDensity,
      capacitanceRange: capacitanceRange,
      calculationSteps: calculationSteps
    };
  }

  categorizeCapacitor(capacitance) {
    if (capacitance >= 1) return 'Supercapacitor';
    if (capacitance >= 0.001) return 'Electrolytic Capacitor';
    if (capacitance >= 1e-6) return 'Film Capacitor';
    if (capacitance >= 1e-9) return 'Ceramic Capacitor';
    if (capacitance >= 1e-12) return 'Small Ceramic Capacitor';
    return 'Very Small Capacitor';
  }

  getTypicalUse(capacitance) {
    if (capacitance >= 1) return 'Energy storage, backup power systems';
    if (capacitance >= 0.001) return 'Power supply filtering, audio circuits';
    if (capacitance >= 1e-6) return 'Signal coupling, timing circuits';
    if (capacitance >= 1e-9) return 'High-frequency filtering, RF circuits';
    if (capacitance >= 1e-12) return 'Oscillator circuits, precision timing';
    return 'Specialized applications';
  }

  calculateEnergyDensity(energy, capacitance) {
    // Energy density in J/F (Joules per Farad)
    const energyDensity = energy / capacitance;
    
    if (energyDensity >= 1000) return 'Very High';
    if (energyDensity >= 100) return 'High';
    if (energyDensity >= 10) return 'Medium';
    if (energyDensity >= 1) return 'Low';
    return 'Very Low';
  }

  getCapacitanceRange(capacitance) {
    if (capacitance >= 1) return '1 F - 5000 F (Supercapacitors)';
    if (capacitance >= 0.001) return '1 mF - 1000 mF (Electrolytic)';
    if (capacitance >= 1e-6) return '1 μF - 100 μF (Film/Ceramic)';
    if (capacitance >= 1e-9) return '1 nF - 1000 nF (Ceramic)';
    if (capacitance >= 1e-12) return '1 pF - 1000 pF (Small Ceramic)';
    return 'Sub-picofarad range';
  }

  createCalculationSteps(energy, voltage, capacitance) {
    const steps = [];

    // Step 1: Given values
    steps.push({
      title: 'Given Values',
      content: `<ul><li>Energy: <span class="math-formula">${this.formatNumber(energy, 3)} \\text{ J}</span></li><li>Voltage: <span class="math-formula">${this.formatNumber(voltage, 1)} \\text{ V}</span></li></ul>`
    });

    // Step 2: Formula
    steps.push({
      title: 'Formula Used',
      content: `<ul><li>Capacitance Formula: <span class="math-formula">C = \\frac{2E}{V^2}</span></li><li>Where: <span class="math-formula">C</span> = capacitance, <span class="math-formula">E</span> = energy, <span class="math-formula">V</span> = voltage</li></ul>`
    });

    // Step 3: Substitution
    steps.push({
      title: 'Substitution',
      content: `<ul><li>Substituting values: <span class="math-formula">C = \\frac{2 \\times ${this.formatNumber(energy, 3)}}{(${this.formatNumber(voltage, 1)})^2}</span></li><li>Simplifying: <span class="math-formula">C = \\frac{${this.formatNumber(2 * energy, 3)}}{${this.formatNumber(voltage * voltage, 2)}}</span></li></ul>`
    });

    // Step 4: Final calculation
    steps.push({
      title: 'Final Calculation',
      content: `<ul><li>Result: <span class="math-formula">C = ${this.formatNumber(capacitance, 6)} \\text{ F}</span></li><li>In practical units: <span class="math-formula">${this.formatCapacitance(capacitance)}</span></li></ul>`
    });

    return steps;
  }

  formatCapacitance(capacitance) {
    if (capacitance >= 1) {
      return `${this.formatNumber(capacitance, 3)} F`;
    } else if (capacitance >= 0.001) {
      return `${this.formatNumber(capacitance * 1000, 3)} mF`;
    } else if (capacitance >= 1e-6) {
      return `${this.formatNumber(capacitance * 1e6, 3)} μF`;
    } else if (capacitance >= 1e-9) {
      return `${this.formatNumber(capacitance * 1e9, 3)} nF`;
    } else {
      return `${this.formatNumber(capacitance * 1e12, 3)} pF`;
    }
  }

  formatNumber(value, decimals = 6) {
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

  // Utility method to convert capacitance to different units
  convertCapacitance(capacitance, fromUnit, toUnit) {
    const fromMultiplier = this.faradMultipliers[fromUnit] || 1;
    const toMultiplier = this.faradMultipliers[toUnit] || 1;
    
    const capacitanceInFarads = capacitance * fromMultiplier;
    return capacitanceInFarads / toMultiplier;
  }

  // Calculate energy from capacitance and voltage
  calculateEnergy(capacitance, voltage) {
    return 0.5 * capacitance * Math.pow(voltage, 2);
  }

  // Calculate voltage from capacitance and energy
  calculateVoltage(capacitance, energy) {
    return Math.sqrt((2 * energy) / capacitance);
  }

  // Get capacitor specifications for different types
  getCapacitorSpecifications() {
    return {
      'Electrolytic': {
        'Range': '1 μF - 10,000 μF',
        'Voltage': '6.3V - 500V',
        'Tolerance': '±20%',
        'Use': 'Power supply filtering, audio coupling'
      },
      'Ceramic': {
        'Range': '1 pF - 100 μF',
        'Voltage': '6.3V - 100V',
        'Tolerance': '±5% to ±20%',
        'Use': 'High-frequency filtering, decoupling'
      },
      'Film': {
        'Range': '1 nF - 100 μF',
        'Voltage': '50V - 1000V',
        'Tolerance': '±1% to ±10%',
        'Use': 'Timing circuits, signal coupling'
      },
      'Supercapacitor': {
        'Range': '0.1 F - 5000 F',
        'Voltage': '2.5V - 2.7V',
        'Tolerance': '±20%',
        'Use': 'Energy storage, backup power'
      }
    };
  }

  // Get typical capacitance values for common applications
  getTypicalCapacitanceValues() {
    return {
      'Power Supply Filtering': '100 μF - 10,000 μF',
      'Audio Coupling': '1 μF - 100 μF',
      'Timing Circuits': '1 nF - 100 nF',
      'RF Filtering': '1 pF - 100 pF',
      'Decoupling': '100 nF - 10 μF',
      'Motor Start': '100 μF - 1000 μF',
      'Energy Storage': '1 F - 100 F'
    };
  }

  // Calculate RC time constant
  calculateTimeConstant(capacitance, resistance) {
    return capacitance * resistance;
  }

  // Calculate cutoff frequency for RC filter
  calculateCutoffFrequency(capacitance, resistance) {
    return 1 / (2 * Math.PI * capacitance * resistance);
  }
}

export default CapacitanceCalculator;
