import { store } from '../store/index.js';
import { Container } from '../models/Container.js';
import { RESOURCE_COSTS, CAPACITY } from '../../constants.js';
import { eventBus } from '../services/eventBus.js';

export const bucketController = {
  addSeeds(bucketId, count) {
    const bucket = store.getBucket(bucketId);
    if (!bucket || bucket.stage !== null) return false;

    const canAdd = CAPACITY.MAX_SEEDS_PER_BUCKET - bucket.seeds;
    const toAdd = Math.min(count, canAdd);
    if (toAdd <= 0) return false;

    const seedsNeeded = RESOURCE_COSTS.soak.seeds * toAdd;
    if (!store.resources.hasSeeds(seedsNeeded)) return false;

    store.resources.useSeeds(seedsNeeded);
    store.stats.totalSeedsUsed += seedsNeeded;
    bucket.addSeeds(toAdd);
    store.notify();
    eventBus.emit('buckets:changed', { bucketId, added: toAdd });
    return true;
  },

  startSoaking(bucketId) {
    const bucket = store.getBucket(bucketId);
    if (!bucket || bucket.stage !== null || bucket.seeds === 0) return false;

    const waterNeeded = RESOURCE_COSTS.soak.water * bucket.seeds;
    if (!store.resources.hasWater(waterNeeded)) return false;

    store.resources.useWater(waterNeeded);
    store.stats.totalWaterUsed += waterNeeded;
    bucket.startStage('soak', store.gameDay);
    store.notify();
    eventBus.emit('bucket:stageStarted', { bucketId, stage: 'soak' });
    return true;
  },

  startAiring(bucketId) {
    const bucket = store.getBucket(bucketId);
    if (!bucket || bucket.stage !== 'soak' || !bucket.needsTransition) return false;

    bucket.startStage('air', store.gameDay);
    store.notify();
    eventBus.emit('bucket:stageStarted', { bucketId, stage: 'air' });
    return true;
  },

  sow(bucketId) {
    const bucket = store.getBucket(bucketId);
    if (!bucket || bucket.stage !== 'air' || !bucket.needsTransition) return false;

    const seedsCount = bucket.seeds;
    const availableSpace = CAPACITY.TABLE_CAPACITY - store.table.containers.length;
    if (seedsCount > availableSpace) return false;

    const solutionNeeded = RESOURCE_COSTS.sow.solution * seedsCount;
    if (!store.resources.hasSolution(solutionNeeded)) return false;

    store.resources.useSolution(solutionNeeded);
    store.stats.totalSolutionUsed += solutionNeeded;

    const currentDay = store.gameDay;
    const newIds = [];
    for (let i = 0; i < seedsCount; i++) {
      // Генерация уникального номера
      let number = 1;
      const existingNumbers = new Set(store.containers.map(c => c.number));
      while (existingNumbers.has(number)) number++;

      const container = new Container(store.nextId++, number, 'sow', currentDay);
      store.addContainer(container);
      store.table.containers.push(container.id);
      newIds.push(container.id);
    }

    bucket.clear();
    store.notify();
    eventBus.emit('containers:added', newIds);
    return true;
  }
};