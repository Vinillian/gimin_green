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

// Расход ресурсов
const RESOURCE_COSTS = {
    soak: {
        water: 0.2, // 200 мл = 0.2 литра
        seeds: 0.08 // 80 грамм = 0.08 кг
    },
    sow: {
        solution: 0.2 // 200 мл = 0.2 литра
    }
};