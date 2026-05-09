// state.js
const state = {
    containers: [],
    selectedIds: new Set(),
    water: 20,
    solution: 15,
    seeds: 30,
    nextId: 1,
    log: ["📋 Добро пожаловать в тестовую ферму!"],
    
    // Новые поля для времени
    gameDay: 0,           // текущий игровой день (может быть дробным)
    lastUpdateTime: null, // для отслеживания реального времени
    timeMultiplier: 1,    // множитель скорости (1 день = 20 сек)
    isRunning: true       // запущен ли таймер
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
            nextId: state.nextId,
            gameDay: state.gameDay
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
            state.gameDay = data.gameDay ?? 0;
        }
    } catch(e) {}
}