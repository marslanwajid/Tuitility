/**
 * Wave Speed Calculator - JavaScript Logic
 * Handles all wave speed calculations including frequency, wavelength, and wave properties
 */

class WaveSpeedCalculator {
  constructor() {
    // Default values
    this.maxFrequency = 1e15; // Maximum frequency (Hz)
    this.minFrequency = 1e-6; // Minimum frequency (Hz)
    this.maxWavelength = 1e6; // Maximum wavelength (m)
    this.minWavelength = 1e-12; // Minimum wavelength (m)
    this.speedOfLight = 299792458; // Speed of light in m/s
    this.speedOfSound = 343; // Speed of sound in air at 20°C (m/s)
  }

  /**
   * Validate all input parameters
   * @param {number} frequency - Frequency in Hz
   * @param {number} wavelength - Wavelength in meters
   * @returns {Array} Array of error messages, empty if valid
   */
  validateInputs(frequency, wavelength) {
    const errors = [];

    // Validate frequency
    if (!frequency || isNaN(frequency) || frequency < this.minFrequency || frequency > this.maxFrequency) {
      errors.push(`Please enter a valid frequency between ${this.minFrequency} and ${this.maxFrequency.toExponential()} Hz.`);
    }

    // Validate wavelength
    if (!wavelength || isNaN(wavelength) || wavelength < this.minWavelength || wavelength > this.maxWavelength) {
      errors.push(`Please enter a valid wavelength between ${this.minWavelength.toExponential()} and ${this.maxWavelength.toExponential()} m.`);
    }

    return errors;
  }

  /**
   * Calculate wave speed using the fundamental wave equation
   * @param {number} frequency - Frequency in Hz
   * @param {number} wavelength - Wavelength in meters
   * @returns {number} Wave speed in m/s
   */
  calculateWaveSpeedValue(frequency, wavelength) {
    return frequency * wavelength;
  }

  /**
   * Calculate wave period
   * @param {number} frequency - Frequency in Hz
   * @returns {number} Period in seconds
   */
  calculatePeriod(frequency) {
    return 1 / frequency;
  }

  /**
   * Calculate angular frequency
   * @param {number} frequency - Frequency in Hz
   * @returns {number} Angular frequency in rad/s
   */
  calculateAngularFrequency(frequency) {
    return 2 * Math.PI * frequency;
  }

  /**
   * Calculate wave number
   * @param {number} wavelength - Wavelength in meters
   * @returns {number} Wave number in rad/m
   */
  calculateWaveNumber(wavelength) {
    return 2 * Math.PI / wavelength;
  }

  /**
   * Determine wave type based on frequency
   * @param {number} frequency - Frequency in Hz
   * @returns {string} Wave type description
   */
  determineWaveType(frequency) {
    if (frequency < 20) return 'Infrasound';
    if (frequency >= 20 && frequency <= 20000) return 'Audible Sound';
    if (frequency > 20000 && frequency < 1e9) return 'Ultrasound';
    if (frequency >= 1e9 && frequency < 1e12) return 'Microwave';
    if (frequency >= 1e12 && frequency < 4.3e14) return 'Infrared';
    if (frequency >= 4.3e14 && frequency < 7.5e14) return 'Visible Light';
    if (frequency >= 7.5e14 && frequency < 1e16) return 'Ultraviolet';
    if (frequency >= 1e16 && frequency < 1e19) return 'X-ray';
    return 'Gamma Ray';
  }

  /**
   * Determine medium based on wave speed
   * @param {number} waveSpeed - Wave speed in m/s
   * @returns {string} Medium description
   */
  determineMedium(waveSpeed) {
    const tolerance = 0.1; // 10% tolerance
    
    if (Math.abs(waveSpeed - this.speedOfLight) / this.speedOfLight < tolerance) {
      return 'Vacuum (Electromagnetic Wave)';
    }
    if (Math.abs(waveSpeed - this.speedOfSound) / this.speedOfSound < tolerance) {
      return 'Air (Sound Wave)';
    }
    if (waveSpeed < 1000) {
      return 'Liquid or Gas';
    }
    if (waveSpeed < 10000) {
      return 'Solid Material';
    }
    if (waveSpeed > 0.5 * this.speedOfLight) {
      return 'Dense Optical Medium';
    }
    return 'Unknown Medium';
  }

  /**
   * Calculate wave energy (for electromagnetic waves)
   * @param {number} frequency - Frequency in Hz
   * @returns {number} Energy in Joules
   */
  calculateWaveEnergy(frequency) {
    const planckConstant = 6.626e-34; // Planck's constant in J⋅s
    return planckConstant * frequency;
  }

