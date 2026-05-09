// ui.js

function render() {
    renderBuckets();
    renderTable();
    renderShelves();
    renderPallets();
    renderResources();
    renderSelectedInfo();
    renderLog();
    
    if (!window.uiElementsAdded) {
        addZoneSelectionHandlers();
        window.uiElementsAdded = true;
    }
}

function renderBuckets() {
    const container = document.getElementById('bucketsCompactContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    state.buckets.forEach(bucket => {
        const bucketEl = document.createElement('div');
        bucketEl.className = `bucket ${bucket.stage ? 'active' : ''} ${state.selectedBucketIds.has(bucket.id) ? 'selected' : ''}`;
        bucketEl.dataset.id = bucket.id;
        
        let icon = '🪣';
        if (bucket.stage === 'soak') icon = '💧';
        else if (bucket.stage === 'air') icon = '🌬';
        
        const progress = bucket.stage ? getBucketProgress(bucket) : 0;
        
        const statusIcons = [];
        if (bucket.stage === 'soak') statusIcons.push('💧');
        else if (bucket.stage === 'air') statusIcons.push('🌬');
        if (bucket.needsTransition) statusIcons.push('⚠️');
        
        const progressBar = bucket.stage ? `
            <div class="progress-container">
                <div class="progress-fill" style="width: ${progress}%;"></div>
            </div>
        ` : '';
        
        bucketEl.innerHTML = `
            <div class="bucket-icon">${icon}</div>
            <div class="bucket-count">${bucket.seeds}🌱</div>
            ${progressBar}
            <div class="bucket-status">${statusIcons.join('')}</div>
        `;
        
        bucketEl.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (e.ctrlKey || e.shiftKey || state.multiselectModifier) {
                toggleBucketSelection(bucket.id);
            } else {
                if (state.selectedBucketIds.has(bucket.id) && state.selectedBucketIds.size === 1) {
                    state.selectedBucketIds.clear();
                    addLog(`🔓 Ведро #${bucket.id} снято с выбора`);
                } else {
                    state.selectedBucketIds.clear();
                    state.selectedBucketIds.add(bucket.id);
                    state.selectedIds.clear();
                    addLog(`🔒 Выбрано ведро #${bucket.id}`);
                }
            }
            render();
        });
        
        container.appendChild(bucketEl);
    });
    
    const totalSeeds = state.buckets.reduce((sum, b) => sum + b.seeds, 0);
    const totalSeedsEl = document.getElementById('totalSeedsInBuckets');
    if (totalSeedsEl) totalSeedsEl.innerText = totalSeeds;
}

function renderShelves() {
    for (let shelfId = 1; shelfId <= CAPACITY.SHELVES_COUNT; shelfId++) {
        const shelfContainer = document.getElementById(`shelf${shelfId}Container`);
        if (!shelfContainer) continue;
        
        shelfContainer.innerHTML = '';
        const shelf = state.shelves.find(s => s.id === shelfId);
        
        if (shelf) {
            const shelfContainers = state.containers.filter(c => shelf.containers.includes(c.id));
            shelfContainers.sort((a, b) => a.number - b.number);
            
            shelfContainers.forEach(containerObj => {
                const card = createContainerCard(containerObj, true);
                shelfContainer.appendChild(card);
            });
            
            for (let i = shelfContainers.length; i < CAPACITY.SHELF_CAPACITY; i++) {
                const empty = document.createElement('div');
                empty.className = 'shelf-cell empty';
                empty.innerHTML = '📦';
                shelfContainer.appendChild(empty);
            }
        }
    }
}

