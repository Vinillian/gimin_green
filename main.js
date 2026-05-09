// main.js

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    addDayDisplay();
    initEventHandlers();
    startGameTimer();
    render();
    addLog("🚀 Ферма запущена! Используй Ctrl+клик для множественного выбора");
});

function initEventHandlers() {
    // Кнопки добавления семян
    document.getElementById('newBatch1Btn')?.addEventListener('click', () => {
        addOneSeedToBucket();
    });
    
    document.getElementById('newBatch4Btn')?.addEventListener('click', () => {
        addFourSeedsToBucket();
    });
    
    // Кнопки стадий
    document.getElementById('stageSoakBtn')?.addEventListener('click', () => {
        if (state.selectedBucketIds.size > 0 || state.selectedIds.size > 0) {
            if (state.selectedBucketIds.size > 0) {
                startSoaking();
            } else {
                addLog("⚠️ Для замачивания выбери вёдра");
            }
        } else {
            addLog("⚠️ Сначала выбери вёдра");
        }
    });
    
    document.getElementById('stageAirBtn')?.addEventListener('click', () => {
        if (state.selectedBucketIds.size > 0) {
            startAiring();
        } else {
            addLog("⚠️ Сначала выбери вёдра");
        }
    });
    
    document.getElementById('stageSowBtn')?.addEventListener('click', () => {
        if (state.selectedBucketIds.size > 0) {
            startSowing();
        } else {
            addLog("⚠️ Сначала выбери вёдра");
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
    
    // Кнопки ухода
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
    
    // Кнопки выделения
    document.getElementById('selectAllBtn')?.addEventListener('click', selectAll);
    document.getElementById('clearSelectionBtn')?.addEventListener('click', clearSelection);
    
    // Кнопки действий
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
    
    // Кнопки ресурсов
    document.getElementById('addWaterBtn')?.addEventListener('click', addWater);
    document.getElementById('addSolutionBtn')?.addEventListener('click', addSolution);
    document.getElementById('addSeedsBtn')?.addEventListener('click', addSeeds);
    
    // Обработчики клавиш для множественного выбора
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Control' || e.key === 'Shift') {
            state.multiselectModifier = true;
        }
    });
    
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Control' || e.key === 'Shift') {
            state.multiselectModifier = false;
        }
    });
}

function addDayDisplay() {
    if (!document.getElementById('currentDay')) {
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
}

function startGameTimer() {
    setInterval(() => {
        if (state.isRunning) {
            state.gameDay = roundResource(state.gameDay + TIME_SETTINGS.DAY_INCREMENT);
            updateProgress();
            saveToLocalStorage();
            
            if (Number.isInteger(state.gameDay) && state.gameDay > 0) {
                addLog(`📆 Наступил день ${state.gameDay}`);
            }
        }
    }, TIME_SETTINGS.TICK_INTERVAL);
}

function toggleGamePause() {
    state.isRunning = !state.isRunning;
    addLog(state.isRunning ? "▶️ Игра возобновлена" : "⏸️ Игра на паузе");
    render();
}