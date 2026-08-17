import { store } from '../store/index.js';
import { CAPACITY, RESOURCE_COSTS } from '../../constants.js';
import { Container } from '../models/Container.js';

export const devController = {
    // Установить стадию и локацию для выбранных контейнеров
    setSelectedContainersStage(stage, location) {
        if (store.selectedContainerIds.size === 0) {
            store.addLog('⚠️ Сначала выбери контейнеры');
            return;
        }
        const now = Date.now();
        const ids = Array.from(store.selectedContainerIds);
        let changed = 0;

        ids.forEach(id => {
            const c = store.getContainer(id);
            if (!c) return;

            // Удаляем из старой зоны
            if (c.location === 'table') {
                store.table.containers = store.table.containers.filter(cid => cid !== id);
            } else if (c.location === 'shelf') {
                const shelf = store.getShelf(c.locationId);
                if (shelf) shelf.removeContainer(id);
            }

            // Настраиваем новую локацию
            c.location = location;
            c.stage = stage;
            c.stageStartTime = now;
            c.needsTransition = true;

            if (location === 'table') {
                if (store.table.containers.length < CAPACITY.TABLE_CAPACITY) {
                    store.table.containers.push(id);
                    c.locationId = null;
                } else {
                    store.addLog(`❌ Нет места на столе для #${c.number}`);
                    return;
                }
            } else if (location === 'shelf') {
                const targetShelf = store.shelves.find(s => s.freeSpace > 0);
                if (targetShelf) {
                    targetShelf.addContainer(id);
                    c.locationId = targetShelf.id;
                } else {
                    store.addLog(`❌ Нет места на полках для #${c.number}`);
                    return;
                }
            } else if (location === 'light') {
                const used = new Set(store.containers.filter(c => c.location === 'light').map(c => c.number));
                let num = 1;
                while (used.has(num)) num++;
                if (num > CAPACITY.LIGHT_CAPACITY) {
                    store.addLog(`❌ Нет места на свету для #${c.number}`);
                    return;
                }
                c.number = num;
                c.locationId = num;
                c.needsTransition = true;
            }
            changed++;
        });

        if (changed > 0) {
            store.addLog(`🛠️ Установлена стадия "${stage}" и локация "${location}" для ${changed} контейнеров`);
        }
        store.notify();
    },

    // Установить стадию для выбранных вёдер
    setSelectedBucketsStage(stage) {
        if (store.selectedBucketIds.size === 0) {
            store.addLog('⚠️ Сначала выбери вёдра');
            return;
        }
        const now = Date.now();
        const ids = Array.from(store.selectedBucketIds);
        let changed = 0;
        ids.forEach(id => {
            const b = store.getBucket(id);
            if (!b) return;
            b.stage = stage;
            b.stageStartTime = now;
            b.needsTransition = true;
            changed++;
        });
        if (changed > 0) {
            store.addLog(`🪣 Установлена стадия "${stage}" для ${changed} вёдер`);
        }
        store.notify();
    },

    // Принудительный посев выбранного ведра
    forceSowSelectedBucket() {
        if (store.selectedBucketIds.size === 0) {
            store.addLog('⚠️ Сначала выбери вёдра для посева');
            return;
        }
        const ids = Array.from(store.selectedBucketIds);
        const now = Date.now();
        let totalSown = 0;

        ids.forEach(id => {
            const bucket = store.getBucket(id);
            if (!bucket) return;
            const seedsCount = bucket.seeds;
            if (seedsCount <= 0) {
                store.addLog(`❌ Ведро #${id} пустое`);
                return;
            }

            const availableSpace = CAPACITY.TABLE_CAPACITY - store.table.containers.length;
            if (seedsCount > availableSpace) {
                store.addLog(`❌ Недостаточно места на столе для ведра #${id} (нужно ${seedsCount}, свободно ${availableSpace})`);
                return;
            }

            const solutionNeeded = RESOURCE_COSTS.sow.solution * seedsCount;
            if (!store.resources.hasSolution(solutionNeeded)) {
                store.addLog(`❌ Недостаточно раствора для посева из ведра #${id} (нужно ${solutionNeeded.toFixed(2)} л)`);
                return;
            }

            store.resources.useSolution(solutionNeeded);
            store.stats.totalSolutionUsed += solutionNeeded;

            for (let i = 0; i < seedsCount; i++) {
                let number = 1;
                const existingNumbers = new Set(store.containers.map(c => c.number));
                while (existingNumbers.has(number)) number++;

                const container = new Container(store.nextId++, number, 'sow', now);
                store.addContainer(container);
                store.table.containers.push(container.id);
            }

            bucket.clear();
            totalSown += seedsCount;
        });

        if (totalSown > 0) {
            store.addLog(`🌱 Принудительно посеяно ${totalSown} контейнеров из выбранных вёдер`);
        }
        store.notify();
    },

    // Удалить выбранные контейнеры И очистить выбранные вёдра
    deleteSelectedItems() {
        let deletedContainers = 0;
        let clearedBuckets = 0;

        // Удаляем контейнеры
        if (store.selectedContainerIds.size > 0) {
            const ids = Array.from(store.selectedContainerIds);
            ids.forEach(id => {
                const c = store.getContainer(id);
                if (!c) return;
                // Удаляем из зон
                if (c.location === 'table') {
                    store.table.containers = store.table.containers.filter(cid => cid !== id);
                } else if (c.location === 'shelf') {
                    const shelf = store.getShelf(c.locationId);
                    if (shelf) shelf.removeContainer(id);
                }
                store.removeContainer(id);
                deletedContainers++;
            });
        }

        // Очищаем вёдра
        if (store.selectedBucketIds.size > 0) {
            const bucketIds = Array.from(store.selectedBucketIds);
            bucketIds.forEach(id => {
                const b = store.getBucket(id);
                if (b) {
                    b.clear();
                    clearedBuckets++;
                }
            });
        }

        // Очищаем выделение
        store.clearSelection();

        // Логируем
        let logMsg = '';
        if (deletedContainers > 0) logMsg += `🗑️ Удалено контейнеров: ${deletedContainers}`;
        if (clearedBuckets > 0) logMsg += (logMsg ? ' | ' : '') + `🧹 Очищено вёдер: ${clearedBuckets}`;
        if (logMsg) store.addLog(logMsg);
        else store.addLog('⚠️ Ничего не выбрано для удаления/очистки');

        store.notify();
    },

    // Очистить выбранные вёдра
    clearSelectedBuckets() {
        if (store.selectedBucketIds.size === 0) {
            store.addLog('⚠️ Сначала выбери вёдра');
            return;
        }
        const ids = Array.from(store.selectedBucketIds);
        ids.forEach(id => {
            const b = store.getBucket(id);
            if (b) b.clear();
        });
        store.addLog(`🧹 Очищено ${ids.length} вёдер`);
        store.notify();
    },

    // Добавить ресурсы
    addResources(water = 0, solution = 0, seeds = 0) {
        if (water) store.resources.addWater(water);
        if (solution) store.resources.addSolution(solution);
        if (seeds) store.resources.addSeeds(seeds);
        store.addLog(`💰 Ресурсы: +${water} воды, +${solution} раствора, +${seeds} семян`);
        store.notify();
    },

    // Полный сброс фермы
    resetAll() {
        if (!confirm('Сбросить всю ферму? Это действие нельзя отменить!')) return;
        localStorage.removeItem('farmState');
        location.reload();
    }
};