function createContainerCard(container, isShelfStyle = false) {
    const isSelected = state.selectedIds.has(container.id);
    const card = document.createElement('div');
    card.className = `container-card ${container.stage} ${isSelected ? 'selected' : ''}`;
    card.dataset.id = container.id;
    
    const daysPassed = state.gameDay - container.stageStartDay;
    const totalDays = STAGE_DURATION[container.stage];
    
    let progressPercent = 0;
    let dayText = '';
    
    if (totalDays > 0) {
        progressPercent = Math.min(100, (daysPassed / totalDays) * 100);
        const currentDay = Math.min(Math.floor(daysPassed) + 1, totalDays);
        dayText = `д.${currentDay}/${totalDays}`;
    } else {
        progressPercent = 0;
        dayText = '⚡';
    }
    
    const icons = [];
    icons.push(STAGE_ICONS[container.stage]);
    if (container.needsSpray) icons.push('💦');
    if (container.needsWater) icons.push('🚰');
    if (container.needsTransition) icons.push('⚠️');
    
    if (isShelfStyle) {
        card.innerHTML = `
            <div class="container-number">#${container.number}</div>
            <div class="container-icons">${icons.join('')}</div>
            <div class="progress-container">
                <div class="progress-fill" style="width: ${progressPercent}%;"></div>
            </div>
            <div class="container-day">${dayText}</div>
        `;
    } else {
        card.innerHTML = `
            <div class="container-number">#${container.number}</div>
            <div class="container-icons">${icons.join('')}</div>
            <div class="progress-container">
                <div class="progress-fill" style="width: ${progressPercent}%;"></div>
            </div>
            <div class="container-day">${dayText}</div>
        `;
    }
    
    card.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = Number(card.dataset.id);
        
        if (e.ctrlKey || e.shiftKey || state.multiselectModifier) {
            if (state.selectedIds.has(id)) {
                state.selectedIds.delete(id);
                addLog(`🔓 Снят выбор с #${getContainerNumber(id)}`);
            } else {
                state.selectedIds.add(id);
                state.selectedBucketIds.clear();
                addLog(`🔒 Выбран #${getContainerNumber(id)}`);
            }
        } else {
            if (state.selectedIds.has(id) && state.selectedIds.size === 1) {
                state.selectedIds.clear();
                addLog(`🔓 Снят выбор с #${getContainerNumber(id)}`);
            } else {
                state.selectedIds.clear();
                state.selectedIds.add(id);
                state.selectedBucketIds.clear();
                addLog(`🔒 Выбран #${getContainerNumber(id)}`);
            }
        }
        render();
    });
    
    return card;
}

