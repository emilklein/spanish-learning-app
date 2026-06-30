/* ==========================================================================
   ¡Hola! Spanish Learning Web App - Core Logic
   ========================================================================== */

// --- Global App State ---
const state = {
    // Current progress on each module (saved in localStorage)
    progress: {
        saludos: 0, // 0 = not started, 50 = in progress, 100 = completed
        familia: 0,
        casa: 0,
        rutina: 0,
        gustos: 0
    },
    // Global setting for text-to-speech auto playback
    ttsActive: true,
    // Available TTS voices
    voices: [],
    spanishVoice: null,
    
    // Ser vs Estar practice game database
    serEstarIndex: 0,
    serEstarScore: 0,
    serEstarDatabase: [
        { sentence: "Juan ________ de Colombia.", translation: "Juan is from Colombia.", optionSer: "es", optionEstar: "está", correct: "es", explanation: "Usamos 'es' (Ser) porque se refiere al origen o procedencia de una persona." },
        { sentence: "Yo ________ muy cansado hoy.", translation: "I am very tired today.", optionSer: "soy", optionEstar: "estoy", correct: "estoy", explanation: "Usamos 'estoy' (Estar) porque describe un estado físico o emocional temporal." },
        { sentence: "Nosotros ________ en la escuela.", translation: "We are at the school.", optionSer: "somos", optionEstar: "estamos", correct: "estamos", explanation: "Usamos 'estamos' (Estar) porque indica ubicación o localización física." },
        { sentence: "París ________ la capital de Francia.", translation: "Paris is the capital of France.", optionSer: "es", optionEstar: "está", correct: "es", explanation: "Usamos 'es' (Ser) porque describe una característica intrínseca o identidad." },
        { sentence: "Ellas ________ muy inteligentes.", translation: "They are very smart.", optionSer: "son", optionEstar: "están", correct: "son", explanation: "Usamos 'son' (Ser) porque describe una cualidad o característica inherente de la persona." },
        { sentence: "El café ________ frío.", translation: "The coffee is cold.", optionSer: "es", optionEstar: "está", correct: "está", explanation: "Usamos 'está' (Estar) porque se refiere al estado temporal de una comida o bebida." },
        { sentence: "Tú ________ médico en el hospital.", translation: "You are a doctor at the hospital.", optionSer: "eres", optionEstar: "estás", correct: "eres", explanation: "Usamos 'eres' (Ser) porque se refiere a una profesión estable o identidad laboral." },
        { sentence: "Los libros ________ sobre la mesa.", translation: "The books are on the table.", optionSer: "son", optionEstar: "están", correct: "están", explanation: "Usamos 'están' (Estar) porque describe la ubicación espacial de los objetos." },
        { sentence: "Hoy ________ lunes.", translation: "Today is Monday.", optionSer: "es", optionEstar: "está", correct: "es", explanation: "Usamos 'es' (Ser) para indicar el tiempo, las fechas y los días de la semana." },
        { sentence: "¿Cómo ________ tú?", translation: "How are you?", optionSer: "eres", optionEstar: "estás", correct: "estás", explanation: "Usamos 'estás' (Estar) para preguntar por el estado de salud o ánimo de alguien." }
    ],

    // Family Tree Database
    familyData: {
        abuelo: {
            title: "El abuelo",
            en: "Grandfather",
            phraseEs: "Mi abuelo se llama Alberto y tiene ochenta años.",
            phraseEn: "My grandfather's name is Alberto and he is eighty years old.",
            avatar: "👴"
        },
        abuela: {
            title: "La abuela",
            en: "Grandmother",
            phraseEs: "Mi abuela es muy amable y hace pasteles deliciosos.",
            phraseEn: "My grandmother is very kind and makes delicious cakes.",
            avatar: "👵"
        },
        padre: {
            title: "El padre",
            en: "Father",
            phraseEs: "Mi padre es alto y trabaja en una oficina.",
            phraseEn: "My father is tall and works in an office.",
            avatar: "👨"
        },
        madre: {
            title: "La madre",
            en: "Mother",
            phraseEs: "Mi madre es simpática, inteligente y le gusta leer.",
            phraseEn: "My mother is nice, intelligent, and likes to read.",
            avatar: "👩"
        },
        tio: {
            title: "El tío",
            en: "Uncle",
            phraseEs: "Mi tío vive en España y es conductor de trenes.",
            phraseEn: "My uncle lives in Spain and is a train driver.",
            avatar: "🧔"
        },
        hermano: {
            title: "El hermano",
            en: "Brother",
            phraseEs: "Mi hermano menor estudia en la escuela secundaria.",
            phraseEn: "My younger brother studies in secondary school.",
            avatar: "👦"
        },
        hermana: {
            title: "La hermana",
            en: "Sister",
            phraseEs: "Esta es mi hermana, se llama Lucía y es muy divertida.",
            phraseEn: "This is my sister, her name is Lucía and she is very funny.",
            avatar: "👧"
        },
        primo: {
            title: "El primo",
            en: "Cousin",
            phraseEs: "Mi primo juega al fútbol conmigo los fines de semana.",
            phraseEn: "My cousin plays soccer with me on weekends.",
            avatar: "🧑"
        }
    },

    // Furniture Association game state
    furnitureGame: {
        selectedItem: null,
        matchesCount: 0,
        totalItems: 12
    },

    // Chatbot workflow with Sofia
    chatIndex: 0,
    chatAnswers: {}
};

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
    loadProgress();
    initTTS();
    initTabNavigation();
    initFlashcards();
    initSandboxes();
    initQuizzes();
    initSerEstarGame();
    initFamilyTree();
    initFurnitureGame();
    initChatbot();
    initModal();
    initInfinitePractice();
    updateUI();
});

// --- Text-To-Speech Engine (Web Speech API) ---
function initTTS() {
    const ttsBtn = document.getElementById("tts-toggle-btn");
    const ttsText = document.getElementById("tts-status-text");

    // Load available voices
    const populateVoices = () => {
        try {
            state.voices = window.speechSynthesis.getVoices();
            if (state.voices && state.voices.length > 0) {
                // Find Spanish voice, prefer Spain or Latin American accent if available
                state.spanishVoice = state.voices.find(v => v.lang === "es-ES") || 
                                     state.voices.find(v => v.lang.startsWith("es-")) || 
                                     state.voices[0];
            }
        } catch (e) {
            console.error("Error loading voices:", e);
        }
    };
    
    populateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = populateVoices;
    }

    // Toggle Speech Button
    ttsBtn.addEventListener("click", () => {
        state.ttsActive = !state.ttsActive;
        if (state.ttsActive) {
            ttsBtn.classList.add("text-active");
            ttsText.innerText = "Voz Activa";
            speakWord("Voz activada");
        } else {
            ttsBtn.classList.remove("text-active");
            ttsText.innerText = "Voz Silenciada";
            window.speechSynthesis.cancel(); // Stop talking immediately
        }
    });

    // Make elements with data-speak pronounceable
    document.body.addEventListener("click", (e) => {
        const speakEl = e.target.closest("[data-speak]");
        if (speakEl) {
            // If it's a sound icon on a flashcard, prevent flipping the card
            if (e.target.classList.contains("card-sound")) {
                e.stopPropagation();
            }
            const textToSpeak = speakEl.getAttribute("data-speak");
            speakWord(textToSpeak);
        }
    });

    // Add explicit click handler to static data-speak elements to ensure touch device bubbling
    document.querySelectorAll(".vocab-row[data-speak], .color-swatch[data-speak]").forEach(el => {
        el.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent double trigger with body handler
            const textToSpeak = el.getAttribute("data-speak");
            speakWord(textToSpeak);
        });
    });
}

function speakWord(text) {
    if (!state.ttsActive) return;

    try {
        window.speechSynthesis.cancel(); // Cancel current utterances

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Asynchronous fallback: reload voices if they weren't loaded yet
        if (!state.spanishVoice || !state.voices || state.voices.length === 0) {
            state.voices = window.speechSynthesis.getVoices();
            if (state.voices && state.voices.length > 0) {
                state.spanishVoice = state.voices.find(v => v.lang === "es-ES") || 
                                     state.voices.find(v => v.lang.startsWith("es-")) || 
                                     state.voices[0];
            }
        }

        if (state.spanishVoice) {
            utterance.voice = state.spanishVoice;
        }
        
        utterance.lang = "es-ES";
        utterance.rate = 0.85; // Slightly slower for foreign language learners
        utterance.pitch = 1.0;

        window.speechSynthesis.speak(utterance);
    } catch (err) {
        console.error("Speech synthesis failed:", err);
    }
}

