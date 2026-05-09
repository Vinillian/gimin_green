// containerManager.js

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

function roundResource(value) {
    return Math.round(value * 100) / 100;
}

function resetCareDays(container) {
    const currentDay = Math.floor(state.gameDay);
    container.lastSprayDay = currentDay;
    container.lastWaterDay = currentDay;
    container.needsSpray = false;
    container.needsWater = false;
}

// ========== СИСТЕМА ДОСТИЖЕНИЙ ==========

function checkAchievements() {
    let newAchievements = [];
    
    Object.values(ACHIEVEMENTS).forEach(achievement => {
        if (!state.stats.achievements.includes(achievement.id) && 
            achievement.condition(state.stats)) {
            
            state.stats.achievements.push(achievement.id);
            newAchievements.push(achievement);
            giveAchievementReward(achievement);
        }
    });
    
    if (newAchievements.length > 0) {
        showAchievementNotifications(newAchievements);
    }
}

function giveAchievementReward(achievement) {
    switch(achievement.id) {
        case 'first_crop':
            state.seeds = roundResource(state.seeds + 5);
            break;
        case 'beginner_farmer':
            state.water = roundResource(state.water + 10);
            break;
        case 'experienced_farmer':
            state.solution = roundResource(state.solution + 20);
            break;
        case 'water_saver':
            // Будет реализовано позже
            break;
    }
}

function showAchievementNotifications(achievements) {
    achievements.forEach(achievement => {
        addLog(`🏆 ДОСТИЖЕНИЕ: ${achievement.title} — ${achievement.reward}`);
        if (state.settings.soundEnabled) {
            // Здесь можно добавить звук
        }
    });
}

function updateHarvestStats(count) {
    state.stats.totalHarvested += count;
    checkAchievements();
}

function updateMaxFullBuckets() {
    const fullBuckets = state.buckets.filter(b => b.seeds === CAPACITY.MAX_SEEDS_PER_BUCKET).length;
    if (fullBuckets > state.stats.maxFullBuckets) {
        state.stats.maxFullBuckets = fullBuckets;
        checkAchievements();
    }
}

// ========== РАБОТА С СЕМЕНАМИ В ВЁДРАХ ==========

function addSeedsToBucket(count, targetBucketId = null) {
    let remainingSeeds = count;
    let addedToBuckets = [];
    
    // Если указано конкретное ведро, пробуем сначала его
    if (targetBucketId !== null) {
        const targetBucket = state.buckets.find(b => b.id === targetBucketId);
        if (targetBucket && targetBucket.stage === null) {
            const canAdd = CAPACITY.MAX_SEEDS_PER_BUCKET - targetBucket.seeds;
            const toAdd = Math.min(remainingSeeds, canAdd);
            
            if (toAdd > 0) {
                const seedsNeeded = RESOURCE_COSTS.soak.seeds * toAdd;
                if (state.seeds >= seedsNeeded) {
                    state.seeds = roundResource(state.seeds - seedsNeeded);
                    state.stats.totalSeedsUsed += seedsNeeded;
                    targetBucket.seeds += toAdd;
                    remainingSeeds -= toAdd;
                    addedToBuckets.push({ id: targetBucket.id, added: toAdd });
                }
            }
        }
    }
    
    // Если остались семена и включено умное заполнение, ищем свободные вёдра
    if (remainingSeeds > 0 && state.settings.smartBucketFill) {
        const availableBuckets = state.buckets.filter(b => b.stage === null);
        
        for (let bucket of availableBuckets) {
            if (remainingSeeds <= 0) break;
            
            const canAdd = CAPACITY.MAX_SEEDS_PER_BUCKET - bucket.seeds;
            if (canAdd > 0) {
                const toAdd = Math.min(remainingSeeds, canAdd);
                const seedsNeeded = RESOURCE_COSTS.soak.seeds * toAdd;
                
                if (state.seeds >= seedsNeeded) {
                    state.seeds = roundResource(state.seeds - seedsNeeded);
                    state.stats.totalSeedsUsed += seedsNeeded;
                    bucket.seeds += toAdd;
                    remainingSeeds -= toAdd;
                    addedToBuckets.push({ id: bucket.id, added: toAdd });
                }
            }
        }
    }
    
    if (addedToBuckets.length > 0) {
        const messages = addedToBuckets.map(b => `#${b.id} +${b.added}`).join(', ');
        addLog(`🌱 Добавлено семян: ${messages}`);
        updateMaxFullBuckets();
        saveToLocalStorage();
        render();
        return true;
    } else {
        addLog("❌ Нет свободных вёдер для добавления семян");
        return false;
    }
}

