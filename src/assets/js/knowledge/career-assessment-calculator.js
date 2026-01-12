// Career Assessment Calculator JavaScript
// This file contains the core logic for the career assessment functionality

// Career Assessment Questions
const careerQuestions = [
    // Technical Skills & Problem Solving (10 questions)
    {
        question: "I enjoy solving complex technical problems and puzzles.",
        category: "technical",
        weight: 1.2
    },
    {
        question: "I prefer working with computers and technology over people.",
        category: "technical",
        weight: 1.0
    },
    {
        question: "I like to understand how things work and take them apart to see the mechanisms.",
        category: "technical",
        weight: 1.1
    },
    {
        question: "I enjoy programming or working with software applications.",
        category: "technical",
        weight: 1.3
    },
    {
        question: "I prefer jobs that require analytical thinking and logical reasoning.",
        category: "technical",
        weight: 1.2
    },
    {
        question: "I enjoy working with data and statistics.",
        category: "technical",
        weight: 1.1
    },
    {
        question: "I like to build or create things with my hands.",
        category: "technical",
        weight: 0.9
    },
    {
        question: "I prefer structured, systematic approaches to problem-solving.",
        category: "technical",
        weight: 1.0
    },
    {
        question: "I enjoy learning new technical skills and staying updated with technology.",
        category: "technical",
        weight: 1.1
    },
    {
        question: "I prefer jobs that require precision and attention to detail.",
        category: "technical",
        weight: 1.0
    },

    // Creative & Artistic (10 questions)
    {
        question: "I enjoy expressing myself through art, music, or creative writing.",
        category: "creative",
        weight: 1.3
    },
    {
        question: "I prefer jobs that allow me to be creative and innovative.",
        category: "creative",
        weight: 1.2
    },
    {
        question: "I enjoy thinking outside the box and coming up with unique solutions.",
        category: "creative",
        weight: 1.1
    },
    {
        question: "I like to work on projects that involve design and aesthetics.",
        category: "creative",
        weight: 1.2
    },
    {
        question: "I prefer flexible work environments that allow for creative expression.",
        category: "creative",
        weight: 1.0
    },
    {
        question: "I enjoy storytelling and communicating ideas in engaging ways.",
        category: "creative",
        weight: 1.1
    },
    {
        question: "I like to experiment with different approaches and methods.",
        category: "creative",
        weight: 1.0
    },
    {
        question: "I prefer jobs that involve visual or multimedia content creation.",
        category: "creative",
        weight: 1.2
    },
    {
        question: "I enjoy brainstorming sessions and collaborative creative work.",
        category: "creative",
        weight: 1.0
    },
    {
        question: "I like to work on projects that have artistic or cultural significance.",
        category: "creative",
        weight: 1.1
    },

    // Leadership & Management (10 questions)
    {
        question: "I enjoy taking charge and leading teams or projects.",
        category: "leadership",
        weight: 1.3
    },
    {
        question: "I prefer jobs that involve managing people and resources.",
        category: "leadership",
        weight: 1.2
    },
    {
        question: "I enjoy making important decisions that affect others.",
        category: "leadership",
        weight: 1.1
    },
    {
        question: "I like to motivate and inspire others to achieve their goals.",
        category: "leadership",
        weight: 1.2
    },
    {
        question: "I prefer positions of authority and responsibility.",
        category: "leadership",
        weight: 1.1
    },
    {
        question: "I enjoy strategic planning and long-term thinking.",
        category: "leadership",
        weight: 1.0
    },
    {
        question: "I like to coordinate and organize complex projects.",
        category: "leadership",
        weight: 1.1
    },
    {
        question: "I prefer jobs that involve public speaking or presentations.",
        category: "leadership",
        weight: 1.0
    },
    {
        question: "I enjoy mentoring and developing others' skills.",
        category: "leadership",
        weight: 1.1
    },
    {
        question: "I like to be recognized as an expert or authority in my field.",
        category: "leadership",
        weight: 1.0
    },

    // Interpersonal & Communication (10 questions)
    {
        question: "I enjoy working directly with people and helping them.",
        category: "interpersonal",
        weight: 1.3
    },
    {
        question: "I prefer jobs that involve customer service or client interaction.",
        category: "interpersonal",
        weight: 1.2
    },
    {
        question: "I enjoy teaching or training others.",
        category: "interpersonal",
        weight: 1.1
    },
    {
        question: "I like to work in teams and collaborate with others.",
        category: "interpersonal",
        weight: 1.1
    },
    {
        question: "I prefer jobs that involve counseling or advising people.",
        category: "interpersonal",
        weight: 1.2
    },
    {
        question: "I enjoy networking and building professional relationships.",
        category: "interpersonal",
        weight: 1.0
    },
    {
        question: "I like to mediate conflicts and help people resolve issues.",
        category: "interpersonal",
        weight: 1.1
    },
    {
        question: "I prefer jobs that involve sales or persuasion.",
        category: "interpersonal",
        weight: 1.0
    },
    {
        question: "I enjoy working with diverse groups of people.",
        category: "interpersonal",
        weight: 1.0
    },
    {
        question: "I like to provide emotional support and care to others.",
        category: "interpersonal",
        weight: 1.2
    },

    // Work Environment & Values (10 questions)
    {
        question: "I prefer stable, predictable work environments.",
        category: "environment",
        weight: 1.0
    },
    {
        question: "I enjoy working in fast-paced, dynamic environments.",
        category: "environment",
        weight: 1.0
    },
    {
        question: "I prefer jobs that offer high earning potential.",
        category: "values",
        weight: 1.0
    },
    {
        question: "I value work-life balance over high salaries.",
        category: "values",
        weight: 1.0
    },
    {
        question: "I prefer jobs that allow me to work independently.",
        category: "environment",
        weight: 1.0
    },
    {
        question: "I enjoy jobs that involve travel and new experiences.",
        category: "environment",
        weight: 1.0
    },
    {
        question: "I prefer jobs that contribute to society or help others.",
        category: "values",
        weight: 1.0
    },
    {
        question: "I value job security and benefits over other factors.",
        category: "values",
        weight: 1.0
    },
    {
        question: "I prefer jobs that offer opportunities for advancement.",
        category: "values",
        weight: 1.0
    },
    {
        question: "I enjoy jobs that involve research and continuous learning.",
        category: "values",
        weight: 1.0
    }
];

