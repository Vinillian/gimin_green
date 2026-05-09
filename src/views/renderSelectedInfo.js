import { store } from '../store/index.js';

export function renderSelectedInfo() {
    const selectedInfo = document.getElementById('selectedInfoBottom');
    if (!selectedInfo) return;

    if (store.selectedBucketIds.size > 0) {
        const bucketInfo = [];
        store.selectedBucketIds.forEach(id => {
            const bucket = store.getBucket(id);
            if (bucket) {
                let status = '';
                if (bucket.stage === 'soak') status = ' (💧)';
                else if (bucket.stage === 'air') status = ' (🌬)';
                let timeInfo = '';
                if (bucket.stageStartTime) {
                    const startDate = new Date(bucket.stageStartTime);
                    timeInfo = ` с ${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()}`;
                }
                bucketInfo.push(`#${bucket.id}${status}:${bucket.seeds || 0}🌱${timeInfo}`);
            }
        });
        selectedInfo.innerHTML = `✅ Вёдра: ${bucketInfo.join(', ')}`;
        return;
    }

    if (store.selectedContainerIds.size > 0) {
        const selectedItems = [];
        store.selectedContainerIds.forEach(id => {
            const c = store.getContainer(id);
            if (c) {
                let location = '';
                if (c.location === 'table') location = ' (стол)';
                else if (c.location === 'shelf') location = ` (полка ${c.locationId})`;
                else if (c.location === 'light') location = ' (свет)';
                let timeInfo = '';
                if (c.stageStartTime) {
                    const startDate = new Date(c.stageStartTime);
                    timeInfo = ` с ${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()}`;
                }
                selectedItems.push(`#${c.number}${location}${timeInfo}`);
            }
        });
        selectedInfo.innerHTML = `✅ ${selectedItems.join(', ')}`;
    } else {
        selectedInfo.innerHTML = '👆 Нажми на контейнер или ведро (Ctrl+клик для нескольких)';
    }
}