import { store } from '../store/index.js';

export function initZoneClickHandlers() {
    console.log('🖱️ Initializing zone click handlers');

    const selectAllBtn = document.getElementById('selectAllBtn');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', () => {
            const ids = store.containers.map(c => c.id);
            store.selectContainers(ids);
            store.addLog(`🔲 Выбраны все контейнеры (${ids.length})`);
        });
    }

    const tableZone = document.getElementById('tableZoneHeader');
    if (tableZone) {
        tableZone.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            const ids = store.containers.filter(c => c.location === 'table').map(c => c.id);
            store.selectContainers(ids);
            store.addLog(`🔲 Выбраны все контейнеры на столе (${ids.length})`);
        });
    }

    document.querySelectorAll('.shelf-header').forEach((header, index) => {
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            const shelf = store.shelves[index];
            if (shelf) {
                store.selectContainers(shelf.containers);
                store.addLog(`🔲 Выбраны все контейнеры на полке ${index + 1} (${shelf.containers.length})`);
            }
        });
    });

    document.querySelectorAll('.pallet-header').forEach((header, index) => {
        header.addEventListener('click', (e) => {
            e.stopPropagation();
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

    const lightZone = document.getElementById('lightZoneHeader');
    if (lightZone) {
        lightZone.addEventListener('click', () => {
            const ids = store.containers.filter(c => c.location === 'light').map(c => c.id);
            store.selectContainers(ids);
            store.addLog(`🔲 Выбраны все контейнеры на свету (${ids.length})`);
        });
    }

    const pressZone = document.getElementById('pressZoneHeader');
    if (pressZone) {
        pressZone.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            const ids = store.containers.filter(c => c.location === 'shelf').map(c => c.id);
            store.selectContainers(ids);
            store.addLog(`🔲 Выбраны все контейнеры в прижиме (${ids.length})`);
        });
    }

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