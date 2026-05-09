import { store } from '../store/index.js';

export function initZoneClickHandlers() {
    console.log('🖱️ Initializing zone click handlers');

    // Стол посева
    const tableZone = document.getElementById('tableZoneHeader');
    if (tableZone) {
        tableZone.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') return; // игнорируем клики по кнопкам
            const ids = store.containers.filter(c => c.location === 'table').map(c => c.id);
            store.selectContainers(ids);
            store.addLog(`🔲 Выбраны все контейнеры на столе (${ids.length})`);
        });
    }

    // Полки
    document.querySelectorAll('.shelf-header').forEach((header, index) => {
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            if (e.target.tagName === 'BUTTON') return; // игнорируем кнопки
            const shelf = store.shelves[index];
            if (shelf) {
                store.selectContainers(shelf.containers);
                store.addLog(`🔲 Выбраны все контейнеры на полке ${index + 1} (${shelf.containers.length})`);
            }
        });
    });

    // Поддоны
    document.querySelectorAll('.pallet-header').forEach((header, index) => {
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            if (e.target.tagName === 'BUTTON') return;
            const palletNumber = index + 1;
            const start = (palletNumber - 1) * 8 + 1;
            const end = palletNumber * 8;
            const ids = store.containers
                .filter(c => c.location === 'light' && c.number >= start && c.number <= end)
                .map(c => c.id);
            store.selectContainers(ids);
            store.addLog(`🔲 Выбраны все контейнеры на поддоне ${palletNumber} (${ids.length})`);
        });
    });

    // Зона света (заголовок)
    const lightZone = document.getElementById('lightZoneHeader');
    if (lightZone) {
        lightZone.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') return; // ← важно для кнопок внутри
            const ids = store.containers.filter(c => c.location === 'light').map(c => c.id);
            store.selectContainers(ids);
            store.addLog(`🔲 Выбраны все контейнеры на свету (${ids.length})`);
        });
    }

    // Зона прижима (заголовок)
    const pressZone = document.getElementById('pressZoneHeader');
    if (pressZone) {
        pressZone.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            const ids = store.containers.filter(c => c.location === 'shelf').map(c => c.id);
            store.selectContainers(ids);
            store.addLog(`🔲 Выбраны все контейнеры в прижиме (${ids.length})`);
        });
    }

    // Вёдра (заголовок)
    const bucketsZone = document.getElementById('bucketsZoneHeader');
    if (bucketsZone) {
        bucketsZone.addEventListener('click', () => {
            const ids = store.buckets.map(b => b.id);
            store.selectBuckets(ids);
            store.addLog(`🔲 Выбраны все вёдра (${ids.length})`);
        });
    }

    console.log('✅ Zone click handlers initialized');
}