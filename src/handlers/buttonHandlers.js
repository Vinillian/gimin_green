import { store } from '../store/index.js';
import { bucketController } from '../controllers/bucketController.js';
import { containerController } from '../controllers/containerController.js';
import { harvestController } from '../controllers/harvestController.js';

export function initButtonHandlers() {
    console.log('🔘 Initializing button handlers');
    
    // Добавление семян +1
    document.getElementById('compactAdd1Btn')?.addEventListener('click', () => {
        console.log('Click: Add 1 seed');
        if (store.selectedBucketIds.size === 0) {
            store.addLog('⚠️ Сначала выбери вёдра');
            return;
        }
        let success = false;
        store.selectedBucketIds.forEach(id => {
            if (bucketController.addSeeds(id, 1)) success = true;
        });
        if (success) store.addLog('🌱 Добавлено по 1 семени в выбранные вёдра');
    });

    // Добавление семян +4
    document.getElementById('compactAdd4Btn')?.addEventListener('click', () => {
        console.log('Click: Add 4 seeds');
        if (store.selectedBucketIds.size === 0) {
            store.addLog('⚠️ Сначала выбери вёдра');
            return;
        }
        let success = false;
        store.selectedBucketIds.forEach(id => {
            if (bucketController.addSeeds(id, 4)) success = true;
        });
        if (success) store.addLog('🌱 Добавлено по 4 семени в выбранные вёдра');
    });

    // Замачивание
    document.getElementById('compactSoakBtn')?.addEventListener('click', () => {
        console.log('Click: Soak');
        if (store.selectedBucketIds.size === 0) {
            store.addLog('⚠️ Сначала выбери вёдра');
            return;
        }
        let success = false;
        store.selectedBucketIds.forEach(id => {
            if (bucketController.startSoaking(id)) success = true;
        });
        if (success) store.addLog('💧 Запущено замачивание в выбранных вёдрах');
    });

    // Проветривание
    document.getElementById('compactAirBtn')?.addEventListener('click', () => {
        console.log('Click: Air');
        if (store.selectedBucketIds.size === 0) {
            store.addLog('⚠️ Сначала выбери вёдра');
            return;
        }
        let success = false;
        store.selectedBucketIds.forEach(id => {
            if (bucketController.startAiring(id)) success = true;
        });
        if (success) store.addLog('🌬 Запущено проветривание в выбранных вёдрах');
    });

    // Посев
    document.getElementById('compactSowBtn')?.addEventListener('click', () => {
        console.log('Click: Sow');
        if (store.selectedBucketIds.size === 0) {
            store.addLog('⚠️ Сначала выбери вёдра');
            return;
        }
        let success = false;
        store.selectedBucketIds.forEach(id => {
            if (bucketController.sow(id)) success = true;
        });
        if (success) store.addLog('🌱 Посеяны контейнеры из выбранных вёдер');
    });

    // Выбор свободных вёдер
    document.getElementById('compactSelectFreeBtn')?.addEventListener('click', () => {
        console.log('Click: Select free buckets');
        const ids = store.buckets.filter(b => b.stage === null).map(b => b.id);
        store.selectBuckets(ids);
        store.addLog(`🔲 Выбраны свободные вёдра (${ids.length})`);
    });

    // Выбор вёдер в замачивании
    document.getElementById('compactSelectSoakBtn')?.addEventListener('click', () => {
        console.log('Click: Select soak buckets');
        const ids = store.buckets.filter(b => b.stage === 'soak').map(b => b.id);
        store.selectBuckets(ids);
        store.addLog(`🔲 Выбраны вёдра в замачивании (${ids.length})`);
    });

    // Выбор вёдер в проветривании
    document.getElementById('compactSelectAirBtn')?.addEventListener('click', () => {
        console.log('Click: Select air buckets');
        const ids = store.buckets.filter(b => b.stage === 'air').map(b => b.id);
        store.selectBuckets(ids);
        store.addLog(`🔲 Выбраны вёдра в проветривании (${ids.length})`);
    });

    // Снять выбор с вёдер
    document.getElementById('compactClearBucketSelectionBtn')?.addEventListener('click', () => {
        console.log('Click: Clear bucket selection');
        store.clearSelection();
        store.addLog('🔄 Выбор снят');
    });

    // Прижим
    document.getElementById('stagePressBtn')?.addEventListener('click', () => {
        console.log('Click: Press stage');
        if (store.selectedContainerIds.size === 0) {
            store.addLog('⚠️ Сначала выбери контейнеры на столе');
            return;
        }
        const ids = Array.from(store.selectedContainerIds);
        if (containerController.moveToPress(ids)) {
            store.addLog(`📦 Перемещено на прижим`);
        } else {
            store.addLog('❌ Не удалось переместить (проверь готовность и место)');
        }
    });

    // Свет
    document.getElementById('stageLightBtn')?.addEventListener('click', () => {
        console.log('Click: Light stage');
        if (store.selectedContainerIds.size === 0) {
            store.addLog('⚠️ Сначала выбери контейнеры на полках');
            return;
        }
        const ids = Array.from(store.selectedContainerIds);
        if (containerController.moveToLight(ids)) {
            store.addLog(`💡 Перемещено на свет`);
        } else {
            store.addLog('❌ Не удалось переместить (проверь готовность и место)');
        }
    });

    // Сброс выделения
    document.getElementById('resetStageBtn')?.addEventListener('click', () => {
        console.log('Click: Reset selection');
        store.clearSelection();
        store.addLog('🔄 Выбор сброшен');
    });

    // Опрыскивание
    document.getElementById('spraySelectedBtn')?.addEventListener('click', () => {
        console.log('Click: Spray');
        if (store.selectedContainerIds.size === 0) {
            store.addLog('⚠️ Сначала выбери контейнеры');
            return;
        }
        const ids = Array.from(store.selectedContainerIds);
        if (containerController.spray(ids)) {
            store.addLog(`💦 Контейнеры опрысканы`);
        } else {
            store.addLog('❌ Не удалось опрыскать (нет воды или нечего опрыскивать)');
        }
    });

    // Полив
    document.getElementById('waterSelectedBtn')?.addEventListener('click', () => {
        console.log('Click: Water');
        if (store.selectedContainerIds.size === 0) {
            store.addLog('⚠️ Сначала выбери контейнеры на свету');
            return;
        }
        const ids = Array.from(store.selectedContainerIds);
        if (containerController.water(ids)) {
            store.addLog(`💧 Контейнеры политы`);
        } else {
            store.addLog('❌ Не удалось полить (нет воды или нечего поливать)');
        }
    });

    // Выделить все
    document.getElementById('selectAllBtn')?.addEventListener('click', () => {
        console.log('Click: Select all');
        const ids = store.containers.map(c => c.id);
        store.selectContainers(ids);
        store.addLog(`🔲 Выбраны все контейнеры (${ids.length})`);
    });

    // Снять выделение
    document.getElementById('clearSelectionBtn')?.addEventListener('click', () => {
        console.log('Click: Clear selection');
        store.clearSelection();
        store.addLog('🔄 Выбор снят');
    });

    // Сбор урожая
    document.getElementById('harvestSelectedBtn')?.addEventListener('click', () => {
        console.log('Click: Harvest');
        if (store.selectedContainerIds.size === 0) {
            store.addLog('⚠️ Сначала выбери контейнеры для сбора');
            return;
        }
        const ids = Array.from(store.selectedContainerIds);
        if (harvestController.harvest(ids)) {
            // лог внутри контроллера
        } else {
            store.addLog('❌ Не удалось собрать (контейнеры не на свету или не готовы)');
        }
    });

    // Удаление
    document.getElementById('deleteSelectedBtn')?.addEventListener('click', () => {
        console.log('Click: Delete');
        if (store.selectedContainerIds.size === 0) {
            store.addLog('⚠️ Сначала выбери контейнеры для удаления');
            return;
        }
        const ids = Array.from(store.selectedContainerIds);
        if (harvestController.delete(ids)) {
            store.addLog(`🗑️ Удалено контейнеров: ${ids.length}`);
        }
    });

    // Добавить воду
    document.getElementById('addWaterBtn')?.addEventListener('click', () => {
        console.log('Click: Add water');
        store.resources.addWater(5);
        store.addLog('🚰 +5 воды');
        store.notify();
    });

    // Добавить раствор
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

    // Добавить семена
    document.getElementById('addSeedsBtn')?.addEventListener('click', () => {
        console.log('Click: Add seeds');
        store.resources.addSeeds(10);
        store.addLog('🌱 +10 семян');
        store.notify();
    });

    console.log('✅ Button handlers initialized');
}