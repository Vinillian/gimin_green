// containerManager.js

function createContainer() {
    if (state.containers.length >= MAX_CONTAINERS) {
        addLog("❌ Достигнут максимум контейнеров (20)");
        return false;
    }

    if (state.seeds < RESOURCE_COSTS.soak.seeds) {
        addLog(`❌ Нет семян для посадки (нужно ${RESOURCE_COSTS.soak.seeds} кг)`);
        return false;
    }

    if (state.water < RESOURCE_COSTS.soak.water) {
        addLog(`❌ Нужно ${RESOURCE_COSTS.soak.water} л воды для замачивания`);
        return false;
    }

    // Находим первый свободный номер от 1 до 20
    let number = 1;
    const existingNumbers = new Set(state.containers.map(c => c.number));
    while (existingNumbers.has(number)) {
        number++;
    }

    const id = state.nextId++;
    
    // Списываем ресурсы
    state.seeds = Math.round((state.seeds - RESOURCE_COSTS.soak.seeds) * 100) / 100;
    state.water = Math.round((state.water - RESOURCE_COSTS.soak.water) * 100) / 100;

    const currentDay = Math.floor(state.gameDay);
    
    state.containers.push({
        id: id,
        stage: 'soak',
        number: number,
        stageStartDay: state.gameDay,
        lastSprayDay: currentDay,
        needsSpray: false,
        needsTransition: false // Новый флаг для восклицательного знака
    });

    addLog(`🌱 Добавлен контейнер #${number} (стадия: замачивание, день ${state.gameDay.toFixed(1)})`);
    saveToLocalStorage();
    render();
    return true;
}

function create4Containers() {
    let created = 0;
    for (let i = 0; i < 4; i++) {
        if (createContainer()) created++;
    }
    if (created > 0) addLog(`⚡ Добавлено ${created} контейнеров`);
}

function setStageForSelected(stage) {
    if (state.selectedIds.size === 0) {
        addLog("⚠️ Сначала выбери контейнеры (нажми на них)");
        return;
    }

    // Проверяем ресурсы перед изменением стадии
    let requiredWater = 0;
    let requiredSolution = 0;
    
    state.containers.forEach(c => {
        if (state.selectedIds.has(c.id)) {
            if (stage === 'soak' && c.stage !== 'soak') {
                requiredWater += RESOURCE_COSTS.soak.water;
            }
            if (stage === 'sow' && c.stage !== 'sow') {
                requiredSolution += RESOURCE_COSTS.sow.solution;
            }
        }
    });

    if (requiredWater > 0 && state.water < requiredWater) {
        addLog(`❌ Недостаточно воды! Нужно ${requiredWater.toFixed(2)} л, есть ${state.water.toFixed(2)} л`);
        return;
    }
    if (requiredSolution > 0 && state.solution < requiredSolution) {
        addLog(`❌ Недостаточно раствора! Нужно ${requiredSolution.toFixed(2)} л, есть ${state.solution.toFixed(2)} л`);
        return;
    }

    state.water = Math.round((state.water - requiredWater) * 100) / 100;
    state.solution = Math.round((state.solution - requiredSolution) * 100) / 100;

    let changed = 0;
    const currentDay = Math.floor(state.gameDay);
    
    state.containers.forEach(c => {
        if (state.selectedIds.has(c.id)) {
            const oldStage = c.stage;
            c.stage = stage;
            c.stageStartDay = state.gameDay;
            // Сбрасываем флаги при смене стадии
            c.lastSprayDay = currentDay;
            c.needsSpray = false;
            c.needsTransition = false; // Сбрасываем восклицательный знак
            changed++;
            
            if (oldStage !== stage) {
                if (stage === 'soak' && requiredWater > 0) {
                    addLog(`💧 Контейнер #${c.number}: замачивание (день ${state.gameDay.toFixed(1)})`);
                } else if (stage === 'sow' && requiredSolution > 0) {
                    addLog(`🌱 Контейнер #${c.number}: посев (день ${state.gameDay.toFixed(1)})`);
                } else {
                    addLog(`🔄 Контейнер #${c.number}: ${STAGE_NAMES[stage]} (день ${state.gameDay.toFixed(1)})`);
                }
            }
        }
    });

    addLog(`🔄 ${changed} контейнеров переведены в ${STAGE_NAMES[stage]}`);
    saveToLocalStorage();
    render();
}

function resetSelectedStage() {
    setStageForSelected('soak');
}

