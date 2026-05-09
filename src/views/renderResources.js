import { store } from '../store/index.js';

export function renderResources() {
    const waterEl = document.getElementById('waterCount');
    const solutionEl = document.getElementById('solutionCount');
    const seedsEl = document.getElementById('seedCount');
    const containersEl = document.getElementById('totalContainers');
    const dayEl = document.getElementById('currentDay');

    if (waterEl) waterEl.innerText = (store.resources.water || 0).toFixed(1);
    if (solutionEl) solutionEl.innerText = (store.resources.solution || 0).toFixed(1);
    if (seedsEl) seedsEl.innerText = (store.resources.seeds || 0).toFixed(1);
    if (containersEl) containersEl.innerText = store.containers.length;
    if (dayEl) dayEl.innerText = (store.gameDay || 0).toFixed(1);
    
    // console.log('📊 Resources rendered');
}