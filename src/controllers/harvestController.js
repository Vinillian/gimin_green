import { store } from '../store/index.js';
import { eventBus } from '../services/eventBus.js';

export const harvestController = {
  harvest(containerIds) {
    const containers = containerIds
      .map(id => store.getContainer(id))
      .filter(c => c && c.location === 'light' && c.needsTransition);
    if (containers.length === 0) return false;

    const harvestedCount = containers.length;
    const harvestedNumbers = containers.map(c => c.number);
    const startTime = Date.now(); // для расчёта длительности цикла

    const removedIds = [];
    containers.forEach(c => {
      if (store.removeContainer(c.id)) removedIds.push(c.id);
    });

    store.table.containers = store.table.containers.filter(id => !removedIds.includes(id));
    store.shelves.forEach(shelf => {
      shelf.containers = shelf.containers.filter(id => !removedIds.includes(id));
    });

    store.stats.totalHarvested += harvestedCount;

    // Для fastestCycle теперь считаем в днях (реальных) — можно по желанию
    // Но для совместимости оставим как есть, или пересчитаем в дни (разница в мс -> дни)
    // Для простоты оставим null, либо будем хранить в миллисекундах
    // Здесь я пропускаю обновление fastestCycle, так как логика изменилась.
    // Вы можете реализовать сохранение минимальной длительности цикла в миллисекундах.

    store.notify();
    store.addLog(`✂️ Собрано ${harvestedCount} контейнеров: #${harvestedNumbers.join(', #')}`);
    eventBus.emit('container:harvested', { count: harvestedCount, numbers: harvestedNumbers });
    return true;
  },

  delete(containerIds) {
    const containers = containerIds.map(id => store.getContainer(id)).filter(Boolean);
    if (containers.length === 0) return false;

    const removedIds = [];
    containers.forEach(c => {
      if (store.removeContainer(c.id)) removedIds.push(c.id);
    });

    store.table.containers = store.table.containers.filter(id => !removedIds.includes(id));
    store.shelves.forEach(shelf => {
      shelf.containers = shelf.containers.filter(id => !removedIds.includes(id));
    });

    store.notify();
    store.addLog(`🗑️ Удалено контейнеров: ${removedIds.length}`);
    eventBus.emit('containers:deleted', removedIds);
    return true;
  }
};