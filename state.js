// state.js

// Функция для округления ресурсов
function roundResource(value) {
    return Math.round(value * 100) / 100;
}

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
    
    // Стол для посева
    table: {
        containers: [] // массив id контейнеров
    },
    
    // Полки для прижима
    shelves: [
        { id: 1, containers: [] },
        { id: 2, containers: [] },
        { id: 3, containers: [] }
    ],
    
    // Выделенные элементы
    selectedIds: new Set(),
    selectedBucketIds: new Set(), // множественный выбор вёдер
    
    // Ресурсы
    water: 20,
    solution: 15,
    seeds: 30,
    
    // Системные поля
    nextId: 1,
    log: ["📋 Добро пожаловать в тестовую ферму!"],
    
    // Поля для времени
    gameDay: 0,
    lastUpdateTime: null,
    timeMultiplier: 1,
    isRunning: true,
    
    // Статистика и достижения
    stats: { ...INITIAL_STATS },
    
    // Настройки
    settings: {
        smartBucketFill: true,
        soundEnabled: true,
        animationsEnabled: true
    },
    
    // Для отслеживания модификаторов клавиатуры
    multiselectModifier: false
};

// Добавление сообщения в лог
function addLog(msg) {
    state.log.unshift(`⏱️ ${new Date().toLocaleTimeString().slice(0,5)} • ${msg}`);
    if (state.log.length > 15) state.log.pop();
}

// Сохранение в localStorage
function saveToLocalStorage() {
    try {
        const stateToSave = {
            water: state.water,
            solution: state.solution,
            seeds: state.seeds,
            containers: state.containers,
            buckets: state.buckets,
            table: state.table,
            shelves: state.shelves,
            nextId: state.nextId,
            gameDay: state.gameDay,
            selectedIds: Array.from(state.selectedIds),
            selectedBucketIds: Array.from(state.selectedBucketIds),
            stats: state.stats,
            settings: state.settings
        };
        localStorage.setItem('farmState', JSON.stringify(stateToSave));
    } catch(e) {
        console.error('Ошибка сохранения:', e);
    }
}

// Загрузка из localStorage
function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('farmState');
        if (saved) {
            const data = JSON.parse(saved);
            
            // Основные ресурсы
            state.water = data.water ?? 20;
            state.solution = data.solution ?? 15;
            state.seeds = data.seeds ?? 30;
            
            // Контейнеры и структуры
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
            
            // Системные поля
            state.nextId = data.nextId ?? 1;
            state.gameDay = data.gameDay ?? 0;
            
            // Восстанавливаем выделение
            state.selectedIds = new Set(data.selectedIds || []);
            state.selectedBucketIds = new Set(data.selectedBucketIds || []);
            
            // Статистика и настройки
            state.stats = { ...INITIAL_STATS, ...(data.stats || {}) };
            state.settings = { ...state.settings, ...(data.settings || {}) };
            
            // Валидация целостности
            validateStructures();
        }
    } catch(e) {
        console.error('Ошибка загрузки:', e);
    }
}

// Валидация целостности данных
function validateStructures() {
    const validIds = new Set(state.containers.map(c => c.id));
    
    // Очищаем стол от несуществующих контейнеров
    state.table.containers = state.table.containers.filter(id => validIds.has(id));
    
    // Очищаем полки
    state.shelves.forEach(shelf => {
        shelf.containers = shelf.containers.filter(id => validIds.has(id));
    });
    
    // Очищаем выделение от несуществующих контейнеров
    state.selectedIds.forEach(id => {
        if (!validIds.has(id)) {
            state.selectedIds.delete(id);
        }
    });
}