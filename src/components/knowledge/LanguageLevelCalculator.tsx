'use client';

import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface Question {
  question: string;
  options: string[];
  correct: number;
}

interface Result {
  level: string;
  levelLabel: string;
  levelColor: string;
  score: number;
  total: number;
  percentage: number;
  description: string;
  recommendations: string;
  steps: string[];
}

const LANGUAGES = [
  { value: 'uk-english', label: 'English (UK)' },
  { value: 'us-english', label: 'English (US)' },
  { value: 'english', label: 'English (General)' },
  { value: 'french', label: 'French' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'german', label: 'German' },
  { value: 'arabic', label: 'Arabic' },
  { value: 'swiss', label: 'Swiss German' },
];

const QUESTIONS: Record<string, Question[]> = {
  'uk-english': [
    { question: "Choose the correct spelling:", options: ["colour", "color", "coulor", "coler"], correct: 0 },
    { question: "Select the British term: 'I need to fill my car with ___.'", options: ["petrol", "gas", "fuel", "benzin"], correct: 0 },
    { question: "Which is correct British English?", options: ["I will go to hospital", "I will go to the hospital", "I will go hospital", "I going to hospital"], correct: 0 },
    { question: "Choose the British spelling:", options: ["realize", "realise", "reelize", "realyze"], correct: 1 },
    { question: "Select the British term:", options: ["lift", "elevator", "upstairs", "raising"], correct: 0 },
    { question: "Complete the sentence: 'The team ___ playing well.'", options: ["is", "are", "were", "have"], correct: 1 },
    { question: "Choose the British term for 'vacation':", options: ["holiday", "break", "free time", "off-time"], correct: 0 },
    { question: "Select the correct British spelling:", options: ["centre", "center", "senter", "sentre"], correct: 0 },
    { question: "Which is British English?", options: ["autumn", "fall", "season", "falls"], correct: 0 },
    { question: "Choose the British term:", options: ["queue", "line", "row", "series"], correct: 0 },
    { question: "Select the British spelling:", options: ["theatre", "theater", "theator", "teatre"], correct: 0 },
    { question: "Which is correct in British English?", options: ["Have you got a pen?", "Do you have a pen?", "Got a pen?", "Having a pen?"], correct: 0 },
    { question: "Choose the British term for 'truck':", options: ["lorry", "vehicle", "car", "van"], correct: 0 },
    { question: "Select the British spelling:", options: ["programme", "program", "programm", "prog"], correct: 0 },
    { question: "Which is British English?", options: ["flat", "apartment", "condo", "suite"], correct: 0 },
  ],
  'us-english': [
    { question: "Choose the American spelling:", options: ["flavor", "flavour", "flaver", "flavur"], correct: 0 },
    { question: "Select the American term: 'I need to fill my car with ___.'", options: ["gas", "petrol", "fuel", "benzin"], correct: 0 },
    { question: "Which is correct American English?", options: ["I will go to the hospital", "I will go to hospital", "I will go hospital", "I going to hospital"], correct: 0 },
    { question: "Choose the American spelling:", options: ["realize", "realise", "reelize", "realyze"], correct: 0 },
    { question: "Select the American term:", options: ["elevator", "lift", "upstairs", "raising"], correct: 0 },
    { question: "Complete the sentence: 'The team ___ playing well.'", options: ["is", "are", "were", "have"], correct: 0 },
    { question: "Choose the American term for 'holiday':", options: ["vacation", "break", "free time", "off-time"], correct: 0 },
    { question: "Select the correct American spelling:", options: ["center", "centre", "senter", "sentre"], correct: 0 },
    { question: "Which is American English?", options: ["fall", "autumn", "season", "falls"], correct: 0 },
    { question: "Choose the American term:", options: ["line", "queue", "row", "series"], correct: 0 },
    { question: "Select the American spelling:", options: ["theater", "theatre", "theator", "teatre"], correct: 0 },
    { question: "Which is more common in American English?", options: ["Do you have a pen?", "Have you got a pen?", "Got a pen?", "Having a pen?"], correct: 0 },
    { question: "Choose the American term for 'lorry':", options: ["truck", "vehicle", "car", "van"], correct: 0 },
    { question: "Select the American spelling:", options: ["program", "programme", "programm", "prog"], correct: 0 },
    { question: "Which is American English?", options: ["apartment", "flat", "condo", "suite"], correct: 0 },
  ],
  english: [
    { question: "Choose the correct sentence:", options: ["I have been living here since 2 years", "I have been living here for 2 years", "I am living here since 2 years", "I living here for 2 years"], correct: 1 },
    { question: "Fill in the blank: 'She ___ to the store every day.'", options: ["go", "goes", "going", "went"], correct: 1 },
    { question: "Which sentence is grammatically correct?", options: ["She don't like coffee", "She doesn't likes coffee", "She doesn't like coffee", "She not like coffee"], correct: 2 },
    { question: "Complete the sentence: 'If I ___ rich, I would buy a house.'", options: ["am", "was", "were", "be"], correct: 2 },
    { question: "Select the correct comparative form:", options: ["This book is more better than that one", "This book is better than that one", "This book is more good than that one", "This book is gooder than that one"], correct: 1 },
    { question: "Fill in: 'They ___ waiting for the bus for two hours.'", options: ["have been", "has been", "are", "were"], correct: 0 },
    { question: "Which is the correct passive voice?", options: ["The letter written by John", "The letter was wrote by John", "The letter was written by John", "The letter is write by John"], correct: 2 },
    { question: "Complete: 'Neither John nor Mary ___ going to the party.'", options: ["is", "are", "were", "have"], correct: 0 },
    { question: "Select the correct preposition:", options: ["I'm afraid from spiders", "I'm afraid at spiders", "I'm afraid of spiders", "I'm afraid by spiders"], correct: 2 },
    { question: "Fill in the blank: 'I wish I ___ how to swim.'", options: ["know", "knew", "known", "knowing"], correct: 1 },
    { question: "Choose the correct article usage:", options: ["He is the best student in an class", "He is best student in the class", "He is a best student in the class", "He is the best student in the class"], correct: 3 },
    { question: "Complete: 'By this time next year, I ___ my degree.'", options: ["will finish", "will have finished", "finished", "have finished"], correct: 1 },
    { question: "Select the correct modal verb:", options: ["You must to go now", "You must going now", "You must go now", "You must to going now"], correct: 2 },
    { question: "Fill in: 'The team ___ playing well this season.'", options: ["is", "are", "were", "have"], correct: 1 },
    { question: "Which sentence uses the present perfect correctly?", options: ["I have seen him yesterday", "I have seen him last week", "I have just seen him", "I have see him"], correct: 2 },
  ],
  french: [
    { question: "Choisissez la bonne réponse : 'Je ___ étudiant.'", options: ["suis", "es", "est", "sont"], correct: 0 },
    { question: "Complétez : 'Nous ___ au cinéma.'", options: ["allons", "allez", "vont", "vas"], correct: 0 },
    { question: "Quel est le passé composé de 'finir'?", options: ["J'ai fini", "Je suis fini", "J'ai finir", "Je finissais"], correct: 0 },
    { question: "Choisissez l'article correct : '___ table est grande.'", options: ["Le", "La", "Les", "Un"], correct: 1 },
    { question: "Quel est le pronom correct : 'Je ___ donne le livre.'", options: ["lui", "leur", "le", "la"], correct: 0 },
    { question: "Complétez : 'Si j'avais de l'argent, je ___ en vacances.'", options: ["partirais", "partirai", "suis parti", "partirait"], correct: 0 },
    { question: "Choisissez la bonne préposition : 'Je vais ___ Paris.'", options: ["à", "en", "au", "dans"], correct: 0 },
    { question: "Quel est le futur simple de 'être'?", options: ["Je serai", "Je suis", "J'étais", "Je serais"], correct: 0 },
    { question: "Complétez : '___ voiture est rouge.'", options: ["Mon", "Ma", "Mes", "Son"], correct: 1 },
    { question: "Choisissez le bon adjectif : 'Une histoire ___.'", options: ["intéressante", "intéressant", "intéressants", "intéressantes"], correct: 0 },
    { question: "Quel est l'imparfait de 'faire'?", options: ["Je faisais", "J'ai fait", "Je ferai", "Je fais"], correct: 0 },
    { question: "Complétez : 'Il faut que tu ___ (être) là.'", options: ["sois", "es", "est", "soit"], correct: 0 },
    { question: "Choisissez le pronom relatif : 'La fille ___ parle.'", options: ["qui", "que", "dont", "où"], correct: 0 },
    { question: "Quel est le participe présent de 'finir'?", options: ["finissant", "fini", "finissent", "finir"], correct: 0 },
    { question: "Complétez : 'Je voudrais ___ café.'", options: ["du", "de", "le", "un"], correct: 0 },
  ],
  spanish: [
    { question: "Complete la frase: 'Yo ___ español.'", options: ["hablo", "habla", "hablas", "hablan"], correct: 0 },
    { question: "¿Cuál es el tiempo correcto? 'Ayer ___ al parque.'", options: ["voy", "fui", "ido", "vaya"], correct: 1 },
    { question: "Elige el artículo correcto: '___ agua está fría.'", options: ["la", "el", "los", "las"], correct: 1 },
    { question: "Completa: 'Si ___ dinero, viajaría por el mundo.'", options: ["tendría", "tuviera", "tengo", "tenga"], correct: 1 },
    { question: "¿Cuál es el pronombre correcto? '___ gusta el café.'", options: ["Me", "Te", "Le", "Les"], correct: 0 },
    { question: "Selecciona el subjuntivo correcto: 'Espero que ___ bien.'", options: ["estás", "estas", "estés", "estar"], correct: 2 },
    { question: "¿Qué preposición es correcta? 'Voy ___ Madrid.'", options: ["a", "en", "de", "por"], correct: 0 },
    { question: "Elige el imperativo: '___ la puerta, por favor.'", options: ["cierra", "cerrar", "cierre", "cerrado"], correct: 0 },
    { question: "Completa: 'Hace ___ años que vivo aquí.'", options: ["mucho", "muchos", "mucha", "muchas"], correct: 1 },
    { question: "¿Cuál es el futuro de 'ser'?", options: ["seré", "sería", "sea", "siendo"], correct: 0 },
    { question: "Elige el participio: 'He ___ mucho hoy.'", options: ["trabajado", "trabajando", "trabajo", "trabajar"], correct: 0 },
    { question: "¿Qué verbo es correcto? '___ calor hoy.'", options: ["hace", "hay", "está", "es"], correct: 0 },
    { question: "Completa: '___ casa es grande.'", options: ["Mi", "Mí", "Me", "Mis"], correct: 0 },
    { question: "Elige el comparativo: 'Juan es ___ alto que Pedro.'", options: ["más", "muy", "mucho", "tanto"], correct: 0 },
    { question: "¿Cuál es el gerundio de 'comer'?", options: ["comiendo", "comido", "come", "comer"], correct: 0 },
  ],
  german: [
    { question: "Ergänze: 'Ich ___ es Huus.'", options: ["han", "hesch", "het", "hend"], correct: 0 },
    { question: "Wähl die richtigi Form: 'Mir ___ go esse.'", options: ["gönd", "gaht", "gönnd", "gange"], correct: 0 },
    { question: "Ergänz de Satz: '___ chunnt er hei?'", options: ["Wänn", "Wo", "Wie", "Was"], correct: 0 },
    { question: "Wähl s'richtige Verb: 'Si ___ es Buech.'", options: ["liest", "läse", "lese", "list"], correct: 0 },
    { question: "Ergänz: 'Das isch ___ Hund.'", options: ["min", "din", "sin", "ire"], correct: 0 },
    { question: "Wähl de richtig Artikel: '___ Chatz isch schwarz.'", options: ["d", "de", "s", "es"], correct: 0 },
    { question: "Ergänz de Satz: 'Ich ___ es Brot.'", options: ["wott", "will", "welle", "wott"], correct: 0 },
    { question: "Wähl s'Perfekt: 'Ich ___ gsi.'", options: ["bi", "bin", "bisch", "isch"], correct: 0 },
    { question: "Ergänz: 'Er ___ kei Zyt.'", options: ["het", "hät", "hand", "händ"], correct: 0 },
    { question: "Wähl de richtig Plural: 'Huus - ___'", options: ["Hüüser", "Huuse", "Hüser", "Hüüse"], correct: 0 },
    { question: "Ergänz: 'Mir ___ id Schuel.'", options: ["gönd", "gaht", "gange", "gah"], correct: 0 },
    { question: "Wähl s'richtige Pronome: '___ isch schön.'", options: ["Das", "De", "Die", "Dä"], correct: 0 },
    { question: "Ergänz: 'Si ___ es Lied.'", options: ["singt", "singed", "gsunge", "singe"], correct: 0 },
    { question: "Wähl de Komparativ: 'Das isch ___ als das.'", options: ["besser", "guet", "am beste", "bessi"], correct: 0 },
    { question: "Ergänz: 'Ich ___ es dir gseit.'", options: ["han", "ha", "hesch", "het"], correct: 0 },
  ],
  arabic: [
    { question: "أكمل الجملة: 'أنا ___ طالب.'", options: ["هو", "هي", "أنت", ""], correct: 3 },
    { question: "اختر الفعل المضارع المناسب: '___ الطالب الدرس.'", options: ["يكتب", "كتب", "يكتبون", "تكتب"], correct: 0 },
    { question: "أكمل الجملة: 'هل ___ اللغة العربية؟'", options: ["تتكلم", "يتكلم", "تتكلمين", "نتكلم"], correct: 0 },
    { question: "اختر الضمير المناسب: '___ ذهبنا إلى المدرسة.'", options: ["نحن", "هم", "أنتم", "هن"], correct: 0 },
    { question: "أكمل الجملة: 'الكتاب ___ الطاولة.'", options: ["على", "في", "من", "إلى"], correct: 0 },
    { question: "اختر الجمع الصحيح: 'كتاب - ___'", options: ["كتب", "كتابات", "كتابون", "كتابان"], correct: 0 },
    { question: "أكمل الجملة: '___ الولد الدرس؟'", options: ["هل فهم", "هل يفهم", "هل تفهم", "هل فهمت"], correct: 0 },
    { question: "اختر الصفة المناسبة: 'البيت ___'", options: ["كبير", "كبيرة", "كبار", "كبيرات"], correct: 0 },
    { question: "أكمل الجملة: 'أريد ___ إلى السوق.'", options: ["أن أذهب", "أذهب", "ذهبت", "يذهب"], correct: 0 },
    { question: "اختر العدد الصحيح: '___ كتب'", options: ["ثلاثة", "ثلاث", "ثالث", "ثالثة"], correct: 1 },
    { question: "أكمل الجملة: 'المدرسة ___ جداً.'", options: ["جميلة", "جميل", "جميلات", "جمال"], correct: 0 },
    { question: "اختر الظرف المناسب: 'سأعود ___'", options: ["غداً", "أمس", "الآن", "اليوم"], correct: 0 },
    { question: "أكمل الجملة: '___ الطعام لذيذ.'", options: ["هذا", "هذه", "ذلك", "تلك"], correct: 0 },
    { question: "اختر الفعل الماضي: 'البنت ___ الدرس.'", options: ["كتبت", "تكتب", "يكتب", "نكتب"], correct: 0 },
    { question: "أكمل الجملة: 'هو ___ في المكتبة.'", options: ["يدرس", "درس", "يدرسون", "تدرس"], correct: 0 },
  ],
  swiss: [
    { question: "Ergänze: 'Ich ___ es Huus.'", options: ["han", "hesch", "het", "hend"], correct: 0 },
    { question: "Wähl die richtigi Form: 'Mir ___ go esse.'", options: ["gönd", "gaht", "gönnd", "gange"], correct: 0 },
    { question: "Ergänz de Satz: '___ chunnt er hei?'", options: ["Wänn", "Wo", "Wie", "Was"], correct: 0 },
    { question: "Wähl s'richtige Verb: 'Si ___ es Buech.'", options: ["liest", "läse", "lese", "list"], correct: 0 },
    { question: "Ergänz: 'Das isch ___ Hund.'", options: ["min", "din", "sin", "ire"], correct: 0 },
    { question: "Wähl de richtig Artikel: '___ Chatz isch schwarz.'", options: ["d", "de", "s", "es"], correct: 0 },
    { question: "Ergänz de Satz: 'Ich ___ es Brot.'", options: ["wott", "will", "welle", "wott"], correct: 0 },
    { question: "Wähl s'Perfekt: 'Ich ___ gsi.'", options: ["bi", "bin", "bisch", "isch"], correct: 0 },
    { question: "Ergänz: 'Er ___ kei Zyt.'", options: ["het", "hät", "hand", "händ"], correct: 0 },
    { question: "Wähl de richtig Plural: 'Huus - ___'", options: ["Hüüser", "Huuse", "Hüser", "Hüüse"], correct: 0 },
    { question: "Ergänz: 'Mir ___ id Schuel.'", options: ["gönd", "gaht", "gange", "gah"], correct: 0 },
    { question: "Wähl s'richtige Pronome: '___ isch schön.'", options: ["Das", "De", "Die", "Dä"], correct: 0 },
    { question: "Ergänz: 'Si ___ es Lied.'", options: ["singt", "singed", "gsunge", "singe"], correct: 0 },
    { question: "Wähl de Komparativ: 'Das isch ___ als das.'", options: ["besser", "guet", "am beste", "bessi"], correct: 0 },
    { question: "Ergänz: 'Ich ___ es dir gseit.'", options: ["han", "ha", "hesch", "het"], correct: 0 },
  ],
};

