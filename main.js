// main.js

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();

    // Добавляем отображение текущего дня
    addDayDisplay();
    
    // КНОПКИ ДОБАВЛЕНИЯ СЕМЯН В ВЁДРА
    document.getElementById('newBatch1Btn')?.addEventListener('click', () => {
        addSeedsToBucket(1);
    });
    
    document.getElementById('newBatch4Btn')?.addEventListener('click', () => {
        addSeedsToBucket(4);
    });
    
    // КНОПКИ СТАДИЙ (работают с выбранным ведром или контейнерами)
    document.getElementById('stageSoakBtn')?.addEventListener('click', () => {
        if (state.selectedBucketId !== null) {
            startSoaking();
        } else {
            addLog("⚠️ Сначала выбери ведро");
        }
    });
    
    document.getElementById('stageAirBtn')?.addEventListener('click', () => {
        if (state.selectedBucketId !== null) {
            startAiring();
        } else {
            addLog("⚠️ Сначала выбери ведро");
        }
    });
    
    document.getElementById('stageSowBtn')?.addEventListener('click', () => {
        if (state.selectedBucketId !== null) {
            startSowing();
        } else {
            addLog("⚠️ Сначала выбери ведро");
        }
    });
    
    document.getElementById('stagePressBtn')?.addEventListener('click', () => {
        if (state.selectedIds.size > 0) {
            moveToPress();
        } else {
            addLog("⚠️ Сначала выбери контейнеры на столе");
        }
    });
    
    document.getElementById('stageLightBtn')?.addEventListener('click', () => {
        if (state.selectedIds.size > 0) {
            moveToLight();
        } else {
            addLog("⚠️ Сначала выбери контейнеры на полках");
        }
    });
    
    document.getElementById('resetStageBtn')?.addEventListener('click', () => {
        clearSelection();
    });
    
    // КНОПКИ ОПРЫСКИВАНИЯ И ПОЛИВА
    document.getElementById('spraySelectedBtn')?.addEventListener('click', () => {
        if (state.selectedIds.size > 0) {
            spraySelected();
        } else {
            addLog("⚠️ Сначала выбери контейнеры");
        }
    });
    
    document.getElementById('waterSelectedBtn')?.addEventListener('click', () => {
        if (state.selectedIds.size > 0) {
            waterSelected();
        } else {
            addLog("⚠️ Сначала выбери контейнеры на свету");
        }
    });
    
    // КНОПКИ ВЫДЕЛЕНИЯ
    document.getElementById('selectAllBtn')?.addEventListener('click', selectAll);
    document.getElementById('clearSelectionBtn')?.addEventListener('click', clearSelection);
    
    // КНОПКИ ДЕЙСТВИЙ
    document.getElementById('harvestSelectedBtn')?.addEventListener('click', () => {
        if (state.selectedIds.size > 0) {
            harvestSelected();
        } else {
            addLog("⚠️ Сначала выбери контейнеры для сбора");
        }
    });
    
    document.getElementById('deleteSelectedBtn')?.addEventListener('click', () => {
        if (state.selectedIds.size > 0) {
            deleteSelected();
        } else {
            addLog("⚠️ Сначала выбери контейнеры для удаления");
        }
    });
    
    // КНОПКИ ДОБАВЛЕНИЯ РЕСУРСОВ
    document.getElementById('addWaterBtn')?.addEventListener('click', addWater);
    document.getElementById('addSolutionBtn')?.addEventListener('click', addSolution);
    document.getElementById('addSeedsBtn')?.addEventListener('click', addSeeds);

    // Запускаем таймер
    startGameTimer();
    
    // Начальная отрисовка
    render();
});

function addDayDisplay() {
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
    setInterval(() => {
        if (state.isRunning) {
            state.gameDay = Math.round((state.gameDay + 0.1) * 10) / 10;
            updateProgress();
            saveToLocalStorage();
            
            if (Number.isInteger(state.gameDay)) {
                addLog(`📆 Наступил день ${state.gameDay}`);
            }
        }
    }, 6000);
}