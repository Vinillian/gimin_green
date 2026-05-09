// ui.js

function render() {
    const grid1 = document.getElementById('containerGrid1');
    const grid2 = document.getElementById('containerGrid2');
    const totalSpan = document.getElementById('totalContainers');
    const logPanel = document.getElementById('logPanel');
    const selectedInfo = document.getElementById('selectedInfo');
    
    if (!grid1 || !grid2) return;
    
    // Очищаем оба поддона
    grid1.innerHTML = '';
    grid2.innerHTML = '';

    // Сортируем контейнеры по номеру
    const sortedContainers = [...state.containers].sort((a, b) => a.number - b.number);

    // Разделяем контейнеры на две группы (1-10 в первый поддон, 11-20 во второй)
    const containers1 = sortedContainers.filter(c => c.number <= 10);
    const containers2 = sortedContainers.filter(c => c.number > 10);

    // Создаем карты для быстрого доступа
    const containerMap1 = new Map(containers1.map(c => [c.number, c]));
    const containerMap2 = new Map(containers2.map(c => [c.number, c]));

    // Рендерим первый поддон (ячейки 1-10)
    for (let i = 1; i <= 10; i++) {
        const container = containerMap1.get(i);
        if (container) {
            renderContainer(container, grid1);
        } else {
            renderEmptyCell(grid1, i);
        }
    }

    // Рендерим второй поддон (ячейки 11-20)
    for (let i = 11; i <= 20; i++) {
        const container = containerMap2.get(i);
        if (container) {
            renderContainer(container, grid2);
        } else {
            renderEmptyCell(grid2, i);
        }
    }
    
    // Обновление глобальных счетчиков с ОДНИМ знаком после запятой
    if (totalSpan) totalSpan.innerText = state.containers.length;
    document.getElementById('waterCount').innerText = state.water.toFixed(1);
    document.getElementById('solutionCount').innerText = state.solution.toFixed(1);
    document.getElementById('seedCount').innerText = state.seeds.toFixed(1);
    
    // Считаем готовые для каждого поддона (стадия light)
    const ready1 = containers1.filter(c => c.stage === 'light').length;
    const ready2 = containers2.filter(c => c.stage === 'light').length;
    
    document.getElementById('readyCount1').innerText = ready1;
    document.getElementById('inProgressCount1').innerText = containers1.length - ready1;
    
    document.getElementById('readyCount2').innerText = ready2;
    document.getElementById('inProgressCount2').innerText = containers2.length - ready2;
    
    // Информация о выбранных
    if (selectedInfo) {
        if (state.selectedIds.size > 0) {
            const selectedNumbers = [];
            state.selectedIds.forEach(id => {
                const c = state.containers.find(c => c.id === id);
                if (c) selectedNumbers.push(`#${c.number}`);
            });
            selectedInfo.innerHTML = `✅ Выбраны: ${selectedNumbers.join(', ')}`;
        } else {
            selectedInfo.innerHTML = '👆 Нажми на контейнер, чтобы выбрать';
        }
    }
    
    // Лог
    if (logPanel) {
        logPanel.innerHTML = '📋 ' + state.log.slice(0, 5).join('<br>📋 ');
    }
}

function renderContainer(container, grid) {
    const isSelected = state.selectedIds.has(container.id);
    const card = document.createElement('div');
    card.className = `container-card ${container.stage} ${isSelected ? 'selected' : ''}`;
    card.setAttribute('data-id', container.id);
    card.setAttribute('data-number', container.number);
    
    card.innerHTML = `
        <div class="container-number">#${container.number}</div>
        <div class="container-stage-icon">${STAGE_ICONS[container.stage]}</div>
    `;
    
    card.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = Number(card.getAttribute('data-id'));
        const container = state.containers.find(c => c.id === id);
        
        if (!container) return;
        
        if (state.selectedIds.has(id)) {
            state.selectedIds.delete(id);
            addLog(`🔓 Снят выбор с #${container.number}`);
        } else {
            state.selectedIds.add(id);
            addLog(`🔒 Выбран #${container.number}`);
        }
        render();
    });
    
    grid.appendChild(card);
}

function renderEmptyCell(grid, number) {
    const emptyCard = document.createElement('div');
    emptyCard.className = 'container-card';
    emptyCard.style.background = '#264d31';
    emptyCard.style.border = '2px dashed #8b9a6b';
    emptyCard.style.opacity = '0.5';
    emptyCard.style.cursor = 'default';
    emptyCard.style.display = 'flex';
    emptyCard.style.alignItems = 'center';
    emptyCard.style.justifyContent = 'center';
    emptyCard.style.minHeight = '85px';
    emptyCard.innerHTML = `<div class="container-number">#${number}</div>`;
    
    grid.appendChild(emptyCard);
}