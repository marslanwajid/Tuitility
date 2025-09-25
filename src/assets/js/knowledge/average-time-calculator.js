// Average Time Calculator Logic Class
class AverageTimeCalculatorLogic {
  constructor() {
    this.initializeElements();
    this.attachEventListeners();
    this.init();
  }

  initializeElements() {
    // DOM Elements
    this.timeEntriesContainer = document.getElementById('time-entries');
    this.addEntryButton = document.getElementById('add-entry');
    this.calculateButton = document.getElementById('calculate-average');
    this.resetButton = document.getElementById('reset-calculator');
    this.resultSection = document.getElementById('result-section');
    this.showMillisecondsCheckbox = document.getElementById('show-milliseconds');
    this.calculationMethodSelect = document.getElementById('calculation-method');
    this.excludeOutliersCheckbox = document.getElementById('exclude-outliers');
    this.outlierThresholdContainer = document.getElementById('outlier-threshold-container');
    this.outlierThresholdInput = document.getElementById('outlier-threshold');
    
    // Chart instance
    this.timeChart = null;
  }

  attachEventListeners() {
    // Add event listeners
    if (this.addEntryButton) {
      this.addEntryButton.addEventListener('click', () => this.addTimeEntry());
    }
    
    if (this.calculateButton) {
      this.calculateButton.addEventListener('click', () => this.calculateAverage());
    }
    
    if (this.resetButton) {
      this.resetButton.addEventListener('click', () => this.resetCalculator());
    }
    
    if (this.showMillisecondsCheckbox) {
      this.showMillisecondsCheckbox.addEventListener('change', () => this.toggleMilliseconds());
    }
    
    if (this.excludeOutliersCheckbox) {
      this.excludeOutliersCheckbox.addEventListener('change', () => this.toggleOutlierThreshold());
    }
  }

  init() {
    // Hide milliseconds by default
    this.toggleMilliseconds();
    
    // Initialize first entry
    this.updateEntryNumbers();
  }

