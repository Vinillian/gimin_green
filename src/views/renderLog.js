import { store } from '../store/index.js';

export function renderLog() {
    const logPanel = document.getElementById('logPanel');
    if (!logPanel) return;
    
    if (store.log && store.log.length > 0) {
        logPanel.innerHTML = '📋 ' + store.log.slice(0, 5).join('<br>📋 ');
    } else {
        logPanel.innerHTML = '📋 Добро пожаловать в ферму!';
    }
}