function harvestSelected() {
    if (state.selectedIds.size === 0) return;

    let harvested = 0;
    state.containers = state.containers.filter(c => {
        if (state.selectedIds.has(c.id)) {
            if (Math.random() > 0.3) state.water = Math.round((state.water + 1) * 100) / 100;
            if (Math.random() > 0.5) state.solution = Math.round((state.solution + 1) * 100) / 100;
            if (Math.random() > 0.7) state.seeds = Math.round((state.seeds + 1) * 100) / 100;
            harvested++;
            return false;
        }
        return true;
    });

    state.selectedIds.clear();
    addLog(`✂️ Собрано ${harvested} контейнеров пшеницы (день ${state.gameDay.toFixed(1)})`);
    saveToLocalStorage();
    render();
}

function deleteSelected() {
    if (state.selectedIds.size === 0) return;

    const count = state.selectedIds.size;
    state.containers = state.containers.filter(c => !state.selectedIds.has(c.id));
    state.selectedIds.clear();
    addLog(`🗑️ Удалено ${count} контейнеров`);
    saveToLocalStorage();
    render();
}

function addWater() {
    state.water = Math.round((state.water + 5) * 100) / 100;
    addLog("🚰 +5 литров воды");
    saveToLocalStorage();
    render();
}

function addSolution() {
    if (state.water < 4) {
        addLog(`❌ Недостаточно воды для создания раствора! Нужно 4 л воды, есть ${state.water.toFixed(2)} л`);
        return;
    }
    
    state.water = Math.round((state.water - 4) * 100) / 100;
    state.solution = Math.round((state.solution + 4) * 100) / 100;
    addLog("🧪 +4 литра раствора (потрачено 4 л воды)");
    saveToLocalStorage();
    render();
}

function addSeeds() {
    state.seeds = Math.round((state.seeds + 10) * 100) / 100;
    addLog("🌱 +10 кг семян");
    saveToLocalStorage();
    render();
}

function selectAll() {
    state.selectedIds = new Set(state.containers.map(c => c.id));
    addLog(`🔲 Выбраны все контейнеры (${state.selectedIds.size})`);
    render();
}

function clearSelection() {
    state.selectedIds.clear();
    addLog(`❌ Выбор снят со всех контейнеров`);
    render();
}

// Функция для опрыскивания
function spraySelected() {
    if (state.selectedIds.size === 0) {
        addLog("⚠️ Сначала выбери контейнеры (нажми на них)");
        return;
    }

    const sprayCost = 0.05;
    let sprayCount = 0;
    let totalCost = 0;

    state.containers.forEach(c => {
        if (state.selectedIds.has(c.id) && c.needsSpray) {
            sprayCount++;
            totalCost += sprayCost;
        }
    });

    if (sprayCount === 0) {
        addLog("❌ Среди выбранных нет контейнеров, которым нужно опрыскивание");
        return;
    }

    if (state.water < totalCost) {
        addLog(`❌ Недостаточно воды! Нужно ${totalCost.toFixed(2)} л, есть ${state.water.toFixed(2)} л`);
        return;
    }

    state.water = Math.round((state.water - totalCost) * 100) / 100;

    const currentDay = Math.floor(state.gameDay);
    let sprayed = [];

    state.containers.forEach(c => {
        if (state.selectedIds.has(c.id) && c.needsSpray) {
            c.lastSprayDay = currentDay;
            c.needsSpray = false;
            sprayed.push(`#${c.number}`);
        }
    });

    addLog(`💦 Опрыскано ${sprayCount} контейнеров: ${sprayed.join(', ')} (потрачено ${totalCost.toFixed(2)} л воды)`);
    saveToLocalStorage();
    render();
}

// Функция для обновления прогресса и проверки напоминаний
function updateProgress() {
    const currentDay = Math.floor(state.gameDay);
    
    state.containers.forEach(c => {
        // Проверка на опрыскивание
        if (['air', 'press', 'light'].includes(c.stage)) {
            if (currentDay > c.lastSprayDay) {
                c.needsSpray = true;
            }
        }
        
        // Проверка на завершение стадии (для восклицательного знака)
        const daysPassed = state.gameDay - c.stageStartDay;
        const totalDays = STAGE_DURATION[c.stage];
        
        if (totalDays > 0) {
            // Если прошло больше или равно длительности стадии
            if (daysPassed >= totalDays) {
                c.needsTransition = true;
            } else {
                c.needsTransition = false;
            }
        } else {
            // Для мгновенных стадий (посев)
            c.needsTransition = false;
        }
    });
    
    render();
}