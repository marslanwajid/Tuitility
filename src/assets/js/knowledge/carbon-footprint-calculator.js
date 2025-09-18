// Carbon Footprint Calculator Logic Class
class CarbonFootprintCalculatorLogic {
  constructor() {
    this.initializeElements();
    this.attachEventListeners();
    this.initializeTabs();
  }

  initializeElements() {
    // Get form and result elements
    this.carbonForm = document.getElementById('carbon-footprint-form');
    this.resultSection = document.getElementById('result-section');
    
    // Tab navigation variables
    this.tabButtons = document.querySelectorAll('.tab-button');
    this.tabContents = document.querySelectorAll('.tab-content');
    this.prevButton = document.getElementById('prev-tab');
    this.nextButton = document.getElementById('next-tab');
    this.calculateButton = document.getElementById('calculate-button');
    
    this.currentTab = 0;
    this.tabs = ['transportation', 'energy', 'food', 'waste'];
    
    // Result elements
    this.totalCarbonElement = document.getElementById('total-carbon');
    this.comparisonResultElement = document.getElementById('comparison-result');
    this.comparisonIndicator = document.getElementById('comparison-indicator');
    this.transportationCarbonElement = document.getElementById('transportation-carbon');
    this.energyCarbonElement = document.getElementById('energy-carbon');
    this.foodCarbonElement = document.getElementById('food-carbon');
    this.wasteCarbonElement = document.getElementById('waste-carbon');
    this.reductionTipsList = document.getElementById('reduction-tips-list');
    this.downloadButton = document.getElementById('download-results');
    this.shareButton = document.getElementById('share-results');
    
    // Chart variables
    this.breakdownChart = null;
  }

