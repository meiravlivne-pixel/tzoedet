const E = ['😌', '🙂', '😅', '😓'];
const P = ['😀', '🙂', '😐', '🙁'];

let state = {};
let editIndex = null;
let deleteIndex = null;

let walks = JSON.parse(localStorage.getItem("walks") || "[]");

function build(id, arr, key) {
    const container = document.getElementById(id);

    arr.forEach((emoji, index) => {
        const btn = document.createElement("span");
        btn.className = "choice";
        btn.textContent = emoji;

        btn.onclick = () => {
            state[key] = index;

            [...container.children].forEach(c =>
                c.classList.remove("selected")
            );

            btn.classList.add("selected");
        };

        container.appendChild(btn);
    });
}

build("effort", E, "e");
build("pain", P, "p");

function clearSelection(id) {
    [...document.getElementById(id).children]
        .forEach(c => c.classList.remove("selected"));
}

function selectChoice(id, index) {
    const children = document.getElementById(id).children;

    clearSelection(id);

    if (children[index]) {
        children[index].classList.add("selected");
    }
}

function resetForm() {

    minutes.value = "";

    state = {};

    clearSelection("effort");
    clearSelection("pain");
}

startBtn.onclick = () => {

    editIndex = null;

    resetForm();

    walkForm.classList.remove("hidden");
};

saveBtn.onclick = () => {

    const walk = {
        date: new Date().toLocaleDateString("he-IL"),
        minutes: Number(minutes.value),
        e: state.e,
        p: state.p
    };

    if (editIndex === null)
        walks.push(walk);
    else
        walks[editIndex] = walk;

    localStorage.setItem("walks", JSON.stringify(walks));

    walkForm.classList.add("hidden");

    resetForm();

    render();
};

function render() {

    list.innerHTML = "";

    walks.forEach((w, i) => {

        const row = document.createElement("div");

        row.className = "rowItem";

        row.innerHTML = `
            <span>${w.date} • ${w.minutes} דק׳</span>
            <span>
                <button onclick="editWalk(${i})">✏️</button>
                <button onclick="askDelete(${i})">🗑️</button>
            </span>
        `;

        list.appendChild(row);

    });

}

window.editWalk = (i) => {

    editIndex = i;

    const w = walks[i];

    minutes.value = w.minutes;

    state.e = w.e;
    state.p = w.p;

    selectChoice("effort", w.e);
    selectChoice("pain", w.p);

    walkForm.classList.remove("hidden");
};

window.askDelete = (i) => {

    deleteIndex = i;

    dialog.classList.remove("hidden");

};

confirmDelete.onclick = () => {

    walks.splice(deleteIndex, 1);

    localStorage.setItem("walks", JSON.stringify(walks));

    dialog.classList.add("hidden");

    render();

};

cancelDelete.onclick = () => {

    dialog.classList.add("hidden");

};

render();