const LEVELS = {
  advanced: { key: 'advanced', label: 'Advanced (C1\u2013C2)', color: '#4caf50', minPct: 80, description: 'You have excellent command of the language. You can express yourself fluently and understand complex topics.', recommendations: 'Focus on nuances, cultural aspects, and professional/academic language. Consider taking official proficiency tests.' },
  intermediate: { key: 'intermediate', label: 'Intermediate (B1\u2013B2)', color: '#ff9800', minPct: 60, description: 'You can handle most situations and express yourself fairly well. Your grammar and vocabulary are good but there is room for improvement.', recommendations: 'Work on complex grammar structures, idiomatic expressions, and expand your vocabulary in specific areas.' },
  beginner: { key: 'beginner', label: 'Beginner (A1\u2013A2)', color: '#ef4444', minPct: 0, description: 'You have a basic understanding of the language. You can handle simple conversations and everyday situations.', recommendations: 'Focus on building vocabulary and basic grammar structures. Practice with language learning apps and basic conversations.' },
};

export default function LanguageLevelCalculator() {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isTestActive, setIsTestActive] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleLanguageSelect = (lang: string) => {
    setSelectedLanguage(lang);
    if (lang) {
      setIsTestActive(true);
      setCurrentQuestion(0);
      setScore(0);
      setSelectedAnswer(null);
      setResult(null);
      setError('');
    }
  };

  const handleNext = () => {
    if (selectedAnswer === null) {
      setError('Please select an answer before proceeding.');
      return;
    }
    setError('');
    const questions = QUESTIONS[selectedLanguage];
    const isCorrect = selectedAnswer === questions[currentQuestion].correct;
    if (isCorrect) setScore(prev => prev + 1);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      const finalScore = score + (isCorrect ? 1 : 0);
      const total = questions.length;
      const pct = (finalScore / total) * 100;
      let level: typeof LEVELS.advanced;
      if (pct >= 80) level = LEVELS.advanced;
      else if (pct >= 60) level = LEVELS.intermediate;
      else level = LEVELS.beginner;

      const steps: string[] = [];
      steps.push('**Step 1: Answer all questions**');
      steps.push(`* Language: **${LANGUAGES.find(l => l.value === selectedLanguage)?.label || selectedLanguage}**`);
      steps.push(`* Total questions: $${total}$`);
      steps.push('**Step 2: Calculate correct answers**');
      steps.push(`* Correct: $${finalScore}/$${total}$`);
      steps.push('**Step 3: Compute percentage**');
      steps.push(`$$\\text{Score} = \\frac{${finalScore}}{${total}} \\times 100\\% = ${pct.toFixed(1)}\\%$$`);
      steps.push('**Step 4: Map to proficiency level**');
      steps.push(`* $${pct.toFixed(1)}\\%$ $\\implies$ **${level.label}**`);

      setResult({ level: level.key, levelLabel: level.label, levelColor: level.color, score: finalScore, total, percentage: pct, description: level.description, recommendations: level.recommendations, steps });
      setIsTestActive(false);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#1a1a1a', '#ffffff', '#8a8a8a'],
      });
    }
  };

  const reset = () => {
    setSelectedLanguage('');
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsTestActive(false);
    setResult(null);
    setError('');
  };

  const langLabel = LANGUAGES.find(l => l.value === selectedLanguage)?.label || '';

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800 animate-fade-in">
      <div className="space-y-6">
        {!isTestActive && !result && (
          <div className="space-y-3">
            <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center">
              <i className="fas fa-globe mr-2 text-slate-400"></i>
              Select Language to Test
            </label>
            <select
              value={selectedLanguage}
              onChange={e => handleLanguageSelect(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all appearance-none cursor-pointer"
            >
              <option value="">Select a language</option>
              {LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>
        )}

        {isTestActive && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">
                  {langLabel} — Question {currentQuestion + 1}/{QUESTIONS[selectedLanguage].length}
                </span>
                <span className="text-[9px] text-slate-400 font-extrabold">
                  Score: {score}/{currentQuestion}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 rounded-full transition-all duration-300" style={{ width: `${((currentQuestion + 1) / QUESTIONS[selectedLanguage].length) * 100}%` }} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 leading-relaxed">
                {QUESTIONS[selectedLanguage][currentQuestion].question}
              </h3>
              <div className="space-y-2">
                {QUESTIONS[selectedLanguage][currentQuestion].options.map((option, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                      selectedAnswer === idx
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={idx}
                      checked={selectedAnswer === idx}
                      onChange={() => { setSelectedAnswer(idx); setError(''); }}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center shrink-0 ${
                      selectedAnswer === idx ? 'border-white' : 'border-slate-300'
                    }`}>
                      {selectedAnswer === idx && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className="text-xs font-bold">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 text-center">
                {error}
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <button type="button" onClick={handleNext} disabled={selectedAnswer === null} className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-300 shadow-sm active:scale-95 text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                {currentQuestion < QUESTIONS[selectedLanguage].length - 1 ? 'Next Question' : 'Finish Test'}
                <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="flex justify-center space-x-4">
            <button type="button" onClick={reset} className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-300 shadow-sm active:scale-95 text-sm cursor-pointer">
              <i className="fas fa-redo mr-2"></i>
              Take Another Test
            </button>
            <button type="button" onClick={reset} className="px-7 py-3 rounded-full bg-slate-100 text-slate-650 border border-slate-200 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95 text-sm cursor-pointer">
              <i className="fas fa-undo mr-2"></i>
              Reset
            </button>
          </div>
        )}
      </div>

      {/* CEFR Ladder Visualizer */}
      <div className="bg-slate-50/60 border border-slate-150 rounded-3xl p-6 flex flex-col items-center space-y-4">
        <div className="flex flex-col items-center space-y-1 w-full border-b border-slate-200/50 pb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
            <i className="fas fa-signal mr-2 text-slate-400"></i>
            CEFR Proficiency Ladder
          </span>
          <span className="text-[9px] text-slate-450 font-medium">
            Your level mapped against the Common European Framework of Reference.
          </span>
        </div>
        <div className="w-full max-w-3xl relative">
          <svg viewBox="0 0 800 200" className="w-full bg-[#0a0a0a] border border-slate-950 rounded-2xl shadow-2xl relative overflow-hidden block">
            <defs>
              <pattern id="cefr-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1a1a" strokeWidth="1" />
              </pattern>
              <filter id="cefr-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <rect width="100%" height="100%" fill="url(#cefr-grid)" />
            {[
              { key: 'A1', label: 'Beginner', color: '#ef4444' },
              { key: 'A2', label: 'Elementary', color: '#ff9800' },
              { key: 'B1', label: 'Intermediate', color: '#2196f3' },
              { key: 'B2', label: 'Upper Int.', color: '#4caf50' },
              { key: 'C1', label: 'Advanced', color: '#9c27b0' },
              { key: 'C2', label: 'Proficient', color: '#e91e63' },
            ].map((level, i) => {
              const x = 20 + (i / 6) * 760;
              const w = 760 / 6;
              const isActive = result && (
                (result.level === 'beginner' && i < 2) ||
                (result.level === 'intermediate' && i >= 2 && i < 4) ||
                (result.level === 'advanced' && i >= 4)
              );
              const isCurrent = result && (
                (result.level === 'beginner' && i === 1) ||
                (result.level === 'intermediate' && i === 3) ||
                (result.level === 'advanced' && i === 5)
              );
              return (
                <g key={level.key}>
                  <rect x={x} y="65" width={w - 4} height="100" rx="6" fill="none" stroke={isActive ? level.color : '#2a2a2a'} strokeWidth={isCurrent ? 2 : 1} opacity={isCurrent ? 1 : 0.4} />
                  <text x={x + (w - 4) / 2} y="118" textAnchor="middle" fill={isCurrent ? level.color : '#4b5563'} fontSize="14" fontFamily="monospace" fontWeight={isCurrent ? 'bold' : 'normal'}>{level.key}</text>
                  <text x={x + (w - 4) / 2} y="140" textAnchor="middle" fill={isCurrent ? '#ffffff' : '#4b5563'} fontSize="7" fontFamily="monospace" opacity={isCurrent ? 1 : 0.5}>{level.label}</text>
                  {isCurrent && (
                    <>
                      <rect x={x + 4} y="65" width={w - 12} height="100" rx="4" fill={level.color} opacity="0.15" />
                      <circle cx={x + (w - 4) / 2} cy="90" r="8" fill={level.color} filter="url(#cefr-glow)" />
                    </>
                  )}
                </g>
              );
            })}
            <text x="400" y="14" textAnchor="middle" fill="#4b5563" fontSize="7" fontFamily="monospace">
              {result ? `${langLabel}: ${result.levelLabel} \u2014 ${result.score}/${result.total} (${result.percentage.toFixed(0)}%)` : 'Select a language and complete the test to see your CEFR level'}
            </text>
          </svg>
          {result && (
            <div className="absolute top-2.5 left-3 bg-[#0a0a0a]/90 text-white font-mono text-[9px] px-2 py-0.5 rounded border border-neutral-800 shadow-sm flex flex-col space-y-0.5">
              <div><span className="text-neutral-400">Level:</span> {result.levelLabel}</div>
              <div><span className="text-neutral-400">Score:</span> {result.score}/{result.total}</div>
            </div>
          )}
          {result && (
            <div className="absolute top-2.5 right-3 bg-[#0a0a0a]/90 text-white font-mono text-[9px] px-2 py-0.5 rounded border border-neutral-800 shadow-sm">
              <span className="text-neutral-400">Proficiency:</span> {result.percentage.toFixed(0)}%
            </div>
          )}
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <div ref={resultsRef} className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-left shadow-lg relative overflow-hidden animate-fade-in-up">
          <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
            <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">LANG</span>
          </div>
          <div className="relative z-10 space-y-6">
            {/* Main display */}
            <div className="text-center pb-4 border-b border-white/10">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-2">Language Proficiency Result</span>
              <span className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: result.levelColor }}>{result.levelLabel}</span>
              <p className="text-sm text-slate-300 mt-2">{langLabel}</p>
              <span className="inline-block mt-2 px-4 py-1 rounded-full text-xs font-black border" style={{ color: result.levelColor, borderColor: `${result.levelColor}40`, backgroundColor: `${result.levelColor}15` }}>
                {result.score}/{result.total} — {result.percentage.toFixed(0)}% Correct
              </span>
            </div>

            {/* Score breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Assessment Result</h4>
                <p className="text-xs text-white/80 leading-relaxed">{result.description}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Recommendations</h4>
                <p className="text-xs text-white/80 leading-relaxed">{result.recommendations}</p>
              </div>
            </div>

            {/* Score bar */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Score Summary</h4>
              <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${result.percentage}%`, backgroundColor: result.levelColor }} />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                <span>0%</span>
                <span>{result.score} / {result.total} correct</span>
                <span>100%</span>
              </div>
            </div>

            {/* Step-by-step */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">Step-by-Step Resolution Steps</h4>
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 text-xs text-white/70 leading-relaxed font-medium">
                {result.steps.map((step, idx) => {
                  const trimmed = step.trim();
                  if (trimmed.startsWith('$$')) {
                    const latexStr = trimmed.replace(/\$\$/g, '');
                    return (<div key={idx} className="py-2.5 overflow-x-auto scrollbar-thin"><BlockMath math={latexStr} /></div>);
                  }
                  const isBold = trimmed.startsWith('**');
                  const cleanText = trimmed.replace(/^\* |\*\*/g, '');
                  const inlineRegex = /\$([^$]+)\$/g;
                  let lastIdx = 0;
                  const parts: React.ReactNode[] = [];
                  let match;
                  while ((match = inlineRegex.exec(cleanText)) !== null) {
                    if (match.index > lastIdx) parts.push(cleanText.substring(lastIdx, match.index));
                    parts.push(<InlineMath key={match.index} math={match[1]} />);
                    lastIdx = inlineRegex.lastIndex;
                  }
                  if (lastIdx < cleanText.length) parts.push(cleanText.substring(lastIdx));
                  return (<p key={idx} className={isBold ? 'font-black text-white pt-2 first:pt-0' : ''}>{parts.length > 0 ? parts : cleanText}</p>);
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
