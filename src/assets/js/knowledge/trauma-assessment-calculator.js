// Trauma Assessment Calculator JavaScript
// This file contains the core logic for the trauma assessment functionality

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Assessment questions
const traumaQuestions = [
  // Hyperarousal & Anxiety (0-3)
  {
    question: "I feel constantly on edge or alert for danger.",
    category: "anxiety",
    weight: 1.0
  },
  {
    question: "I am easily startled by unexpected noises or movements.",
    category: "anxiety",
    weight: 1.0
  },
  {
    question: "I have difficulty falling or staying asleep.",
    category: "anxiety",
    weight: 1.0
  },
  {
    question: "I experience sudden feelings of anxiety or panic.",
    category: "anxiety",
    weight: 1.0
  },

  // Intrusive Thoughts & Memories (4-7)
  {
    question: "I have unwanted memories of distressing events that come into my mind suddenly.",
    category: "intrusive",
    weight: 1.0
  },
  {
    question: "I experience flashbacks where I feel like I'm reliving a distressing event.",
    category: "intrusive",
    weight: 1.0
  },
  {
    question: "I have nightmares related to difficult experiences.",
    category: "intrusive",
    weight: 1.0
  },
  {
    question: "Certain triggers (sounds, smells, situations) cause intense emotional or physical reactions.",
    category: "intrusive",
    weight: 1.0
  },

  // Avoidance Behaviors (8-11)
  {
    question: "I avoid people, places, or activities that might remind me of distressing experiences.",
    category: "avoidance",
    weight: 1.0
  },
  {
    question: "I find it difficult to talk about certain past experiences.",
    category: "avoidance",
    weight: 1.0
  },
  {
    question: "I try to push away thoughts or feelings related to difficult experiences.",
    category: "avoidance",
    weight: 1.0
  },
  {
    question: "I feel detached or disconnected from others.",
    category: "avoidance",
    weight: 1.0
  },

  // Negative Mood & Cognition (12-15)
  {
    question: "I have persistent negative beliefs about myself, others, or the world.",
    category: "negative",
    weight: 1.0
  },
  {
    question: "I blame myself for bad things that have happened.",
    category: "negative",
    weight: 1.0
  },
  {
    question: "I experience persistent negative emotions (fear, horror, anger, guilt, or shame).",
    category: "negative",
    weight: 1.0
  },
  {
    question: "I have difficulty experiencing positive emotions like happiness or love.",
    category: "negative",
    weight: 1.0
  },

  // Functional Impairment (16-19)
  {
    question: "My symptoms interfere with my ability to work or study.",
    category: "functional",
    weight: 1.0
  },
  {
    question: "My symptoms affect my relationships with family or friends.",
    category: "functional",
    weight: 1.0
  },
  {
    question: "I have difficulty concentrating or remembering things.",
    category: "functional",
    weight: 1.0
  },
  {
    question: "I engage in risky or self-destructive behavior.",
    category: "functional",
    weight: 1.0
  }
];

// Assessment state
let currentQuestion = 0;
let answers = new Array(traumaQuestions.length).fill(null);
let categoryScores = {
  anxiety: 0,
  intrusive: 0,
  avoidance: 0,
  negative: 0,
  functional: 0
};

// Calculate scores based on answers
function calculateCategoryScores(answers) {
  const scores = {
    anxiety: 0,
    intrusive: 0,
    avoidance: 0,
    negative: 0,
    functional: 0
  };

  answers.forEach((answer, index) => {
    const score = answer || 0;
    const category = traumaQuestions[index].category;
    scores[category] += score;
  });

  return scores;
}

// Get total score
function getTotalScore(categoryScores) {
  return Object.values(categoryScores).reduce((sum, score) => sum + score, 0);
}

// Get severity level
function getSeverityLevel(totalScore, maxScore) {
  const percentage = (totalScore / maxScore) * 100;
  if (percentage >= 75) return { level: "Significant", color: "#dc3545" };
  if (percentage >= 50) return { level: "Moderate", color: "#fd7e14" };
  if (percentage >= 25) return { level: "Mild", color: "#ffc107" };
  return { level: "Minimal", color: "#28a745" };
}

