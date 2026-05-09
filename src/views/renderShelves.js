import { store } from '../store/index.js';
import { createContainerCard } from './containerCard.js';

export function renderShelves() {
    console.log('📚 renderShelves called');
    
    for (let shelfId = 1; shelfId <= 3; shelfId++) {
        const shelfContainer = document.getElementById(`shelf${shelfId}Container`);
        if (!shelfContainer) continue;

        shelfContainer.innerHTML = '';
        
        const shelf = store.getShelf(shelfId);
        if (!shelf) continue;

        const shelfContainers = store.containers
            .filter(c => shelf.containers.includes(c.id))
            .sort((a, b) => a.number - b.number);

        shelfContainers.forEach(c => shelfContainer.appendChild(createContainerCard(c)));

        // Заполняем пустые ячейки
        for (let i = shelfContainers.length; i < 4; i++) {
            const empty = document.createElement('div');
            empty.className = 'shelf-cell empty';
            empty.innerHTML = '📦';
            shelfContainer.appendChild(empty);
        }
    }
    
    console.log('✅ Shelves rendered');
}