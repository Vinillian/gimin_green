import { Bucket } from '../models/Bucket.js';
import { Container } from '../models/Container.js';
import { Shelf } from '../models/Shelf.js';
import { ResourceStock } from '../models/ResourceStock.js';
import { INITIAL_STATS, CAPACITY } from '../../constants.js';

class Store {
    constructor() {
        console.log('🏪 Store constructor called');
        
        this.containers = [];
        this.buckets = [1, 2, 3, 4].map(id => new Bucket(id));
        this.table = { containers: [] };
        this.shelves = [1, 2, 3].map(id => new Shelf(id));
        this.resources = new ResourceStock(20, 15, 30);
        this.nextId = 1;
        this.stats = { ...INITIAL_STATS };
        this.settings = {
            smartBucketFill: true,
            soundEnabled: true,
            animationsEnabled: true
        };
        this.selectedContainerIds = new Set();
        this.selectedBucketIds = new Set();
        this.multiselectModifier = false;
        this.log = ['📋 Добро пожаловать в реальную ферму!'];

        this._subscribers = [];
        
        console.log('✅ Store initialized', this.buckets.length, 'buckets');
    }

    subscribe(callback) {
        this._subscribers.push(callback);
        return () => {
            this._subscribers = this._subscribers.filter(cb => cb !== callback);
        };
    }

    notify() {
        this._subscribers.forEach(cb => cb(this));
    }

    addLog(msg) {
        const timeStr = new Date().toLocaleTimeString().slice(0,5);
        this.log.unshift(`⏱️ ${timeStr} • ${msg}`);
        if (this.log.length > 15) this.log.pop();
        this.notify();
    }

    getContainer(id) {
        return this.containers.find(c => c.id === id);
    }

    getBucket(id) {
        return this.buckets.find(b => b.id === id);
    }

    getShelf(id) {
        return this.shelves.find(s => s.id === id);
    }

    addContainer(container) {
        this.containers.push(container);
        // Обновляем статистику максимального заполнения стола
        if (container.location === 'table') {
            if (this.table.containers.length >= CAPACITY.TABLE_CAPACITY) {
                this.stats.maxFullTable = true;
            }
        }
    }

    removeContainer(id) {
        const index = this.containers.findIndex(c => c.id === id);
        if (index !== -1) {
            this.containers.splice(index, 1);
            return true;
        }
        return false;
    }

    toggleContainerSelection(id) {
        if (this.selectedContainerIds.has(id)) {
            this.selectedContainerIds.delete(id);
        } else {
            if (!this.multiselectModifier) {
                this.selectedContainerIds.clear();
                this.selectedBucketIds.clear();
            }
            this.selectedContainerIds.add(id);
        }
        this.notify();
    }

    toggleBucketSelection(id) {
        if (this.selectedBucketIds.has(id)) {
            this.selectedBucketIds.delete(id);
        } else {
            if (!this.multiselectModifier) {
                this.selectedContainerIds.clear();
                this.selectedBucketIds.clear();
            }
            this.selectedBucketIds.add(id);
        }
        this.notify();
    }

    clearSelection() {
        this.selectedContainerIds.clear();
        this.selectedBucketIds.clear();
        this.notify();
    }

    selectContainers(ids) {
        this.selectedContainerIds = new Set(ids);
        this.selectedBucketIds.clear();
        this.notify();
    }

    selectBuckets(ids) {
        this.selectedBucketIds = new Set(ids);
        this.selectedContainerIds.clear();
        this.notify();
    }

    updateAllProgress(now = Date.now()) {
        this.buckets.forEach(b => b.updateProgress(now));
        this.containers.forEach(c => c.updateProgress(now));
        this.notify();
    }

    toJSON() {
        return {
            resources: {
                water: this.resources.water,
                solution: this.resources.solution,
                seeds: this.resources.seeds
            },
            containers: this.containers.map(c => ({
                id: c.id,
                number: c.number,
                stage: c.stage,
                location: c.location,
                locationId: c.locationId,
                stageStartTime: c.stageStartTime,
                lastSprayTime: c.lastSprayTime,
                lastWaterTime: c.lastWaterTime
            })),
            buckets: this.buckets.map(b => ({
                id: b.id,
                seeds: b.seeds,
                stage: b.stage,
                stageStartTime: b.stageStartTime
            })),
            table: this.table,
            shelves: this.shelves.map(s => ({ id: s.id, containers: s.containers })),
            nextId: this.nextId,
            stats: this.stats,
            settings: this.settings,
            log: this.log
        };
    }

    fromJSON(data) {
        // Восстанавливаем ресурсы
        this.resources.water = data.resources?.water ?? 20;
        this.resources.solution = data.resources?.solution ?? 15;
        this.resources.seeds = data.resources?.seeds ?? 30;

        // Восстанавливаем контейнеры
        this.containers = (data.containers || []).map(cData => {
            const c = new Container(cData.id, cData.number, cData.stage, cData.stageStartTime);
            c.location = cData.location;
            c.locationId = cData.locationId;
            c.lastSprayTime = cData.lastSprayTime;
            c.lastWaterTime = cData.lastWaterTime;
            c.updateProgress();
            return c;
        });

        // Восстанавливаем вёдра
        this.buckets = (data.buckets || []).map(bData => {
            const b = new Bucket(bData.id);
            b.seeds = bData.seeds;
            b.stage = bData.stage;
            b.stageStartTime = bData.stageStartTime;
            b.updateProgress();
            return b;
        });
        // Если нет сохранённых вёдер, создаём новые
        if (!data.buckets) {
            this.buckets = [1,2,3,4].map(id => new Bucket(id));
        }

        this.table = data.table || { containers: [] };
        this.shelves = (data.shelves || []).map(s => {
            const shelf = new Shelf(s.id);
            shelf.containers = s.containers;
            return shelf;
        });
        if (!data.shelves) {
            this.shelves = [1,2,3].map(id => new Shelf(id));
        }

        this.nextId = data.nextId ?? 1;
        this.stats = { ...INITIAL_STATS, ...(data.stats ?? {}) };
        this.settings = { ...this.settings, ...(data.settings ?? {}) };
        this.log = data.log ?? ['📋 Добро пожаловать в реальную ферму!'];

        this.notify();
    }
}

export const store = new Store();