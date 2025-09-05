/**
 * Work Power Calculator - JavaScript Logic
 * Calculates work and power using force, distance, angle, and time
 */

class WorkPowerCalculator {
  constructor() {
    // Conversion factors
    this.forceConversion = {
      'N': 1,
      'kN': 1000,
      'lbf': 4.44822
    };
    
    this.distanceConversion = {
      'm': 1,
      'km': 1000,
      'cm': 0.01,
      'ft': 0.3048
    };
    
    this.timeConversion = {
      's': 1,
      'min': 60,
      'h': 3600
    };

    // Example data
    this.examples = {
      'lifting-box': {
        force: 50,
        forceUnit: 'N',
        distance: 2,
        distanceUnit: 'm',
        angle: 0,
        angleUnit: 'deg',
        time: 5,
        timeUnit: 's'
      },
      'pushing-cart': {
        force: 30,
        forceUnit: 'N',
        distance: 10,
        distanceUnit: 'm',
        angle: 0,
        angleUnit: 'deg',
        time: 8,
        timeUnit: 's'
      },
      'pulling-angle': {
        force: 40,
        forceUnit: 'N',
        distance: 5,
        distanceUnit: 'm',
        angle: 30,
        angleUnit: 'deg',
        time: 3,
        timeUnit: 's'
      }
    };
  }

  /**
   * Validate input values
   */
  validateInputs(formData) {
    const { force, distance, angle, time } = formData;
    
    if (!force || !distance || !angle || !time) {
      throw new Error('Please fill in all fields.');
    }
    
    const forceNum = parseFloat(force);
    const distanceNum = parseFloat(distance);
    const angleNum = parseFloat(angle);
    const timeNum = parseFloat(time);
    
    if (isNaN(forceNum) || isNaN(distanceNum) || isNaN(angleNum) || isNaN(timeNum)) {
      throw new Error('Please enter valid numbers for all fields.');
    }
    
    if (forceNum <= 0 || distanceNum <= 0 || timeNum <= 0) {
      throw new Error('Force, distance, and time must be positive values.');
    }
    
    return {
      force: forceNum,
      distance: distanceNum,
      angle: angleNum,
      time: timeNum
    };
  }

