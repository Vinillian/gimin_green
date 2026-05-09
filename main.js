// main.js

document.addEventListener('DOMContentLoaded', () => {
    // Загружаем сохранение
    loadFromLocalStorage();
    
    // Инициализируем все обработчики событий
    initEventHandlers();
    
    // Инициализируем обработчики для панели управления вёдрами
    initBucketControlHandlers();
    
    // Запускаем игровой таймер
    startGameTimer();
    
    // Начальная отрисовка
    render();
    
    // Приветственное сообщение
    addLog("🚀 Ферма запущена! Используй Ctrl+клик для множественного выбора");
});

// ========== ИНИЦИАЛИЗАЦИЯ ОБРАБОТЧИКОВ ==========

function initEventHandlers() {
    // Кнопки стадий (только для контейнеров)
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
            addLog("⚠️ Сначала выбери контейнеры для опрыскивания");
        }
    });
    
    document.getElementById('waterSelectedBtn')?.addEventListener('click', () => {
        if (state.selectedIds.size > 0) {
            waterSelected();
        } else {
            addLog("⚠️ Сначала выбери контейнеры на свету для полива");
        }
    });
    
    // Кнопки выделения
    document.getElementById('selectAllBtn')?.addEventListener('click', selectAll);
    document.getElementById('clearSelectionBtn')?.addEventListener('click', clearSelection);
    
    // Умные перемещения
    document.getElementById('smartPressBtn')?.addEventListener('click', () => {
        if (state.selectedIds.size > 0) {
            smartMoveToPress();
        } else {
            addLog("⚠️ Сначала выбери контейнеры на столе");
        }
    });
    
    document.getElementById('smartLightBtn')?.addEventListener('click', () => {
        if (state.selectedIds.size > 0) {
            smartMoveToLight();
        } else {
            addLog("⚠️ Сначала выбери контейнеры на полках");
        }
    });
    
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
    
    // Кнопка достижений
    document.getElementById('achievementsBtn')?.addEventListener('click', showAchievements);
    
    // Обработчики клавиш для множественного выбора
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Control' || e.key === 'Shift') {
            state.multiselectModifier = true;
        }
        
        // Горячие клавиши для быстрого доступа
        if (e.key === '1' && e.ctrlKey) {
            e.preventDefault();
            addOneSeedToBucket();
        } else if (e.key === '4' && e.ctrlKey) {
            e.preventDefault();
            addFourSeedsToBucket();
        } else if (e.key === 's' && e.ctrlKey) {
            e.preventDefault();
            if (state.selectedBucketIds.size > 0) {
                startSoaking();
            }
        } else if (e.key === 'a' && e.ctrlKey) {
            e.preventDefault();
            if (state.selectedBucketIds.size > 0) {
                startAiring();
            }
        } else if (e.key === 'p' && e.ctrlKey) {
            e.preventDefault();
            if (state.selectedBucketIds.size > 0) {
                startSowing();
            }
        }
    });
    
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Control' || e.key === 'Shift') {
            state.multiselectModifier = false;
        }
    });
}

// ========== ОБРАБОТЧИКИ ДЛЯ ПАНЕЛИ УПРАВЛЕНИЯ ВЁДРАМИ ==========

function initBucketControlHandlers() {
    // Кнопки добавления семян
    document.getElementById('compactAdd1Btn')?.addEventListener('click', () => {
        addOneSeedToBucket();
    });
    
    document.getElementById('compactAdd4Btn')?.addEventListener('click', () => {
        addFourSeedsToBucket();
    });
    
    // Кнопки действий с вёдрами
    document.getElementById('compactSoakBtn')?.addEventListener('click', () => {
        if (state.selectedBucketIds.size > 0) {
            startSoaking();
        } else {
            addLog("⚠️ Сначала выбери вёдра для замачивания");
        }
    });
    
    document.getElementById('compactAirBtn')?.addEventListener('click', () => {
        if (state.selectedBucketIds.size > 0) {
            startAiring();
        } else {
            addLog("⚠️ Сначала выбери вёдра для проветривания");
        }
    });
    
    // Кнопка посева (перенесена из правой панели)
    document.getElementById('compactSowBtn')?.addEventListener('click', () => {
        if (state.selectedBucketIds.size > 0) {
            startSowing();
        } else {
            addLog("⚠️ Сначала выбери вёдра с семенами для посева");
        }
    });
    
    // Кнопки выбора вёдер
    document.getElementById('compactSelectFreeBtn')?.addEventListener('click', selectAllFreeBuckets);
    
    document.getElementById('compactSelectSoakBtn')?.addEventListener('click', () => {
        selectBucketsByStage('soak');
    });
    
    document.getElementById('compactSelectAirBtn')?.addEventListener('click', () => {
        selectBucketsByStage('air');
    });
    
    document.getElementById('compactClearBucketSelectionBtn')?.addEventListener('click', () => {
        state.selectedBucketIds.clear();
        addLog("🔄 Выбор вёдер снят");
        render();
    });
}

