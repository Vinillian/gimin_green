// constants.js - теперь это модуль с экспортами

// Максимальное количество контейнеров
export const MAX_CONTAINERS = 20;

// Стадии роста
export const STAGES = ['soak', 'air', 'sow', 'press', 'light'];

// Названия стадий для отображения
export const STAGE_NAMES = {
    'soak': '💧 Замачивание',
    'air': '🌬 Проветривание',
    'sow': '🌱 Посев',
    'press': '📦 Прижим',
    'light': '💡 На свету'
};

// Иконки стадий
export const STAGE_ICONS = {
    'soak': '💧',
    'air': '🌬',
    'sow': '🌱',
    'press': '📦',
    'light': '💡'
};

// Длительность стадий в днях
export const STAGE_DURATION = {
    'soak': 1,
    'air': 1,
    'sow': 0,
    'press': 2,
    'light': 5
};

// Расход ресурсов
export const RESOURCE_COSTS = {
    soak: {
        water: 0.2,
        seeds: 0.08
    },
    sow: {
        solution: 0.2
    },
    water: 0.2,
    spray: 0.05
};

// Вместимость различных зон
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

// Настройки времени
export const TIME_SETTINGS = {
    DAY_INCREMENT: 0.1,
    TICK_INTERVAL: 6000,
    REAL_SECONDS_PER_DAY: 60
};

// Достижения
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

// Начальная статистика
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