  /**
   * Calculate wave momentum (for electromagnetic waves)
   * @param {number} frequency - Frequency in Hz
   * @returns {number} Momentum in kg⋅m/s
   */
  calculateWaveMomentum(frequency) {
    const planckConstant = 6.626e-34; // Planck's constant in J⋅s
    return planckConstant * frequency / this.speedOfLight;
  }

  /**
   * Main calculation function for wave speed
   * @param {number} frequency - Frequency in Hz
   * @param {number} wavelength - Wavelength in meters
   * @returns {Object} Comprehensive wave speed calculation results
   */
  calculateWaveSpeed(frequency, wavelength) {
    // Convert to numbers and validate
    frequency = parseFloat(frequency);
    wavelength = parseFloat(wavelength);

    // Calculate wave speed
    const waveSpeed = this.calculateWaveSpeedValue(frequency, wavelength);

    // Calculate additional wave properties
    const period = this.calculatePeriod(frequency);
    const angularFrequency = this.calculateAngularFrequency(frequency);
    const waveNumber = this.calculateWaveNumber(wavelength);
    const waveType = this.determineWaveType(frequency);
    const medium = this.determineMedium(waveSpeed);
    const energy = this.calculateWaveEnergy(frequency);
    const momentum = this.calculateWaveMomentum(frequency);

    return {
      // Input values
      frequency: frequency,
      wavelength: wavelength,

      // Main calculations
      waveSpeed: this.roundToPrecision(waveSpeed, 2),
      period: this.roundToPrecision(period, 6),
      angularFrequency: this.roundToPrecision(angularFrequency, 2),
      waveNumber: this.roundToPrecision(waveNumber, 2),
      energy: this.roundToPrecision(energy, 20),
      momentum: this.roundToPrecision(momentum, 20),

      // Wave classification
      waveType: waveType,
      medium: medium,

      // Formatted values for display
      frequencyFormatted: this.formatNumber(frequency, 2),
      wavelengthFormatted: this.formatNumber(wavelength, 2),
      waveSpeedFormatted: this.formatNumber(waveSpeed, 2),
      periodFormatted: this.formatNumber(period, 6),
      angularFrequencyFormatted: this.formatNumber(angularFrequency, 2),
      waveNumberFormatted: this.formatNumber(waveNumber, 2),
      energyFormatted: this.formatScientific(energy),
      momentumFormatted: this.formatScientific(momentum)
    };
  }

  /**
   * Calculate frequency from wavelength and wave speed
   * @param {number} wavelength - Wavelength in meters
   * @param {number} waveSpeed - Wave speed in m/s
   * @returns {Object} Frequency calculation results
   */
  calculateFrequency(wavelength, waveSpeed) {
    const frequency = waveSpeed / wavelength;
    const period = 1 / frequency;
    const angularFrequency = 2 * Math.PI * frequency;

    return {
      frequency: this.roundToPrecision(frequency, 2),
      period: this.roundToPrecision(period, 6),
      angularFrequency: this.roundToPrecision(angularFrequency, 2),
      waveType: this.determineWaveType(frequency),
      medium: this.determineMedium(waveSpeed),
      frequencyFormatted: this.formatNumber(frequency, 2),
      periodFormatted: this.formatNumber(period, 6),
      angularFrequencyFormatted: this.formatNumber(angularFrequency, 2)
    };
  }

  /**
   * Calculate wavelength from frequency and wave speed
   * @param {number} frequency - Frequency in Hz
   * @param {number} waveSpeed - Wave speed in m/s
   * @returns {Object} Wavelength calculation results
   */
  calculateWavelength(frequency, waveSpeed) {
    const wavelength = waveSpeed / frequency;
    const waveNumber = 2 * Math.PI / wavelength;

    return {
      wavelength: this.roundToPrecision(wavelength, 2),
      waveNumber: this.roundToPrecision(waveNumber, 2),
      waveType: this.determineWaveType(frequency),
      medium: this.determineMedium(waveSpeed),
      wavelengthFormatted: this.formatNumber(wavelength, 2),
      waveNumberFormatted: this.formatNumber(waveNumber, 2)
    };
  }

  /**
   * Compare different wave scenarios
   * @param {Array} scenarios - Array of wave scenarios
   * @returns {Object} Wave comparison results
   */
  compareWaveScenarios(scenarios) {
    const comparisons = scenarios.map(scenario => {
      const result = this.calculateWaveSpeed(scenario.frequency, scenario.wavelength);
      return {
        ...result,
        scenarioName: scenario.name || `${scenario.frequency} Hz Wave`
      };
    });

    // Sort by wave speed (ascending)
    comparisons.sort((a, b) => a.waveSpeed - b.waveSpeed);

    return {
      scenarios: comparisons,
      slowestWave: comparisons[0],
      fastestWave: comparisons[comparisons.length - 1],
      averageSpeed: comparisons.reduce((sum, scenario) => sum + scenario.waveSpeed, 0) / comparisons.length
    };
  }

