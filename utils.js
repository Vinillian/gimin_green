// utils.js

function getElapsedDays(container) {
    const now = Date.now();
    const realElapsed = now - container.stageStartTime;
    // Переводим в дни с учётом скорости
    return (realElapsed * state.speed) / (24 * 60 * 60 * 1000);
}

function getStageProgress(container) {
    const elapsedDays = getElapsedDays(container);
    const totalDays = STAGE_DURATION_DAYS[container.stage];
    return Math.min(100, (elapsedDays / totalDays) * 100);
}

function getTimeLeft(container) {
    const elapsedDays = getElapsedDays(container);
    const totalDays = STAGE_DURATION_DAYS[container.stage];
    const leftDays = Math.max(0, totalDays - elapsedDays);
    return leftDays.toFixed(1);
}

function isReady(container) {
    if (container.stage !== 'light') return false;
    const elapsedDays = getElapsedDays(container);
    return elapsedDays >= STAGE_DURATION_DAYS.light;
}

function getReadyDate(container) {
    if (container.stage !== 'light') return '—';
    
    const elapsedDays = getElapsedDays(container);
    if (elapsedDays >= STAGE_DURATION_DAYS.light) return '✅ ГОТОВО';
    
    const leftDays = STAGE_DURATION_DAYS.light - elapsedDays;
    const readyTime = new Date(Date.now() + leftDays * 24 * 60 * 60 * 1000 / state.speed);
    
    return readyTime.toLocaleDateString('ru', { 
        day: 'numeric', 
        month: 'short'
    });
}

function getForecast(days) {
    const forecast = new Array(days).fill(0);
    const dayMs = 24 * 60 * 60 * 1000;
    const now = Date.now();

    state.containers.forEach(c => {
        if (c.stage !== 'light') return;

        const realElapsed = now - c.stageStartTime;
        const durationMs = STAGE_DURATION_DAYS.light * dayMs;
        const realTimeLeftMs = durationMs - realElapsed;

        if (realTimeLeftMs <= 0) {
            forecast[0] += 1;
        } else {
            const dayIndex = Math.ceil(realTimeLeftMs / dayMs);
            if (dayIndex < days) {
                forecast[dayIndex] += 1;
            }
        }
    });

    return forecast;
}

function getContainerNumber(id) {
    const c = state.containers.find(c => c.id === id);
    return c ? c.number : '?';
}

// Проверка необходимости опрыскивания
function needsSpray(container) {
    if (container.stage !== 'soak' && container.stage !== 'press') return false;
    if (!container.lastSpray) return true; // никогда не опрыскивали
    
    const lastSpray = container.lastSpray;
    const elapsedDays = (Date.now() - lastSpray) / (24 * 60 * 60 * 1000) * state.speed;
    return elapsedDays >= 1; // каждый день
}

// Проверка необходимости полива (на свету, каждые 2 дня)
function needsWater(container) {
    if (container.stage !== 'light') return false;
    if (!container.lastWater) return true;
    
    const lastWater = container.lastWater;
    const elapsedDays = (Date.now() - lastWater) / (24 * 60 * 60 * 1000) * state.speed;
    return elapsedDays >= 2;
}