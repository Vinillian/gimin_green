import { TIME_SETTINGS } from '../../constants.js';
import { store } from '../store/index.js';
import { eventBus } from './eventBus.js';

class TimeService {
  constructor() {
    this.interval = null;
    this.isRunning = true;
  }

  start() {
    if (this.interval) return;
    this.interval = setInterval(() => {
      if (!this.isRunning) return;
      store.gameDay = Math.round((store.gameDay + TIME_SETTINGS.DAY_INCREMENT) * 100) / 100;
      store.updateAllProgress();
      eventBus.emit('game:tick', store.gameDay);
      if (Number.isInteger(store.gameDay) && store.gameDay > 0) {
        eventBus.emit('game:dayPassed', store.gameDay);
      }
    }, TIME_SETTINGS.TICK_INTERVAL);
  }

  pause() {
    this.isRunning = false;
  }

  resume() {
    this.isRunning = true;
  }

  toggle() {
    this.isRunning = !this.isRunning;
    eventBus.emit('game:pause', this.isRunning);
  }
}

export const timeService = new TimeService();