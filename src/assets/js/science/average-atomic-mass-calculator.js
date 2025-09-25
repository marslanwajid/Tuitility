class AverageAtomicMassCalculator {
  constructor() {
    // Common isotope data for reference
    this.commonIsotopes = {
      'Hydrogen': [
        { mass: 1.007825, abundance: 99.9885, symbol: '¹H' },
        { mass: 2.014102, abundance: 0.0115, symbol: '²H' }
      ],
      'Carbon': [
        { mass: 12.000000, abundance: 98.89, symbol: '¹²C' },
        { mass: 13.003355, abundance: 1.11, symbol: '¹³C' }
      ],
      'Chlorine': [
        { mass: 34.968853, abundance: 75.77, symbol: '³⁵Cl' },
        { mass: 36.965903, abundance: 24.23, symbol: '³⁷Cl' }
      ],
      'Copper': [
        { mass: 62.929598, abundance: 69.15, symbol: '⁶³Cu' },
        { mass: 64.927790, abundance: 30.85, symbol: '⁶⁵Cu' }
      ]
    };
  }

  validateInputs(isotopes) {
    const errors = [];

    // Check if isotopes array is provided and not empty
    if (!isotopes || isotopes.length === 0) {
      errors.push('Please provide at least one isotope.');
      return errors;
    }

    // Validate each isotope
    isotopes.forEach((isotope, index) => {
      const isotopeNum = index + 1;

      // Validate mass
      if (!isotope.mass || isotope.mass === '') {
        errors.push(`Please enter the mass for isotope ${isotopeNum}.`);
      } else {
        const massNum = parseFloat(isotope.mass);
        if (isNaN(massNum)) {
          errors.push(`Please enter a valid mass value for isotope ${isotopeNum}.`);
        } else if (massNum <= 0) {
          errors.push(`Mass for isotope ${isotopeNum} must be greater than 0.`);
        } else if (massNum > 500) {
          errors.push(`Mass for isotope ${isotopeNum} should be less than 500 u.`);
        }
      }

      // Validate abundance
      if (!isotope.abundance || isotope.abundance === '') {
        errors.push(`Please enter the abundance for isotope ${isotopeNum}.`);
      } else {
        const abundanceNum = parseFloat(isotope.abundance);
        if (isNaN(abundanceNum)) {
          errors.push(`Please enter a valid abundance value for isotope ${isotopeNum}.`);
        } else if (abundanceNum < 0) {
          errors.push(`Abundance for isotope ${isotopeNum} must be non-negative.`);
        } else if (abundanceNum > 100) {
          errors.push(`Abundance for isotope ${isotopeNum} should not exceed 100%.`);
        }
      }
    });

    // Check total abundance
    if (errors.length === 0) {
      const totalAbundance = isotopes.reduce((sum, isotope) => {
        let abundance = parseFloat(isotope.abundance);
        if (isotope.abundanceUnit === 'decimal') {
          abundance *= 100; // Convert decimal to percentage
        }
        return sum + abundance;
      }, 0);

      if (Math.abs(totalAbundance - 100) > 0.1) {
        errors.push(`Total abundance should be 100%. Current total: ${totalAbundance.toFixed(2)}%.`);
      }
    }

    return errors;
  }

  calculateAverageAtomicMass(isotopes) {
    let sumWeightedMass = 0;
    let totalAbundance = 0;
    const isotopeData = [];

    // Process each isotope
    isotopes.forEach((isotope, index) => {
      const mass = parseFloat(isotope.mass);
      let abundance = parseFloat(isotope.abundance);
      
      // Convert decimal abundance to percentage if needed
      if (isotope.abundanceUnit === 'decimal') {
        abundance *= 100;
      }

      const weightedMass = mass * abundance;
      sumWeightedMass += weightedMass;
      totalAbundance += abundance;

      isotopeData.push({
        mass: mass,
        abundance: abundance,
        weightedMass: weightedMass,
        symbol: `Isotope ${index + 1}`
      });
    });

    // Calculate average atomic mass
    const averageAtomicMass = sumWeightedMass / 100;

    // Analyze isotopes
    const mostAbundantIsotope = this.findMostAbundantIsotope(isotopeData);
    const massRange = this.calculateMassRange(isotopeData);
    const abundanceDistribution = this.analyzeAbundanceDistribution(isotopeData);
    const elementClassification = this.classifyElement(isotopeData);

    // Create calculation steps
    const calculationSteps = this.createCalculationSteps(isotopeData, sumWeightedMass, averageAtomicMass);

    return {
      averageAtomicMass: averageAtomicMass,
      isotopeCount: isotopes.length,
      totalAbundance: totalAbundance,
      mostAbundantIsotope: mostAbundantIsotope,
      massRange: massRange,
      abundanceDistribution: abundanceDistribution,
      elementClassification: elementClassification,
      calculationSteps: calculationSteps,
      isotopeData: isotopeData
    };
  }

  findMostAbundantIsotope(isotopeData) {
    const mostAbundant = isotopeData.reduce((max, isotope) => 
      isotope.abundance > max.abundance ? isotope : max
    );
    return `${mostAbundant.symbol} (${mostAbundant.abundance.toFixed(2)}%)`;
  }

  calculateMassRange(isotopeData) {
    const masses = isotopeData.map(isotope => isotope.mass);
    const minMass = Math.min(...masses);
    const maxMass = Math.max(...masses);
    return `${minMass.toFixed(3)} - ${maxMass.toFixed(3)} u`;
  }

  analyzeAbundanceDistribution(isotopeData) {
    const totalIsotopes = isotopeData.length;
    const highAbundance = isotopeData.filter(isotope => isotope.abundance > 50).length;
    const mediumAbundance = isotopeData.filter(isotope => isotope.abundance > 10 && isotope.abundance <= 50).length;
    const lowAbundance = isotopeData.filter(isotope => isotope.abundance <= 10).length;

    if (highAbundance > 0) {
      return `One dominant isotope (${highAbundance} high abundance)`;
    } else if (mediumAbundance >= 2) {
      return `Multiple significant isotopes (${mediumAbundance} medium abundance)`;
    } else {
      return `Distributed abundances (${lowAbundance} low abundance isotopes)`;
    }
  }

  classifyElement(isotopeData) {
    const totalIsotopes = isotopeData.length;
    const averageAbundance = isotopeData.reduce((sum, isotope) => sum + isotope.abundance, 0) / totalIsotopes;

    if (totalIsotopes === 2 && averageAbundance > 40) {
      return 'Binary element (two major isotopes)';
    } else if (totalIsotopes >= 3 && averageAbundance > 25) {
      return 'Multi-isotopic element';
    } else if (totalIsotopes >= 4) {
      return 'Complex isotopic composition';
    } else {
      return 'Simple isotopic composition';
    }
  }

  createCalculationSteps(isotopeData, sumWeightedMass, averageAtomicMass) {
    const steps = [];

    // Step 1: Given values
    steps.push({
      title: 'Given Isotope Data',
      content: `<ul>${isotopeData.map((isotope, index) => 
        `<li>${isotope.symbol}: Mass = <span class="math-formula">${this.formatNumber(isotope.mass, 4)} \\text{ u}</span>, Abundance = <span class="math-formula">${this.formatNumber(isotope.abundance, 2)}%</span></li>`
      ).join('')}</ul>`
    });

    // Step 2: Weighted mass calculations
    steps.push({
      title: 'Weighted Mass Calculations',
      content: `<ul>${isotopeData.map((isotope, index) => 
        `<li>${isotope.symbol}: <span class="math-formula">${this.formatNumber(isotope.mass, 4)} \\times ${this.formatNumber(isotope.abundance, 2)}% = ${this.formatNumber(isotope.weightedMass, 4)}</span></li>`
      ).join('')}</ul>`
    });

    // Step 3: Sum of weighted masses
    steps.push({
      title: 'Sum of Weighted Masses',
      content: `<ul><li>Total: <span class="math-formula">\\sum (m_i \\times f_i) = ${this.formatNumber(sumWeightedMass, 4)}</span></li></ul>`
    });

    // Step 4: Average atomic mass calculation
    steps.push({
      title: 'Average Atomic Mass',
      content: `<ul><li>Formula: <span class="math-formula">\\text{Average Mass} = \\frac{\\sum (m_i \\times f_i)}{100}</span></li><li>Calculation: <span class="math-formula">\\text{Average Mass} = \\frac{${this.formatNumber(sumWeightedMass, 4)}}{100} = ${this.formatNumber(averageAtomicMass, 4)} \\text{ u}</span></li></ul>`
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

  // Get common isotope data for reference
  getCommonIsotopes() {
    return this.commonIsotopes;
  }

  // Calculate mass defect
  calculateMassDefect(atomicNumber, massNumber, actualMass) {
    const protonMass = 1.007276;
    const neutronMass = 1.008665;
    const electronMass = 0.000549;
    
    const theoreticalMass = (atomicNumber * protonMass) + 
                           ((massNumber - atomicNumber) * neutronMass) + 
                           (atomicNumber * electronMass);
    
    return theoreticalMass - actualMass;
  }

  // Get element information based on average atomic mass
  getElementInfo(averageMass) {
    const elements = {
      'Hydrogen': 1.008,
      'Carbon': 12.011,
      'Nitrogen': 14.007,
      'Oxygen': 15.999,
      'Fluorine': 18.998,
      'Chlorine': 35.453,
      'Bromine': 79.904,
      'Copper': 63.546,
      'Silver': 107.868,
      'Gold': 196.967
    };

    let closestElement = '';
    let minDifference = Infinity;

    for (const [element, mass] of Object.entries(elements)) {
      const difference = Math.abs(mass - averageMass);
      if (difference < minDifference) {
        minDifference = difference;
        closestElement = element;
      }
    }

    return {
      element: closestElement,
      difference: minDifference,
      confidence: minDifference < 0.1 ? 'High' : minDifference < 0.5 ? 'Medium' : 'Low'
    };
  }

  // Calculate isotopic enrichment
  calculateIsotopicEnrichment(naturalAbundance, enrichedAbundance) {
    const enrichmentFactor = enrichedAbundance / naturalAbundance;
    const enrichmentPercent = ((enrichedAbundance - naturalAbundance) / naturalAbundance) * 100;
    
    return {
      enrichmentFactor: enrichmentFactor,
      enrichmentPercent: enrichmentPercent,
      classification: enrichmentFactor > 10 ? 'Highly Enriched' : 
                     enrichmentFactor > 2 ? 'Moderately Enriched' : 
                     enrichmentFactor > 1.1 ? 'Slightly Enriched' : 'Natural'
    };
  }

  // Get isotopic notation
  getIsotopicNotation(element, massNumber) {
    const elementSymbols = {
      'Hydrogen': 'H',
      'Carbon': 'C',
      'Nitrogen': 'N',
      'Oxygen': 'O',
      'Fluorine': 'F',
      'Chlorine': 'Cl',
      'Bromine': 'Br',
      'Copper': 'Cu',
      'Silver': 'Ag',
      'Gold': 'Au'
    };

    const symbol = elementSymbols[element] || element.charAt(0).toUpperCase();
    return `${massNumber}${symbol}`;
  }

  // Calculate binding energy per nucleon
  calculateBindingEnergyPerNucleon(atomicNumber, massNumber, actualMass) {
    const massDefect = this.calculateMassDefect(atomicNumber, massNumber, actualMass);
    const bindingEnergy = massDefect * 931.5; // MeV/c² to MeV
    const nucleons = massNumber;
    
    return bindingEnergy / nucleons;
  }
}

export default AverageAtomicMassCalculator;