function addOneSeedToBucket() {
    return addSeedsToBucket(1, null);
}

function addFourSeedsToBucket() {
    return addSeedsToBucket(4, null);
}

// ========== УПРАВЛЕНИЕ ВЫДЕЛЕНИЕМ ВЁДЕР ==========

function toggleBucketSelection(bucketId) {
    if (state.selectedBucketIds.has(bucketId)) {
        state.selectedBucketIds.delete(bucketId);
        addLog(`🔓 Ведро #${bucketId} снято с выбора`);
    } else {
        state.selectedBucketIds.add(bucketId);
        // Снимаем выделение с контейнеров при выборе ведра
        state.selectedIds.clear();
        addLog(`🔒 Выбрано ведро #${bucketId}`);
    }
    render();
}

function selectAllFreeBuckets() {
    state.selectedBucketIds.clear();
    state.buckets.forEach(b => {
        if (b.stage === null) {
            state.selectedBucketIds.add(b.id);
        }
    });
    state.selectedIds.clear();
    addLog(`🔲 Выбраны все свободные вёдра (${state.selectedBucketIds.size})`);
    render();
}

function selectBucketsByStage(stage) {
    state.selectedBucketIds.clear();
    state.buckets.forEach(b => {
        if (b.stage === stage) {
            state.selectedBucketIds.add(b.id);
        }
    });
    state.selectedIds.clear();
    addLog(`🔲 Выбраны вёдра со стадией ${STAGE_NAMES[stage]} (${state.selectedBucketIds.size})`);
    render();
}

// ========== МАССОВЫЕ ОПЕРАЦИИ С ВЁДРАМИ ==========

function startSoakingMultiple() {
    if (state.selectedBucketIds.size === 0) {
        addLog("⚠️ Сначала выбери вёдра");
        return;
    }
    
    let successCount = 0;
    let totalWaterNeeded = 0;
    const bucketsToSoak = [];
    
    for (let bucketId of state.selectedBucketIds) {
        const bucket = state.buckets.find(b => b.id === bucketId);
        
        if (bucket && bucket.stage === null && bucket.seeds > 0) {
            const waterNeeded = RESOURCE_COSTS.soak.water * bucket.seeds;
            totalWaterNeeded += waterNeeded;
            bucketsToSoak.push({ bucket, waterNeeded });
        }
    }
    
    if (bucketsToSoak.length === 0) {
        addLog("❌ Нет подходящих вёдер для замачивания");
        return;
    }
    
    if (state.water < totalWaterNeeded) {
        addLog(`❌ Недостаточно воды! Нужно ${totalWaterNeeded.toFixed(2)} л, есть ${state.water.toFixed(2)} л`);
        return;
    }
    
    state.water = roundResource(state.water - totalWaterNeeded);
    state.stats.totalWaterUsed += totalWaterNeeded;
    
    bucketsToSoak.forEach(({ bucket, waterNeeded }) => {
        bucket.stage = 'soak';
        bucket.stageStartDay = state.gameDay;
        bucket.needsTransition = false;
        successCount++;
    });
    
    addLog(`💧 Запущено замачивание в ${successCount} вёдрах`);
    state.selectedBucketIds.clear();
    saveToLocalStorage();
    render();
}

function startAiringMultiple() {
    if (state.selectedBucketIds.size === 0) {
        addLog("⚠️ Сначала выбери вёдра");
        return;
    }
    
    let successCount = 0;
    
    for (let bucketId of state.selectedBucketIds) {
        const bucket = state.buckets.find(b => b.id === bucketId);
        
        if (bucket && bucket.stage === 'soak' && bucket.needsTransition) {
            bucket.stage = 'air';
            bucket.stageStartDay = state.gameDay;
            bucket.needsTransition = false;
            successCount++;
        }
    }
    
    if (successCount > 0) {
        addLog(`🌬 Начато проветривание в ${successCount} вёдрах`);
        state.selectedBucketIds.clear();
        saveToLocalStorage();
        render();
    } else {
        addLog("❌ Нет вёдер, готовых к проветриванию");
    }
}

