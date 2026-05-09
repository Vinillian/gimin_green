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

const RESOURCE_COSTS = {
    soak: {
        water: 0.2,
        seeds: 0.08
    },
    sow: {
        solution: 0.2
    },
    water: 0.2,      // 200 мл на полив
    spray: 0.05       // 50 мл на опрыскивание
};