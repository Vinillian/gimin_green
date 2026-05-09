import { store } from '../store/index.js';

export function renderLog() {
    const logPanel = document.getElementById('logPanel');
    if (!logPanel) return;
    
    if (store.log && store.log.length > 0) {
        // Убран лишний префикс 📋, так как он уже может быть в сообщениях
        logPanel.innerHTML = store.log.slice(0, 10).join('<br>');
    } else {
        logPanel.innerHTML = 'Добро пожаловать в ферму!';
    }
}