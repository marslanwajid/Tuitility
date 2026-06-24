'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface Question {
  text: string;
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
  direction: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
}

const QUESTIONS: Question[] = [
  // Extraversion (E) vs. Introversion (I) Questions
  { text: "I feel energized after spending time with a group of people", dimension: "EI", direction: "E" },
  { text: "I prefer one-on-one conversations as compared to group activities", dimension: "EI", direction: "I" },
  { text: "I often take initiative in social situations", dimension: "EI", direction: "E" },
  { text: "I need time alone to recharge after social activities", dimension: "EI", direction: "I" },
  { text: "I enjoy being the center of attention", dimension: "EI", direction: "E" },
  { text: "I prefer to think before speaking", dimension: "EI", direction: "I" },
  { text: "I make friends easily and enjoy meeting new people", dimension: "EI", direction: "E" },
  { text: "I prefer working independently as compared to working in teams", dimension: "EI", direction: "I" },
  { text: "I often speak up in group discussions", dimension: "EI", direction: "E" },
  { text: "I prefer quiet, solitary activities", dimension: "EI", direction: "I" },
  { text: "I get excited about social events and gatherings", dimension: "EI", direction: "E" },
  { text: "I find it draining to be in busy social situations", dimension: "EI", direction: "I" },
  { text: "I tend to be outgoing and sociable", dimension: "EI", direction: "E" },
  { text: "I prefer deep, one-on-one conversations", dimension: "EI", direction: "I" },
  { text: "I feel comfortable in crowds and parties", dimension: "EI", direction: "E" },
  { text: "I need private time to process my thoughts and feelings", dimension: "EI", direction: "I" },
  { text: "I enjoy group activities and team projects", dimension: "EI", direction: "E" },

  // Sensing (S) vs. Intuition (N) Questions
  { text: "I focus more on present realities than future possibilities", dimension: "SN", direction: "S" },
  { text: "I enjoy thinking about abstract theories and concepts", dimension: "SN", direction: "N" },
  { text: "I trust my direct experiences more than theoretical possibilities", dimension: "SN", direction: "S" },
  { text: "I enjoy imagining different scenarios and possibilities", dimension: "SN", direction: "N" },
  { text: "I prefer practical, hands-on learning", dimension: "SN", direction: "S" },
  { text: "I often think about the bigger picture and future implications", dimension: "SN", direction: "N" },
  { text: "I rely on my five senses and concrete facts", dimension: "SN", direction: "S" },
  { text: "I enjoy exploring new ideas and possibilities", dimension: "SN", direction: "N" },
  { text: "I prefer step-by-step instructions", dimension: "SN", direction: "S" },
  { text: "I trust my hunches and intuitive insights", dimension: "SN", direction: "N" },
  { text: "I focus on details and specific facts", dimension: "SN", direction: "S" },
  { text: "I enjoy metaphors and analogies", dimension: "SN", direction: "N" },
  { text: "I prefer traditional and proven methods", dimension: "SN", direction: "S" },
  { text: "I enjoy discovering patterns and hidden meanings", dimension: "SN", direction: "N" },
  { text: "I trust what I can see and touch", dimension: "SN", direction: "S" },
  { text: "I enjoy thinking about possibilities for the future", dimension: "SN", direction: "N" },
  { text: "I prefer working with concrete facts and details", dimension: "SN", direction: "S" },

  // Thinking (T) vs. Feeling (F) Questions
  { text: "I make decisions based on logical analysis", dimension: "TF", direction: "T" },
  { text: "I consider how others will feel when making decisions", dimension: "TF", direction: "F" },
  { text: "I value truth over tact", dimension: "TF", direction: "T" },
  { text: "I am sensitive to others' emotions", dimension: "TF", direction: "F" },
  { text: "I prefer objective criteria when making decisions", dimension: "TF", direction: "T" },
  { text: "I consider the impact on people when making choices", dimension: "TF", direction: "F" },
  { text: "I tend to be direct and straightforward", dimension: "TF", direction: "T" },
  { text: "I value harmony in relationships", dimension: "TF", direction: "F" },
  { text: "I focus on efficiency and effectiveness", dimension: "TF", direction: "T" },
  { text: "I am empathetic to others' situations", dimension: "TF", direction: "F" },
  { text: "I prefer to analyze problems objectively", dimension: "TF", direction: "T" },
  { text: "I make decisions based on personal values", dimension: "TF", direction: "F" },
  { text: "I value competence over cooperation", dimension: "TF", direction: "T" },
  { text: "I enjoy helping others achieve their goals", dimension: "TF", direction: "F" },
  { text: "I prefer clear rules and guidelines", dimension: "TF", direction: "T" },
  { text: "I consider everyone's feelings in group situations", dimension: "TF", direction: "F" },
  { text: "I value logic over emotions in decision-making", dimension: "TF", direction: "T" },
  { text: "I enjoy supporting others emotionally", dimension: "TF", direction: "F" },

  // Judging (J) vs. Perceiving (P) Questions
  { text: "I prefer to have things planned and organized", dimension: "JP", direction: "J" },
  { text: "I enjoy being spontaneous and flexible", dimension: "JP", direction: "P" },
  { text: "I like to have clear deadlines and schedules", dimension: "JP", direction: "J" },
  { text: "I prefer to keep my options open", dimension: "JP", direction: "P" },
  { text: "I enjoy having a structured routine", dimension: "JP", direction: "J" },
  { text: "I adapt easily to change and new situations", dimension: "JP", direction: "P" },
  { text: "I like to make decisions and stick to them", dimension: "JP", direction: "J" },
  { text: "I prefer to go with the flow", dimension: "JP", direction: "P" },
  { text: "I feel stressed when things are disorganized", dimension: "JP", direction: "J" },
  { text: "I enjoy exploring different possibilities", dimension: "JP", direction: "P" },
  { text: "I prefer to complete one project before starting another", dimension: "JP", direction: "J" },
  { text: "I like to stay open to new information", dimension: "JP", direction: "P" },
  { text: "I enjoy creating and following schedules", dimension: "JP", direction: "J" },
  { text: "I prefer flexibility over structure", dimension: "JP", direction: "P" },
  { text: "I like to have things settled and decided", dimension: "JP", direction: "J" },
  { text: "I enjoy improvising and adapting", dimension: "JP", direction: "P" },
  { text: "I prefer clear expectations and guidelines", dimension: "JP", direction: "J" },
  { text: "I value predictability and stability", dimension: "JP", direction: "J" }
];

