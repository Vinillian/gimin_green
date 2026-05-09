// constants.js - реальные длительности стадий (в миллисекундах)
export const MAX_CONTAINERS = 20;

export const STAGES = ['soak', 'air', 'sow', 'press', 'light'];

export const STAGE_NAMES = {
    'soak': '💧 Замачивание',
    'air': '🌬 Проветривание',
    'sow': '🌱 Посев',
    'press': '📦 Прижим',
    'light': '💡 На свету'
};

export const STAGE_ICONS = {
    'soak': '💧',
    'air': '🌬',
    'sow': '🌱',
    'press': '📦',
    'light': '💡'
};

// РЕАЛЬНЫЕ длительности в миллисекундах (настройте под свои процессы)
export const STAGE_DURATION_REAL = {
    'soak': 24 * 60 * 60 * 1000,      // 24 часа
    'air': 24 * 60 * 60 * 1000,        // 24 часа
    'sow': 0,                          // посев моментальный
    'press': 2 * 24 * 60 * 60 * 1000,  // 2 дня
    'light': 7 * 24 * 60 * 60 * 1000   // 7 дней
};

// Реальные интервалы для полива и опрыскивания (в миллисекундах)
export const CARE_INTERVALS = {
    SPRAY_EVERY: 24 * 60 * 60 * 1000,   // опрыскивать раз в сутки
    WATER_EVERY: 24 * 60 * 60 * 1000    // поливать раз в сутки
};

// Расход ресурсов (оставляем как есть)
export const RESOURCE_COSTS = {
    soak: { water: 0.2, seeds: 0.08 },
    sow: { solution: 0.2 },
    water: 0.2,
    spray: 0.05
};

// Вместимость (без изменений)
export const CAPACITY = {
    MAX_SEEDS_PER_BUCKET: 4,
    TABLE_CAPACITY: 8,
    LIGHT_CAPACITY: 16,
    SHELF_CAPACITY: 4,
    SHELVES_COUNT: 3,
    BUCKETS_COUNT: 4,
    PALLET_SIZE: 8,
    PALLETS_COUNT: 2
};

// Достижения (можно оставить как есть)
export const ACHIEVEMENTS = {
    FIRST_CROP: {
        id: 'first_crop',
        title: '👶 Первый урожай',
        description: 'Собери первый контейнер',
        icon: '🌱',
        condition: (stats) => stats.totalHarvested >= 1,
        reward: '+5 семян'
    },
    BEGINNER_FARMER: {
        id: 'beginner_farmer',
        title: '🧑‍🌾 Начинающий фермер',
        description: 'Собери 10 контейнеров',
        icon: '🚜',
        condition: (stats) => stats.totalHarvested >= 10,
        reward: '+10 воды'
    },
    EXPERIENCED_FARMER: {
        id: 'experienced_farmer',
        title: '👨‍🌾 Опытный фермер',
        description: 'Собери 50 контейнеров',
        icon: '⭐',
        condition: (stats) => stats.totalHarvested >= 50,
        reward: '+20 раствора'
    },
    MASTER_FARMER: {
        id: 'master_farmer',
        title: '👑 Мастер-фермер',
        description: 'Собери 100 контейнеров',
        icon: '🏆',
        condition: (stats) => stats.totalHarvested >= 100,
        reward: '🌟 Особый статус'
    },
    EFFICIENT: {
        id: 'efficient',
        title: '⚡ Эффективный',
        description: 'Заполни все 4 ведра одновременно',
        icon: '💪',
        condition: (stats) => stats.maxFullBuckets >= 4,
        reward: 'Ускорение на 10%'
    },
    FULL_HOUSE: {
        id: 'full_house',
        title: '🏠 Полный дом',
        description: 'Заполни все зоны одновременно',
        icon: '🏘️',
        condition: (stats) => stats.maxFullTable && stats.maxFullShelves && stats.maxFullLight,
        reward: 'Бонус к урожаю'
    },
    SPEED_DEMON: {
        id: 'speed_demon',
        title: '⚡ Спринтер',
        description: 'Собери урожай менее чем за 7 дней',
        icon: '🏃',
        condition: (stats) => stats.fastestCycle !== null && stats.fastestCycle < 7,
        reward: 'Ускорение на 15%'
    },
    WATER_SAVER: {
        id: 'water_saver',
        title: '💧 Экономный',
        description: 'Потрать меньше 50 литров воды на 10 контейнеров',
        icon: '💰',
        condition: (stats) => stats.totalHarvested >= 10 && (stats.totalWaterUsed / stats.totalHarvested) < 5,
        reward: 'Скидка на воду 10%'
    }
};

export const INITIAL_STATS = {
    totalHarvested: 0,
    totalWaterUsed: 0,
    totalSolutionUsed: 0,
    totalSeedsUsed: 0,
    fastestCycle: null,
    maxFullBuckets: 0,
    maxFullTable: false,
    maxFullShelves: false,
    maxFullLight: false,
    achievements: []
};