import { store } from './store/index.js';
import { timeService } from './services/timeService.js';
import { persistenceService } from './services/persistenceService.js';
import { achievementService } from './services/achievementService.js';
import { eventBus } from './services/eventBus.js';
import { initButtonHandlers } from './handlers/buttonHandlers.js';
import { initKeyboardHandlers } from './handlers/keyboardHandlers.js';
import { initZoneClickHandlers } from './handlers/zoneClickHandlers.js';

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
    store.addLog("🚀 Ферма запущена");

    persistenceService.autoSave();
    timeService.start();

    initButtonHandlers();
    initKeyboardHandlers();
    initZoneClickHandlers();

    document.getElementById('pauseBtn')?.addEventListener('click', () => {
        timeService.toggle();
        store.addLog(timeService.isRunning ? '▶️ Игра запущена' : '⏸️ Игра на паузе');
    });

    document.getElementById('resetGameBtn')?.addEventListener('click', () => {
        if (confirm('Сбросить всю игру? Это действие нельзя отменить!')) {
            localStorage.removeItem('farmState');
            location.reload();
        }
    });
});

console.log('✅ Main.js loaded');