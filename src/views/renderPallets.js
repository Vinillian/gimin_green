import { store } from '../store/index.js';
import { createContainerCard } from './containerCard.js';

export function renderPallets() {
    console.log('📦 renderPallets called');
    
    const grid1 = document.getElementById('containerGrid1');
    const grid2 = document.getElementById('containerGrid2');
    
    if (!grid1 || !grid2) {
        console.error('Pallet grids not found!');
        return;
    }

    grid1.innerHTML = '';
    grid2.innerHTML = '';

    const lightContainers = store.containers
        .filter(c => c.location === 'light')
        .sort((a, b) => a.number - b.number);

    const containers1 = lightContainers.filter(c => c.number <= 8);
    const containers2 = lightContainers.filter(c => c.number > 8);

    // Первый поддон (1-8)
    for (let i = 1; i <= 8; i++) {
        const container = containers1.find(c => c.number === i);
        if (container) {
            grid1.appendChild(createContainerCard(container));
        } else {
            const emptyCard = document.createElement('div');
            emptyCard.className = 'container-card empty';
            emptyCard.innerHTML = `<div class="container-number">#${i}</div>`;
            grid1.appendChild(emptyCard);
        }
    }

    // Второй поддон (9-16)
    for (let i = 9; i <= 16; i++) {
        const container = containers2.find(c => c.number === i);
        if (container) {
            grid2.appendChild(createContainerCard(container));
        } else {
            const emptyCard = document.createElement('div');
            emptyCard.className = 'container-card empty';
            emptyCard.innerHTML = `<div class="container-number">#${i}</div>`;
            grid2.appendChild(emptyCard);
        }
    }

    // Обновление счётчиков готовности
    const ready1 = containers1.filter(c => c.stage === 'light' && c.needsTransition).length;
    const ready2 = containers2.filter(c => c.stage === 'light' && c.needsTransition).length;
    
    const readyCount1 = document.getElementById('readyCount1');
    const readyCount2 = document.getElementById('readyCount2');
    
    if (readyCount1) readyCount1.innerText = ready1;
    if (readyCount2) readyCount2.innerText = ready2;
    
    console.log('✅ Pallets rendered:', lightContainers.length, 'containers');
}