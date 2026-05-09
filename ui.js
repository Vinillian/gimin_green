// ui.js

function render() {
    renderBuckets();
    renderTable();
    renderShelves();
    renderPallets();
    renderResources();
    renderSelectedInfo();
    renderLog();
}

function renderBuckets() {
    const container = document.getElementById('bucketsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    state.buckets.forEach(bucket => {
        const bucketEl = document.createElement('div');
        bucketEl.className = `bucket ${bucket.stage ? 'active' : ''} ${state.selectedBucketId === bucket.id ? 'selected' : ''}`;
        bucketEl.dataset.id = bucket.id;
        
        let icon = '🪣';
        if (bucket.stage === 'soak') icon = '💧';
        else if (bucket.stage === 'air') icon = '🌬';
        
        const progress = bucket.stage ? getBucketProgress(bucket) : 0;
        
        // Формируем иконки статуса для ведра
        const statusIcons = [];
        if (bucket.stage === 'soak') statusIcons.push('💧');
        else if (bucket.stage === 'air') statusIcons.push('🌬');
        if (bucket.needsTransition) statusIcons.push('⚠️');
        
        bucketEl.innerHTML = `
            <div class="bucket-icon">${icon}</div>
            <div class="bucket-count">${bucket.seeds} 🌱</div>
            ${bucket.stage ? `<div class="bucket-progress">${progress}%</div>` : ''}
            <div class="bucket-status">${statusIcons.join(' ')}</div>
        `;
        
        bucketEl.addEventListener('click', (e) => {
            e.stopPropagation();
            selectBucket(bucket.id);
        });
        
        container.appendChild(bucketEl);
    });
}

function renderTable() {
    const container = document.getElementById('tableContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Получаем все контейнеры на столе
    const tableContainers = state.containers.filter(c => c.location === 'table');
    
    // Сортируем по номеру для красивого отображения
    tableContainers.sort((a, b) => a.number - b.number);
    
    tableContainers.forEach(containerObj => {
        const card = createContainerCard(containerObj);
        container.appendChild(card);
    });
    
    // Заполняем пустые ячейки до 8
    for (let i = tableContainers.length; i < 8; i++) {
        const empty = document.createElement('div');
        empty.className = 'table-cell empty';
        empty.innerHTML = '🔲';
        container.appendChild(empty);
    }
}

function renderShelves() {
    // Полка 1
    const shelf1Container = document.getElementById('shelf1Container');
    if (shelf1Container) {
        shelf1Container.innerHTML = '';
        const shelf = state.shelves.find(s => s.id === 1);
        if (shelf) {
            const shelfContainers = state.containers.filter(c => shelf.containers.includes(c.id));
            shelfContainers.sort((a, b) => a.number - b.number);
            
            shelfContainers.forEach(containerObj => {
                const card = createContainerCard(containerObj);
                card.classList.add('shelf-container-card');
                shelf1Container.appendChild(card);
            });
            
            for (let i = shelfContainers.length; i < 4; i++) {
                const empty = document.createElement('div');
                empty.className = 'shelf-cell empty';
                empty.innerHTML = '📦';
                shelf1Container.appendChild(empty);
            }
        }
    }
    
    // Полка 2
    const shelf2Container = document.getElementById('shelf2Container');
    if (shelf2Container) {
        shelf2Container.innerHTML = '';
        const shelf = state.shelves.find(s => s.id === 2);
        if (shelf) {
            const shelfContainers = state.containers.filter(c => shelf.containers.includes(c.id));
            shelfContainers.sort((a, b) => a.number - b.number);
            
            shelfContainers.forEach(containerObj => {
                const card = createContainerCard(containerObj);
                card.classList.add('shelf-container-card');
                shelf2Container.appendChild(card);
            });
            
            for (let i = shelfContainers.length; i < 4; i++) {
                const empty = document.createElement('div');
                empty.className = 'shelf-cell empty';
                empty.innerHTML = '📦';
                shelf2Container.appendChild(empty);
            }
        }
    }
    
    // Полка 3
    const shelf3Container = document.getElementById('shelf3Container');
    if (shelf3Container) {
        shelf3Container.innerHTML = '';
        const shelf = state.shelves.find(s => s.id === 3);
        if (shelf) {
            const shelfContainers = state.containers.filter(c => shelf.containers.includes(c.id));
            shelfContainers.sort((a, b) => a.number - b.number);
            
            shelfContainers.forEach(containerObj => {
                const card = createContainerCard(containerObj);
                card.classList.add('shelf-container-card');
                shelf3Container.appendChild(card);
            });
            
            for (let i = shelfContainers.length; i < 4; i++) {
                const empty = document.createElement('div');
                empty.className = 'shelf-cell empty';
                empty.innerHTML = '📦';
                shelf3Container.appendChild(empty);
            }
        }
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
    
    const containers1 = lightContainers.filter(c => c.number <= 10);
    const containers2 = lightContainers.filter(c => c.number > 10);
    
    // Первый поддон (1-10)
    for (let i = 1; i <= 10; i++) {
        const container = containers1.find(c => c.number === i);
        if (container) {
            const card = createContainerCard(container);
            grid1.appendChild(card);
        } else {
            renderEmptyCell(grid1, i);
        }
    }
    
    // Второй поддон (11-20)
    for (let i = 11; i <= 20; i++) {
        const container = containers2.find(c => c.number === i);
        if (container) {
            const card = createContainerCard(container);
            grid2.appendChild(card);
        } else {
            renderEmptyCell(grid2, i);
        }
    }
    
    // Обновляем счетчики готовых на поддонах
    const ready1 = containers1.filter(c => c.stage === 'light' && c.needsTransition).length;
    const ready2 = containers2.filter(c => c.stage === 'light' && c.needsTransition).length;
    
    document.getElementById('readyCount1').innerText = ready1;
    document.getElementById('readyCount2').innerText = ready2;
}

function createContainerCard(container) {
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
        dayText = `День ${currentDay} из ${totalDays}`;
    } else {
        progressPercent = 100;
        dayText = 'Готово';
    }
    
    // Собираем иконки статуса
    const icons = [];
    icons.push(STAGE_ICONS[container.stage]);
    if (container.needsSpray) icons.push('💦');
    if (container.needsWater) icons.push('🚰');
    if (container.needsTransition) icons.push('⚠️');
    
    card.innerHTML = `
        <div class="container-number">#${container.number}</div>
        <div class="container-icons">${icons.join(' ')}</div>
        <div class="progress-container">
            <div class="progress-fill" style="width: ${progressPercent}%;"></div>
        </div>
        <div class="container-day">${dayText}</div>
    `;
    
    card.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = Number(card.dataset.id);
        
        if (state.selectedIds.has(id)) {
            state.selectedIds.delete(id);
            addLog(`🔓 Снят выбор с #${getContainerNumber(id)}`);
        } else {
            state.selectedIds.add(id);
            addLog(`🔒 Выбран #${getContainerNumber(id)}`);
        }
        render();
    });
    
    return card;
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

