import { store } from '../store/index.js';
import { createContainerCard } from './containerCard.js';

export function renderTable() {
    console.log('🌱 renderTable called');
    
    const container = document.getElementById('tableContainer');
    if (!container) {
        console.error('tableContainer not found!');
        return;
    }

    container.innerHTML = '';
    
    const tableContainers = store.containers
        .filter(c => c.location === 'table')
        .sort((a, b) => a.number - b.number);

    tableContainers.forEach(c => container.appendChild(createContainerCard(c)));

    // Заполняем пустые ячейки
    for (let i = tableContainers.length; i < 8; i++) {
        const empty = document.createElement('div');
        empty.className = 'table-cell empty';
        empty.innerHTML = '🌱';
        container.appendChild(empty);
    }
    
    console.log('✅ Table rendered:', tableContainers.length, 'containers');
}