// --- Navigation Tabs ---
function initTabNavigation() {
    const tabs = document.querySelectorAll(".nav-tab");
    const panes = document.querySelectorAll(".tab-pane");

    // Main App SPA Navigation
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const targetTab = tab.getAttribute("data-tab");
            
            // Check if tab is locked (Module 2-5 locked until previous is done)
            if (tab.id && isModuleLocked(targetTab)) {
                // Flash alert or warning
                alert("🔒 Este módulo está bloqueado. Completa las lecciones y cuestionarios anteriores para desbloquearlo.");
                return;
            }

            tabs.forEach(t => t.classList.remove("active"));
            panes.forEach(p => p.classList.remove("active"));

            tab.classList.add("active");
            const targetPane = document.getElementById(`pane-${targetTab}`);
            if (targetPane) targetPane.classList.add("active");

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Trigger action on sub-tab switch if needed
            if (targetTab === "gustos" && state.chatIndex === 0) {
                // restart chatbot if entering module 5 fresh
                resetChatbot();
            }
        });
    });

    // Sub-tab Navigation within modules
    document.querySelectorAll(".module-subnav").forEach(subnav => {
        const buttons = subnav.querySelectorAll(".subnav-btn");
        const container = subnav.closest(".tab-pane");

        buttons.forEach(btn => {
            btn.addEventListener("click", () => {
                const subtabId = btn.getAttribute("data-subtab");

                buttons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");

                // Toggle sub-panes
                const subpanes = container.querySelectorAll(".subtab-pane");
                subpanes.forEach(sp => sp.classList.remove("active"));

                const targetSubpane = container.querySelector(`#subpane-${subtabId}`);
                if (targetSubpane) targetSubpane.classList.add("active");
            });
        });
    });

    // Entry buttons on Dashboard cards
    document.querySelectorAll(".module-card").forEach(card => {
        const startBtn = card.querySelector(".start-btn");
        const modName = card.getAttribute("data-module");
        if (startBtn) {
            startBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const matchingTab = document.getElementById(`tab-${modName}`);
                if (matchingTab) matchingTab.click();
            });
        }
    });
}

function isModuleLocked(moduleName) {
    if (moduleName === "dashboard" || moduleName === "saludos" || moduleName === "practica") return false;
    if (moduleName === "familia") return state.progress.saludos < 100;
    if (moduleName === "casa") return state.progress.familia < 100;
    if (moduleName === "rutina") return state.progress.casa < 100;
    if (moduleName === "gustos") return state.progress.rutina < 100;
    return true;
}

// --- Flashcards ---
function initFlashcards() {
    // Make cards flip on click
    const cards = document.querySelectorAll(".flashcard");
    cards.forEach(card => {
        card.addEventListener("click", (e) => {
            // Don't flip if clicking sound icon
            if (e.target.classList.contains("card-sound")) return;
            card.classList.toggle("flipped");
        });
    });
}

// --- Interactive Sandboxes ---
function initSandboxes() {
    // Sandbox 1: Personal Introductions
    const pName = document.getElementById("present-name");
    const pCountry = document.getElementById("present-country");
    const pJob = document.getElementById("present-job");
    const pPreview = document.getElementById("present-preview-text");
    const btnSpeakP = document.getElementById("btn-speak-presentation");

    const updatePresentationText = () => {
        const name = pName.value.trim() || "...";
        const country = pCountry.value.trim() || "...";
        const job = pJob.value;
        
        let jobSpan = "";
        switch(job) {
            case "estudiante": jobSpan = "estudiante"; break;
            case "profesor": jobSpan = "profesor/a"; break;
            case "médico": jobSpan = "médico/a"; break;
            case "ingeniero": jobSpan = "ingeniero/a"; break;
            case "artista": jobSpan = "artista"; break;
            case "diseñador": jobSpan = "diseñador/a"; break;
        }

        pPreview.innerText = `¡Hola! Me llamo ${name}, soy de ${country} y soy ${jobSpan}. ¡Mucho gusto!`;
    };

    if (pName && pCountry && pJob) {
        [pName, pCountry, pJob].forEach(el => el.addEventListener("input", updatePresentationText));
        btnSpeakP.addEventListener("click", () => speakWord(pPreview.innerText));
    }

    // Sandbox 2: Present family member / friend
    const relGenderRadios = document.querySelectorAll("input[name='rel-gender']");
    const relMember = document.getElementById("rel-member");
    const relName = document.getElementById("rel-name");
    const relTrait = document.getElementById("rel-trait");
    const relPreview = document.getElementById("rel-preview-text");
    const btnSpeakRel = document.getElementById("btn-speak-rel-presentation");

    const updateRelText = () => {
        const gender = document.querySelector("input[name='rel-gender']:checked").value;
        const memberVal = relMember.value; // e.g. "amigo" or "hermano"
        const name = relName.value.trim() || "...";
        const traitVal = relTrait.value.split("|"); // [masc, fem]
        
        let intro = "";
        let relation = "";
        let description = "";

        if (gender === "m") {
            intro = "Este es mi";
            relation = memberVal; // amigo, hermano, padre, primo, tío
            if (memberVal === "padre") relation = "padre";
            description = `Él es ${traitVal[0]}`;
        } else {
            intro = "Esta es mi";
            relation = memberVal;
            // Map relation to feminine
            if (memberVal === "amigo") relation = "amiga";
            else if (memberVal === "hermano") relation = "hermana";
            else if (memberVal === "padre") relation = "madre";
            else if (memberVal === "primo") relation = "prima";
            else if (memberVal === "tío") relation = "tía";
            
            description = `Ella es ${traitVal[1]}`;
        }

        relPreview.innerText = `${intro} ${relation}, se llama ${name}. ${description}.`;
    };

    if (relMember && relName && relTrait) {
        relGenderRadios.forEach(r => r.addEventListener("change", updateRelText));
        [relMember, relName, relTrait].forEach(el => el.addEventListener("input", updateRelText));
        btnSpeakRel.addEventListener("click", () => speakWord(relPreview.innerText));
        updateRelText(); // initial build
    }

    // Sandbox 3: Describe your house
    const homeType = document.getElementById("home-type");
    const homeRooms = document.getElementById("home-rooms");
    const homeGarden = document.getElementById("home-garden");
    const homePreview = document.getElementById("home-preview-text");
    const btnSpeakHome = document.getElementById("btn-speak-home");

    const updateHomeText = () => {
        const type = homeType.value.split("|")[0]; // "una casa grande"
        const rooms = homeRooms.value;
        const garden = homeGarden.value.split("|")[0]; // "con un jardín precioso"
        
        let roomText = rooms == 1 ? "1 dormitorio" : `${rooms} dormitorios`;

        homePreview.innerText = `Yo vivo en ${type}. Tiene ${roomText} y es ${garden}.`;
    };

    if (homeType && homeRooms && homeGarden) {
        [homeType, homeRooms, homeGarden].forEach(el => el.addEventListener("input", updateHomeText));
        btnSpeakHome.addEventListener("click", () => speakWord(homePreview.innerText));
        updateHomeText(); // initial build
    }

    // Sandbox 4: Reflexive conjugations
    const reflexPronoun = document.getElementById("reflex-pronoun");
    const reflexVerb = document.getElementById("reflex-verb");
    const reflexPreview = document.getElementById("reflex-preview-text");
    const btnSpeakReflex = document.getElementById("btn-speak-reflex");

    const updateReflexText = () => {
        const pronounInfo = reflexPronoun.value.split("|"); // [pronoun, conjug1, conjug2, conjug3]
        const verbVal = reflexVerb.value; // "levantar" or "duchar" or "cepillo"
        
        let verbConjugated = "";
        let ending = " por la mañana.";

        // Choose which index of conjugated verb based on the selection
        let verbIdx = 1;
        if (verbVal === "duchar") verbIdx = 2;
        else if (verbVal === "cepillo") verbIdx = 3;

        verbConjugated = pronounInfo[verbIdx];

        let subjectStr = "";
        switch (pronounInfo[0]) {
            case "me": subjectStr = "Yo me"; break;
            case "te": subjectStr = "Tú te"; break;
            case "se": 
                subjectStr = pronounInfo[1] === "levanta" ? "Él/Ella se" : "Ellos/Ellas se"; 
                break;
            case "nos": subjectStr = "Nosotros nos"; break;
        }

        // special case for brushing teeth
        if (verbVal === "cepillo") {
            ending = " los dientes hoy.";
        }

        reflexPreview.innerText = `${subjectStr} ${verbConjugated}${ending}`;
    };

    if (reflexPronoun && reflexVerb) {
        [reflexPronoun, reflexVerb].forEach(el => el.addEventListener("input", updateReflexText));
        btnSpeakReflex.addEventListener("click", () => speakWord(reflexPreview.innerText));
        updateReflexText();
    }

    // Sandbox 5: Gustar Preferences
    const gustarWho = document.getElementById("gustar-who");
    const gustarWhat = document.getElementById("gustar-what");
    const gustarPreview = document.getElementById("gustar-preview-text");
    const btnSpeakGustar = document.getElementById("btn-speak-gustar");

    const updateGustarText = () => {
        const who = gustarWho.value.split("|")[0]; // "Me gusta"
        const what = gustarWhat.value.split("|")[0]; // "mucho la música española"

        gustarPreview.innerText = `${who} ${what}.`;
    };

    if (gustarWho && gustarWhat) {
        [gustarWho, gustarWhat].forEach(el => el.addEventListener("input", updateGustarText));
        btnSpeakGustar.addEventListener("click", () => speakWord(gustarPreview.innerText));
        updateGustarText();
    }

    // Sandbox 6: Routine Builder
    const selMorning = document.getElementById("sel-morning");
    const selAfternoon = document.getElementById("sel-afternoon");
    const selNight = document.getElementById("sel-night");
    const routinePreview = document.getElementById("routine-preview-text");
    const btnSpeakRoutine = document.getElementById("btn-speak-routine");

    const updateRoutineText = () => {
        const morning = selMorning.value.split("|")[0];
        const afternoon = selAfternoon.value.split("|")[0];
        const night = selNight.value.split("|")[0];

        routinePreview.innerText = `Por la mañana ${morning}. Por la tarde ${afternoon}. Por la noche ${night}.`;
    };

    if (selMorning && selAfternoon && selNight) {
        [selMorning, selAfternoon, selNight].forEach(el => el.addEventListener("input", updateRoutineText));
        btnSpeakRoutine.addEventListener("click", () => speakWord(routinePreview.innerText));
        updateRoutineText();
    }
}

