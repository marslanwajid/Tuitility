'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface Question {
  id: number;
  text: string;
  category: 'psychological' | 'physical' | 'behavioral' | 'social' | 'cognitive';
  weight: number;
}

const QUESTIONS: Question[] = [
  // Psychological Symptoms (1-5)
  { id: 1, text: "Over the last 2 weeks, how often have you felt nervous, anxious, or on edge?", category: 'psychological', weight: 1.0 },
  { id: 2, text: "Over the last 2 weeks, how often have you been unable to stop or control worrying?", category: 'psychological', weight: 1.0 },
  { id: 3, text: "Over the last 2 weeks, how often have you worried too much about different things?", category: 'psychological', weight: 1.0 },
  { id: 4, text: "Over the last 2 weeks, how often have you had trouble relaxing?", category: 'psychological', weight: 1.0 },
  { id: 5, text: "Over the last 2 weeks, how often have you felt afraid, as if something awful might happen?", category: 'psychological', weight: 1.0 },

  // Physical Symptoms (6-10)
  { id: 6, text: "Over the last 2 weeks, how often have you experienced a racing heart or palpitations?", category: 'physical', weight: 1.0 },
  { id: 7, text: "Over the last 2 weeks, how often have you experienced shortness of breath or difficulty breathing?", category: 'physical', weight: 1.0 },
  { id: 8, text: "Over the last 2 weeks, how often have you experienced muscle tension or body aches?", category: 'physical', weight: 1.0 },
  { id: 9, text: "Over the last 2 weeks, how often have you experienced sweating, hot flashes, or chills?", category: 'physical', weight: 1.0 },
  { id: 10, text: "Over the last 2 weeks, how often have you experienced sleep problems (difficulty falling asleep, staying asleep, or restless sleep)?", category: 'physical', weight: 1.0 },

  // Behavioral Changes (11-15)
  { id: 11, text: "Over the last 2 weeks, how often have you avoided situations that might trigger anxiety?", category: 'behavioral', weight: 1.0 },
  { id: 12, text: "Over the last 2 weeks, how often have you found yourself unable to sit still or feeling restless?", category: 'behavioral', weight: 1.0 },
  { id: 13, text: "Over the last 2 weeks, how often have you experienced changes in appetite (eating too much or too little)?", category: 'behavioral', weight: 1.0 },
  { id: 14, text: "Over the last 2 weeks, how often have you relied on substances (alcohol, medication, etc.) to manage anxiety?", category: 'behavioral', weight: 1.0 },
  { id: 15, text: "Over the last 2 weeks, how often have you engaged in repetitive behaviors to reduce anxiety?", category: 'behavioral', weight: 1.0 },

  // Social Impact (16-18)
  { id: 16, text: "Over the last 2 weeks, how often has anxiety interfered with your work or academic performance?", category: 'social', weight: 1.0 },
  { id: 17, text: "Over the last 2 weeks, how often has anxiety affected your relationships with family, friends, or colleagues?", category: 'social', weight: 1.0 },
  { id: 18, text: "Over the last 2 weeks, how often have you avoided social situations due to anxiety?", category: 'social', weight: 1.0 },

  // Cognitive Patterns (19-21)
  { id: 19, text: "Over the last 2 weeks, how often have you experienced difficulty concentrating due to worry?", category: 'cognitive', weight: 1.0 },
  { id: 20, text: "Over the last 2 weeks, how often have you experienced intrusive or unwanted thoughts?", category: 'cognitive', weight: 1.0 },
  { id: 21, text: "Over the last 2 weeks, how often have you found yourself overthinking or ruminating on problems?", category: 'cognitive', weight: 1.0 }
];

const RATING_OPTIONS = [
  { score: 0, label: 'Not at all' },
  { score: 1, label: 'Several days' },
  { score: 2, label: 'More than half the days' },
  { score: 3, label: 'Nearly every day' }
];

interface ScoreProfile {
  psychological: number;
  physical: number;
  behavioral: number;
  social: number;
  cognitive: number;
  total: number;
  severity: 'Minimal Anxiety' | 'Mild Anxiety' | 'Moderate Anxiety' | 'Severe Anxiety';
  severityDesc: string;
  color: string;
}

interface CalculationResult {
  scores: ScoreProfile;
  steps: string[];
}

