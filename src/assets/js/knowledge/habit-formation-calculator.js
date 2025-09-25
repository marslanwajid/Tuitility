// Habit Formation Calculator Logic
class HabitFormationCalculatorLogic {
  constructor() {
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
    } else {
      this.setupEventListeners();
    }
  }

  setupEventListeners() {
    // Get elements with habit-specific IDs
    const habitForm = document.getElementById("habit-formation-form");
    const resultSection = document.getElementById("habit-result-section");
    const daysResult = document.getElementById("habit-days-result");
    const rangeResult = document.getElementById("habit-range-result");
    const tipsSection = document.getElementById("habit-tips-section");

    // Debug log to check if elements are found
    console.log("Habit Formation Calculator Elements:", {
      habitForm,
      resultSection,
      daysResult,
      rangeResult,
      tipsSection,
    });

    if (!habitForm) {
      console.warn("Habit Formation Calculator: Form element not found");
      return;
    }

    // Store references
    this.elements = {
      habitForm,
      resultSection,
      daysResult,
      rangeResult,
      tipsSection
    };

    // Event listeners
    habitForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.calculateHabitFormation();
    });
    
    habitForm.addEventListener('reset', () => {
      this.resetCalculator();
    });
  }

  calculateHabitFormation() {
    console.log("Habit Formation Calculator: Calculating habit formation...");
    
    if (!this.elements) return;

    // Get form values
    const habitType = document.getElementById("habit-type")?.value;
    const dailyTime = parseInt(document.getElementById("habit-daily-time")?.value);
    const motivationLevel = document.querySelector('input[name="motivation"]:checked')?.value;
    const previousAttempt = document.querySelector('input[name="previous-attempt"]:checked')?.value;
    const complexity = document.querySelector('input[name="complexity"]:checked')?.value;

    // Validate inputs
    if (!habitType || !dailyTime || !motivationLevel || !previousAttempt || !complexity) {
      console.warn("Habit Formation Calculator: Missing form data");
      return;
    }

    // Base days (research suggests average is around 66 days)
    let baseDays = 66;
    
    // Adjust based on motivation level
    let motivationFactor = 1;
    if (motivationLevel === 'high') {
      motivationFactor = 0.8; // Reduces time by 20%
    } else if (motivationLevel === 'low') {
      motivationFactor = 1.3; // Increases time by 30%
    }
    
    // Adjust based on previous attempts
    let previousFactor = 1;
    if (previousAttempt === 'yes') {
      previousFactor = 0.9; // Reduces time by 10% if tried before
    }
    
    // Adjust based on daily time commitment
    let timeFactor = 1;
    if (dailyTime < 5) {
      timeFactor = 1.2; // Very short habits take longer to form
    } else if (dailyTime > 30) {
      timeFactor = 0.9; // Longer daily practice can form habits faster
    }
    
    // Adjust based on complexity
    let complexityFactor = 1;
    if (complexity === 'simple') {
      complexityFactor = 0.8;
    } else if (complexity === 'complex') {
      complexityFactor = 1.4;
    }
    
    // Calculate estimated days
    const estimatedDays = Math.round(baseDays * motivationFactor * previousFactor * timeFactor * complexityFactor);
    
    // Calculate range (±15%)
    const minDays = Math.round(estimatedDays * 0.85);
    const maxDays = Math.round(estimatedDays * 1.15);
    
    // Calculate success probability
    const successProbability = this.calculateSuccessProbability(motivationLevel, complexity, previousAttempt);
    
    // Calculate target date
    const targetDate = this.calculateTargetDate(estimatedDays);
    
    // Display results with animation
    this.animateResults(estimatedDays, minDays, maxDays, habitType, successProbability, targetDate);
    
    // Generate personalized tips with collapsible section
    this.generateTips(motivationLevel, complexity, dailyTime, estimatedDays);
    
    // Show result section
    if (this.elements.resultSection) {
      this.elements.resultSection.style.display = 'flex';
      
      // Scroll to results
      this.elements.resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  calculateSuccessProbability(motivation, complexity, previousAttempt) {
    let probability = 70; // Base probability
    
    // Adjust based on motivation
    if (motivation === 'high') {
      probability += 15;
    } else if (motivation === 'low') {
      probability -= 15;
    }
    
    // Adjust based on complexity
    if (complexity === 'simple') {
      probability += 10;
    } else if (complexity === 'complex') {
      probability -= 10;
    }
    
    // Adjust based on previous attempts
    if (previousAttempt === 'yes') {
      probability += 5;
    }
    
    // Ensure probability is between 0-100
    return Math.min(Math.max(probability, 0), 100);
  }

  calculateTargetDate(days) {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + days);
    
    return targetDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  animateResults(estimatedDays, minDays, maxDays, habitType, successProbability, targetDate) {
    if (!this.elements) return;

    // Clear previous results
    if (this.elements.daysResult) {
      this.elements.daysResult.innerHTML = '';
    }
    if (this.elements.rangeResult) {
      this.elements.rangeResult.innerHTML = '';
    }
    
    // Create main result with counter animation
    let count = 0;
    const duration = 1500; // Animation duration in ms
    const interval = Math.min(50, duration / estimatedDays);
    
    const counter = setInterval(() => {
      count = Math.min(count + Math.ceil(estimatedDays / (duration / interval)), estimatedDays);
      
      if (this.elements.daysResult) {
        this.elements.daysResult.innerHTML = `<strong style="color:#ffffff; font-size: 1.4rem;">${count} days</strong> to form your <strong style="color:#ffffff">${habitType}</strong> habit`;
      }
      
      if (count >= estimatedDays) {
        clearInterval(counter);
        
        // Add additional information after counter completes
        setTimeout(() => {
          if (this.elements.rangeResult) {
            this.elements.rangeResult.innerHTML = `
              <div style="color: #ffffff; margin-bottom: 0.8rem;">Estimated range: <strong>${minDays} to ${maxDays} days</strong></div>
              <div style="color: #ffffff; margin-bottom: 0.8rem;">Target completion date: <strong>${targetDate}</strong></div>
              <div style="color: #ffffff; margin-bottom: 0.5rem;">Success probability:</div>
              <div class="habit-progress-bar">
                <div class="habit-progress-fill" style="width:0%; transition: width 1.5s ease-out;"></div>
                <div class="habit-progress-text">${successProbability}%</div>
              </div>
            `;
            
            // Animate progress bar
            setTimeout(() => {
              const progressFill = document.querySelector('.habit-progress-fill');
              if (progressFill) {
                progressFill.style.width = `${successProbability}%`;
              }
            }, 100);
          }
        }, 300);
      }
    }, interval);
  }

  generateTips(motivation, complexity, dailyTime, days) {
    if (!this.elements || !this.elements.tipsSection) return;

    let tips = `
      <div class="habit-tips-header">
        <h4 style="color:white; margin: 0;">Personalized Tips <span class="habit-toggle-tips">[Show]</span></h4>
      </div>
      <div class="habit-tips-content" style="display: none;">
        <ul>`;
    
    // Motivation-based tips
    if (motivation === 'low') {
      tips += '<li>Start with a very small version of your habit to build momentum.</li>';
      tips += '<li>Set up visual reminders in your environment to prompt your habit.</li>';
      tips += '<li>Find an accountability partner to keep you on track.</li>';
    } else if (motivation === 'medium') {
      tips += '<li>Track your progress daily to maintain motivation.</li>';
      tips += '<li>Reward yourself after completing your habit consistently for a week.</li>';
    } else {
      tips += '<li>Challenge yourself by gradually increasing the difficulty of your habit.</li>';
      tips += '<li>Consider teaching or sharing your habit journey with others to stay committed.</li>';
    }
    
    // Complexity-based tips
    if (complexity === 'complex') {
      tips += '<li>Break down your habit into smaller sub-habits to make it more manageable.</li>';
      tips += '<li>Focus on mastering one aspect at a time before adding complexity.</li>';
    }
    
    // Time-based tips
    if (dailyTime > 30) {
      tips += '<li>Consider splitting your practice into multiple shorter sessions throughout the day.</li>';
    }
    
    // General tips
    tips += '<li>The "21-day habit myth" is not scientifically accurate. Research shows most habits take between 18-254 days to form, with 66 days being the average.</li>';
    tips += `<li>Stay consistent! Missing a day occasionally won't derail your progress, but try not to miss two days in a row during these ${days} days.</li>`;
    tips += '<li>Stack your new habit onto an existing habit to make it easier to remember.</li>';
    
    // Add calendar integration tip
    tips += '<li>Add a reminder to your calendar for daily practice and a milestone check-in every 7 days.</li>';
    
    tips += '</ul>';
    
    // Add download/share section
    tips += `
      <div class="habit-action-buttons">
        <button id="habit-download-plan" class="habit-action-button">Download Plan</button>
        <button id="habit-share-results" class="habit-action-button">Share Results</button>
      </div>
    </div>`;
    
    this.elements.tipsSection.innerHTML = tips;
    
    // Add toggle functionality for tips
    const tipsHeader = document.querySelector('.habit-tips-header');
    const tipsContent = document.querySelector('.habit-tips-content');
    const toggleTips = document.querySelector('.habit-toggle-tips');
    
    if (tipsHeader && tipsContent && toggleTips) {
      tipsHeader.addEventListener('click', () => {
        if (tipsContent.style.display === 'none') {
          tipsContent.style.display = 'block';
          toggleTips.textContent = '[Hide]';
        } else {
          tipsContent.style.display = 'none';
          toggleTips.textContent = '[Show]';
        }
      });
    }
    
    // Add download functionality
    const downloadButton = document.getElementById('habit-download-plan');
    if (downloadButton) {
      downloadButton.addEventListener('click', () => {
        this.generatePDF(days);
      });
    }
    
    // Add share functionality
    const shareButton = document.getElementById('habit-share-results');
    if (shareButton) {
      shareButton.addEventListener('click', () => {
        this.shareResults();
      });
    }
  }

  generatePDF(days) {
    const habitType = document.getElementById('habit-type')?.value;
    const dailyTime = document.getElementById('habit-daily-time')?.value;
    
    if (!habitType || !dailyTime) {
      alert('Please complete the form before downloading the plan.');
      return;
    }
    
    // Check if jsPDF is available
    if (typeof jspdf !== 'undefined') {
      const { jsPDF } = jspdf;
      const doc = new jsPDF();
      
      // Add content to PDF
      doc.setFontSize(20);
      doc.text('Your Habit Formation Plan', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Habit: ${habitType}`, 20, 40);
      doc.text(`Daily time commitment: ${dailyTime} minutes`, 20, 50);
      doc.text(`Estimated formation period: ${days} days`, 20, 60);
      
      // Add calendar section
      doc.text('Weekly Progress Tracker:', 20, 80);
      
      // Add day initials above the first week with more space (margin-bottom)
      doc.setFontSize(10);
      doc.text('S', 53, 85);
      doc.text('M', 73, 85);
      doc.text('T', 93, 85);
      doc.text('W', 113, 85);
      doc.text('T', 133, 85);
      doc.text('F', 153, 85);
      doc.text('S', 173, 85);
      
      // Increased the starting y position to add more space between day initials and boxes
      let y = 95; // Changed from 90 to 95 to add 5 units of margin
      for (let week = 1; week <= Math.ceil(days/7); week++) {
        doc.text(`Week ${week}:`, 20, y);
        for (let day = 1; day <= 7; day++) {
          doc.rect(50 + (day-1)*20, y-5, 15, 10);
        }
        y += 15;
      }
      
      // Add tips section
      doc.text('Tips for Success:', 20, y + 10);
      doc.text('1. Be consistent - try not to miss two days in a row', 25, y + 20);
      doc.text('2. Track your progress daily', 25, y + 30);
      doc.text('3. Celebrate small wins along the way', 25, y + 40);
      
      // Save the PDF
      doc.save(`${habitType.replace(/\s+/g, '-').toLowerCase()}-habit-plan.pdf`);
    } else {
      alert('PDF generation is not available. Please try again later.');
    }
  }

  shareResults() {
    const habitType = document.getElementById('habit-type')?.value;
    const daysResult = document.getElementById('habit-days-result');
    
    if (!habitType || !daysResult) {
      alert('Please complete the calculation before sharing results.');
      return;
    }
    
    const estimatedDays = daysResult.innerText.split(' ')[0];
    
    const shareText = `I'm forming a new habit: ${habitType}. It will take me about ${estimatedDays} days according to the Habit Formation Calculator!`;
    
    // Check if Web Share API is supported
    if (navigator.share) {
      navigator.share({
        title: 'My Habit Formation Plan',
        text: shareText,
        url: window.location.href
      })
      .catch(error => {
        console.log('Error sharing:', error);
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
    
    // Notify the user
    alert('Results copied to clipboard! You can now paste and share it.');
  }

  resetCalculator() {
    console.log("Habit Formation Calculator: Resetting calculator...");
    
    if (!this.elements) return;

    // Hide result section
    if (this.elements.resultSection) {
      this.elements.resultSection.style.display = 'none';
    }
    
    // Clear tips section
    if (this.elements.tipsSection) {
      this.elements.tipsSection.innerHTML = '';
    }
    
    // Clear any result displays
    if (this.elements.daysResult) {
      this.elements.daysResult.innerHTML = '';
    }
    if (this.elements.rangeResult) {
      this.elements.rangeResult.innerHTML = '';
    }
  }
}

// Initialize the Habit Formation Calculator when the script loads
document.addEventListener("DOMContentLoaded", () => {
  // Only initialize if we're on the habit formation calculator page
  if (document.getElementById("habit-formation-form")) {
    window.habitFormationCalculator = new HabitFormationCalculatorLogic();
  }
});

