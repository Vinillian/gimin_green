import { store } from './store/index.js';
import { timeService } from './services/timeService.js';
import { persistenceService } from './services/persistenceService.js';
import { achievementService } from './services/achievementService.js';
import { eventBus } from './services/eventBus.js';
import { initButtonHandlers } from './handlers/buttonHandlers.js';
import { initKeyboardHandlers } from './handlers/keyboardHandlers.js';
import { initZoneClickHandlers } from './handlers/zoneClickHandlers.js';
import { devController } from './controllers/devController.js';

// Импортируем функции рендера
import { renderBuckets } from './views/renderBuckets.js';
import { renderTable } from './views/renderTable.js';
import { renderShelves } from './views/renderShelves.js';
import { renderPallets } from './views/renderPallets.js';
import { renderResources } from './views/renderResources.js';
import { renderLog } from './views/renderLog.js';
import { renderSelectedInfo } from './views/renderSelectedInfo.js';

function fullRender() {
    renderBuckets();
    renderTable();
    renderShelves();
    renderPallets();
    renderResources();
    renderSelectedInfo();
    renderLog();
}

store.subscribe(() => {
    fullRender();
});

persistenceService.load();

document.addEventListener('DOMContentLoaded', () => {
    fullRender();
    store.addLog("🚀 Ферма запущена (ручной DEV-режим)");

    persistenceService.autoSave();
    timeService.start();

    initButtonHandlers();
    initKeyboardHandlers();
    initZoneClickHandlers();
    initDevHandlers();
    initDevPanelDrag(); // инициализация перетаскивания

    document.getElementById('pauseBtn')?.addEventListener('click', () => {
        timeService.toggle();
        store.addLog(timeService.isRunning ? '▶️ Обновление включено' : '⏸️ Обновление на паузе');
    });

    document.getElementById('resetGameBtn')?.addEventListener('click', () => {
        devController.resetAll();
    });
});

function initDevHandlers() {
    // Показать/скрыть панель
    document.getElementById('toggleDevBtn')?.addEventListener('click', () => {
        const panel = document.getElementById('devPanel');
        panel?.classList.toggle('visible');
    });

    // Контейнеры: стадии и зоны
    document.getElementById('devCStageSow')?.addEventListener('click', () => devController.setSelectedContainersStage('sow', 'table'));
    document.getElementById('devCStagePress')?.addEventListener('click', () => devController.setSelectedContainersStage('press', 'shelf'));
    document.getElementById('devCStageLight')?.addEventListener('click', () => devController.setSelectedContainersStage('light', 'light'));

    // Удаление выбранных элементов (контейнеров и вёдер)
    document.getElementById('devDeleteSelected')?.addEventListener('click', () => devController.deleteSelectedItems());

    // Вёдра
    document.getElementById('devBStageSoak')?.addEventListener('click', () => devController.setSelectedBucketsStage('soak'));
    document.getElementById('devBStageAir')?.addEventListener('click', () => devController.setSelectedBucketsStage('air'));
    document.getElementById('devBSow')?.addEventListener('click', () => devController.forceSowSelectedBucket());
    document.getElementById('devBClear')?.addEventListener('click', () => devController.clearSelectedBuckets());

    // Ресурсы
    document.getElementById('devAddWater')?.addEventListener('click', () => devController.addResources(100, 0, 0));
    document.getElementById('devAddSolution')?.addEventListener('click', () => devController.addResources(0, 100, 0));
    document.getElementById('devAddSeeds')?.addEventListener('click', () => devController.addResources(0, 0, 100));

    // Подогнать время (выбранные контейнеры/вёдра)
    document.getElementById('devAdvance1h')?.addEventListener('click', () => devController.advanceSelectedTime(1));
    document.getElementById('devAdvance6h')?.addEventListener('click', () => devController.advanceSelectedTime(6));
    document.getElementById('devAdvance12h')?.addEventListener('click', () => devController.advanceSelectedTime(12));

    // Обновить прогресс вручную
    document.getElementById('devForceUpdate')?.addEventListener('click', () => {
        store.updateAllProgress(Date.now());
        store.notify();
        store.addLog('🔄 Прогресс обновлён');
    });

    // Полный сброс
    document.getElementById('devResetAll')?.addEventListener('click', () => devController.resetAll());
}

// Функция перетаскивания панели за заголовок
function initDevPanelDrag() {
    const panel = document.getElementById('devPanel');
    const header = document.getElementById('devPanelHeader');
    if (!panel || !header) return;

    let isDragging = false;
    let offsetX, offsetY;

    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = panel.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        let newLeft = e.clientX - offsetX;
        let newTop = e.clientY - offsetY;

        // Ограничение в пределах окна (по желанию)
        newLeft = Math.max(0, Math.min(window.innerWidth - panel.offsetWidth, newLeft));
        newTop = Math.max(0, Math.min(window.innerHeight - 50, newTop));

        panel.style.left = newLeft + 'px';
        panel.style.top = newTop + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

console.log('✅ Main.js loaded');