const LIKERT_OPTIONS = [
  { score: 1, label: 'Disagree' },
  { score: 2, label: 'Slightly Disagree' },
  { score: 3, label: 'Neutral' },
  { score: 4, label: 'Slightly Agree' },
  { score: 5, label: 'Agree' }
];

interface TypeDetails {
  title: string;
  description: string;
  strengths: string[];
  opportunities: string[];
  careers: string[];
  cognitiveStack: {
    dominant: string;
    auxiliary: string;
    tertiary: string;
    inferior: string;
  };
  compatibility: {
    best: string[];
    good: string[];
    challenges: string[];
  };
  famousPeople: string[];
}

const TYPE_DATABASE: Record<string, TypeDetails> = {
  INTJ: {
    title: 'The Architect',
    description: 'Analytical, strategic, and logical. You are a long-term planner with high standards, driven to transform complex ideas into structured realities.',
    strengths: ['Strategic analysis', 'Systematic thinking', 'High independence', 'Decisiveness'],
    opportunities: ['Can appear emotionally distant', 'Impatience with unstructured work', 'Prone to over-complicating relationships'],
    careers: ['Systems Architect', 'Strategic Planner', 'Financial Analyst', 'Research Scientist', 'Software Engineer'],
    cognitiveStack: { dominant: 'Introverted Intuition (Ni)', auxiliary: 'Extraverted Thinking (Te)', tertiary: 'Introverted Feeling (Fi)', inferior: 'Extraverted Sensing (Se)' },
    compatibility: { best: ['ENFP', 'ENTP'], good: ['INFJ', 'ENTJ'], challenges: ['ESFJ', 'ISFJ'] },
    famousPeople: ['Elon Musk', 'Stephen Hawking', 'Michelle Obama', 'Nikola Tesla']
  },
  INTP: {
    title: 'The Thinker',
    description: 'Philosophical, objective, and curious. You love exploring theoretical systems, uncovering hidden patterns, and analyzing how the universe operates.',
    strengths: ['Theoretical problem-solving', 'Creative ingenuity', 'Objective analysis', 'Open-mindedness'],
    opportunities: ['Difficulty with routine tasks', 'Tendency to overthink', 'May struggle to communicate complex thoughts simply'],
    careers: ['Research Scientist', 'Software Developer', 'Systems Analyst', 'Professor', 'Forensic Investigator'],
    cognitiveStack: { dominant: 'Introverted Thinking (Ti)', auxiliary: 'Extraverted Intuition (Ne)', tertiary: 'Introverted Sensing (Si)', inferior: 'Extraverted Feeling (Fe)' },
    compatibility: { best: ['ENTJ', 'ENFJ'], good: ['INTJ', 'ENTP'], challenges: ['ESFJ', 'ESTJ'] },
    famousPeople: ['Albert Einstein', 'Bill Gates', 'Marie Curie', 'Charles Darwin']
  },
  ENTJ: {
    title: 'The Commander',
    description: 'Decisive, assertive, and visionary. You are a natural leader who excels at organizing resources, building efficient systems, and executing plans.',
    strengths: ['Organized leadership', 'Decisive execution', 'High efficiency', 'Constructive vision'],
    opportunities: ['Can seem overly dominating', 'Impatience with inefficiencies', 'Difficulty expressing soft empathy'],
    careers: ['Executive Director', 'Management Consultant', 'Venture Capitalist', 'Project Manager', 'Attorney'],
    cognitiveStack: { dominant: 'Extraverted Thinking (Te)', auxiliary: 'Introverted Intuition (Ni)', tertiary: 'Extraverted Sensing (Se)', inferior: 'Introverted Feeling (Fi)' },
    compatibility: { best: ['INTP', 'INFP'], good: ['ENFJ', 'ENTP'], challenges: ['ISFP', 'INFP'] },
    famousPeople: ['Steve Jobs', 'Margaret Thatcher', 'Franklin D. Roosevelt', 'Gordon Ramsay']
  },
  ENTP: {
    title: 'The Debater',
    description: 'Innovative, witty, and outspoken. You enjoy intellectual challenges, debating ideas, brainstorming alternative solutions, and exploring possibilities.',
    strengths: ['Adaptability', 'Out-of-the-box thinking', 'Excellent verbal communication', 'Quick learning'],
    opportunities: ['Struggles with project follow-through', 'Can be argumentative', 'Dislikes structured routines'],
    careers: ['Entrepreneur', 'Marketing Director', 'Product Manager', 'Creative Director', 'Consultant'],
    cognitiveStack: { dominant: 'Extraverted Intuition (Ne)', auxiliary: 'Introverted Thinking (Ti)', tertiary: 'Extraverted Feeling (Fe)', inferior: 'Introverted Sensing (Si)' },
    compatibility: { best: ['INFJ', 'INTJ'], good: ['ENFP', 'ENTJ'], challenges: ['ISFJ', 'ISTJ'] },
    famousPeople: ['Mark Twain', 'Thomas Edison', 'Celine Dion', 'Walt Disney']
  },
  INFJ: {
    title: 'The Advocate',
    description: 'Insightful, empathetic, and idealistic. You are deep-thinking and value-driven, dedicated to helping others and creating positive global changes.',
    strengths: ['Empathy & understanding', 'Value alignment', 'Creative vision', 'Insightful connection'],
    opportunities: ['Prone to burnout', 'Extremely high expectations of others', 'Highly sensitive to conflict'],
    careers: ['Clinical Psychologist', 'Writer / Editor', 'Educational Consultant', 'Human Resources Director', 'Social Worker'],
    cognitiveStack: { dominant: 'Introverted Intuition (Ni)', auxiliary: 'Extraverted Feeling (Fe)', tertiary: 'Introverted Thinking (Ti)', inferior: 'Extraverted Sensing (Se)' },
    compatibility: { best: ['ENFP', 'ENTP'], good: ['INFP', 'ENFJ'], challenges: ['ESTP', 'ESFP'] },
    famousPeople: ['Martin Luther King Jr.', 'Nelson Mandela', 'Mother Teresa', 'Carl Jung']
  },
  INFP: {
    title: 'The Mediator',
    description: 'Poetic, loyal, and altruistic. You seek harmony, hold strong personal values, and express yourself through creative avenues and helping others.',
    strengths: ['Strong values', 'Creative empathy', 'Open-mindedness', 'Dedicated support'],
    opportunities: ['Can be overly idealistic', 'Takes criticism personally', 'Neglects practical details'],
    careers: ['Novelist', 'Fine Artist', 'Mental Health Counselor', 'Human Rights Advocate', 'Teacher'],
    cognitiveStack: { dominant: 'Introverted Feeling (Fi)', auxiliary: 'Extraverted Intuition (Ne)', tertiary: 'Introverted Sensing (Si)', inferior: 'Extraverted Thinking (Te)' },
    compatibility: { best: ['ENFJ', 'ENTJ'], good: ['INFJ', 'ENFP'], challenges: ['ESTJ', 'ISTJ'] },
    famousPeople: ['William Shakespeare', 'J.R.R. Tolkien', 'Princess Diana', 'Keanu Reeves']
  },
  ENFJ: {
    title: 'The Protagonist',
    description: 'Inspiring, charismatic, and social. You are driven by empathy and connection, naturally supporting others to achieve their potential.',
    strengths: ['Inspiring communication', 'High emotional intelligence', 'Organizing people', 'Compassion'],
    opportunities: ['Can be overly self-sacrificing', 'Prone to taking on others\' stress', 'May become overprotective'],
    careers: ['Teacher / Professor', 'Nonprofit Director', 'Public Relations Specialist', 'Counselor', 'HR Manager'],
    cognitiveStack: { dominant: 'Extraverted Feeling (Fe)', auxiliary: 'Introverted Intuition (Ni)', tertiary: 'Extraverted Sensing (Se)', inferior: 'Introverted Thinking (Ti)' },
    compatibility: { best: ['INFP', 'ISFP'], good: ['ENFP', 'INFJ'], challenges: ['ISTP', 'ESTP'] },
    famousPeople: ['Barack Obama', 'Oprah Winfrey', 'Malala Yousafzai', 'Tony Robbins']
  },
  ENFP: {
    title: 'The Campaigner',
    description: 'Passionate, energetic, and free-spirited. You see life as full of possibilities, connecting with others through shared ideals and excitement.',
    strengths: ['Enthusiasm & energy', 'Creative thinking', 'Interpersonal skills', 'Highly adaptable'],
    opportunities: ['Struggles to stay organized', 'Easily distracted', 'Requires constant validation'],
    careers: ['Creative Director', 'Public Relations Specialist', 'Event Planner', 'Journalist', 'Entrepreneur'],
    cognitiveStack: { dominant: 'Extraverted Intuition (Ne)', auxiliary: 'Introverted Feeling (Fi)', tertiary: 'Extraverted Thinking (Te)', inferior: 'Introverted Sensing (Si)' },
    compatibility: { best: ['INFJ', 'INTJ'], good: ['ENFP', 'INFP'], challenges: ['ISTJ', 'ESTJ'] },
    famousPeople: ['Robin Williams', 'Walt Disney', 'Quentin Tarantino', 'Robert Downey Jr.']
  },
  ISTJ: {
    title: 'The Logistician',
    description: 'Responsible, orderly, and realistic. You value loyalty, rule-following, and concrete data, working systematically to complete duties.',
    strengths: ['Reliability', 'Precision & accuracy', 'Honesty & directness', 'High structure'],
    opportunities: ['Can be stubborn', 'Difficulty adjusting to sudden change', 'Reluctant to take risks'],
    careers: ['Accountant', 'Military Officer', 'Data Analyst', 'Software QA Engineer', 'Administrator'],
    cognitiveStack: { dominant: 'Introverted Sensing (Si)', auxiliary: 'Extraverted Thinking (Te)', tertiary: 'Introverted Feeling (Fi)', inferior: 'Extraverted Intuition (Ne)' },
    compatibility: { best: ['ESFP', 'ESTP'], good: ['ISFJ', 'ESTJ'], challenges: ['ENFP', 'INFP'] },
    famousPeople: ['George Washington', 'Angela Merkel', 'Warren Buffett', 'Queen Elizabeth II']
  },
  ISFJ: {
    title: 'The Protector',
    description: 'Warm, loyal, and supportive. You are dedicated protectors who build stable environments, care for details, and help others quietly.',
    strengths: ['Practical supportiveness', 'Loyalty & dedication', 'Attention to detail', 'Organization'],
    opportunities: ['Overly modest & self-dismissing', 'Reluctant to change established habits', 'Difficulty saying no'],
    careers: ['Nurse', 'Elementary School Teacher', 'Social Worker', 'Administrative Manager', 'Customer Support Specialist'],
    cognitiveStack: { dominant: 'Introverted Sensing (Si)', auxiliary: 'Extraverted Feeling (Fe)', tertiary: 'Introverted Thinking (Ti)', inferior: 'Extraverted Intuition (Ne)' },
    compatibility: { best: ['ESFP', 'ESTP'], good: ['ISTJ', 'ISFP'], challenges: ['ENTP', 'INTP'] },
    famousPeople: ['Mother Teresa', 'Beyoncé', 'Kate Middleton', 'Rosa Parks']
  },
  ESTJ: {
    title: 'The Executive',
    description: 'Methodical, traditional, and efficient. You are direct organizers who value order, social standards, and realistic execution.',
    strengths: ['Orderly leadership', 'Systematic organization', 'Strong dedication', 'Clear reliability'],
    opportunities: ['Inflexible or rigid', 'Can judge others too quickly', 'Struggles to express emotional support'],
    careers: ['Operations Director', 'Financial Manager', 'Police Officer', 'Project Lead', 'Sales Manager'],
    cognitiveStack: { dominant: 'Extraverted Thinking (Te)', auxiliary: 'Introverted Sensing (Si)', tertiary: 'Extraverted Intuition (Ne)', inferior: 'Introverted Feeling (Fi)' },
    compatibility: { best: ['ISFP', 'INFP'], good: ['ISTJ', 'ESFJ'], challenges: ['INFP', 'ENFP'] },
    famousPeople: ['John D. Rockefeller', 'Sonia Sotomayor', 'Sandra Day O\'Connor', 'Alec Baldwin']
  },
  ESFJ: {
    title: 'The Consul',
    description: 'Conscientious, social, and cooperative. You value harmony, loyalty, and structured support networks, seeking to meet people\'s needs.',
    strengths: ['Interpersonal warmth', 'Strong organizational skills', 'Practical help', 'Loyalty'],
    opportunities: ['Needy of validation', 'Struggles with conflict or criticism', 'Reluctant to step outside social expectations'],
    careers: ['HR Specialist', 'Teacher', 'Public Relations Manager', 'Healthcare Administrator', 'Real Estate Agent'],
    cognitiveStack: { dominant: 'Extraverted Feeling (Fe)', auxiliary: 'Introverted Sensing (Si)', tertiary: 'Extraverted Intuition (Ne)', inferior: 'Introverted Thinking (Ti)' },
    compatibility: { best: ['ISFP', 'ISTP'], good: ['ESTJ', 'ISFJ'], challenges: ['INTJ', 'INTP'] },
    famousPeople: ['Taylor Swift', 'Bill Clinton', 'Anne Hathaway', 'Jennifer Lopez']
  },
  ISTP: {
    title: 'The Virtuoso',
    description: 'Experimental, pragmatic, and analytical. You are hands-on creators who love building, tinkering, and solving physical or mechanical problems.',
    strengths: ['Hands-on versatility', 'Logical problem-solving', 'Calm under crisis', 'Pragmatism'],
    opportunities: ['Private & hard to get close to', 'Easily bored by theory', 'Can take risky chances'],
    careers: ['Mechanical Engineer', 'Forensic Examiner', 'Software Engineer', 'Pilot', 'Firefighter'],
    cognitiveStack: { dominant: 'Introverted Thinking (Ti)', auxiliary: 'Extraverted Sensing (Se)', tertiary: 'Introverted Intuition (Ni)', inferior: 'Extraverted Feeling (Fe)' },
    compatibility: { best: ['ESFJ', 'ESTJ'], good: ['ISFP', 'ESTP'], challenges: ['ENFJ', 'INFJ'] },
    famousPeople: ['Tom Cruise', 'Michael Jordan', 'Clint Eastwood', 'Steve McQueen']
  },
  ISFP: {
    title: 'The Adventurer',
    description: 'Charming, creative, and gentle. You live in the present, enjoying artistic expression, physical beauty, and peaceful interactions.',
    strengths: ['Artistic expression', 'Warm empathy', 'Adaptability', 'Practical creativity'],
    opportunities: ['Highly independent to a fault', 'Struggles with abstract theories', 'Prone to stress overload'],
    careers: ['Fashion Designer', 'Chef', 'Veterinarian', 'Graphic Artist', 'Physical Therapist'],
    cognitiveStack: { dominant: 'Introverted Feeling (Fi)', auxiliary: 'Extraverted Sensing (Se)', tertiary: 'Introverted Intuition (Ni)', inferior: 'Extraverted Thinking (Te)' },
    compatibility: { best: ['ESFJ', 'ENFJ'], good: ['ISFP', 'ISTP'], challenges: ['ENTJ', 'INTJ'] },
    famousPeople: ['Michael Jackson', 'Frida Kahlo', 'Britney Spears', 'Lana Del Rey']
  },
  ESTP: {
    title: 'The Entrepreneur',
    description: 'Action-oriented, social, and bold. You are energetic problem-solvers who enjoy immediate results, physical challenges, and navigating social groups.',
    strengths: ['Bold action', 'Sharp social perception', 'High resourcefulness', 'Direct communication'],
    opportunities: ['Can behave recklessly', 'Dislikes long-term structure', 'May miss emotional nuance'],
    careers: ['Sales Director', 'Entrepreneur', 'Marketing Executive', 'Stock Trader', 'Emergency Coordinator'],
    cognitiveStack: { dominant: 'Extraverted Sensing (Se)', auxiliary: 'Introverted Thinking (Ti)', tertiary: 'Extraverted Feeling (Fe)', inferior: 'Introverted Intuition (Ni)' },
    compatibility: { best: ['ISFJ', 'ISTJ'], good: ['ESTP', 'ESFP'], challenges: ['INFJ', 'INTJ'] },
    famousPeople: ['Donald Trump', 'Madonna', 'Ernest Hemingway', 'Bruce Willis']
  },
  ESFP: {
    title: 'The Entertainer',
    description: 'Spontaneous, playful, and enthusiastic. You live in the moment, bringing energy and connection to everyone around you.',
    strengths: ['Playful enthusiasm', 'Interpersonal skills', 'Practical realism', 'Adaptability'],
    opportunities: ['Struggles to plan ahead', 'Avoids analytical conflict', 'Prone to distraction'],
    careers: ['Actor / Performer', 'Event Coordinator', 'Sales Specialist', 'HR Recruiter', 'Travel Guide'],
    cognitiveStack: { dominant: 'Extraverted Sensing (Se)', auxiliary: 'Introverted Feeling (Fi)', tertiary: 'Extraverted Thinking (Te)', inferior: 'Introverted Intuition (Ni)' },
    compatibility: { best: ['ISFJ', 'ISTJ'], good: ['ESFP', 'ESTP'], challenges: ['INTJ', 'INFJ'] },
    famousPeople: ['Elvis Presley', 'Marilyn Monroe', 'Cristiano Ronaldo', 'Steven Spielberg']
  }
};