  attachEventListeners() {
    // Form submission handler
    if (this.carbonForm) {
      this.carbonForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.calculateCarbonFootprint();
      });
    }
    
    // Download results
    if (this.downloadButton) {
      this.downloadButton.addEventListener('click', () => {
        this.generatePDF();
      });
    }
    
    // Share results
    if (this.shareButton) {
      this.shareButton.addEventListener('click', () => {
        this.shareResults();
      });
    }
  }

  // Tab navigation functions
  initializeTabs() {
    // Add click listeners to tab buttons
    this.tabButtons.forEach((button, index) => {
      button.addEventListener('click', () => this.switchToTab(index));
    });
    
    // Add navigation button listeners
    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => {
        if (this.currentTab > 0) {
          this.switchToTab(this.currentTab - 1);
        }
      });
    }
    
    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => {
        if (this.currentTab < this.tabs.length - 1) {
          this.switchToTab(this.currentTab + 1);
        }
      });
    }
    
    // Initialize first tab
    this.switchToTab(0);
  }

  switchToTab(tabIndex) {
    this.currentTab = tabIndex;
    
    // Update tab buttons
    this.tabButtons.forEach((button, index) => {
      button.classList.toggle('active', index === tabIndex);
    });
    
    // Update tab contents
    this.tabContents.forEach((content, index) => {
      content.classList.toggle('active', index === tabIndex);
    });
    
    // Update navigation buttons
    this.updateNavigationButtons();
  }

  updateNavigationButtons() {
    // Show/hide previous button
    if (this.prevButton) {
      this.prevButton.style.display = this.currentTab > 0 ? 'flex' : 'none';
    }
    
    // Show/hide next button vs calculate button
    if (this.currentTab === this.tabs.length - 1) {
      if (this.nextButton) this.nextButton.style.display = 'none';
      if (this.calculateButton) this.calculateButton.style.display = 'flex';
    } else {
      if (this.nextButton) this.nextButton.style.display = 'flex';
      if (this.calculateButton) this.calculateButton.style.display = 'none';
    }
  }

  // Calculate carbon footprint based on form inputs
  calculateCarbonFootprint() {
    try {
      // Carbon emission factors (approximate values)
      const EMISSION_FACTORS = {
        // Transportation (kg CO2e per mile)
        CAR: 0.404, // Average car
        PUBLIC_TRANSIT: 0.14, // Bus/train average
        SHORT_FLIGHT: 223, // kg CO2e per short flight
        LONG_FLIGHT: 986, // kg CO2e per long flight
        
        // Home energy
        ELECTRICITY: 0.42, // kg CO2e per kWh (US average)
        NATURAL_GAS: 5.3, // kg CO2e per therm
        
        // Food (annual kg CO2e per person)
        DIET: {
          'meat-heavy': 2500,
          'average': 1800,
          'vegetarian': 1300,
          'vegan': 1000
        },
        
        // Waste
        WASTE: 0.57, // kg CO2e per pound of waste
      };
      
      // Average annual carbon footprint (metric tons CO2e)
      const AVERAGE_FOOTPRINT = 16; // US average

      // Get form values
      const carMiles = parseFloat(document.getElementById('car-miles')?.value || 0) * 52; // Annual miles
      const carEfficiency = parseFloat(document.getElementById('car-efficiency')?.value || 25);
      const publicTransitMiles = parseFloat(document.getElementById('public-transit')?.value || 0) * 52; // Annual miles
      const shortFlights = parseFloat(document.getElementById('flights-short')?.value || 0);
      const longFlights = parseFloat(document.getElementById('flights-long')?.value || 0);
      
      const electricity = parseFloat(document.getElementById('electricity')?.value || 0) * 12; // Annual kWh
      const naturalGas = parseFloat(document.getElementById('natural-gas')?.value || 0) * 12; // Annual therms
      const renewablePercentage = parseFloat(document.getElementById('renewable-energy')?.value || 0) / 100;
      const householdSize = parseFloat(document.getElementById('household-size')?.value || 1);
      
      const dietType = document.querySelector('input[name="diet"]:checked')?.value || 'average';
      const localFoodPercentage = parseFloat(document.getElementById('local-food')?.value || 0) / 100;
      const foodWaste = parseFloat(document.getElementById('food-waste')?.value || 0) * 52; // Annual pounds
      
      const wasteGenerated = parseFloat(document.getElementById('waste-generated')?.value || 0) * 52; // Annual pounds
      const recyclingRate = parseFloat(document.getElementById('recycling-rate')?.value || 0) / 100;
      const composting = document.querySelector('input[name="compost"]:checked')?.value === 'yes';
      
      // Calculate transportation emissions
      const carEmissions = (carMiles / carEfficiency) * EMISSION_FACTORS.CAR * 1000; // Adjusted for efficiency
      const transitEmissions = publicTransitMiles * EMISSION_FACTORS.PUBLIC_TRANSIT;
      const flightEmissions = (shortFlights * EMISSION_FACTORS.SHORT_FLIGHT) + (longFlights * EMISSION_FACTORS.LONG_FLIGHT);
      const transportationTotal = (carEmissions + transitEmissions + flightEmissions) / 1000; // Convert to metric tons
      
      // Calculate home energy emissions
      const electricityEmissions = electricity * EMISSION_FACTORS.ELECTRICITY * (1 - renewablePercentage);
      const gasEmissions = naturalGas * EMISSION_FACTORS.NATURAL_GAS;
      const energyTotal = (electricityEmissions + gasEmissions) / 1000 / householdSize; // Convert to metric tons and per person
      
      // Calculate food emissions
      const dietEmissions = EMISSION_FACTORS.DIET[dietType];
      const localFoodReduction = dietEmissions * 0.2 * localFoodPercentage; // Local food reduces emissions by up to 20%
      const foodWasteEmissions = foodWaste * 2.5 / 1000; // Food waste has higher impact
      const foodTotal = (dietEmissions - localFoodReduction + foodWasteEmissions) / 1000; // Convert to metric tons
      
      // Calculate waste emissions
      const wasteReduction = recyclingRate * 0.7 + (composting ? 0.3 : 0); // Recycling and composting reduce waste impact
      const wasteEmissions = wasteGenerated * EMISSION_FACTORS.WASTE * (1 - wasteReduction);
      const wasteTotal = wasteEmissions / 1000; // Convert to metric tons
      
      // Calculate total carbon footprint
      const totalCarbon = transportationTotal + energyTotal + foodTotal + wasteTotal;
      
      // Update results
      if (this.totalCarbonElement) {
        this.totalCarbonElement.textContent = totalCarbon.toFixed(2);
      }
      
      if (this.transportationCarbonElement) {
        this.transportationCarbonElement.textContent = transportationTotal.toFixed(2);
      }
      
      if (this.energyCarbonElement) {
        this.energyCarbonElement.textContent = energyTotal.toFixed(2);
      }
      
      if (this.foodCarbonElement) {
        this.foodCarbonElement.textContent = foodTotal.toFixed(2);
      }
      
      if (this.wasteCarbonElement) {
        this.wasteCarbonElement.textContent = wasteTotal.toFixed(2);
      }
      
      // Compare to average
      const comparisonPercentage = (totalCarbon / AVERAGE_FOOTPRINT) * 100;
      let comparisonText;
      let indicatorPosition;
      
      if (comparisonPercentage < 50) {
        comparisonText = "Much Lower than Average";
        indicatorPosition = "10%";
      } else if (comparisonPercentage < 80) {
        comparisonText = "Lower than Average";
        indicatorPosition = "30%";
      } else if (comparisonPercentage < 120) {
        comparisonText = "Average";
        indicatorPosition = "50%";
      } else if (comparisonPercentage < 150) {
        comparisonText = "Higher than Average";
        indicatorPosition = "70%";
      } else {
        comparisonText = "Much Higher than Average";
        indicatorPosition = "90%";
      }
      
      if (this.comparisonResultElement) {
        this.comparisonResultElement.textContent = comparisonText;
      }
      
      if (this.comparisonIndicator) {
        this.comparisonIndicator.style.left = indicatorPosition;
      }
      
      // Generate reduction tips
      this.generateReductionTips({
        transportation: transportationTotal,
        energy: energyTotal,
        food: foodTotal,
        waste: wasteTotal,
        carMiles,
        flights: shortFlights + longFlights,
        dietType,
        recyclingRate,
        composting
      });
      
      // Create or update chart
      try {
        this.createBreakdownChart([
          transportationTotal,
          energyTotal,
          foodTotal,
          wasteTotal
        ]);
      } catch (error) {
        console.error("Error creating chart:", error);
        // Continue without chart if there's an error
      }
      
      // Show results
      if (this.resultSection) {
        this.resultSection.style.display = 'block';
        
        // Scroll to results
        this.resultSection.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error calculating carbon footprint:', error);
      alert('Error calculating carbon footprint. Please check your inputs.');
    }
  }

  // Create breakdown chart
  createBreakdownChart(data) {
    // Check if Chart is defined
    if (typeof Chart === 'undefined') {
      console.error('Chart.js is not loaded. Please include the Chart.js library.');
      return;
    }
    
    const ctx = document.getElementById('breakdown-chart');
    if (!ctx) return;
    
    // If chart already exists, destroy it
    if (this.breakdownChart) {
      this.breakdownChart.destroy();
    }
    
    // Create new chart
    this.breakdownChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Transportation', 'Home Energy', 'Food & Consumption', 'Waste'],
        datasets: [{
          data: data,
          backgroundColor: [
            '#3498db',  // Blue for Transportation
            '#e74c3c',  // Red for Home Energy
            '#2ecc71',  // Green for Food & Consumption
            '#f39c12'   // Orange for Waste
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#ffffff'  // Set label color to white
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw.toFixed(2);
                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((context.raw / total) * 100);
                return `${label}: ${value} tons (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  // Generate personalized reduction tips
  generateReductionTips(data) {
    if (!this.reductionTipsList) return;

    // Clear existing tips
    this.reductionTipsList.innerHTML = '';
    
    const tips = [];
    
    // Transportation tips
    if (data.transportation > 4) {
      if (data.carMiles > 5000) {
        tips.push("Consider carpooling or using public transportation to reduce your car emissions.");
        tips.push("If possible, try working from home a few days a week to reduce commuting.");
      }
      if (data.flights > 3) {
        tips.push("Try to combine trips or use video conferencing instead of flying for business.");
        tips.push("Consider carbon offsets when flying to mitigate your flight emissions.");
      }
    }
    
    // Energy tips
    if (data.energy > 3) {
      tips.push("Switch to LED light bulbs and energy-efficient appliances.");
      tips.push("Consider increasing your use of renewable energy through home solar panels or green energy programs.");
      tips.push("Improve home insulation to reduce heating and cooling needs.");
    }
    
    // Food tips
    if (data.food > 2) {
      if (data.dietType === 'meat-heavy') {
        tips.push("Try having one or more meatless days per week to reduce your dietary carbon footprint.");
      }
      tips.push("Buy more locally produced and seasonal foods to reduce transportation emissions.");
      tips.push("Plan meals to reduce food waste and save money while lowering emissions.");
    }
    
    // Waste tips
    if (data.waste > 1) {
      if (data.recyclingRate < 0.5) {
        tips.push("Increase your recycling efforts - aim for recycling at least 50% of your waste.");
      }
      if (!data.composting) {
        tips.push("Start composting food scraps to reduce methane emissions from landfills.");
      }
      tips.push("Choose products with less packaging or bring reusable bags and containers when shopping.");
    }
    
    // Set main tip
    const mainTipElement = document.getElementById('main-tip');
    if (mainTipElement) {
      mainTipElement.textContent = "Track your carbon footprint regularly to monitor your progress.";
    }
    
    // Add tips to the list
    tips.forEach(tip => {
      const li = document.createElement('li');
      li.textContent = tip;
      this.reductionTipsList.appendChild(li);
    });
  }

  // Generate PDF report
  generatePDF() {
    // Check if jsPDF is available
    if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
      console.error("jsPDF library not found");
      alert('PDF generation is not available. Please try again later.');
      return;
    }
    
    try {
      // Get jsPDF from the correct location
      const jsPDF = window.jspdf?.jsPDF || window.jsPDF;
      
      if (!jsPDF) {
        console.error("jsPDF constructor not found");
        alert('PDF generation is not available. Please try again later.');
        return;
      }
      
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(22);
      doc.setTextColor(44, 62, 80);
      doc.text('Your Carbon Footprint Report', 105, 20, { align: 'center' });
      
      // Add date
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      const today = new Date();
      doc.text(`Generated on: ${today.toLocaleDateString()}`, 105, 30, { align: 'center' });
      
      // Add total carbon footprint
      doc.setFontSize(16);
      doc.setTextColor(44, 62, 80);
      doc.text('Total Annual Carbon Footprint:', 20, 45);
      
      doc.setFontSize(20);
      doc.setTextColor(231, 76, 60);
      const totalCarbon = this.totalCarbonElement ? this.totalCarbonElement.textContent : '0.00';
      doc.text(`${totalCarbon} metric tons CO₂e`, 20, 55);
      
      // Add comparison
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      const comparisonText = this.comparisonResultElement ? this.comparisonResultElement.textContent : 'Average';
      doc.text(`Compared to average: ${comparisonText}`, 20, 70);
      
      // Add breakdown
      doc.setFontSize(16);
      doc.text('Breakdown by Category:', 20, 85);
      
      doc.setFontSize(12);
      const transportation = this.transportationCarbonElement ? this.transportationCarbonElement.textContent : '0.00';
      const energy = this.energyCarbonElement ? this.energyCarbonElement.textContent : '0.00';
      const food = this.foodCarbonElement ? this.foodCarbonElement.textContent : '0.00';
      const waste = this.wasteCarbonElement ? this.wasteCarbonElement.textContent : '0.00';
      
      doc.text(`Transportation: ${transportation} tons CO₂e`, 30, 95);
      doc.text(`Home Energy: ${energy} tons CO₂e`, 30, 105);
      doc.text(`Food & Consumption: ${food} tons CO₂e`, 30, 115);
      doc.text(`Waste: ${waste} tons CO₂e`, 30, 125);
      
      // Add tips
      doc.setFontSize(16);
      doc.text('Personalized Reduction Tips:', 20, 140);
      
      doc.setFontSize(12);
      let tipY = 150;
      const tips = this.reductionTipsList ? this.reductionTipsList.querySelectorAll('li') : [];
      tips.forEach((tip, index) => {
        if (index < 5) { // Limit to 5 tips to fit on page
          doc.text(`• ${tip.textContent}`, 30, tipY);
          tipY += 10;
        }
      });
      
      // Add footer
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Generated by Calculator Universe - Carbon Footprint Calculator', 105, 280, { align: 'center' });
      
      // Save the PDF
      doc.save('carbon-footprint-report.pdf');
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert('There was an error generating the PDF. Please try again later.');
    }
  }

  // Share results
  shareResults() {
    const totalCarbon = this.totalCarbonElement ? this.totalCarbonElement.textContent : '0.00';
    const comparisonText = this.comparisonResultElement ? this.comparisonResultElement.textContent : 'Average';
    
    const shareText = `My annual carbon footprint is ${totalCarbon} metric tons CO₂e, which is ${comparisonText}. Calculate yours at Calculator Universe!`;
    
    // Check if Web Share API is supported
    if (navigator.share) {
      navigator.share({
        title: 'My Carbon Footprint Results',
        text: shareText,
        url: window.location.href
      })
      .catch(error => {
        console.error('Error sharing:', error);
        this.fallbackShare(shareText);
      });
    } else {
      this.fallbackShare(shareText);
    }
  }

  // Fallback sharing method
  fallbackShare(text) {
    // Create a temporary input element
    const input = document.createElement('textarea');
    input.value = text;
    document.body.appendChild(input);
    
    // Select and copy the text
    input.select();
    document.execCommand('copy');
    
    // Remove the temporary element
    document.body.removeChild(input);
    
    // Alert the user
    alert('Results copied to clipboard! You can now paste and share it.');
  }
}

// Initialize the calculator when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
  new CarbonFootprintCalculatorLogic();
});
