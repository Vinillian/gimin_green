// state.js
const state = {
    containers: [],
    selectedIds: new Set(),
    water: 10000,        // 10 литров = 10000 мл
    solution: 5000,      // 5 литров = 5000 мл
    nextId: 1,
    speed: 1,
    forecastDays: 7,
    log: ["📋 Добро пожаловать в симулятор фермы!"]
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
            containers: state.containers,
            nextId: state.nextId,
            speed: state.speed,
            forecastDays: state.forecastDays
        }));
    } catch(e) {}
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('farmState');
        if (saved) {
            const data = JSON.parse(saved);
            state.water = data.water ?? 10000;
            state.solution = data.solution ?? 5000;
            state.containers = data.containers ?? [];
            state.nextId = data.nextId ?? 1;
            state.speed = data.speed ?? 1;
            state.forecastDays = data.forecastDays ?? 7;
        }
    } catch(e) {}
}