import { store } from '../store/index.js';
import { eventBus } from './eventBus.js';

class TimeService {
    constructor() {
        this.interval = null;
        this.isRunning = true;
        this.updateIntervalMs = 15000; // было 60000, теперь 15 секунд
    }

    start() {
        if (this.interval) return;
        this.tick();
        this.interval = setInterval(() => {
            if (!this.isRunning) return;
            this.tick();
        }, this.updateIntervalMs);
    }

    tick() {
        const now = Date.now();
        store.updateAllProgress(now);
        eventBus.emit('game:tick', now);
    }

    pause() {
        this.isRunning = false;
    }

    resume() {
        this.isRunning = true;
        this.tick();
    }

    toggle() {
        this.isRunning = !this.isRunning;
        if (this.isRunning) this.tick();
        eventBus.emit('game:pause', this.isRunning);
    }
}

export const timeService = new TimeService();