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
    const startDay = store.gameDay;

    const removedIds = [];
    containers.forEach(c => {
      if (store.removeContainer(c.id)) removedIds.push(c.id);
    });

    store.table.containers = store.table.containers.filter(id => !removedIds.includes(id));
    store.shelves.forEach(shelf => {
      shelf.containers = shelf.containers.filter(id => !removedIds.includes(id));
    });

    store.stats.totalHarvested += harvestedCount;

    const cycleTime = store.gameDay - startDay;
    if (store.stats.fastestCycle === null || cycleTime < store.stats.fastestCycle) {
      store.stats.fastestCycle = cycleTime;
    }

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