// state.js
const state = {
    // Контейнеры (создаются только после посева)
    containers: [],
    
    // Вёдра для семян и процессов
    buckets: [
        { id: 1, seeds: 0, stage: null, stageStartDay: null, needsTransition: false },
        { id: 2, seeds: 0, stage: null, stageStartDay: null, needsTransition: false },
        { id: 3, seeds: 0, stage: null, stageStartDay: null, needsTransition: false },
        { id: 4, seeds: 0, stage: null, stageStartDay: null, needsTransition: false }
    ],
    
    // Стол для посева (макс. 8 контейнеров)
    table: {
        containers: [] // массив id контейнеров
    },
    
    // Полки для прижима (3 полки по 4 места)
    shelves: [
        { id: 1, containers: [] },
        { id: 2, containers: [] },
        { id: 3, containers: [] }
    ],
    
    selectedIds: new Set(),
    selectedBucketId: null,
    water: 20,
    solution: 15,
    seeds: 30,
    nextId: 1,
    log: ["📋 Добро пожаловать в тестовую ферму!"],
    
    // Поля для времени
    gameDay: 0,
    lastUpdateTime: null,
    timeMultiplier: 1,
    isRunning: true
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
            buckets: state.buckets,
            table: state.table,
            shelves: state.shelves,
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
            state.buckets = data.buckets ?? [
                { id: 1, seeds: 0, stage: null, stageStartDay: null, needsTransition: false },
                { id: 2, seeds: 0, stage: null, stageStartDay: null, needsTransition: false },
                { id: 3, seeds: 0, stage: null, stageStartDay: null, needsTransition: false },
                { id: 4, seeds: 0, stage: null, stageStartDay: null, needsTransition: false }
            ];
            state.table = data.table ?? { containers: [] };
            state.shelves = data.shelves ?? [
                { id: 1, containers: [] },
                { id: 2, containers: [] },
                { id: 3, containers: [] }
            ];
            state.nextId = data.nextId ?? 1;
            state.gameDay = data.gameDay ?? 0;
        }
    } catch(e) {}
}