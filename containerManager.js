// containerManager.js

function createContainer() {
    if (state.containers.length >= MAX_CONTAINERS) {
        addLog("❌ Достигнут максимум контейнеров (10)");
        return false;
    }

    const id = state.nextId++;
    const now = Date.now();

    // Проверяем достаточно ли воды для замачивания
    if (state.water < WATER_USAGE.soak) {
        addLog("❌ Недостаточно воды для замачивания!");
        return false;
    }

    state.water -= WATER_USAGE.soak;

    state.containers.push({
        id: id,
        stage: 'soak',
        stageStartTime: now,
        lastSpray: now,
        lastWater: null,
        number: id
    });

    addLog(`🌱 Добавлен контейнер (замачивание, -${WATER_USAGE.soak}мл воды)`);
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

function sowSelected() {
    if (state.selectedIds.size === 0) {
        addLog("⚠️ Сначала выбери контейнеры");
        return;
    }

    const cost = WATER_USAGE.sow * state.selectedIds.size;
    if (state.solution < cost) {
        addLog(`❌ Нужно ${cost}мл раствора для посева`);
        return;
    }

    let sown = 0;
    const now = Date.now();

    state.containers.forEach(c => {
        if (state.selectedIds.has(c.id) && c.stage === 'soak') {
            c.stage = 'press';
            c.stageStartTime = now;
            c.lastSpray = now;
            sown++;
        }
    });

    if (sown > 0) {
        state.solution -= cost;
        addLog(`🌱 Посеяно ${sown} контейнеров (-${cost}мл раствора)`);
        state.selectedIds.clear();
        saveToLocalStorage();
    } else {
        addLog("⚠️ Нет подходящих контейнеров (нужна стадия замачивания)");
    }
    render();
}

function spraySelected() {
    if (state.selectedIds.size === 0) {
        addLog("⚠️ Сначала выбери контейнеры");
        return;
    }

    const now = Date.now();
    let sprayed = 0;

    state.containers.forEach(c => {
        if (state.selectedIds.has(c.id) && (c.stage === 'soak' || c.stage === 'press')) {
            c.lastSpray = now;
            sprayed++;
        }
    });

    if (sprayed > 0) {
        addLog(`💦 Опрыскано ${sprayed} контейнеров`);
    }
    render();
}

function waterSelected() {
    if (state.selectedIds.size === 0) {
        addLog("⚠️ Сначала выбери контейнеры");
        return;
    }

    const cost = WATER_USAGE.water * state.selectedIds.size;
    if (state.water < cost) {
        addLog(`❌ Нужно ${cost}мл воды для полива`);
        return;
    }

    const now = Date.now();
    let watered = 0;

    state.containers.forEach(c => {
        if (state.selectedIds.has(c.id) && c.stage === 'light') {
            c.lastWater = now;
            watered++;
        }
    });

    if (watered > 0) {
        state.water -= cost;
        addLog(`💧 Нижний полив ${watered} контейнеров (-${cost}мл воды)`);
        state.selectedIds.clear();
        saveToLocalStorage();
    } else {
        addLog("⚠️ Нет контейнеров на свету для полива");
    }
    render();
}

function moveToLight() {
    if (state.selectedIds.size === 0) {
        addLog("⚠️ Сначала выбери контейнеры");
        return;
    }

    let moved = 0;
    const now = Date.now();

    state.containers.forEach(c => {
        if (state.selectedIds.has(c.id) && c.stage === 'press') {
            const elapsedDays = getElapsedDays(c);
            if (elapsedDays >= STAGE_DURATION_DAYS.press) {
                c.stage = 'light';
                c.stageStartTime = now;
                c.lastWater = now;
                moved++;
            }
        }
    });

    if (moved > 0) {
        addLog(`💡 ${moved} контейнеров переведены на свет`);
        state.selectedIds.clear();
        saveToLocalStorage();
    } else {
        addLog("⚠️ Нет готовых к переводу контейнеров (нужно 2 дня прижима)");
    }
    render();
}

function harvestSelected() {
    if (state.selectedIds.size === 0) return;

    let harvested = 0;
    state.containers = state.containers.filter(c => {
        if (state.selectedIds.has(c.id) && isReady(c)) {
            harvested++;
            // Шанс получить немного воды при сборе
            if (Math.random() > 0.3) state.water += 50;
            if (Math.random() > 0.7) state.solution += 50;
            return false;
        }
        return true;
    });

    if (harvested > 0) {
        addLog(`✂️ Собрано ${harvested} контейнеров!`);
        state.selectedIds.clear();
        saveToLocalStorage();
    } else {
        addLog("❌ Нет готовых среди выбранных");
    }
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
    state.water += 1000; // +1 литр
    addLog("🚰 +1 литр воды (1000мл)");
    saveToLocalStorage();
    render();
}

function addSolution() {
    if (state.water < 4000) {
        addLog("❌ Недостаточно воды для приготовления удобрения! Нужно 4л");
        return;
    }
    state.water -= 4000;
    state.solution += 4000;
    addLog("🧪 Приготовлено 4л удобрения (-4л воды)");
    saveToLocalStorage();
    render();
}

function selectAll() {
    state.selectedIds = new Set(state.containers.map(c => c.id));
    render();
}

function clearSelection() {
    state.selectedIds.clear();
    render();
}

function checkReminders() {
    const reminders = [];
    state.containers.forEach(c => {
        if (needsSpray(c)) {
            reminders.push(`🔔 Контейнер нужно опрыскать (${STAGE_NAMES[c.stage]})`);
        }
        if (needsWater(c)) {
            reminders.push(`🔔 Контейнер нужно полить (нижний полив)`);
        }
    });
    return reminders;
}