// ========== ИГРОВОЙ ТАЙМЕР ==========

function startGameTimer() {
    setInterval(() => {
        if (state.isRunning) {
            // Увеличиваем игровой день
            state.gameDay = roundResource(state.gameDay + TIME_SETTINGS.DAY_INCREMENT);
            
            // Обновляем прогресс всех контейнеров и вёдер
            updateProgress();
            
            // Автоматическое сохранение
            saveToLocalStorage();
            
            // Сообщение о новом дне (когда день целый)
            if (Number.isInteger(state.gameDay) && state.gameDay > 0) {
                addLog(`📆 Наступил день ${state.gameDay}`);
            }
        }
    }, TIME_SETTINGS.TICK_INTERVAL);
}

// ========== УПРАВЛЕНИЕ ПАУЗОЙ ==========

function toggleGamePause() {
    state.isRunning = !state.isRunning;
    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) {
        pauseBtn.innerHTML = state.isRunning ? '<span>⏸️</span> ПАУЗА' : '<span>▶️</span> СТАРТ';
    }
    addLog(state.isRunning ? "▶️ Игра возобновлена" : "⏸️ Игра на паузе");
    render();
}

// ========== ЭКСПОРТ ФУНКЦИЙ ДЛЯ ГЛОБАЛЬНОГО ДОСТУПА ==========

// Делаем функции доступными глобально для вызова из HTML и консоли
window.toggleGamePause = toggleGamePause;
window.addOneSeedToBucket = addOneSeedToBucket;
window.addFourSeedsToBucket = addFourSeedsToBucket;
window.startSoaking = startSoaking;
window.startAiring = startAiring;
window.startSowing = startSowing;
window.moveToPress = moveToPress;
window.moveToLight = moveToLight;
window.harvestSelected = harvestSelected;
window.deleteSelected = deleteSelected;
window.spraySelected = spraySelected;
window.waterSelected = waterSelected;
window.addWater = addWater;
window.addSolution = addSolution;
window.addSeeds = addSeeds;
window.selectAll = selectAll;
window.clearSelection = clearSelection;
window.selectAllFreeBuckets = selectAllFreeBuckets;
window.selectBucketsByStage = selectBucketsByStage;
window.smartMoveToPress = smartMoveToPress;
window.smartMoveToLight = smartMoveToLight;

// ========== ОТЛАДОЧНЫЕ ФУНКЦИИ ==========

function debugState() {
    console.log('=== СОСТОЯНИЕ ФЕРМЫ ===');
    console.log('День:', state.gameDay);
    console.log('Ресурсы:', {
        вода: state.water,
        раствор: state.solution,
        семена: state.seeds
    });
    console.log('Вёдра:', state.buckets);
    console.log('Контейнеры:', state.containers.length);
    console.log('Выделенные вёдра:', Array.from(state.selectedBucketIds));
    console.log('Выделенные контейнеры:', Array.from(state.selectedIds));
    console.log('Достижения:', state.stats.achievements);
}

function resetGame() {
    if (confirm('Сбросить всю игру? Это действие нельзя отменить!')) {
        localStorage.removeItem('farmState');
        location.reload();
    }
}

function addDebugResources() {
    state.water = roundResource(state.water + 50);
    state.solution = roundResource(state.solution + 50);
    state.seeds = roundResource(state.seeds + 50);
    addLog("🧪 Отладка: +50 всех ресурсов");
    saveToLocalStorage();
    render();
}

window.debugState = debugState;
window.resetGame = resetGame;
window.addDebugResources = addDebugResources;