import { store } from '../store/index.js';
import { bucketController } from '../controllers/bucketController.js';

export function initKeyboardHandlers() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Control' || e.key === 'Shift') {
      store.multiselectModifier = true;
    }

    // Горячие клавиши
    if (e.key === '1' && e.ctrlKey) {
      e.preventDefault();
      if (store.selectedBucketIds.size > 0) {
        store.selectedBucketIds.forEach(id => bucketController.addSeeds(id, 1));
      } else {
        store.addLog('⚠️ Сначала выбери вёдра');
      }
    } else if (e.key === '4' && e.ctrlKey) {
      e.preventDefault();
      if (store.selectedBucketIds.size > 0) {
        store.selectedBucketIds.forEach(id => bucketController.addSeeds(id, 4));
      } else {
        store.addLog('⚠️ Сначала выбери вёдра');
      }
    }
    // можно добавить другие сочетания
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'Control' || e.key === 'Shift') {
      store.multiselectModifier = false;
    }
  });
}