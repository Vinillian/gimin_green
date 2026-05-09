import { store } from '../store/index.js';
import { eventBus } from './eventBus.js';

class TimeService {
    constructor() {
        this.interval = null;
        this.isRunning = true;
        this.updateIntervalMs = 60000; // обновлять UI каждую минуту (можно уменьшить до 10000 для более частого обновления)
    }

    start() {
        if (this.interval) return;
        // Немедленно обновляем прогресс при старте
        this.tick();
        // Запускаем периодическое обновление
        this.interval = setInterval(() => {
            if (!this.isRunning) return;
            this.tick();
        }, this.updateIntervalMs);
    }

    tick() {
        const now = Date.now();
        store.updateAllProgress(now);
        eventBus.emit('game:tick', now);
        // При необходимости можно проверять готовность к сбору и отправлять уведомления
    }

    pause() {
        this.isRunning = false;
    }

    resume() {
        this.isRunning = true;
        this.tick(); // сразу обновить
    }

    toggle() {
        this.isRunning = !this.isRunning;
        if (this.isRunning) this.tick();
        eventBus.emit('game:pause', this.isRunning);
    }
}

export const timeService = new TimeService();