// Career Categories and their associated careers
const careerCategories = {
    technical: [
        "Software Engineer",
        "Data Scientist",
        "Cybersecurity Analyst",
        "Systems Administrator",
        "Network Engineer",
        "Database Administrator",
        "DevOps Engineer",
        "Quality Assurance Engineer",
        "Technical Support Specialist",
        "IT Project Manager"
    ],
    creative: [
        "Graphic Designer",
        "Content Writer",
        "Digital Marketing Specialist",
        "UI/UX Designer",
        "Video Editor",
        "Photographer",
        "Web Developer",
        "Social Media Manager",
        "Brand Manager",
        "Creative Director"
    ],
    leadership: [
        "Business Manager",
        "Project Manager",
        "Operations Manager",
        "Human Resources Manager",
        "Sales Manager",
        "Marketing Manager",
        "Product Manager",
        "Executive Director",
        "Consultant",
        "Entrepreneur"
    ],
    interpersonal: [
        "Teacher",
        "Nurse",
        "Counselor",
        "Sales Representative",
        "Customer Service Manager",
        "Human Resources Specialist",
        "Recruiter",
        "Social Worker",
        "Healthcare Administrator",
        "Training Coordinator"
    ],
    healthcare: [
        "Doctor",
        "Nurse Practitioner",
        "Physician Assistant",
        "Physical Therapist",
        "Occupational Therapist",
        "Pharmacist",
        "Medical Laboratory Technician",
        "Radiologic Technologist",
        "Respiratory Therapist",
        "Medical Assistant"
    ],
    finance: [
        "Financial Analyst",
        "Accountant",
        "Financial Advisor",
        "Investment Banker",
        "Actuary",
        "Credit Analyst",
        "Budget Analyst",
        "Tax Specialist",
        "Risk Manager",
        "Treasury Analyst"
    ],
    education: [
        "Teacher",
        "Professor",
        "Educational Administrator",
        "Curriculum Developer",
        "Special Education Teacher",
        "School Counselor",
        "Librarian",
        "Corporate Trainer",
        "Instructional Designer",
        "Education Consultant"
    ],
    science: [
        "Research Scientist",
        "Laboratory Technician",
        "Biologist",
        "Chemist",
        "Physicist",
        "Environmental Scientist",
        "Geologist",
        "Meteorologist",
        "Astronomer",
        "Forensic Scientist"
    ]
};