interface DimensionScores {
  EI: number;
  SN: number;
  TF: number;
  JP: number;
}

interface UserAnswer {
  questionIdx: number;
  rating: number; // 1-5
}

export default function MBTICalculator() {
  const [stage, setStage] = useState<'intro' | 'quiz' | 'results'>('intro');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  // Scoring state
  const [calculatedType, setCalculatedType] = useState<string>('INTJ');
  const [dimensionPercentages, setDimensionPercentages] = useState({
    E: 50, I: 50,
    S: 50, N: 50,
    T: 50, F: 50,
    J: 50, P: 50
  });
  const [steps, setSteps] = useState<string[]>([]);

  // AI Integration states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiNarrative, setAiNarrative] = useState<string>('');
  const [aiError, setAiError] = useState<string>('');
  const aiSectionRef = useRef<HTMLDivElement>(null);

  // Monitor keyboard stroke listeners for numerical hotkeys (1-5)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (stage !== 'quiz') return;
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const rating = parseInt(e.key);
        handleSelectRating(rating);
      } else if (e.key === 'Backspace' || e.key === 'ArrowLeft') {
        handleBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, currentQuestionIdx, answers]);

  const handleSelectRating = (rating: number) => {
    const updatedAnswers = { ...answers, [currentQuestionIdx]: rating };
    setAnswers(updatedAnswers);

    if (currentQuestionIdx < QUESTIONS.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      evaluateMBTI(updatedAnswers);
    }
  };

  const handleBack = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    }
  };

  const startTest = () => {
    setAnswers({});
    setCurrentQuestionIdx(0);
    setStage('quiz');
    setCalculatedType('INTJ');
    setAiNarrative('');
    setAiError('');
  };

  const evaluateMBTI = (finalAnswers: Record<number, number>) => {
    // We compute the raw scores based on our direction logic
    let totalScoreFirst = { EI: 0, SN: 0, TF: 0, JP: 0 };
    let totalScoreSecond = { EI: 0, SN: 0, TF: 0, JP: 0 };

    QUESTIONS.forEach((q, idx) => {
      const rating = finalAnswers[idx] ?? 3; // Neutral default

      // Determine points: strongly agree (5) adds 2 to rating category, agree (4) adds 1, neutral (3) adds 0, disagree (2) adds 1 to opposing, strongly disagree (1) adds 2 to opposing.
      let pointsFirst = 0;
      let pointsSecond = 0;

      if (rating === 5) pointsFirst = 2;
      else if (rating === 4) pointsFirst = 1;
      else if (rating === 2) pointsSecond = 1;
      else if (rating === 1) pointsSecond = 2;

      // Assign scores based on dimension and direction
      // Dimension traits: EI (E vs I), SN (S vs N), TF (T vs F), JP (J vs P)
      const traitGroup = q.dimension;
      const isFirstTrait = (q.direction === 'E' || q.direction === 'S' || q.direction === 'T' || q.direction === 'J');

      if (isFirstTrait) {
        totalScoreFirst[traitGroup] += pointsFirst;
        totalScoreSecond[traitGroup] += pointsSecond;
      } else {
        totalScoreSecond[traitGroup] += pointsFirst;
        totalScoreFirst[traitGroup] += pointsSecond;
      }
    });

    // Compute percentages
    const calcPercentage = (firstVal: number, secondVal: number) => {
      const total = firstVal + secondVal;
      if (total === 0) return { first: 50, second: 50 };
      const firstPct = Math.round((firstVal / total) * 100);
      return { first: firstPct, second: 100 - firstPct };
    };

    const pctEI = calcPercentage(totalScoreFirst.EI, totalScoreSecond.EI); // E vs I
    const pctSN = calcPercentage(totalScoreFirst.SN, totalScoreSecond.SN); // S vs N
    const pctTF = calcPercentage(totalScoreFirst.TF, totalScoreSecond.TF); // T vs F
    const pctJP = calcPercentage(totalScoreFirst.JP, totalScoreSecond.JP); // J vs P

    const finalE = pctEI.first;
    const finalI = pctEI.second;
    const finalS = pctSN.first;
    const finalN = pctSN.second;
    const finalT = pctTF.first;
    const finalF = pctTF.second;
    const finalJ = pctJP.first;
    const finalP = pctJP.second;

    setDimensionPercentages({
      E: finalE, I: finalI,
      S: finalS, N: finalN,
      T: finalT, F: finalF,
      J: finalJ, P: finalP
    });

    const mbtiString = [
      finalE >= finalI ? 'E' : 'I',
      finalS >= finalN ? 'S' : 'N',
      finalT >= finalF ? 'T' : 'F',
      finalJ >= finalP ? 'J' : 'P'
    ].join('');

    setCalculatedType(mbtiString);

    // Build LaTeX resolution step explanations
    const stepsArr: string[] = [
      '**Step 1: Sum raw points for each dimension preference**',
      `* **Extraversion vs Introversion**: $S_{\\text{E}} = ${totalScoreFirst.EI}$, $S_{\\text{I}} = ${totalScoreSecond.EI}$`,
      `* **Sensing vs Intuition**: $S_{\\text{S}} = ${totalScoreFirst.SN}$, $S_{\\text{N}} = ${totalScoreSecond.SN}$`,
      `* **Thinking vs Feeling**: $S_{\\text{T}} = ${totalScoreFirst.TF}$, $S_{\\text{F}} = ${totalScoreSecond.TF}$`,
      `* **Judging vs Perceiving**: $S_{\\text{J}} = ${totalScoreFirst.JP}$, $S_{\\text{P}} = ${totalScoreSecond.JP}$`,
      '\n**Step 2: Calculate percentage bias**',
      `$$P_{\\text{Extraversion}} = \\frac{S_{\\text{E}}}{S_{\\text{E}} + S_{\\text{I}}} \\times 100\\% = \\frac{${totalScoreFirst.EI}}{${totalScoreFirst.EI} + ${totalScoreSecond.EI}} \\times 100\\% = ${finalE}\\%$$`,
      `$$P_{\\text{Intuition}} = \\frac{S_{\\text{N}}}{S_{\\text{S}} + S_{\\text{N}}} \\times 100\\% = \\frac{${totalScoreSecond.SN}}{${totalScoreFirst.SN} + ${totalScoreSecond.SN}} \\times 100\\% = ${finalN}\\%$$`,
      `$$P_{\\text{Thinking}} = \\frac{S_{\\text{T}}}{S_{\\text{T}} + S_{\\text{F}}} \\times 100\\% = \\frac{${totalScoreFirst.TF}}{${totalScoreFirst.TF} + ${totalScoreSecond.TF}} \\times 100\\% = ${finalT}\\%$$`,
      `$$P_{\\text{Judging}} = \\frac{S_{\\text{J}}}{S_{\\text{J}} + S_{\\text{P}}} \\times 100\\% = \\frac{${totalScoreFirst.JP}}{${totalScoreFirst.JP} + ${totalScoreSecond.JP}} \\times 100\\% = ${finalJ}\\%$$`,
      '\n**Step 3: Map highest-scoring trait to code letters**',
      `* E (${finalE}%) vs I (${finalI}%) $\\rightarrow$ **${finalE >= finalI ? 'E' : 'I'}**`,
      `* S (${finalS}%) vs N (${finalN}%) $\\rightarrow$ **${finalS >= finalN ? 'S' : 'N'}**`,
      `* T (${finalT}%) vs F (${finalF}%) $\\rightarrow$ **${finalT >= finalF ? 'T' : 'F'}**`,
      `* J (${finalJ}%) vs P (${finalP}%) $\\rightarrow$ **${finalJ >= finalP ? 'J' : 'P'}**`,
      `* Mapped Personality Type: **${mbtiString}** (${TYPE_DATABASE[mbtiString]?.title || 'Personality Type'})`
    ];

    setSteps(stepsArr);
    setStage('results');

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#1a1a1a', '#1e293b', '#334155', '#475569']
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
      script.onerror = () => reject(new Error('Failed to load PDF library'));
      document.head.appendChild(script);
    });
  };

  const downloadResults = async () => {
    setIsDownloading(true);
    try {
      if (!(window as any).jsPDF) {
        await loadPDFLibraries();
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

    logoImg.onload = function () {
      const imgWidth = 40;
      const imgHeight = (logoImg.height * imgWidth) / logoImg.width;
      doc.addImage(logoImg, 'PNG', (doc.internal.pageSize.width - imgWidth) / 2, 10, imgWidth, imgHeight);

      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('MBTI Personality Assessment Report', 105, imgHeight + 25, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, imgHeight + 33, { align: 'center' });

      generatePDFContent(doc, imgHeight + 45);
    };

    logoImg.onerror = function () {
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('MBTI Personality Assessment Report', 105, 25, { align: 'center' });

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

    const details = TYPE_DATABASE[calculatedType] || TYPE_DATABASE.INTJ;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Result Type: ${calculatedType} - ${details.title}`, 20, startY);

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    let yPos = startY + 12;

    yPos = wrapText(details.description, 170, 20, yPos, doc);
    yPos += 10;

    // Add trait percentages
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Personality Dimension Breakdown:', 20, yPos);
    yPos += 8;

    doc.setFontSize(10.5);
    doc.setFont(undefined, 'normal');
    doc.text(`• Extraversion (${dimensionPercentages.E}%) vs Introversion (${dimensionPercentages.I}%)`, 25, yPos);
    yPos += 7;
    doc.text(`• Sensing (${dimensionPercentages.S}%) vs Intuition (${dimensionPercentages.N}%)`, 25, yPos);
    yPos += 7;
    doc.text(`• Thinking (${dimensionPercentages.T}%) vs Feeling (${dimensionPercentages.F}%)`, 25, yPos);
    yPos += 7;
    doc.text(`• Judging (${dimensionPercentages.J}%) vs Perceiving (${dimensionPercentages.P}%)`, 25, yPos);
    yPos += 14;

    yPos = checkPageBreak(yPos, doc);

    // Strengths
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Key Strengths:', 20, yPos);
    yPos += 8;

    doc.setFontSize(10.5);
    doc.setFont(undefined, 'normal');
    details.strengths.forEach((st) => {
      doc.text(`• ${st}`, 25, yPos);
      yPos += 7;
    });
    yPos += 8;

    yPos = checkPageBreak(yPos, doc);

    // Growth Opportunities
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Growth Areas:', 20, yPos);
    yPos += 8;

    doc.setFontSize(10.5);
    doc.setFont(undefined, 'normal');
    details.opportunities.forEach((op) => {
      doc.text(`• ${op}`, 25, yPos);
      yPos += 7;
    });
    yPos += 8;

    yPos = checkPageBreak(yPos, doc);

    // Famous People
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Famous Figures of this Type:', 20, yPos);
    yPos += 8;

    doc.setFontSize(10.5);
    doc.setFont(undefined, 'normal');
    details.famousPeople.forEach((pep) => {
      doc.text(`• ${pep}`, 25, yPos);
      yPos += 7;
    });
    yPos += 14;

    yPos = checkPageBreak(yPos, doc);

    if (aiNarrative) {
      const formattedHtml = formatAIResponse(aiNarrative);
      const sections = extractSectionsFromHTML(formattedHtml);

      doc.setFontSize(13);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(15, 23, 42); // Primary dark slate
      doc.text('AI Deep Psychological Profile & Coping Advice', 20, yPos);
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
        doc.setTextColor(71, 85, 105);

        yPos = wrapText(section.content, 170, 20, yPos, doc);
        yPos += 8;
      }
    }

    yPos = checkPageBreak(yPos + 10, doc);

    // Disclaimer
    doc.setFontSize(8.5);
    doc.setTextColor(120, 120, 120);
    const disclaimer = 'IMPORTANT DISCLAIMER: This assessment is an educational evaluation tool based on Myers-Briggs Type Indicator concepts. Results may contain errors and do not replace evaluation by a certified MBTI professional or psychologist.';
    yPos = wrapText(disclaimer, 170, 20, yPos, doc);

    doc.save(`mbti-${calculatedType.toLowerCase()}-personality-report.pdf`);
  };

  const handleGenerateAiReport = async () => {
    setIsGenerating(true);
    setAiError('');
    setAiNarrative('');

    try {
      const response = await fetch('/api/ai/analyze-mbti', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: calculatedType,
          scores: {
            EI: dimensionPercentages.I - dimensionPercentages.E,
            SN: dimensionPercentages.N - dimensionPercentages.S,
            TF: dimensionPercentages.F - dimensionPercentages.T,
            JP: dimensionPercentages.P - dimensionPercentages.J
          }
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

  const details = TYPE_DATABASE[calculatedType] || TYPE_DATABASE.INTJ;

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800 animate-fade-in">

      {/* Disclaimer Alert */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex items-start space-x-3 text-left">
        <i className="fas fa-info-circle text-slate-800 text-base mt-0.5"></i>
        <div className="space-y-1">
          <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider block">Assessment Disclaimer</span>
          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
            This MBTI-style assessment is for educational, self-reflection, and screening purposes only. It is not a definitive psychological diagnosis or career binding tool. Answer naturally and honestly to discover your core personality preferences.
          </p>
        </div>
      </div>

      {/* Intro Stage */}
      {stage === 'intro' && (
        <div className="space-y-6 max-w-2xl mx-auto py-6 text-center">
          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white text-2xl mx-auto shadow-md">
            <i className="fas fa-user-friends"></i>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 font-display">
              MBTI Personality Evaluation
            </h2>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Explore your cognitive styles, decision-making preferences, relationship dynamics, and career fits across four main scales: Extraversion vs. Introversion, Sensing vs. Intuition, Thinking vs. Feeling, and Judging vs. Perceiving.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 text-left pt-2">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-[9px] font-black text-slate-900 uppercase block">E vs I</span>
              <p className="text-[8px] text-slate-500 leading-tight font-medium">Focus: Extraversion (outer world) or Introversion (inner world recharge).</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-[9px] font-black text-slate-900 uppercase block">S vs N</span>
              <p className="text-[8px] text-slate-500 leading-tight font-medium">Information: Sensing (details & facts) or Intuition (abstract links).</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-[9px] font-black text-slate-900 uppercase block">T vs F</span>
              <p className="text-[8px] text-slate-500 leading-tight font-medium">Decisions: Thinking (logic analysis) or Feeling (harmony & values).</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-[9px] font-black text-slate-900 uppercase block">J vs P</span>
              <p className="text-[8px] text-slate-500 leading-tight font-medium">Lifestyle: Judging (structure/routine) or Perceiving (flexibility).</p>
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            <button
              type="button"
              onClick={startTest}
              className="py-3.5 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all active:scale-95 cursor-pointer shadow-md text-sm"
            >
              Start Personality Assessment
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
                QUESTIONS[currentQuestionIdx].dimension === 'EI' ? 'Extraversion vs. Introversion' :
                  QUESTIONS[currentQuestionIdx].dimension === 'SN' ? 'Sensing vs. Intuition' :
                    QUESTIONS[currentQuestionIdx].dimension === 'TF' ? 'Thinking vs. Feeling' : 'Judging vs. Perceiving'
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

          {/* User selection buttons: Likert nodes 1 to 5 */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {LIKERT_OPTIONS.map((option) => {
              const isSelected = answers[currentQuestionIdx] === option.score;
              return (
                <button
                  key={option.score}
                  type="button"
                  onClick={() => handleSelectRating(option.score)}
                  className={`py-3.5 px-3 border rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center space-y-1.5 shadow-sm ${isSelected
                      ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-900 text-slate-800'
                    }`}
                >
                  <span className={`text-base font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>{option.score}</span>
                  <span className={`text-[9px] font-extrabold text-center block uppercase tracking-wider leading-tight ${isSelected ? 'text-slate-200' : 'text-slate-505'}`}>{option.label}</span>
                </button>
              );
            })}
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
                Shortcut Hotkeys:
              </span>
              <div className="flex space-x-1">
                {['1', '2', '3', '4', '5'].map((h) => (
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
              onClick={() => handleSelectRating(3)}
              className="py-2.5 px-5 border border-slate-200 rounded-xl font-bold text-xs text-slate-650 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            >
              Skip (Neutral)
            </button>
          </div>

        </div>
      )}

      {/* Results Stage */}
      {stage === 'results' && (
        <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-left shadow-lg relative overflow-hidden animate-fade-in-up">
          {/* Watermark */}
          <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
            <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">MBTI</span>
          </div>
          <div className="relative z-10 space-y-8">

            {/* Header Summary Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-white/10 gap-6 text-left">
              <div>
                <h2 className="text-3xl font-black text-white font-display">
                  {calculatedType} &ndash; {details.title}
                </h2>
                <p className="text-sm text-slate-400 font-semibold mt-0.5">
                  Your evaluated Myers-Briggs personality profile breakdown.
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={downloadResults}
                  disabled={isDownloading}
                  className="py-3 px-5 bg-white/10 hover:bg-white/15 disabled:bg-white/5 text-white rounded-2xl font-bold text-xs transition-all flex items-center space-x-2 cursor-pointer shrink-0 shadow-md"
                >
                  <i className="fas fa-download text-[10px]"></i>
                  <span>{isDownloading ? 'Generating...' : 'Download PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={startTest}
                  className="py-3 px-5 border border-white/10 hover:bg-white/10 rounded-2xl font-bold text-xs text-slate-300 transition-all flex items-center space-x-2 cursor-pointer shrink-0"
                >
                  <i className="fas fa-redo text-[10px]"></i>
                  <span>Retake Test</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Left Column: Personality Description Card */}
              <div className="flex flex-col bg-white/5 p-6 rounded-3xl border border-white/10 justify-between text-left space-y-4">
                <div>
                  <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block mb-1">
                    Profile Overview
                  </span>
                  <h3 className="text-lg font-black text-white font-display mb-3">
                    About {details.title}
                  </h3>
                  <p className="text-sm text-slate-300 font-medium leading-relaxed">
                    {details.description}
                  </p>
                </div>

                {/* Famous figures list */}
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <span className="text-xs text-slate-400 font-black uppercase block tracking-wider">
                    Famous {calculatedType}s
                  </span>
                  <ul className="text-xs text-slate-300 font-semibold space-y-1">
                    {details.famousPeople.map((fp, i) => (
                      <li key={i} className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/30 shrink-0"></span>
                        <span>{fp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Columns: Trait percentages bars & details */}
              <div className="lg:col-span-2 space-y-6 text-left">

                {/* Trait bars */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Dimension Preferences Breakdown
                  </h3>

                  <div className="space-y-3.5">
                    {/* E vs I */}
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-2">
                      <div className="flex justify-between items-center text-sm font-black text-white">
                        <span>Extraversion ({dimensionPercentages.E}%)</span>
                        <span>Introversion ({dimensionPercentages.I}%)</span>
                      </div>
                      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden flex">
                        <div className="h-full bg-white/40" style={{ width: `${dimensionPercentages.E}%` }} />
                        <div className="h-full bg-white/20" style={{ width: `${dimensionPercentages.I}%` }} />
                      </div>
                    </div>

                    {/* S vs N */}
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-2">
                      <div className="flex justify-between items-center text-sm font-black text-white">
                        <span>Sensing ({dimensionPercentages.S}%)</span>
                        <span>Intuition ({dimensionPercentages.N}%)</span>
                      </div>
                      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden flex">
                        <div className="h-full bg-white/40" style={{ width: `${dimensionPercentages.S}%` }} />
                        <div className="h-full bg-white/20" style={{ width: `${dimensionPercentages.N}%` }} />
                      </div>
                    </div>

                    {/* T vs F */}
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-2">
                      <div className="flex justify-between items-center text-sm font-black text-white">
                        <span>Thinking ({dimensionPercentages.T}%)</span>
                        <span>Feeling ({dimensionPercentages.F}%)</span>
                      </div>
                      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden flex">
                        <div className="h-full bg-white/40" style={{ width: `${dimensionPercentages.T}%` }} />
                        <div className="h-full bg-white/20" style={{ width: `${dimensionPercentages.F}%` }} />
                      </div>
                    </div>

                    {/* J vs P */}
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-2">
                      <div className="flex justify-between items-center text-sm font-black text-white">
                        <span>Judging ({dimensionPercentages.J}%)</span>
                        <span>Perceiving ({dimensionPercentages.P}%)</span>
                      </div>
                      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden flex">
                        <div className="h-full bg-white/40" style={{ width: `${dimensionPercentages.J}%` }} />
                        <div className="h-full bg-white/20" style={{ width: `${dimensionPercentages.P}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Strengths & Growth Areas Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
                    <h4 className="text-sm font-black text-white uppercase tracking-wide">Key Strengths</h4>
                    <ul className="text-xs text-slate-300 space-y-1.5">
                      {details.strengths.map((str, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <i className="fas fa-check text-slate-300 mt-0.5 text-xs"></i>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
                    <h4 className="text-sm font-black text-white uppercase tracking-wide">Growth Opportunities</h4>
                    <ul className="text-xs text-slate-300 space-y-1.5">
                      {details.opportunities.map((opp, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <i className="fas fa-lightbulb text-slate-300 mt-0.5 text-xs"></i>
                          <span>{opp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>

            </div>

            {/* Cognitive Function Stack Section */}
            <div className="border-t border-white/10 pt-6 text-left space-y-4">
              <div>
                <h3 className="text-lg font-black text-white font-display">
                  Cognitive Functions Stack
                </h3>
                <p className="text-sm text-slate-400 font-semibold leading-relaxed">
                  The mental processes that define how your personality gathers information and processes decisions.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                <div className="p-4 border border-white/10 rounded-2xl bg-white/5 shadow-sm space-y-1">
                  <span className="text-xs font-black text-white uppercase tracking-wider block">Dominant Function</span>
                  <span className="text-sm font-black text-white block">{details.cognitiveStack.dominant}</span>
                </div>
                <div className="p-4 border border-white/10 rounded-2xl bg-white/5 shadow-sm space-y-1">
                  <span className="text-xs font-black text-white uppercase tracking-wider block">Auxiliary Function</span>
                  <span className="text-sm font-black text-white block">{details.cognitiveStack.auxiliary}</span>
                </div>
                <div className="p-4 border border-white/10 rounded-2xl bg-white/5 shadow-sm space-y-1">
                  <span className="text-xs font-black text-white uppercase tracking-wider block">Tertiary Function</span>
                  <span className="text-sm font-black text-white block">{details.cognitiveStack.tertiary}</span>
                </div>
                <div className="p-4 border border-white/10 rounded-2xl bg-white/5 shadow-sm space-y-1">
                  <span className="text-xs font-black text-white uppercase tracking-wider block">Inferior Function</span>
                  <span className="text-sm font-black text-white block">{details.cognitiveStack.inferior}</span>
                </div>
              </div>
            </div>

            {/* Compatibility & Careers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/10 pt-6 text-left">
              {/* Compatibility */}
              <div className="space-y-3">
                <h3 className="text-lg font-black text-white font-display">Relationship Compatibility</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs font-black text-white uppercase tracking-wider block mb-1">Optimal Romantic Matches</span>
                    <div className="flex gap-2">
                      {details.compatibility.best.map((item, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white/5 text-white font-extrabold rounded-lg border border-white/10 text-xs">{item}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">Strong Intellectual Connections</span>
                    <div className="flex gap-2">
                      {details.compatibility.good.map((item, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white/5 text-slate-300 font-extrabold rounded-lg border border-white/10 text-xs">{item}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-black text-white uppercase tracking-wider block mb-1">Potential Communication Friction</span>
                    <div className="flex gap-2">
                      {details.compatibility.challenges.map((item, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white/5 text-white font-extrabold rounded-lg border border-white/10 text-xs">{item}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Careers */}
              <div className="space-y-3">
                <h3 className="text-lg font-black text-white font-display">Recommended Careers</h3>
                <p className="text-sm text-slate-400 font-semibold leading-relaxed">
                  Work environments where this personality type typically excels and flourishes:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {details.careers.map((car, i) => (
                    <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-sm font-black text-white flex items-center space-x-1.5 shadow-sm">
                      <i className="fas fa-briefcase text-slate-400 text-xs"></i>
                      <span>{car}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Grounding Integration Panel */}
            <div className="border-t border-white/10 pt-8 space-y-6 text-left" ref={aiSectionRef}>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center text-sm">
                    <i className="fas fa-sparkles"></i>
                  </div>
                  <h3 className="text-lg font-black text-white font-display">
                    Deep AI Psychological Analysis
                  </h3>
                </div>
                <p className="text-sm text-slate-400 font-semibold leading-relaxed">
                  Generate an in-depth clinical personality report mapping your cognitive stacks, workplace strengths, interpersonal communication, and targeted personal development trajectories.
                </p>
              </div>

              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={handleGenerateAiReport}
                  disabled={isGenerating}
                  className="py-3 px-6 bg-white/10 hover:bg-white/15 disabled:bg-white/5 text-white rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-sm flex items-center space-x-2 shrink-0"
                >
                  {isGenerating ? (
                    <>
                      <i className="fas fa-spinner animate-spin text-[10px]"></i>
                      <span>Generating Profile...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sparkles text-[10px]"></i>
                      <span>Generate AI Personality Narrative</span>
                    </>
                  )}
                </button>
              </div>

              {/* Narrative container */}
              {aiError && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300 font-medium text-left flex items-start space-x-2">
                  <i className="fas fa-exclamation-circle text-slate-300 mt-0.5"></i>
                  <span>{aiError}</span>
                </div>
              )}

              {aiNarrative && (
                <div
                  className="p-6 bg-white/5 border border-white/10 rounded-2xl shadow-sm text-slate-300 text-sm leading-relaxed space-y-4 w-full prose prose-slate max-w-none animate-fade-in text-left"
                  style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                  dangerouslySetInnerHTML={{ __html: formatAIResponse(aiNarrative) }}
                />
              )}
            </div>

            {/* Steps and Resolution math details */}
            <div className="border-t border-white/10 pt-6 text-left space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-white/70">
                Step-by-Step Resolution Steps
              </h4>
              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1 text-sm text-white/70 leading-relaxed font-medium">
                {steps.map((step, idx) => {
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
                    <p key={idx} className={step.startsWith('**') ? 'font-black text-white pt-2 first:pt-0' : ''}>
                      {parts.length > 0 ? parts : cleanStep}
                    </p>
                  );
                })}
              </div>
            </div>

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
