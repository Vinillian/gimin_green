import { store } from '../store/index.js';
import { bucketController } from '../controllers/bucketController.js';
import { containerController } from '../controllers/containerController.js';
import { harvestController } from '../controllers/harvestController.js';
import { ACHIEVEMENTS } from '../../constants.js';

export function initButtonHandlers() {
    console.log('🔘 Initializing button handlers');
    
    // --- ВЁДРА ---
    document.getElementById('compactAdd1Btn')?.addEventListener('click', () => {
        if (store.selectedBucketIds.size === 0) {
            store.addLog('⚠️ Сначала выбери вёдра');
            return;
        }
        store.selectedBucketIds.forEach(id => bucketController.addSeeds(id, 1));
    });

    document.getElementById('compactAdd4Btn')?.addEventListener('click', () => {
        if (store.selectedBucketIds.size === 0) {
            store.addLog('⚠️ Сначала выбери вёдра');
            return;
        }
        store.selectedBucketIds.forEach(id => bucketController.addSeeds(id, 4));
    });

    document.getElementById('compactSoakBtn')?.addEventListener('click', () => {
        if (store.selectedBucketIds.size === 0) {
            store.addLog('⚠️ Сначала выбери вёдра');
            return;
        }
        store.selectedBucketIds.forEach(id => bucketController.startSoaking(id));
    });

    document.getElementById('compactAirBtn')?.addEventListener('click', () => {
        if (store.selectedBucketIds.size === 0) {
            store.addLog('⚠️ Сначала выбери вёдра');
            return;
        }
        store.selectedBucketIds.forEach(id => bucketController.startAiring(id));
    });

    document.getElementById('compactSowBtn')?.addEventListener('click', () => {
        if (store.selectedBucketIds.size === 0) {
            store.addLog('⚠️ Сначала выбери вёдра');
            return;
        }
        store.selectedBucketIds.forEach(id => bucketController.sow(id));
    });

    // Выбор вёдер по фильтрам
    document.getElementById('compactSelectFreeBtn')?.addEventListener('click', () => {
        const ids = store.buckets.filter(b => b.stage === null).map(b => b.id);
        store.selectBuckets(ids);
        store.addLog(`🔲 Выбраны свободные вёдра (${ids.length})`);
    });

    document.getElementById('compactSelectSoakBtn')?.addEventListener('click', () => {
        const ids = store.buckets.filter(b => b.stage === 'soak').map(b => b.id);
        store.selectBuckets(ids);
        store.addLog(`🔲 Выбраны вёдра в замачивании (${ids.length})`);
    });

    document.getElementById('compactSelectAirBtn')?.addEventListener('click', () => {
        const ids = store.buckets.filter(b => b.stage === 'air').map(b => b.id);
        store.selectBuckets(ids);
        store.addLog(`🔲 Выбраны вёдра в проветривании (${ids.length})`);
    });

    document.getElementById('compactClearBucketSelectionBtn')?.addEventListener('click', () => {
        store.clearSelection();
        store.addLog('🔄 Выбор снят');
    });

    // --- КОНТЕЙНЕРЫ: перемещение между зонами ---
    document.getElementById('stagePressBtn')?.addEventListener('click', () => {
        if (store.selectedContainerIds.size === 0) {
            store.addLog('⚠️ Сначала выбери контейнеры на столе');
            return;
        }
        const ids = Array.from(store.selectedContainerIds);
        containerController.moveToPress(ids);
    });

    document.getElementById('stageLightBtn')?.addEventListener('click', () => {
        if (store.selectedContainerIds.size === 0) {
            store.addLog('⚠️ Сначала выбери контейнеры на полках');
            return;
        }
        const ids = Array.from(store.selectedContainerIds);
        containerController.moveToLight(ids);
    });

    // --- УХОД ЗА КОНТЕЙНЕРАМИ ---
    document.getElementById('spraySelectedBtn')?.addEventListener('click', () => {
        if (store.selectedContainerIds.size === 0) {
            store.addLog('⚠️ Сначала выбери контейнеры');
            return;
        }
        const ids = Array.from(store.selectedContainerIds);
        containerController.spray(ids);
    });

    document.getElementById('waterSelectedBtn')?.addEventListener('click', () => {
        if (store.selectedContainerIds.size === 0) {
            store.addLog('⚠️ Сначала выбери контейнеры на свету');
            return;
        }
        const ids = Array.from(store.selectedContainerIds);
        containerController.water(ids);
    });

    // --- СБОР И УДАЛЕНИЕ ---
    document.getElementById('harvestSelectedBtn')?.addEventListener('click', () => {
        if (store.selectedContainerIds.size === 0) {
            store.addLog('⚠️ Сначала выбери контейнеры для сбора');
            return;
        }
        const ids = Array.from(store.selectedContainerIds);
        harvestController.harvest(ids);
    });

    document.getElementById('deleteSelectedBtn')?.addEventListener('click', () => {
        if (store.selectedContainerIds.size === 0) {
            store.addLog('⚠️ Сначала выбери контейнеры для удаления');
            return;
        }
        const ids = Array.from(store.selectedContainerIds);
        harvestController.delete(ids);
    });

    // --- УПРАВЛЕНИЕ ВЫДЕЛЕНИЕМ ---
    document.getElementById('selectAllBtn')?.addEventListener('click', () => {
        const ids = store.containers.map(c => c.id);
        store.selectContainers(ids);
        store.addLog(`🔲 Выбраны все контейнеры (${ids.length})`);
    });

    document.getElementById('clearSelectionBtn')?.addEventListener('click', () => {
        store.clearSelection();
        store.addLog('🔄 Выбор снят');
    });

    document.getElementById('resetStageBtn')?.addEventListener('click', () => {
        store.clearSelection();
        store.addLog('🔄 Выбор сброшен');
    });

    // --- РЕСУРСЫ ---
    document.getElementById('addWaterBtn')?.addEventListener('click', () => {
        store.resources.addWater(5);
        store.addLog('🚰 +5 воды');
        store.notify();
    });

    document.getElementById('addSolutionBtn')?.addEventListener('click', () => {
        if (store.resources.water < 4) {
            store.addLog(`❌ Недостаточно воды для создания раствора! Нужно 4 л воды, есть ${store.resources.water.toFixed(2)} л`);
            return;
        }
        store.resources.useWater(4);
        store.resources.addSolution(4);
        store.stats.totalWaterUsed += 4;
        store.addLog('🧪 +4 раствора (потрачено 4 л воды)');
        store.notify();
    });

    document.getElementById('addSeedsBtn')?.addEventListener('click', () => {
        store.resources.addSeeds(10);
        store.addLog('🌱 +10 семян');
        store.notify();
    });

    // --- УМНЫЕ КНОПКИ ---
    document.getElementById('smartPressBtn')?.addEventListener('click', () => {
        const readyIds = store.containers
            .filter(c => c.location === 'table' && c.needsTransition)
            .map(c => c.id);
        if (readyIds.length > 0) {
            containerController.moveToPress(readyIds);
        } else {
            store.addLog('❌ Нет готовых контейнеров на столе');
        }
    });

    document.getElementById('smartLightBtn')?.addEventListener('click', () => {
        const readyIds = store.containers
            .filter(c => c.location === 'shelf' && c.needsTransition)
            .map(c => c.id);
        if (readyIds.length > 0) {
            containerController.moveToLight(readyIds);
        } else {
            store.addLog('❌ Нет готовых контейнеров на полках');
        }
    });

    // --- ДОСТИЖЕНИЯ ---
    document.getElementById('achievementsBtn')?.addEventListener('click', () => {
        const achievements = store.stats.achievements.map(id => {
            const ach = Object.values(ACHIEVEMENTS).find(a => a.id === id);
            return ach ? `${ach.icon} ${ach.title}` : id;
        }).join('\n');
        alert(achievements.length ? `🏆 Достижения:\n${achievements}` : '🏆 Пока нет достижений');
    });

    console.log('✅ Button handlers initialized');
}