// --- Ser vs Estar Practice Game ---
function initSerEstarGame() {
    loadSerEstarQuestion();
}

function loadSerEstarQuestion() {
    const item = state.serEstarDatabase[state.serEstarIndex];
    document.getElementById("serestar-sentence").innerText = item.sentence;
    document.getElementById("serestar-feedback").innerText = "";
    document.getElementById("serestar-feedback").className = "feedback-msg";
    
    // Generate option buttons dynamically
    const optionsContainer = document.getElementById("serestar-options");
    optionsContainer.innerHTML = `
        <button class="option-btn" id="opt-serestar-ser">${item.optionSer} (Ser)</button>
        <button class="option-btn" id="opt-serestar-estar">${item.optionEstar} (Estar)</button>
    `;
    
    // Bind click events
    optionsContainer.querySelector("#opt-serestar-ser").addEventListener("click", () => checkSerEstar(item.optionSer));
    optionsContainer.querySelector("#opt-serestar-estar").addEventListener("click", () => checkSerEstar(item.optionEstar));
}

function checkSerEstar(answer) {
    const item = state.serEstarDatabase[state.serEstarIndex];
    const feedback = document.getElementById("serestar-feedback");
    
    // disable buttons
    document.querySelectorAll("#serestar-options .option-btn").forEach(btn => {
        btn.disabled = true;
        const isCorrectBtn = btn.innerText.startsWith(item.correct + " ");
        if (isCorrectBtn) {
            btn.style.borderColor = "var(--accent-teal)";
            btn.style.color = "var(--accent-teal)";
        } else {
            btn.style.opacity = "0.5";
        }
    });

    if (answer === item.correct) {
        feedback.innerText = `¡Excelente! Correcto. ${item.explanation}`;
        feedback.className = "feedback-msg correct";
        speakWord("¡Correcto!");
    } else {
        feedback.innerText = `Incorrecto. La respuesta correcta es '${item.correct}'. ${item.explanation}`;
        feedback.className = "feedback-msg incorrect";
        speakWord("Incorrecto.");
        
        // Find user choice button and color it red
        document.querySelectorAll("#serestar-options .option-btn").forEach(btn => {
            if (btn.innerText.startsWith(answer + " ")) {
                btn.style.borderColor = "var(--accent-red)";
                btn.style.color = "var(--accent-red)";
            }
        });
    }

    // Check if it's the last question
    const isLastQuestion = state.serEstarIndex === state.serEstarDatabase.length - 1;

    // Go to next question or end game after 5 seconds
    setTimeout(() => {
        if (isLastQuestion) {
            // Show congratulations screen inside the game-card
            const card = document.querySelector(".interactive-game-box .game-card");
            card.innerHTML = `
                <div style="font-size: 3rem; margin-bottom: 15px;">🎉</div>
                <h4 style="color: var(--accent-teal); font-size: 1.4rem; margin-bottom: 10px;">¡Desafío Completado!</h4>
                <p style="margin-bottom: 20px; color: var(--text-secondary);">¡Felicidades! Has terminado el ejercicio de Ser y Estar con éxito.</p>
                <button class="primary-btn" id="btn-restart-serestar">Volver a Jugar</button>
            `;
            speakWord("¡Felicidades! Has completado el ejercicio.");

            card.querySelector("#btn-restart-serestar").addEventListener("click", () => {
                // Reset state and restore structure
                state.serEstarIndex = 0;
                card.innerHTML = `
                    <div class="game-sentence" id="serestar-sentence"></div>
                    <div class="game-options" id="serestar-options"></div>
                    <div id="serestar-feedback" class="feedback-msg"></div>
                `;
                loadSerEstarQuestion();
            });
        } else {
            state.serEstarIndex++;
            loadSerEstarQuestion();
        }
    }, 5000);
}

// --- Family Tree Interaction ---
function initFamilyTree() {
    const nodes = document.querySelectorAll(".tree-node");
    nodes.forEach(node => {
        node.addEventListener("click", () => {
            const memberKey = node.getAttribute("data-member");
            showFamilyMember(memberKey);
            
            // Mark node as active
            nodes.forEach(n => n.classList.remove("active-member"));
            node.classList.add("active-member");
        });
    });
}

function showFamilyMember(memberKey) {
    const data = state.familyData[memberKey];
    if (!data) return;

    const placeholder = document.getElementById("family-details-placeholder");
    const content = document.getElementById("family-details-content");

    placeholder.style.display = "none";
    content.style.display = "block";

    document.getElementById("detail-avatar").innerText = data.avatar;
    document.getElementById("detail-title").innerText = `${data.title} (${data.en})`;
    document.getElementById("detail-phrase-es").innerText = `"${data.phraseEs}"`;
    document.getElementById("detail-phrase-en").innerText = `"${data.phraseEn}"`;

    // Speak single family vocabulary term
    speakWord(data.title);

    // Bind audio clicks
    const btnSpeakTerm = document.getElementById("btn-speak-family-member");
    const btnSpeakPhrase = document.getElementById("btn-speak-family-phrase");

    // Remove old event listeners by cloning nodes
    const newBtnTerm = btnSpeakTerm.cloneNode(true);
    const newBtnPhrase = btnSpeakPhrase.cloneNode(true);
    
    btnSpeakTerm.parentNode.replaceChild(newBtnTerm, btnSpeakTerm);
    btnSpeakPhrase.parentNode.replaceChild(newBtnPhrase, btnSpeakPhrase);

    newBtnTerm.addEventListener("click", () => speakWord(data.title));
    newBtnPhrase.addEventListener("click", () => speakWord(data.phraseEs));
}

// --- House Furniture Match Game ---
function initFurnitureGame() {
    const mueblesDatabase = [
        { id: "cama", room: "dormitorio", label: "La cama" },
        { id: "sofa", room: "salon", label: "El sofá" },
        { id: "nevera", room: "cocina", label: "La nevera" },
        { id: "ducha", room: "baño", label: "La ducha" },
        { id: "mesa", room: "salon", label: "La mesa" },
        { id: "flores", room: "jardin", label: "Las flores" },
        { id: "espejo", room: "baño", label: "El espejo" },
        { id: "armario", room: "dormitorio", label: "El armario" },
        { id: "microondas", room: "cocina", label: "El microondas" },
        { id: "inodoro", room: "baño", label: "El inodoro" },
        { id: "sillon", room: "salon", label: "El sillón" },
        { id: "planta", room: "jardin", label: "La planta" }
    ];

    const container = document.getElementById("furniture-items");
    const targets = document.querySelectorAll(".room-target");
    const statusText = document.getElementById("furniture-game-status");
    const resetBtn = document.getElementById("reset-furniture-game");

    if (!container) return;

    // Helper to render and bind furniture items
    const renderFurnitureItems = () => {
        container.innerHTML = "";
        
        // Shuffle items
        const shuffled = [...mueblesDatabase].sort(() => 0.5 - Math.random());
        
        shuffled.forEach(mueble => {
            const btn = document.createElement("button");
            btn.className = "game-item";
            btn.setAttribute("data-id", mueble.id);
            btn.setAttribute("data-room", mueble.room);
            btn.innerText = mueble.label;
            
            btn.addEventListener("click", () => {
                if (btn.classList.contains("correct-placement")) return;
                
                // Highlight selected item
                const allItems = container.querySelectorAll(".game-item");
                allItems.forEach(i => i.classList.remove("selected-item"));
                btn.classList.add("selected-item");
                state.furnitureGame.selectedItem = btn;

                speakWord(mueble.label);
                statusText.innerText = `Seleccionaste: ${mueble.label}. Ahora haz clic en la habitación donde va.`;

                // Highlight target rooms to guide user
                targets.forEach(t => t.classList.add("waiting-placement"));
            });

            container.appendChild(btn);
        });
    };

    // Initial render
    renderFurnitureItems();

    targets.forEach(target => {
        target.addEventListener("click", () => {
            const selected = state.furnitureGame.selectedItem;
            if (!selected) return;

            const expectedRoom = selected.getAttribute("data-room");
            const targetRoom = target.getAttribute("data-room");

            // Reset target visual cues
            targets.forEach(t => {
                t.classList.remove("waiting-placement", "placement-success", "placement-error");
            });

            if (expectedRoom === targetRoom) {
                // Correct match!
                selected.classList.remove("selected-item");
                selected.classList.add("correct-placement");
                target.classList.add("placement-success");
                
                const itemName = selected.innerText;
                const roomLabel = target.innerText;

                statusText.innerText = `¡Correcto! ${itemName} va en ${roomLabel.toLowerCase()}.`;
                speakWord("¡Correcto!");

                state.furnitureGame.matchesCount++;
                state.furnitureGame.selectedItem = null;

                if (state.furnitureGame.matchesCount === state.furnitureGame.totalItems) {
                    statusText.innerText = "🎉 ¡Felicidades! Has colocado todos los muebles correctamente.";
                    speakWord("¡Excelente trabajo! Has completado el juego.");
                    resetBtn.style.display = "inline-block";
                }
            } else {
                // Incorrect match
                target.classList.add("placement-error");
                statusText.innerText = `Ups, ese mueble no va ahí. ¡Intenta de nuevo!`;
                speakWord("Intenta otra vez.");
                
                setTimeout(() => {
                    target.classList.remove("placement-error");
                }, 800);
            }
        });
    });

    resetBtn.addEventListener("click", () => {
        state.furnitureGame.matchesCount = 0;
        state.furnitureGame.selectedItem = null;
        resetBtn.style.display = "none";
        statusText.innerText = "Selecciona un mueble para empezar.";

        // Re-render and shuffle all items
        renderFurnitureItems();

        targets.forEach(t => {
            t.classList.remove("waiting-placement", "placement-success", "placement-error");
        });
    });
}

