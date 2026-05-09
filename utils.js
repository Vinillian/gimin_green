// utils.js

// Получить оставшееся время в секундах
function getRemainingSeconds(container) {
    if (!container.stageStartTime) return 0;
    
    const now = Date.now();
    const elapsed = (now - container.stageStartTime) / 1000;
    const total = STAGE_DURATION[container.stage];
    const remaining = Math.max(0, total - elapsed);
    return Math.ceil(remaining);
}

// Получить прогресс в процентах
function getProgress(container) {
    if (!container.stageStartTime) return 0;
    
    const now = Date.now();
    const elapsed = (now - container.stageStartTime) / 1000;
    const total = STAGE_DURATION[container.stage];
    return Math.min(100, (elapsed / total) * 100);
}

// Проверить, готов ли контейнер
function isReady(container) {
    if (container.stage !== 'light') return false;
    return getRemainingSeconds(container) <= 0;
}

// Нужен ли полив
function needsWater(container) {
    if (container.stage !== 'light' || !container.lastWaterTime) return false;
    const now = Date.now();
    return (now - container.lastWaterTime) / 1000 >= LIGHT_WATER_REMINDER_INTERVAL;
}

// Нужно ли опрыскивание
function needsSpray(container) {
    if (!container.lastSprayTime) return true;
    const now = Date.now();
    return (now - container.lastSprayTime) / 1000 >= SPRAY_REMINDER_INTERVAL;
}