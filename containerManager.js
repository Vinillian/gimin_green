// containerManager.js

// Добавление семян в ведро
function addSeedsToBucket(count) {
    // Ищем первое ведро, которое НЕ в процессе (stage === null)
    const availableBucket = state.buckets.find(b => b.stage === null);
    
    if (!availableBucket) {
        addLog("❌ Все вёдра заняты процессами, нужно дождаться освобождения");
        return false;
    }
    
    if (availableBucket.seeds + count > 4) {
        addLog(`❌ В ведре максимум 4 семени, сейчас ${availableBucket.seeds}`);
        return false;
    }
    
    if (state.seeds < RESOURCE_COSTS.soak.seeds * count) {
        addLog(`❌ Недостаточно семян! Нужно ${(RESOURCE_COSTS.soak.seeds * count).toFixed(2)} кг`);
        return false;
    }
    
    // Списываем семена
    state.seeds = Math.round((state.seeds - RESOURCE_COSTS.soak.seeds * count) * 100) / 100;
    
    // Добавляем семена в ведро
    availableBucket.seeds += count;
    
    addLog(`🌱 Добавлено ${count} семян в ведро #${availableBucket.id} (всего ${availableBucket.seeds})`);
    saveToLocalStorage();
    render();
    return true;
}

function createContainer() {
    return addSeedsToBucket(1);
}

function create4Containers() {
    return addSeedsToBucket(4);
}

// Запуск замачивания в выбранном ведре
function startSoaking() {
    if (state.selectedBucketId === null) {
        addLog("⚠️ Сначала выбери ведро (нажми на него)");
        return;
    }
    
    const bucket = state.buckets.find(b => b.id === state.selectedBucketId);
    
    if (!bucket) {
        addLog("❌ Ведро не найдено");
        return;
    }
    
    if (bucket.stage !== null) {
        addLog("❌ Это ведро уже в процессе");
        return;
    }
    
    if (bucket.seeds === 0) {
        addLog("❌ В ведре нет семян");
        return;
    }
    
    // Проверяем воду
    const waterNeeded = RESOURCE_COSTS.soak.water * bucket.seeds;
    if (state.water < waterNeeded) {
        addLog(`❌ Недостаточно воды! Нужно ${waterNeeded.toFixed(2)} л, есть ${state.water.toFixed(2)} л`);
        return;
    }
    
    // Списываем воду
    state.water = Math.round((state.water - waterNeeded) * 100) / 100;
    
    // Запускаем замачивание
    bucket.stage = 'soak';
    bucket.stageStartDay = state.gameDay;
    bucket.needsTransition = false;
    
    addLog(`💧 Запущено замачивание в ведре #${bucket.id} (${bucket.seeds} семян, потрачено ${waterNeeded.toFixed(2)} л воды)`);
    saveToLocalStorage();
    render();
}

// Проветривание в выбранном ведре
function startAiring() {
    if (state.selectedBucketId === null) {
        addLog("⚠️ Сначала выбери ведро (нажми на него)");
        return;
    }
    
    const bucket = state.buckets.find(b => b.id === state.selectedBucketId);
    
    if (!bucket) {
        addLog("❌ Ведро не найдено");
        return;
    }
    
    if (bucket.stage !== 'soak') {
        addLog("❌ Это ведро не в стадии замачивания");
        return;
    }
    
    if (!bucket.needsTransition) {
        addLog("❌ Замачивание ещё не завершено (нужен ⚠️)");
        return;
    }
    
    // Переводим в проветривание
    bucket.stage = 'air';
    bucket.stageStartDay = state.gameDay;
    bucket.needsTransition = false;
    
    addLog(`🌬 Начато проветривание в ведре #${bucket.id} (${bucket.seeds} семян)`);
    saveToLocalStorage();
    render();
}

// Посев из выбранного ведра
function startSowing() {
    if (state.selectedBucketId === null) {
        addLog("⚠️ Сначала выбери ведро (нажми на него)");
        return;
    }
    
    const bucket = state.buckets.find(b => b.id === state.selectedBucketId);
    
    if (!bucket) {
        addLog("❌ Ведро не найдено");
        return;
    }
    
    if (bucket.stage !== 'air') {
        addLog("❌ Это ведро не в стадии проветривания");
        return;
    }
    
    if (!bucket.needsTransition) {
        addLog("❌ Проветривание ещё не завершено (нужен ⚠️)");
        return;
    }
    
    // Проверяем место на столе
    if (state.table.containers.length + bucket.seeds > 8) {
        addLog(`❌ На столе недостаточно места! Свободно ${8 - state.table.containers.length}`);
        return;
    }
    
    // Проверяем раствор
    const solutionNeeded = RESOURCE_COSTS.sow.solution * bucket.seeds;
    if (state.solution < solutionNeeded) {
        addLog(`❌ Недостаточно раствора! Нужно ${solutionNeeded.toFixed(2)} л, есть ${state.solution.toFixed(2)} л`);
        return;
    }
    
    // Списываем раствор
    state.solution = Math.round((state.solution - solutionNeeded) * 100) / 100;
    
    // Создаем контейнеры для каждого семени
    const currentDay = Math.floor(state.gameDay);
    const newContainerIds = [];
    
    for (let i = 0; i < bucket.seeds; i++) {
        // Находим свободный номер
        let number = 1;
        const existingNumbers = new Set(state.containers.map(c => c.number));
        while (existingNumbers.has(number)) {
            number++;
        }
        
        const id = state.nextId++;
        
        const container = {
            id: id,
            number: number,
            stage: 'sow',
            location: 'table',
            locationId: null,
            stageStartDay: state.gameDay,
            lastSprayDay: currentDay,
            lastWaterDay: currentDay,
            needsSpray: false,
            needsWater: false,
            needsTransition: false
        };
        
        state.containers.push(container);
        newContainerIds.push(id);
    }
    
    // Добавляем контейнеры на стол
    state.table.containers.push(...newContainerIds);
    
    // Очищаем ведро
    const bucketId = bucket.id;
    bucket.seeds = 0;
    bucket.stage = null;
    bucket.stageStartDay = null;
    bucket.needsTransition = false;
    state.selectedBucketId = null;
    
    addLog(`🌱 Посеяно ${newContainerIds.length} контейнеров (потрачено ${solutionNeeded.toFixed(2)} л раствора)`);
    saveToLocalStorage();
    render();
}