// --- Chatbot with Sofia ---
function initChatbot() {
    resetChatbot();
}

function resetChatbot() {
    state.chatIndex = 0;
    state.chatAnswers = {};
    const chatMsgBox = document.getElementById("chat-messages-box");
    if (!chatMsgBox) return;

    chatMsgBox.innerHTML = `
        <div class="message incoming">
            <p>¡Hola! Soy Sofía. ¿Cómo estás hoy?</p>
        </div>
    `;
    
    showChatChoices([
        { text: "¡Hola Sofía! Estoy muy bien, gracias. ¿Y tú?", next: 1 },
        { text: "Hola. Estoy un poco cansado/a. ¿Cómo estás?", next: 1 }
    ]);
}

function showChatChoices(choices) {
    const choicesArea = document.getElementById("chat-choices-area");
    if (!choicesArea) return;

    choicesArea.innerHTML = "";
    choices.forEach(c => {
        const btn = document.createElement("button");
        btn.className = "chat-choice-btn";
        btn.innerText = c.text;
        btn.addEventListener("click", () => handleChatSelection(c));
        choicesArea.appendChild(btn);
    });
}

function handleChatSelection(choice) {
    const chatMsgBox = document.getElementById("chat-messages-box");
    
    // Add user response bubble
    const userBubble = document.createElement("div");
    userBubble.className = "message outgoing";
    userBubble.innerHTML = `<p>${choice.text}</p>`;
    chatMsgBox.appendChild(userBubble);
    
    // Scroll chat to bottom
    chatMsgBox.scrollTop = chatMsgBox.scrollHeight;

    // Speak user choice in Spanish
    speakWord(choice.text);

    // Disable input options during "typing" delay
    const choicesArea = document.getElementById("chat-choices-area");
    choicesArea.innerHTML = "<div style='color: var(--text-muted); font-style:italic;'>Sofía está escribiendo...</div>";

    setTimeout(() => {
        processChatbotLogic(choice.next, choice.text);
    }, 1500);
}

function processChatbotLogic(nextStep, userText) {
    const chatMsgBox = document.getElementById("chat-messages-box");
    let botMsg = "";
    let choices = [];

    switch(nextStep) {
        case 1: // Sofia replies to greetings and asks for origin
            botMsg = userText.includes("bien") 
                ? "¡Qué bueno! Yo también estoy excelente. Dime, ¿de dónde eres?" 
                : "Vaya, lo siento mucho. Espero que te recuperes pronto. Dime, ¿de dónde eres?";
            
            choices = [
                { text: "Yo soy de los Estados Unidos. ¿Y tú?", next: 2 },
                { text: "Soy de Inglaterra. ¿De dónde eres tú?", next: 2 },
                { text: "Soy de España, vivo en Madrid.", next: 2 }
            ];
            break;
        case 2: // Sofia replies about origin and asks about likes
            botMsg = "¡Qué gran país! Yo soy de Sevilla, España. Dime, ¿qué actividades te gusta hacer?";
            
            choices = [
                { text: "Me gusta mucho escuchar música en español.", next: 3 },
                { text: "Me gusta comer paella y viajar mucho.", next: 3 },
                { text: "No me gusta estudiar, me gusta dormir.", next: 3 }
            ];
            break;
        case 3: // Sofia replies about likes and asks about language count
            if (userText.includes("música")) {
                botMsg = "¡Excelente! La música en español es muy alegre y bonita. Por último, ¿cuántos idiomas hablas?";
            } else if (userText.includes("paella")) {
                botMsg = "¡Delicioso! La paella es mi plato favorito. Viajar es fantástico. Por último, ¿cuántos idiomas hablas?";
            } else {
                botMsg = "Haha, ¡dormir es genial! Pero aprender es importante. Por último, ¿cuántos idiomas hablas?";
            }
            
            choices = [
                { text: "Hablo inglés y ahora aprendo español.", next: 4 },
                { text: "Solo hablo un idioma, pero quiero hablar español.", next: 4 }
            ];
            break;
        case 4: // Sofia closes conversation
            botMsg = "¡Impresionante! El español es un idioma global y muy hermoso. ¡Vas a aprenderlo perfectamente! Ha sido un gran placer hablar contigo. ¡Hasta luego!";
            choices = [];
            
            // Mark module 5 interaction part complete
            if (state.progress.gustos < 50) {
                state.progress.gustos = 50;
                saveProgress();
                updateUI();
            }
            break;
    }

    // Add Sofia message bubble
    const botBubble = document.createElement("div");
    botBubble.className = "message incoming";
    botBubble.innerHTML = `<p>${botMsg}</p>`;
    chatMsgBox.appendChild(botBubble);
    
    // Scroll chat to bottom
    chatMsgBox.scrollTop = chatMsgBox.scrollHeight;

    // Speak Sofia reply
    speakWord(botMsg);

    // Render new choices
    if (choices.length > 0) {
        showChatChoices(choices);
    } else {
        const choicesArea = document.getElementById("chat-choices-area");
        choicesArea.innerHTML = `
            <div style="color: var(--accent-teal); font-weight: bold; text-align: center; padding: 10px;">
                💬 Conversación Finalizada ¡Buen trabajo!
            </div>
            <button class="secondary-btn" onclick="resetChatbot()" style="margin-top: 5px;">Reiniciar Conversación</button>
        `;
    }
}

