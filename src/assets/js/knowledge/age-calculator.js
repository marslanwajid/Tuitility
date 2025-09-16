/**
 * Age Calculator JavaScript
 * Individual classes and IDs to avoid conflicts with other tools
 */

class AgeCalculatorLogic {
  constructor() {
    this.ageCategories = {
      infant: { min: 0, max: 1, label: 'Infant', color: '#e91e63' },
      toddler: { min: 1, max: 3, label: 'Toddler', color: '#9c27b0' },
      preschooler: { min: 3, max: 5, label: 'Preschooler', color: '#673ab7' },
      child: { min: 5, max: 12, label: 'Child', color: '#3f51b5' },
      teenager: { min: 12, max: 18, label: 'Teenager', color: '#2196f3' },
      youngAdult: { min: 18, max: 30, label: 'Young Adult', color: '#00bcd4' },
      adult: { min: 30, max: 50, label: 'Adult', color: '#4caf50' },
      middleAge: { min: 50, max: 65, label: 'Middle Age', color: '#ff9800' },
      senior: { min: 65, max: 100, label: 'Senior', color: '#f44336' }
    };
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
    } else {
      this.setupEventListeners();
    }
  }

  setupEventListeners() {
    // Get DOM elements for age calculator inputs
    const ageBirthDateInput = document.getElementById('age-birth-date');
    const ageBirthTimeInput = document.getElementById('age-birth-time');
    const ageCalculationDateInput = document.getElementById('age-calculation-date');
    const ageCalculationTimeInput = document.getElementById('age-calculation-time');
    
    const ageCalculateButton = document.getElementById('age-calculate-age');
    const ageResetButton = document.getElementById('age-reset-calculator');
    const ageResultSection = document.getElementById('age-result-section');
    
    // Set default values
    const today = new Date();
    const formattedDate = this.formatDateForInput(today);
    if (ageCalculationDateInput) {
      ageCalculationDateInput.value = formattedDate;
    }
    
    // Format time as HH:MM
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    if (ageCalculationTimeInput) {
      ageCalculationTimeInput.value = `${hours}:${minutes}`;
    }
    
    // Add event listeners
    if (ageCalculateButton) {
      ageCalculateButton.addEventListener('click', () => this.calculateAge());
    }
    
    if (ageResetButton) {
      ageResetButton.addEventListener('click', () => this.resetCalculator());
    }
  }

  formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  resetCalculator() {
    // Get DOM elements
    const ageBirthDateInput = document.getElementById('age-birth-date');
    const ageBirthTimeInput = document.getElementById('age-birth-time');
    const ageCalculationDateInput = document.getElementById('age-calculation-date');
    const ageCalculationTimeInput = document.getElementById('age-calculation-time');
    const ageResultSection = document.getElementById('age-result-section');
    
    // Reset date pickers
    if (ageBirthDateInput) ageBirthDateInput.value = '';
    if (ageBirthTimeInput) ageBirthTimeInput.value = '';
    
    // Set default calculation date to today
    const today = new Date();
    const formattedDate = this.formatDateForInput(today);
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    
    if (ageCalculationDateInput) ageCalculationDateInput.value = formattedDate;
    if (ageCalculationTimeInput) ageCalculationTimeInput.value = `${hours}:${minutes}`;
    
    // Hide results
    if (ageResultSection) {
      ageResultSection.style.display = 'none';
    }
  }

  calculateAge() {
    // Get DOM elements
    const ageBirthDateInput = document.getElementById('age-birth-date');
    const ageBirthTimeInput = document.getElementById('age-birth-time');
    const ageCalculationDateInput = document.getElementById('age-calculation-date');
    const ageCalculationTimeInput = document.getElementById('age-calculation-time');
    const ageResultSection = document.getElementById('age-result-section');
    
    // Get birth date
    let birthDate;
    
    if (ageBirthDateInput && ageBirthDateInput.value) {
      birthDate = new Date(ageBirthDateInput.value);
    } else {
      this.showError('Please enter your birth date');
      return;
    }
    
    // Add time if provided
    if (ageBirthTimeInput && ageBirthTimeInput.value) {
      const [birthHours, birthMinutes] = ageBirthTimeInput.value.split(':');
      birthDate.setHours(parseInt(birthHours), parseInt(birthMinutes), 0, 0);
    } else {
      birthDate.setHours(0, 0, 0, 0);
    }
    
    // Get calculation date (today if not specified)
    let calculationDate;
    
    if (ageCalculationDateInput && ageCalculationDateInput.value) {
      calculationDate = new Date(ageCalculationDateInput.value);
    } else {
      calculationDate = new Date();
    }
    
    // Add time if provided
    if (ageCalculationTimeInput && ageCalculationTimeInput.value) {
      const [calcHours, calcMinutes] = ageCalculationTimeInput.value.split(':');
      calculationDate.setHours(parseInt(calcHours), parseInt(calcMinutes), 0, 0);
    } else {
      calculationDate.setHours(23, 59, 59, 999);
    }
    
    // Validate dates
    if (isNaN(birthDate.getTime())) {
      this.showError('Please enter a valid birth date');
      return;
    }
    
    if (isNaN(calculationDate.getTime())) {
      this.showError('Please enter a valid calculation date');
      return;
    }
    
    if (birthDate > calculationDate) {
      this.showError('Birth date cannot be in the future');
      return;
    }
    
    // Calculate age
    const ageDetails = this.calculateAgeDetails(birthDate, calculationDate);
    
    // Display results
    this.displayResults(ageDetails, birthDate, calculationDate);
    
    // Show result section
    if (ageResultSection) {
      ageResultSection.style.display = 'block';
      ageResultSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  calculateAgeDetails(birthDate, currentDate) {
    // Clone dates to avoid modifying the originals
    const startDate = new Date(birthDate);
    const endDate = new Date(currentDate);
    
    // Calculate total values
    const totalMilliseconds = endDate - startDate;
    const totalSeconds = Math.floor(totalMilliseconds / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = this.calculateTotalMonths(startDate, endDate);
    const totalYears = Math.floor(totalMonths / 12);
    
    // Calculate years, months, days
    let years = 0;
    let months = 0;
    let days = 0;
    
    // Start with the birth date
    let tempDate = new Date(startDate);
    
    // Calculate years
    while (true) {
      const nextYearDate = new Date(tempDate);
      nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
      
      if (nextYearDate <= endDate) {
        years++;
        tempDate = nextYearDate;
      } else {
        break;
      }
    }
    
    // Calculate months
    while (true) {
      const nextMonthDate = new Date(tempDate);
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      
      if (nextMonthDate <= endDate) {
        months++;
        tempDate = nextMonthDate;
      } else {
        break;
      }
    }
    
    // Calculate remaining days
    days = Math.floor((endDate - tempDate) / (1000 * 60 * 60 * 24));
    
    // Calculate next birthday
    const nextBirthday = this.calculateNextBirthday(birthDate, currentDate);
    
    return {
      years,
      months,
      days,
      totalYears,
      totalMonths,
      totalWeeks,
      totalDays,
      totalHours,
      totalMinutes,
      totalSeconds,
      nextBirthday
    };
  }

  calculateTotalMonths(startDate, endDate) {
    const years = endDate.getFullYear() - startDate.getFullYear();
    const months = endDate.getMonth() - startDate.getMonth();
    
    return years * 12 + months + (endDate.getDate() >= startDate.getDate() ? 0 : -1);
  }

  calculateNextBirthday(birthDate, currentDate) {
    const birthMonth = birthDate.getMonth();
    const birthDay = birthDate.getDate();
    
    // Create date for this year's birthday
    let nextBirthday = new Date(currentDate.getFullYear(), birthMonth, birthDay);
    
    // If birthday has already occurred this year, set to next year
    if (nextBirthday < currentDate) {
      nextBirthday.setFullYear(currentDate.getFullYear() + 1);
    }
    
    // Calculate days until next birthday
    const daysUntil = Math.ceil((nextBirthday - currentDate) / (1000 * 60 * 60 * 24));
    
    // Get day of week
    const dayOfWeek = nextBirthday.toLocaleDateString('en-US', { weekday: 'long' });
    
    return {
      date: nextBirthday,
      daysUntil,
      dayOfWeek
    };
  }

  getAgeCategory(age) {
    for (const [key, category] of Object.entries(this.ageCategories)) {
      if (age >= category.min && age < category.max) {
        return { name: category.label, color: category.color, key };
      }
    }
    return { name: 'Centenarian', color: '#795548', key: 'centenarian' };
  }

  displayResults(ageDetails, birthDate, currentDate) {
    // Display main results
    const ageResultYears = document.getElementById('age-result-years');
    const ageResultMonths = document.getElementById('age-result-months');
    const ageResultDays = document.getElementById('age-result-days');
    
    if (ageResultYears) ageResultYears.textContent = ageDetails.years;
    if (ageResultMonths) ageResultMonths.textContent = ageDetails.months;
    if (ageResultDays) ageResultDays.textContent = ageDetails.days;
    
    // Display detailed breakdown
    const ageTotalYears = document.getElementById('age-total-years');
    const ageTotalMonths = document.getElementById('age-total-months');
    const ageTotalWeeks = document.getElementById('age-total-weeks');
    const ageTotalDays = document.getElementById('age-total-days');
    const ageTotalHours = document.getElementById('age-total-hours');
    const ageTotalMinutes = document.getElementById('age-total-minutes');
    
    if (ageTotalYears) ageTotalYears.textContent = ageDetails.totalYears;
    if (ageTotalMonths) ageTotalMonths.textContent = ageDetails.totalMonths;
    if (ageTotalWeeks) ageTotalWeeks.textContent = ageDetails.totalWeeks.toLocaleString();
    if (ageTotalDays) ageTotalDays.textContent = ageDetails.totalDays.toLocaleString();
    if (ageTotalHours) ageTotalHours.textContent = ageDetails.totalHours.toLocaleString();
    if (ageTotalMinutes) ageTotalMinutes.textContent = ageDetails.totalMinutes.toLocaleString();
    
    // Display next birthday information
    const ageDaysToBirthday = document.getElementById('age-days-to-birthday');
    const ageDayOfWeek = document.getElementById('age-day-of-week');
    
    if (ageDaysToBirthday) ageDaysToBirthday.textContent = ageDetails.nextBirthday.daysUntil;
    if (ageDayOfWeek) ageDayOfWeek.textContent = ageDetails.nextBirthday.dayOfWeek;
    
    // Display age category
    const ageCategory = this.getAgeCategory(ageDetails.years);
    const ageCategoryElement = document.getElementById('age-category');
    if (ageCategoryElement) {
      ageCategoryElement.textContent = ageCategory.name;
      ageCategoryElement.style.color = ageCategory.color;
    }
  }

  showError(message) {
    // Create or update error display
    let errorElement = document.getElementById('age-error-message');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = 'age-error-message';
      errorElement.className = 'age-error-message';
      
      // Insert before the form
      const form = document.querySelector('.age-calculator-form');
      if (form) {
        form.parentNode.insertBefore(errorElement, form);
      }
    }
    
    errorElement.innerHTML = `
      <div class="age-error-content">
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
      </div>
    `;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (errorElement) {
        errorElement.remove();
      }
    }, 5000);
  }

  // Utility method to validate date input
  validateDateInput(dateString) {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  // Utility method to validate time input
  validateTimeInput(timeString) {
    if (!timeString) return true; // Time is optional
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeString);
  }

  // Method to get current age in different formats
  getCurrentAge(birthDate) {
    const now = new Date();
    return this.calculateAgeDetails(birthDate, now);
  }

  // Method to calculate age on specific date
  getAgeOnDate(birthDate, targetDate) {
    return this.calculateAgeDetails(birthDate, targetDate);
  }

  // Method to get all age categories
  getAllAgeCategories() {
    return this.ageCategories;
  }

  // Method to check if a year is a leap year
  isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  // Method to get days in a month
  getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }
}

// Initialize the Age Calculator when the script loads
let ageCalculatorInstance = null;

// Function to initialize Age Calculator
function initializeAgeCalculator() {
  if (!ageCalculatorInstance) {
    ageCalculatorInstance = new AgeCalculatorLogic();
  }
  return ageCalculatorInstance;
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAgeCalculator);
} else {
  initializeAgeCalculator();
}

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AgeCalculatorLogic;
}

// Global access for debugging
window.AgeCalculatorLogic = AgeCalculatorLogic;
window.initializeAgeCalculator = initializeAgeCalculator;
