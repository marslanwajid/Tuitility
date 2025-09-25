// Fuel Cost Calculator Logic Class
class FuelCostCalculatorLogic {
  constructor() {
    this.initializeElements();
    this.attachEventListeners();
  }

  initializeElements() {
    // Get form and result elements
    this.form = document.getElementById('fuel-cost-form');
    this.resultSection = document.getElementById('result-section');
    this.costResult = document.getElementById('cost-result');
    this.calculationDetails = document.getElementById('calculation-details');
    
    // Form elements
    this.distanceInput = document.getElementById('distance');
    this.fuelEfficiencyInput = document.getElementById('fuel-efficiency');
    this.fuelPriceInput = document.getElementById('fuel-price');
    this.roundTripCheckbox = document.getElementById('round-trip');
    this.distanceUnitSelect = document.getElementById('distance-unit');
    this.efficiencyUnitSelect = document.getElementById('efficiency-unit');
    this.currencySelect = document.getElementById('currency');
    this.passengersInput = document.getElementById('passengers');
  }

  attachEventListeners() {
    // Handle form submission
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.calculateFuelCost();
      });
      
      // Reset form and hide results
      this.form.addEventListener('reset', () => {
        this.hideResults();
      });
    }
  }

  // Calculate fuel cost
  calculateFuelCost() {
    try {
      // Get input values
      const distance = parseFloat(this.distanceInput ? this.distanceInput.value : 0);
      const fuelEfficiency = parseFloat(this.fuelEfficiencyInput ? this.fuelEfficiencyInput.value : 0);
      const fuelPrice = parseFloat(this.fuelPriceInput ? this.fuelPriceInput.value : 0);
      const isRoundTrip = this.roundTripCheckbox ? this.roundTripCheckbox.checked : false;
      const distanceUnit = this.distanceUnitSelect ? this.distanceUnitSelect.value : 'miles';
      const efficiencyUnit = this.efficiencyUnitSelect ? this.efficiencyUnitSelect.value : 'mpg';
      const currency = this.currencySelect ? this.currencySelect.value : 'usd';
      const passengers = Math.max(1, parseInt(this.passengersInput ? this.passengersInput.value : 1) || 1);

      // Validation
      if (isNaN(distance) || distance <= 0) {
        this.showError('Please enter a valid distance.');
        return;
      }

      if (isNaN(fuelEfficiency) || fuelEfficiency <= 0) {
        this.showError('Please enter a valid fuel efficiency.');
        return;
      }

      if (isNaN(fuelPrice) || fuelPrice <= 0) {
        this.showError('Please enter a valid fuel price.');
        return;
      }

      // Convert all measurements to a standard unit (miles and gallons)
      let standardDistance = distance;
      let standardEfficiency = fuelEfficiency;

      // Convert kilometers to miles if needed
      if (distanceUnit === 'kilometers') {
        standardDistance = distance * 0.621371;
      }

      // Convert km/L to MPG if needed
      if (efficiencyUnit === 'kpl') {
        standardEfficiency = fuelEfficiency * 2.35215;
      }

      // Calculate total distance
      const totalDistance = isRoundTrip ? standardDistance * 2 : standardDistance;

      // Calculate fuel needed
      const fuelNeeded = totalDistance / standardEfficiency;

      // Calculate total cost
      const totalCost = fuelNeeded * fuelPrice;
      
      // Calculate cost per person
      const costPerPerson = totalCost / passengers;

      // Display results
      this.displayResults(totalCost, costPerPerson, totalDistance, fuelNeeded, standardEfficiency, fuelPrice, passengers, currency, isRoundTrip);
      
      // Show result section
      this.showResults();
      
      // Scroll to results
      if (this.resultSection) {
        this.resultSection.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error calculating fuel cost:', error);
      this.showError('Error calculating fuel cost. Please check your inputs.');
    }
  }

  // Display results
  displayResults(totalCost, costPerPerson, totalDistance, fuelNeeded, standardEfficiency, fuelPrice, passengers, currency, isRoundTrip) {
    // Currency symbols
    const currencySymbols = {
      'usd': '$',
      'eur': '€',
      'gbp': '£'
    };

    const currencySymbol = currencySymbols[currency] || '$';

    // Reset result section HTML structure
    if (this.resultSection) {
      this.resultSection.innerHTML = `
        <h3>Trip Cost Breakdown</h3>
        <div id="cost-result"></div>
        <h4>Calculation Details</h4>
        <div id="calculation-details"></div>
      `;
      
      // Get the new elements after resetting innerHTML
      const newCostResult = document.getElementById('cost-result');
      const newCalculationDetails = document.getElementById('calculation-details');
      
      // Update cost display based on number of passengers
      if (passengers > 1) {
        newCostResult.innerHTML = `
          <p><strong>Total Trip Cost:</strong> ${currencySymbol}${totalCost.toFixed(2)}</p>
          <p><strong>Cost Per Person:</strong> ${currencySymbol}${costPerPerson.toFixed(2)}</p>
        `;
      } else {
        newCostResult.innerHTML = `
          <p><strong>Total Fuel Cost:</strong> ${currencySymbol}${totalCost.toFixed(2)}</p>
        `;
      }

      newCalculationDetails.innerHTML = `
        <p><strong>Distance:</strong> ${totalDistance.toFixed(2)} miles ${isRoundTrip ? '(Round Trip)' : ''}</p>
        <p><strong>Fuel Required:</strong> ${fuelNeeded.toFixed(2)} gallons</p>
        <p><strong>Fuel Price:</strong> ${currencySymbol}${fuelPrice} per gallon</p>
        <p><strong>Fuel Efficiency:</strong> ${standardEfficiency.toFixed(2)} MPG</p>
        ${passengers > 1 ? `<p><strong>Passengers:</strong> Splitting cost between ${passengers} passengers</p>` : ''}
      `;
    }
  }

  // Show error message
  showError(message) {
    if (this.resultSection) {
      this.resultSection.style.display = 'block';
      this.resultSection.innerHTML = `<div class="error">${message}</div>`;
    }
  }

  // Show results section
  showResults() {
    if (this.resultSection) {
      this.resultSection.style.display = 'block';
    }
  }

  // Hide results section
  hideResults() {
    if (this.resultSection) {
      this.resultSection.style.display = 'none';
    }
    // Reset passengers to 1
    if (this.passengersInput) {
      this.passengersInput.value = '1';
    }
  }
}

// Initialize the calculator when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
  new FuelCostCalculatorLogic();
});