function startSowingMultiple() {
    if (state.selectedBucketIds.size === 0) {
        addLog("⚠️ Сначала выбери вёдра");
        return;
    }
    
    let totalSeeds = 0;
    const bucketsToSow = [];
    
    for (let bucketId of state.selectedBucketIds) {
        const bucket = state.buckets.find(b => b.id === bucketId);
        if (bucket && bucket.stage === 'air' && bucket.needsTransition) {
            totalSeeds += bucket.seeds;
            bucketsToSow.push(bucket);
        }
    }
    
    if (bucketsToSow.length === 0) {
        addLog("❌ Нет вёдер, готовых к посеву");
        return;
    }
    
    const availableSpace = CAPACITY.TABLE_CAPACITY - state.table.containers.length;
    if (totalSeeds > availableSpace) {
        addLog(`❌ На столе недостаточно места! Нужно ${totalSeeds}, свободно ${availableSpace}`);
        return;
    }
    
    const solutionNeeded = RESOURCE_COSTS.sow.solution * totalSeeds;
    if (state.solution < solutionNeeded) {
        addLog(`❌ Недостаточно раствора! Нужно ${solutionNeeded.toFixed(2)} л, есть ${state.solution.toFixed(2)} л`);
        return;
    }
    
    state.solution = roundResource(state.solution - solutionNeeded);
    state.stats.totalSolutionUsed += solutionNeeded;
    
    const currentDay = Math.floor(state.gameDay);
    const newContainerIds = [];
    
    bucketsToSow.forEach(bucket => {
        for (let i = 0; i < bucket.seeds; i++) {
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
                needsTransition: true
            };
            
            state.containers.push(container);
            newContainerIds.push(id);
        }
        
        bucket.seeds = 0;
        bucket.stage = null;
        bucket.stageStartDay = null;
        bucket.needsTransition = false;
    });
    
    state.table.containers.push(...newContainerIds);
    
    addLog(`🌱 Посеяно ${newContainerIds.length} контейнеров из ${bucketsToSow.length} вёдер`);
    state.selectedBucketIds.clear();
    saveToLocalStorage();
    render();
}

// ========== БЫСТРЫЙ ВЫБОР ЗОН ==========

function selectAllTable() {
    const tableContainerIds = state.containers
        .filter(c => c.location === 'table')
        .map(c => c.id);
    
    state.selectedIds.clear();
    tableContainerIds.forEach(id => state.selectedIds.add(id));
    state.selectedBucketIds.clear();
    addLog(`🔲 Выбраны все контейнеры на столе (${tableContainerIds.length})`);
    render();
}

function selectShelf(shelfId) {
    const shelf = state.shelves.find(s => s.id === shelfId);
    if (shelf) {
        state.selectedIds.clear();
        shelf.containers.forEach(id => state.selectedIds.add(id));
        state.selectedBucketIds.clear();
        addLog(`🔲 Выбраны все контейнеры на полке ${shelfId} (${shelf.containers.length})`);
        render();
    }
}

function selectPallet(palletNumber) {
    const start = (palletNumber - 1) * CAPACITY.PALLET_SIZE + 1;
    const end = palletNumber * CAPACITY.PALLET_SIZE;
    
    const palletContainerIds = state.containers
        .filter(c => c.location === 'light' && c.number >= start && c.number <= end)
        .map(c => c.id);
    
    state.selectedIds.clear();
    palletContainerIds.forEach(id => state.selectedIds.add(id));
    state.selectedBucketIds.clear();
    addLog(`🔲 Выбраны все контейнеры на поддоне ${palletNumber} (${palletContainerIds.length})`);
    render();
}

// ========== УМНОЕ ПЕРЕМЕЩЕНИЕ ==========

