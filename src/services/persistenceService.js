import { store } from '../store/index.js';
import { eventBus } from './eventBus.js';

class PersistenceService {
  save() {
    try {
      localStorage.setItem('farmState', JSON.stringify(store.toJSON()));
    } catch(e) {
      console.error('Ошибка сохранения:', e);
    }
  }

  load() {
    try {
      const saved = localStorage.getItem('farmState');
      if (saved) {
        const data = JSON.parse(saved);
        store.fromJSON(data);
      }
    } catch(e) {
      console.error('Ошибка загрузки:', e);
    }
  }

  autoSave() {
    // Сохраняем при каждом изменении
    store.subscribe(() => this.save());
  }
}

export const persistenceService = new PersistenceService();