// Generate AI insights using Gemini API
async function generateAIInsights(categoryScores, additionalInfo = '') {
  const prompt = `You are a compassionate trauma-informed mental health educator. Based on the following trauma assessment results, provide thoughtful, supportive insights. Focus on validation, normalization of trauma responses, and gentle suggestions for self-care and healing.

Assessment Results:
- Total Score: ${getTotalScore(categoryScores)} out of 80
- Hyperarousal & Anxiety Score: ${categoryScores.anxiety}/16
- Intrusive Thoughts & Memories Score: ${categoryScores.intrusive}/16
- Avoidance Behaviors Score: ${categoryScores.avoidance}/16
- Negative Mood & Cognition Score: ${categoryScores.negative}/16
- Functional Impairment Score: ${categoryScores.functional}/16

${additionalInfo ? `Additional Information: ${additionalInfo}` : 'No additional information provided.'}

Please provide:
1. A brief, compassionate interpretation of these results
2. Validation of the person's experiences
3. 5-7 specific self-care strategies based on their highest scoring categories
4. A gentle reminder about professional support if needed
5. An encouraging message about healing and resilience

Keep your response under 500 words and use a warm, supportive tone. Format with clear sections: "Understanding Your Results", "Personalized Self-Care Strategies", and "Moving Forward".`;

  const promptData = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(promptData)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error:', errorData);
      throw new Error(`Failed to generate insights: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    return {
      interpretation: aiResponse,
      selfCareStrategies: []
    };
  } catch (error) {
    console.error('Error generating AI insights:', error);
    throw error;
  }
}

// Format AI response with simple markdown-like formatting
function formatAIResponse(text) {
  // Replace line breaks with paragraphs
  let formatted = text.replace(/\n\n/g, '</p><p>');
  
  // Format section headers
  formatted = formatted.replace(/^(Understanding Your Results|Personalized Self-Care Strategies|Moving Forward):/gm, '<h4>$1</h4>');
  
  // Format numbered lists
  formatted = formatted.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
  
  // Format bullet points
  formatted = formatted.replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>');
  
  // Wrap lists in ul tags
  formatted = formatted.replace(/(<li>.+<\/li>)\n(<li>.+<\/li>)/gs, '<ul>$1$2</ul>');
  
  // Format bold text
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Wrap in paragraph tags if not already
  if (!formatted.startsWith('<p>') && !formatted.startsWith('<h4>') && !formatted.startsWith('<ul>')) {
    formatted = '<p>' + formatted + '</p>';
  }
  
  return formatted;
}

// Load PDF libraries
function loadPDFLibraries() {
  return new Promise((resolve, reject) => {
    if (window.jsPDF) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => {
      window.jsPDF = window.jspdf.jsPDF;
      resolve();
    };
    script.onerror = () => {
      console.error('Error loading PDF library');
      reject(new Error('Failed to load PDF library'));
    };
    document.head.appendChild(script);
  });
}

// Generate PDF content
function generatePDFContent(doc, startY, assessmentResults) {
  const wrapText = (text, maxWidth, x, y, doc) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * 5);
  };

  // Add scores
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('Assessment Scores', 20, startY);
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  let yPos = startY + 15;
  
  const totalScore = assessmentResults.totalScore;
  const maxScore = assessmentResults.maxScore;
  const percentage = (totalScore / maxScore) * 100;
  
  doc.text(`Total Score: ${totalScore}/${maxScore}`, 20, yPos);
  yPos += 10;
  
  let severityLevel = "Minimal";
  if (percentage >= 75) severityLevel = "Significant";
  else if (percentage >= 50) severityLevel = "Moderate";
  else if (percentage >= 25) severityLevel = "Mild";
  
  doc.text(`Severity Level: ${severityLevel}`, 20, yPos);
  yPos += 15;
  
  // Add category scores
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Category Scores:', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text(`• Hyperarousal & Anxiety: ${assessmentResults.categoryScores.anxiety}/16`, 25, yPos);
  yPos += 8;
  doc.text(`• Intrusive Thoughts & Memories: ${assessmentResults.categoryScores.intrusive}/16`, 25, yPos);
  yPos += 8;
  doc.text(`• Avoidance Behaviors: ${assessmentResults.categoryScores.avoidance}/16`, 25, yPos);
  yPos += 8;
  doc.text(`• Negative Mood & Cognition: ${assessmentResults.categoryScores.negative}/16`, 25, yPos);
  yPos += 8;
  doc.text(`• Functional Impairment: ${assessmentResults.categoryScores.functional}/16`, 25, yPos);
  yPos += 15;
  
  // Add interpretation
  if (assessmentResults.recommendations.interpretation) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('AI Analysis & Recommendations', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    yPos = wrapText(assessmentResults.recommendations.interpretation, 170, 20, yPos, doc);
    yPos += 10;
  }
  
  // Add disclaimer
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const disclaimer = 'IMPORTANT: This assessment is not a diagnostic tool. It is designed to raise awareness about potential trauma impacts. For proper diagnosis and treatment, please consult with a qualified mental health professional.';
  const splitDisclaimer = doc.splitTextToSize(disclaimer, 170);
  doc.text(splitDisclaimer, 20, 280);
}

// Generate PDF
function generatePDF(assessmentResults) {
  const doc = new window.jsPDF();
  
  const logoImg = new Image();
  logoImg.src = '/images/logo.png';
  
  logoImg.onload = function() {
    const imgWidth = 40;
    const imgHeight = (logoImg.height * imgWidth) / logoImg.width;
    doc.addImage(logoImg, 'PNG', (doc.internal.pageSize.width - imgWidth) / 2, 10, imgWidth, imgHeight);
    
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Trauma Assessment Results', 105, imgHeight + 25, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, imgHeight + 40, { align: 'center' });
    
    generatePDFContent(doc, imgHeight + 50, assessmentResults);
    doc.save('trauma-assessment-results.pdf');
  };
  
  logoImg.onerror = function() {
    console.error('Error loading logo image');
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Trauma Assessment Results', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 35, { align: 'center' });
    
    generatePDFContent(doc, 50, assessmentResults);
    doc.save('trauma-assessment-results.pdf');
  };
}

// Export functions for use in React component
window.traumaAssessmentUtils = {
  traumaQuestions,
  calculateCategoryScores,
  getTotalScore,
  getSeverityLevel,
  generateAIInsights,
  formatAIResponse,
  loadPDFLibraries,
  generatePDF
};
