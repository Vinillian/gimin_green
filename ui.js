// ui.js

function render() {
    const grid1 = document.getElementById('containerGrid1');
    const grid2 = document.getElementById('containerGrid2');
    const totalSpan = document.getElementById('totalContainers');
    const logPanel = document.getElementById('logPanel');
    const selectedInfo = document.getElementById('selectedInfo');
    
    // Добавляем отображение текущего дня
    const dayDisplay = document.getElementById('currentDay');
    if (dayDisplay) {
        dayDisplay.innerText = state.gameDay.toFixed(1);
    }
    
    if (!grid1 || !grid2) return;
    
    grid1.innerHTML = '';
    grid2.innerHTML = '';

    const sortedContainers = [...state.containers].sort((a, b) => a.number - b.number);

    const containers1 = sortedContainers.filter(c => c.number <= 10);
    const containers2 = sortedContainers.filter(c => c.number > 10);

    const containerMap1 = new Map(containers1.map(c => [c.number, c]));
    const containerMap2 = new Map(containers2.map(c => [c.number, c]));

    for (let i = 1; i <= 10; i++) {
        const container = containerMap1.get(i);
        if (container) {
            renderContainer(container, grid1);
        } else {
            renderEmptyCell(grid1, i);
        }
    }

    for (let i = 11; i <= 20; i++) {
        const container = containerMap2.get(i);
        if (container) {
            renderContainer(container, grid2);
        } else {
            renderEmptyCell(grid2, i);
        }
    }
    
    if (totalSpan) totalSpan.innerText = state.containers.length;
    document.getElementById('waterCount').innerText = state.water.toFixed(1);
    document.getElementById('solutionCount').innerText = state.solution.toFixed(1);
    document.getElementById('seedCount').innerText = state.seeds.toFixed(1);
    
    const ready1 = containers1.filter(c => c.stage === 'light').length;
    const ready2 = containers2.filter(c => c.stage === 'light').length;
    
    document.getElementById('readyCount1').innerText = ready1;
    document.getElementById('inProgressCount1').innerText = containers1.length - ready1;
    
    document.getElementById('readyCount2').innerText = ready2;
    document.getElementById('inProgressCount2').innerText = containers2.length - ready2;
    
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
    
    // Вычисляем прогресс
    const daysPassed = state.gameDay - container.stageStartDay;
    const totalDays = STAGE_DURATION[container.stage];
    
    let progressPercent = 0;
    let currentDayText = '';
    
    if (totalDays > 0) {
        // Ограничиваем прогресс 100%
        progressPercent = Math.min(100, (daysPassed / totalDays) * 100);
        
        // Какой день идёт (1, 2, 3...)
        const currentDay = Math.min(Math.floor(daysPassed) + 1, totalDays);
        currentDayText = `День ${currentDay}`;
    } else {
        // Для мгновенных стадий (посев)
        progressPercent = 100;
        currentDayText = 'Готово';
    }
    
    // Создаём прогресс-бар
    const progressBar = createProgressBar(progressPercent);
    
    card.innerHTML = `
        <div class="container-number">#${container.number}</div>
        <div class="container-stage-icon">${STAGE_ICONS[container.stage]}</div>
        ${progressBar}
        <div class="container-day">${currentDayText}</div>
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

function createProgressBar(percent) {
    // Округляем до целого для отображения
    const roundedPercent = Math.round(percent);
    
    // Создаём псевдо-прогресс бар из символов
    const barLength = 10;
    const filledLength = Math.round((percent / 100) * barLength);
    const emptyLength = barLength - filledLength;
    
    const filledBar = '='.repeat(filledLength);
    const emptyBar = ' '.repeat(emptyLength);
    
    return `
        <div class="progress-bar-container">
            <div class="progress-bar-text">[${filledBar}${emptyBar}] ${roundedPercent}%</div>
        </div>
    `;
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