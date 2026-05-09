import { store } from '../store/index.js';
import { STAGE_DURATION } from '../../constants.js';

export function renderBuckets() {
    console.log('🪣 renderBuckets called', store.buckets.length);
    
    const container = document.getElementById('bucketsCompactContainer');
    if (!container) {
        console.error('bucketsCompactContainer not found!');
        return;
    }

    container.innerHTML = '';
    
    store.buckets.forEach(bucket => {
        const el = document.createElement('div');
        el.className = `bucket ${bucket.stage ? 'active' : ''} ${store.selectedBucketIds.has(bucket.id) ? 'selected' : ''}`;
        el.dataset.id = bucket.id;

        let icon = '🪣';
        if (bucket.stage === 'soak') icon = '💧';
        else if (bucket.stage === 'air') icon = '🌬';

        let progress = 0;
        if (bucket.stage && bucket.stageStartDay !== null) {
            progress = ((store.gameDay - bucket.stageStartDay) / STAGE_DURATION[bucket.stage]) * 100;
            progress = Math.min(100, Math.max(0, progress));
        }
        
        const status = bucket.needsTransition ? '⚠️' : '';

        el.innerHTML = `
            <div class="bucket-icon">${icon}</div>
            <div class="bucket-count">${bucket.seeds || 0}🌱</div>
            <div class="progress-container"><div class="progress-fill" style="width:${progress}%"></div></div>
            <div class="bucket-status">${status}</div>
        `;

        el.addEventListener('click', (e) => {
            e.stopPropagation();
            if (e.ctrlKey || e.shiftKey || store.multiselectModifier) {
                store.toggleBucketSelection(bucket.id);
            } else {
                store.selectedBucketIds.clear();
                store.selectedContainerIds.clear();
                store.selectedBucketIds.add(bucket.id);
                store.notify();
            }
        });

        container.appendChild(el);
    });

    const totalSeeds = store.buckets.reduce((sum, b) => sum + (b.seeds || 0), 0);
    const totalSeedsEl = document.getElementById('totalSeedsInBuckets');
    if (totalSeedsEl) totalSeedsEl.innerText = totalSeeds;
    
    console.log('✅ Buckets rendered:', store.buckets.length);
}