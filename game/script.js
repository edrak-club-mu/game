// دوال مساعدة لإظهار/إخفاء الشاشات
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(id).classList.add('active');
}

// ------------------------------------------------------------------
// ** منطق المسابقة (تحدي إدراك الفكري) ** // ------------------------------------------------------------------

const quizQuestions = [
    {
        question: "ما هو أفضل نهج لإدارة مهمة مذاكرة ضخمة؟",
        options: ["تأجيلها حتى يشتد التوتر", "تقسيمها إلى مهام صغيرة محددة", "محاولة إنجازها دفعة واحدة", "الشكوى منها للزملاء فقط"],
        correctAnswer: "تقسيمها إلى مهام صغيرة محددة"
    },
    {
        question: "أي من العبارات التالية تعتبر فكرة إيجابية (وليست سلبية مشوشة)؟",
        options: ["هذا الاختبار سيحدد مصيري", "يجب أن أكون كاملاً ومثالياً", "أستطيع التعلم من أخطائي", "لا أملك الوقت الكافي أبداً"],
        correctAnswer: "أستطيع التعلم من أخطائي"
    },
    {
        question: "ماذا يعني الوعي السلوكي في سياق تنمية المهارات؟",
        options: ["التقليد الأعمى لسلوكيات الآخرين", "تحديد وتحليل عاداتك وطرق استجابتك للمواقف", "الاهتمام بالمظهر الخارجي فقط", "التركيز على النتيجة النهائية دون العملية"],
        correctAnswer: "تحديد وتحليل عاداتك وطرق استجابتك للمواقف"
    }
];

let currentQuestionIndex = 0;
let registeredPlayers = []; 
let currentPlayerIndex = 0;

// 🛑🛑🛑 تعديل: مسح لوحة المتصدرين عند بدء تشغيل اللعبة
let leaderboard = []; 
localStorage.removeItem('edrakLeaderboard');

// --- منطق تسجيل اللاعبين والمنافسة (لم يتغير) ---

const newPlayerNameInput = document.getElementById('new-player-name');
const addPlayerButton = document.getElementById('add-player-button');
const playerList = document.getElementById('player-list');
const startQuizButton = document.getElementById('start-quiz-button');

document.getElementById('start-competition').addEventListener('click', () => {
    registeredPlayers = []; 
    renderPlayerList();
    showScreen('registration-screen');
});

addPlayerButton.addEventListener('click', () => {
    const name = newPlayerNameInput.value.trim();
    if (name.length < 2) {
        alert("الرجاء إدخال اسم صحيح.");
        return;
    }
    
    registeredPlayers.push({ name: name, score: 0 });
    newPlayerNameInput.value = ''; 
    newPlayerNameInput.focus(); 
    renderPlayerList();
});

