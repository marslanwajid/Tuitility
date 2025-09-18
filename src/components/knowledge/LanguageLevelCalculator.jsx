import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import '../../assets/css/knowledge/language-level-calculator.css';

const LanguageLevelCalculator = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isTestActive, setIsTestActive] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Tool data for ToolPageLayout
  const toolData = {
    name: "Language Level Calculator",
    description: "Assess your proficiency level in various languages with our comprehensive language level calculator. Test your knowledge across multiple languages including English, French, Spanish, German, Arabic, and more.",
    category: "Knowledge",
    icon: "fas fa-language",
    breadcrumb: ['Knowledge', 'Calculators', 'Language Level Calculator'],
    keywords: ["language", "proficiency", "assessment", "test", "level", "grammar", "vocabulary", "fluency"]
  };

  // Categories for navigation
  const categories = [
    { name: "Knowledge", url: "/knowledge" },
    { name: "Language Level Calculator", url: "/knowledge/calculators/language-level-calculator" }
  ];

  // Related tools
  const relatedTools = [
    { name: "GPA Calculator", url: "/knowledge/calculators/gpa-calculator", icon: "fas fa-graduation-cap" },
    { name: "Age Calculator", url: "/knowledge/calculators/age-calculator", icon: "fas fa-calendar-alt" },
    { name: "WPM Calculator", url: "/knowledge/calculators/wpm-calculator", icon: "fas fa-keyboard" },
    { name: "Habit Formation Calculator", url: "/knowledge/calculators/habit-formation-calculator", icon: "fas fa-calendar-check" },
    { name: "MBTI Calculator", url: "/knowledge/calculators/mbti-calculator", icon: "fas fa-user-friends" }
  ];

  // Language tests data
  const languageTests = {
    'uk-english': [
      {
        question: "Choose the correct spelling:",
        options: ["colour", "color", "coulor", "coler"],
        correct: 0
      },
      {
        question: "Select the British term: 'I need to fill my car with ___.'",
        options: ["petrol", "gas", "fuel", "benzin"],
        correct: 0
      },
      {
        question: "Which is correct British English?",
        options: [
          "I will go to hospital",
          "I will go to the hospital",
          "I will go hospital",
          "I going to hospital"
        ],
        correct: 0
      },
      {
        question: "Choose the British spelling:",
        options: ["realize", "realise", "reelize", "realyze"],
        correct: 1
      },
      {
        question: "Select the British term:",
        options: ["lift", "elevator", "upstairs", "raising"],
        correct: 0
      },
      {
        question: "Complete the sentence: 'The team ___ playing well.'",
        options: ["is", "are", "were", "have"],
        correct: 1
      },
      {
        question: "Choose the British term for 'vacation':",
        options: ["holiday", "break", "free time", "off-time"],
        correct: 0
      },
      {
        question: "Select the correct British spelling:",
        options: ["centre", "center", "senter", "sentre"],
        correct: 0
      },
      {
        question: "Which is British English?",
        options: ["autumn", "fall", "season", "falls"],
        correct: 0
      },
      {
        question: "Choose the British term:",
        options: ["queue", "line", "row", "series"],
        correct: 0
      },
      {
        question: "Select the British spelling:",
        options: ["theatre", "theater", "theator", "teatre"],
        correct: 0
      },
      {
        question: "Which is correct in British English?",
        options: [
          "Have you got a pen?",
          "Do you have a pen?",
          "Got a pen?",
          "Having a pen?"
        ],
        correct: 0
      },
      {
        question: "Choose the British term for 'truck':",
        options: ["lorry", "vehicle", "car", "van"],
        correct: 0
      },
      {
        question: "Select the British spelling:",
        options: ["programme", "program", "programm", "prog"],
        correct: 0
      },
      {
        question: "Which is British English?",
        options: ["flat", "apartment", "condo", "suite"],
        correct: 0
      }
    ],
    'us-english': [
      {
        question: "Choose the American spelling:",
        options: ["flavor", "flavour", "flaver", "flavur"],
        correct: 0
      },
      {
        question: "Select the American term: 'I need to fill my car with ___.'",
        options: ["gas", "petrol", "fuel", "benzin"],
        correct: 0
      },
      {
        question: "Which is correct American English?",
        options: [
          "I will go to the hospital",
          "I will go to hospital",
          "I will go hospital",
          "I going to hospital"
        ],
        correct: 0
      },
      {
        question: "Choose the American spelling:",
        options: ["realize", "realise", "reelize", "realyze"],
        correct: 0
      },
      {
        question: "Select the American term:",
        options: ["elevator", "lift", "upstairs", "raising"],
        correct: 0
      },
      {
        question: "Complete the sentence: 'The team ___ playing well.'",
        options: ["is", "are", "were", "have"],
        correct: 0
      },
      {
        question: "Choose the American term for 'holiday':",
        options: ["vacation", "break", "free time", "off-time"],
        correct: 0
      },
      {
        question: "Select the correct American spelling:",
        options: ["center", "centre", "senter", "sentre"],
        correct: 0
      },
      {
        question: "Which is American English?",
        options: ["fall", "autumn", "season", "falls"],
        correct: 0
      },
      {
        question: "Choose the American term:",
        options: ["line", "queue", "row", "series"],
        correct: 0
      },
      {
        question: "Select the American spelling:",
        options: ["theater", "theatre", "theator", "teatre"],
        correct: 0
      },
      {
        question: "Which is more common in American English?",
        options: [
          "Do you have a pen?",
          "Have you got a pen?",
          "Got a pen?",
          "Having a pen?"
        ],
        correct: 0
      },
      {
        question: "Choose the American term for 'lorry':",
        options: ["truck", "vehicle", "car", "van"],
        correct: 0
      },
      {
        question: "Select the American spelling:",
        options: ["program", "programme", "programm", "prog"],
        correct: 0
      },
      {
        question: "Which is American English?",
        options: ["apartment", "flat", "condo", "suite"],
        correct: 0
      }
    ],
    english: [
      {
        question: "Choose the correct sentence:",
        options: [
          "I have been living here since 2 years",
          "I have been living here for 2 years",
          "I am living here since 2 years",
          "I living here for 2 years"
        ],
        correct: 1
      },
      {
        question: "Fill in the blank: 'She ___ to the store every day.'",
        options: ["go", "goes", "going", "went"],
        correct: 1
      },
      {
        question: "Which sentence is grammatically correct?",
        options: [
          "She don't like coffee",
          "She doesn't likes coffee",
          "She doesn't like coffee",
          "She not like coffee"
        ],
        correct: 2
      },
      {
        question: "Complete the sentence: 'If I ___ rich, I would buy a house.'",
        options: ["am", "was", "were", "be"],
        correct: 2
      },
      {
        question: "Select the correct comparative form:",
        options: [
          "This book is more better than that one",
          "This book is better than that one",
          "This book is more good than that one",
          "This book is gooder than that one"
        ],
        correct: 1
      },
      {
        question: "Fill in: 'They ___ waiting for the bus for two hours.'",
        options: ["have been", "has been", "are", "were"],
        correct: 0
      },
      {
        question: "Which is the correct passive voice?",
        options: [
          "The letter written by John",
          "The letter was wrote by John",
          "The letter was written by John",
          "The letter is write by John"
        ],
        correct: 2
      },
      {
        question: "Complete: 'Neither John nor Mary ___ going to the party.'",
        options: ["is", "are", "were", "have"],
        correct: 0
      },
      {
        question: "Select the correct preposition:",
        options: [
          "I'm afraid from spiders",
          "I'm afraid at spiders",
          "I'm afraid of spiders",
          "I'm afraid by spiders"
        ],
        correct: 2
      },
      {
        question: "Fill in the blank: 'I wish I ___ how to swim.'",
        options: ["know", "knew", "known", "knowing"],
        correct: 1
      },
      {
        question: "Choose the correct article usage:",
        options: [
          "He is the best student in an class",
          "He is best student in the class",
          "He is a best student in the class",
          "He is the best student in the class"
        ],
        correct: 3
      },
      {
        question: "Complete: 'By this time next year, I ___ my degree.'",
        options: ["will finish", "will have finished", "finished", "have finished"],
        correct: 1
      },
      {
        question: "Select the correct modal verb:",
        options: [
          "You must to go now",
          "You must going now",
          "You must go now",
          "You must to going now"
        ],
        correct: 2
      },
      {
        question: "Fill in: 'The team ___ playing well this season.'",
        options: ["is", "are", "were", "have"],
        correct: 1
      },
      {
        question: "Which sentence uses the present perfect correctly?",
        options: [
          "I have seen him yesterday",
          "I have seen him last week",
          "I have just seen him",
          "I have see him"
        ],
        correct: 2
      }
    ],
    french: [
      {
        question: "Choisissez la bonne réponse : 'Je ___ étudiant.'",
        options: ["suis", "es", "est", "sont"],
        correct: 0
      },
      {
        question: "Complétez : 'Nous ___ au cinéma.'",
        options: ["allons", "allez", "vont", "vas"],
        correct: 0
      },
      {
        question: "Quel est le passé composé de 'finir'?",
        options: [
          "J'ai fini",
          "Je suis fini",
          "J'ai finir",
          "Je finissais"
        ],
        correct: 0
      },
      {
        question: "Choisissez l'article correct : '___ table est grande.'",
        options: ["Le", "La", "Les", "Un"],
        correct: 1
      },
      {
        question: "Quel est le pronom correct : 'Je ___ donne le livre.'",
        options: ["lui", "leur", "le", "la"],
        correct: 0
      },
      {
        question: "Complétez : 'Si j'avais de l'argent, je ___ en vacances.'",
        options: [
          "partirais",
          "partirai",
          "suis parti",
          "partirait"
        ],
        correct: 0
      },
      {
        question: "Choisissez la bonne préposition : 'Je vais ___ Paris.'",
        options: ["à", "en", "au", "dans"],
        correct: 0
      },
      {
        question: "Quel est le futur simple de 'être'?",
        options: [
          "Je serai",
          "Je suis",
          "J'étais",
          "Je serais"
        ],
        correct: 0
      },
      {
        question: "Complétez : '___ voiture est rouge.'",
        options: ["Mon", "Ma", "Mes", "Son"],
        correct: 1
      },
      {
        question: "Choisissez le bon adjectif : 'Une histoire ___.'",
        options: [
          "intéressante",
          "intéressant",
          "intéressants",
          "intéressantes"
        ],
        correct: 0
      },
      {
        question: "Quel est l'imparfait de 'faire'?",
        options: [
          "Je faisais",
          "J'ai fait",
          "Je ferai",
          "Je fais"
        ],
        correct: 0
      },
      {
        question: "Complétez : 'Il faut que tu ___ (être) là.'",
        options: [
          "sois",
          "es",
          "est",
          "soit"
        ],
        correct: 0
      },
      {
        question: "Choisissez le pronom relatif : 'La fille ___ parle.'",
        options: [
          "qui",
          "que",
          "dont",
          "où"
        ],
        correct: 0
      },
      {
        question: "Quel est le participe présent de 'finir'?",
        options: [
          "finissant",
          "fini",
          "finissent",
          "finir"
        ],
        correct: 0
      },
      {
        question: "Complétez : 'Je voudrais ___ café.'",
        options: [
          "du",
          "de",
          "le",
          "un"
        ],
        correct: 0
      }
    ],
    spanish: [
      {
        question: "Complete la frase: 'Yo ___ español.'",
        options: ["hablo", "habla", "hablas", "hablan"],
        correct: 0
      },
      {
        question: "¿Cuál es el tiempo correcto? 'Ayer ___ al parque.'",
        options: ["voy", "fui", "ido", "vaya"],
        correct: 1
      },
      {
        question: "Elige el artículo correcto: '___ agua está fría.'",
        options: ["la", "el", "los", "las"],
        correct: 1
      },
      {
        question: "Completa: 'Si ___ dinero, viajaría por el mundo.'",
        options: ["tendría", "tuviera", "tengo", "tenga"],
        correct: 1
      },
      {
        question: "¿Cuál es el pronombre correcto? '___ gusta el café.'",
        options: ["Me", "Te", "Le", "Les"],
        correct: 0
      },
      {
        question: "Selecciona el subjuntivo correcto: 'Espero que ___ bien.'",
        options: ["estás", "estas", "estés", "estar"],
        correct: 2
      },
      {
        question: "¿Qué preposición es correcta? 'Voy ___ Madrid.'",
        options: ["a", "en", "de", "por"],
        correct: 0
      },
      {
        question: "Elige el imperativo: '___ la puerta, por favor.'",
        options: ["cierra", "cerrar", "cierre", "cerrado"],
        correct: 0
      },
      {
        question: "Completa: 'Hace ___ años que vivo aquí.'",
        options: ["mucho", "muchos", "mucha", "muchas"],
        correct: 1
      },
      {
        question: "¿Cuál es el futuro de 'ser'?",
        options: ["seré", "sería", "sea", "siendo"],
        correct: 0
      },
      {
        question: "Elige el participio: 'He ___ mucho hoy.'",
        options: ["trabajado", "trabajando", "trabajo", "trabajar"],
        correct: 0
      },
      {
        question: "¿Qué verbo es correcto? '___ calor hoy.'",
        options: ["hace", "hay", "está", "es"],
        correct: 0
      },
      {
        question: "Completa: '___ casa es grande.'",
        options: ["Mi", "Mí", "Me", "Mis"],
        correct: 0
      },
      {
        question: "Elige el comparativo: 'Juan es ___ alto que Pedro.'",
        options: ["más", "muy", "mucho", "tanto"],
        correct: 0
      },
      {
        question: "¿Cuál es el gerundio de 'comer'?",
        options: ["comiendo", "comido", "come", "comer"],
        correct: 0
      }
    ],
    german: [
      {
        question: "Ergänze: 'Ich ___ es Huus.'",
        options: ["han", "hesch", "het", "hend"],
        correct: 0
      },
      {
        question: "Wähl die richtigi Form: 'Mir ___ go esse.'",
        options: ["gönd", "gaht", "gönnd", "gange"],
        correct: 0
      },
      {
        question: "Ergänz de Satz: '___ chunnt er hei?'",
        options: ["Wänn", "Wo", "Wie", "Was"],
        correct: 0
      },
      {
        question: "Wähl s'richtige Verb: 'Si ___ es Buech.'",
        options: ["liest", "läse", "lese", "list"],
        correct: 0
      },
      {
        question: "Ergänz: 'Das isch ___ Hund.'",
        options: ["min", "din", "sin", "ire"],
        correct: 0
      },
      {
        question: "Wähl de richtig Artikel: '___ Chatz isch schwarz.'",
        options: ["d", "de", "s", "es"],
        correct: 0
      },
      {
        question: "Ergänz de Satz: 'Ich ___ es Brot.'",
        options: ["wott", "will", "welle", "wott"],
        correct: 0
      },
      {
        question: "Wähl s'Perfekt: 'Ich ___ gsi.'",
        options: ["bi", "bin", "bisch", "isch"],
        correct: 0
      },
      {
        question: "Ergänz: 'Er ___ kei Zyt.'",
        options: ["het", "hät", "hand", "händ"],
        correct: 0
      },
      {
        question: "Wähl de richtig Plural: 'Huus - ___'",
        options: ["Hüüser", "Huuse", "Hüser", "Hüüse"],
        correct: 0
      },
      {
        question: "Ergänz: 'Mir ___ id Schuel.'",
        options: ["gönd", "gaht", "gange", "gah"],
        correct: 0
      },
      {
        question: "Wähl s'richtige Pronome: '___ isch schön.'",
        options: ["Das", "De", "Die", "Dä"],
        correct: 0
      },
      {
        question: "Ergänz: 'Si ___ es Lied.'",
        options: ["singt", "singed", "gsunge", "singe"],
        correct: 0
      },
      {
        question: "Wähl de Komparativ: 'Das isch ___ als das.'",
        options: ["besser", "guet", "am beste", "bessi"],
        correct: 0
      },
      {
        question: "Ergänz: 'Ich ___ es dir gseit.'",
        options: ["han", "ha", "hesch", "het"],
        correct: 0
      }
    ],
    arabic: [
      {
        question: "أكمل الجملة: 'أنا ___ طالب.'",
        options: ["هو", "هي", "أنت", ""],
        correct: 3
      },
      {
        question: "اختر الفعل المضارع المناسب: '___ الطالب الدرس.'",
        options: ["يكتب", "كتب", "يكتبون", "تكتب"],
        correct: 0
      },
      {
        question: "أكمل الجملة: 'هل ___ اللغة العربية؟'",
        options: ["تتكلم", "يتكلم", "تتكلمين", "نتكلم"],
        correct: 0
      },
      {
        question: "اختر الضمير المناسب: '___ ذهبنا إلى المدرسة.'",
        options: ["نحن", "هم", "أنتم", "هن"],
        correct: 0
      },
      {
        question: "أكمل الجملة: 'الكتاب ___ الطاولة.'",
        options: ["على", "في", "من", "إلى"],
        correct: 0
      },
      {
        question: "اختر الجمع الصحيح: 'كتاب - ___'",
        options: ["كتب", "كتابات", "كتابون", "كتابان"],
        correct: 0
      },
      {
        question: "أكمل الجملة: '___ الولد الدرس؟'",
        options: ["هل فهم", "هل يفهم", "هل تفهم", "هل فهمت"],
        correct: 0
      },
      {
        question: "اختر الصفة المناسبة: 'البيت ___'",
        options: ["كبير", "كبيرة", "كبار", "كبيرات"],
        correct: 0
      },
      {
        question: "أكمل الجملة: 'أريد ___ إلى السوق.'",
        options: ["أن أذهب", "أذهب", "ذهبت", "يذهب"],
        correct: 0
      },
      {
        question: "اختر العدد الصحيح: '___ كتب'",
        options: ["ثلاثة", "ثلاث", "ثالث", "ثالثة"],
        correct: 1
      },
      {
        question: "أكمل الجملة: 'المدرسة ___ جداً.'",
        options: ["جميلة", "جميل", "جميلات", "جمال"],
        correct: 0
      },
      {
        question: "اختر الظرف المناسب: 'سأعود ___'",
        options: ["غداً", "أمس", "الآن", "اليوم"],
        correct: 0
      },
      {
        question: "أكمل الجملة: '___ الطعام لذيذ.'",
        options: ["هذا", "هذه", "ذلك", "تلك"],
        correct: 0
      },
      {
        question: "اختر الفعل الماضي: 'البنت ___ الدرس.'",
        options: ["كتبت", "تكتب", "يكتب", "نكتب"],
        correct: 0
      },
      {
        question: "أكمل الجملة: 'هو ___ في المكتبة.'",
        options: ["يدرس", "درس", "يدرسون", "تدرس"],
        correct: 0
      }
    ],
    swiss: [
      {
        question: "Ergänze: 'Ich ___ es Huus.'",
        options: ["han", "hesch", "het", "hend"],
        correct: 0
      },
      {
        question: "Wähl die richtigi Form: 'Mir ___ go esse.'",
        options: ["gönd", "gaht", "gönnd", "gange"],
        correct: 0
      },
      {
        question: "Ergänz de Satz: '___ chunnt er hei?'",
        options: ["Wänn", "Wo", "Wie", "Was"],
        correct: 0
      },
      {
        question: "Wähl s'richtige Verb: 'Si ___ es Buech.'",
        options: ["liest", "läse", "lese", "list"],
        correct: 0
      },
      {
        question: "Ergänz: 'Das isch ___ Hund.'",
        options: ["min", "din", "sin", "ire"],
        correct: 0
      },
      {
        question: "Wähl de richtig Artikel: '___ Chatz isch schwarz.'",
        options: ["d", "de", "s", "es"],
        correct: 0
      },
      {
        question: "Ergänz de Satz: 'Ich ___ es Brot.'",
        options: ["wott", "will", "welle", "wott"],
        correct: 0
      },
      {
        question: "Wähl s'Perfekt: 'Ich ___ gsi.'",
        options: ["bi", "bin", "bisch", "isch"],
        correct: 0
      },
      {
        question: "Ergänz: 'Er ___ kei Zyt.'",
        options: ["het", "hät", "hand", "händ"],
        correct: 0
      },
      {
        question: "Wähl de richtig Plural: 'Huus - ___'",
        options: ["Hüüser", "Huuse", "Hüser", "Hüüse"],
        correct: 0
      },
      {
        question: "Ergänz: 'Mir ___ id Schuel.'",
        options: ["gönd", "gaht", "gange", "gah"],
        correct: 0
      },
      {
        question: "Wähl s'richtige Pronome: '___ isch schön.'",
        options: ["Das", "De", "Die", "Dä"],
        correct: 0
      },
      {
        question: "Ergänz: 'Si ___ es Lied.'",
        options: ["singt", "singed", "gsunge", "singe"],
        correct: 0
      },
      {
        question: "Wähl de Komparativ: 'Das isch ___ als das.'",
        options: ["besser", "guet", "am beste", "bessi"],
        correct: 0
      },
      {
        question: "Ergänz: 'Ich ___ es dir gseit.'",
        options: ["han", "ha", "hesch", "het"],
        correct: 0
      }
    ]
  };

  // Level descriptions
  const levelDescriptions = {
    beginner: {
      title: "Beginner (A1-A2)",
      description: "You have a basic understanding of the language. You can handle simple conversations and everyday situations.",
      recommendations: "Focus on building vocabulary and basic grammar structures. Practice with language learning apps and basic conversations."
    },
    intermediate: {
      title: "Intermediate (B1-B2)",
      description: "You can handle most situations and express yourself fairly well. Your grammar and vocabulary are good but there's room for improvement.",
      recommendations: "Work on complex grammar structures, idiomatic expressions, and expand your vocabulary in specific areas."
    },
    advanced: {
      title: "Advanced (C1-C2)",
      description: "You have excellent command of the language. You can express yourself fluently and understand complex topics.",
      recommendations: "Focus on nuances, cultural aspects, and professional/academic language. Consider taking official proficiency tests."
    }
  };

  // Language options
  const languageOptions = [
    { value: '', label: 'Select a language' },
    { value: 'uk-english', label: 'English (UK)' },
    { value: 'us-english', label: 'English (US)' },
    { value: 'english', label: 'English (General)' },
    { value: 'french', label: 'French' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'german', label: 'German' },
    { value: 'arabic', label: 'Arabic' },
    { value: 'swiss', label: 'Swiss German' }
  ];

  // Handle language selection
  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    if (language) {
      setIsTestActive(true);
      setCurrentQuestion(0);
      setScore(0);
      setSelectedAnswer(null);
      setResult(null);
      setError('');
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (selectedAnswer === null) {
      setError('Please select an answer before proceeding.');
      return;
    }

    setError('');

    // Check if answer is correct
    const currentQuestions = languageTests[selectedLanguage];
    if (selectedAnswer === currentQuestions[currentQuestion].correct) {
      setScore(score + 1);
    }

    // Move to next question or show results
    if (currentQuestion < 14) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      // Calculate results
      const percentage = (score + (selectedAnswer === currentQuestions[currentQuestion].correct ? 1 : 0)) / 15 * 100;
      let level;
      
      if (percentage >= 80) {
        level = 'advanced';
      } else if (percentage >= 60) {
        level = 'intermediate';
      } else {
        level = 'beginner';
      }

      const finalScore = score + (selectedAnswer === currentQuestions[currentQuestion].correct ? 1 : 0);
      const levelInfo = levelDescriptions[level];

      setResult({
        level,
        levelInfo,
        score: finalScore,
        percentage: percentage.toFixed(1),
        totalQuestions: 15
      });

      setIsTestActive(false);
    }
  };

  // Reset calculator
  const resetCalculator = () => {
    setSelectedLanguage('');
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsTestActive(false);
    setResult(null);
    setError('');
  };

  // Calculate function for CalculatorSection
  const handleCalculate = () => {
    // This is handled by the test flow, not a single calculation
  };

  // Load external JavaScript
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/src/assets/js/knowledge/language-level-calculator.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="/src/assets/js/knowledge/language-level-calculator.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  // Table of Contents data
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-language-level', title: 'What is Language Level?' },
    { id: 'proficiency-levels', title: 'Proficiency Levels' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'calculation-method', title: 'Calculation Method' },
    { id: 'examples', title: 'Examples' },
    { id: 'significance', title: 'Significance' },
    { id: 'functionality', title: 'Functionality' },
    { id: 'applications', title: 'Applications' }
  ];

  // FAQ data
  const faqData = [
    {
      question: "How accurate is the language level assessment?",
      answer: "Our assessment provides a general indication of your language proficiency level. It's based on grammar, vocabulary, and usage patterns, but for official certification, you should take recognized language proficiency tests like TOEFL, IELTS, or DELF."
    },
    {
      question: "How long does the test take?",
      answer: "The test consists of 15 questions and typically takes 5-10 minutes to complete, depending on your pace and the complexity of the language being tested."
    },
    {
      question: "Can I retake the test?",
      answer: "Yes, you can retake the test as many times as you want. Simply select a different language or restart the same language test to get a fresh assessment."
    },
    {
      question: "What languages are supported?",
      answer: "We currently support English (UK, US, and General), French, Spanish, German, Arabic, and Swiss German. Each language has its own set of questions tailored to common grammar and vocabulary patterns."
    },
    {
      question: "What do the proficiency levels mean?",
      answer: "Beginner (A1-A2): Basic understanding, simple conversations. Intermediate (B1-B2): Good command, most situations. Advanced (C1-C2): Excellent command, complex topics. These align with the Common European Framework of Reference for Languages."
    },
    {
      question: "Is this test suitable for all ages?",
      answer: "Yes, the language level calculator is suitable for learners of all ages. The questions are designed to test fundamental language knowledge that applies to both children and adults learning the language."
    }
  ];

  return (
    <ToolPageLayout 
      toolData={toolData} 
      categories={categories} 
      relatedTools={relatedTools}
    >
      <CalculatorSection
        title="Language Level Assessment"
        description="Test your proficiency in various languages with our comprehensive assessment tool."
        onCalculate={handleCalculate}
        calculateButtonText="Start Test"
        showCalculateButton={!isTestActive && !result}
      >
        {!isTestActive && !result && (
          <div className="language-selection-section">
            <div className="language-form-group">
              <label htmlFor="language-select" className="language-form-label">
                <i className="fas fa-globe"></i>
                Select Language to Test
              </label>
              <select
                id="language-select"
                className="language-form-select"
                value={selectedLanguage}
                onChange={(e) => handleLanguageSelect(e.target.value)}
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {isTestActive && (
          <div className="language-test-section">
            <div className="language-progress-container">
              <div className="language-question-counter">
                Question {currentQuestion + 1}/15
              </div>
              <div className="language-progress-bar">
                <div 
                  className="language-progress-fill"
                  style={{ width: `${((currentQuestion + 1) / 15) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="language-question-container">
              <h3 className="language-question-text">
                {languageTests[selectedLanguage][currentQuestion].question}
              </h3>
              <div className="language-options-grid">
                {languageTests[selectedLanguage][currentQuestion].options.map((option, index) => (
                  <div key={index} className="language-option-container">
                    <input
                      type="radio"
                      id={`language-option-${index}`}
                      name="language-answer"
                      value={index}
                      checked={selectedAnswer === index}
                      onChange={() => handleAnswerSelect(index)}
                    />
                    <label htmlFor={`language-option-${index}`} className="language-option-label">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="language-navigation-buttons">
              <button 
                type="button" 
                className="language-btn-next" 
                onClick={handleNextQuestion}
                disabled={selectedAnswer === null}
              >
                {currentQuestion === 14 ? 'Finish Test' : 'Next Question'}
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="language-error-message">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
          </div>
        )}

        {result && (
          <div className="language-level-calculator-result">
            <div className="language-result-header">
              <h3>Your Language Level Assessment</h3>
            </div>
            
            <div className="language-level-badge">
              <span className={`language-level ${result.level}`}>
                {result.levelInfo.title}
              </span>
            </div>

            <div className="language-score-details">
              <div className="language-score-item">
                <span className="language-score-label">Score:</span>
                <span className="language-score-value">{result.score}/15 ({result.percentage}%)</span>
              </div>
            </div>

            <div className="language-level-description">
              <h4>Assessment Result</h4>
              <p>{result.levelInfo.description}</p>
            </div>

            <div className="language-recommendations">
              <h4>Recommendations</h4>
              <p>{result.levelInfo.recommendations}</p>
            </div>

            <div className="language-disclaimer">
              <p><i className="fas fa-info-circle"></i> <strong>Note:</strong> This is a general assessment tool. For official language certification, please take recognized proficiency tests like TOEFL, IELTS, DELF, or similar exams.</p>
            </div>
          </div>
        )}

        <div className="language-form-actions">
          {result && (
            <button type="button" className="language-btn-restart" onClick={resetCalculator}>
              <i className="fas fa-redo"></i>
              Take Another Test
            </button>
          )}
          <button type="button" className="language-btn-reset" onClick={resetCalculator}>
            <i className="fas fa-undo"></i>
            Reset Test
          </button>
        </div>
      </CalculatorSection>

      {/* TOC and Feedback Section */}
      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName={toolData.name} />
      </div>

      {/* Content Sections */}
      <ContentSection id="introduction" title="Introduction">
        <p>
          The Language Level Calculator is a comprehensive assessment tool that evaluates your proficiency 
          level in various languages through carefully crafted questions covering grammar, vocabulary, and 
          usage patterns. This tool helps you understand your current language abilities and provides 
          personalized recommendations for improvement.
        </p>
        <p>
          Our calculator supports multiple languages including English variants (UK, US, General), French, 
          Spanish, German, Arabic, and Swiss German. Each language test consists of 15 questions designed 
          to assess different aspects of language proficiency aligned with the Common European Framework 
          of Reference for Languages (CEFR).
        </p>
      </ContentSection>

      <ContentSection id="what-is-language-level" title="What is Language Level?">
        <p>
          Language level refers to your proficiency in a particular language, measured across different 
          skills including grammar, vocabulary, comprehension, and usage. Understanding your language level 
          is crucial for setting learning goals, choosing appropriate materials, and tracking progress.
        </p>
        <p>
          Language proficiency is typically measured using standardized frameworks like the CEFR, which 
          categorizes learners into six levels from A1 (beginner) to C2 (proficient). Our assessment 
          provides a general indication of where you fall within these categories.
        </p>
        <ul>
          <li><strong>Beginner (A1-A2):</strong> Basic understanding, simple conversations</li>
          <li><strong>Intermediate (B1-B2):</strong> Good command, most situations</li>
          <li><strong>Advanced (C1-C2):</strong> Excellent command, complex topics</li>
        </ul>
      </ContentSection>

      <ContentSection id="proficiency-levels" title="Proficiency Levels">
        <div className="proficiency-levels-grid">
          <div className="proficiency-level-item">
            <h4><i className="fas fa-seedling"></i> Beginner (A1-A2)</h4>
            <p>Basic understanding of the language. Can handle simple conversations and everyday situations.</p>
            <ul>
              <li>Understand basic phrases and expressions</li>
              <li>Introduce yourself and ask simple questions</li>
              <li>Communicate in simple, routine tasks</li>
            </ul>
          </div>
          <div className="proficiency-level-item">
            <h4><i className="fas fa-chart-line"></i> Intermediate (B1-B2)</h4>
            <p>Good command of the language. Can handle most situations and express yourself fairly well.</p>
            <ul>
              <li>Understand main points of clear standard input</li>
              <li>Deal with most situations likely to arise</li>
              <li>Produce simple connected text on familiar topics</li>
            </ul>
          </div>
          <div className="proficiency-level-item">
            <h4><i className="fas fa-trophy"></i> Advanced (C1-C2)</h4>
            <p>Excellent command of the language. Can express yourself fluently and understand complex topics.</p>
            <ul>
              <li>Understand a wide range of demanding texts</li>
              <li>Express ideas fluently and spontaneously</li>
              <li>Use language flexibly and effectively</li>
            </ul>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Calculator">
        <p>Follow these steps to get your language level assessment:</p>
        
        <h3>Step 1: Select Your Language</h3>
        <ul className="usage-steps">
          <li><strong>Choose Language:</strong> Select the language you want to test from the dropdown menu</li>
          <li><strong>Consider Variants:</strong> Choose between UK English, US English, or General English based on your learning background</li>
          <li><strong>Be Honest:</strong> Select the language variant you're most familiar with for accurate results</li>
        </ul>

        <h3>Step 2: Take the Assessment</h3>
        <ul className="usage-steps">
          <li><strong>Read Carefully:</strong> Take time to understand each question and all answer options</li>
          <li><strong>Answer Honestly:</strong> Choose the option that best reflects your knowledge, not what you think is correct</li>
          <li><strong>Don't Guess:</strong> If unsure, make your best educated guess based on your understanding</li>
        </ul>

        <h3>Step 3: Review Your Results</h3>
        <ul className="usage-steps">
          <li><strong>Understand Your Level:</strong> Review your proficiency level and what it means</li>
          <li><strong>Read Recommendations:</strong> Follow the personalized suggestions for improvement</li>
          <li><strong>Plan Next Steps:</strong> Use the results to guide your language learning journey</li>
        </ul>
      </ContentSection>

      <ContentSection id="calculation-method" title="Calculation Method">
        <p>
          The language level calculator uses a scoring system based on your performance across 15 carefully 
          crafted questions. Each question tests different aspects of language proficiency including grammar, 
          vocabulary, and usage patterns.
        </p>
        
        <div className="calculation-method-section">
          <h3>Scoring System</h3>
          <ul>
            <li><strong>Question Types:</strong> Grammar, vocabulary, sentence structure, and usage</li>
            <li><strong>Scoring:</strong> 1 point for each correct answer</li>
            <li><strong>Total Questions:</strong> 15 questions per language</li>
            <li><strong>Level Determination:</strong> Based on percentage of correct answers</li>
          </ul>
          
          <h3>Level Thresholds</h3>
          <ul>
            <li><strong>Advanced (C1-C2):</strong> 80% or higher (12+ correct answers)</li>
            <li><strong>Intermediate (B1-B2):</strong> 60-79% (9-11 correct answers)</li>
            <li><strong>Beginner (A1-A2):</strong> Below 60% (8 or fewer correct answers)</li>
          </ul>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: Advanced Level Profile</h3>
          <div className="example-solution">
            <p><strong>Language:</strong> English (General)</p>
            <p><strong>Score:</strong> 13/15 (86.7%)</p>
            <p><strong>Level:</strong> Advanced (C1-C2)</p>
            <p><strong>Description:</strong> Excellent command of the language with strong grammar and vocabulary knowledge</p>
            <p><strong>Recommendations:</strong> Focus on nuances, cultural aspects, and professional/academic language</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: Intermediate Level Profile</h3>
          <div className="example-solution">
            <p><strong>Language:</strong> French</p>
            <p><strong>Score:</strong> 10/15 (66.7%)</p>
            <p><strong>Level:</strong> Intermediate (B1-B2)</p>
            <p><strong>Description:</strong> Good command of the language with room for improvement in complex structures</p>
            <p><strong>Recommendations:</strong> Work on complex grammar structures and idiomatic expressions</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 3: Beginner Level Profile</h3>
          <div className="example-solution">
            <p><strong>Language:</strong> Spanish</p>
            <p><strong>Score:</strong> 6/15 (40%)</p>
            <p><strong>Level:</strong> Beginner (A1-A2)</p>
            <p><strong>Description:</strong> Basic understanding of the language with fundamental knowledge gaps</p>
            <p><strong>Recommendations:</strong> Focus on building vocabulary and basic grammar structures</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding your language level is crucial for several reasons:</p>
        <ul>
          <li><strong>Academic Success:</strong> Choosing appropriate language courses and programs</li>
          <li><strong>Professional Growth:</strong> Meeting job requirements and advancing in global careers</li>
          <li><strong>Cultural Integration:</strong> Better communication and understanding in multicultural environments</li>
          <li><strong>Personal Development:</strong> Building confidence in language use and cultural exchange</li>
          <li><strong>Learning Efficiency:</strong> Identifying strengths and weaknesses for targeted improvement</li>
          <li><strong>Goal Setting:</strong> Setting realistic and achievable language learning objectives</li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our Language Level Calculator provides comprehensive functionality:</p>
        <ul>
          <li><strong>Multi-Language Support:</strong> Tests for English variants, French, Spanish, German, Arabic, and Swiss German</li>
          <li><strong>Comprehensive Assessment:</strong> 15 carefully crafted questions covering grammar, vocabulary, and usage</li>
          <li><strong>CEFR Alignment:</strong> Results aligned with Common European Framework of Reference for Languages</li>
          <li><strong>Detailed Feedback:</strong> Personalized recommendations based on your proficiency level</li>
          <li><strong>Progress Tracking:</strong> Visual progress indicators and question counters</li>
          <li><strong>Mobile Friendly:</strong> Responsive design for testing on any device</li>
          <li><strong>Multiple Variants:</strong> Support for different English variants (UK, US, General)</li>
          <li><strong>Educational Content:</strong> Comprehensive information about language proficiency levels</li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-graduation-cap"></i> Educational Planning</h4>
            <p>Determine appropriate course levels and learning paths for language education programs</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-briefcase"></i> Career Development</h4>
            <p>Assess language skills for job applications, promotions, and international assignments</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-plane"></i> Immigration & Travel</h4>
            <p>Prepare for language requirements in immigration processes and international travel</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-certificate"></i> Certification Preparation</h4>
            <p>Identify readiness for official language proficiency tests and certification exams</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-users"></i> Cultural Integration</h4>
            <p>Better understand your language abilities for living and working in different countries</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-book"></i> Learning Assessment</h4>
            <p>Track your language learning progress and identify areas for improvement</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection faqs={faqData} />
    </ToolPageLayout>
  );
};

export default LanguageLevelCalculator;
