import { store } from '../store/index.js';
import { CAPACITY, RESOURCE_COSTS } from '../../constants.js';
import { eventBus } from '../services/eventBus.js';

export const containerController = {
  moveToPress(containerIds) {
    const candidates = containerIds
      .map(id => store.getContainer(id))
      .filter(c => c && c.location === 'table' && c.needsTransition);
    
    if (candidates.length === 0) return false;

    const shelfSpace = store.shelves.map(shelf => ({ 
      shelf, 
      free: shelf.freeSpace 
    }));
    const totalFree = shelfSpace.reduce((acc, s) => acc + s.free, 0);
    
    if (totalFree === 0) {
      store.addLog('❌ Нет свободных мест на полках');
      return false;
    }

    const toMoveCount = Math.min(candidates.length, totalFree);
    const moved = [];

    for (let i = 0; i < toMoveCount; i++) {
      const container = candidates[i];
      const target = shelfSpace.find(s => s.free > 0);
      if (!target) break;

      // Передаём locationId = target.shelf.id
      container.moveTo('shelf', 'press', store.gameDay, target.shelf.id);
      target.shelf.addContainer(container.id);
      target.free--;
      moved.push(container.id);
    }

    store.table.containers = store.table.containers.filter(id => !moved.includes(id));
    
    store.notify();
    if (moved.length > 0) {
      store.addLog(`📦 Перемещено на прижим: ${moved.length} контейнеров`);
    } else {
      store.addLog('❌ Не удалось переместить ни одного контейнера');
    }
    eventBus.emit('containers:moved', { to: 'press', ids: moved });
    return moved.length > 0;
  },

  moveToLight(containerIds) {
    const candidates = containerIds
      .map(id => store.getContainer(id))
      .filter(c => c && c.location === 'shelf' && c.needsTransition);
    
    if (candidates.length === 0) {
      store.addLog('❌ Нет готовых контейнеров на полках');
      return false;
    }

    const containersOnLight = store.containers.filter(c => c.location === 'light').length;
    const availableSpace = CAPACITY.LIGHT_CAPACITY - containersOnLight;
    
    if (availableSpace === 0) {
      store.addLog('❌ Нет свободного места на свету');
      return false;
    }

    const toMoveCount = Math.min(candidates.length, availableSpace);
    const lightNumbers = new Set(store.containers.filter(c => c.location === 'light').map(c => c.number));
    const moved = [];

    for (let i = 0; i < toMoveCount; i++) {
      const container = candidates[i];
      let number = 1;
      while (lightNumbers.has(number)) number++;
      lightNumbers.add(number);
      
      const shelfId = container.locationId;
      container.moveTo('light', 'light', store.gameDay, null, number); // locationId не нужен для света, передаём null
      
      const shelf = store.getShelf(shelfId);
      if (shelf) shelf.removeContainer(container.id);
      
      moved.push(container.id);
    }

    store.notify();
    if (moved.length > 0) {
      store.addLog(`💡 Перемещено на свет: ${moved.length} контейнеров`);
    } else {
      store.addLog('❌ Не удалось переместить ни одного контейнера');
    }
    eventBus.emit('containers:moved', { to: 'light', ids: moved });
    return moved.length > 0;
  },

  spray(containerIds) {
    const containers = containerIds.map(id => store.getContainer(id)).filter(c => c?.needsSpray);
    if (containers.length === 0) {
      store.addLog('❌ Нет контейнеров, нуждающихся в опрыскивании');
      return false;
    }

    const costPer = RESOURCE_COSTS.spray; // используем константу
    const totalCost = containers.length * costPer;
    if (!store.resources.hasWater(totalCost)) {
      store.addLog(`❌ Недостаточно воды (нужно ${totalCost.toFixed(2)})`);
      return false;
    }

    store.resources.useWater(totalCost);
    store.stats.totalWaterUsed += totalCost;
    containers.forEach(c => c.spray(Math.floor(store.gameDay)));
    store.notify();
    store.addLog(`💦 Опрыскано контейнеров: ${containers.length}`);
    return true;
  },

  water(containerIds) {
    const containers = containerIds.map(id => store.getContainer(id)).filter(c => c?.stage === 'light' && c.needsWater);
    if (containers.length === 0) {
      store.addLog('❌ Нет контейнеров, нуждающихся в поливе');
      return false;
    }

    const costPer = RESOURCE_COSTS.water; // используем константу
    const totalCost = containers.length * costPer;
    if (!store.resources.hasWater(totalCost)) {
      store.addLog(`❌ Недостаточно воды (нужно ${totalCost.toFixed(2)})`);
      return false;
    }

    store.resources.useWater(totalCost);
    store.stats.totalWaterUsed += totalCost;
    containers.forEach(c => c.water(Math.floor(store.gameDay)));
    store.notify();
    store.addLog(`💧 Полито контейнеров: ${containers.length}`);
    return true;
  }
};