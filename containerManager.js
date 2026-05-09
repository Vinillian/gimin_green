// containerManager.js

function createContainer() {
    if (state.containers.length >= MAX_CONTAINERS) {
        addLog("❌ Достигнут максимум контейнеров (20)");
        return false;
    }

    if (state.seeds < 0.08) { // 80 грамм семян
        addLog("❌ Нет семян для посадки (нужно 0.08 кг)");
        return false;
    }

    // Проверяем наличие воды для замачивания
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

    state.containers.push({
        id: id,
        stage: 'soak',
        number: number
    });

    addLog(`🌱 Добавлен контейнер #${number} (стадия: замачивание, потрачено ${RESOURCE_COSTS.soak.water} л воды и ${RESOURCE_COSTS.soak.seeds} кг семян)`);
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
    
    // Считаем, сколько ресурсов нужно для всех выбранных контейнеров
    state.containers.forEach(c => {
        if (state.selectedIds.has(c.id)) {
            // При переводе в замачивание тратится вода
            if (stage === 'soak' && c.stage !== 'soak') {
                requiredWater += RESOURCE_COSTS.soak.water;
            }
            // При переводе в посев тратится раствор
            if (stage === 'sow' && c.stage !== 'sow') {
                requiredSolution += RESOURCE_COSTS.sow.solution;
            }
        }
    });

    // Проверяем достаточно ли ресурсов
    if (requiredWater > 0 && state.water < requiredWater) {
        addLog(`❌ Недостаточно воды! Нужно ${requiredWater.toFixed(2)} л, есть ${state.water.toFixed(2)} л`);
        return;
    }
    if (requiredSolution > 0 && state.solution < requiredSolution) {
        addLog(`❌ Недостаточно раствора! Нужно ${requiredSolution.toFixed(2)} л, есть ${state.solution.toFixed(2)} л`);
        return;
    }

    // Списываем ресурсы с округлением до 2 знаков
    state.water = Math.round((state.water - requiredWater) * 100) / 100;
    state.solution = Math.round((state.solution - requiredSolution) * 100) / 100;

    // Меняем стадии
    let changed = 0;
    state.containers.forEach(c => {
        if (state.selectedIds.has(c.id)) {
            const oldStage = c.stage;
            c.stage = stage;
            changed++;
            
            // Логируем расход для каждого контейнера
            if (oldStage !== stage) {
                if (stage === 'soak' && requiredWater > 0) {
                    addLog(`💧 Контейнер #${c.number}: замачивание (-${RESOURCE_COSTS.soak.water} л воды)`);
                } else if (stage === 'sow' && requiredSolution > 0) {
                    addLog(`🌱 Контейнер #${c.number}: посев (-${RESOURCE_COSTS.sow.solution} л раствора)`);
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
    addLog(`✂️ Собрано ${harvested} контейнеров пшеницы`);
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
    // Проверяем, есть ли вода для создания раствора
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