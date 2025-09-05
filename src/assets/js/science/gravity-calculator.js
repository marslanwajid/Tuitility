/**
 * Gravity Calculator - JavaScript Logic
 * Calculates gravitational force and acceleration between two masses
 */

class GravityCalculator {
  constructor() {
    // Physical constants
    this.EARTH_MASS = 5.972e24; // kg
    this.SUN_MASS = 1.989e30; // kg
    
    // Conversion factors
    this.massConversion = {
      'kg': 1,
      'g': 0.001,
      'mg': 0.000001,
      'lb': 0.45359237,
      'earth': this.EARTH_MASS,
      'sun': this.SUN_MASS
    };
    
    this.distanceConversion = {
      'm': 1,
      'km': 1000,
      'cm': 0.01,
      'mm': 0.001,
      'mi': 1609.34,
      'au': 149597870700,
      'ly': 9.461e15
    };

    // Example data
    this.examples = {
      'earth-moon': {
        mass1: 5.972,
        mass1Unit: 'earth',
        mass2: 7.342,
        mass2Unit: 'g',
        distance: 384400,
        distanceUnit: 'km'
      },
      'earth-sun': {
        mass1: 1,
        mass1Unit: 'sun',
        mass2: 1,
        mass2Unit: 'earth',
        distance: 1,
        distanceUnit: 'au'
      },
      'sun-jupiter': {
        mass1: 1,
        mass1Unit: 'sun',
        mass2: 317.8,
        mass2Unit: 'earth',
        distance: 5.2,
        distanceUnit: 'au'
      },
      'lab': {
        mass1: 1,
        mass1Unit: 'kg',
        mass2: 1,
        mass2Unit: 'kg',
        distance: 1,
        distanceUnit: 'm'
      },
      'binary-stars': {
        mass1: 1.5,
        mass1Unit: 'sun',
        mass2: 0.8,
        mass1Unit: 'sun',
        distance: 0.01,
        distanceUnit: 'ly'
      }
    };
  }

  /**
   * Validate input values
   */
  validateInputs(formData) {
    const { mass1, mass2, distance, gravitationalConstant } = formData;
    
    if (!mass1 || !mass2 || !distance || !gravitationalConstant) {
      throw new Error('Please fill in all fields.');
    }
    
    const mass1Num = parseFloat(mass1);
    const mass2Num = parseFloat(mass2);
    const distanceNum = parseFloat(distance);
    const gConstantNum = parseFloat(gravitationalConstant);
    
    if (isNaN(mass1Num) || isNaN(mass2Num) || isNaN(distanceNum) || isNaN(gConstantNum)) {
      throw new Error('Please enter valid numbers for all fields.');
    }
    
    if (mass1Num <= 0 || mass2Num <= 0 || distanceNum <= 0 || gConstantNum <= 0) {
      throw new Error('All values must be positive.');
    }
    
    return {
      mass1: mass1Num,
      mass2: mass2Num,
      distance: distanceNum,
      gravitationalConstant: gConstantNum
    };
  }

  /**
   * Convert mass to kilograms
   */
  convertMassToKg(mass, unit) {
    if (!this.massConversion[unit]) {
      throw new Error(`Unknown mass unit: ${unit}`);
    }
    return mass * this.massConversion[unit];
  }

  /**
   * Convert distance to meters
   */
  convertDistanceToMeters(distance, unit) {
    if (!this.distanceConversion[unit]) {
      throw new Error(`Unknown distance unit: ${unit}`);
    }
    return distance * this.distanceConversion[unit];
  }

  /**
   * Calculate gravitational force
   */
  calculateGravitationalForce(mass1Kg, mass2Kg, distanceMeters, gConstant) {
    const gConstantSI = gConstant * 1e-11; // Convert to SI units
    return gConstantSI * (mass1Kg * mass2Kg) / Math.pow(distanceMeters, 2);
  }

  /**
   * Calculate gravitational acceleration
   */
  calculateGravitationalAcceleration(massKg, distanceMeters, gConstant) {
    const gConstantSI = gConstant * 1e-11; // Convert to SI units
    return gConstantSI * massKg / Math.pow(distanceMeters, 2);
  }

  /**
   * Format number for display
   */
  formatNumber(num) {
    if (Math.abs(num) < 0.001 || Math.abs(num) >= 10000) {
      const exp = Math.floor(Math.log10(Math.abs(num)));
      const mantissa = num / Math.pow(10, exp);
      return `${mantissa.toFixed(4)} × 10^${exp}`;
    } else {
      return parseFloat(num.toFixed(4)).toString();
    }
  }

  /**
   * Format number with units
   */
  formatNumberWithUnits(num, units) {
    return `${this.formatNumber(num)} ${units}`;
  }

  /**
   * Get example data
   */
  getExample(exampleName) {
    return this.examples[exampleName] || null;
  }

