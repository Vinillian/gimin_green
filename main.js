// main.js

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();

    // Добавляем отображение текущего дня в верхнюю панель
    addDayDisplay();
    
    // Привязка кнопок
    document.getElementById('newBatch1Btn')?.addEventListener('click', createContainer);
    document.getElementById('newBatch4Btn')?.addEventListener('click', create4Containers);
    
    document.getElementById('stageSoakBtn')?.addEventListener('click', () => setStageForSelected('soak'));
    document.getElementById('stageAirBtn')?.addEventListener('click', () => setStageForSelected('air'));
    document.getElementById('stageSowBtn')?.addEventListener('click', () => setStageForSelected('sow'));
    document.getElementById('stagePressBtn')?.addEventListener('click', () => setStageForSelected('press'));
    document.getElementById('stageLightBtn')?.addEventListener('click', () => setStageForSelected('light'));
    document.getElementById('resetStageBtn')?.addEventListener('click', resetSelectedStage);
    
    document.getElementById('selectAllBtn')?.addEventListener('click', selectAll);
    document.getElementById('clearSelectionBtn')?.addEventListener('click', clearSelection);
    
    document.getElementById('harvestSelectedBtn')?.addEventListener('click', harvestSelected);
    document.getElementById('deleteSelectedBtn')?.addEventListener('click', deleteSelected);
    
    document.getElementById('addWaterBtn')?.addEventListener('click', addWater);
    document.getElementById('addSolutionBtn')?.addEventListener('click', addSolution);
    document.getElementById('addSeedsBtn')?.addEventListener('click', addSeeds);

    // Запускаем таймер
    startGameTimer();
    
    // Начальная отрисовка
    render();
});

function addDayDisplay() {
    // Добавляем отображение дня в верхнюю панель ресурсов
    const topResources = document.querySelector('.top-resources');
    if (topResources) {
        const dayCard = document.createElement('div');
        dayCard.className = 'resource-card large';
        dayCard.innerHTML = `
            <span class="resource-icon">⏱️</span>
            <span class="resource-label">ДЕНЬ</span>
            <span class="resource-value" id="currentDay">0.0</span>
        `;
        topResources.appendChild(dayCard);
    }
}

function startGameTimer() {
    // Каждые 6 секунд добавляем 0.1 игрового дня (60 секунд = 1 день)
    setInterval(() => {
        if (state.isRunning) {
            // Увеличиваем игровой день на 0.1
            state.gameDay = Math.round((state.gameDay + 0.1) * 10) / 10;
            
            // Обновляем прогресс всех контейнеров
            updateProgress();
            
            // Сохраняем состояние
            saveToLocalStorage();
            
            // Можно добавить редкое логирование (например, каждый целый день)
            if (Number.isInteger(state.gameDay)) {
                addLog(`📆 Наступил день ${state.gameDay}`);
            }
        }
    }, 6000); // 6000 мс = 6 секунд = 0.1 дня (значит 1 день = 60 секунд)
}