function renderTable() {
    const container = document.getElementById('tableContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    const tableContainers = state.containers.filter(c => c.location === 'table');
    tableContainers.sort((a, b) => a.number - b.number);
    
    tableContainers.forEach(containerObj => {
        const card = createContainerCard(containerObj);
        container.appendChild(card);
    });
    
    for (let i = tableContainers.length; i < CAPACITY.TABLE_CAPACITY; i++) {
        const empty = document.createElement('div');
        empty.className = 'table-cell empty';
        empty.innerHTML = '🌱';
        container.appendChild(empty);
    }
}

function renderPallets() {
    const grid1 = document.getElementById('containerGrid1');
    const grid2 = document.getElementById('containerGrid2');
    
    if (!grid1 || !grid2) return;
    
    grid1.innerHTML = '';
    grid2.innerHTML = '';
    
    const lightContainers = state.containers
        .filter(c => c.location === 'light')
        .sort((a, b) => a.number - b.number);
    
    const containers1 = lightContainers.filter(c => c.number <= CAPACITY.PALLET_SIZE);
    const containers2 = lightContainers.filter(c => c.number > CAPACITY.PALLET_SIZE);
    
    for (let i = 1; i <= CAPACITY.PALLET_SIZE; i++) {
        const container = containers1.find(c => c.number === i);
        if (container) {
            const card = createContainerCard(container);
            grid1.appendChild(card);
        } else {
            renderEmptyCell(grid1, i);
        }
    }
    
    for (let i = CAPACITY.PALLET_SIZE + 1; i <= CAPACITY.LIGHT_CAPACITY; i++) {
        const container = containers2.find(c => c.number === i);
        if (container) {
            const card = createContainerCard(container);
            grid2.appendChild(card);
        } else {
            renderEmptyCell(grid2, i);
        }
    }
    
    const ready1 = containers1.filter(c => c.stage === 'light' && c.needsTransition).length;
    const ready2 = containers2.filter(c => c.stage === 'light' && c.needsTransition).length;
    
    const readyCount1 = document.getElementById('readyCount1');
    const readyCount2 = document.getElementById('readyCount2');
    
    if (readyCount1) readyCount1.innerText = ready1;
    if (readyCount2) readyCount2.innerText = ready2;
}

function getContainerNumber(id) {
    const container = state.containers.find(c => c.id === id);
    return container ? container.number : '?';
}

function getBucketProgress(bucket) {
    if (!bucket.stage) return 0;
    const daysPassed = state.gameDay - bucket.stageStartDay;
    const totalDays = STAGE_DURATION[bucket.stage];
    return Math.min(100, Math.round((daysPassed / totalDays) * 100));
}

function renderEmptyCell(grid, number) {
    const emptyCard = document.createElement('div');
    emptyCard.className = 'container-card empty';
    emptyCard.innerHTML = `<div class="container-number">#${number}</div>`;
    grid.appendChild(emptyCard);
}

function renderResources() {
    const waterEl = document.getElementById('waterCount');
    const solutionEl = document.getElementById('solutionCount');
    const seedsEl = document.getElementById('seedCount');
    const containersEl = document.getElementById('totalContainers');
    const dayEl = document.getElementById('currentDay');
    
    if (waterEl) waterEl.innerText = state.water.toFixed(1);
    if (solutionEl) solutionEl.innerText = state.solution.toFixed(1);
    if (seedsEl) seedsEl.innerText = state.seeds.toFixed(1);
    if (containersEl) containersEl.innerText = state.containers.length;
    if (dayEl) dayEl.innerText = state.gameDay.toFixed(1);
}

function renderSelectedInfo() {
    const selectedInfo = document.getElementById('selectedInfo');
    if (!selectedInfo) return;
    
    if (state.selectedBucketIds.size > 0) {
        const bucketInfo = [];
        state.selectedBucketIds.forEach(id => {
            const bucket = state.buckets.find(b => b.id === id);
            if (bucket) {
                let status = '';
                if (bucket.stage === 'soak') status = ' (💧)';
                else if (bucket.stage === 'air') status = ' (🌬)';
                bucketInfo.push(`#${bucket.id}${status}:${bucket.seeds}🌱`);
            }
        });
        selectedInfo.innerHTML = `✅ Вёдра: ${bucketInfo.join(', ')}`;
        return;
    }
    
    if (state.selectedIds.size > 0) {
        const selectedItems = [];
        state.selectedIds.forEach(id => {
            const c = state.containers.find(c => c.id === id);
            if (c) {
                let location = '';
                if (c.location === 'table') location = ' (стол)';
                else if (c.location === 'shelf') location = ` (полка ${c.locationId})`;
                else if (c.location === 'light') location = ' (свет)';
                selectedItems.push(`#${c.number}${location}`);
            }
        });
        selectedInfo.innerHTML = `✅ ${selectedItems.join(', ')}`;
    } else {
        selectedInfo.innerHTML = '👆 Нажми на контейнер или ведро (Ctrl+клик для нескольких)';
    }
}

function renderLog() {
    const logPanel = document.getElementById('logPanel');
    if (logPanel) {
        logPanel.innerHTML = '📋 ' + state.log.slice(0, 5).join('<br>📋 ');
    }
}

function addZoneSelectionHandlers() {
    // Стол посева
    const tableHeader = document.getElementById('tableHeader');
    if (tableHeader && !tableHeader._hasHandler) {
        tableHeader.style.cursor = 'pointer';
        tableHeader.title = 'Кликни для выбора всех контейнеров на столе';
        tableHeader.addEventListener('click', (e) => {
            e.stopPropagation();
            selectAllTable();
        });
        tableHeader._hasHandler = true;
    }
    
    // Полки
    document.querySelectorAll('.shelf-header').forEach((header, index) => {
        if (!header._hasHandler) {
            header.style.cursor = 'pointer';
            header.title = 'Кликни для выбора всех контейнеров на полке';
            header.addEventListener('click', (e) => {
                e.stopPropagation();
                selectShelf(index + 1);
            });
            header._hasHandler = true;
        }
    });
    
    // Поддоны
    document.querySelectorAll('.pallet-header').forEach((header, index) => {
        if (!header._hasHandler) {
            header.style.cursor = 'pointer';
            header.title = 'Кликни для выбора всех контейнеров на поддоне';
            header.addEventListener('click', (e) => {
                e.stopPropagation();
                selectPallet(index + 1);
            });
            header._hasHandler = true;
        }
    });
}

function showAchievements() {
    const earned = state.stats.achievements.map(id => {
        const ach = Object.values(ACHIEVEMENTS).find(a => a.id === id);
        return ach ? `✅ ${ach.title}` : null;
    }).filter(Boolean);
    
    const available = Object.values(ACHIEVEMENTS)
        .filter(ach => !state.stats.achievements.includes(ach.id))
        .map(ach => `⏳ ${ach.title} — ${ach.description}`);
    
    addLog("🏆 ДОСТИЖЕНИЯ:");
    earned.forEach(ach => addLog(ach));
    if (available.length > 0) {
        addLog("📋 Ещё можно получить:");
        available.slice(0, 3).forEach(ach => addLog(ach));
    }
}

window.showAchievements = showAchievements;
window.selectAllTable = selectAllTable;
window.selectShelf = selectShelf;
window.selectPallet = selectPallet;