import { store } from '../store/index.js';
import { STAGE_DURATION_REAL, STAGE_ICONS } from '../../constants.js';

export function createContainerCard(container) {
    if (!container) return document.createElement('div');
    
    const card = document.createElement('div');
    card.className = `container-card ${container.stage || ''} ${store.selectedContainerIds.has(container.id) ? 'selected' : ''}`;
    card.dataset.id = container.id;

    const now = Date.now();
    const progress = container.getProgressPercent(now);
    const durationMs = STAGE_DURATION_REAL[container.stage] || 0;
    let dayText = '';
    if (durationMs === 0) {
        dayText = '⚡';
    } else {
        const elapsedMs = now - container.stageStartTime;
        const daysPassed = Math.floor(elapsedMs / (1000 * 3600 * 24));
        const totalDays = Math.floor(durationMs / (1000 * 3600 * 24));
        dayText = `${daysPassed + 1}/${totalDays}`;
    }

    const icons = [];
    icons.push(STAGE_ICONS[container.stage] || '📦');
    if (container.needsSpray) icons.push('💦');
    if (container.needsWater) icons.push('🚰');
    if (container.needsTransition) icons.push('⚠️');

    card.innerHTML = `
        <div class="container-number">#${container.number || '?'}</div>
        <div class="container-icons">${icons.join('')}</div>
        <div class="progress-container"><div class="progress-fill" style="width:${progress}%"></div></div>
        <div class="container-day">${dayText}</div>
    `;

    card.addEventListener('click', (e) => {
        e.stopPropagation();
        if (e.ctrlKey || e.shiftKey || store.multiselectModifier) {
            store.toggleContainerSelection(container.id);
        } else {
            store.selectedContainerIds.clear();
            store.selectedBucketIds.clear();
            store.selectedContainerIds.add(container.id);
            store.notify();
        }
    });

    return card;
}