// API Configuration
const GEMINI_API_KEY = process.env.GEMINI_API;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Global variables
let currentQuestionIndex = 0;
let userAnswers = [];
let assessmentResults = {};

// Calculate category scores
function calculateCategoryScores(answers) {
    const scores = {
        technical: 0,
        creative: 0,
        leadership: 0,
        interpersonal: 0
    };
    
    const categoryCounts = {
        technical: 0,
        creative: 0,
        leadership: 0,
        interpersonal: 0
    };
    
    const categoryTotals = {
        technical: 0,
        creative: 0,
        leadership: 0,
        interpersonal: 0
    };
    
    answers.forEach(answer => {
        if (scores.hasOwnProperty(answer.category)) {
            scores[answer.category] += answer.answer * answer.weight;
            categoryCounts[answer.category]++;
            categoryTotals[answer.category] += 5 * answer.weight; // Max possible score for this question
        }
    });
    
    // Calculate percentages (0-100)
    Object.keys(scores).forEach(category => {
        if (categoryCounts[category] > 0) {
            // Calculate percentage based on actual score vs max possible score
            const maxPossible = categoryTotals[category];
            const actualScore = scores[category];
            scores[category] = Math.round((actualScore / maxPossible) * 100);
            
            // Ensure score is within 0-100 range
            scores[category] = Math.max(0, Math.min(100, scores[category]));
        }
    });
    
    return scores;
}

// Get AI recommendations using Gemini API
async function getAIRecommendations(categoryScores) {
    try {
        const prompt = `Based on the following career assessment scores, provide 4-5 specific career recommendations with detailed explanations:

Technical Skills: ${categoryScores.technical}/100
Creative Thinking: ${categoryScores.creative}/100
Leadership Potential: ${categoryScores.leadership}/100
Interpersonal Skills: ${categoryScores.interpersonal}/100

Please provide:
1. 4-5 specific career recommendations
2. Brief explanation of why each career suits this profile
3. Key skills needed for each career
4. Potential salary ranges
5. Growth opportunities

Format the response as JSON with the following structure:
{
  "careers": [
    {
      "title": "Career Title",
      "match_score": "85%",
      "explanation": "Why this career fits",
      "required_skills": ["skill1", "skill2"],
      "salary_range": "$50,000 - $80,000",
      "growth_potential": "High"
    }
  ],
  "summary": "Overall career path recommendation"
}

IMPORTANT: Return ONLY valid JSON, no additional text or formatting.`;

        const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;
        
        // Clean the response - remove any markdown formatting
        let cleanResponse = aiResponse.trim();
        
        // Remove markdown code blocks if present
        if (cleanResponse.startsWith('```json')) {
            cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanResponse.startsWith('```')) {
            cleanResponse = cleanResponse.replace(/```\s*/, '').replace(/\s*```$/, '');
        }
        
        // Try to parse JSON response
        try {
            const parsedResponse = JSON.parse(cleanResponse);
            
            // Validate the response structure
            if (parsedResponse.careers && Array.isArray(parsedResponse.careers)) {
                return parsedResponse;
            } else {
                throw new Error('Invalid response structure');
            }
        } catch (parseError) {
            console.error('JSON parsing failed:', parseError);
            console.log('Raw AI response:', aiResponse);
            console.log('Cleaned response:', cleanResponse);
            
            // If JSON parsing fails, return basic recommendations
            return getBasicRecommendations(categoryScores);
        }
        
    } catch (error) {
        console.error('AI API Error:', error);
        return getBasicRecommendations(categoryScores);
    }
}

