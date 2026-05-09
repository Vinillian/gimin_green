import { store } from '../store/index.js';
import { CAPACITY } from '../../constants.js';
import { eventBus } from '../services/eventBus.js';

export const containerController = {
  moveToPress(containerIds) {
    // Берём контейнеры, которые на столе и готовы к переходу
    const candidates = containerIds
      .map(id => store.getContainer(id))
      .filter(c => c && c.location === 'table' && c.needsTransition);
    
    if (candidates.length === 0) return false;

    // Получаем свободные места на полках
    const shelfSpace = store.shelves.map(shelf => ({ 
      shelf, 
      free: shelf.freeSpace 
    }));
    const totalFree = shelfSpace.reduce((acc, s) => acc + s.free, 0);
    
    if (totalFree === 0) {
      store.addLog('❌ Нет свободных мест на полках');
      return false;
    }

    // Сколько можем переместить (не больше, чем есть кандидатов и мест)
    const toMoveCount = Math.min(candidates.length, totalFree);
    const moved = [];

    for (let i = 0; i < toMoveCount; i++) {
      const container = candidates[i];
      // Ищем первую полку со свободным местом
      const target = shelfSpace.find(s => s.free > 0);
      if (!target) break;

      container.moveTo('shelf', 'press', store.gameDay);
      container.locationId = target.shelf.id;
      target.shelf.addContainer(container.id);
      target.free--;
      moved.push(container.id);
    }

    // Удаляем перемещённые из стола
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
    const containers = containerIds
      .map(id => store.getContainer(id))
      .filter(c => c && c.location === 'shelf' && c.needsTransition);
    if (containers.length === 0) return false;

    const containersOnLight = store.containers.filter(c => c.location === 'light').length;
    const availableSpace = CAPACITY.LIGHT_CAPACITY - containersOnLight;
    if (containers.length > availableSpace) {
      store.addLog(`❌ Недостаточно места на свету (свободно ${availableSpace})`);
      return false;
    }

    const lightNumbers = new Set(store.containers.filter(c => c.location === 'light').map(c => c.number));
    const moved = [];
    for (let container of containers) {
      let number = 1;
      while (lightNumbers.has(number)) number++;
      lightNumbers.add(number);
      const shelfId = container.locationId;
      container.moveTo('light', 'light', store.gameDay, number);
      const shelf = store.getShelf(shelfId);
      if (shelf) shelf.removeContainer(container.id);
      moved.push(container.id);
    }

    store.notify();
    store.addLog(`💡 Перемещено на свет: ${moved.length} контейнеров`);
    eventBus.emit('containers:moved', { to: 'light', ids: moved });
    return true;
  },

  spray(containerIds) {
    const containers = containerIds.map(id => store.getContainer(id)).filter(c => c?.needsSpray);
    if (containers.length === 0) {
      store.addLog('❌ Нет контейнеров, нуждающихся в опрыскивании');
      return false;
    }

    const costPer = 0.05; // RESOURCE_COSTS.spray
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

    const costPer = 0.2; // RESOURCE_COSTS.water
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