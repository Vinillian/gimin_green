// ui.js

function renderForecast(days = 7) {
    const forecastContainer = document.getElementById('forecastContainer');
    if (!forecastContainer) return;
    
    const forecast = getForecast(days);
    
    let html = '';
    const now = new Date();
    
    for (let i = 0; i < days; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() + i);
        
        html += `
            <div class="forecast-day ${i === 0 ? 'today' : ''}">
                <div>${date.toLocaleDateString('ru', { weekday: 'short' })}</div>
                <div>${date.getDate()}.${date.getMonth()+1}</div>
                <div class="forecast-number">${forecast[i]}</div>
            </div>
        `;
    }
    
    forecastContainer.innerHTML = html;

    const total = forecast.reduce((a, b) => a + b, 0);
    const avg = total / days;
    
    let recommendation = '';
    if (avg < 0.8) recommendation = "⚠️ Критично мало! Срочно сажай новые боксы";
    else if (avg < 1.2) recommendation = "💡 Добавь 1-2 бокса для стабильности";
    else recommendation = "🟢 Отличная ротация! Так держать";
    
    const recommendationEl = document.getElementById('recommendation');
    if (recommendationEl) {
        recommendationEl.innerHTML = `💡 ${recommendation}`;
    }
}

function render() {
    const grid = document.getElementById('containerGrid');
    const totalSpan = document.getElementById('totalBoxes');
    const logPanel = document.getElementById('logPanel');
    const remindersPanel = document.getElementById('remindersPanel');
    
    if (!grid) return;
    
    grid.innerHTML = '';

    // Подсчёт по стадиям
    let soakCount = 0, pressCount = 0, lightCount = 0, readyCount = 0;
    
    state.containers.forEach(c => {
        const ready = isReady(c);
        if (c.stage === 'soak') soakCount++;
        else if (c.stage === 'press') pressCount++;
        else if (c.stage === 'light') lightCount++;
        if (ready) readyCount++;
        
        const isSelected = state.selectedIds.has(c.id);
        const progress = getStageProgress(c);
        const timeLeft = getTimeLeft(c);
        const readyDate = getReadyDate(c);
        const needSpray = needsSpray(c);
        const needWater = needsWater(c);
        
        const card = document.createElement('div');
        card.className = `container-card ${isSelected ? 'selected' : ''} ${ready ? 'ready' : ''}`;
        card.style.border = isSelected ? '5px solid #ffaa00' : (ready ? '5px solid #ff5500' : '3px solid #dbb158');
        card.style.background = isSelected ? '#3d874a' : '#31663d';

        let reminderIcon = '';
        if (needSpray) reminderIcon = '💦';
        if (needWater) reminderIcon = '💧';

        card.innerHTML = `
            <div class="container-header">
                <span>🌾 бокс <small style="opacity:0.7;">#${c.number}</small></span>
                <span class="container-id">${STAGE_ICONS[c.stage]}</span>
            </div>
            <div class="stage-badge">${STAGE_NAMES[c.stage]}</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%;"></div>
            </div>
            <div class="timer-row">
                <span>⏳ ${timeLeft} дн</span>
                <span>${readyDate}</span>
            </div>
            <div class="btn-group">
                <button class="btn" data-action="spray" data-id="${c.id}" title="Опрыскать">💦</button>
                <button class="btn" data-action="water" data-id="${c.id}" title="Полить (200мл)">💧</button>
                <button class="btn btn-orange" data-action="light" data-id="${c.id}" title="На свет">💡</button>
                <button class="btn" data-action="harvest" data-id="${c.id}" title="Собрать">✂️</button>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            
            if (state.selectedIds.has(c.id)) {
                state.selectedIds.delete(c.id);
                addLog(`🔓 Снят выбор с бокса #${c.number}`);
            } else {
                state.selectedIds.add(c.id);
                addLog(`🔒 Выбран бокс #${c.number}`);
            }
            render();
        });

        grid.appendChild(card);
    });

    // Пустые ячейки
    for (let i = state.containers.length; i < MAX_CONTAINERS; i++) {
        const emptyCard = document.createElement('div');
        emptyCard.className = 'container-card';
        emptyCard.style.background = '#264d31';
        emptyCard.style.border = '3px dashed #8b9a6b';
        emptyCard.style.opacity = '0.5';
        emptyCard.style.display = 'flex';
        emptyCard.style.alignItems = 'center';
        emptyCard.style.justifyContent = 'center';
        emptyCard.innerHTML = '⬜ пусто';
        grid.appendChild(emptyCard);
    }

    if (totalSpan) totalSpan.innerText = state.containers.length;
    
    // Ресурсы в литрах
    document.getElementById('waterCount').innerText = (state.water / 1000).toFixed(1) + 'л';
    document.getElementById('solutionCount').innerText = (state.solution / 1000).toFixed(1) + 'л';

    document.getElementById('readyCount').innerText = readyCount;
    document.getElementById('inProgressCount').innerText = state.containers.length - readyCount;

    // Статистика по стадиям
    document.getElementById('statSoak').innerText = soakCount;
    document.getElementById('statPress').innerText = pressCount;
    document.getElementById('statLight').innerText = lightCount;
    document.getElementById('statReady').innerText = readyCount;

    const selectedInfo = document.getElementById('selectedInfo');
    if (selectedInfo) {
        if (state.selectedIds.size > 0) {
            const ids = Array.from(state.selectedIds).map(id => {
                const c = state.containers.find(c => c.id === id);
                return c ? `#${c.number}` : '';
            }).join(', ');
            selectedInfo.innerHTML = `✅ Выбраны: ${ids}`;
        } else {
            selectedInfo.innerHTML = '👆 Нажми на контейнер, чтобы выбрать';
        }
    }

    // Напоминания
    const reminders = checkReminders();
    if (remindersPanel) {
        if (reminders.length > 0) {
            remindersPanel.innerHTML = '🔔 ' + reminders.join('<br>🔔 ');
            remindersPanel.style.display = 'block';
        } else {
            remindersPanel.style.display = 'none';
        }
    }

    renderForecast(state.forecastDays);

    if (logPanel) logPanel.innerHTML = '📋 ' + state.log.join('<br>📋 ');
}