// --- Quiz Engines ---
function initQuizzes() {
    // We have 5 modules, each has a quiz at the end of their tabs.
    for (let m = 1; m <= 5; m++) {
        const quizContainer = document.getElementById(`quiz-module${m}`);
        if (!quizContainer) continue;

        const options = quizContainer.querySelectorAll(".quiz-opt");
        const statusDots = quizContainer.querySelectorAll(".quiz-status-dots .dot");
        const cards = quizContainer.querySelectorAll(".quiz-question-card");
        const summary = quizContainer.querySelector(".quiz-result-summary");
        
        let currentQIndex = 0;
        let score = 0;

        options.forEach(opt => {
            opt.addEventListener("click", () => {
                const parentCard = opt.closest(".quiz-question-card");
                const isCorrect = opt.getAttribute("data-correct") === "true";
                
                // Disable option buttons for this question once answered
                parentCard.querySelectorAll(".quiz-opt").forEach(btn => btn.disabled = true);

                if (isCorrect) {
                    opt.classList.add("correct-choice");
                    score++;
                    speakWord("¡Correcto!");
                } else {
                    opt.classList.add("wrong-choice");
                    // Highlight the correct one
                    parentCard.querySelector(".quiz-opt[data-correct='true']").classList.add("correct-choice");
                    speakWord("Incorrecto.");
                }

                // Color the status dot
                if (statusDots[currentQIndex]) {
                    statusDots[currentQIndex].classList.add(isCorrect ? "completed" : "active");
                }

                // Proceed to next question or show summary after a delay
                setTimeout(() => {
                    parentCard.classList.remove("active");
                    currentQIndex++;

                    if (currentQIndex < cards.length) {
                        cards[currentQIndex].classList.add("active");
                        if (statusDots[currentQIndex]) statusDots[currentQIndex].classList.add("active");
                    } else {
                        // End of quiz
                        summary.style.display = "block";
                        quizContainer.querySelector(".quiz-status-dots").style.display = "none";
                        
                        const percent = Math.round((score / cards.length) * 100);
                        summary.querySelector("p").innerText = `Respondiste correctamente ${score} de ${cards.length} preguntas (${percent}%).`;

                        // Handle progression based on score
                        if (percent >= 70) {
                            summary.querySelector("h4").innerText = "¡Excelente trabajo! 🎉";
                            // Set progress to 100% for this module
                            const modKeys = ["saludos", "familia", "casa", "rutina", "gustos"];
                            const currentModKey = modKeys[m - 1];
                            
                            state.progress[currentModKey] = 100;
                            saveProgress();
                            updateUI();
                        } else {
                            summary.querySelector("h4").innerText = "Sigue practicando... ✍️";
                            summary.querySelector("p").innerHTML += "<br><span style='color: var(--accent-red);'>Necesitas al menos 70% para aprobar.</span>";
                            
                            // Replace continue button with a retry button
                            const cBtn = summary.querySelector(".primary-btn");
                            cBtn.innerText = "Reintentar Cuestionario";
                            cBtn.onclick = () => resetModuleQuiz(m);
                        }
                    }
                }, 2000);
            });
        });

        // Set up completion button links
        const compBtn = quizContainer.querySelector("#btn-complete-m" + m);
        if (compBtn) {
            compBtn.addEventListener("click", () => {
                const modKeys = ["saludos", "familia", "casa", "rutina", "gustos"];
                const nextModIndex = m; // equivalent to m+1 label in 0-index
                
                if (nextModIndex < modKeys.length) {
                    const nextTab = document.getElementById(`tab-${modKeys[nextModIndex]}`);
                    if (nextTab) nextTab.click();
                }
            });
        }
    }

    // Set up course final button (Diploma popup)
    const btnCompleteCourse = document.getElementById("btn-complete-course");
    if (btnCompleteCourse) {
        btnCompleteCourse.addEventListener("click", () => {
            // Prompt student name
            const studentName = prompt("Introduce tu nombre para tu Diploma:", "Estudiante de Español") || "Estudiante de Español";
            document.getElementById("diploma-student-name").innerText = studentName;
            
            // Show diploma modal
            document.getElementById("diploma-modal").classList.add("active");
            speakWord("¡Felicitaciones! Has completado el curso de español básico.");
        });
    }
}

function resetModuleQuiz(moduleNum) {
    const quizContainer = document.getElementById(`quiz-module${moduleNum}`);
    if (!quizContainer) return;

    // Reset variables and view
    const cards = quizContainer.querySelectorAll(".quiz-question-card");
    const options = quizContainer.querySelectorAll(".quiz-opt");
    const statusDots = quizContainer.querySelectorAll(".quiz-status-dots .dot");
    const summary = quizContainer.querySelector(".quiz-result-summary");

    summary.style.display = "none";
    quizContainer.querySelector(".quiz-status-dots").style.display = "flex";

    // Clear class lists & enable
    options.forEach(opt => {
        opt.disabled = false;
        opt.classList.remove("correct-choice", "wrong-choice");
    });

    statusDots.forEach(dot => {
        dot.className = "dot";
    });
    
    cards.forEach(c => c.classList.remove("active"));

    // Activate first question
    cards[0].classList.add("active");
    statusDots[0].classList.add("active");

    // Re-bind click event or reinitialize quiz tracker inside the closure scope
    initQuizzes();
}

// --- Modal Handling ---
function initModal() {
    const modal = document.getElementById("diploma-modal");
    const closeBtn = document.getElementById("btn-close-modal");
    const restartBtn = document.getElementById("btn-restart-progress");

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            modal.classList.remove("active");
        });
    }

    if (restartBtn) {
        restartBtn.addEventListener("click", () => {
            if (confirm("¿Estás seguro/a de que quieres reiniciar todo tu progreso? Esto borrará tu avance actual.")) {
                state.progress = { saludos: 0, familia: 0, casa: 0, rutina: 0, gustos: 0 };
                saveProgress();
                modal.classList.remove("active");
                
                // Reset quiz views too
                for (let i = 1; i <= 5; i++) {
                    resetModuleQuiz(i);
                }
                
                updateUI();
                
                // Click dashboard tab
                document.querySelector(".nav-tab[data-tab='dashboard']").click();
            }
        });
    }
}

// --- Local Storage Progress Tracking ---
function saveProgress() {
    localStorage.setItem("hola_spanish_progress", JSON.stringify(state.progress));
}

function loadProgress() {
    const saved = localStorage.getItem("hola_spanish_progress");
    if (saved) {
        try {
            state.progress = JSON.parse(saved);
        } catch(e) {
            console.error("Error loading progress", e);
        }
    }
}

// --- UI Sync & Progress Bar Updating ---
function updateUI() {
    const modKeys = ["saludos", "familia", "casa", "rutina", "gustos"];
    let totalScore = 0;
    
    modKeys.forEach((key, idx) => {
        const modProgress = state.progress[key];
        totalScore += modProgress;

        // Update individual card bars on dashboard
        const fillBar = document.getElementById(`fill-${key}`);
        const statusLabel = document.getElementById(`status-label-${key}`);
        const modCard = document.getElementById(`mod-card-${key}`);
        const startBtn = document.getElementById(`btn-start-${key}`);

        if (fillBar) fillBar.style.width = `${modProgress}%`;

        // Update lock icons and status texts
        const isLocked = isModuleLocked(key);
        
        if (modCard) {
            if (isLocked) {
                modCard.classList.add("locked");
                if (statusLabel) statusLabel.innerText = "Bloqueado 🔒";
                if (startBtn) {
                    startBtn.disabled = true;
                    startBtn.innerText = "Bloqueado";
                }
            } else {
                modCard.classList.remove("locked");
                if (startBtn) {
                    startBtn.disabled = false;
                    startBtn.innerText = "Entrar";
                }
                
                if (statusLabel) {
                    if (modProgress === 100) {
                        statusLabel.innerText = "Completado ✅";
                        statusLabel.style.color = "var(--accent-teal)";
                    } else if (modProgress > 0) {
                        statusLabel.innerText = "En curso ✍️";
                        statusLabel.style.color = "var(--accent-gold)";
                    } else {
                        statusLabel.innerText = "Pendiente";
                        statusLabel.style.color = "var(--text-muted)";
                    }
                }
            }
        }
    });

    // Global Progress percentage
    const globalPercent = Math.round(totalScore / modKeys.length);
    const globalPercentEl = document.getElementById("global-progress-percentage");
    const globalFillBar = document.getElementById("global-progress-fill");

    if (globalPercentEl) globalPercentEl.innerText = `${globalPercent}%`;
    if (globalFillBar) globalFillBar.style.width = `${globalPercent}%`;
}

// ==========================================================================
// PESTAÑA: PRÁCTICA INFINITA (DYNAMIC GRAMMAR & VOCABULARY ENGINE)
// ==========================================================================

// Global state variables for practice
state.practicaStreak = 0;
state.practicaCorrect = 0;
state.practicaCount = 0;            // Questions in current set
state.practicaSessionCorrect = 0;   // Correct answers in current set (max 10)
state.currentExercise = null;

