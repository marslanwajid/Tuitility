/**
 * DBm to Milliwatts Calculator
 * Handles conversions between dBm and milliwatts with detailed step-by-step calculations
 */

class DBmMilliwattsCalculator {
  constructor() {
    this.initializeCalculator();
  }

  initializeCalculator() {
    console.log('DBm to Milliwatts Calculator initialized');
  }

  /**
   * Validate input data
   * @param {Object} data - Input data object
   * @returns {Object} Validated data
   */
  validateInputs(data) {
    const { conversionType, inputValue } = data;

    if (!conversionType) {
      throw new Error('Please select a conversion type.');
    }

    if (!inputValue || inputValue === '') {
      throw new Error('Please enter a value to convert.');
    }

    const numericValue = parseFloat(inputValue);
    if (isNaN(numericValue)) {
      throw new Error('Please enter a valid number.');
    }

    if (conversionType === 'milliwatts-to-dbm' && numericValue <= 0) {
      throw new Error('Milliwatts value must be greater than 0.');
    }

    return {
      conversionType,
      inputValue: numericValue
    };
  }

  /**
   * Convert dBm to milliwatts
   * @param {number} dbm - Power in dBm
   * @returns {Object} Calculation result with steps
   */
  dbmToMilliwatts(dbm) {
    const step1 = dbm / 10;
    const step2 = Math.pow(10, step1);
    const result = step2;

    return {
      result: result,
      steps: [
        { description: 'Divide dBm by 10', value: step1 },
        { description: 'Calculate 10 raised to power', value: step2 }
      ]
    };
  }

  /**
   * Convert milliwatts to dBm
   * @param {number} milliwatts - Power in milliwatts
   * @returns {Object} Calculation result with steps
   */
  milliwattsToDbm(milliwatts) {
    const step1 = Math.log10(milliwatts);
    const step2 = 10 * step1;
    const result = step2;

    return {
      result: result,
      steps: [
        { description: 'Calculate log₁₀ of milliwatts', value: step1 },
        { description: 'Multiply by 10', value: step2 }
      ]
    };
  }

  /**
   * Format number for display
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  formatNumber(num) {
    if (num >= 1000000) {
      return num.toExponential(4);
    } else if (num >= 1000) {
      return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
    } else if (num >= 1) {
      return num.toFixed(4);
    } else {
      return num.toExponential(4);
    }
  }

  /**
   * Get example calculation
   * @param {string} conversionType - Type of conversion
   * @returns {Object} Example data
   */
  getExample(conversionType) {
    if (conversionType === 'dbm-to-milliwatts') {
      return {
        inputValue: 20,
        description: 'Convert 20 dBm to milliwatts'
      };
    } else {
      return {
        inputValue: 100,
        description: 'Convert 100 mW to dBm'
      };
    }
  }

