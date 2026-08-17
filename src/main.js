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

    // Обновить прогресс вручную
    document.getElementById('devForceUpdate')?.addEventListener('click', () => {
        store.updateAllProgress(Date.now());
        store.notify();
        store.addLog('🔄 Прогресс обновлён');
    });

    // Полный сброс
    document.getElementById('devResetAll')?.addEventListener('click', () => devController.resetAll());
}

console.log('✅ Main.js loaded');