// Database for algorithmic generation
const bancoDeDatosPractica = {
    regulares: {
        verbos: [
            { infinitivo: "hablar", raiz: "habl", terminacion: "ar", complementos: ["español en casa", "con la profesora", "mucho en clase"] },
            { infinitivo: "comer", raiz: "com", terminacion: "er", complementos: ["paella los domingos", "manzanas rojas", "tapas en el bar"] },
            { infinitivo: "vivir", raiz: "viv", terminacion: "ir", complementos: ["en Sevilla", "en una casa bonita", "en un piso moderno"] },
            { infinitivo: "estudiar", raiz: "estudi", terminacion: "ar", complementos: ["español por las tardes", "mucho en la biblioteca", "gramática"] },
            { infinitivo: "escribir", raiz: "escrib", terminacion: "ir", complementos: ["un correo", "un mensaje en el móvil", "una carta"] },
            { infinitivo: "leer", raiz: "le", terminacion: "er", complementos: ["un libro de aventuras", "el periódico", "un correo electrónico"] },
            { infinitivo: "trabajar", raiz: "trabaj", terminacion: "ar", complementos: ["en una oficina", "en el hospital", "muchas horas"] }
        ],
        pronombres: [
            { sujeto: "Yo", endings: { ar: "o", er: "o", ir: "o" } },
            { sujeto: "Tú", endings: { ar: "as", er: "es", ir: "es" } },
            { sujeto: "Él", endings: { ar: "a", er: "e", ir: "e" } },
            { sujeto: "Ella", endings: { ar: "a", er: "e", ir: "e" } },
            { sujeto: "Nosotros", endings: { ar: "amos", er: "emos", ir: "imos" } },
            { sujeto: "Nosotras", endings: { ar: "amos", er: "emos", ir: "imos" } },
            { sujeto: "Ellos", endings: { ar: "an", er: "en", ir: "en" } },
            { sujeto: "Ellas", endings: { ar: "an", er: "en", ir: "en" } }
        ]
    },
    irregulares: {
        verbos: {
            ser: {
                yo: "soy", tu: "eres", el: "es", ella: "es", nosotros: "somos", nosotras: "somos", ellos: "son", ellas: "son",
                complements: [
                    { singular_masc: "de España", singular_fem: "de España", plural_masc: "de España", plural_fem: "de España" },
                    { singular_masc: "médico en un hospital", singular_fem: "médica en un hospital", plural_masc: "médicos en un hospital", plural_fem: "médicas en un hospital" },
                    { singular_masc: "un estudiante muy trabajador", singular_fem: "una estudiante muy trabajadora", plural_masc: "unos estudiantes muy trabajadores", plural_fem: "unas estudiantes muy trabajadoras" },
                    { singular_masc: "el hermano mayor de Juan", singular_fem: "la hermana mayor de Juan", plural_masc: "los hermanos mayores de Juan", plural_fem: "las hermanas mayores de Juan" }
                ]
            },
            estar: {
                yo: "estoy", tu: "estás", el: "está", ella: "está", nosotros: "estamos", nosotras: "estamos", ellos: "están", ellas: "están",
                complements: [
                    { singular_masc: "muy cansado hoy", singular_fem: "muy cansada hoy", plural_masc: "muy cansados hoy", plural_fem: "muy cansadas hoy" },
                    { singular_masc: "en el salón leyendo un libro", singular_fem: "en el salón leyendo un libro", plural_masc: "en el salón leyendo un libro", plural_fem: "en el salón leyendo un libro" },
                    { singular_masc: "en la cocina preparando la cena", singular_fem: "en la cocina preparando la cena", plural_masc: "en la cocina preparando la cena", plural_fem: "en la cocina preparando la cena" },
                    { singular_masc: "feliz con las lecciones", singular_fem: "feliz con las lecciones", plural_masc: "felices con las lecciones", plural_fem: "felices con las lecciones" }
                ]
            },
            tener: {
                yo: "tengo", tu: "tienes", el: "tiene", ella: "tiene", nosotros: "tenemos", nosotras: "tenemos", ellos: "tienen", ellas: "tienen",
                complements: [
                    { singular_masc: "veinte años", singular_fem: "veinte años", plural_masc: "veinte años", plural_fem: "veinte años" },
                    { singular_masc: "dos hermanos y una hermana", singular_fem: "dos hermanos y una hermana", plural_masc: "dos hermanos y una hermana", plural_fem: "dos hermanos y una hermana" },
                    { singular_masc: "un perro negro muy simpático", singular_fem: "un perro negro muy simpático", plural_masc: "un perro negro muy simpático", plural_fem: "un perro negro muy simpático" },
                    { singular_masc: "una casa de campo antigua", singular_fem: "una casa de campo antigua", plural_masc: "una casa de campo antigua", plural_fem: "una casa de campo antigua" }
                ]
            },
            ir: {
                yo: "voy", tu: "vas", el: "va", ella: "va", nosotros: "vamos", nosotras: "vamos", ellos: "van", ellas: "van",
                complements: [
                    { singular_masc: "al trabajo en coche", singular_fem: "al trabajo en coche", plural_masc: "al trabajo en coche", plural_fem: "al trabajo en coche" },
                    { singular_masc: "a la escuela a aprender español", singular_fem: "a la escuela a aprender español", plural_masc: "a la escuela a aprender español", plural_fem: "a la escuela a aprender español" },
                    { singular_masc: "al supermercado a comprar fruta", singular_fem: "al supermercado a comprar fruta", plural_masc: "al supermercado a comprar fruta", plural_fem: "al supermercado a comprar fruta" },
                    { singular_masc: "de vacaciones hoy", singular_fem: "de vacaciones hoy", plural_masc: "de vacaciones hoy", plural_fem: "de vacaciones hoy" }
                ]
            }
        },
        pronombres: [
            { sujeto: "Yo", gender: "masc", number: "singular" },
            { sujeto: "Tú", gender: "masc", number: "singular" },
            { sujeto: "Él", gender: "masc", number: "singular" },
            { sujeto: "Ella", gender: "fem", number: "singular" },
            { sujeto: "Nosotros", gender: "masc", number: "plural" },
            { sujeto: "Nosotras", gender: "fem", number: "plural" },
            { sujeto: "Ellos", gender: "masc", number: "plural" },
            { sujeto: "Ellas", gender: "fem", number: "plural" }
        ]
    },
    reflexivos: {
        verbos: [
            { infinitivo: "despertarse", raiz: "despiert", pronombres: { yo: "me despierto", tu: "te despiertas", el: "se despierta", ella: "se despierta", nosotros: "nos despertamos", nosotras: "nos despertamos", ellos: "se despiertan", ellas: "se despiertan" }, complementos: ["temprano a las seis", "tarde los domingos por la mañana"] },
            { infinitivo: "levantarse", raiz: "levant", pronombres: { yo: "me levanto", tu: "te levantas", el: "se levanta", ella: "se levanta", nosotros: "nos levantamos", nosotras: "nos levantamos", ellos: "se levantan", ellas: "se levantan" }, complementos: ["inmediatamente de la cama", "muy despacio por las mañanas"] },
            { infinitivo: "ducharse", raiz: "duch", pronombres: { yo: "me ducho", tu: "te duchas", el: "se ducha", ella: "se ducha", nosotros: "nos duchamos", nosotras: "nos duchamos", ellos: "se duchan", ellas: "se duchan" }, complementos: ["con agua caliente", "antes de ir a dormir por la noche"] },
            { infinitivo: "cepillarse", raiz: "cepill", pronombres: { yo: "me cepillo los dientes", tu: "te cepillas los dientes", el: "se cepilla los dientes", ella: "se cepilla los dientes", nosotros: "nos cepillamos los dientes", nosotras: "nos cepillamos los dientes", ellos: "se cepillan los dientes", ellas: "se cepillan los dientes" }, complementos: ["después de desayunar", "tres veces al día"] },
            { infinitivo: "acostarse", raiz: "acuest", pronombres: { yo: "me acuesto", tu: "te acuestas", el: "se acuesta", ella: "se acuesta", nosotros: "nos acostamos", nosotras: "nos acostamos", ellos: "se acuestan", ellas: "se acuestan" }, complementos: ["temprano a las diez", "tarde el fin de semana"] }
        ],
        pronombres: ["Yo", "Tú", "Él", "Ella", "Nosotros", "Nosotras", "Ellos", "Ellas"]
    },
    vocabulario: [
        { instruction: "Traduce el número al español:", sentence: "El número 11 es ________.", correct: "once", distractors: ["doce", "quince", "nueve"] },
        { instruction: "Traduce el número al español:", sentence: "El número 12 es ________.", correct: "doce", distractors: ["dos", "diez", "trece"] },
        { instruction: "Traduce el número al español:", sentence: "El número 15 es ________.", correct: "quince", distractors: ["cinco", "catorce", "dieceiséis"] },
        { instruction: "Traduce el número al español:", sentence: "El número 20 es ________.", correct: "veinte", distractors: ["diez", "veinticinco", "nueve"] },
        { instruction: "Selecciona el color correcto:", sentence: "The red apple -> La manzana es ________.", correct: "roja", distractors: ["azul", "verde", "amarillo"] },
        { instruction: "Selecciona el color correcto:", sentence: "The blue car -> El coche es ________.", correct: "azul", distractors: ["rojo", "negro", "blanco"] },
        { instruction: "Selecciona el color correcto:", sentence: "The yellow sun -> El sol es ________.", correct: "amarillo", distractors: ["morado", "verde", "gris"] },
        { instruction: "Completa la relación de parentesco:", sentence: "El padre de mi padre es mi ________.", correct: "abuelo", distractors: ["tío", "hermano", "primo"] },
        { instruction: "Completa la relación de parentesco:", sentence: "La hermana de mi madre es mi ________.", correct: "tía", distractors: ["abuela", "prima", "hermana"] },
        { instruction: "Completa la relación de parentesco:", sentence: "El hijo de mi tío es mi ________.", correct: "primo", distractors: ["hermano", "padre", "abuelo"] },
        { instruction: "Identifica la parte de la casa:", sentence: "Nosotros cocinamos la comida en la ________.", correct: "cocina", distractors: ["dormitorio", "baño", "jardín"] },
        { instruction: "Identifica la parte de la casa:", sentence: "Yo duermo en la cama de mi ________.", correct: "dormitorio", distractors: ["salón", "cocina", "baño"] },
        { instruction: "Identifica la parte de la casa:", sentence: "Nosotros nos relajamos y vemos televisión en el ________.", correct: "salón", distractors: ["cocina", "baño", "jardín"] },
        { instruction: "Completa con el adjetivo posesivo correcto:", sentence: "Yo tengo una hermana. ________ hermana se llama Laura.", correct: "Mi", distractors: ["Tu", "Su", "Nuestro"] },
        { instruction: "Completa con el adjetivo posesivo correcto:", sentence: "Tú tienes un perro. ________ perro es muy inteligente.", correct: "Tu", distractors: ["Mi", "Su", "Nuestra"] },
        { instruction: "Completa con el adjetivo posesivo correcto:", sentence: "Ellas tienen una tía. ________ tía vive en Barcelona.", correct: "Su", distractors: ["Mi", "Tu", "Nuestra"] }
    ]
};

