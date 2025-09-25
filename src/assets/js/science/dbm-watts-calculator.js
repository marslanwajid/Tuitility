/**
 * DBm Watts Calculator - JavaScript Logic
 * Converts between dBm and Watts for power measurements
 */

class DBmWattsCalculator {
  constructor() {
    // Common power level examples
    this.examples = {
      'cell-phone': {
        conversionType: 'dbm-to-watts',
        inputValue: 23
      },
      'wifi-router': {
        conversionType: 'dbm-to-watts',
        inputValue: 18
      },
      'bluetooth': {
        conversionType: 'dbm-to-watts',
        inputValue: 4
      },
      'rf-amplifier': {
        conversionType: 'watts-to-dbm',
        inputValue: 10
      },
      'low-power': {
        conversionType: 'watts-to-dbm',
        inputValue: 0.001
      }
    };
  }

  /**
   * Validate input values
   */
  validateInputs(formData) {
    const { conversionType, inputValue } = formData;
    
    if (!conversionType || !inputValue) {
      throw new Error('Please fill in all fields.');
    }
    
    const value = parseFloat(inputValue);
    
    if (isNaN(value)) {
      throw new Error('Please enter a valid number.');
    }
    
    if (conversionType === 'watts-to-dbm' && value <= 0) {
      throw new Error('Power in Watts must be greater than zero.');
    }
    
    return {
      conversionType,
      inputValue: value
    };
  }

  /**
   * Format number in scientific notation
   */
  formatScientific(num) {
    if (Math.abs(num) < 0.001 || Math.abs(num) >= 10000) {
      return num.toExponential(6);
    } else {
      return parseFloat(num.toFixed(6)).toString();
    }
  }

  /**
   * Convert dBm to Watts
   */
  dbmToWatts(dbm) {
    const step1 = dbm / 10;
    const step2 = Math.pow(10, step1);
    const result = step2 * 0.001; // Convert milliwatts to watts
    
    return {
      result: result,
      steps: [
        { value: step1, description: `${dbm} / 10` },
        { value: step2, description: `10^(${step1})` },
        { value: result, description: `${step2.toFixed(6)} × 0.001` }
      ]
    };
  }