// Перемещение выбранных контейнеров на прижим
function moveToPress() {
    if (state.selectedIds.size === 0) {
        addLog("⚠️ Сначала выбери контейнеры на столе");
        return;
    }
    
    // Проверяем, что все выбранные контейнеры на столе
    const selectedContainers = state.containers.filter(c => 
        state.selectedIds.has(c.id) && c.location === 'table'
    );
    
    if (selectedContainers.length === 0) {
        addLog("❌ Среди выбранных нет контейнеров на столе");
        return;
    }
    
    // Проверяем место на полках
    let totalToMove = selectedContainers.length;
    let availableSpace = 0;
    
    for (let shelf of state.shelves) {
        availableSpace += 4 - shelf.containers.length;
    }
    
    if (totalToMove > availableSpace) {
        addLog(`❌ Недостаточно места на полках! Свободно ${availableSpace}`);
        return;
    }
    
    // Распределяем по полкам
    const currentDay = Math.floor(state.gameDay);
    let moved = [];
    
    for (let container of selectedContainers) {
        // Ищем полку с местом
        const targetShelf = state.shelves.find(s => s.containers.length < 4);
        
        if (targetShelf) {
            container.stage = 'press';
            container.location = 'shelf';
            container.locationId = targetShelf.id;
            container.stageStartDay = state.gameDay;
            container.needsTransition = false;
            
            targetShelf.containers.push(container.id);
            moved.push(`#${container.number}`);
        }
    }
    
    // Удаляем со стола
    state.table.containers = state.table.containers.filter(id => !state.selectedIds.has(id));
    
    // Очищаем выделение
    state.selectedIds.clear();
    
    addLog(`📦 ${moved.length} контейнеров перемещены на прижим: ${moved.join(', ')}`);
    saveToLocalStorage();
    render();
}

// Перемещение выбранных контейнеров на свет
function moveToLight() {
    if (state.selectedIds.size === 0) {
        addLog("⚠️ Сначала выбери контейнеры на полках");
        return;
    }
    
    // Проверяем, что все выбранные контейнеры на полках
    const selectedContainers = state.containers.filter(c => 
        state.selectedIds.has(c.id) && c.location === 'shelf'
    );
    
    if (selectedContainers.length === 0) {
        addLog("❌ Среди выбранных нет контейнеров на полках");
        return;
    }
    
    // Проверяем, что стадия завершена
    for (let container of selectedContainers) {
        if (!container.needsTransition) {
            addLog(`❌ Контейнер #${container.number} ещё не готов к переводу (нужен ⚠️)`);
            return;
        }
    }
    
    // Проверяем место на поддонах
    const containersOnLight = state.containers.filter(c => c.location === 'light').length;
    if (containersOnLight + selectedContainers.length > MAX_CONTAINERS) {
        addLog(`❌ Недостаточно места на поддонах! Свободно ${MAX_CONTAINERS - containersOnLight}`);
        return;
    }
    
    // Перемещаем
    const currentDay = Math.floor(state.gameDay);
    let moved = [];
    
    for (let container of selectedContainers) {
        // Сохраняем номер полки для удаления
        const shelfId = container.locationId;
        
        container.stage = 'light';
        container.location = 'light';
        container.locationId = container.number; // номер контейнера = место на поддоне
        container.stageStartDay = state.gameDay;
        container.needsTransition = false;
        
        moved.push(`#${container.number}`);
        
        // Удаляем с полки
        const shelf = state.shelves.find(s => s.id === shelfId);
        if (shelf) {
            shelf.containers = shelf.containers.filter(id => id !== container.id);
        }
    }
    
    state.selectedIds.clear();
    
    addLog(`💡 ${moved.length} контейнеров перемещены на свет: ${moved.join(', ')}`);
    saveToLocalStorage();
    render();
}

