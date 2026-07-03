// מערכי נתונים לאפיון
const efforts = [
    { icon: '😊', text: 'קל' },
    { icon: '😐', text: 'בינוני' },
    { icon: '😫', text: 'קשה' },
    { icon: '🥵', text: 'קשה מאוד' }
];

let state = { effort: null, pain: null };
let editIndex = null;
let deleteIndex = null;
let walks = JSON.parse(localStorage.getItem('walks') || '[]');

// ניווט בין מסכים
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

// אתחול בוררי טופס
function initFormComponents() {
    // בורר מאמץ
    const effortContainer = document.getElementById('effortContainer');
    effortContainer.innerHTML = '';
    efforts.forEach((eff, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'emoji-option';
        btn.innerHTML = `<span class="icon">${eff.icon}</span><span class="text">${eff.text}</span>`;
        btn.onclick = () => {
            state.effort = idx;
            document.querySelectorAll('#effortContainer .emoji-option').forEach(c => c.classList.remove('selected'));
            btn.classList.add('selected');
        };
        effortContainer.appendChild(btn);
    });

    // בורר סקאלת כאב 0-10
    const painContainer = document.getElementById('painContainer');
    painContainer.innerHTML = '';
    for (let i = 0; i <= 10; i++) {
        const numBtn = document.createElement('button');
        numBtn.type = 'button';
        numBtn.className = 'scale-num';
        numBtn.textContent = i;
        numBtn.onclick = () => {
            state.pain = i;
            document.querySelectorAll('#painContainer .scale-num').forEach(c => c.classList.remove('selected'));
            numBtn.classList.add('selected');
        };
        painContainer.appendChild(numBtn);
    }
}

// ניהול רכיב דקות (Stepper)
document.getElementById('minusMin').onclick = () => {
    const input = document.getElementById('minutes');
    if (parseInt(input.value) > 1) input.value = parseInt(input.value) - 1;
};

document.getElementById('plusMin').onclick = () => {
    const input = document.getElementById('minutes');
    input.value = parseInt(input.value) + 1;
};

// ניקוי טופס
function clearForm() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('walkDate').value = today;
    document.getElementById('minutes').value = '10';
    state = { effort: null, pain: null };
    document.querySelectorAll('.emoji-option, .scale-num').forEach(c => c.classList.remove('selected'));
}

// אירועי ניווט וכפתורים
document.getElementById('startBtn').onclick = () => {
    editIndex = null;
    clearForm();
    document.getElementById('formTitle').textContent = 'הוספת הליכה';
    document.getElementById('deleteBtnForm').classList.add('hidden');
    showScreen('formScreen');
};

document.getElementById('viewLogBtn').onclick = () => {
    renderLog();
    showScreen('logScreen');
};

document.getElementById('backFromLogBtn').onclick = () => showScreen('homeScreen');
document.getElementById('backFromFormBtn').onclick = () => showScreen('homeScreen');

// שמירת נתונים
document.getElementById('saveBtn').onclick = () => {
    const mins = parseInt(document.getElementById('minutes').value);
    const rawDate = document.getElementById('walkDate').value;
    
    if (state.effort === null || state.pain === null) {
        alert('אנא בחרי רמת מאמץ ורמת כאב כדי להמשיך');
        return;
    }

    const walkItem = {
        date: rawDate,
        minutes: mins,
        effort: state.effort,
        pain: state.pain
    };

    if (editIndex === null) {
        walks.push(walkItem);
    } else {
        walks[editIndex] = walkItem;
    }

    // מיון לפי תאריך יורד
    walks.sort((a, b) => new Date(b.date) - new Date(a.date));

    localStorage.setItem('walks', JSON.stringify(walks));
    updateBrainAndUI();
    showScreen('homeScreen');
};

// טעינת פריט לעריכה
window.editWalk = (idx) => {
    editIndex = idx;
    const w = walks[idx];
    
    clearForm();
    document.getElementById('formTitle').textContent = 'עריכת הליכה';
    document.getElementById('walkDate').value = w.date;
    document.getElementById('minutes').value = w.minutes;
    
    state.effort = w.effort;
    state.pain = w.pain;
    
    const effortOptions = document.querySelectorAll('#effortContainer .emoji-option');
    if(effortOptions[w.effort]) effortOptions[w.effort].classList.add('selected');
    
    const painOptions = document.querySelectorAll('#painContainer .scale-num');
    if(painOptions[w.pain]) painOptions[w.pain].classList.add('selected');
    
    document.getElementById('deleteBtnForm').classList.remove('hidden');
    showScreen('formScreen');
};

// מחיקה מתוך הטופס
document.getElementById('deleteBtnForm').onclick = () => {
    if (editIndex !== null) {
        askDelete(editIndex);
    }
};

