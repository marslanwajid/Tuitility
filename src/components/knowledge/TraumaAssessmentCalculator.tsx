'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface Question {
  id: number;
  text: string;
  category: 'anxiety' | 'intrusive' | 'avoidance' | 'negative' | 'functional';
  weight: number;
}

const QUESTIONS: Question[] = [
  // Hyperarousal & Anxiety (1-4)
  { id: 1, text: "I feel constantly on edge or alert for danger.", category: 'anxiety', weight: 1.0 },
  { id: 2, text: "I am easily startled by unexpected noises or movements.", category: 'anxiety', weight: 1.0 },
  { id: 3, text: "I have difficulty falling or staying asleep.", category: 'anxiety', weight: 1.0 },
  { id: 4, text: "I experience sudden feelings of anxiety or panic.", category: 'anxiety', weight: 1.0 },

  // Intrusive Thoughts & Memories (5-8)
  { id: 5, text: "I have unwanted memories of distressing events that come into my mind suddenly.", category: 'intrusive', weight: 1.0 },
  { id: 6, text: "I experience flashbacks where I feel like I'm reliving a distressing event.", category: 'intrusive', weight: 1.0 },
  { id: 7, text: "I have nightmares related to difficult experiences.", category: 'intrusive', weight: 1.0 },
  { id: 8, text: "Certain triggers (sounds, smells, situations) cause intense emotional or physical reactions.", category: 'intrusive', weight: 1.0 },

  // Avoidance Behaviors (9-12)
  { id: 9, text: "I avoid people, places, or activities that might remind me of distressing experiences.", category: 'avoidance', weight: 1.0 },
  { id: 10, text: "I find it difficult to talk about certain past experiences.", category: 'avoidance', weight: 1.0 },
  { id: 11, text: "I try to push away thoughts or feelings related to difficult experiences.", category: 'avoidance', weight: 1.0 },
  { id: 12, text: "I feel detached or disconnected from others.", category: 'avoidance', weight: 1.0 },

  // Negative Mood & Cognition (13-16)
  { id: 13, text: "I have persistent negative beliefs about myself, others, or the world.", category: 'negative', weight: 1.0 },
  { id: 14, text: "I blame myself for bad things that have happened.", category: 'negative', weight: 1.0 },
  { id: 15, text: "I experience persistent negative emotions (fear, horror, anger, guilt, or shame).", category: 'negative', weight: 1.0 },
  { id: 16, text: "I have difficulty experiencing positive emotions like happiness or love.", category: 'negative', weight: 1.0 },

  // Functional Impairment (17-20)
  { id: 17, text: "My symptoms interfere with my ability to work or study.", category: 'functional', weight: 1.0 },
  { id: 18, text: "My symptoms affect my relationships with family or friends.", category: 'functional', weight: 1.0 },
  { id: 19, text: "I have difficulty concentrating or remembering things.", category: 'functional', weight: 1.0 },
  { id: 20, text: "I engage in risky or self-destructive behavior.", category: 'functional', weight: 1.0 }
];

const RATING_OPTIONS = [
  { score: 0, label: 'Not at all' },
  { score: 1, label: 'A little bit' },
  { score: 2, label: 'Moderately' },
  { score: 3, label: 'Quite a bit' },
  { score: 4, label: 'Extremely' }
];

interface ScoreProfile {
  anxiety: number;
  intrusive: number;
  avoidance: number;
  negative: number;
  functional: number;
  total: number;
  severity: 'Minimal' | 'Mild' | 'Moderate' | 'Significant';
  severityDesc: string;
  color: string;
}

interface CalculationResult {
  scores: ScoreProfile;
  steps: string[];
}

