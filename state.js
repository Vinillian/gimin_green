// state.js
const state = {
    containers: [],
    selectedIds: new Set(),
    water: 20,
    solution: 15,
    seeds: 30,
    nextId: 1,
    log: ["📋 Добро пожаловать в тестовую ферму!"]
};

function addLog(msg) {
    state.log.unshift(`⏱️ ${new Date().toLocaleTimeString().slice(0,5)} • ${msg}`);
    if (state.log.length > 15) state.log.pop();
}

function saveToLocalStorage() {
    try {
        localStorage.setItem('farmState', JSON.stringify({
            water: state.water,
            solution: state.solution,
            seeds: state.seeds,
            containers: state.containers,
            nextId: state.nextId
        }));
    } catch(e) {}
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('farmState');
        if (saved) {
            const data = JSON.parse(saved);
            state.water = data.water ?? 20;
            state.solution = data.solution ?? 15;
            state.seeds = data.seeds ?? 30;
            state.containers = data.containers ?? [];
            state.nextId = data.nextId ?? 1;
        }
    } catch(e) {}
}