  // Add a new time entry
  addTimeEntry() {
    if (!this.timeEntriesContainer) return;

    const newEntry = document.createElement('div');
    newEntry.className = 'time-entry';
    
    const entryNumber = document.createElement('div');
    entryNumber.className = 'entry-number';
    
    const timeInputContainer = document.createElement('div');
    timeInputContainer.className = 'time-input-container';
    timeInputContainer.innerHTML = `
      <input type="number" min="0" max="23" placeholder="HH" class="time-part hours">
      <span>:</span>
      <input type="number" min="0" max="59" placeholder="MM" class="time-part minutes">
      <span>:</span>
      <input type="number" min="0" max="59" placeholder="SS" class="time-part seconds">
      <span class="optional-ms">.</span>
      <input type="number" min="0" max="999" placeholder="MS" class="time-part milliseconds optional-ms">
    `;
    
    const entryActions = document.createElement('div');
    entryActions.className = 'entry-actions';
    entryActions.innerHTML = `
      <button class="remove-entry" title="Remove this entry">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    newEntry.appendChild(entryNumber);
    newEntry.appendChild(timeInputContainer);
    newEntry.appendChild(entryActions);
    
    this.timeEntriesContainer.appendChild(newEntry);
    
    // Add event listener to remove button
    const removeButton = newEntry.querySelector('.remove-entry');
    removeButton.addEventListener('click', () => {
      this.timeEntriesContainer.removeChild(newEntry);
      this.updateEntryNumbers();
    });
    
    // Update entry numbers
    this.updateEntryNumbers();
    
    // After adding the new entry, check if milliseconds should be hidden
    if (this.showMillisecondsCheckbox && !this.showMillisecondsCheckbox.checked) {
      const msElements = newEntry.querySelectorAll('.optional-ms');
      msElements.forEach(element => {
        element.style.display = 'none';
      });
    }
  }

  // Update entry numbers
  updateEntryNumbers() {
    if (!this.timeEntriesContainer) return;

    const entries = this.timeEntriesContainer.querySelectorAll('.time-entry');
    
    entries.forEach((entry, index) => {
      const entryNumber = entry.querySelector('.entry-number');
      if (entryNumber) {
        entryNumber.textContent = index + 1;
      }
      
      // Enable/disable remove buttons based on entry count
      const removeButton = entry.querySelector('.remove-entry');
      if (removeButton) {
        removeButton.disabled = entries.length <= 1;
      }
    });
  }

  // Toggle milliseconds visibility
  toggleMilliseconds() {
    if (!this.showMillisecondsCheckbox) return;

    const showMs = this.showMillisecondsCheckbox.checked;
    const msElements = document.querySelectorAll('.optional-ms');
    
    msElements.forEach(element => {
      element.style.display = showMs ? 'inline' : 'none';
    });
  }

  // Toggle outlier threshold input
  toggleOutlierThreshold() {
    if (!this.excludeOutliersCheckbox || !this.outlierThresholdContainer) return;

    const outliersRow = document.getElementById('outliers-row');
    this.outlierThresholdContainer.style.display = this.excludeOutliersCheckbox.checked ? 'block' : 'none';
    
    if (outliersRow) {
      outliersRow.style.display = this.excludeOutliersCheckbox.checked ? 'flex' : 'none';
    }
  }

  // Reset calculator
  resetCalculator() {
    if (!this.timeEntriesContainer) return;

    // Clear all entries except the first one
    while (this.timeEntriesContainer.children.length > 1) {
      this.timeEntriesContainer.removeChild(this.timeEntriesContainer.lastChild);
    }
    
    // Reset first entry values
    const firstEntry = this.timeEntriesContainer.querySelector('.time-entry');
    if (firstEntry) {
      const inputs = firstEntry.querySelectorAll('input[type="number"]');
      inputs.forEach(input => {
        input.value = '';
      });
    }
    
    // Reset options
    if (this.calculationMethodSelect) {
      this.calculationMethodSelect.value = 'mean';
    }
    
    if (this.excludeOutliersCheckbox) {
      this.excludeOutliersCheckbox.checked = false;
    }
    
    if (this.outlierThresholdInput) {
      this.outlierThresholdInput.value = 2;
    }
    
    if (this.outlierThresholdContainer) {
      this.outlierThresholdContainer.style.display = 'none';
    }
    
    // Hide results
    if (this.resultSection) {
      this.resultSection.style.display = 'none';
    }
    
    // Update entry numbers
    this.updateEntryNumbers();
    
    // Destroy chart if it exists
    if (this.timeChart) {
      this.timeChart.destroy();
      this.timeChart = null;
    }
  }

  // Calculate average time
  calculateAverage() {
    if (!this.timeEntriesContainer) return;

    try {
      // Get all time entries
      const entries = this.timeEntriesContainer.querySelectorAll('.time-entry');
      const times = [];
      
      // Validate and collect time values
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const hours = parseInt(entry.querySelector('.hours')?.value) || 0;
        const minutes = parseInt(entry.querySelector('.minutes')?.value) || 0;
        const seconds = parseInt(entry.querySelector('.seconds')?.value) || 0;
        const milliseconds = parseInt(entry.querySelector('.milliseconds')?.value) || 0;
        
        // Validate time values
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || 
            seconds < 0 || seconds > 59 || milliseconds < 0 || milliseconds > 999) {
          alert(`Invalid time value in entry ${i + 1}. Please check your inputs.`);
          return;
        }
        
        // Convert to milliseconds for calculations
        const totalMs = (hours * 3600000) + (minutes * 60000) + (seconds * 1000) + milliseconds;
        times.push(totalMs);
      }
      
      if (times.length === 0) {
        alert('Please add at least one time entry.');
        return;
      }
      
      // Process times based on options
      let processedTimes = [...times];
      let outliers = [];
      
      // Handle outliers if option is selected
      if (this.excludeOutliersCheckbox && this.excludeOutliersCheckbox.checked) {
        const threshold = parseFloat(this.outlierThresholdInput?.value) || 2;
        const result = this.removeOutliers(processedTimes, threshold);
        processedTimes = result.filteredData;
        outliers = result.outliers;
      }
      
      // Calculate statistics based on selected method
      const method = this.calculationMethodSelect?.value || 'mean';
      const results = {};
      
      // Always calculate mean
      results.mean = this.calculateMean(processedTimes);
      
      // Calculate other statistics based on selected method
      if (method === 'median' || method === 'all') {
        results.median = this.calculateMedian(processedTimes);
        const medianCard = document.getElementById('median-card');
        if (medianCard) {
          medianCard.style.display = 'block';
        }
      } else {
        const medianCard = document.getElementById('median-card');
        if (medianCard) {
          medianCard.style.display = 'none';
        }
      }
      
      if (method === 'mode' || method === 'all') {
        results.mode = this.calculateMode(processedTimes);
        const modeCard = document.getElementById('mode-card');
        if (modeCard) {
          modeCard.style.display = 'block';
        }
      } else {
        const modeCard = document.getElementById('mode-card');
        if (modeCard) {
          modeCard.style.display = 'none';
        }
      }
      
      // Calculate additional statistics
      const min = Math.min(...processedTimes);
      const max = Math.max(...processedTimes);
      const range = max - min;
      const stdDev = this.calculateStandardDeviation(processedTimes);
      
      // Display results
      this.displayResults(results, processedTimes, outliers, min, max, range, stdDev);
      
      // Show result section
      if (this.resultSection) {
        this.resultSection.style.display = 'block';
      }
      
      // Create or update chart
      this.createTimeChart(processedTimes, outliers);
      
      // Scroll to results
      if (this.resultSection) {
        this.resultSection.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error calculating average time:', error);
      alert('Error calculating average time. Please check your inputs.');
    }
  }

  // Calculate mean (average)
  calculateMean(times) {
    if (times.length === 0) return 0;
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  // Calculate median (middle value)
  calculateMedian(times) {
    if (times.length === 0) return 0;
    
    const sortedTimes = [...times].sort((a, b) => a - b);
    const middle = Math.floor(sortedTimes.length / 2);
    
    if (sortedTimes.length % 2 === 0) {
      return (sortedTimes[middle - 1] + sortedTimes[middle]) / 2;
    } else {
      return sortedTimes[middle];
    }
  }

  // Calculate mode (most common value)
  calculateMode(times) {
    if (times.length === 0) return 0;
    
    // Round to nearest second for mode calculation
    const roundedTimes = times.map(time => Math.round(time / 1000) * 1000);
    
    const frequency = {};
    let maxFrequency = 0;
    let mode = roundedTimes[0];
    
    roundedTimes.forEach(time => {
      frequency[time] = (frequency[time] || 0) + 1;
      
      if (frequency[time] > maxFrequency) {
        maxFrequency = frequency[time];
        mode = time;
      }
    });
    
    // If all values appear the same number of times, return the mean
    if (Object.values(frequency).every(count => count === maxFrequency)) {
      return this.calculateMean(times);
    }
    
    return mode;
  }

  // Calculate standard deviation
  calculateStandardDeviation(times) {
    if (times.length <= 1) return 0;
    
    const mean = this.calculateMean(times);
    const squaredDifferences = times.map(time => Math.pow(time - mean, 2));
    const variance = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / times.length;
    
    return Math.sqrt(variance);
  }

  // Remove outliers using standard deviation method
  removeOutliers(data, threshold) {
    const mean = this.calculateMean(data);
    const stdDev = this.calculateStandardDeviation(data);
    
    const outliers = [];
    const filteredData = data.filter(value => {
      const zScore = Math.abs((value - mean) / stdDev);
      const isOutlier = zScore > threshold;
      
      if (isOutlier) {
        outliers.push(value);
      }
      
      return !isOutlier;
    });
    
    return { filteredData, outliers };
  }

  // Format milliseconds to time string
  formatTime(ms, includeMs = true) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = ms % 1000;
    
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    
    if (includeMs) {
      const formattedMs = String(milliseconds).padStart(3, '0');
      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMs}`;
    } else {
      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }
  }

  // Display results
  displayResults(results, processedTimes, outliers, min, max, range, stdDev) {
    const includeMs = this.showMillisecondsCheckbox ? this.showMillisecondsCheckbox.checked : true;
    
    // Display main results
    const resultMean = document.getElementById('result-mean');
    if (resultMean) {
      resultMean.textContent = this.formatTime(results.mean, includeMs);
    }
    
    if (results.median !== undefined) {
      const resultMedian = document.getElementById('result-median');
      if (resultMedian) {
        resultMedian.textContent = this.formatTime(results.median, includeMs);
      }
    }
    
    if (results.mode !== undefined) {
      const resultMode = document.getElementById('result-mode');
      if (resultMode) {
        resultMode.textContent = this.formatTime(results.mode, includeMs);
      }
    }
    
    // Display detailed analysis
    const totalEntries = document.getElementById('total-entries');
    if (totalEntries) {
      totalEntries.textContent = this.timeEntriesContainer ? this.timeEntriesContainer.querySelectorAll('.time-entry').length : 0;
    }
    
    const outliersExcluded = document.getElementById('outliers-excluded');
    if (outliersExcluded) {
      outliersExcluded.textContent = outliers.length;
    }
    
    const minTime = document.getElementById('min-time');
    if (minTime) {
      minTime.textContent = this.formatTime(min, includeMs);
    }
    
    const maxTime = document.getElementById('max-time');
    if (maxTime) {
      maxTime.textContent = this.formatTime(max, includeMs);
    }
    
    const timeRange = document.getElementById('time-range');
    if (timeRange) {
      timeRange.textContent = this.formatTime(range, includeMs);
    }
    
    const stdDeviation = document.getElementById('std-deviation');
    if (stdDeviation) {
      stdDeviation.textContent = this.formatTime(stdDev, includeMs);
    }
  }

  // Create time distribution chart
  createTimeChart(times, outliers) {
    const chartCanvas = document.getElementById('time-chart');
    if (!chartCanvas) return;

    // Destroy existing chart if it exists
    if (this.timeChart) {
      this.timeChart.destroy();
    }

    // Convert times to seconds for better visualization
    const timesInSeconds = times.map(time => time / 1000);
    const outliersInSeconds = outliers.map(time => time / 1000);

    // Determine bin size based on data range
    const min = Math.min(...timesInSeconds);
    const max = Math.max(...timesInSeconds);
    const range = max - min;
    const binCount = Math.min(Math.max(Math.ceil(Math.sqrt(timesInSeconds.length)), 5), 15);

    // Create histogram data
    const histogramData = this.createHistogram(timesInSeconds, min, max, binCount);
    const outlierHistogramData = this.createHistogram(outliersInSeconds, min, max, binCount);

    // Create chart
    this.timeChart = new Chart(chartCanvas, {
      type: 'bar',
      data: {
        labels: histogramData.labels,
        datasets: [
          {
            label: 'Time Distribution',
            data: histogramData.counts,
            backgroundColor: 'rgba(46, 81, 162, 0.7)',
            borderColor: 'rgba(46, 81, 162, 1)',
            borderWidth: 1
          },
          {
            label: 'Outliers',
            data: outlierHistogramData.counts,
            backgroundColor: 'rgba(220, 53, 69, 0.7)',
            borderColor: 'rgba(220, 53, 69, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time (seconds)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Frequency'
            },
            beginAtZero: true
          }
        }
      }
    });
  }

  // Create histogram data
  createHistogram(data, min, max, binCount) {
    const binSize = (max - min) / binCount;
    const counts = Array(binCount).fill(0);
    const labels = [];

    // Create bin labels
    for (let i = 0; i < binCount; i++) {
      const binStart = min + (i * binSize);
      const binEnd = binStart + binSize;
      labels.push(`${binStart.toFixed(1)}-${binEnd.toFixed(1)}`);
    }

    // Count values in each bin
    data.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
      counts[binIndex]++;
    });

    return { labels, counts };
  }
}

// Initialize the calculator when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
  new AverageTimeCalculatorLogic();
});