function renderPlayerList() {
    playerList.innerHTML = '';
    registeredPlayers.forEach((player, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${player.name}`;
        playerList.appendChild(li);
    });

    if (registeredPlayers.length >= 2) {
        startQuizButton.disabled = false;
        startQuizButton.textContent = `ابدأ التحدي (${registeredPlayers.length} لاعب)`;
    } else {
        startQuizButton.disabled = true;
        startQuizButton.textContent = "ابدأ التحدي (يجب أن يكون لديك لاعبان على الأقل)";
    }
}

startQuizButton.addEventListener('click', () => {
    currentPlayerIndex = 0;
    currentQuestionIndex = 0;
    showPlayerTurn();
    loadQuestion();
    showScreen('quiz-screen');
});

function showPlayerTurn() {
    const currentPlayer = registeredPlayers[currentPlayerIndex];
    document.getElementById('current-player-display').textContent = currentPlayer.name;
    currentQuestionIndex = 0;
}

function loadQuestion() {
    const questionData = quizQuestions[currentQuestionIndex];
    document.getElementById('current-question-number').textContent = currentQuestionIndex + 1;
    document.getElementById('question-text').textContent = questionData.question;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    document.getElementById('next-question').classList.add('hidden');
    document.getElementById('quiz-feedback').textContent = '';

    questionData.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option;
        button.addEventListener('click', () => checkAnswer(button, option, questionData.correctAnswer));
        optionsContainer.appendChild(button);
    });
}

function checkAnswer(selectedButton, selectedAnswer, correctAnswer) {
    document.querySelectorAll('.option-button').forEach(btn => btn.disabled = true);
    
    const feedback = document.getElementById('quiz-feedback');
    const nextButton = document.getElementById('next-question');
    const currentPlayer = registeredPlayers[currentPlayerIndex];

    if (selectedAnswer === correctAnswer) {
        selectedButton.classList.add('correct');
        feedback.textContent = "إجابة صحيحة! +10 نقاط.";
        currentPlayer.score += 10; 
    } else {
        selectedButton.classList.add('incorrect');
        document.querySelectorAll('.option-button').forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            }
        });
        feedback.textContent = "إجابة خاطئة. الإجابة الصحيحة موضحة بالأخضر.";
    }

    nextButton.classList.remove('hidden');
}

document.getElementById('next-question').addEventListener('click', () => {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < quizQuestions.length) {
        loadQuestion();
    } else {
        currentPlayerIndex++;
        
        if (currentPlayerIndex < registeredPlayers.length) {
            const nextPlayerName = registeredPlayers[currentPlayerIndex].name;
            const currentScore = registeredPlayers[currentPlayerIndex - 1].score;
            document.getElementById('quiz-feedback').innerHTML = `
                <span style="color: green; font-size: 1.2em;">انتهت جولة ${registeredPlayers[currentPlayerIndex - 1].name} بنتيجة ${currentScore} نقطة.</span>
                <br>
                **استعد! الآن دور ${nextPlayerName}.**
            `;
            
            setTimeout(() => {
                showPlayerTurn(); 
                loadQuestion();
            }, 3000); 
            
        } else {
            finishQuiz();
        }
    }
});

function finishQuiz() {
    const sessionResults = registeredPlayers.map(p => ({ name: p.name, score: p.score }));
    
    leaderboard.push(...sessionResults);
    
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10); 
    // لا نحفظ في localStorage لتفريغها عند التشغيل التالي
    
    const highestSessionScore = Math.max(...sessionResults.map(p => p.score));
    
    document.getElementById('final-score').textContent = highestSessionScore;
    renderLeaderboard();
    showScreen('leaderboard-screen');
}

function renderLeaderboard() {
    const tableBody = document.getElementById('leaderboard-body');
    tableBody.innerHTML = '';
    
    leaderboard.forEach((entry, index) => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = index + 1; 
        row.insertCell().textContent = entry.name;
        row.insertCell().textContent = entry.score;
    });
}

document.getElementById('back-to-menu-from-leaderboard').addEventListener('click', () => {
    showScreen('start-screen');
});


// ------------------------------------------------------------------
// ** منطق اللعبة الفردية (إدارة التوتر) ** // ------------------------------------------------------------------

// متغيرات مقياس التوتر
let stressTimer;
const initialTime = 10; 
let timeRemaining = initialTime;
const timerDisplay = document.getElementById('timer-display');
const nextToAppleWatchButton = document.getElementById('next-to-apple-watch-input'); 

function startStressTimer() {
    timeRemaining = initialTime;
    timerDisplay.textContent = timeRemaining;
    nextToAppleWatchButton.disabled = false;
    timerDisplay.style.color = '#F44336'; 

    if (stressTimer) clearInterval(stressTimer);

    stressTimer = setInterval(() => {
        timeRemaining--;
        timerDisplay.textContent = timeRemaining;

        if (timeRemaining <= 0) {
            clearInterval(stressTimer);
            goToAppleWatchScreen(); 
        }
    }, 1000);
}

function stopStressTimer() {
    if (stressTimer) {
        clearInterval(stressTimer);
        stressTimer = null;
    }
}

function goToAppleWatchScreen() {
    stopStressTimer(); 
    showScreen('apple-watch-screen');
}

document.getElementById('start-solo-game').addEventListener('click', () => {
    showScreen('stress-scale-screen');
    startStressTimer(); 
});

const stressInput = document.getElementById('stress-level');
const stressDisplay = document.getElementById('stress-value-display');

stressInput.addEventListener('input', (e) => {
    const level = parseInt(e.target.value);
    stressDisplay.textContent = level;
    
    let color;
    if (level <= 3) {
        color = '#3A454E'; 
    } else if (level <= 7) {
        color = '#7C868D'; 
    } else {
        color = '#FDB04C'; 
    }
    stressDisplay.style.color = color;
});

// 1. الانتقال من شاشة المقياس إلى شاشة الساعة
document.getElementById('next-to-apple-watch-input').addEventListener('click', () => {
    goToAppleWatchScreen();
});

// 2. منطق شاشة إدخال قراءة الساعة
const watchStressInput = document.getElementById('watch-stress-input');
const determineActionButton = document.getElementById('determine-action');
const watchInputFeedback = document.getElementById('watch-input-feedback');

watchStressInput.addEventListener('input', () => {
    const level = parseInt(watchStressInput.value);
    if (level >= 1 && level <= 10) {
        determineActionButton.disabled = false;
        watchInputFeedback.textContent = '';
    } else {
        determineActionButton.disabled = true;
        watchInputFeedback.textContent = 'الرجاء إدخال رقم بين 1 و 10.';
        watchInputFeedback.style.color = 'red';
    }
});

determineActionButton.addEventListener('click', () => {
    const stressLevel = parseInt(watchStressInput.value);
    if (stressLevel >= 1 && stressLevel <= 10) {
        performCustomAction(stressLevel);
    }
});

// 3. 🆕 الدالة التي تحدد الفعالية المخصصة (تم تنظيمها بناءً على طلبك)
function performCustomAction(level) {
    const titleElement = document.getElementById('action-title');
    const contentElement = document.getElementById('action-content');
    
    let title;
    let contentHTML;
    
    if (level >= 8) {
        // مرتفع جداً (8 - 10): الوعي السلوكي (تهدئة فورية)
        title = "🔴 منطقة الأمان الفوري: الوعي السلوكي";
        contentHTML = `
            <p style="color: #F44336; font-weight: bold;">مستوى توترك مرتفع جداً (${level}). نحتاج لكسر حلقة التوتر فوراً:</p>
            <h3>🔑 تمرين: 5 - 4 - 3 - 2 - 1 (حواس)</h3>
            <ul>
                <li>**5** أشياء تراها في محيطك الآن.</li>
                <li>**4** أشياء تشعر بها (ملابسك، كرسيك).</li>
                <li>**3** أصوات تسمعها الآن (حتى لو كانت بعيدة).</li>
                <li>**2** رائحتان تشمهما (أو تتخيلهما).</li>
                <li>**1** شيء يمكنك تذوقه (أو تتذكره).</li>
            </ul>
            <p>💡 هذا التدريب يعيد تركيز دماغك إلى اللحظة الحالية ويقلل من الاستجابة التلقائية للضغط.</p>
        `;
    } else if (level >= 4) {
        // متوسط إلى مرتفع (4 - 7): التميز الفكري (تأطير إيجابي)
        title = "🟠 تحدي التركيز الفكري: استغلال الطاقة";
        contentHTML = `
            <p style="color: #FDB04C; font-weight: bold;">مستوى توترك متوسط (${level}). لنحول القلق إلى محفز:</p>
            <h3>🔑 تحدي: الفكرة المضادة</h3>
            <ul>
                <li>**حدد الفكرة السلبية الأبرز:** ما هو أكثر شيء يزعجك الآن؟ (مثل: "لن أنتهي من مذاكرة هذا الفصل").</li>
                <li>**صيغ الفكرة المضادة:** اقلبها إلى هدف إيجابي وواقعي (مثل: "سأخصص 30 دقيقة للمذاكرة الآن، ثم أستريح").</li>
                <li>**تنفيذ فوري:** ابدأ بالخطوة الأولى من الهدف الجديد فوراً (اكتبها في ورقة).</li>
            </ul>
            <p>💡 نادي إدراك يشجع على تحويل التفكير السلبي إلى فكر ناقد بنّاء.</p>
        `;
    } else {
        // منخفض (1 - 3): المهارات الحياتية (تخطيط استباقي)
        title = "🟢 نافذة المهارات الحياتية: التخطيط في الهدوء";
        contentHTML = `
            <p style="color: #4CAF50; font-weight: bold;">مستوى توترك منخفض (${level}). استغل هدوءك لتنمية مهاراتك:</p>
            <h3>🔑 مهارة: الإعداد المسبق</h3>
            <ul>
                <li>**الاستعداد الذهني:** اختر أصعب مهمة في جدولك الأسبوعي. لا تبدأ بها، ولكن قم بكتابة أول ثلاثة موارد (كتب/فيديوهات/زملاء) تحتاجها لإنجازها.</li>
                <li>**الاستعداد العملي:** نظم شيئاً واحداً في محيطك (كتاب، ملف، حقيبة).</li>
                <li>**الوعي السلوكي:** خصص 10 دقائق لتسجيل المشاعر الإيجابية التي تشعر بها الآن لتعود إليها وقت الضغط.</li>
            </ul>
            <p>💡 القادة يستغلون لحظات الهدوء للتخطيط للمعارك القادمة.</p>
        `;
    }
    
    titleElement.textContent = title;
    contentElement.innerHTML = contentHTML;
    
    showScreen('action-screen');
}

// 4. الانتقال من شاشة الفعالية إلى تمرين التنفس
document.getElementById('next-to-breathing').addEventListener('click', () => {
    // إعادة تعيين شاشة التنفس للبدء من جديد
    document.getElementById('start-breathing').classList.remove('hidden');
    document.getElementById('finish-game').classList.add('hidden');
    document.getElementById('instructions').innerHTML = "اضغط للبدء"; 
    document.getElementById('circle').classList.remove('breathing');
    
    showScreen('breathing-screen');
});


// 5. تمرين التنفس (لم يتغير)
const startBreathingButton = document.getElementById('start-breathing');
const circle = document.getElementById('circle');
const instructions = document.getElementById('instructions');
const finishButton = document.getElementById('finish-game');

document.getElementById('finish-game').addEventListener('click', () => {
    showScreen('filter-screen');
});

startBreathingButton.addEventListener('click', () => {
    startBreathingButton.classList.add('hidden');
    finishButton.classList.add('hidden');
    
    circle.classList.add('breathing');
    
    const cycleSteps = [
        { text: 'استنشق بعمق', duration: 4000, seconds: 4 },
        { text: 'احبس', duration: 7000, seconds: 7 },
        { text: 'أزفر بهدوء', duration: 8000, seconds: 8 }
    ];
    
    let currentStep = 0;
    let totalCycles = 3; 
    let completedCycles = 0;
    
    function runCycle() {
        if (completedCycles >= totalCycles) {
            circle.classList.remove('breathing');
            instructions.innerHTML = "أحسنت! التنفس العميق يهدئ جهازك العصبي.";
            finishButton.classList.remove('hidden'); 
            return;
        }

        const step = cycleSteps[currentStep % cycleSteps.length];
        let remainingSeconds = step.seconds;
        let countdownInterval;

        instructions.innerHTML = `
            ${step.text} 
            <span id="countdown-num">${remainingSeconds}</span>
        `;
        
        countdownInterval = setInterval(() => {
            remainingSeconds--;
            const countdownNumSpan = document.getElementById('countdown-num');
            if (countdownNumSpan) {
                countdownNumSpan.textContent = remainingSeconds;
            }

            if (remainingSeconds <= 0) {
                clearInterval(countdownInterval);
                
                currentStep++;
                if (currentStep % cycleSteps.length === 0) {
                    completedCycles++;
                }
                
                runCycle();
            }
        }, 1000);
    }
    
    runCycle();
});


// 6. إلغاء التشويش (لم يتغير)
const ideas = document.querySelectorAll('.idea');
const trashCan = document.getElementById('trash-can');
const nextToPlanningButton = document.getElementById('next-to-planning');
let negativesRemoved = 0;
const totalNegatives = 5; 

ideas.forEach(idea => {
    idea.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', e.target.id);
    });
});

trashCan.addEventListener('dragover', (e) => {
    e.preventDefault();
    trashCan.classList.add('hovered');
});

trashCan.addEventListener('dragleave', () => {
    trashCan.classList.remove('hovered');
});

trashCan.addEventListener('drop', (e) => {
    e.preventDefault();
    trashCan.classList.remove('hovered');
    const data = e.dataTransfer.getData('text/plain');
    const draggedElement = document.getElementById(data);
    
    if (draggedElement && draggedElement.classList.contains('negative')) { 
        draggedElement.style.opacity = '0';
        draggedElement.style.transform = 'scale(0.1)';
        negativesRemoved++;

        if (negativesRemoved === totalNegatives) {
            nextToPlanningButton.disabled = false;
            nextToPlanningButton.textContent = "لقد صفيت ذهنك! لننتقل إلى التخطيط.";
        }
    }
});

nextToPlanningButton.addEventListener('click', () => {
    showScreen('planning-screen');
});

// 7. تنظيم الأهداف (لم يتغير)
const sortableList = document.getElementById('sortable-list');
if (typeof Sortable !== 'undefined') {
    new Sortable(sortableList, {
        animation: 150,
        ghostClass: 'sortable-ghost' 
    });
}

document.getElementById('check-planning').addEventListener('click', () => {
    const items = Array.from(sortableList.children);
    const feedback = document.getElementById('planning-feedback');
    const nextToResultButton = document.getElementById('next-to-result');
    let isCorrect = true;
    
    items.forEach((item, index) => {
        if (parseInt(item.dataset.order) !== (index + 1)) {
            isCorrect = false;
        }
    });

    if (isCorrect) {
        feedback.style.color = 'green';
        feedback.textContent = 'ممتاز! هذا هو الترتيب الصحيح. تحديد الأولويات أهم مهارة!';
        nextToResultButton.classList.remove('hidden');
    } else {
        feedback.style.color = 'red';
        feedback.textContent = 'هناك خطأ في الترتيب. تذكر: ابدأ بالأصعب ثم فكّر بالاستراحة والتجهيزات الأخرى.';
        nextToResultButton.classList.add('hidden');
    }
});

document.getElementById('next-to-result').addEventListener('click', () => {
    showScreen('result-screen');
});

// 8. إعادة تعيين اللعبة الفردية (Restart)
function resetGameState() {
    stopStressTimer(); 

    // مقياس التوتر
    stressInput.value = 5;
    stressDisplay.textContent = 5;
    stressDisplay.style.color = '#7C868D'; 
    timerDisplay.textContent = initialTime; 
    
    // شاشة الساعة
    watchStressInput.value = '';
    determineActionButton.disabled = true;
    watchInputFeedback.textContent = '';


    // التنفس
    document.getElementById('start-breathing').classList.remove('hidden');
    document.getElementById('finish-game').classList.add('hidden');
    instructions.innerHTML = "اضغط للبدء"; 
    circle.classList.remove('breathing'); 

    // إلغاء التشويش
    negativesRemoved = 0; 
    document.querySelectorAll('.idea').forEach(idea => { 
        idea.style.opacity = '1';
        idea.style.transform = 'scale(1)';
    });
    
    document.getElementById('next-to-planning').disabled = true;
    document.getElementById('next-to-planning').textContent = "انتقل للمرحلة التالية";

    // تنظيم الأهداف
    document.getElementById('planning-feedback').textContent = '';
    document.getElementById('next-to-result').classList.add('hidden');
}

document.getElementById('restart-game').addEventListener('click', () => {
    resetGameState();
    showScreen('start-screen'); 
});