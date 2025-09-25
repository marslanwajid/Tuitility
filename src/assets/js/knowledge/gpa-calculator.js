/**
 * GPA/CGPA Calculator JavaScript
 * Individual classes and IDs to avoid conflicts with other tools
 */

class GPACalculatorLogic {
  constructor() {
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
    // Tab switching functionality
    this.setupTabSwitching();
    
    // Add course/semester functionality
    this.setupAddCourse();
    this.setupAddSemester();
    
    // Remove course/semester functionality
    this.setupRemoveButtons();
    
    // Form submission handlers
    this.setupFormSubmissions();
  }

  setupTabSwitching() {
    const gpaTabButtons = document.querySelectorAll('.gpa-tab-button');
    const gpaTabContents = document.querySelectorAll('.gpa-tab-content');

    gpaTabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');
        
        // Update active states
        gpaTabButtons.forEach(btn => btn.classList.remove('active'));
        gpaTabContents.forEach(content => content.classList.remove('active'));
        
        button.classList.add('active');
        const targetTab = document.getElementById(`${tabId}-tab`);
        if (targetTab) {
          targetTab.classList.add('active');
        }
        
        // Hide results when switching tabs
        const resultSection = document.getElementById('gpa-result-section');
        if (resultSection) {
          resultSection.style.display = 'none';
          resultSection.classList.remove('show');
        }
      });
    });
  }

  setupAddCourse() {
    const addCourseBtn = document.getElementById('gpa-add-course');
    if (addCourseBtn) {
      addCourseBtn.addEventListener('click', () => {
        const courseInputs = document.getElementById('gpa-course-inputs');
        if (courseInputs) {
          const newRow = this.createCourseRow();
          courseInputs.appendChild(newRow);
        }
      });
    }
  }

  setupAddSemester() {
    const addSemesterBtn = document.getElementById('cgpa-add-semester');
    if (addSemesterBtn) {
      addSemesterBtn.addEventListener('click', () => {
        const semesterInputs = document.getElementById('cgpa-semester-inputs');
        if (semesterInputs) {
          const newRow = this.createSemesterRow();
          semesterInputs.appendChild(newRow);
        }
      });
    }
  }

  setupRemoveButtons() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('gpa-remove-course') || 
          e.target.classList.contains('gpa-remove-semester')) {
        const row = e.target.closest('.gpa-input-row');
        if (row) {
          row.remove();
        }
      }
    });
  }

  setupFormSubmissions() {
    const gpaForm = document.getElementById('gpa-form');
    const cgpaForm = document.getElementById('cgpa-form');

    if (gpaForm) {
      gpaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.calculateGPA();
      });
    }

    if (cgpaForm) {
      cgpaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.calculateCGPA();
      });
    }
  }

  createCourseRow() {
    const newRow = document.createElement('div');
    newRow.className = 'gpa-input-row';
    newRow.innerHTML = `
      <div class="gpa-input-group">
        <input type="text" placeholder="Course Name (e.g., Mathematics 101)" class="gpa-course-name" required>
        <select class="gpa-grade-select" required>
          <option value="">Select Grade</option>
          <option value="4.0">A (4.0)</option>
          <option value="3.7">A- (3.7)</option>
          <option value="3.3">B+ (3.3)</option>
          <option value="3.0">B (3.0)</option>
          <option value="2.7">B- (2.7)</option>
          <option value="2.3">C+ (2.3)</option>
          <option value="2.0">C (2.0)</option>
          <option value="1.7">C- (1.7)</option>
          <option value="1.3">D+ (1.3)</option>
          <option value="1.0">D (1.0)</option>
          <option value="0.0">F (0.0)</option>
        </select>
        <input type="number" placeholder="Credit Hours" class="gpa-credit-hours" min="1" max="6" step="1" required>
        <button type="button" class="gpa-remove-course">×</button>
      </div>
    `;
    return newRow;
  }

  createSemesterRow() {
    const newRow = document.createElement('div');
    newRow.className = 'gpa-input-row';
    newRow.innerHTML = `
      <div class="gpa-input-group">
        <input type="text" placeholder="Semester Name (e.g., Fall 2023)" class="gpa-semester-name" required>
        <input type="number" placeholder="GPA" class="gpa-semester-gpa" step="0.01" min="0" max="4" required>
        <input type="number" placeholder="Total Credits" class="gpa-semester-credits" min="1" required>
        <button type="button" class="gpa-remove-semester">×</button>
      </div>
    `;
    return newRow;
  }

  calculateGPA() {
    const courses = document.querySelectorAll('#gpa-tab .gpa-input-row');
    let totalPoints = 0;
    let totalCredits = 0;
    let details = [];
    let hasValidData = false;

    courses.forEach((course, index) => {
      const gradeSelect = course.querySelector('.gpa-grade-select');
      const creditInput = course.querySelector('.gpa-credit-hours');
      const courseNameInput = course.querySelector('.gpa-course-name');

      if (gradeSelect && creditInput && courseNameInput) {
        const grade = parseFloat(gradeSelect.value);
        const credits = parseFloat(creditInput.value);
        const courseName = courseNameInput.value.trim() || `Course ${index + 1}`;

        if (!isNaN(grade) && !isNaN(credits) && credits > 0) {
          const points = grade * credits;
          totalPoints += points;
          totalCredits += credits;
          hasValidData = true;
          details.push(`${courseName}: ${grade} × ${credits} credits = ${points.toFixed(2)} points`);
        }
      }
    });

    if (!hasValidData) {
      this.showError('Please enter valid course data with grades and credit hours.');
      return;
    }

    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    this.displayResults('GPA', gpa, details, totalPoints, totalCredits);
  }

  calculateCGPA() {
    const semesters = document.querySelectorAll('#cgpa-tab .gpa-input-row');
    let totalPoints = 0;
    let totalCredits = 0;
    let details = [];
    let hasValidData = false;

    semesters.forEach((semester, index) => {
      const gpaInput = semester.querySelector('.gpa-semester-gpa');
      const creditsInput = semester.querySelector('.gpa-semester-credits');
      const semesterNameInput = semester.querySelector('.gpa-semester-name');

      if (gpaInput && creditsInput && semesterNameInput) {
        const gpa = parseFloat(gpaInput.value);
        const credits = parseFloat(creditsInput.value);
        const semesterName = semesterNameInput.value.trim() || `Semester ${index + 1}`;

        if (!isNaN(gpa) && !isNaN(credits) && credits > 0 && gpa >= 0 && gpa <= 4) {
          const points = gpa * credits;
          totalPoints += points;
          totalCredits += credits;
          hasValidData = true;
          details.push(`${semesterName}: ${gpa} × ${credits} credits = ${points.toFixed(2)} points`);
        }
      }
    });

    if (!hasValidData) {
      this.showError('Please enter valid semester data with GPA (0-4) and credit hours.');
      return;
    }

    const cgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    this.displayResults('CGPA', cgpa, details, totalPoints, totalCredits);
  }

  displayResults(type, result, details, totalPoints, totalCredits) {
    const resultSection = document.getElementById('gpa-result-section');
    const resultDisplay = document.getElementById('gpa-result-display');
    const calculationDetails = document.getElementById('gpa-calculation-details');

    if (!resultSection || !resultDisplay || !calculationDetails) {
      console.error('Result elements not found');
      return;
    }

    // Display final results
    resultDisplay.innerHTML = `
      <p><strong>Final ${type}:</strong> <span class="gpa-result-value">${result.toFixed(2)}</span></p>
      <p><strong>Total Points:</strong> ${totalPoints.toFixed(2)}</p>
      <p><strong>Total Credits:</strong> ${totalCredits}</p>
      <p><strong>Grade Classification:</strong> ${this.getGradeClassification(result)}</p>
    `;

    // Display calculation breakdown
    if (details.length > 0) {
      calculationDetails.innerHTML = `
        <h4>Calculation Breakdown:</h4>
        ${details.map(detail => `<p>${detail}</p>`).join('')}
      `;
    } else {
      calculationDetails.innerHTML = '<p>No calculation details available.</p>';
    }

    // Show results section
    resultSection.style.display = 'block';
    resultSection.classList.add('show');
    
    // Scroll to results smoothly
    setTimeout(() => {
      resultSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  }

  getGradeClassification(gpa) {
    if (gpa >= 3.7) return 'Excellent (A/A-)';
    if (gpa >= 3.3) return 'Very Good (B+)';
    if (gpa >= 3.0) return 'Good (B)';
    if (gpa >= 2.7) return 'Satisfactory (B-)';
    if (gpa >= 2.3) return 'Average (C+)';
    if (gpa >= 2.0) return 'Below Average (C)';
    if (gpa >= 1.7) return 'Poor (C-)';
    if (gpa >= 1.0) return 'Very Poor (D)';
    return 'Failing (F)';
  }

  showError(message) {
    const resultSection = document.getElementById('gpa-result-section');
    const resultDisplay = document.getElementById('gpa-result-display');
    const calculationDetails = document.getElementById('gpa-calculation-details');

    if (resultDisplay) {
      resultDisplay.innerHTML = `
        <div class="gpa-error-message">
          <p style="color: #dc3545; font-weight: bold;">⚠️ Error: ${message}</p>
        </div>
      `;
    }

    if (calculationDetails) {
      calculationDetails.innerHTML = '';
    }

    if (resultSection) {
      resultSection.style.display = 'block';
      resultSection.classList.add('show');
      resultSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }

  // Utility method to validate GPA input
  validateGPAInput(gpa) {
    return !isNaN(gpa) && gpa >= 0 && gpa <= 4;
  }

  // Utility method to validate credit hours
  validateCreditHours(credits) {
    return !isNaN(credits) && credits > 0 && credits <= 6;
  }

  // Method to clear all inputs
  clearAllInputs() {
    const courseInputs = document.querySelectorAll('#gpa-tab .gpa-input-row');
    const semesterInputs = document.querySelectorAll('#cgpa-tab .gpa-input-row');

    courseInputs.forEach(row => {
      const inputs = row.querySelectorAll('input, select');
      inputs.forEach(input => {
        if (input.type === 'text') input.value = '';
        if (input.type === 'number') input.value = '';
        if (input.tagName === 'SELECT') input.selectedIndex = 0;
      });
    });

    semesterInputs.forEach(row => {
      const inputs = row.querySelectorAll('input');
      inputs.forEach(input => {
        input.value = '';
      });
    });

    // Hide results
    const resultSection = document.getElementById('gpa-result-section');
    if (resultSection) {
      resultSection.style.display = 'none';
      resultSection.classList.remove('show');
    }
  }

  // Method to export results
  exportResults() {
    const resultDisplay = document.getElementById('gpa-result-display');
    const calculationDetails = document.getElementById('gpa-calculation-details');

    if (!resultDisplay || !calculationDetails) return;

    const results = {
      timestamp: new Date().toISOString(),
      results: resultDisplay.textContent,
      details: calculationDetails.textContent
    };

    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `gpa-calculator-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Initialize the GPA Calculator when the script loads
let gpaCalculatorInstance = null;

// Function to initialize GPA Calculator
function initializeGPACalculator() {
  if (!gpaCalculatorInstance) {
    gpaCalculatorInstance = new GPACalculatorLogic();
  }
  return gpaCalculatorInstance;
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeGPACalculator);
} else {
  initializeGPACalculator();
}

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GPACalculatorLogic;
}

// Global access for debugging
window.GPACalculatorLogic = GPACalculatorLogic;
window.initializeGPACalculator = initializeGPACalculator;