  /**
   * Perform the main calculation
   * @param {Object} data - Input data
   * @returns {Object} Calculation result
   */
  performCalculation(data) {
    try {
      const validatedData = this.validateInputs(data);
      let calculationResult;
      let formattedResult;
      let calculationSteps;

      if (validatedData.conversionType === 'dbm-to-milliwatts') {
        calculationResult = this.dbmToMilliwatts(validatedData.inputValue);
        formattedResult = `${validatedData.inputValue} dBm = ${this.formatNumber(calculationResult.result)} mW`;
        
        calculationSteps = [
          {
            title: 'Given Values',
            content: `
              <ul>
                <li>Input: ${validatedData.inputValue} dBm</li>
                <li>Conversion Type: dBm to Milliwatts</li>
              </ul>
            `
          },
          {
            title: 'Apply Formula',
            content: `
              <ul>
                <li>Formula: <span class="math-formula">P(mW) = 10^{(\\frac{P(dBm)}{10})}</span></li>
                <li>Substitution: <span class="math-formula">P(mW) = 10^{(\\frac{${validatedData.inputValue}}{10})}</span></li>
              </ul>
            `
          },
          {
            title: 'Calculate Step by Step',
            content: `
              <ul>
                <li>Step 1: <span class="math-formula">\\frac{${validatedData.inputValue}}{10} = ${calculationResult.steps[0].value.toFixed(4)}</span></li>
                <li>Step 2: <span class="math-formula">10^{${calculationResult.steps[0].value.toFixed(4)}} = ${this.formatNumber(calculationResult.result)}</span> mW</li>
              </ul>
            `
          },
          {
            title: 'Final Result',
            content: `
              <ul>
                <li>Power = <span class="math-formula">${this.formatNumber(calculationResult.result)}</span> mW</li>
              </ul>
            `
          }
        ];
      } else {
        calculationResult = this.milliwattsToDbm(validatedData.inputValue);
        formattedResult = `${this.formatNumber(validatedData.inputValue)} mW = ${calculationResult.result.toFixed(2)} dBm`;
        
        calculationSteps = [
          {
            title: 'Given Values',
            content: `
              <ul>
                <li>Input: ${this.formatNumber(validatedData.inputValue)} mW</li>
                <li>Conversion Type: Milliwatts to dBm</li>
              </ul>
            `
          },
          {
            title: 'Apply Formula',
            content: `
              <ul>
                <li>Formula: <span class="math-formula">P(dBm) = 10 \\times \\log_{10}(P(mW))</span></li>
                <li>Substitution: <span class="math-formula">P(dBm) = 10 \\times \\log_{10}(${this.formatNumber(validatedData.inputValue)})</span></li>
              </ul>
            `
          },
          {
            title: 'Calculate Step by Step',
            content: `
              <ul>
                <li>Step 1: <span class="math-formula">\\log_{10}(${this.formatNumber(validatedData.inputValue)}) = ${calculationResult.steps[0].value.toFixed(4)}</span></li>
                <li>Step 2: <span class="math-formula">10 \\times ${calculationResult.steps[0].value.toFixed(4)} = ${calculationResult.result.toFixed(2)}</span> dBm</li>
              </ul>
            `
          },
          {
            title: 'Final Result',
            content: `
              <ul>
                <li>Power = <span class="math-formula">${calculationResult.result.toFixed(2)}</span> dBm</li>
              </ul>
            `
          }
        ];
      }
      
      const result = {
        formattedResult: formattedResult,
        rawResult: calculationResult.result,
        calculationSteps: calculationSteps,
        inputData: validatedData
      };

      return result;

    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Get calculation steps for display
   * @param {Object} data - Input data
   * @returns {Array} Array of calculation steps
   */
  getCalculationSteps(data) {
    try {
      const validatedData = this.validateInputs(data);
      let calculationResult;

      if (validatedData.conversionType === 'dbm-to-milliwatts') {
        calculationResult = this.dbmToMilliwatts(validatedData.inputValue);
      } else {
        calculationResult = this.milliwattsToDbm(validatedData.inputValue);
      }

      return calculationResult.steps;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Advanced RF calculations
   * @param {number} power - Power value
   * @param {string} unit - Unit of power (dBm or mW)
   * @returns {Object} Advanced calculations
   */
  getAdvancedCalculations(power, unit) {
    let powerInDbm, powerInMw;

    if (unit === 'dBm') {
      powerInDbm = power;
      powerInMw = Math.pow(10, power / 10);
    } else {
      powerInMw = power;
      powerInDbm = 10 * Math.log10(power);
    }

    // Convert to other units
    const powerInWatts = powerInMw / 1000;
    const powerInMicroWatts = powerInMw * 1000;

    return {
      dBm: powerInDbm.toFixed(2),
      mW: this.formatNumber(powerInMw),
      W: this.formatNumber(powerInWatts),
      μW: this.formatNumber(powerInMicroWatts)
    };
  }

  /**
   * Calculate power gain/loss
   * @param {number} inputPower - Input power
   * @param {number} outputPower - Output power
   * @param {string} unit - Unit of power
   * @returns {Object} Gain/loss calculation
   */
  calculatePowerGain(inputPower, outputPower, unit) {
    let gain;

    if (unit === 'dBm') {
      gain = outputPower - inputPower;
    } else {
      const inputDbm = 10 * Math.log10(inputPower);
      const outputDbm = 10 * Math.log10(outputPower);
      gain = outputDbm - inputDbm;
    }

    return {
      gain: gain.toFixed(2),
      gainType: gain > 0 ? 'Gain' : 'Loss',
      magnitude: Math.abs(gain).toFixed(2)
    };
  }

  /**
   * Calculate effective radiated power (ERP)
   * @param {number} transmitterPower - Transmitter power in dBm
   * @param {number} antennaGain - Antenna gain in dBi
   * @param {number} cableLoss - Cable loss in dB
   * @returns {Object} ERP calculation
   */
  calculateERP(transmitterPower, antennaGain, cableLoss) {
    const erp = transmitterPower + antennaGain - cableLoss;
    const erpMw = Math.pow(10, erp / 10);

    return {
      erp: erp.toFixed(2),
      erpMw: this.formatNumber(erpMw),
      erpWatts: this.formatNumber(erpMw / 1000)
    };
  }
}

// Export for use in React component
export { DBmMilliwattsCalculator };