function smartMoveToPress() {
    if (state.selectedIds.size === 0) {
        addLog("⚠️ Сначала выбери контейнеры на столе");
        return;
    }
    
    const selectedContainers = state.containers.filter(c => 
        state.selectedIds.has(c.id) && 
        c.location === 'table' && 
        c.needsTransition
    );
    
    if (selectedContainers.length === 0) {
        addLog("❌ Нет готовых контейнеров на столе");
        return;
    }
    
    let availableSpace = 0;
    const shelfSpace = [];
    
    state.shelves.forEach(shelf => {
        const free = CAPACITY.SHELF_CAPACITY - shelf.containers.length;
        availableSpace += free;
        shelfSpace.push({ shelf, free });
    });
    
    if (availableSpace === 0) {
        addLog("❌ Нет свободного места на полках");
        return;
    }
    
    const toMove = selectedContainers.slice(0, availableSpace);
    const moved = [];
    
    toMove.forEach(container => {
        const targetShelfInfo = shelfSpace.find(s => s.free > 0);
        if (targetShelfInfo) {
            const targetShelf = targetShelfInfo.shelf;
            
            container.stage = 'press';
            container.location = 'shelf';
            container.locationId = targetShelf.id;
            container.stageStartDay = state.gameDay;
            container.needsTransition = false;
            resetCareDays(container);
            
            targetShelf.containers.push(container.id);
            targetShelfInfo.free--;
            
            moved.push(`#${container.number}`);
        }
    });
    
    const movedIds = toMove.map(c => c.id);
    state.table.containers = state.table.containers.filter(id => !movedIds.includes(id));
    
    const remainingIds = selectedContainers
        .slice(availableSpace)
        .map(c => c.id);
    
    state.selectedIds = new Set(remainingIds);
    
    addLog(`📦 Перемещено на прижим: ${moved.length} контейнеров (${moved.join(', ')})`);
    if (remainingIds.length > 0) {
        addLog(`⏳ ${remainingIds.length} контейнеров остались на столе (нет места)`);
    }
    
    saveToLocalStorage();
    render();
}

function smartMoveToLight() {
    if (state.selectedIds.size === 0) {
        addLog("⚠️ Сначала выбери контейнеры на полках");
        return;
    }
    
    const selectedContainers = state.containers.filter(c => 
        state.selectedIds.has(c.id) && 
        c.location === 'shelf' && 
        c.needsTransition
    );
    
    if (selectedContainers.length === 0) {
        addLog("❌ Нет готовых контейнеров на полках");
        return;
    }
    
    const containersOnLight = state.containers.filter(c => c.location === 'light').length;
    const availableSpace = CAPACITY.LIGHT_CAPACITY - containersOnLight;
    
    if (availableSpace === 0) {
        addLog("❌ Нет свободного места на поддонах");
        return;
    }
    
    const toMove = selectedContainers.slice(0, availableSpace);
    const lightNumbers = new Set(state.containers
        .filter(c => c.location === 'light')
        .map(c => c.number));
    
    const moved = [];
    
    toMove.forEach(container => {
        let lightNumber = 1;
        while (lightNumbers.has(lightNumber)) {
            lightNumber++;
        }
        lightNumbers.add(lightNumber);
        
        const shelfId = container.locationId;
        
        container.stage = 'light';
        container.location = 'light';
        container.locationId = lightNumber;
        container.number = lightNumber;
        container.stageStartDay = state.gameDay;
        container.needsTransition = false;
        resetCareDays(container);
        
        moved.push(`#${lightNumber}`);
        
        const shelf = state.shelves.find(s => s.id === shelfId);
        if (shelf) {
            shelf.containers = shelf.containers.filter(id => id !== container.id);
        }
    });
    
    const remainingIds = selectedContainers
        .slice(availableSpace)
        .map(c => c.id);
    
    state.selectedIds = new Set(remainingIds);
    
    addLog(`💡 Перемещено на свет: ${moved.length} контейнеров (${moved.join(', ')})`);
    if (remainingIds.length > 0) {
        addLog(`⏳ ${remainingIds.length} контейнеров остались на полках (нет места)`);
    }
    
    saveToLocalStorage();
    render();
}

// ========== ЗАПУСК СТАДИЙ В ОТДЕЛЬНОМ ВЕДРЕ ==========

