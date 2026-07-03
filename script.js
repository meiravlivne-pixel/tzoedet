// מערכי הנתונים לאפיון
const efforts = [
    { icon: '😊', text: 'קל' },
    { icon: '😐', text: 'בינוני' },
    { icon: '😫', text: 'קשה' },
    { icon: '🥵', text: 'קשה מאוד' }
];

// סולם כאב מבוסס על 4 אימוג'ים (0: ללא כאב, 1: קל, 2: מציק, 3: חזק)
const pains = [
    { icon: '🟢', text: 'ללא כאב' },
    { icon: '🟡', text: 'כאב קל' },
    { icon: '🟠', text: 'כאב מציק' },
    { icon: '🔴', text: 'כאב חזק' }
];

let state = { effort: null, pain: null };
let editIndex = null;
let deleteIndex = null;
let walks = JSON.parse(localStorage.getItem('walks') || '[]');

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

// בניית בוררי אימוג'י דינמיים
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

    // בורר כאב
    const painContainer = document.getElementById('painContainer');
    painContainer.innerHTML = '';
    pains.forEach((p, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'emoji-option';
        btn.innerHTML = `<span class="icon">${p.icon}</span><span class="text">${p.text}</span>`;
        btn.onclick = () => {
            state.pain = idx;
            document.querySelectorAll('#painContainer .emoji-option').forEach(c => c.classList.remove('selected'));
            btn.classList.add('selected');
        };
        painContainer.appendChild(btn);
    });
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

function clearForm() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('walkDate').value = today;
    document.getElementById('minutes').value = '10';
    state = { effort: null, pain: null };
    document.querySelectorAll('.emoji-option').forEach(c => c.classList.remove('selected'));
}

// ניווט
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

// שמירה
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

    localStorage.setItem('walks', JSON.stringify(walks));
    updateBrainAndUI();
    showScreen('homeScreen');
};

// טעינה לעריכה
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
    
    const painOptions = document.querySelectorAll('#painContainer .emoji-option');
    if(painOptions[w.pain]) painOptions[w.pain].classList.add('selected');
    
    document.getElementById('deleteBtnForm').classList.remove('hidden');
    showScreen('formScreen');
};

document.getElementById('deleteBtnForm').onclick = () => {
    if (editIndex !== null) askDelete(editIndex);
};

window.askDelete = (idx) => {
    deleteIndex = idx;
    const w = walks[idx];
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

function renderLog() {
    const listContainer = document.getElementById('list');
    listContainer.innerHTML = '';

    if (walks.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center; color:#777; padding:20px;">אין עדיין הליכות מתועדות.</p>';
        return;
    }

    // יצירת עותק ממוין לרינדור בלבד כדי לא להרוס את אינדקס המערך המקורי
    const sortedWalks = walks
        .map((w, index) => ({ ...w, originalIndex: index }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedWalks.forEach((w) => {
        const item = document.createElement('div');
        item.className = 'log-item';
        
        const dateObj = new Date(w.date);
        const displayDate = !isNaN(dateObj) ? `${dateObj.getDate()}/${dateObj.getMonth()+1}` : w.date;

        item.innerHTML = `
            <div class="log-date">${displayDate}</div>
            <div class="log-duration">${w.minutes} דקות</div>
            <div class="log-actions">
                <button class="action-btn" onclick="editWalk(${w.originalIndex})">✏️</button>
                <button class="action-btn" onclick="askDelete(${w.originalIndex})">🗑️</button>
            </div>
        `;
        listContainer.appendChild(item);
    });
}

// מנוע המלצות מתוקן ויציב לחלוטין
function updateBrainAndUI() {
    const circle = document.getElementById('trafficLightCircle');
    const title = document.getElementById('statusTitle');
    const desc = document.getElementById('recommendationText');
    const recommendedMinutesInput = document.getElementById('recommendedMinutes');

    let baseTime = 10;
    recommendedMinutesInput.textContent = baseTime;

    if (walks.length === 0) {
        circle.className = 'status-circle green-status';
        circle.textContent = '✓';
        title.textContent = 'מוכנה להתחיל?';
        desc.textContent = 'תעדי את ההליכה הראשונה שלך כדי לקבל המלצות מותאמות.';
        return;
    }

    // מיון פנימי זמני לצורך חישוב 3 ההליכות האחרונות כרונולוגית (מהחדש לישן)
    const chronologicalWalks = [...walks].sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastThree = chronologicalWalks.slice(0, 3);
    
    let maxPain = 0;
    let highEffortCount = 0;

    lastThree.forEach(w => {
        if (w.pain > maxPain) maxPain = w.pain;
        if (w.effort >= 2) highEffortCount++; // מאמץ קשה או קשה מאוד
    });

    const latestWalk = lastThree[0];

    // לוגיקת קבלת החלטות מתוקנת (סולם 0-3)
    if (maxPain >= 2 || latestWalk.pain >= 2) {
        // אדום: כאב מציק (2) או כאב חזק (3) בהליכות האחרונות
        circle.className = 'status-circle red-status';
        circle.textContent = '⚠';
        title.textContent = 'להפחית עומס / לנוח';
        desc.textContent = 'נראה שיש עלייה ברמת הכאב בדיווחים האחרונים. מומלץ לקחת יום מנוחה או להפחית משמעותית את זמן ההליכה.';
        recommendedMinutesInput.textContent = Math.max(5, Math.round(latestWalk.minutes * 0.7));
    } else if (maxPain === 1 || highEffortCount >= 2) {
        // צהוב: יש כאב קל (1) או שהיו לפחות שתי הליכות במאמץ גבוה
        circle.className = 'status-circle yellow-status';
        circle.textContent = '●';
        title.textContent = 'להישאר באותו עומס';
        desc.textContent = 'הגוף מתרגל לעומס הנוכחי וישנו סימן לכאב קל או מאמץ מוגבר. מומלץ להישאר באותו זמן הליכה.';
        recommendedMinutesInput.textContent = latestWalk.minutes;
    } else {
        // ירוק: רמת כאב 0 (ללא כאב) ומאמץ תקין לחלוטין בשלוש ההליכות האחרונות
        circle.className = 'status-circle green-status';
        circle.textContent = '✓';
        title.textContent = 'אפשר להמשיך';
        desc.textContent = 'אין החמרה או כאב בשלוש ההליכות האחרונות. אפשר להמשיך להתקדם בהדרגה.';
        recommendedMinutesInput.textContent = latestWalk.minutes + 2;
    }
}

window.onload = () => {
    initFormComponents();
    updateBrainAndUI();
};
