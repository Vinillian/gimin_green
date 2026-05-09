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

// Функция для полного обновления UI
function fullRender() {
    console.log('🔄 Full render called', store.gameDay);
    renderBuckets();
    renderTable();
    renderShelves();
    renderPallets();
    renderResources();
    renderSelectedInfo();
    renderLog();
}

// Подписка на изменения store
store.subscribe(() => {
    fullRender();
});

// Загрузка сохранения
persistenceService.load();

// Принудительный первый рендер
setTimeout(() => {
    fullRender();
    store.addLog("🚀 Ферма запущена");
}, 100);

// Запуск автосохранения
persistenceService.autoSave();

// Запуск таймера
timeService.start();

// Инициализация обработчиков
setTimeout(() => {
    initButtonHandlers();
    initKeyboardHandlers();
    initZoneClickHandlers();
}, 200);

// Обработчики для кнопок, которые не входят в модули (пауза, сброс игры, новая кнопка "ВСЕ" на свету)
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

// Для отладки
window.store = store;
window.debug = {
    render: fullRender,
    addContainer: () => {
        store.resources.addSeeds(10);
        store.resources.addWater(20);
        store.resources.addSolution(10);
        fullRender();
        console.log('Debug: resources added');
    }
};

console.log('✅ Main.js loaded');