// Сбор урожая
function harvestSelected() {
    if (state.selectedIds.size === 0) return;

    let harvested = 0;
    const harvestedNumbers = [];
    
    state.containers = state.containers.filter(c => {
        if (state.selectedIds.has(c.id)) {
            harvested++;
            harvestedNumbers.push(`#${c.number}`);
            return false;
        }
        return true;
    });

    state.selectedIds.clear();
    
    if (harvested > 0) {
        addLog(`✂️ Собрано ${harvested} контейнеров: ${harvestedNumbers.join(', ')} (день ${state.gameDay.toFixed(1)})`);
    }
    
    saveToLocalStorage();
    render();
}

// Удаление выбранных
function deleteSelected() {
    if (state.selectedIds.size === 0) return;

    const count = state.selectedIds.size;
    const deletedNumbers = [];
    
    state.containers = state.containers.filter(c => {
        if (state.selectedIds.has(c.id)) {
            deletedNumbers.push(`#${c.number}`);
            return false;
        }
        return true;
    });
    
    // Очищаем также из table и shelves
    state.table.containers = state.table.containers.filter(id => !state.selectedIds.has(id));
    state.shelves.forEach(shelf => {
        shelf.containers = shelf.containers.filter(id => !state.selectedIds.has(id));
    });
    
    state.selectedIds.clear();
    addLog(`🗑️ Удалено ${count} контейнеров: ${deletedNumbers.join(', ')}`);
    saveToLocalStorage();
    render();
}

// Опрыскивание
function spraySelected() {
    if (state.selectedIds.size === 0) {
        addLog("⚠️ Сначала выбери контейнеры");
        return;
    }

    const sprayCost = RESOURCE_COSTS.spray;
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

// Полив
function waterSelected() {
    if (state.selectedIds.size === 0) {
        addLog("⚠️ Сначала выбери контейнеры");
        return;
    }

    const waterCost = RESOURCE_COSTS.water;
    let waterCount = 0;
    let totalCost = 0;

    state.containers.forEach(c => {
        if (state.selectedIds.has(c.id) && c.stage === 'light' && c.needsWater) {
            waterCount++;
            totalCost += waterCost;
        }
    });

    if (waterCount === 0) {
        addLog("❌ Среди выбранных нет контейнеров на свету, которым нужен полив");
        return;
    }

    if (state.water < totalCost) {
        addLog(`❌ Недостаточно воды! Нужно ${totalCost.toFixed(2)} л, есть ${state.water.toFixed(2)} л`);
        return;
    }

    state.water = Math.round((state.water - totalCost) * 100) / 100;

    const currentDay = Math.floor(state.gameDay);
    let watered = [];

    state.containers.forEach(c => {
        if (state.selectedIds.has(c.id) && c.stage === 'light' && c.needsWater) {
            c.lastWaterDay = currentDay;
            c.needsWater = false;
            watered.push(`#${c.number}`);
        }
    });

    addLog(`💧 Полито ${waterCount} контейнеров: ${watered.join(', ')} (потрачено ${totalCost.toFixed(2)} л воды)`);
    saveToLocalStorage();
    render();
}

// Добавление ресурсов
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

// Выделение всего
function selectAll() {
    state.selectedIds = new Set(state.containers.map(c => c.id));
    addLog(`🔲 Выбраны все контейнеры (${state.selectedIds.size})`);
    render();
}

function clearSelection() {
    state.selectedIds.clear();
    state.selectedBucketId = null;
    addLog(`❌ Выбор снят`);
    render();
}

// Выбор ведра
function selectBucket(bucketId) {
    if (state.selectedBucketId === bucketId) {
        state.selectedBucketId = null;
        addLog(`🔓 Ведро #${bucketId} снято с выбора`);
    } else {
        // Снимаем выделение с контейнеров при выборе ведра
        state.selectedIds.clear();
        state.selectedBucketId = bucketId;
        addLog(`🔒 Выбрано ведро #${bucketId}`);
    }
    render();
}

// Обновление прогресса
function updateProgress() {
    const currentDay = Math.floor(state.gameDay);
    
    // Обновляем вёдра
    state.buckets.forEach(bucket => {
        if (bucket.stage) {
            const daysPassed = state.gameDay - bucket.stageStartDay;
            const totalDays = STAGE_DURATION[bucket.stage];
            
            bucket.needsTransition = daysPassed >= totalDays;
        }
    });
    
    // Обновляем контейнеры
    state.containers.forEach(c => {
        // Опрыскивание (для air, press, light)
        if (['air', 'press', 'light'].includes(c.stage)) {
            if (currentDay > c.lastSprayDay) {
                c.needsSpray = true;
            }
        }
        
        // Полив (только для light)
        if (c.stage === 'light') {
            if (currentDay > c.lastWaterDay) {
                c.needsWater = true;
            }
        }
        
        // Завершение стадии
        const daysPassed = state.gameDay - c.stageStartDay;
        const totalDays = STAGE_DURATION[c.stage];
        
        if (totalDays > 0) {
            c.needsTransition = daysPassed >= totalDays;
        } else {
            c.needsTransition = false;
        }
    });
    
    render();
}