// Help descriptions to populate help panel
const ayudaGramaticalExplicacion = {
    regulares: `
        <h5>💡 Verbos Regulares en Presente</h5>
        <p>Los verbos regulares se conjugan eliminando la terminación del infinitivo (<strong>-ar, -er, -ir</strong>) y añadiendo las desinencias correspondientes al sujeto:</p>
        <table class="grammar-table" style="font-size:0.8rem; margin:10px 0;">
            <thead>
                <tr><th>Sujeto</th><th>-AR (hablar)</th><th>-ER (comer)</th><th>-IR (vivir)</th></tr>
            </thead>
            <tbody>
                <tr><td>Yo</td><td>-o (hablo)</td><td>-o (como)</td><td>-o (vivo)</td></tr>
                <tr><td>Tú</td><td>-as (hablas)</td><td>-es (comes)</td><td>-es (vives)</td></tr>
                <tr><td>Él/Ella</td><td>-a (habla)</td><td>-e (come)</td><td>-e (vive)</td></tr>
                <tr><td>Nosotros/as</td><td>-amos (hablamos)</td><td>-emos (comemos)</td><td>-imos (vivimos)</td></tr>
                <tr><td>Ellos/as</td><td>-an (hablan)</td><td>-en (comen)</td><td>-en (viven)</td></tr>
            </tbody>
        </table>
        <p>Identifica la terminación del infinitivo del ejercicio y empareja el sujeto con el sufijo correcto.</p>
    `,
    irregulares: `
        <h5>💡 Verbos Irregulares Clave</h5>
        <p>En el nivel cero, hay 4 verbos irregulares esenciales cuyos patrones debes aprender de memoria:</p>
        <ul>
            <li><strong>Ser (Identity/Origin):</strong> yo soy, tú eres, él/ella es, nosotros somos, ellos/ellas son.</li>
            <li><strong>Estar (Location/States):</strong> yo estoy, tú estás, él/ella está, nosotros estamos, ellos/ellas están.</li>
            <li><strong>Tener (Possession/Age):</strong> yo tengo, tú tienes, él/ella tiene, nosotros tenemos, ellos/ellas tienen.</li>
            <li><strong>Ir (Movement):</strong> yo voy, tú vas, él/ella va, nosotros vamos, ellos/ellas van.</li>
        </ul>
    `,
    reflexivos: `
        <h5>💡 Verbos Reflexivos</h5>
        <p>Un verbo es reflexivo cuando la persona realiza y recibe la acción al mismo tiempo (ej: <em>despertarse, ducharse</em>).</p>
        <p>Requiere siempre un **pronombre reflexivo** colocado antes del verbo conjugado:</p>
        <ul>
            <li><strong>Yo:</strong> me (me despierto)</li>
            <li><strong>Tú:</strong> te (te despiertas)</li>
            <li><strong>Él / Ella:</strong> se (se ducha)</li>
            <li><strong>Nosotros/as:</strong> nos (nos cepillamos)</li>
            <li><strong>Ellos / Ellas:</strong> se (se acuestan)</li>
        </ul>
    `,
    vocabulario: `
        <h5>💡 Vocabulario A0</h5>
        <p>Recomendaciones rápidas:</p>
        <ul>
            <li><strong>Parentescos:</strong> El padre de mi padre = abuelo. La hermana de mi madre = tía. El hijo de mi tío = primo.</li>
            <li><strong>Números:</strong> 11 (once), 12 (doce), 13 (trece), 14 (catorce), 15 (quince), 16 (dieciséis), 17 (diecisiete), 18 (dieciocho), 19 (diecinueve), 20 (veinte).</li>
            <li><strong>Posesivos:</strong> mi/mis (yo), tu/tus (tú), su/sus (él/ella/ellos/ellas), nuestro/a (nosotros).</li>
        </ul>
    `
};

// Initialize Infinite Practice Tab
function initInfinitePractice() {
    const categorySelect = document.getElementById("practica-category-select");
    const helpToggleBtn = document.getElementById("help-toggle-btn");
    const nextBtn = document.getElementById("btn-practica-next");
    const card = document.getElementById("practica-card");

    if (!categorySelect) return;

    // Change category listener
    categorySelect.addEventListener("change", () => {
        state.practicaStreak = 0;
        state.practicaCount = 0;
        state.practicaSessionCorrect = 0;
        document.getElementById("practica-streak").innerText = "0";
        // Restore card structure
        card.innerHTML = `
            <div class="practica-instruction" id="practica-instruction"></div>
            <div class="practica-sentence" id="practica-sentence"></div>
            <div class="practica-options" id="practica-options"></div>
            <div class="practica-feedback" id="practica-feedback"></div>
        `;
        generateExercise(categorySelect.value);
    });

    // Collapsible Help Panel listener
    helpToggleBtn.addEventListener("click", () => {
        const helpContent = document.getElementById("help-content");
        const isOpen = helpContent.style.display === "block";

        if (isOpen) {
            helpContent.style.display = "none";
            helpToggleBtn.classList.remove("open");
        } else {
            helpContent.style.display = "block";
            helpToggleBtn.classList.add("open");
        }
    });

    // Next Question Button listener
    nextBtn.addEventListener("click", () => {
        if (state.practicaCount >= 10) {
            showPracticeResults();
        } else {
            generateExercise(categorySelect.value);
        }
    });

    // Generate initial exercise
    generateExercise(categorySelect.value);
}

