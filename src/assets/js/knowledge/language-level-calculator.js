// Language Level Calculator Logic
class LanguageLevelCalculator {
  constructor() {
    this.currentQuestion = 0;
    this.score = 0;
    this.currentLanguage = '';
    this.questions = [];

    // Complete language tests database
    this.languageTests = {
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
    this.levelDescriptions = {
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

    this.initializeElements();
    this.attachEventListeners();
  }

  initializeElements() {
    this.languageSelect = document.getElementById('language-select');
    this.testSection = document.getElementById('test-section');
    this.resultSection = document.getElementById('result-section');
    this.nextButton = document.getElementById('next-button');
    this.restartButton = document.getElementById('restart-test');
    this.questionContainer = document.querySelector('.question-container');
    this.progressBar = document.querySelector('.progress');
    this.questionCounter = document.querySelector('.question-counter');
  }

  attachEventListeners() {
    if (this.languageSelect) {
      this.languageSelect.addEventListener('change', (e) => {
        if (e.target.value) {
          this.currentLanguage = e.target.value;
          this.questions = this.languageTests[this.currentLanguage];
          this.startTest();
        }
      });
    }

    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => {
        this.nextQuestion();
      });
    }

    if (this.restartButton) {
      this.restartButton.addEventListener('click', () => {
        this.restartTest();
      });
    }
  }

  startTest() {
    // Reset test state
    this.currentQuestion = 0;
    this.score = 0;
    
    // Show test section and hide result section
    if (this.testSection) this.testSection.style.display = 'block';
    if (this.resultSection) this.resultSection.style.display = 'none';
    
    // Display first question
    this.displayQuestion();
  }

  displayQuestion() {
    if (!this.questions || !this.questionContainer) return;
    
    const question = this.questions[this.currentQuestion];
    
    if (this.questionCounter) {
      this.questionCounter.textContent = `Question ${this.currentQuestion + 1}/15`;
    }
    
    if (this.progressBar) {
      this.progressBar.style.width = `${((this.currentQuestion + 1) / 15) * 100}%`;
    }

    this.questionContainer.innerHTML = `
      <h3 class="question-text">${question.question}</h3>
      <div class="options-grid">
        ${question.options.map((option, index) => `
          <div class="option-container">
            <input type="radio" id="option${index}" name="answer" value="${index}">
            <label for="option${index}">${option}</label>
          </div>
        `).join('')}
      </div>
    `;
  }

  nextQuestion() {
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    
    if (!selectedOption) {
      alert('Please select an answer');
      return;
    }

    if (parseInt(selectedOption.value) === this.questions[this.currentQuestion].correct) {
      this.score++;
    }

    this.currentQuestion++;

    if (this.currentQuestion < 15) {
      this.displayQuestion();
    } else {
      this.showResults();
    }
  }

  showResults() {
    if (this.testSection) this.testSection.style.display = 'none';
    if (this.resultSection) this.resultSection.style.display = 'block';

    let level;
    const percentage = (this.score / 15) * 100;

    if (percentage >= 80) {
      level = 'advanced';
    } else if (percentage >= 60) {
      level = 'intermediate';
    } else {
      level = 'beginner';
    }

    const levelInfo = this.levelDescriptions[level];

    if (this.resultSection) {
      this.resultSection.querySelector('.result-display').innerHTML = `
        <div class="level-badge ${level}">${levelInfo.title}</div>
        <div class="score-details">
          <p>Score: ${this.score}/15 (${percentage.toFixed(1)}%)</p>
        </div>
        <div class="level-description">
          <p>${levelInfo.description}</p>
        </div>
        <div class="recommendations">
          <h4>Recommendations:</h4>
          <p>${levelInfo.recommendations}</p>
        </div>
      `;
    }
  }

  restartTest() {
    if (this.languageSelect) this.languageSelect.value = '';
    if (this.testSection) this.testSection.style.display = 'none';
    if (this.resultSection) this.resultSection.style.display = 'none';
    
    // Reset state
    this.currentQuestion = 0;
    this.score = 0;
    this.currentLanguage = '';
    this.questions = [];
  }
}

// Initialize the calculator when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
  new LanguageLevelCalculator();
});

