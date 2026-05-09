import { store } from '../store/index.js';
import { bucketController } from '../controllers/bucketController.js';
import { containerController } from '../controllers/containerController.js';
import { harvestController } from '../controllers/harvestController.js';
import { ACHIEVEMENTS } from '../../constants.js';

export function initButtonHandlers() {
    console.log('🔘 Initializing button handlers');
    
    document.getElementById('compactAdd1Btn')?.addEventListener('click', () => {
        console.log('Click: Add 1 seed');
        if (store.selectedBucketIds.size === 0) {
            store.addLog('⚠️ Сначала выбери вёдра');
            return;
        }
        store.selectedBucketIds.forEach(id => bucketController.addSeeds(id, 1));
    });

    document.getElementById('compactAdd4Btn')?.addEventListener('click', () => {
        console.log('Click: Add 4 seeds');
        if (store.selectedBucketIds.size === 0) {
            store.addLog('⚠️ Сначала выбери вёдра');
            return;
        }
        store.selectedBucketIds.forEach(id => bucketController.addSeeds(id, 4));
    });

    document.getElementById('compactSoakBtn')?.addEventListener('click', () => {
        console.log('Click: Soak');
        if (store.selectedBucketIds.size === 0) {
            store.addLog('⚠️ Сначала выбери вёдра');
            return;
        }
        store.selectedBucketIds.forEach(id => bucketController.startSoaking(id));
    });

    document.getElementById('compactAirBtn')?.addEventListener('click', () => {
        console.log('Click: Air');
        if (store.selectedBucketIds.size === 0) {
            store.addLog('⚠️ Сначала выбери вёдра');
            return;
        }
        store.selectedBucketIds.forEach(id => bucketController.startAiring(id));
    });

    document.getElementById('compactSowBtn')?.addEventListener('click', () => {
        console.log('Click: Sow');
        if (store.selectedBucketIds.size === 0) {
            store.addLog('⚠️ Сначала выбери вёдра');
            return;
        }
        store.selectedBucketIds.forEach(id => bucketController.sow(id));
    });

    document.getElementById('compactSelectFreeBtn')?.addEventListener('click', () => {
        console.log('Click: Select free buckets');
        const ids = store.buckets.filter(b => b.stage === null).map(b => b.id);
        store.selectBuckets(ids);
        store.addLog(`🔲 Выбраны свободные вёдра (${ids.length})`);
    });

    document.getElementById('compactSelectSoakBtn')?.addEventListener('click', () => {
        console.log('Click: Select soak buckets');
        const ids = store.buckets.filter(b => b.stage === 'soak').map(b => b.id);
        store.selectBuckets(ids);
        store.addLog(`🔲 Выбраны вёдра в замачивании (${ids.length})`);
    });

    document.getElementById('compactSelectAirBtn')?.addEventListener('click', () => {
        console.log('Click: Select air buckets');
        const ids = store.buckets.filter(b => b.stage === 'air').map(b => b.id);
        store.selectBuckets(ids);
        store.addLog(`🔲 Выбраны вёдра в проветривании (${ids.length})`);
    });

    document.getElementById('compactClearBucketSelectionBtn')?.addEventListener('click', () => {
        console.log('Click: Clear bucket selection');
        store.clearSelection();
        store.addLog('🔄 Выбор снят');
    });

    document.getElementById('stagePressBtn')?.addEventListener('click', () => {
        console.log('Click: Press stage');
        if (store.selectedContainerIds.size === 0) {
            store.addLog('⚠️ Сначала выбери контейнеры на столе');
            return;
        }
        const ids = Array.from(store.selectedContainerIds);
        containerController.moveToPress(ids);
    });

    document.getElementById('stageLightBtn')?.addEventListener('click', () => {
        console.log('Click: Light stage');
        if (store.selectedContainerIds.size === 0) {
            store.addLog('⚠️ Сначала выбери контейнеры на полках');
            return;
        }
        const ids = Array.from(store.selectedContainerIds);
        containerController.moveToLight(ids);
    });

    document.getElementById('resetStageBtn')?.addEventListener('click', () => {
        console.log('Click: Reset selection');
        store.clearSelection();
        store.addLog('🔄 Выбор сброшен');
    });

    document.getElementById('spraySelectedBtn')?.addEventListener('click', () => {
        console.log('Click: Spray');
        if (store.selectedContainerIds.size === 0) {
            store.addLog('⚠️ Сначала выбери контейнеры');
            return;
        }
        const ids = Array.from(store.selectedContainerIds);
        containerController.spray(ids);
    });

    document.getElementById('waterSelectedBtn')?.addEventListener('click', () => {
        console.log('Click: Water');
        if (store.selectedContainerIds.size === 0) {
            store.addLog('⚠️ Сначала выбери контейнеры на свету');
            return;
        }
        const ids = Array.from(store.selectedContainerIds);
        containerController.water(ids);
    });

    document.getElementById('selectAllBtn')?.addEventListener('click', () => {
        console.log('Click: Select all');
        const ids = store.containers.map(c => c.id);
        store.selectContainers(ids);
        store.addLog(`🔲 Выбраны все контейнеры (${ids.length})`);
    });

    document.getElementById('clearSelectionBtn')?.addEventListener('click', () => {
        console.log('Click: Clear selection');
        store.clearSelection();
        store.addLog('🔄 Выбор снят');
    });

    document.getElementById('harvestSelectedBtn')?.addEventListener('click', () => {
        console.log('Click: Harvest');
        if (store.selectedContainerIds.size === 0) {
            store.addLog('⚠️ Сначала выбери контейнеры для сбора');
            return;
        }
        const ids = Array.from(store.selectedContainerIds);
        harvestController.harvest(ids);
    });

    document.getElementById('deleteSelectedBtn')?.addEventListener('click', () => {
        console.log('Click: Delete');
        if (store.selectedContainerIds.size === 0) {
            store.addLog('⚠️ Сначала выбери контейнеры для удаления');
            return;
        }
        const ids = Array.from(store.selectedContainerIds);
        harvestController.delete(ids);
    });

    document.getElementById('addWaterBtn')?.addEventListener('click', () => {
        console.log('Click: Add water');
        store.resources.addWater(5);
        store.addLog('🚰 +5 воды');
        store.notify();
    });

    document.getElementById('addSolutionBtn')?.addEventListener('click', () => {
        console.log('Click: Add solution');
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
        console.log('Click: Add seeds');
        store.resources.addSeeds(10);
        store.addLog('🌱 +10 семян');
        store.notify();
    });

    // Новые обработчики для умных кнопок
    document.getElementById('smartPressBtn')?.addEventListener('click', () => {
        console.log('Click: Smart press');
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
        console.log('Click: Smart light');
        const readyIds = store.containers
            .filter(c => c.location === 'shelf' && c.needsTransition)
            .map(c => c.id);
        if (readyIds.length > 0) {
            containerController.moveToLight(readyIds);
        } else {
            store.addLog('❌ Нет готовых контейнеров на полках');
        }
    });

    document.getElementById('achievementsBtn')?.addEventListener('click', () => {
        const achievements = store.stats.achievements.map(id => {
            const ach = Object.values(ACHIEVEMENTS).find(a => a.id === id);
            return ach ? `${ach.icon} ${ach.title}` : id;
        }).join('\n');
        alert(achievements.length ? `🏆 Достижения:\n${achievements}` : '🏆 Пока нет достижений');
    });

    console.log('✅ Button handlers initialized');
}