'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUESTIONS_BANK: Record<string, Question[]> = {
  math: [
    {
      question: "What is the sum of the interior angles of a hexagon?",
      options: ["540°", "720°", "900°", "360°"],
      correctIndex: 1,
      explanation: "The formula is (n - 2) × 180°. For a hexagon (n=6), it is 4 × 180° = 720°."
    },
    {
      question: "What is the prime number closest to 100?",
      options: ["91", "93", "97", "101"],
      correctIndex: 2,
      explanation: "97 is a prime number (divisible only by 1 and itself) and is closer to 100 than 101."
    },
    {
      question: "If log(x) + log(5) = 2, what is the value of x? (Assume base 10)",
      options: ["10", "20", "50", "15"],
      correctIndex: 1,
      explanation: "log(5x) = 2 implies 5x = 10^2 = 100. Solving for x gives x = 20."
    },
    {
      question: "Which constant represents the golden ratio in mathematics?",
      options: ["π (Pi)", "e (Euler's number)", "φ (Phi)", "γ (Euler-Mascheroni)"],
      correctIndex: 2,
      explanation: "Phi (φ) represents the golden ratio, which is approximately 1.618."
    }
  ],
  finance: [
    {
      question: "What financial term describes the process of earning interest on interest?",
      options: ["Simple Interest", "Compound Interest", "Amortization", "Discounting"],
      correctIndex: 1,
      explanation: "Compound interest is the addition of interest to the principal sum of a loan or deposit, so interest is earned on interest."
    },
    {
      question: "What type of market is characterized by falling asset prices and investor pessimism?",
      options: ["Bull Market", "Bear Market", "Sideways Market", "Correction Market"],
      correctIndex: 1,
      explanation: "A Bear Market is characterized by a prolonged price decline, typically defined as a drop of 20% or more from recent highs."
    },
    {
      question: "Which equation represents the fundamental accounting balance sheet equation?",
      options: ["Assets = Liabilities + Equity", "Assets = Liabilities - Equity", "Liabilities = Assets + Equity", "Equity = Assets + Liabilities"],
      correctIndex: 0,
      explanation: "The accounting equation is Assets = Liabilities + Owners' Equity, which must always remain balanced."
    },
    {
      question: "What metric is calculated by dividing annual dividend payments by the current stock price?",
      options: ["P/E Ratio", "Dividend Yield", "Earnings Yield", "Payout Ratio"],
      correctIndex: 1,
      explanation: "Dividend Yield is a financial ratio that shows how much a company pays out in dividends each year relative to its stock price."
    }
  ],
  science: [
    {
      question: "Which chemical element has the atomic number 6?",
      options: ["Oxygen", "Nitrogen", "Carbon", "Helium"],
      correctIndex: 2,
      explanation: "Carbon is the 6th element on the periodic table and forms the chemical basis for all known organic life."
    },
    {
      question: "What gas makes up the majority (about 78%) of Earth's atmosphere?",
      options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"],
      correctIndex: 2,
      explanation: "Nitrogen gas (N₂) is the most abundant gas in Earth's atmosphere, followed by Oxygen at about 21%."
    },
    {
      question: "What constant represents the speed of light in a vacuum?",
      options: ["c", "h (Planck)", "G (Gravitation)", "k (Boltzmann)"],
      correctIndex: 0,
      explanation: "The constant 'c' represents the speed of light, which is exactly 299,792,458 meters per second."
    },
    {
      question: "Which organelle is referred to as the 'powerhouse of the cell'?",
      options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi Apparatus"],
      correctIndex: 1,
      explanation: "Mitochondria generate most of the cell's supply of adenosine triphosphate (ATP), used as a source of chemical energy."
    }
  ],
  utility: [
    {
      question: "What encoding standard is used to convert binary data to ASCII text using 64 printable characters?",
      options: ["Hexadecimal", "UTF-8", "Base64", "URL Encoding"],
      correctIndex: 2,
      explanation: "Base64 encoding is widely used when binary data needs to be transferred over media that are designed to handle textual data."
    },
    {
      question: "Which regular expression token is used to match the absolute beginning of a string or line?",
      options: ["$", "*", "^", "\\b"],
      correctIndex: 2,
      explanation: "The caret (^) matches the starting position of a string or line in regular expressions."
    },
    {
      question: "What format represents data structures using human-readable text consisting of key-value pairs?",
      options: ["XML", "JSON", "CSV", "Markdown"],
      correctIndex: 1,
      explanation: "JSON (JavaScript Object Notation) is a lightweight, text-based data-interchange format structured as key-value pairs."
    },
    {
      question: "Which network port is the standard default port for secure HTTPS web traffic?",
      options: ["80", "21", "443", "8080"],
      correctIndex: 2,
      explanation: "Port 443 is the standard port designated for encrypted HTTPS communications (HTTP over TLS/SSL)."
    }
  ],
  knowledge: [
    {
      question: "Which number logically completes the sequence: 2, 4, 8, 16, 32, ...?",
      options: ["48", "64", "50", "128"],
      correctIndex: 1,
      explanation: "The sequence is geometric where each number is multiplied by 2 (powers of 2)."
    },
    {
      question: "Five machines make five widgets in five minutes. How long does it take 100 machines to make 100 widgets?",
      options: ["100 minutes", "5 minutes", "20 minutes", "1 minute"],
      correctIndex: 1,
      explanation: "If 5 machines make 5 widgets in 5 minutes, then 1 machine makes 1 widget in 5 minutes. Therefore, 100 machines working simultaneously will make 100 widgets in 5 minutes."
    },
    {
      question: "A farmer has 17 sheep. All but 9 run away. How many sheep does the farmer have left?",
      options: ["8", "9", "17", "0"],
      correctIndex: 1,
      explanation: "The riddle states 'all but 9 run away', which means exactly 9 sheep did not run away and are still with the farmer."
    },
    {
      question: "If a circle's radius is doubled, by what factor does its area increase?",
      options: ["2 times", "3 times", "4 times", "8 times"],
      correctIndex: 2,
      explanation: "Area is proportional to the square of the radius (A = πr^2). If r becomes 2r, the new area is π(2r)^2 = 4πr^2."
    },
    {
      question: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?",
      options: ["$0.10", "$0.05", "$0.15", "$0.01"],
      correctIndex: 1,
      explanation: "Let the ball cost x. The bat costs x + 1.00. Together, x + (x + 1.00) = 1.10 => 2x = 0.10 => x = 0.05."
    },
    {
      question: "A man pushes his car to a hotel and tells the owner he's bankrupt. Why?",
      options: ["His car ran out of gas", "He is playing Monopoly", "He lost his physical keys", "He was chased by police"],
      correctIndex: 1,
      explanation: "He is playing Monopoly and his token (the car) landed on a hotel property he couldn't afford."
    },
    {
      question: "You have a 3-gallon and a 5-gallon jug. How can you measure exactly 4 gallons of water?",
      options: ["Fill 3g, pour to 5g, fill 3g, fill 5g, empty 3g", "Fill 5g, fill 3g, mix in equal shares", "Fill 5g, pour to 3g (leaves 2g), empty 3g, transfer 2g, refill 5g, fill 3g (leaves 4g)", "Measuring exactly 4 gallons is impossible"],
      correctIndex: 2,
      explanation: "Filling the 5g jug and pouring into the 3g jug leaves 2g. Emptying 3g, putting in the 2g leaves 1g of capacity. Refilling 5g and pouring to fill that 1g leaves exactly 4g."
    },
    {
      question: "If 11 + 2 = 1, what does 9 + 5 equal?",
      options: ["14", "2", "4", "6"],
      correctIndex: 1,
      explanation: "This uses 12-hour clock face arithmetic: 11:00 + 2 hours = 1:00, and 9:00 + 5 hours = 2:00."
    },
    {
      question: "You enter a dark room with a match, candle, wood stove, and gas lamp. What do you light first?",
      options: ["The candle", "The gas lamp", "The match", "The wood stove"],
      correctIndex: 2,
      explanation: "Before you can light the candle, stove, or lamp, you must first light the match."
    },
    {
      question: "C sees A and B in line. B sees A. A sees none. Hats are 3 red, 2 white. C and B say they don't know their hat. What color is A's?",
      options: ["White", "Red", "Blue", "Not enough information"],
      correctIndex: 1,
      explanation: "If A and B wore white, C would know their hat is red. Since C doesn't know, A and B are not both white. If B saw A wearing white, B would know their own hat is red. Since B doesn't know, A must be wearing a red hat."
    }
  ]
};

