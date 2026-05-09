// constants.js
const MAX_CONTAINERS = 10;
const STAGES = ['soak', 'press', 'light'];

// Длительность каждой стадии в днях (для расчёта)
const STAGE_DURATION_DAYS = {
    'soak': 1,      // замачивание: 1 день
    'press': 2,     // прижим: 2 дня
    'light': 5      // на свету: 5 дней
};

// Длительность в минутах для ускоренного теста
const STAGE_DURATION = {
    'soak': 1,      // 1 минута = 1 день
    'press': 2,     // 2 минуты = 2 дня
    'light': 5      // 5 минут = 5 дней
};

// Расход воды (в мл)
const WATER_USAGE = {
    'soak': 200,    // замачивание (промывка)
    'sow': 250,     // посев (смачивание агроваты)
    'spray': 0,     // опрыскивание бесплатно
    'water': 200    // нижний полив
};

const STAGE_NAMES = {
    'soak': '💧 Замачивание (1 день)',
    'press': '📦 Прижим (2 дня)',
    'light': '💡 На свету (5 дней)'
};

const STAGE_ICONS = {
    'soak': '💧',
    'press': '📦',
    'light': '💡'
};

// Интервалы напоминаний (в днях)
const REMINDERS = {
    'spray': 1,     // опрыскивать каждый день
    'water': 2      // полив каждые 2 дня на свету
};