// Get basic recommendations (fallback)
function getBasicRecommendations(categoryScores) {
    const recommendations = [];
    
    // Find top scoring categories
    const sortedCategories = Object.entries(categoryScores)
        .sort(([,a], [,b]) => b - a);
    
    // Get top 2 categories
    const topCategories = sortedCategories.slice(0, 2);
    
    topCategories.forEach(([category, score]) => {
        const careers = careerCategories[category] || [];
        const topCareers = careers.slice(0, 2);
        
        topCareers.forEach(career => {
            recommendations.push({
                title: career,
                match_score: `${Math.min(95, score + Math.random() * 10).toFixed(0)}%`,
                explanation: `This career aligns with your strong ${category} skills (${score}/100).`,
                required_skills: getSkillsForCareer(career),
                salary_range: getSalaryRange(career),
                growth_potential: "Good"
            });
        });
    });
    
    return {
        careers: recommendations,
        summary: "Career recommendations based on your assessment scores."
    };
}

// Helper functions
function getSkillsForCareer(career) {
    const skillMap = {
        "Software Engineer": ["Programming", "Problem Solving", "Analytical Thinking"],
        "Data Scientist": ["Statistics", "Programming", "Data Analysis"],
        "Graphic Designer": ["Creativity", "Design Software", "Visual Communication"],
        "Teacher": ["Communication", "Patience", "Subject Knowledge"],
        "Business Manager": ["Leadership", "Communication", "Strategic Thinking"],
        "Nurse": ["Patient Care", "Medical Knowledge", "Compassion"],
        "Sales Representative": ["Communication", "Persuasion", "Relationship Building"],
        "Project Manager": ["Leadership", "Organization", "Communication"],
        "Cybersecurity Analyst": ["Security Knowledge", "Analytical Thinking", "Attention to Detail"],
        "Systems Administrator": ["Technical Skills", "Problem Solving", "System Management"],
        "Network Engineer": ["Networking", "Technical Skills", "Troubleshooting"],
        "Database Administrator": ["Database Management", "SQL", "Data Security"],
        "DevOps Engineer": ["Automation", "Cloud Computing", "System Integration"],
        "Quality Assurance Engineer": ["Testing", "Attention to Detail", "Analytical Thinking"],
        "Technical Support Specialist": ["Customer Service", "Technical Knowledge", "Problem Solving"],
        "IT Project Manager": ["Project Management", "Technical Knowledge", "Leadership"],
        "Content Writer": ["Writing", "Research", "Creativity"],
        "Digital Marketing Specialist": ["Marketing", "Analytics", "Creativity"],
        "UI/UX Designer": ["Design", "User Research", "Creativity"],
        "Video Editor": ["Video Editing", "Creativity", "Technical Skills"],
        "Photographer": ["Photography", "Creativity", "Visual Communication"],
        "Web Developer": ["Programming", "Design", "Problem Solving"],
        "Social Media Manager": ["Social Media", "Content Creation", "Analytics"],
        "Brand Manager": ["Marketing", "Strategy", "Communication"],
        "Creative Director": ["Leadership", "Creativity", "Vision"],
        "Operations Manager": ["Operations", "Leadership", "Process Improvement"],
        "Human Resources Manager": ["HR Knowledge", "Leadership", "Communication"],
        "Sales Manager": ["Sales", "Leadership", "Communication"],
        "Marketing Manager": ["Marketing", "Strategy", "Leadership"],
        "Product Manager": ["Product Strategy", "Leadership", "Analytical Thinking"],
        "Executive Director": ["Leadership", "Strategy", "Vision"],
        "Consultant": ["Expertise", "Communication", "Problem Solving"],
        "Entrepreneur": ["Innovation", "Leadership", "Risk Taking"],
        "Counselor": ["Empathy", "Communication", "Psychology"],
        "Customer Service Manager": ["Customer Service", "Leadership", "Communication"],
        "Human Resources Specialist": ["HR Knowledge", "Communication", "Analytical Thinking"],
        "Recruiter": ["Communication", "Networking", "Assessment"],
        "Social Worker": ["Empathy", "Communication", "Problem Solving"],
        "Healthcare Administrator": ["Healthcare", "Management", "Communication"],
        "Training Coordinator": ["Training", "Communication", "Organization"]
    };
    
    return skillMap[career] || ["Communication", "Problem Solving", "Adaptability"];
}

