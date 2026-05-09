// constants.js
const MAX_CONTAINERS = 20;
const STAGES = ['soak', 'air', 'sow', 'press', 'light'];

const STAGE_NAMES = {
    'soak': '💧 Замачивание',
    'air': '🌬 Проветривание',
    'sow': '🌱 Посев',
    'press': '📦 Прижим',
    'light': '💡 На свету'
};

const STAGE_ICONS = {
    'soak': '💧',
    'air': '🌬',
    'sow': '🌱',
    'press': '📦',
    'light': '💡'
};

// Длительность стадий в днях
const STAGE_DURATION = {
    'soak': 1,
    'air': 1,
    'sow': 0,
    'press': 2,
    'light': 5
};

// Расход ресурсов
const RESOURCE_COSTS = {
    soak: {
        water: 0.2,  // на один контейнер в ведре
        seeds: 0.08   // на один контейнер в ведре
    },
    sow: {
        solution: 0.2 // на один контейнер при посеве
    },
    water: 0.2,      // полив
    spray: 0.05      // опрыскивание
};