function startSoaking() {
    if (state.selectedBucketIds.size === 0) {
        addLog("⚠️ Сначала выбери ведро");
        return;
    }
    
    if (state.selectedBucketIds.size > 1) {
        return startSoakingMultiple();
    }
    
    const bucketId = Array.from(state.selectedBucketIds)[0];
    const bucket = state.buckets.find(b => b.id === bucketId);
    
    if (!bucket) return;
    
    if (bucket.stage !== null) {
        addLog("❌ Это ведро уже в процессе");
        return;
    }
    
    if (bucket.seeds === 0) {
        addLog("❌ В ведре нет семян");
        return;
    }
    
    const waterNeeded = RESOURCE_COSTS.soak.water * bucket.seeds;
    if (state.water < waterNeeded) {
        addLog(`❌ Недостаточно воды! Нужно ${waterNeeded.toFixed(2)} л, есть ${state.water.toFixed(2)} л`);
        return;
    }
    
    state.water = roundResource(state.water - waterNeeded);
    state.stats.totalWaterUsed += waterNeeded;
    
    bucket.stage = 'soak';
    bucket.stageStartDay = state.gameDay;
    bucket.needsTransition = false;
    
    addLog(`💧 Запущено замачивание в ведре #${bucket.id}`);
    state.selectedBucketIds.clear();
    saveToLocalStorage();
    render();
}

function startAiring() {
    if (state.selectedBucketIds.size === 0) {
        addLog("⚠️ Сначала выбери ведро");
        return;
    }
    
    if (state.selectedBucketIds.size > 1) {
        return startAiringMultiple();
    }
    
    const bucketId = Array.from(state.selectedBucketIds)[0];
    const bucket = state.buckets.find(b => b.id === bucketId);
    
    if (!bucket) return;
    
    if (bucket.stage !== 'soak') {
        addLog("❌ Это ведро не в стадии замачивания");
        return;
    }
    
    if (!bucket.needsTransition) {
        addLog("❌ Замачивание ещё не завершено");
        return;
    }
    
    bucket.stage = 'air';
    bucket.stageStartDay = state.gameDay;
    bucket.needsTransition = false;
    
    addLog(`🌬 Начато проветривание в ведре #${bucket.id}`);
    state.selectedBucketIds.clear();
    saveToLocalStorage();
    render();
}

function startSowing() {
    if (state.selectedBucketIds.size === 0) {
        addLog("⚠️ Сначала выбери ведро");
        return;
    }
    
    if (state.selectedBucketIds.size > 1) {
        return startSowingMultiple();
    }
    
    const bucketId = Array.from(state.selectedBucketIds)[0];
    const bucket = state.buckets.find(b => b.id === bucketId);
    
    if (!bucket) return;
    
    if (bucket.stage !== 'air') {
        addLog("❌ Это ведро не в стадии проветривания");
        return;
    }
    
    if (!bucket.needsTransition) {
        addLog("❌ Проветривание ещё не завершено");
        return;
    }
    
    if (state.table.containers.length + bucket.seeds > CAPACITY.TABLE_CAPACITY) {
        addLog(`❌ На столе недостаточно места! Свободно ${CAPACITY.TABLE_CAPACITY - state.table.containers.length}`);
        return;
    }
    
    const solutionNeeded = RESOURCE_COSTS.sow.solution * bucket.seeds;
    if (state.solution < solutionNeeded) {
        addLog(`❌ Недостаточно раствора! Нужно ${solutionNeeded.toFixed(2)} л, есть ${state.solution.toFixed(2)} л`);
        return;
    }
    
    state.solution = roundResource(state.solution - solutionNeeded);
    state.stats.totalSolutionUsed += solutionNeeded;
    
    const currentDay = Math.floor(state.gameDay);
    const newContainerIds = [];
    
    for (let i = 0; i < bucket.seeds; i++) {
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
            needsTransition: true
        };
        
        state.containers.push(container);
        newContainerIds.push(id);
    }
    
    state.table.containers.push(...newContainerIds);
    
    bucket.seeds = 0;
    bucket.stage = null;
    bucket.stageStartDay = null;
    bucket.needsTransition = false;
    
    addLog(`🌱 Посеяно ${newContainerIds.length} контейнеров`);
    state.selectedBucketIds.clear();
    saveToLocalStorage();
    render();
}

// ========== ПЕРЕМЕЩЕНИЕ КОНТЕЙНЕРОВ ==========