  /**
   * Convert Watts to dBm
   */
  wattsToDbm(watts) {
    const step1 = watts * 1000; // Convert watts to milliwatts
    const step2 = Math.log10(step1);
    const result = 10 * step2;
    
    return {
      result: result,
      steps: [
        { value: step1, description: `${watts} × 1000` },
        { value: step2, description: `log₁₀(${step1})` },
        { value: result, description: `10 × ${step2.toFixed(6)}` }
      ]
    };
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
  performCalculation(formData) {
    try {
      // Validate inputs
      const validatedData = this.validateInputs(formData);
      
      let calculationResult;
      let formattedResult;
      let calculationSteps = [];
      
      if (validatedData.conversionType === 'dbm-to-watts') {
        calculationResult = this.dbmToWatts(validatedData.inputValue);
        formattedResult = `${this.formatScientific(calculationResult.result)} W`;
        
        calculationSteps = [
          {
            title: 'Given Values',
            content: `
              <ul>
                <li>Input: ${validatedData.inputValue} dBm</li>
                <li>Conversion Type: dBm to Watts</li>
              </ul>
            `
          },
          {
            title: 'Apply Formula',
            content: `
              <ul>
                <li>Formula: <span class="math-formula">P(W) = 10^{(\\frac{P(dBm)}{10})} \\times 0.001</span></li>
                <li>Substitution: <span class="math-formula">P(W) = 10^{(\\frac{${validatedData.inputValue}}{10})} \\times 0.001</span></li>
              </ul>
            `
          },
          {
            title: 'Calculate Step by Step',
            content: `
              <ul>
                <li>Step 1: <span class="math-formula">\\frac{${validatedData.inputValue}}{10} = ${calculationResult.steps[0].value}</span></li>
                <li>Step 2: <span class="math-formula">10^{${calculationResult.steps[0].value}} = ${calculationResult.steps[1].value.toFixed(6)}</span> mW</li>
                <li>Step 3: <span class="math-formula">${calculationResult.steps[1].value.toFixed(6)} \\times 0.001 = ${this.formatScientific(calculationResult.result)}</span> W</li>
              </ul>
            `
          },
          {
            title: 'Final Result',
            content: `
              <ul>
                <li>Power = <span class="math-formula">${this.formatScientific(calculationResult.result)}</span> W</li>
              </ul>
            `
          }
        ];
      } else {
        calculationResult = this.wattsToDbm(validatedData.inputValue);
        formattedResult = `${calculationResult.result.toFixed(2)} dBm`;
        
        calculationSteps = [
          {
            title: 'Given Values',
            content: `
              <ul>
                <li>Input: ${validatedData.inputValue} W</li>
                <li>Conversion Type: Watts to dBm</li>
              </ul>
            `
          },
          {
            title: 'Apply Formula',
            content: `
              <ul>
                <li>Formula: <span class="math-formula">P(dBm) = 10 \\times \\log_{10}(P(W) \\times 1000)</span></li>
                <li>Substitution: <span class="math-formula">P(dBm) = 10 \\times \\log_{10}(${validatedData.inputValue} \\times 1000)</span></li>
              </ul>
            `
          },
          {
            title: 'Calculate Step by Step',
            content: `
              <ul>
                <li>Step 1: <span class="math-formula">${validatedData.inputValue} \\times 1000 = ${calculationResult.steps[0].value}</span> mW</li>
                <li>Step 2: <span class="math-formula">\\log_{10}(${calculationResult.steps[0].value}) = ${calculationResult.steps[1].value.toFixed(6)}</span></li>
                <li>Step 3: <span class="math-formula">10 \\times ${calculationResult.steps[1].value.toFixed(6)} = ${calculationResult.result.toFixed(2)}</span> dBm</li>
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
        conversionType: validatedData.conversionType,
        inputValue: validatedData.inputValue,
        calculationSteps: calculationSteps,
        rawData: {
          result: calculationResult.result,
          steps: calculationResult.steps
        }
      };
      
      return result;
      
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Convert dBm to milliwatts
   */
  dbmToMilliwatts(dbm) {
    return Math.pow(10, dbm / 10);
  }

  /**
   * Convert milliwatts to dBm
   */
  milliwattsToDbm(milliwatts) {
    return 10 * Math.log10(milliwatts);
  }

  /**
   * Convert dBm to voltage (requires impedance)
   */
  dbmToVoltage(dbm, impedance = 50) {
    const powerWatts = this.dbmToWatts(dbm).result;
    return Math.sqrt(powerWatts * impedance);
  }

  /**
   * Convert voltage to dBm (requires impedance)
   */
  voltageToDbm(voltage, impedance = 50) {
    const powerWatts = Math.pow(voltage, 2) / impedance;
    return this.wattsToDbm(powerWatts).result;
  }

  /**
   * Calculate power gain/loss in dB
   */
  calculatePowerGain(inputPower, outputPower, inputUnit = 'dBm', outputUnit = 'dBm') {
    let inputDbm, outputDbm;
    
    if (inputUnit === 'watts') {
      inputDbm = this.wattsToDbm(inputPower).result;
    } else {
      inputDbm = inputPower;
    }
    
    if (outputUnit === 'watts') {
      outputDbm = this.wattsToDbm(outputPower).result;
    } else {
      outputDbm = outputPower;
    }
    
    return outputDbm - inputDbm;
  }

  /**
   * Calculate effective radiated power (ERP)
   */
  calculateERP(transmitterPower, antennaGain, cableLoss = 0) {
    const powerDbm = this.wattsToDbm(transmitterPower).result;
    const erpDbm = powerDbm + antennaGain - cableLoss;
    return {
      erpDbm: erpDbm,
      erpWatts: this.dbmToWatts(erpDbm).result
    };
  }

  /**
   * Calculate free space path loss
   */
  calculatePathLoss(frequency, distance) {
    // Frequency in MHz, distance in km
    const pathLossDb = 32.45 + 20 * Math.log10(frequency) + 20 * Math.log10(distance);
    return pathLossDb;
  }

  /**
   * Calculate received signal strength
   */
  calculateReceivedPower(transmittedPower, antennaGain, pathLoss, receiverGain = 0) {
    const txPowerDbm = this.wattsToDbm(transmittedPower).result;
    const receivedPowerDbm = txPowerDbm + antennaGain - pathLoss + receiverGain;
    return {
      receivedPowerDbm: receivedPowerDbm,
      receivedPowerWatts: this.dbmToWatts(receivedPowerDbm).result
    };
  }

  /**
   * Get power level interpretation
   */
  getPowerLevelInterpretation(dbm) {
    if (dbm >= 30) return 'Very High Power (RF Amplifier)';
    if (dbm >= 20) return 'High Power (Cell Phone, WiFi Router)';
    if (dbm >= 10) return 'Medium Power (Bluetooth, IoT)';
    if (dbm >= 0) return 'Low Power (Sensors, Receivers)';
    if (dbm >= -20) return 'Very Low Power (Weak Signals)';
    if (dbm >= -40) return 'Extremely Low Power (Noise Floor)';
    return 'Below Noise Floor';
  }

  /**
   * Convert between different power units
   */
  convertPowerUnits(value, fromUnit, toUnit) {
    const conversions = {
      'watts': 1,
      'milliwatts': 0.001,
      'microwatts': 0.000001,
      'nanowatts': 0.000000001,
      'kilowatts': 1000,
      'megawatts': 1000000
    };
    
    if (!conversions[fromUnit] || !conversions[toUnit]) {
      throw new Error(`Unknown power unit: ${fromUnit} or ${toUnit}`);
    }
    
    const watts = value * conversions[fromUnit];
    return watts / conversions[toUnit];
  }

  /**
   * Calculate signal-to-noise ratio (SNR)
   */
  calculateSNR(signalPower, noisePower, signalUnit = 'dBm', noiseUnit = 'dBm') {
    let signalDbm, noiseDbm;
    
    if (signalUnit === 'watts') {
      signalDbm = this.wattsToDbm(signalPower).result;
    } else {
      signalDbm = signalPower;
    }
    
    if (noiseUnit === 'watts') {
      noiseDbm = this.wattsToDbm(noisePower).result;
    } else {
      noiseDbm = noisePower;
    }
    
    return signalDbm - noiseDbm;
  }

  /**
   * Calculate power density
   */
  calculatePowerDensity(power, distance, antennaGain = 0) {
    const powerWatts = this.dbmToWatts(power).result;
    const powerDensity = (powerWatts * Math.pow(10, antennaGain / 10)) / (4 * Math.PI * Math.pow(distance, 2));
    return powerDensity; // W/m²
  }

  /**
   * Compare power levels
   */
  comparePowerLevels(level1, level2, unit1 = 'dBm', unit2 = 'dBm') {
    let dbm1, dbm2;
    
    if (unit1 === 'watts') {
      dbm1 = this.wattsToDbm(level1).result;
    } else {
      dbm1 = level1;
    }
    
    if (unit2 === 'watts') {
      dbm2 = this.wattsToDbm(level2).result;
    } else {
      dbm2 = level2;
    }
    
    const difference = dbm1 - dbm2;
    const ratio = Math.pow(10, difference / 10);
    
    return {
      difference: difference,
      ratio: ratio,
      interpretation: difference > 0 ? 'Level 1 is higher' : 'Level 2 is higher'
    };
  }
}

// Export for use in React component
export default DBmWattsCalculator;
