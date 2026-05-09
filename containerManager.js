// containerManager.js

function createContainer() {
    if (state.containers.length >= MAX_CONTAINERS) {
        addLog("❌ Достигнут максимум контейнеров (20)");
        return false;
    }

    if (state.seeds < 1) {
        addLog("❌ Нет семян для посадки");
        return false;
    }

    // Находим первый свободный номер от 1 до 20
    let number = 1;
    const existingNumbers = new Set(state.containers.map(c => c.number));
    while (existingNumbers.has(number)) {
        number++;
    }

    const id = state.nextId++;
    state.seeds--;

    state.containers.push({
        id: id,
        stage: 'soak',
        number: number
    });

    addLog(`🌱 Добавлен контейнер #${number} (стадия: замачивание)`);
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

    let changed = 0;
    state.containers.forEach(c => {
        if (state.selectedIds.has(c.id)) {
            c.stage = stage;
            changed++;
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
            if (Math.random() > 0.3) state.water += 1;
            if (Math.random() > 0.5) state.solution += 1;
            if (Math.random() > 0.7) state.seeds += 1;
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
    state.water += 5;
    addLog("🚰 +5 воды");
    saveToLocalStorage();
    render();
}

function addSolution() {
    state.solution += 4;
    addLog("🧪 +4 раствора");
    saveToLocalStorage();
    render();
}

function addSeeds() {
    state.seeds += 10;
    addLog("🌱 +10 семян");
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