function moveToPress() {
    if (state.selectedIds.size === 0) {
        addLog("⚠️ Сначала выбери контейнеры на столе");
        return;
    }
    
    const selectedContainers = state.containers.filter(c => 
        state.selectedIds.has(c.id) && c.location === 'table'
    );
    
    if (selectedContainers.length === 0) {
        addLog("❌ Среди выбранных нет контейнеров на столе");
        return;
    }
    
    for (let container of selectedContainers) {
        if (!container.needsTransition) {
            addLog(`❌ Контейнер #${container.number} ещё не готов к прижиму`);
            return;
        }
    }
    
    let totalToMove = selectedContainers.length;
    let availableSpace = 0;
    
    for (let shelf of state.shelves) {
        availableSpace += CAPACITY.SHELF_CAPACITY - shelf.containers.length;
    }
    
    if (totalToMove > availableSpace) {
        addLog(`❌ Недостаточно места на полках! Свободно ${availableSpace}`);
        return;
    }
    
    let moved = [];
    let movedIds = [];
    
    selectedContainers.sort((a, b) => a.number - b.number);
    
    for (let container of selectedContainers) {
        const targetShelf = state.shelves.find(s => s.containers.length < CAPACITY.SHELF_CAPACITY);
        
        if (targetShelf) {
            movedIds.push(container.id);
            
            container.stage = 'press';
            container.location = 'shelf';
            container.locationId = targetShelf.id;
            container.stageStartDay = state.gameDay;
            container.needsTransition = false;
            resetCareDays(container);
            
            targetShelf.containers.push(container.id);
            moved.push(`#${container.number}`);
        }
    }
    
    state.table.containers = state.table.containers.filter(id => !movedIds.includes(id));
    state.selectedIds.clear();
    
    if (moved.length > 0) {
        addLog(`📦 ${moved.length} контейнеров перемещены на прижим: ${moved.join(', ')}`);
    }
    
    saveToLocalStorage();
    render();
}

function moveToLight() {
    if (state.selectedIds.size === 0) {
        addLog("⚠️ Сначала выбери контейнеры на полках");
        return;
    }
    
    const selectedContainers = state.containers.filter(c => 
        state.selectedIds.has(c.id) && c.location === 'shelf'
    );
    
    if (selectedContainers.length === 0) {
        addLog("❌ Среди выбранных нет контейнеров на полках");
        return;
    }
    
    for (let container of selectedContainers) {
        if (!container.needsTransition) {
            addLog(`❌ Контейнер #${container.number} ещё не готов к переводу`);
            return;
        }
    }
    
    const containersOnLight = state.containers.filter(c => c.location === 'light').length;
    if (containersOnLight + selectedContainers.length > CAPACITY.LIGHT_CAPACITY) {
        addLog(`❌ Недостаточно места на поддонах! Свободно ${CAPACITY.LIGHT_CAPACITY - containersOnLight}`);
        return;
    }
    
    const lightNumbers = new Set(state.containers
        .filter(c => c.location === 'light')
        .map(c => c.number));
    
    let moved = [];
    let movedIds = [];
    
    for (let container of selectedContainers) {
        movedIds.push(container.id);
        
        let lightNumber = 1;
        while (lightNumbers.has(lightNumber)) {
            lightNumber++;
        }
        lightNumbers.add(lightNumber);
        
        const shelfId = container.locationId;
        
        container.stage = 'light';
        container.location = 'light';
        container.locationId = lightNumber;
        container.number = lightNumber;
        container.stageStartDay = state.gameDay;
        container.needsTransition = false;
        resetCareDays(container);
        
        moved.push(`#${lightNumber}`);
        
        const shelf = state.shelves.find(s => s.id === shelfId);
        if (shelf) {
            shelf.containers = shelf.containers.filter(id => id !== container.id);
        }
    }
    
    state.selectedIds.clear();
    
    if (moved.length > 0) {
        addLog(`💡 ${moved.length} контейнеров перемещены на свет: ${moved.join(', ')}`);
    }
    
    saveToLocalStorage();
    render();
}

// ========== СБОР И УДАЛЕНИЕ ==========