export default function TraumaAssessmentCalculator() {
  const [stage, setStage] = useState<'intro' | 'quiz' | 'results'>('intro');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [result, setResult] = useState<CalculationResult | null>(null);

  // AI Integration states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiNarrative, setAiNarrative] = useState<string>('');
  const [aiError, setAiError] = useState<string>('');
  const aiSectionRef = useRef<HTMLDivElement>(null);

  // Monitor keyboard stroke listeners for numerical hotkeys (0-4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (stage !== 'quiz') return;
      if (['0', '1', '2', '3', '4'].includes(e.key)) {
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
    let anxiety = 0;
    let intrusive = 0;
    let avoidance = 0;
    let negative = 0;
    let functional = 0;

    QUESTIONS.forEach((q) => {
      const rating = finalAnswers[q.id] ?? 0;
      if (q.category === 'anxiety') anxiety += rating;
      if (q.category === 'intrusive') intrusive += rating;
      if (q.category === 'avoidance') avoidance += rating;
      if (q.category === 'negative') negative += rating;
      if (q.category === 'functional') functional += rating;
    });

    const total = anxiety + intrusive + avoidance + negative + functional;

    let severity: ScoreProfile['severity'] = 'Minimal';
    let severityDesc = '';
    let color = '#28a745'; // Green

    const percentage = (total / 80) * 100;
    if (percentage >= 75) {
      severity = 'Significant';
      severityDesc = 'Your symptoms may be significantly impacting your wellbeing and daily functioning. It is strongly recommended to consult with a mental health professional who specializes in trauma.';
      color = '#dc3545'; // Red
    } else if (percentage >= 50) {
      severity = 'Moderate';
      severityDesc = 'Your symptoms may be moderately impacting your wellbeing and daily functioning. Consider speaking with a mental health professional for support and guidance.';
      color = '#fd7e14'; // Orange
    } else if (percentage >= 25) {
      severity = 'Mild';
      severityDesc = 'You may be experiencing some trauma-related difficulties that could benefit from additional support. Consider exploring self-help resources or speaking with a therapist.';
      color = '#ffc107'; // Yellow
    } else {
      severity = 'Minimal';
      severityDesc = 'You may experience occasional stress or difficult emotions, but they do not significantly impact your daily life. Continue practicing good self-care.';
      color = '#28a745'; // Green
    }

    const scores: ScoreProfile = {
      anxiety,
      intrusive,
      avoidance,
      negative,
      functional,
      total,
      severity,
      severityDesc,
      color
    };

    const steps: string[] = [
      '**Step 1: Sum ratings (0-4) for each trauma symptom category**',
      `* **Hyperarousal & Anxiety Subscore (4 items)**: $S_{\\text{anxiety}} = \\sum R_{\\text{anxiety}} = ${anxiety}$ out of 16`,
      `* **Intrusive Thoughts & Memories Subscore (4 items)**: $S_{\\text{intrusive}} = \\sum R_{\\text{intrusive}} = ${intrusive}$ out of 16`,
      `* **Avoidance Behaviors Subscore (4 items)**: $S_{\\text{avoidance}} = \\sum R_{\\text{avoidance}} = ${avoidance}$ out of 16`,
      `* **Negative Mood & Cognition Subscore (4 items)**: $S_{\\text{negative}} = \\sum R_{\\text{negative}} = ${negative}$ out of 16`,
      `* **Functional Impairment Subscore (4 items)**: $S_{\\text{functional}} = \\sum R_{\\text{functional}} = ${functional}$ out of 16`,
      '\n**Step 2: Calculate Total Severity Score**',
      `$$S_{\\text{total}} = S_{\\text{anxiety}} + S_{\\text{intrusive}} + S_{\\text{avoidance}} + S_{\\text{negative}} + S_{\\text{functional}} = ${anxiety} + ${intrusive} + ${avoidance} + ${negative} + ${functional} = ${total}$$`,
      '\n**Step 3: Evaluate clinical severity thresholds**',
      `* Minimal Symptoms: $S_{\\text{total}} \\le 20$`,
      `* Mild Symptoms: $20 < S_{\\text{total}} \\le 40$`,
      `* Moderate Symptoms: $40 < S_{\\text{total}} \\le 60$`,
      `* Significant Symptoms: $60 < S_{\\text{total}} \\le 80$`,
      `* Your score of **${total}** maps to the **${severity}** category.`
    ];

    setResult({
      scores,
      steps
    });
    setStage('results');

    // Empathic subtle celebration
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
      // Put the logo at the top center of the report
      doc.addImage(logoImg, 'PNG', (doc.internal.pageSize.width - imgWidth) / 2, 10, imgWidth, imgHeight);
      
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('Trauma Assessment Results', 105, imgHeight + 25, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, imgHeight + 33, { align: 'center' });
      
      generatePDFContent(doc, imgHeight + 45);
    };
    
    logoImg.onerror = function() {
      console.error('Error loading logo image');
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('Trauma Assessment Results', 105, 25, { align: 'center' });
      
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
    const maxScore = 80;
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
    doc.text(`• Hyperarousal & Anxiety: ${result.scores.anxiety} / 16`, 25, yPos);
    yPos += 7;
    doc.text(`• Intrusive Thoughts & Memories: ${result.scores.intrusive} / 16`, 25, yPos);
    yPos += 7;
    doc.text(`• Avoidance Behaviors: ${result.scores.avoidance} / 16`, 25, yPos);
    yPos += 7;
    doc.text(`• Negative Mood & Cognition: ${result.scores.negative} / 16`, 25, yPos);
    yPos += 7;
    doc.text(`• Functional Impairment: ${result.scores.functional} / 16`, 25, yPos);
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
    doc.setTextColor(220, 53, 69); // Red color for emphasis
    doc.setFont(undefined, 'bold');
    doc.text('Recommended Next Steps:', 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10.5);
    doc.setTextColor(33, 37, 41);
    doc.setFont(undefined, 'normal');
    const consultNoteText = 'Based on your scores, we strongly recommend consulting a qualified physician, doctor, or licensed psychiatrist specializing in trauma care. Talking with a professional provides the support needed for a guided, safe, and effective healing journey.';
    yPos = wrapText(consultNoteText, 170, 20, yPos, doc);
    yPos += 15;

    // Check for page break before disclaimer
    yPos = checkPageBreak(yPos, doc);
    
    // Add disclaimer
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    const disclaimer = 'IMPORTANT: This assessment is not a diagnostic tool. It is designed to raise awareness about potential trauma impacts. For proper diagnosis and treatment, please consult with a qualified mental health professional.';
    yPos = wrapText(disclaimer, 170, 20, yPos, doc);
    
    doc.save('trauma-assessment-report.pdf');
  };

  const handleGenerateAiReport = async () => {
    if (!result) return;
    setIsGenerating(true);
    setAiError('');
    setAiNarrative('');

    try {
      const response = await fetch('/api/ai/analyze-trauma', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          anxietyScore: result.scores.anxiety,
          intrusiveScore: result.scores.intrusive,
          avoidanceScore: result.scores.avoidance,
          negativeScore: result.scores.negative,
          functionalScore: result.scores.functional,
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
    const percentage = totalScore / 80;
    const r = 70;
    const circumference = 2 * Math.PI * r;
    const strokeDashoffset = circumference - percentage * circumference;
    
    let strokeColor = 'stroke-slate-400';
    if (totalScore >= 60) strokeColor = 'stroke-red-500';
    else if (totalScore >= 40) strokeColor = 'stroke-orange-500';
    else if (totalScore >= 20) strokeColor = 'stroke-yellow-500';
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
              Trauma Assessment & Recovery Support
            </h2>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Take our comprehensive trauma assessment to better understand your experiences and receive personalized insights for healing and recovery. Rate how much each response has affected you over the past week to evaluate hyperarousal, intrusive thoughts, avoidance, negative mood, and functional impairment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 text-left pt-2">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-[9px] font-black text-slate-900 uppercase block">Anxiety</span>
              <p className="text-[8px] text-slate-500 leading-tight font-medium">Constant alertness, easily startled, sleeping difficulties, and panic.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-[9px] font-black text-slate-900 uppercase block">Intrusive</span>
              <p className="text-[8px] text-slate-500 leading-tight font-medium">Unwanted memories, flashbacks, nightmares, and trigger reactions.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-[9px] font-black text-slate-900 uppercase block">Avoidance</span>
              <p className="text-[8px] text-slate-500 leading-tight font-medium">Avoiding reminding situations or people, emotional disconnect.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-[9px] font-black text-slate-900 uppercase block">Negative Mood</span>
              <p className="text-[8px] text-slate-500 leading-tight font-medium">Negative beliefs, self-blame, negative feelings, lack of joy.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-[9px] font-black text-slate-900 uppercase block">Functional</span>
              <p className="text-[8px] text-slate-500 leading-tight font-medium">Impact on work, relationships, focus, and self-destructive patterns.</p>
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
                QUESTIONS[currentQuestionIdx].category === 'anxiety' ? 'Hyperarousal & Anxiety' :
                QUESTIONS[currentQuestionIdx].category === 'intrusive' ? 'Intrusive Thoughts & Memories' :
                QUESTIONS[currentQuestionIdx].category === 'avoidance' ? 'Avoidance Behaviors' :
                QUESTIONS[currentQuestionIdx].category === 'negative' ? 'Negative Mood & Cognition' : 'Functional Impairment'
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
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
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
                {['0', '1', '2', '3', '4'].map((h) => (
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
              className="py-2.5 px-5 border border-slate-200 rounded-xl font-bold text-xs text-slate-650 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
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
                Your Distress Evaluation Profile
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Stress severity levels mapped across 5 core trauma symptom categories.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl text-center shadow-md min-w-[120px]">
                <span className="text-[8px] font-extrabold uppercase tracking-widest block opacity-75">
                  Total Score
                </span>
                <span className="text-3xl font-black block mt-0.5 leading-none font-display">
                  {result.scores.total} <span className="text-xs font-semibold opacity-60">/ 80</span>
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
                className="py-3 px-5 border border-slate-200 hover:bg-slate-50 rounded-2xl font-bold text-xs text-slate-650 transition-all flex items-center space-x-2 cursor-pointer shrink-0"
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
                Total Severity Level
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
                  <span className="text-[9px] text-slate-450 font-black uppercase tracking-wider block">Max 80</span>
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
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-450">
                  Category Scores Breakdown
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
                  {/* Anxiety */}
                  <div className="p-2.5 bg-white border border-slate-250 rounded-xl space-y-1.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black text-slate-900 block leading-tight">Anxiety</span>
                      <span className="text-[9px] text-slate-400 block font-semibold leading-none">Hyperarousal</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 flex justify-between items-baseline mt-1">
                        <span>{result.scores.anxiety}</span>
                        <span className="text-[9px] opacity-50">/ 16</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                        <div
                          className="h-full bg-slate-900"
                          style={{ width: `${(result.scores.anxiety / 16) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Intrusive */}
                  <div className="p-2.5 bg-white border border-slate-250 rounded-xl space-y-1.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black text-slate-900 block leading-tight">Intrusive</span>
                      <span className="text-[9px] text-slate-400 block font-semibold leading-none">Memories</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 flex justify-between items-baseline mt-1">
                        <span>{result.scores.intrusive}</span>
                        <span className="text-[9px] opacity-50">/ 16</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                        <div
                          className="h-full bg-slate-900"
                          style={{ width: `${(result.scores.intrusive / 16) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Avoidance */}
                  <div className="p-2.5 bg-white border border-slate-250 rounded-xl space-y-1.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black text-slate-900 block leading-tight">Avoidance</span>
                      <span className="text-[9px] text-slate-400 block font-semibold leading-none">Behaviors</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 flex justify-between items-baseline mt-1">
                        <span>{result.scores.avoidance}</span>
                        <span className="text-[9px] opacity-50">/ 16</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                        <div
                          className="h-full bg-slate-900"
                          style={{ width: `${(result.scores.avoidance / 16) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Negative */}
                  <div className="p-2.5 bg-white border border-slate-250 rounded-xl space-y-1.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black text-slate-900 block leading-tight">Negative</span>
                      <span className="text-[9px] text-slate-400 block font-semibold leading-none">Cognition</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 flex justify-between items-baseline mt-1">
                        <span>{result.scores.negative}</span>
                        <span className="text-[9px] opacity-50">/ 16</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                        <div
                          className="h-full bg-slate-900"
                          style={{ width: `${(result.scores.negative / 16) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Functional */}
                  <div className="p-2.5 bg-white border border-slate-250 rounded-xl space-y-1.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black text-slate-900 block leading-tight">Functional</span>
                      <span className="text-[9px] text-slate-400 block font-semibold leading-none">Impairment</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 flex justify-between items-baseline mt-1">
                        <span>{result.scores.functional}</span>
                        <span className="text-[9px] opacity-50">/ 16</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                        <div
                          className="h-full bg-slate-900"
                          style={{ width: `${(result.scores.functional / 16) * 100}%` }}
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
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-650 font-medium text-left flex items-start space-x-2">
                <i className="fas fa-exclamation-circle text-slate-700 mt-0.5"></i>
                <span>{aiError}</span>
              </div>
            )}

            {aiNarrative && (
              <div 
                className="p-6 bg-white border border-slate-150 rounded-2xl shadow-sm text-slate-750 text-xs leading-relaxed space-y-4 w-full prose prose-slate max-w-none animate-fade-in text-left"
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
  
  // Normalize line endings
  let formatted = text.replace(/\r\n/g, '\n');

  // 1. Handle Headers (###, ##, #)
  formatted = formatted.replace(/^###\s+(.+)$/gm, '<h4 class="text-sm font-black text-slate-900 pt-4 border-b border-slate-100 pb-1 font-display">$1</h4>');
  formatted = formatted.replace(/^##\s+(.+)$/gm, '<h3 class="text-base font-black text-slate-900 pt-5 font-display">$1</h3>');
  formatted = formatted.replace(/^#\s+(.+)$/gm, '<h2 class="text-lg font-black text-slate-900 pt-6 font-display">$1</h2>');

  // 2. Handle Bold Text (**text**)
  formatted = formatted.replace(/\*\*(.+?)\*\?/g, '<strong class="font-extrabold text-slate-900">$1</strong>');
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong class="font-extrabold text-slate-900">$1</strong>');

  // 3. Handle Lists (Numbered and Bulleted)
  formatted = formatted.replace(/^\d+\.\s+(.+)$/gm, '<li class="my-1 pl-1">$1</li>');
  formatted = formatted.replace(/^[\*\-]\s+(.+)$/gm, '<li class="my-1 pl-1">$1</li>');

  // 4. Wrap adjacent <li> items in <ul>
  formatted = formatted.replace(/(<li>[\s\S]*?<\/li>(?:\s*<li>[\s\S]*?<\/li>)*)/g, '<ul class="list-disc pl-5 my-2 space-y-1 text-slate-700">$1</ul>');

  // 5. Handle paragraphs by splitting on double newlines
  const parts = formatted.split(/\n\n+/);
  formatted = parts.map(part => {
    const trimmed = part.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<li')) {
      return trimmed;
    }
    // Replace single newlines inside paragraph with a space to let the browser flow it naturally,
    // but convert double lines to separate paragraph tags.
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