  /**
   * Main calculation function
   */
  calculateGravity(formData) {
    try {
      // Validate inputs
      const validatedData = this.validateInputs(formData);
      
      // Convert to SI units
      const mass1InKg = this.convertMassToKg(validatedData.mass1, formData.mass1Unit || 'kg');
      const mass2InKg = this.convertMassToKg(validatedData.mass2, formData.mass2Unit || 'kg');
      const distanceInMeters = this.convertDistanceToMeters(validatedData.distance, formData.distanceUnit || 'm');
      
      // Calculate gravitational force
      const force = this.calculateGravitationalForce(
        mass1InKg, 
        mass2InKg, 
        distanceInMeters, 
        validatedData.gravitationalConstant
      );
      
      // Calculate gravitational accelerations
      const acceleration1 = this.calculateGravitationalAcceleration(
        mass2InKg, 
        distanceInMeters, 
        validatedData.gravitationalConstant
      );
      
      const acceleration2 = this.calculateGravitationalAcceleration(
        mass1InKg, 
        distanceInMeters, 
        validatedData.gravitationalConstant
      );
      
      // Format results
      const result = {
        force: this.formatNumberWithUnits(force, 'N'),
        acceleration1: this.formatNumberWithUnits(acceleration1, 'm/s²'),
        acceleration2: this.formatNumberWithUnits(acceleration2, 'm/s²'),
        mass1InKg: this.formatNumberWithUnits(mass1InKg, 'kg'),
        mass2InKg: this.formatNumberWithUnits(mass2InKg, 'kg'),
        distanceInMeters: this.formatNumberWithUnits(distanceInMeters, 'm'),
        gConstant: `${validatedData.gravitationalConstant} × 10⁻¹¹ m³/(kg⋅s²)`,
        rawData: {
          force,
          acceleration1,
          acceleration2,
          mass1InKg,
          mass2InKg,
          distanceInMeters,
          gConstant: validatedData.gravitationalConstant
        }
      };
      
      return result;
      
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Calculate gravitational potential energy
   */
  calculatePotentialEnergy(mass1Kg, mass2Kg, distanceMeters, gConstant) {
    const gConstantSI = gConstant * 1e-11;
    return -gConstantSI * (mass1Kg * mass2Kg) / distanceMeters;
  }

  /**
   * Calculate escape velocity
   */
  calculateEscapeVelocity(massKg, distanceMeters, gConstant) {
    const gConstantSI = gConstant * 1e-11;
    return Math.sqrt(2 * gConstantSI * massKg / distanceMeters);
  }

  /**
   * Calculate orbital velocity
   */
  calculateOrbitalVelocity(massKg, distanceMeters, gConstant) {
    const gConstantSI = gConstant * 1e-11;
    return Math.sqrt(gConstantSI * massKg / distanceMeters);
  }

  /**
   * Calculate orbital period
   */
  calculateOrbitalPeriod(massKg, distanceMeters, gConstant) {
    const gConstantSI = gConstant * 1e-11;
    return 2 * Math.PI * Math.sqrt(Math.pow(distanceMeters, 3) / (gConstantSI * massKg));
  }

  /**
   * Compare gravitational scenarios
   */
  compareScenarios(scenario1, scenario2) {
    const result1 = this.calculateGravity(scenario1);
    const result2 = this.calculateGravity(scenario2);
    
    return {
      scenario1: result1,
      scenario2: result2,
      forceRatio: result1.rawData.force / result2.rawData.force,
      accelerationRatio: result1.rawData.acceleration1 / result2.rawData.acceleration1
    };
  }

  /**
   * Calculate gravitational field strength
   */
  calculateFieldStrength(massKg, distanceMeters, gConstant) {
    const gConstantSI = gConstant * 1e-11;
    return gConstantSI * massKg / Math.pow(distanceMeters, 2);
  }

  /**
   * Calculate gravitational time dilation
   */
  calculateTimeDilation(massKg, distanceMeters, gConstant) {
    const gConstantSI = gConstant * 1e-11;
    const c = 299792458; // Speed of light in m/s
    const rs = 2 * gConstantSI * massKg / Math.pow(c, 2); // Schwarzschild radius
    return Math.sqrt(1 - rs / distanceMeters);
  }

  /**
   * Get gravitational constant in different units
   */
  getGravitationalConstant(unit = 'SI') {
    const constants = {
      'SI': 6.67430e-11, // m³/(kg⋅s²)
      'cgs': 6.67430e-8, // cm³/(g⋅s²)
      'au': 1.32712440018e20, // AU³/(M☉⋅yr²)
      'planck': 1 // In Planck units
    };
    return constants[unit] || constants['SI'];
  }

  /**
   * Calculate tidal forces
   */
  calculateTidalForces(massKg, distanceMeters, objectSize, gConstant) {
    const gConstantSI = gConstant * 1e-11;
    const tidalAcceleration = 2 * gConstantSI * massKg * objectSize / Math.pow(distanceMeters, 3);
    return tidalAcceleration;
  }

  /**
   * Calculate Roche limit
   */
  calculateRocheLimit(primaryMassKg, secondaryDensity, gConstant) {
    const gConstantSI = gConstant * 1e-11;
    const rocheLimit = 2.456 * Math.pow(primaryMassKg / (gConstantSI * secondaryDensity), 1/3);
    return rocheLimit;
  }
}

// Export for use in React component
export default GravityCalculator;