  /**
   * Convert force to Newtons
   */
  convertForceToNewtons(force, unit) {
    if (!this.forceConversion[unit]) {
      throw new Error(`Unknown force unit: ${unit}`);
    }
    return force * this.forceConversion[unit];
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
   * Convert time to seconds
   */
  convertTimeToSeconds(time, unit) {
    if (!this.timeConversion[unit]) {
      throw new Error(`Unknown time unit: ${unit}`);
    }
    return time * this.timeConversion[unit];
  }

  /**
   * Convert angle to radians
   */
  convertAngleToRadians(angle, unit) {
    if (unit === 'deg') {
      return angle * (Math.PI / 180);
    } else if (unit === 'rad') {
      return angle;
    } else {
      throw new Error(`Unknown angle unit: ${unit}`);
    }
  }

  /**
   * Calculate work
   */
  calculateWork(forceNewtons, distanceMeters, angleRadians) {
    return forceNewtons * distanceMeters * Math.cos(angleRadians);
  }

  /**
   * Calculate power
   */
  calculatePower(workJoules, timeSeconds) {
    return workJoules / timeSeconds;
  }

  /**
   * Format number for display
   */
  formatNumber(num) {
    if (Math.abs(num) < 0.001 || Math.abs(num) >= 10000) {
      const exp = Math.floor(Math.log10(Math.abs(num)));
      const mantissa = num / Math.pow(10, exp);
      return `${mantissa.toFixed(3)} × 10^${exp}`;
    } else {
      return parseFloat(num.toFixed(3)).toString();
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
  calculateWorkAndPower(formData) {
    try {
      // Validate inputs
      const validatedData = this.validateInputs(formData);
      
      // Convert to SI units
      const forceInNewtons = this.convertForceToNewtons(validatedData.force, formData.forceUnit);
      const distanceInMeters = this.convertDistanceToMeters(validatedData.distance, formData.distanceUnit);
      const timeInSeconds = this.convertTimeToSeconds(validatedData.time, formData.timeUnit);
      const angleInRadians = this.convertAngleToRadians(validatedData.angle, formData.angleUnit);
      
      // Calculate work
      const work = this.calculateWork(forceInNewtons, distanceInMeters, angleInRadians);
      
      // Calculate power
      const power = this.calculatePower(work, timeInSeconds);
      
      // Format angle for display
      const angleDisplay = formData.angleUnit === 'deg' 
        ? `${validatedData.angle}°` 
        : `${this.formatNumber(angleInRadians)} rad`;
      
      // Format results
      const result = {
        work: this.formatNumberWithUnits(work, 'J'),
        power: this.formatNumberWithUnits(power, 'W'),
        forceInNewtons: this.formatNumberWithUnits(forceInNewtons, 'N'),
        distanceInMeters: this.formatNumberWithUnits(distanceInMeters, 'm'),
        angleDisplay: angleDisplay,
        timeInSeconds: this.formatNumberWithUnits(timeInSeconds, 's'),
        rawData: {
          work,
          power,
          forceInNewtons,
          distanceInMeters,
          angleInRadians,
          timeInSeconds
        }
      };
      
      return result;
      
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Calculate work with velocity (alternative method)
   */
  calculateWorkWithVelocity(forceNewtons, velocityMetersPerSecond, angleRadians) {
    return forceNewtons * velocityMetersPerSecond * Math.cos(angleRadians);
  }

  /**
   * Calculate power with velocity
   */
  calculatePowerWithVelocity(forceNewtons, velocityMetersPerSecond, angleRadians) {
    return forceNewtons * velocityMetersPerSecond * Math.cos(angleRadians);
  }

  /**
   * Calculate efficiency
   */
  calculateEfficiency(usefulWork, totalWork) {
    if (totalWork === 0) {
      throw new Error('Total work cannot be zero for efficiency calculation.');
    }
    return (usefulWork / totalWork) * 100;
  }

  /**
   * Calculate mechanical advantage
   */
  calculateMechanicalAdvantage(outputForce, inputForce) {
    if (inputForce === 0) {
      throw new Error('Input force cannot be zero for mechanical advantage calculation.');
    }
    return outputForce / inputForce;
  }

  /**
   * Calculate work done against gravity
   */
  calculateWorkAgainstGravity(massKg, heightMeters, gravitationalAcceleration = 9.81) {
    return massKg * gravitationalAcceleration * heightMeters;
  }

  /**
   * Calculate kinetic energy
   */
  calculateKineticEnergy(massKg, velocityMetersPerSecond) {
    return 0.5 * massKg * Math.pow(velocityMetersPerSecond, 2);
  }

  /**
   * Calculate potential energy
   */
  calculatePotentialEnergy(massKg, heightMeters, gravitationalAcceleration = 9.81) {
    return massKg * gravitationalAcceleration * heightMeters;
  }

  /**
   * Calculate power from energy and time
   */
  calculatePowerFromEnergy(energyJoules, timeSeconds) {
    if (timeSeconds === 0) {
      throw new Error('Time cannot be zero for power calculation.');
    }
    return energyJoules / timeSeconds;
  }

  /**
   * Calculate work from power and time
   */
  calculateWorkFromPower(powerWatts, timeSeconds) {
    return powerWatts * timeSeconds;
  }

  /**
   * Convert between power units
   */
  convertPowerUnits(power, fromUnit, toUnit) {
    const conversions = {
      'W': 1,
      'kW': 1000,
      'MW': 1000000,
      'hp': 745.7,
      'ft-lbf/s': 1.3558
    };
    
    if (!conversions[fromUnit] || !conversions[toUnit]) {
      throw new Error(`Unknown power unit: ${fromUnit} or ${toUnit}`);
    }
    
    const powerInWatts = power * conversions[fromUnit];
    return powerInWatts / conversions[toUnit];
  }

  /**
   * Calculate work done by friction
   */
  calculateWorkByFriction(frictionForce, distance) {
    return frictionForce * distance;
  }

  /**
   * Calculate work done by spring
   */
  calculateWorkBySpring(springConstant, displacement) {
    return 0.5 * springConstant * Math.pow(displacement, 2);
  }

  /**
   * Calculate average power
   */
  calculateAveragePower(totalWork, totalTime) {
    if (totalTime === 0) {
      throw new Error('Total time cannot be zero for average power calculation.');
    }
    return totalWork / totalTime;
  }

  /**
   * Calculate instantaneous power
   */
  calculateInstantaneousPower(force, velocity, angle = 0) {
    return force * velocity * Math.cos(angle);
  }

  /**
   * Compare work scenarios
   */
  compareWorkScenarios(scenario1, scenario2) {
    const result1 = this.calculateWorkAndPower(scenario1);
    const result2 = this.calculateWorkAndPower(scenario2);
    
    return {
      scenario1: result1,
      scenario2: result2,
      workRatio: result1.rawData.work / result2.rawData.work,
      powerRatio: result1.rawData.power / result2.rawData.power
    };
  }

  /**
   * Calculate work-energy theorem
   */
  calculateWorkEnergyTheorem(initialKineticEnergy, finalKineticEnergy) {
    return finalKineticEnergy - initialKineticEnergy;
  }

  /**
   * Calculate power factor
   */
  calculatePowerFactor(realPower, apparentPower) {
    if (apparentPower === 0) {
      throw new Error('Apparent power cannot be zero for power factor calculation.');
    }
    return realPower / apparentPower;
  }
}

// Export for use in React component
export default WorkPowerCalculator;