function harvestSelected() {
    if (state.selectedIds.size === 0) {
        addLog("⚠️ Сначала выбери контейнеры для сбора");
        return;
    }

    let harvested = 0;
    const harvestedNumbers = [];
    
    const selectedContainers = state.containers.filter(c => state.selectedIds.has(c.id));
    
    for (let container of selectedContainers) {
        if (container.location !== 'light') {
            addLog(`❌ Контейнер #${container.number} не на свету`);
            return;
        }
        if (!container.needsTransition) {
            addLog(`❌ Контейнер #${container.number} ещё не готов к сбору`);
            return;
        }
    }
    
    const startDay = state.gameDay;
    
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
        updateHarvestStats(harvested);
        
        // Проверяем, был ли это быстрый цикл
        const cycleTime = state.gameDay - startDay;
        if (state.stats.fastestCycle === null || cycleTime < state.stats.fastestCycle) {
            state.stats.fastestCycle = cycleTime;
            checkAchievements();
        }
    }
    
    saveToLocalStorage();
    render();
}

function deleteSelected() {
    if (state.selectedIds.size === 0) {
        addLog("⚠️ Сначала выбери контейнеры для удаления");
        return;
    }

    const count = state.selectedIds.size;
    const deletedNumbers = [];
    
    state.containers = state.containers.filter(c => {
        if (state.selectedIds.has(c.id)) {
            deletedNumbers.push(`#${c.number}`);
            return false;
        }
        return true;
    });
    
    state.table.containers = state.table.containers.filter(id => !state.selectedIds.has(id));
    state.shelves.forEach(shelf => {
        shelf.containers = shelf.containers.filter(id => !state.selectedIds.has(id));
    });
    
    state.selectedIds.clear();
    addLog(`🗑️ Удалено ${count} контейнеров: ${deletedNumbers.join(', ')}`);
    saveToLocalStorage();
    render();
}

// ========== УХОД ЗА РАСТЕНИЯМИ ==========

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

    state.water = roundResource(state.water - totalCost);
    state.stats.totalWaterUsed += totalCost;

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

    state.water = roundResource(state.water - totalCost);
    state.stats.totalWaterUsed += totalCost;

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

// ========== УПРАВЛЕНИЕ РЕСУРСАМИ ==========

function addWater() {
    state.water = roundResource(state.water + 5);
    addLog("🚰 +5 литров воды");
    saveToLocalStorage();
    render();
}

function addSolution() {
    if (state.water < 4) {
        addLog(`❌ Недостаточно воды для создания раствора! Нужно 4 л воды, есть ${state.water.toFixed(2)} л`);
        return;
    }
    
    state.water = roundResource(state.water - 4);
    state.solution = roundResource(state.solution + 4);
    state.stats.totalWaterUsed += 4;
    addLog("🧪 +4 литра раствора (потрачено 4 л воды)");
    saveToLocalStorage();
    render();
}

function addSeeds() {
    state.seeds = roundResource(state.seeds + 10);
    addLog("🌱 +10 кг семян");
    saveToLocalStorage();
    render();
}

// ========== УПРАВЛЕНИЕ ВЫДЕЛЕНИЕМ ==========

function selectAll() {
    state.selectedIds = new Set(state.containers.map(c => c.id));
    state.selectedBucketIds.clear();
    addLog(`🔲 Выбраны все контейнеры (${state.selectedIds.size})`);
    render();
}

function clearSelection() {
    state.selectedIds.clear();
    state.selectedBucketIds.clear();
    addLog(`🔄 Выбор снят`);
    render();
}

// ========== ОБНОВЛЕНИЕ ПРОГРЕССА ==========

function updateProgress() {
    if (!state.isRunning) return;
    
    const currentDay = Math.floor(state.gameDay);
    
    state.buckets.forEach(bucket => {
        if (bucket.stage) {
            const daysPassed = state.gameDay - bucket.stageStartDay;
            const totalDays = STAGE_DURATION[bucket.stage];
            bucket.needsTransition = daysPassed >= totalDays;
        }
    });
    
    state.containers.forEach(c => {
        if (['air', 'press', 'light'].includes(c.stage)) {
            if (currentDay > c.lastSprayDay) {
                c.needsSpray = true;
            }
        }
        
        if (c.stage === 'light') {
            if (currentDay > c.lastWaterDay) {
                c.needsWater = true;
            }
        }
        
        const daysPassed = state.gameDay - c.stageStartDay;
        const totalDays = STAGE_DURATION[c.stage];
        
        if (totalDays > 0) {
            c.needsTransition = daysPassed >= totalDays;
        }
    });
    
    render();
}