// ניהול מודאל מחיקה
window.askDelete = (idx) => {
    deleteIndex = idx;
    const w = walks[idx];
    
    // פורמט תאריך עברי קל
    const dateObj = new Date(w.date);
    const formattedDate = !isNaN(dateObj) ? `${dateObj.getDate()}/${dateObj.getMonth()+1}/${dateObj.getFullYear()}` : w.date;

    document.getElementById('deleteDialogDetails').innerHTML = `${formattedDate}<br>${w.minutes} דקות`;
    document.getElementById('dialog').classList.remove('hidden');
};

document.getElementById('confirmDelete').onclick = () => {
    walks.splice(deleteIndex, 1);
    localStorage.setItem('walks', JSON.stringify(walks));
    document.getElementById('dialog').classList.add('hidden');
    
    updateBrainAndUI();
    if (!document.getElementById('logScreen').classList.contains('hidden')) {
        renderLog();
    } else {
        showScreen('homeScreen');
    }
};

document.getElementById('cancelDelete').onclick = () => {
    document.getElementById('dialog').classList.add('hidden');
};

// רינדור רשימת יומן
function renderLog() {
    const listContainer = document.getElementById('list');
    listContainer.innerHTML = '';

    if (walks.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center; color:#777; padding:20px;">אין עדיין הליכות מתועדות.</p>';
        return;
    }

    walks.forEach((w, idx) => {
        const item = document.createElement('div');
        item.className = 'log-item';
        
        const dateObj = new Date(w.date);
        const displayDate = !isNaN(dateObj) ? `${dateObj.getDate()}/${dateObj.getMonth()+1}` : w.date;

        item.innerHTML = `
            <div class="log-date">${displayDate}</div>
            <div class="log-duration">${w.minutes} דקות</div>
            <div class="log-actions">
                <button class="action-btn" onclick="editWalk(${idx})">✏️</button>
                <button class="action-btn" onclick="askDelete(${idx})">🗑️</button>
            </div>
         topic`;
        listContainer.appendChild(item);
    });
}

// המוח של צועדת - מנוע המלצות
function updateBrainAndUI() {
    const circle = document.getElementById('trafficLightCircle');
    const title = document.getElementById('statusTitle');
    const desc = document.getElementById('recommendationText');
    const recommendedMinutesInput = document.getElementById('recommendedMinutes');

    // ברירת מחדל להתחלה
    let baseTime = 10;
    recommendedMinutesInput.textContent = baseTime;

    if (walks.length === 0) {
        circle.className = 'status-circle green-status';
        circle.textContent = '✓';
        title.textContent = 'מוכנה להתחיל?';
        desc.textContent = 'תעדי את ההליכה הראשונה שלך כדי לקבל המלצות מותאמות.';
        return;
    }

    // ניתוח 3 ההליכות האחרונות
    const lastThree = walks.slice(0, 3);
    let totalPain = 0;
    let maxPain = 0;
    let highEffortCount = 0;

    lastThree.forEach(w => {
        totalPain += w.pain;
        if (w.pain > maxPain) maxPain = w.pain;
        if (w.effort >= 2) highEffortCount++; // קשה או קשה מאוד
    });

    const avgPain = totalPain / lastThree.length;
    const latestWalk = lastThree[0];

    // לוגיקת הרמזור וההמלצות
    if (maxPain >= 6 || latestWalk.pain >= 5) {
        // אדום - להפחית עומס או לנוח
        circle.className = 'status-circle red-status';
        circle.textContent = '⚠';
        title.textContent = 'להפחית עומס / לנוח';
        desc.textContent = 'נראה שיש עלייה ברמת הכאב. מומלץ לקחת יום מנוחה או להפחית משמעותית את זמן ההליכה.';
        recommendedMinutesInput.textContent = Math.max(5, Math.round(latestWalk.minutes * 0.7));
    } else if (maxPain >= 3 || highEffortCount >= 2) {
        // צהוב - להישאר באותו עומס
        circle.className = 'status-circle yellow-status';
        circle.textContent = '●';
        title.textContent = 'להישאר באותו עומס';
        desc.textContent = 'הגוף מתרגל לעומס הנוכחי. מומלץ להישאר באותו זמן הליכה בימים הקרובים.';
        recommendedMinutesInput.textContent = latestWalk.minutes;
    } else {
        // ירוק - אפשר להתקדם
        circle.className = 'status-circle green-status';
        circle.textContent = '✓';
        title.textContent = 'אפשר להמשיך';
        desc.textContent = 'אין החמרה בשלוש ההליכות האחרונות. אפשר להמשיך להתקדם בהדרגה.';
        recommendedMinutesInput.textContent = latestWalk.minutes + 2;
    }
}

// אתחול האפליקציה בטעינה
window.onload = () => {
    initFormComponents();
    updateBrainAndUI();
};