function renderResources() {
    document.getElementById('waterCount').innerText = state.water.toFixed(1);
    document.getElementById('solutionCount').innerText = state.solution.toFixed(1);
    document.getElementById('seedCount').innerText = state.seeds.toFixed(1);
    document.getElementById('totalContainers').innerText = state.containers.length;
    
    const dayDisplay = document.getElementById('currentDay');
    if (dayDisplay) {
        dayDisplay.innerText = state.gameDay.toFixed(1);
    }
}

function renderSelectedInfo() {
    const selectedInfo = document.getElementById('selectedInfo');
    if (!selectedInfo) return;
    
    if (state.selectedBucketId !== null) {
        const bucket = state.buckets.find(b => b.id === state.selectedBucketId);
        if (bucket) {
            let status = '';
            if (bucket.stage === 'soak') status = ' (замачивание)';
            else if (bucket.stage === 'air') status = ' (проветривание)';
            
            selectedInfo.innerHTML = `✅ Выбрано ведро #${bucket.id}${status} — ${bucket.seeds} 🌱`;
            return;
        }
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
        
        if (selectedItems.length > 0) {
            selectedInfo.innerHTML = `✅ Выбраны: ${selectedItems.join(', ')}`;
        } else {
            selectedInfo.innerHTML = '👆 Нажми на контейнер или ведро, чтобы выбрать';
        }
    } else {
        selectedInfo.innerHTML = '👆 Нажми на контейнер или ведро, чтобы выбрать';
    }
}

function renderLog() {
    const logPanel = document.getElementById('logPanel');
    if (logPanel) {
        logPanel.innerHTML = '📋 ' + state.log.slice(0, 5).join('<br>📋 ');
    }
}

function renderEmptyCell(grid, number) {
    const emptyCard = document.createElement('div');
    emptyCard.className = 'container-card empty';
    emptyCard.innerHTML = `<div class="container-number">#${number}</div>`;
    grid.appendChild(emptyCard);
}