export default function AnxietyAssessmentCalculator() {
  const [stage, setStage] = useState<'intro' | 'quiz' | 'results'>('intro');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [result, setResult] = useState<CalculationResult | null>(null);

  // AI Integration states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiNarrative, setAiNarrative] = useState<string>('');
  const [aiError, setAiError] = useState<string>('');
  const aiSectionRef = useRef<HTMLDivElement>(null);

  // Monitor keyboard stroke listeners for numerical hotkeys (0-3)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (stage !== 'quiz') return;
      if (['0', '1', '2', '3'].includes(e.key)) {
        const rating = parseInt(e.key);
        handleSelectRating(rating);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, currentQuestionIdx, answers]);

  const handleSelectRating = (rating: number) => {
    const activeQ = QUESTIONS[currentQuestionIdx];
    const updatedAnswers = { ...answers, [activeQ.id]: rating };
    setAnswers(updatedAnswers);

    if (currentQuestionIdx < QUESTIONS.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      evaluateQuiz(updatedAnswers);
    }
  };

  const handleBack = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    }
  };

  const startQuiz = () => {
    setAnswers({});
    setCurrentQuestionIdx(0);
    setStage('quiz');
    setResult(null);
    setAiNarrative('');
    setAiError('');
  };

  const evaluateQuiz = (finalAnswers: Record<number, number>) => {
    let psychological = 0;
    let physical = 0;
    let behavioral = 0;
    let social = 0;
    let cognitive = 0;

    QUESTIONS.forEach((q) => {
      const rating = finalAnswers[q.id] ?? 0;
      if (q.category === 'psychological') psychological += rating;
      if (q.category === 'physical') physical += rating;
      if (q.category === 'behavioral') behavioral += rating;
      if (q.category === 'social') social += rating;
      if (q.category === 'cognitive') cognitive += rating;
    });

    const total = psychological + physical + behavioral + social + cognitive;

    let severity: ScoreProfile['severity'] = 'Minimal Anxiety';
    let severityDesc = '';
    let color = '#28a745'; // Green

    const percentage = (total / 63) * 100;
    if (percentage >= 75) {
      severity = 'Severe Anxiety';
      severityDesc = 'Your scores suggest high levels of anxiety symptoms. This may be significantly impacting your wellbeing, relationships, and work. Consulting with a specialist is strongly recommended.';
      color = '#dc3545'; // Red
    } else if (percentage >= 50) {
      severity = 'Moderate Anxiety';
      severityDesc = 'Moderate level of anxiety distress. Symptoms may be noticeably interfering with your daily routines, concentration, or bodily comfort. Proactive self-care and professional guidance are beneficial.';
      color = '#fd7e14'; // Orange
    } else if (percentage >= 25) {
      severity = 'Mild Anxiety';
      severityDesc = 'Mild anxiety symptoms. You may experience some worries or physical tension, but they generally remain manageable. Good opportunity for grounding practices and routine self-care.';
      color = '#ffc107'; // Yellow
    } else {
      severity = 'Minimal Anxiety';
      severityDesc = 'Minimal or transient symptoms. Your anxiety levels do not indicate a clinically significant pattern at this time. Standard stress-coping habits are recommended.';
      color = '#28a745'; // Green
    }

    const scores: ScoreProfile = {
      psychological,
      physical,
      behavioral,
      social,
      cognitive,
      total,
      severity,
      severityDesc,
      color
    };

    const steps: string[] = [
      '**Step 1: Sum ratings (0-3) for each anxiety symptom category**',
      `* **Psychological Symptoms Subscore (5 items)**: $S_{\\text{psychological}} = \\sum R_{\\text{psychological}} = ${psychological}$ out of 15`,
      `* **Physical Symptoms Subscore (5 items)**: $S_{\\text{physical}} = \\sum R_{\\text{physical}} = ${physical}$ out of 15`,
      `* **Behavioral Changes Subscore (5 items)**: $S_{\\text{behavioral}} = \\sum R_{\\text{behavioral}} = ${behavioral}$ out of 15`,
      `* **Social Impact Subscore (3 items)**: $S_{\\text{social}} = \\sum R_{\\text{social}} = ${social}$ out of 9`,
      `* **Cognitive Patterns Subscore (3 items)**: $S_{\\text{cognitive}} = \\sum R_{\\text{cognitive}} = ${cognitive}$ out of 9`,
      '\n**Step 2: Calculate Total Severity Score**',
      `$$S_{\\text{total}} = S_{\\text{psychological}} + S_{\\text{physical}} + S_{\\text{behavioral}} + S_{\\text{social}} + S_{\\text{cognitive}} = ${psychological} + ${physical} + ${behavioral} + ${social} + ${cognitive} = ${total}$$`,
      '\n**Step 3: Evaluate clinical severity thresholds**',
      `* Minimal Anxiety: $S_{\\text{total}} \\le 15$`,
      `* Mild Anxiety: $15 < S_{\\text{total}} \\le 31$`,
      `* Moderate Anxiety: $31 < S_{\\text{total}} \\le 47$`,
      `* Severe Anxiety: $47 < S_{\\text{total}} \\le 63$`,
      `* Your score of **${total}** maps to the **${severity}** category.`
    ];

    setResult({
      scores,
      steps
    });
    setStage('results');

    confetti({
      particleCount: 80,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#334155', '#475569', '#64748b', '#cbd5e1']
    });
  };

  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const loadPDFLibraries = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if ((window as any).jsPDF) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => {
        (window as any).jsPDF = (window as any).jspdf.jsPDF;
        resolve();
      };
      script.onerror = () => {
        console.error('Error loading PDF library');
        reject(new Error('Failed to load PDF library'));
      };
      document.head.appendChild(script);
    });
  };

  const downloadResults = async () => {
    if (!result) {
      alert('No results to download. Please complete the assessment first.');
      return;
    }
    
    setIsDownloading(true);
    
    try {
      if (!(window as any).jsPDF) {
        await loadPDFLibraries();
      }
      
      if (!(window as any).jsPDF) {
        throw new Error('PDF library not loaded');
      }
      
      generatePDF();
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const generatePDF = () => {
    const doc = new ((window as any).jsPDF)();
    
    const logoImg = new Image();
    logoImg.src = '/images/logo.png';
    
    logoImg.onload = function() {
      const imgWidth = 40;
      const imgHeight = (logoImg.height * imgWidth) / logoImg.width;
      doc.addImage(logoImg, 'PNG', (doc.internal.pageSize.width - imgWidth) / 2, 10, imgWidth, imgHeight);
      
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('Anxiety Assessment Results', 105, imgHeight + 25, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, imgHeight + 33, { align: 'center' });
      
      generatePDFContent(doc, imgHeight + 45);
    };
    
    logoImg.onerror = function() {
      console.error('Error loading logo image');
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('Anxiety Assessment Results', 105, 25, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 33, { align: 'center' });
      
      generatePDFContent(doc, 45);
    };
  };

  const generatePDFContent = (doc: any, startY: number) => {
    const wrapText = (text: string, maxWidth: number, x: number, y: number, pdf: any) => {
      const lines = pdf.splitTextToSize(text, maxWidth);
      let currentY = y;
      for (let i = 0; i < lines.length; i++) {
        if (currentY > 275) {
          pdf.addPage();
          currentY = 20;
        }
        pdf.text(lines[i], x, currentY);
        currentY += 6;
      }
      return currentY;
    };

    const checkPageBreak = (yPos: number, pdf: any) => {
      if (yPos > 250) {
        pdf.addPage();
        return 20;
      }
      return yPos;
    };

    if (!result) return;

    // Add scores
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Assessment Scores Summary', 20, startY);
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    let yPos = startY + 12;
    
    const totalScore = result.scores.total;
    const maxScore = 63;
    const severityLevel = result.scores.severity;
    
    doc.text(`Total Score: ${totalScore} / ${maxScore}`, 20, yPos);
    yPos += 8;
    doc.text(`Severity Level: ${severityLevel}`, 20, yPos);
    yPos += 12;
    
    // Add category scores
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Category Breakdown:', 20, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`• Psychological Symptoms: ${result.scores.psychological} / 15`, 25, yPos);
    yPos += 7;
    doc.text(`• Physical Symptoms: ${result.scores.physical} / 15`, 25, yPos);
    yPos += 7;
    doc.text(`• Behavioral Changes: ${result.scores.behavioral} / 15`, 25, yPos);
    yPos += 7;
    doc.text(`• Social Impact: ${result.scores.social} / 9`, 25, yPos);
    yPos += 7;
    doc.text(`• Cognitive Patterns: ${result.scores.cognitive} / 9`, 25, yPos);
    yPos += 14;
    
    // Check for page break
    yPos = checkPageBreak(yPos, doc);
    
    // Add interpretation
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Severity Description', 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    yPos = wrapText(result.scores.severityDesc, 170, 20, yPos, doc);
    yPos += 15;
    
    // Check for page break before AI narrative
    yPos = checkPageBreak(yPos, doc);
    
    if (aiNarrative) {
      const formattedHtml = formatAIResponse(aiNarrative);
      const sections = extractSectionsFromHTML(formattedHtml);

      // Check for page break
      yPos = checkPageBreak(yPos + 10, doc);

      doc.setFontSize(13);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(15, 23, 42); // Primary dark slate
      doc.text('AI Personal Coping Analysis & Recommendations', 20, yPos);
      yPos += 10;

      for (const section of sections) {
        yPos = checkPageBreak(yPos + 8, doc);

        // Add section title
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(194, 65, 12); // Accent rust
        doc.text(section.title, 20, yPos);
        yPos += 7;

        // Add section content
        doc.setFontSize(9.5);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(71, 85, 105); // Slate description color

        yPos = wrapText(section.content, 170, 20, yPos, doc);
        yPos += 8;
      }
    }
    
    // Check for page break before consultation note
    yPos = checkPageBreak(yPos + 5, doc);
    
    // Add professional consultation note at the end of the report
    doc.setFontSize(12);
    doc.setTextColor(220, 53, 69); // Red accent
    doc.setFont(undefined, 'bold');
    doc.text('Recommended Next Steps:', 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10.5);
    doc.setTextColor(33, 37, 41);
    doc.setFont(undefined, 'normal');
    const consultNoteText = 'Based on your scores, we strongly recommend consulting a qualified physician, doctor, or licensed psychiatrist specializing in anxiety management. Talking with a professional provides the support needed for a guided, safe, and effective recovery journey.';
    yPos = wrapText(consultNoteText, 170, 20, yPos, doc);
    yPos += 15;

    // Check for page break before disclaimer
    yPos = checkPageBreak(yPos, doc);
    
    // Add disclaimer
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    const disclaimer = 'IMPORTANT: This assessment is not a diagnostic tool. It is designed to raise awareness about anxiety symptoms. For proper diagnosis and treatment, please consult with a qualified mental health professional.';
    yPos = wrapText(disclaimer, 170, 20, yPos, doc);
    
    doc.save('anxiety-assessment-report.pdf');
  };

  const handleGenerateAiReport = async () => {
    if (!result) return;
    setIsGenerating(true);
    setAiError('');
    setAiNarrative('');

    try {
      const response = await fetch('/api/ai/analyze-anxiety', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          psychologicalScore: result.scores.psychological,
          physicalScore: result.scores.physical,
          behavioralScore: result.scores.behavioral,
          socialScore: result.scores.social,
          cognitiveScore: result.scores.cognitive,
          totalScore: result.scores.total,
          answers
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Server responded with an error.');
      }

      setAiNarrative(data.narrative);
      setTimeout(() => {
        aiSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate AI narrative. Check your connection or API key settings.');
    } finally {
      setIsGenerating(false);
    }
  };

  // SVG Gauge calculations
  const getCirclePathProps = () => {
    const totalScore = result ? result.scores.total : 0;
    const percentage = totalScore / 63;
    const r = 70;
    const circumference = 2 * Math.PI * r;
    const strokeDashoffset = circumference - percentage * circumference;
    
    let strokeColor = 'stroke-slate-400';
    if (totalScore >= 48) strokeColor = 'stroke-red-500';
    else if (totalScore >= 32) strokeColor = 'stroke-orange-500';
    else if (totalScore >= 16) strokeColor = 'stroke-yellow-500';
    else strokeColor = 'stroke-green-500';

    return { circumference, strokeDashoffset, strokeColor };
  };

  const { circumference, strokeDashoffset, strokeColor } = getCirclePathProps();

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800 animate-fade-in">
      
      {/* Disclaimer Alert */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex items-start space-x-3 text-left">
        <i className="fas fa-notes-medical text-slate-800 text-base mt-0.5"></i>
        <div className="space-y-1">
          <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider block">Clinical Safety Disclaimer</span>
          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
            This assessment is for educational and screening purposes only. It is not a diagnostic tool and does not replace evaluation by a licensed healthcare professional. If you are experiencing severe distress or a crisis, please seek immediate professional assistance or contact your local emergency support services.
          </p>
        </div>
      </div>

      {/* Intro Stage */}
      {stage === 'intro' && (
        <div className="space-y-6 max-w-2xl mx-auto py-6 text-center">
          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white text-2xl mx-auto shadow-md">
            <i className="fas fa-brain"></i>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 font-display">
              Anxiety Assessment & Management Support
            </h2>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Take our comprehensive anxiety assessment to better understand your anxiety symptoms and receive personalized insights for managing anxiety and building resilience. Rate how much each response has affected you over the past two weeks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 text-left pt-2">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-[9px] font-black text-slate-900 uppercase block">Psychological</span>
              <p className="text-[8px] text-slate-500 leading-tight font-medium">Nervousness, panic, difficulty relaxing, and persistent worries.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-[9px] font-black text-slate-900 uppercase block">Physical</span>
              <p className="text-[8px] text-slate-500 leading-tight font-medium">Racing heart, shortness of breath, body tension, and sweating.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-[9px] font-black text-slate-900 uppercase block">Behavioral</span>
              <p className="text-[8px] text-slate-500 leading-tight font-medium">Restlessness, substance reliance, repetitive habits, avoidance.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-[9px] font-black text-slate-900 uppercase block">Social Impact</span>
              <p className="text-[8px] text-slate-500 leading-tight font-medium">Interference with work, study, relationships, and social avoidance.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-[9px] font-black text-slate-900 uppercase block">Cognitive</span>
              <p className="text-[8px] text-slate-500 leading-tight font-medium">Difficulty concentrating, intrusive worries, and overthinking.</p>
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            <button
              type="button"
              onClick={startQuiz}
              className="py-3.5 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all active:scale-95 cursor-pointer shadow-md text-sm"
            >
              Start Screener Assessment
            </button>
          </div>
        </div>
      )}

      {/* Quiz Stage */}
      {stage === 'quiz' && (
        <div className="space-y-8 max-w-2xl mx-auto py-4">
          
          {/* Progress bar info */}
          <div className="space-y-2 text-left">
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
              <span>Category: {
                QUESTIONS[currentQuestionIdx].category === 'psychological' ? 'Psychological Symptoms' :
                QUESTIONS[currentQuestionIdx].category === 'physical' ? 'Physical Symptoms' :
                QUESTIONS[currentQuestionIdx].category === 'behavioral' ? 'Behavioral Changes' :
                QUESTIONS[currentQuestionIdx].category === 'social' ? 'Social Impact' : 'Cognitive Patterns'
              }</span>
              <span>Statement {currentQuestionIdx + 1} of {QUESTIONS.length}</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/55">
              <div
                className="h-full bg-slate-900 transition-all duration-300 ease-out"
                style={{ width: `${((currentQuestionIdx + 1) / QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Statement Box */}
          <div className="p-8 bg-slate-50 border border-slate-150 rounded-3xl min-h-[160px] flex items-center justify-center text-center">
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-snug font-display">
              &ldquo;{QUESTIONS[currentQuestionIdx].text}&rdquo;
            </h3>
          </div>

          {/* User selection buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {RATING_OPTIONS.map((option) => (
              <button
                key={option.score}
                type="button"
                onClick={() => handleSelectRating(option.score)}
                className="py-3.5 px-3 bg-white border border-slate-200 hover:border-slate-900 rounded-xl font-bold text-xs text-slate-800 transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center space-y-1.5 hover:shadow-sm"
              >
                <span className="text-base font-black text-slate-900">{option.score}</span>
                <span className="text-[9px] text-slate-500 font-extrabold text-center block uppercase tracking-wider leading-tight">{option.label}</span>
              </button>
            ))}
          </div>

          {/* Navigation Controls and Hotkey Keypad Panel */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4 border-t border-slate-100">
            
            <button
              type="button"
              disabled={currentQuestionIdx === 0}
              onClick={handleBack}
              className="py-2.5 px-5 border border-slate-200 rounded-xl font-bold text-xs text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <i className="fas fa-chevron-left text-[10px]"></i>
              <span>Back</span>
            </button>

            {/* Hotkeys helper display */}
            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/50">
              <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest">
                Numeric Hotkeys:
              </span>
              <div className="flex space-x-1">
                {['0', '1', '2', '3'].map((h) => (
                  <span
                    key={h}
                    className="w-4 h-4 rounded border border-slate-300 bg-white text-[9px] font-black text-slate-500 flex items-center justify-center"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectRating(0)}
              className="py-2.5 px-5 border border-slate-200 rounded-xl font-bold text-xs text-slate-655 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            >
              Skip (Not at all)
            </button>
          </div>

        </div>
      )}

      {/* Results Stage */}
      {stage === 'results' && result && (
        <div className="space-y-8 animate-fade-in-up">
          
          {/* Header Summary Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-100 gap-6 text-left">
            <div>
              <h2 className="text-2xl font-black text-slate-900 font-display">
                Your Anxiety Evaluation Profile
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Anxiety symptom intensity mapped across 5 core categories.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl text-center shadow-md min-w-[120px]">
                <span className="text-[8px] font-extrabold uppercase tracking-widest block opacity-75">
                  Total Score
                </span>
                <span className="text-3xl font-black block mt-0.5 leading-none font-display">
                  {result.scores.total} <span className="text-xs font-semibold opacity-60">/ 63</span>
                </span>
              </div>
              <button
                type="button"
                onClick={downloadResults}
                disabled={isDownloading}
                className="py-3 px-5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-2xl font-bold text-xs transition-all flex items-center space-x-2 cursor-pointer shrink-0"
              >
                <i className="fas fa-download text-[10px]"></i>
                <span>{isDownloading ? 'Generating...' : 'Download PDF'}</span>
              </button>
              <button
                type="button"
                onClick={startQuiz}
                className="py-3 px-5 border border-slate-200 hover:bg-slate-50 rounded-2xl font-bold text-xs text-slate-655 transition-all flex items-center space-x-2 cursor-pointer shrink-0"
              >
                <i className="fas fa-redo text-[10px]"></i>
                <span>Retake Screener</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: SVG Circle Score Gauge */}
            <div className="flex flex-col items-center bg-slate-50 p-6 rounded-3xl border border-slate-200/50 justify-center">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-4">
                Anxiety Severity Level
              </span>
              
              <div className="relative w-full max-w-[200px] flex items-center justify-center">
                <svg className="w-full h-auto" viewBox="0 0 200 200">
                  {/* Background track */}
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    className="fill-none stroke-slate-200"
                    strokeWidth="12"
                  />
                  
                  {/* Progress indicator */}
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    className={`fill-none ${strokeColor} transition-all duration-1000 ease-out`}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                  />
                </svg>
                
                {/* Center text score */}
                <div className="absolute text-center space-y-0.5">
                  <span className="text-3xl font-black text-slate-900 font-display block">{result.scores.total}</span>
                  <span className="text-[9px] text-slate-450 font-black uppercase tracking-wider block">Max 63</span>
                </div>
              </div>

              {/* Status explanation card */}
              <div className="mt-6 text-center space-y-2 max-w-xs">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Classification</span>
                <span className="text-xs font-black block leading-tight" style={{ color: result.scores.color }}>
                  {result.scores.severity}
                </span>
                <p className="text-[9px] text-slate-500 font-semibold leading-normal pt-1 border-t border-slate-200/60">
                  {result.scores.severityDesc}
                </p>
              </div>
            </div>

            {/* Right Columns: Subscale Breakdown & Formula steps */}
            <div className="lg:col-span-2 space-y-6 text-left">
              
              {/* Detailed subscales */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-455">
                  Category Scores Breakdown
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
                  {/* Psychological */}
                  <div className="p-2.5 bg-white border border-slate-250 rounded-xl space-y-1.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black text-slate-900 block leading-tight">Psychological</span>
                      <span className="text-[9px] text-slate-400 block font-semibold leading-none">Symptoms</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 flex justify-between items-baseline mt-1">
                        <span>{result.scores.psychological}</span>
                        <span className="text-[9px] opacity-50">/ 15</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                        <div
                          className="h-full bg-slate-900"
                          style={{ width: `${(result.scores.psychological / 15) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Physical */}
                  <div className="p-2.5 bg-white border border-slate-250 rounded-xl space-y-1.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black text-slate-900 block leading-tight">Physical</span>
                      <span className="text-[9px] text-slate-400 block font-semibold leading-none">Manifestations</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 flex justify-between items-baseline mt-1">
                        <span>{result.scores.physical}</span>
                        <span className="text-[9px] opacity-50">/ 15</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                        <div
                          className="h-full bg-slate-900"
                          style={{ width: `${(result.scores.physical / 15) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Behavioral */}
                  <div className="p-2.5 bg-white border border-slate-250 rounded-xl space-y-1.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black text-slate-900 block leading-tight">Behavioral</span>
                      <span className="text-[9px] text-slate-400 block font-semibold leading-none">Changes</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 flex justify-between items-baseline mt-1">
                        <span>{result.scores.behavioral}</span>
                        <span className="text-[9px] opacity-50">/ 15</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                        <div
                          className="h-full bg-slate-900"
                          style={{ width: `${(result.scores.behavioral / 15) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social */}
                  <div className="p-2.5 bg-white border border-slate-250 rounded-xl space-y-1.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black text-slate-900 block leading-tight">Social</span>
                      <span className="text-[9px] text-slate-400 block font-semibold leading-none">Interference</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 flex justify-between items-baseline mt-1">
                        <span>{result.scores.social}</span>
                        <span className="text-[9px] opacity-50">/ 9</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                        <div
                          className="h-full bg-slate-900"
                          style={{ width: `${(result.scores.social / 9) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cognitive */}
                  <div className="p-2.5 bg-white border border-slate-250 rounded-xl space-y-1.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black text-slate-900 block leading-tight">Cognitive</span>
                      <span className="text-[9px] text-slate-400 block font-semibold leading-none">Patterns</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 flex justify-between items-baseline mt-1">
                        <span>{result.scores.cognitive}</span>
                        <span className="text-[9px] opacity-50">/ 9</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                        <div
                          className="h-full bg-slate-900"
                          style={{ width: `${(result.scores.cognitive / 9) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mathematical Formulation Steps */}
              <div className="space-y-4 pt-4 border-t border-slate-200/60">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-450">
                  Step-by-Step Resolution Steps
                </h4>
                <div className="space-y-3.5 max-h-[160px] overflow-y-auto pr-1 text-xs text-slate-655 leading-relaxed font-medium">
                  {result.steps.map((step, idx) => {
                    const cleanStep = step.replace(/\*\*/g, '');
                    if (cleanStep.startsWith('$$')) {
                      const latexStr = cleanStep.replace(/\$\$/g, '');
                      return (
                        <div key={idx} className="py-2 overflow-x-auto scrollbar-thin">
                          <BlockMath math={latexStr} />
                        </div>
                      );
                    }
                    
                    const inlineRegex = /\$([^$]+)\$/g;
                    let lastIdx = 0;
                    const parts = [];
                    let match;

                    while ((match = inlineRegex.exec(cleanStep)) !== null) {
                      if (match.index > lastIdx) {
                        parts.push(cleanStep.substring(lastIdx, match.index));
                      }
                      parts.push(<InlineMath key={match.index} math={match[1]} />);
                      lastIdx = inlineRegex.lastIndex;
                    }

                    if (lastIdx < cleanStep.length) {
                      parts.push(cleanStep.substring(lastIdx));
                    }

                    if (cleanStep.startsWith('* ')) {
                      return (
                        <div key={idx} className="pl-4 relative flex items-start space-x-1">
                          <span className="select-none">•</span>
                          <span>{parts.length > 0 ? parts : cleanStep.substring(2)}</span>
                        </div>
                      );
                    }

                    return (
                      <p key={idx} className={step.startsWith('**') ? 'font-black text-slate-800 pt-2 first:pt-0' : ''}>
                        {parts.length > 0 ? parts : cleanStep}
                      </p>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

          {/* AI Grounding Integration Panel */}
          <div className="border-t border-slate-200/65 pt-8 space-y-6 text-left" ref={aiSectionRef}>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm">
                  <i className="fas fa-sparkles"></i>
                </div>
                <h3 className="text-lg font-black text-slate-900 font-display">
                  AI Coping &amp; Grounding Support
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Generate a personalized clinical interpretation and evidence-based self-care coping recommendations based on your specific category scores. This is processed securely and does not save any personal data.
              </p>
            </div>

            <div className="flex justify-start">
              <button
                type="button"
                onClick={handleGenerateAiReport}
                disabled={isGenerating}
                className="py-3 px-6 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-sm flex items-center space-x-2 shrink-0"
              >
                {isGenerating ? (
                  <>
                    <i className="fas fa-spinner animate-spin text-[10px]"></i>
                    <span>Analyzing Responses...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-sparkles text-[10px]"></i>
                    <span>Generate AI Clinical Narrative</span>
                  </>
                )}
              </button>
            </div>

            {/* Narrative container */}
            {aiError && (
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-655 font-medium text-left flex items-start space-x-2">
                <i className="fas fa-exclamation-circle text-slate-700 mt-0.5"></i>
                <span>{aiError}</span>
              </div>
            )}

            {aiNarrative && (
              <div 
                className="p-6 bg-white border border-slate-150 rounded-2xl shadow-sm text-slate-755 text-xs leading-relaxed space-y-4 w-full prose prose-slate max-w-none animate-fade-in text-left"
                style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                dangerouslySetInnerHTML={{ __html: formatAIResponse(aiNarrative) }}
              />
            )}
          </div>

        </div>
      )}

    </div>
  );
}

function formatAIResponse(text: string): string {
  if (!text) return '';
  
  let formatted = text.replace(/\r\n/g, '\n');

  formatted = formatted.replace(/^###\s+(.+)$/gm, '<h4 class="text-sm font-black text-slate-900 pt-4 border-b border-slate-100 pb-1 font-display">$1</h4>');
  formatted = formatted.replace(/^##\s+(.+)$/gm, '<h3 class="text-base font-black text-slate-900 pt-5 font-display">$1</h3>');
  formatted = formatted.replace(/^#\s+(.+)$/gm, '<h2 class="text-lg font-black text-slate-900 pt-6 font-display">$1</h2>');

  formatted = formatted.replace(/\*\*(.+?)\*\?/g, '<strong class="font-extrabold text-slate-900">$1</strong>');
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong class="font-extrabold text-slate-900">$1</strong>');

  formatted = formatted.replace(/^\d+\.\s+(.+)$/gm, '<li class="my-1 pl-1">$1</li>');
  formatted = formatted.replace(/^[\*\-]\s+(.+)$/gm, '<li class="my-1 pl-1">$1</li>');

  formatted = formatted.replace(/(<li>[\s\S]*?<\/li>(?:\s*<li>[\s\S]*?<\/li>)*)/g, '<ul class="list-disc pl-5 my-2 space-y-1 text-slate-700">$1</ul>');

  const parts = formatted.split(/\n\n+/);
  formatted = parts.map(part => {
    const trimmed = part.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<li')) {
      return trimmed;
    }
    return `<p class="font-medium text-slate-750 my-2.5 leading-relaxed">${trimmed.replace(/\n/g, ' ')}</p>`;
  }).join('');

  return formatted;
}

function extractSectionsFromHTML(html: string) {
  const sections: { title: string; content: string }[] = [];
  if (typeof document === 'undefined') {
    // Basic fallback for server environments or when document is not present
    return [{ title: 'Personalized Insights', content: html.replace(/<[^>]*>/g, '') }];
  }

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const h4Elements = tempDiv.querySelectorAll('h4');

  h4Elements.forEach((h4) => {
    const title = h4.textContent?.trim() || '';
    let content = '';
    let currentElement = h4.nextElementSibling;

    while (currentElement && currentElement.tagName !== 'H4') {
      if (currentElement.tagName === 'UL') {
        const listItems = currentElement.querySelectorAll('li');
        listItems.forEach((li) => {
          content += `• ${li.textContent?.trim() || ''}\n`;
        });
      } else {
        content += (currentElement.textContent?.trim() || '') + '\n\n';
      }
      currentElement = currentElement.nextElementSibling;
    }

    sections.push({ title, content: content.trim() });
  });

  if (sections.length === 0) {
    sections.push({
      title: 'Personalized Insights',
      content: tempDiv.textContent?.trim() || ''
    });
  }

  return sections;
}
