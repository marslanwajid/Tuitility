class ElectricFluxCalculator {
  constructor() {
    // Constants
    this.COULOMB = 1;
    this.MILLICOULOMB = 1e-3;
    this.MICROCOULOMB = 1e-6;
    this.NANOCOULOMB = 1e-9;
    this.PICOCOULOMB = 1e-12;
    this.ELEMENTARY_CHARGE = 1.602176634e-19;
    this.AMPERE_HOUR = 3600;
    this.MILLIAMPERE_HOUR = 3.6;
    this.VACUUM_PERMITTIVITY = 8.85418782e-12; // ε₀ in F/m
  }

  validateInputs(electricField, angle, area, charge, permittivity) {
    const errors = [];

    // Validate electric field
    if (!electricField || electricField === '') {
      errors.push('Please enter the electric field value in V/m.');
    } else {
      const fieldNum = parseFloat(electricField);
      if (isNaN(fieldNum)) {
        errors.push('Please enter a valid electric field value.');
      } else if (fieldNum < 0) {
        errors.push('Electric field must be non-negative.');
      } else if (fieldNum > 1e12) {
        errors.push('Electric field value should be less than 1,000,000,000,000 V/m.');
      }
    }

    // Validate angle
    if (!angle || angle === '') {
      errors.push('Please enter the angle value in degrees.');
    } else {
      const angleNum = parseFloat(angle);
      if (isNaN(angleNum)) {
        errors.push('Please enter a valid angle value.');
      } else if (angleNum < 0 || angleNum > 180) {
        errors.push('Angle must be between 0 and 180 degrees.');
      }
    }

    // Validate area
    if (!area || area === '') {
      errors.push('Please enter the surface area value in m².');
    } else {
      const areaNum = parseFloat(area);
      if (isNaN(areaNum)) {
        errors.push('Please enter a valid surface area value.');
      } else if (areaNum <= 0) {
        errors.push('Surface area must be greater than 0.');
      } else if (areaNum > 1e12) {
        errors.push('Surface area value should be less than 1,000,000,000,000 m².');
      }
    }

    // Validate charge
    if (!charge || charge === '') {
      errors.push('Please enter the charge value.');
    } else {
      const chargeNum = parseFloat(charge);
      if (isNaN(chargeNum)) {
        errors.push('Please enter a valid charge value.');
      } else if (Math.abs(chargeNum) > 1e6) {
        errors.push('Charge value should be less than 1,000,000 in the selected unit.');
      }
    }

    // Validate permittivity
    if (!permittivity || permittivity === '') {
      errors.push('Please enter the permittivity value.');
    } else {
      const permNum = parseFloat(permittivity);
      if (isNaN(permNum)) {
        errors.push('Please enter a valid permittivity value.');
      } else if (permNum <= 0) {
        errors.push('Permittivity must be greater than 0.');
      } else if (permNum > 1e6) {
        errors.push('Permittivity value should be less than 1,000,000.');
      }
    }

    return errors;
  }

  calculateElectricFlux(electricField, angle, area, charge, chargeUnit, permittivity) {
    // Convert angle to radians
    const angleRadians = angle * (Math.PI / 180);

    // Calculate flux using E·A·cos(θ)
    const fluxEA = this.calculateFluxUsingEA(electricField, area, angleRadians);

    // Calculate flux using Gauss's Law (Q/ε₀)
    const fluxCharge = this.calculateFluxUsingCharge(charge, chargeUnit, permittivity);

    // Analyze flux characteristics
    const fluxType = this.categorizeFlux(fluxEA);
    const fieldStrength = this.categorizeFieldStrength(electricField);
    const surfaceOrientation = this.categorizeSurfaceOrientation(angle);
    const typicalApplication = this.getTypicalApplication(fluxEA, electricField);

    // Create calculation steps
    const calculationSteps = this.createCalculationSteps(
      electricField, angle, area, charge, chargeUnit, permittivity, fluxEA, fluxCharge
    );

    return {
      fluxEA: fluxEA,
      fluxCharge: fluxCharge,
      electricField: electricField,
      angle: angle,
      area: area,
      charge: charge,
      chargeUnit: chargeUnit,
      permittivity: permittivity,
      fluxType: fluxType,
      fieldStrength: fieldStrength,
      surfaceOrientation: surfaceOrientation,
      typicalApplication: typicalApplication,
      calculationSteps: calculationSteps
    };
  }

  calculateFluxUsingEA(electricField, area, angleRadians) {
    return electricField * area * Math.cos(angleRadians);
  }

  calculateFluxUsingCharge(charge, unit, permittivity) {
    // Convert charge to Coulombs based on selected unit
    let chargeInCoulombs = this.convertChargeToCoulombs(charge, unit);
    
    // Apply Gauss's Law: Φ = Q/ε₀
    const permittivityInFarads = permittivity * Math.pow(10, -12);
    return chargeInCoulombs / permittivityInFarads;
  }

  convertChargeToCoulombs(charge, unit) {
    switch(unit) {
      case 'Coulomb':
        return charge * this.COULOMB;
      case 'Millicoulomb':
        return charge * this.MILLICOULOMB;
      case 'Microcoulomb':
        return charge * this.MICROCOULOMB;
      case 'Nanocoulomb':
        return charge * this.NANOCOULOMB;
      case 'Picocoulomb':
        return charge * this.PICOCOULOMB;
      case 'Elementary charge':
        return charge * this.ELEMENTARY_CHARGE;
      case 'Ampère hours':
        return charge * this.AMPERE_HOUR;
      case 'Milliampere hours':
        return charge * this.MILLIAMPERE_HOUR;
      default:
        return charge;
    }
  }

  categorizeFlux(flux) {
    if (Math.abs(flux) >= 1000) return 'Very High Flux';
    if (Math.abs(flux) >= 100) return 'High Flux';
    if (Math.abs(flux) >= 10) return 'Medium Flux';
    if (Math.abs(flux) >= 1) return 'Low Flux';
    if (Math.abs(flux) >= 0.1) return 'Very Low Flux';
    return 'Minimal Flux';
  }

  categorizeFieldStrength(electricField) {
    if (electricField >= 1e6) return 'Very Strong (Lightning)';
    if (electricField >= 1e4) return 'Strong (High Voltage)';
    if (electricField >= 1e2) return 'Medium (Power Lines)';
    if (electricField >= 1) return 'Weak (Household)';
    if (electricField >= 1e-3) return 'Very Weak (Sensors)';
    return 'Minimal (Background)';
  }

  categorizeSurfaceOrientation(angle) {
    if (angle <= 5) return 'Nearly Perpendicular';
    if (angle <= 15) return 'Slightly Tilted';
    if (angle <= 45) return 'Moderately Tilted';
    if (angle <= 75) return 'Highly Tilted';
    if (angle <= 90) return 'Nearly Parallel';
    return 'Opposite Direction';
  }

  getTypicalApplication(flux, electricField) {
    if (Math.abs(flux) >= 1000) return 'High-power electrical systems, lightning research';
    if (Math.abs(flux) >= 100) return 'Power transmission, industrial equipment';
    if (Math.abs(flux) >= 10) return 'Household appliances, electronic devices';
    if (Math.abs(flux) >= 1) return 'Small electronic circuits, sensors';
    return 'Precision measurements, research applications';
  }

  createCalculationSteps(electricField, angle, area, charge, chargeUnit, permittivity, fluxEA, fluxCharge) {
    const steps = [];

    // Step 1: Given values
    steps.push({
      title: 'Given Values',
      content: `<ul><li>Electric Field: <span class="math-formula">${this.formatNumber(electricField, 1)} \\text{ V/m}</span></li><li>Surface Area: <span class="math-formula">${this.formatNumber(area, 1)} \\text{ m}^2</span></li><li>Angle: <span class="math-formula">${this.formatNumber(angle, 1)}°</span></li><li>Charge: <span class="math-formula">${this.formatNumber(charge, 3)} \\text{ ${chargeUnit}</span></li></ul>`
    });

    // Step 2: E·A·cos(θ) calculation
    steps.push({
      title: 'Method 1: E·A·cos(θ)',
      content: `<ul><li>Convert angle to radians: <span class="math-formula">\\theta = ${this.formatNumber(angle, 1)}° \\times \\frac{\\pi}{180} = ${this.formatNumber(angle * Math.PI / 180, 6)} \\text{ rad}</span></li><li>Apply formula: <span class="math-formula">\\Phi_E = E \\cdot A \\cdot \\cos(\\theta)</span></li><li>Calculate: <span class="math-formula">\\Phi_E = ${this.formatNumber(electricField, 1)} \\times ${this.formatNumber(area, 1)} \\times \\cos(${this.formatNumber(angle * Math.PI / 180, 6)})</span></li><li>Result: <span class="math-formula">\\Phi_E = ${this.formatNumber(fluxEA, 4)} \\text{ V} \\cdot \\text{m}</span></li></ul>`
    });

    // Step 3: Gauss's Law calculation
    const chargeInCoulombs = this.convertChargeToCoulombs(charge, chargeUnit);
    steps.push({
      title: 'Method 2: Gauss\'s Law',
      content: `<ul><li>Convert charge to Coulombs: <span class="math-formula">Q = ${this.formatNumber(chargeInCoulombs, 6)} \\text{ C}</span></li><li>Apply Gauss's Law: <span class="math-formula">\\Phi_E = \\frac{Q}{\\varepsilon_0}</span></li><li>Calculate: <span class="math-formula">\\Phi_E = \\frac{${this.formatNumber(chargeInCoulombs, 6)}}{${this.formatNumber(permittivity * 1e-12, 12)}}</span></li><li>Result: <span class="math-formula">\\Phi_E = ${fluxCharge.toExponential(4)} \\text{ V} \\cdot \\text{m}</span></li></ul>`
    });

    // Step 4: Comparison and analysis
    steps.push({
      title: 'Analysis',
      content: `<ul><li>E·A·cos(θ) method: <span class="math-formula">${this.formatNumber(fluxEA, 4)} \\text{ V} \\cdot \\text{m}</span></li><li>Gauss's Law method: <span class="math-formula">${fluxCharge.toExponential(4)} \\text{ V} \\cdot \\text{m}</span></li><li>Difference: <span class="math-formula">${this.formatNumber(Math.abs(fluxEA - fluxCharge), 4)} \\text{ V} \\cdot \\text{m}</span></li></ul>`
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

  // Utility method to get unit multiplier
  getUnitMultiplier(unit) {
    switch(unit) {
      case 'Coulomb': return this.COULOMB;
      case 'Millicoulomb': return this.MILLICOULOMB;
      case 'Microcoulomb': return this.MICROCOULOMB;
      case 'Nanocoulomb': return this.NANOCOULOMB;
      case 'Picocoulomb': return this.PICOCOULOMB;
      case 'Elementary charge': return this.ELEMENTARY_CHARGE;
      case 'Ampère hours': return this.AMPERE_HOUR;
      case 'Milliampere hours': return this.MILLIAMPERE_HOUR;
      default: return 1;
    }
  }

  // Get charge unit information
  getChargeUnitInfo() {
    return {
      'Coulomb': { multiplier: 1, symbol: 'C', description: 'Base SI unit of electric charge' },
      'Millicoulomb': { multiplier: 1e-3, symbol: 'mC', description: 'One thousandth of a Coulomb' },
      'Microcoulomb': { multiplier: 1e-6, symbol: 'μC', description: 'One millionth of a Coulomb' },
      'Nanocoulomb': { multiplier: 1e-9, symbol: 'nC', description: 'One billionth of a Coulomb' },
      'Picocoulomb': { multiplier: 1e-12, symbol: 'pC', description: 'One trillionth of a Coulomb' },
      'Elementary charge': { multiplier: 1.602176634e-19, symbol: 'e', description: 'Charge of a single electron' },
      'Ampère hours': { multiplier: 3600, symbol: 'Ah', description: 'Charge capacity unit for batteries' },
      'Milliampere hours': { multiplier: 3.6, symbol: 'mAh', description: 'Small battery capacity unit' }
    };
  }

  // Get typical electric field values
  getTypicalElectricFieldValues() {
    return {
      'Lightning': '1,000,000 V/m',
      'High Voltage Lines': '10,000 V/m',
      'Power Lines': '1,000 V/m',
      'Household Appliances': '100 V/m',
      'Electronic Devices': '10 V/m',
      'Sensors': '0.1 V/m',
      'Background': '0.001 V/m'
    };
  }

  // Calculate flux density
  calculateFluxDensity(flux, area) {
    return flux / area;
  }

  // Calculate electric field from flux
  calculateElectricFieldFromFlux(flux, area, angle) {
    const angleRadians = angle * (Math.PI / 180);
    return flux / (area * Math.cos(angleRadians));
  }

  // Get flux through different geometric shapes
  getFluxThroughShapes() {
    return {
      'Sphere': 'Φ = Q/ε₀ (Gauss\'s Law)',
      'Cylinder': 'Φ = E·A·cos(θ) for curved surface',
      'Plane': 'Φ = E·A·cos(θ)',
      'Cube': 'Sum of flux through all six faces'
    };
  }
}

export default ElectricFluxCalculator;