// Generate Algorithmic Exercise
function generateExercise(category) {
    // Reset view states
    const feedback = document.getElementById("practica-feedback");
    const nextBtn = document.getElementById("btn-practica-next");
    const helpContent = document.getElementById("help-content");
    const helpToggleBtn = document.getElementById("help-toggle-btn");
    const card = document.getElementById("practica-card");

    if (feedback) {
        feedback.innerText = "";
        feedback.className = "practica-feedback";
    }
    if (card) card.style.borderColor = "var(--border-color)";
    if (nextBtn) nextBtn.style.display = "none";
    
    // Collapse help panel
    if (helpContent && helpToggleBtn) {
        helpContent.style.display = "none";
        helpToggleBtn.classList.remove("open");
        helpContent.innerHTML = ayudaGramaticalExplicacion[category];
    }

    let exercise = {};

    if (category === "regulares") {
        const vList = bancoDeDatosPractica.regulares.verbos;
        const verb = vList[Math.floor(Math.random() * vList.length)];
        const pList = bancoDeDatosPractica.regulares.pronombres;
        const pronounObj = pList[Math.floor(Math.random() * pList.length)];

        const suffix = verb.terminacion; // ar, er, ir
        const ending = pronounObj.endings[suffix];
        const correctConjugation = verb.raiz + ending;

        const complement = verb.complementos[Math.floor(Math.random() * verb.complementos.length)];

        const distractors = new Set();
        while (distractors.size < 3) {
            const randomPronoun = pList[Math.floor(Math.random() * pList.length)];
            const randomEnding = randomPronoun.endings[suffix];
            const candidate = verb.raiz + randomEnding;
            if (candidate !== correctConjugation) {
                distractors.add(candidate);
            }
        }

        exercise = {
            instruction: `Conjuga el verbo regular "${verb.infinitivo}" en presente simple:`,
            sentence: `${pronounObj.sujeto} ________ ${complement}.`,
            correct: correctConjugation,
            options: [correctConjugation, ...Array.from(distractors)],
            explanation: `El verbo '${verb.infinitivo}' es de la conjugación -${suffix.toUpperCase()}. Para el sujeto '${pronounObj.sujeto}', la terminación es '-${ending}' resultando en '${correctConjugation}'.`
        };

    } else if (category === "irregulares") {
        const vKeys = ["ser", "estar", "tener", "ir"];
        const verbKey = vKeys[Math.floor(Math.random() * vKeys.length)];
        const verbObj = bancoDeDatosPractica.irregulares.verbos[verbKey];
        const pList = bancoDeDatosPractica.irregulares.pronombres;
        
        // Pick a random pronoun object
        const pronounObj = pList[Math.floor(Math.random() * pList.length)];
        const subject = pronounObj.sujeto;

        let subKey = "el"; 
        if (subject === "Yo") subKey = "yo";
        else if (subject === "Tú") subKey = "tu";
        else if (subject === "Él") subKey = "el";
        else if (subject === "Ella") subKey = "ella";
        else if (subject === "Nosotros") subKey = "nosotros";
        else if (subject === "Nosotras") subKey = "nosotras";
        else if (subject === "Ellos") subKey = "ellos";
        else if (subject === "Ellas") subKey = "ellas";

        const correctConjugation = verbObj[subKey];
        
        // Choose complement according to pronoun gender and number
        const compObj = verbObj.complements[Math.floor(Math.random() * verbObj.complements.length)];
        const key = `${pronounObj.number}_${pronounObj.gender}`; // e.g. "singular_masc", "plural_fem"
        const complement = compObj[key];

        const distractors = new Set();
        const allForms = Object.keys(verbObj)
            .filter(k => k !== "complements")
            .map(k => verbObj[k]);

        allForms.forEach(form => {
            if (form !== correctConjugation) distractors.add(form);
        });

        const distractorArray = Array.from(distractors).sort(() => 0.5 - Math.random()).slice(0, 3);

        exercise = {
            instruction: `Conjuga el verbo irregular "${verbKey.toUpperCase()}" en presente:`,
            sentence: `${subject} ________ ${complement}.`,
            correct: correctConjugation,
            options: [correctConjugation, ...distractorArray],
            explanation: `El verbo '${verbKey}' es irregular. Para el sujeto '${subject}', la forma correcta en presente es '${correctConjugation}'.`
        };

    } else if (category === "reflexivos") {
        const vList = bancoDeDatosPractica.reflexivos.verbos;
        const verbObj = vList[Math.floor(Math.random() * vList.length)];
        const pList = bancoDeDatosPractica.reflexivos.pronombres;
        const subject = pList[Math.floor(Math.random() * pList.length)];

        let subKey = "el";
        if (subject === "Yo") subKey = "yo";
        else if (subject === "Tú") subKey = "tu";
        else if (subject === "Él") subKey = "el";
        else if (subject === "Ella") subKey = "ella";
        else if (subject === "Nosotros" || subject === "Nosotras") subKey = "nosotros";
        else if (subject === "Ellos" || subject === "Ellas") subKey = "ellos";

        const correctForm = verbObj.pronombres[subKey];
        const complement = verbObj.complementos[Math.floor(Math.random() * verbObj.complementos.length)];

        const distractors = new Set();
        const allForms = Object.keys(verbObj.pronombres).map(k => verbObj.pronombres[k]);
        allForms.forEach(form => {
            if (form !== correctForm) distractors.add(form);
        });

        const distractorArray = Array.from(distractors).sort(() => 0.5 - Math.random()).slice(0, 3);

        exercise = {
            instruction: `Completa con el verbo reflexivo "${verbObj.infinitivo}":`,
            sentence: `${subject} ________ ${complement}.`,
            correct: correctForm,
            options: [correctForm, ...distractorArray],
            explanation: `Para el verbo reflexivo '${verbObj.infinitivo}', el pronombre y conjugación correspondiente a '${subject}' es '${correctForm}'.`
        };

    } else if (category === "vocabulario") {
        const vList = bancoDeDatosPractica.vocabulario;
        const rawExercise = vList[Math.floor(Math.random() * vList.length)];

        exercise = {
            instruction: rawExercise.instruction,
            sentence: rawExercise.sentence,
            correct: rawExercise.correct,
            options: [rawExercise.correct, ...rawExercise.distractors],
            explanation: `La respuesta correcta es '${rawExercise.correct}'.`
        };
    }

    state.currentExercise = exercise;

    const shuffledOptions = [...exercise.options].sort(() => 0.5 - Math.random());

    const instEl = document.getElementById("practica-instruction");
    const sentEl = document.getElementById("practica-sentence");
    if (instEl) instEl.innerText = exercise.instruction;
    if (sentEl) sentEl.innerHTML = exercise.sentence.replace("________", `<strong style="color: var(--accent-orange); text-decoration: underline;">________</strong>`);

    const optionsContainer = document.getElementById("practica-options");
    if (optionsContainer) {
        optionsContainer.innerHTML = "";
        shuffledOptions.forEach(opt => {
            const btn = document.createElement("button");
            btn.className = "option-btn";
            btn.innerText = opt;
            btn.addEventListener("click", () => checkInfinitePracticeAnswer(btn, opt));
            optionsContainer.appendChild(btn);
        });
    }
}

// Check Practice Answer
function checkInfinitePracticeAnswer(choiceBtn, option) {
    const exercise = state.currentExercise;
    const feedback = document.getElementById("practica-feedback");
    const nextBtn = document.getElementById("btn-practica-next");
    const card = document.getElementById("practica-card");
    const optionsContainer = document.getElementById("practica-options");

    if (optionsContainer) {
        optionsContainer.querySelectorAll(".option-btn").forEach(btn => {
            btn.disabled = true;
            if (btn.innerText === exercise.correct) {
                btn.style.borderColor = "var(--accent-teal)";
                btn.style.color = "var(--accent-teal)";
                btn.style.background = "rgba(20, 184, 166, 0.1)";
            } else {
                btn.style.opacity = "0.5";
            }
        });
    }

    const isCorrect = option === exercise.correct;
    state.practicaCount++; // Aumenta el total de preguntas respondidas en este set

    if (isCorrect) {
        state.practicaStreak++;
        state.practicaCorrect++;         // Histórico
        state.practicaSessionCorrect++;  // De la sesión de 10
        
        if (feedback) {
            feedback.innerText = "¡Excelente! Respuesta correcta. 🎉";
            feedback.className = "practica-feedback correct";
        }
        if (card) card.style.borderColor = "var(--accent-teal)";
        
        const completedSentence = exercise.sentence.replace("________", exercise.correct);
        speakWord(completedSentence);

    } else {
        state.practicaStreak = 0;
        
        if (feedback) {
            feedback.innerText = `Incorrecto. ${exercise.explanation}`;
            feedback.className = "practica-feedback incorrect";
        }
        if (card) card.style.borderColor = "var(--accent-red)";
        
        if (choiceBtn) {
            choiceBtn.style.borderColor = "var(--accent-red)";
            choiceBtn.style.color = "var(--accent-red)";
            choiceBtn.style.background = "rgba(244, 63, 94, 0.1)";
            choiceBtn.style.opacity = "1";
        }

        speakWord("Incorrecto");
    }

    // Actualiza racha y correctas globales en la UI
    const streakEl = document.getElementById("practica-streak");
    const correctEl = document.getElementById("practica-correct");
    if (streakEl) streakEl.innerText = state.practicaStreak;
    if (correctEl) correctEl.innerText = state.practicaCorrect;

    // Configura el botón para el siguiente paso
    if (nextBtn) {
        if (state.practicaCount >= 10) {
            nextBtn.innerText = "Ver Resultados del Set 📊";
        } else {
            nextBtn.innerText = "Siguiente Ejercicio ➡️";
        }
        nextBtn.style.display = "inline-block";
    }
}

// Show practice results screen
function showPracticeResults() {
    const card = document.getElementById("practica-card");
    const nextBtn = document.getElementById("btn-practica-next");
    if (nextBtn) nextBtn.style.display = "none";

    const percent = Math.round((state.practicaSessionCorrect / 10) * 100);
    let congrats = "";
    if (percent === 100) congrats = "¡Perfecto! Eres un maestro/a de la gramática. 🏆";
    else if (percent >= 80) congrats = "¡Excelente trabajo! Vas por muy buen camino. 🎉";
    else if (percent >= 50) congrats = "Buen intento. Sigue practicando para mejorar. 👍";
    else congrats = "No te rindas. Vuelve a intentarlo para reforzar tus conocimientos. 💪";

    if (card) {
        card.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 15px;">📊</div>
            <h4 style="color: var(--accent-teal); font-size: 1.4rem; margin-bottom: 10px;">¡Set Completado!</h4>
            <p style="font-size: 1.1rem; margin-bottom: 5px; font-weight:600; color: var(--text-primary);">Aciertos: ${state.practicaSessionCorrect} / 10 (${percent}%)</p>
            <p style="margin-bottom: 25px; color: var(--text-secondary); font-size: 0.95rem;">${congrats}</p>
            <div style="display:flex; justify-content:center; gap:15px; flex-wrap:wrap;">
                <button class="primary-btn" id="btn-restart-practica-set">Repetir Categoría</button>
                <button class="secondary-btn" id="btn-go-home-practica">Ir al Inicio</button>
            </div>
        `;

        speakWord(`Set completado. Tu puntuación es ${state.practicaSessionCorrect} de diez.`);

        card.querySelector("#btn-restart-practica-set").addEventListener("click", () => {
            state.practicaCount = 0;
            state.practicaSessionCorrect = 0;
            state.practicaStreak = 0;
            const streakEl = document.getElementById("practica-streak");
            if (streakEl) streakEl.innerText = "0";
            
            // Restore card structure
            card.innerHTML = `
                <div class="practica-instruction" id="practica-instruction"></div>
                <div class="practica-sentence" id="practica-sentence"></div>
                <div class="practica-options" id="practica-options"></div>
                <div class="practica-feedback" id="practica-feedback"></div>
            `;
            generateExercise(document.getElementById("practica-category-select").value);
        });

        card.querySelector("#btn-go-home-practica").addEventListener("click", () => {
            const dashboardTab = document.querySelector(".nav-tab[data-tab='dashboard']");
            if (dashboardTab) dashboardTab.click();
        });
    }
}