  /**
   * Calculate wave interference patterns
   * @param {number} frequency1 - First wave frequency
   * @param {number} frequency2 - Second wave frequency
   * @param {number} wavelength1 - First wave wavelength
   * @param {number} wavelength2 - Second wave wavelength
   * @returns {Object} Interference analysis results
   */
  calculateInterference(frequency1, frequency2, wavelength1, wavelength2) {
    const waveSpeed1 = this.calculateWaveSpeedValue(frequency1, wavelength1);
    const waveSpeed2 = this.calculateWaveSpeedValue(frequency2, wavelength2);
    const beatFrequency = Math.abs(frequency1 - frequency2);
    const averageFrequency = (frequency1 + frequency2) / 2;
    const averageWavelength = (wavelength1 + wavelength2) / 2;

    return {
      waveSpeed1: this.roundToPrecision(waveSpeed1, 2),
      waveSpeed2: this.roundToPrecision(waveSpeed2, 2),
      beatFrequency: this.roundToPrecision(beatFrequency, 2),
      averageFrequency: this.roundToPrecision(averageFrequency, 2),
      averageWavelength: this.roundToPrecision(averageWavelength, 2),
      speedDifference: this.roundToPrecision(Math.abs(waveSpeed1 - waveSpeed2), 2),
      waveSpeed1Formatted: this.formatNumber(waveSpeed1, 2),
      waveSpeed2Formatted: this.formatNumber(waveSpeed2, 2),
      beatFrequencyFormatted: this.formatNumber(beatFrequency, 2),
      averageFrequencyFormatted: this.formatNumber(averageFrequency, 2),
      averageWavelengthFormatted: this.formatNumber(averageWavelength, 2)
    };
  }

  /**
   * Calculate wave resonance conditions
   * @param {number} frequency - Driving frequency
   * @param {number} naturalFrequency - Natural frequency of the system
   * @param {number} wavelength - Wavelength
   * @returns {Object} Resonance analysis results
   */
  calculateResonance(frequency, naturalFrequency, wavelength) {
    const waveSpeed = this.calculateWaveSpeedValue(frequency, wavelength);
    const frequencyRatio = frequency / naturalFrequency;
    const resonanceCondition = Math.abs(frequencyRatio - 1) < 0.1; // Within 10% of natural frequency
    const resonanceStrength = 1 / Math.abs(frequencyRatio - 1);

    return {
      waveSpeed: this.roundToPrecision(waveSpeed, 2),
      frequencyRatio: this.roundToPrecision(frequencyRatio, 3),
      resonanceCondition: resonanceCondition,
      resonanceStrength: this.roundToPrecision(resonanceStrength, 2),
      waveSpeedFormatted: this.formatNumber(waveSpeed, 2),
      frequencyRatioFormatted: this.formatNumber(frequencyRatio, 3),
      resonanceStrengthFormatted: this.formatNumber(resonanceStrength, 2)
    };
  }

  /**
   * Round to specified precision
   * @param {number} value - Value to round
   * @param {number} precision - Number of decimal places
   * @returns {number} Rounded value
   */
  roundToPrecision(value, precision) {
    return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
  }

  /**
   * Format number for display
   * @param {number} value - Value to format
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted number string
   */
  formatNumber(value, decimals = 2) {
    return parseFloat(value).toFixed(decimals);
  }

  /**
   * Format scientific notation
   * @param {number} value - Value to format
   * @returns {string} Formatted scientific notation string
   */
  formatScientific(value) {
    return value.toExponential(2);
  }

  /**
   * Get common wave speed values
   * @returns {Object} Common wave speed values
   */
  getCommonWaveSpeeds() {
    return {
      'Light in Vacuum': 299792458,
      'Light in Water': 225000000,
      'Light in Glass': 200000000,
      'Sound in Air (20°C)': 343,
      'Sound in Water': 1482,
      'Sound in Steel': 5000,
      'Sound in Wood': 3300,
      'Radio Waves': 299792458,
      'Microwaves': 299792458,
      'X-rays': 299792458
    };
  }

  /**
   * Get electromagnetic spectrum ranges
   * @returns {Object} Electromagnetic spectrum frequency ranges
   */
  getElectromagneticSpectrum() {
    return {
      'Radio Waves': { min: 3e3, max: 3e11 },
      'Microwaves': { min: 3e8, max: 3e11 },
      'Infrared': { min: 3e11, max: 4.3e14 },
      'Visible Light': { min: 4.3e14, max: 7.5e14 },
      'Ultraviolet': { min: 7.5e14, max: 3e16 },
      'X-rays': { min: 3e16, max: 3e19 },
      'Gamma Rays': { min: 3e19, max: 3e22 }
    };
  }
}

// Export for use in React component
export default WaveSpeedCalculator;