interface InteractivePlaygroundProps {
  category?: 'math' | 'finance' | 'science' | 'utility' | 'knowledge' | string;
}

export default function InteractivePlayground({ category }: InteractivePlaygroundProps) {
  // Normalize category parameter
  const activeCategory = category && ['math', 'finance', 'science', 'utility', 'knowledge'].includes(category.toLowerCase())
    ? category.toLowerCase()
    : 'all';

  // Game selector state
  const [activeGame, setActiveGame] = useState<'math' | 'binary' | 'quiz'>('math');

  // Set default game context based on category
  useEffect(() => {
    if (activeCategory === 'math') {
      setActiveGame('math');
    } else if (activeCategory === 'utility') {
      setActiveGame('binary');
    } else if (['finance', 'science', 'knowledge'].includes(activeCategory)) {
      setActiveGame('quiz');
    }
  }, [activeCategory]);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardGridRef = useRef<HTMLDivElement>(null);

  // GSAP tab swapping transitions
  useGSAP(
    () => {
      gsap.fromTo('.game-panel',
        { opacity: 0, scale: 0.98, y: 10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    },
    { scope: containerRef, dependencies: [activeGame] }
  );

  // Confetti helper
  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#1a1a1a', '#ffffff', '#8a8a8a', '#d4d4d4']
    });
  };

  // ==========================================
  // GAME 1: SPEED ARITHMETIC BLITZ
  // ==========================================
  const [mathIsPlaying, setMathIsPlaying] = useState(false);
  const [mathScore, setMathScore] = useState(0);
  const [mathHighScore, setMathHighScore] = useState(0);
  const [mathTimeLeft, setMathTimeLeft] = useState(30);
  const [mathEquation, setMathEquation] = useState('');
  const [mathAnswer, setMathAnswer] = useState<number>(0);
  const [mathUserAnswer, setMathUserAnswer] = useState('');
  const [mathStreak, setMathStreak] = useState(0);
  const [mathIsGameOver, setMathIsGameOver] = useState(false);
  const [mathFeedback, setMathFeedback] = useState<'correct' | 'incorrect' | null>(null);

  // Read high score from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tuitility_math_high_score');
      if (stored) setMathHighScore(parseInt(stored));
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (mathIsPlaying && mathTimeLeft > 0) {
      timer = setTimeout(() => {
        setMathTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (mathTimeLeft === 0 && mathIsPlaying) {
      setMathIsPlaying(false);
      setMathIsGameOver(true);
      if (mathScore > mathHighScore) {
        setMathHighScore(mathScore);
        localStorage.setItem('tuitility_math_high_score', String(mathScore));
        triggerConfetti();
      }
    }
    return () => clearTimeout(timer);
  }, [mathIsPlaying, mathTimeLeft, mathScore, mathHighScore]);

  const generateMathEquation = () => {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let num1 = 0;
    let num2 = 0;
    let ans = 0;

    if (op === '+') {
      num1 = Math.floor(Math.random() * 45) + 5;
      num2 = Math.floor(Math.random() * 45) + 5;
      ans = num1 + num2;
    } else if (op === '-') {
      num1 = Math.floor(Math.random() * 80) + 10;
      num2 = Math.floor(Math.random() * num1); // Ensure positive result for ease
      ans = num1 - num2;
    } else {
      num1 = Math.floor(Math.random() * 11) + 2;
      num2 = Math.floor(Math.random() * 10) + 2;
      ans = num1 * num2;
    }

    setMathEquation(`${num1} ${op} ${num2}`);
    setMathAnswer(ans);
    setMathFeedback(null);
  };

  const startMathGame = () => {
    setMathScore(0);
    setMathTimeLeft(30);
    setMathStreak(0);
    setMathIsGameOver(false);
    setMathUserAnswer('');
    generateMathEquation();
    setMathIsPlaying(true);
  };

  const handleMathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mathIsPlaying || !mathUserAnswer.trim()) return;

    const parsed = parseInt(mathUserAnswer);
    if (parsed === mathAnswer) {
      const addedPoints = 10 + Math.min(mathStreak, 5) * 5;
      setMathScore((prev) => prev + addedPoints);
      setMathStreak((prev) => prev + 1);
      setMathFeedback('correct');
      triggerConfetti();
      setMathUserAnswer('');
      generateMathEquation();
    } else {
      setMathStreak(0);
      setMathFeedback('incorrect');
      // Shake animation on feedback
      gsap.fromTo('.math-card-box', 
        { x: -8 }, 
        { x: 0, duration: 0.05, repeat: 5, yoyo: true }
      );
      setTimeout(() => setMathFeedback(null), 1000);
    }
  };

  // ==========================================
  // GAME 2: BINARY BYTE BLITZ
  // ==========================================
  const [binaryIsPlaying, setBinaryIsPlaying] = useState(false);
  const [binaryScore, setBinaryScore] = useState(0);
  const [binaryHighScore, setBinaryHighScore] = useState(0);
  const [binaryTarget, setBinaryTarget] = useState(0);
  const [binaryBits, setBinaryBits] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
  const [binaryTimeLeft, setBinaryTimeLeft] = useState(45);
  const [binaryIsGameOver, setBinaryIsGameOver] = useState(false);
  const [binaryFeedback, setBinaryFeedback] = useState<'correct' | null>(null);

  // Load high score
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tuitility_binary_high_score');
      if (stored) setBinaryHighScore(parseInt(stored));
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (binaryIsPlaying && binaryTimeLeft > 0) {
      timer = setTimeout(() => {
        setBinaryTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (binaryTimeLeft === 0 && binaryIsPlaying) {
      setBinaryIsPlaying(false);
      setBinaryIsGameOver(true);
      if (binaryScore > binaryHighScore) {
        setBinaryHighScore(binaryScore);
        localStorage.setItem('tuitility_binary_high_score', String(binaryScore));
        triggerConfetti();
      }
    }
    return () => clearTimeout(timer);
  }, [binaryIsPlaying, binaryTimeLeft, binaryScore, binaryHighScore]);

  const generateBinaryRound = () => {
    setBinaryTarget(Math.floor(Math.random() * 255) + 1);
    setBinaryBits([0, 0, 0, 0, 0, 0, 0, 0]);
    setBinaryFeedback(null);
  };

  const startBinaryGame = () => {
    setBinaryScore(0);
    setBinaryTimeLeft(45);
    setBinaryIsGameOver(false);
    generateBinaryRound();
    setBinaryIsPlaying(true);
  };

  const toggleBit = (index: number) => {
    if (!binaryIsPlaying || binaryFeedback === 'correct') return;

    const updatedBits = [...binaryBits];
    updatedBits[index] = updatedBits[index] === 0 ? 1 : 0;
    setBinaryBits(updatedBits);

    // Compute sum in real-time
    const currentSum = updatedBits.reduce((acc, bit, idx) => acc + bit * Math.pow(2, 7 - idx), 0);
    
    if (currentSum === binaryTarget) {
      setBinaryScore((prev) => prev + 10);
      setBinaryFeedback('correct');
      triggerConfetti();
      
      // Delay briefly to show success, then generate next round
      setTimeout(() => {
        setBinaryBits([0, 0, 0, 0, 0, 0, 0, 0]);
        setBinaryTarget(Math.floor(Math.random() * 255) + 1);
        setBinaryFeedback(null);
      }, 800);
    }
  };

  const currentBinarySum = binaryBits.reduce((acc, bit, idx) => acc + bit * Math.pow(2, 7 - idx), 0);

  // ==========================================
  // GAME 3: BRAIN IQ QUIZ
  // ==========================================
  // Filter questions based on category
  const quizQuestions = activeCategory === 'all'
    ? [...QUESTIONS_BANK.math, ...QUESTIONS_BANK.finance, ...QUESTIONS_BANK.science, ...QUESTIONS_BANK.utility, ...QUESTIONS_BANK.knowledge]
    : QUESTIONS_BANK[activeCategory] || QUESTIONS_BANK.math;

  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizHasSubmitted, setQuizHasSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizIsFinished, setQuizIsFinished] = useState(false);

  const handleQuizAnswer = (idx: number) => {
    if (quizHasSubmitted) return;
    setQuizSelected(idx);
  };

  const handleQuizSubmit = () => {
    if (quizSelected === null || quizHasSubmitted) return;
    setQuizHasSubmitted(true);

    const isCorrect = quizSelected === quizQuestions[quizIndex].correctIndex;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      triggerConfetti();
    } else {
      // Shake animation on quiz block
      gsap.fromTo('.quiz-card-box',
        { x: -6 },
        { x: 0, duration: 0.05, repeat: 4, yoyo: true }
      );
    }
  };

  const handleQuizNext = () => {
    setQuizSelected(null);
    setQuizHasSubmitted(false);
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex((prev) => prev + 1);
    } else {
      setQuizIsFinished(true);
    }
  };

  const restartQuiz = () => {
    setQuizIndex(0);
    setQuizSelected(null);
    setQuizHasSubmitted(false);
    setQuizScore(0);
    setQuizIsFinished(false);
  };

  return (
    <div className="w-full max-w-none mx-auto py-12" ref={containerRef}>
      {/* Header */}
      <div className="text-center mb-10 max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-1.5 bg-slate-100 border border-slate-200 text-slate-800 px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
          <i className="fas fa-gamepad text-[9px]"></i>
          <span>Interactive Playground</span>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Brain Sandbox &amp; Mini-Games
        </h2>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">
          Take a break and test your quick-thinking skills. High scores are persisted locally to track your focus levels.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-1.5 bg-slate-100 p-1.5 rounded-full border border-slate-200/40">
          <button
            onClick={() => setActiveGame('math')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${
              activeGame === 'math'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <i className="fas fa-calculator text-[10px]"></i>
            <span>Arithmetic Speedrun</span>
          </button>

          <button
            onClick={() => setActiveGame('binary')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${
              activeGame === 'binary'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <i className="fas fa-microchip text-[10px]"></i>
            <span>Binary Byte Blitz</span>
          </button>

          <button
            onClick={() => setActiveGame('quiz')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${
              activeGame === 'quiz'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <i className="fas fa-graduation-cap text-[10px]"></i>
            <span>Brain IQ Trivia</span>
          </button>
        </div>
      </div>

      {/* Game Content Box */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-100/60 rounded-3xl p-6 md:p-8 shadow-xl min-h-[350px] flex flex-col justify-center game-panel relative overflow-hidden">
        {/* Subtle background graphic */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-slate-50/50 rounded-full border border-slate-100/20 -z-10"></div>

        {/* 1. Arithmetic Speedrun Game Panel */}
        {activeGame === 'math' && (
          <div className="space-y-6 text-center math-card-box">
            {!mathIsPlaying && !mathIsGameOver ? (
              <div className="space-y-5 py-6">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-800 text-xl shadow-sm">
                  <i className="fas fa-calculator"></i>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">Arithmetic Speedrun</h3>
                <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                  Solve as many addition, subtraction, and multiplication problems as possible under a 30-second ticking clock. Each correct answer increases your score multiplier.
                </p>
                <div className="flex justify-center space-x-6 text-xs font-bold text-slate-400">
                  <span>High Score: <strong className="text-slate-800">{mathHighScore}</strong></span>
                </div>
                <button
                  onClick={startMathGame}
                  className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all active:scale-95 text-xs tracking-wider uppercase"
                >
                  Start Blitz
                </button>
              </div>
            ) : mathIsGameOver ? (
              <div className="space-y-5 py-6">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-800 text-xl shadow-sm">
                  <i className="fas fa-trophy"></i>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">Time's Up!</h3>
                <p className="text-sm text-slate-500 font-medium">
                  You scored <strong className="text-slate-800 text-lg">{mathScore}</strong> points.
                </p>
                {mathScore >= mathHighScore && mathScore > 0 && (
                  <p className="text-xs text-slate-800 font-black uppercase tracking-wider">
                    🎉 New High Score Record!
                  </p>
                )}
                <div className="flex justify-center space-x-6 text-xs font-bold text-slate-400">
                  <span>Current High Score: <strong className="text-slate-800">{mathHighScore}</strong></span>
                </div>
                <button
                  onClick={startMathGame}
                  className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all active:scale-95 text-xs tracking-wider uppercase"
                >
                  Play Again
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats */}
                <div className="flex justify-between items-center max-w-md mx-auto text-xs font-bold text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <span>Score:</span>
                    <span className="text-slate-950 font-black text-sm">{mathScore}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>Streak:</span>
                    <span className="text-slate-950 font-black text-sm">x{mathStreak}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <i className="far fa-clock"></i>
                    <span className="text-slate-950 font-black text-sm">{mathTimeLeft}s</span>
                  </div>
                </div>

                {/* Progress bar timer */}
                <div className="w-full max-w-md mx-auto bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-slate-900 h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${(mathTimeLeft / 30) * 100}%` }}
                  ></div>
                </div>

                {/* Equation Card */}
                <div className="max-w-md mx-auto py-10 bg-slate-50 border border-slate-150 rounded-3xl relative">
                  <span className="text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
                    {mathEquation} = ?
                  </span>
                  
                  {mathFeedback && (
                    <div className="absolute top-3 right-6 text-xs font-black uppercase tracking-wider">
                      {mathFeedback === 'correct' ? (
                        <span className="text-slate-800">✓ Correct</span>
                      ) : (
                        <span className="text-slate-400">✗ Wrong</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Input box form */}
                <form onSubmit={handleMathSubmit} className="flex max-w-md mx-auto gap-3">
                  <input
                    type="number"
                    value={mathUserAnswer}
                    onChange={(e) => setMathUserAnswer(e.target.value)}
                    placeholder="Type answer..."
                    className="flex-1 px-5 py-3 rounded-full border border-slate-200 bg-white text-slate-800 text-sm font-semibold text-center focus:outline-none focus:border-slate-400 transition-colors"
                    autoFocus
                    required
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-850 transition-colors text-xs tracking-wider uppercase"
                  >
                    Enter
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* 2. Binary Byte Blitz Game Panel */}
        {activeGame === 'binary' && (
          <div className="space-y-6 text-center binary-card-box">
            {!binaryIsPlaying && !binaryIsGameOver ? (
              <div className="space-y-5 py-6">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-800 text-xl shadow-sm">
                  <i className="fas fa-microchip"></i>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">Binary Byte Blitz</h3>
                <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                  Toggle the 8 binary bits (values 128 down to 1) to make their sum equal the target decimal number before the 45-second clock runs out.
                </p>
                <div className="flex justify-center space-x-6 text-xs font-bold text-slate-400">
                  <span>High Score: <strong className="text-slate-800">{binaryHighScore}</strong></span>
                </div>
                <button
                  onClick={startBinaryGame}
                  className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all active:scale-95 text-xs tracking-wider uppercase"
                >
                  Start Blitz
                </button>
              </div>
            ) : binaryIsGameOver ? (
              <div className="space-y-5 py-6">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-800 text-xl shadow-sm">
                  <i className="fas fa-trophy"></i>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">Time's Up!</h3>
                <p className="text-sm text-slate-500 font-medium">
                  You scored <strong className="text-slate-800 text-lg">{binaryScore}</strong> points.
                </p>
                {binaryScore >= binaryHighScore && binaryScore > 0 && (
                  <p className="text-xs text-slate-800 font-black uppercase tracking-wider">
                    🎉 New High Score Record!
                  </p>
                )}
                <div className="flex justify-center space-x-6 text-xs font-bold text-slate-400">
                  <span>Current High Score: <strong className="text-slate-800">{binaryHighScore}</strong></span>
                </div>
                <button
                  onClick={startBinaryGame}
                  className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all active:scale-95 text-xs tracking-wider uppercase"
                >
                  Play Again
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats */}
                <div className="flex justify-between items-center max-w-md mx-auto text-xs font-bold text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <span>Score:</span>
                    <span className="text-slate-950 font-black text-sm">{binaryScore}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <i className="far fa-clock"></i>
                    <span className="text-slate-950 font-black text-sm">{binaryTimeLeft}s</span>
                  </div>
                </div>

                {/* Progress bar timer */}
                <div className="w-full max-w-md mx-auto bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-slate-900 h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${(binaryTimeLeft / 45) * 100}%` }}
                  ></div>
                </div>

                {/* Target Number */}
                <div className="max-w-md mx-auto py-4 bg-slate-900 text-white border border-slate-800 rounded-2xl relative shadow-md">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Target Decimal</span>
                  <span className="text-5xl font-black tracking-tight font-mono text-white">
                    {binaryTarget}
                  </span>
                  
                  {binaryFeedback && (
                    <div className="absolute top-2 right-4 text-xs font-black uppercase tracking-wider text-white bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-full animate-bounce">
                      ✓ Match! +10
                    </div>
                  )}
                </div>

                {/* 8-bit switches grid */}
                <div className="grid grid-cols-8 gap-2 sm:gap-3 max-w-xl mx-auto pt-2">
                  {binaryBits.map((bit, index) => {
                    const placeValue = Math.pow(2, 7 - index);
                    return (
                      <button
                        key={index}
                        onClick={() => toggleBit(index)}
                        disabled={binaryFeedback === 'correct'}
                        className={`py-4 rounded-xl border flex flex-col items-center justify-center transition-all duration-200 cursor-pointer focus:outline-none ${
                          bit === 1
                            ? 'bg-[#1a1a1a] border-[#1a1a1a] text-white scale-[1.03] shadow-md animate-pulse'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-350 hover:scale-[1.01]'
                        }`}
                        aria-label={`Toggle bit for value ${placeValue}`}
                      >
                        <span className="text-[10px] sm:text-xs font-mono font-bold tracking-tight text-slate-400 mb-1 block">
                          {placeValue}
                        </span>
                        <span className="text-lg sm:text-2xl font-black font-mono">
                          {bit}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Interactive Equation summary */}
                <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl max-w-xl mx-auto text-left font-mono">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-150 pb-1.5">
                    <span>Active Bits Calculation</span>
                    <span>Sum: <strong className="text-slate-800 text-xs">{currentBinarySum}</strong></span>
                  </div>
                  <div className="text-[11px] text-slate-550 font-medium leading-relaxed overflow-x-auto whitespace-nowrap scrollbar-none py-1">
                    {binaryBits.map((bit, idx) => {
                      const val = Math.pow(2, 7 - idx);
                      return (
                        <span key={idx}>
                          <span className={bit === 1 ? "text-slate-900 font-bold" : "text-slate-300"}>
                            ({val} × {bit})
                          </span>
                          {idx < 7 ? <span className="text-slate-300 mx-1">+</span> : null}
                        </span>
                      );
                    })}
                    <span className="text-slate-400 mx-1.5">=</span>
                    <strong className={`text-sm ${currentBinarySum === binaryTarget ? "text-slate-900 font-black" : "text-slate-600 font-extrabold"}`}>
                      {currentBinarySum}
                    </strong>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* 3. Brain IQ Quiz Panel */}
        {activeGame === 'quiz' && (
          <div className="quiz-card-box space-y-6">
            {!quizIsFinished ? (
              <div className="space-y-6">
                {/* Progress */}
                <div className="flex justify-between items-center text-xs font-bold text-slate-450 border-b border-slate-100 pb-3">
                  <span className="uppercase tracking-wider">
                    {activeCategory === 'all' ? 'General IQ Trivia' : `${activeCategory} specialized`}
                  </span>
                  <span>Question {quizIndex + 1} of {quizQuestions.length}</span>
                </div>

                {/* Question */}
                <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                  {quizQuestions[quizIndex].question}
                </h3>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {quizQuestions[quizIndex].options.map((option, idx) => {
                    const isSelected = quizSelected === idx;
                    const isCorrect = idx === quizQuestions[quizIndex].correctIndex;
                    
                    let btnClass = "bg-slate-50 border-slate-150 hover:bg-slate-100 hover:border-slate-350 text-slate-700";
                    if (quizHasSubmitted) {
                      if (isCorrect) {
                        btnClass = "bg-slate-950 border-slate-950 text-white font-bold";
                      } else if (isSelected) {
                        btnClass = "bg-slate-200 border-slate-300 text-slate-400 line-through";
                      } else {
                        btnClass = "bg-slate-50/50 border-slate-100 text-slate-300 opacity-60";
                      }
                    } else if (isSelected) {
                      btnClass = "bg-slate-900 border-slate-900 text-white font-bold";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleQuizAnswer(idx)}
                        disabled={quizHasSubmitted}
                        className={`p-4 rounded-2xl border text-left text-xs font-semibold transition-all duration-200 flex items-center justify-between ${btnClass}`}
                      >
                        <span>{option}</span>
                        {quizHasSubmitted && isCorrect && (
                          <i className="fas fa-check text-[10px] text-white"></i>
                        )}
                        {quizHasSubmitted && isSelected && !isCorrect && (
                          <i className="fas fa-times text-[10px] text-slate-400"></i>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback Panel */}
                {quizHasSubmitted && (
                  <div className="bg-slate-50 border border-slate-100 p-4.5 rounded-2xl text-left space-y-2 animate-fade-in-up">
                    <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400 block">
                      {quizSelected === quizQuestions[quizIndex].correctIndex ? '✓ Correct Answer' : '✗ Incorrect Answer'}
                    </span>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {quizQuestions[quizIndex].explanation}
                    </p>
                  </div>
                )}

                {/* Footer buttons */}
                <div className="flex justify-end pt-3 border-t border-slate-100">
                  {!quizHasSubmitted ? (
                    <button
                      onClick={handleQuizSubmit}
                      disabled={quizSelected === null}
                      className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition-all text-xs tracking-wider uppercase"
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleQuizNext}
                      className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all text-xs tracking-wider uppercase"
                    >
                      {quizIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6 py-6">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-800 text-xl shadow-sm">
                  <i className="fas fa-trophy"></i>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">Quiz Completed!</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  You answered <strong className="text-slate-850 text-lg">{quizScore}</strong> of <strong className="text-slate-850 text-lg">{quizQuestions.length}</strong> questions correctly.
                </p>
                <div className="inline-flex items-center space-x-1.5 bg-slate-100 border border-slate-200 text-slate-800 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider mx-auto">
                  <span>IQ Status: {quizScore === quizQuestions.length ? 'Genius 👑' : quizScore >= quizQuestions.length / 2 ? 'Novice Developer 💻' : 'Apprentice 📚'}</span>
                </div>
                <div>
                  <button
                    onClick={restartQuiz}
                    className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all active:scale-95 text-xs tracking-wider uppercase"
                  >
                    Restart Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