function getSalaryRange(career) {
    const salaryMap = {
        "Software Engineer": "$70,000 - $120,000",
        "Data Scientist": "$80,000 - $130,000",
        "Graphic Designer": "$40,000 - $80,000",
        "Teacher": "$40,000 - $70,000",
        "Business Manager": "$60,000 - $100,000",
        "Nurse": "$50,000 - $90,000",
        "Sales Representative": "$40,000 - $80,000",
        "Project Manager": "$70,000 - $110,000",
        "Cybersecurity Analyst": "$75,000 - $125,000",
        "Systems Administrator": "$55,000 - $95,000",
        "Network Engineer": "$60,000 - $100,000",
        "Database Administrator": "$65,000 - $105,000",
        "DevOps Engineer": "$80,000 - $130,000",
        "Quality Assurance Engineer": "$55,000 - $90,000",
        "Technical Support Specialist": "$40,000 - $70,000",
        "IT Project Manager": "$75,000 - $115,000",
        "Content Writer": "$35,000 - $70,000",
        "Digital Marketing Specialist": "$45,000 - $85,000",
        "UI/UX Designer": "$50,000 - $95,000",
        "Video Editor": "$40,000 - $80,000",
        "Photographer": "$35,000 - $75,000",
        "Web Developer": "$50,000 - $100,000",
        "Social Media Manager": "$40,000 - $75,000",
        "Brand Manager": "$60,000 - $100,000",
        "Creative Director": "$70,000 - $120,000",
        "Operations Manager": "$65,000 - $105,000",
        "Human Resources Manager": "$60,000 - $100,000",
        "Sales Manager": "$70,000 - $120,000",
        "Marketing Manager": "$65,000 - $110,000",
        "Product Manager": "$80,000 - $130,000",
        "Executive Director": "$90,000 - $150,000",
        "Consultant": "$70,000 - $120,000",
        "Entrepreneur": "Variable - $0 to $500,000+",
        "Counselor": "$40,000 - $70,000",
        "Customer Service Manager": "$50,000 - $85,000",
        "Human Resources Specialist": "$45,000 - $80,000",
        "Recruiter": "$40,000 - $75,000",
        "Social Worker": "$40,000 - $65,000",
        "Healthcare Administrator": "$60,000 - $100,000",
        "Training Coordinator": "$45,000 - $75,000"
    };
    
    return salaryMap[career] || "$40,000 - $80,000";
}

// Generate text report as fallback
function generateTextReport(assessmentResults) {
    if (!assessmentResults) return 'No results available.';
    
    let report = 'CAREER ASSESSMENT REPORT\n';
    report += '========================\n\n';
    report += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
    
    // Skill scores
    report += 'SKILL ASSESSMENT RESULTS\n';
    report += '------------------------\n';
    Object.entries(assessmentResults.categoryScores).forEach(([category, score]) => {
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
        report += `${categoryName}: ${score}/100\n`;
    });
    
    report += '\nCAREER RECOMMENDATIONS\n';
    report += '---------------------\n\n';
    
    if (assessmentResults.recommendations.careers) {
        assessmentResults.recommendations.careers.forEach((career, index) => {
            report += `${index + 1}. ${career.title}\n`;
            report += `   Match Score: ${career.match_score}\n`;
            report += `   Explanation: ${career.explanation}\n`;
            report += `   Skills: ${Array.isArray(career.required_skills) ? career.required_skills.join(', ') : career.required_skills}\n`;
            report += `   Salary: ${career.salary_range}\n`;
            if (career.growth_potential) {
                report += `   Growth Potential: ${career.growth_potential}\n`;
            }
            report += '\n';
        });
    }
    
    if (assessmentResults.recommendations.summary) {
        report += 'SUMMARY\n';
        report += '-------\n';
        report += assessmentResults.recommendations.summary + '\n\n';
    }
    
    report += 'Thank you for using our Career Assessment Tool!\n';
    report += 'For more tools, visit: https://calculatoruniverse.net';
    
    return report;
}

// Export functions for use in React component
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        careerQuestions,
        careerCategories,
        calculateCategoryScores,
        getAIRecommendations,
        getBasicRecommendations,
        getSkillsForCareer,
        getSalaryRange,
        generateTextReport
    };
}
