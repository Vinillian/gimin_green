import { STAGE_DURATION_REAL } from '../../constants.js';

export class Bucket {
    constructor(id) {
        this.id = id;
        this.seeds = 0;
        this.stage = null;
        this.stageStartTime = null;   // Unix timestamp (мс) начала текущей стадии
        this.needsTransition = false;
    }

    addSeeds(count) {
        this.seeds += count;
    }

    startStage(stage, now = Date.now()) {
        this.stage = stage;
        this.stageStartTime = now;
        this.needsTransition = false;
    }

    updateProgress(now = Date.now()) {
        if (!this.stage) return;
        const duration = STAGE_DURATION_REAL[this.stage];
        if (duration === 0) {
            this.needsTransition = true;
        } else {
            const elapsed = now - this.stageStartTime;
            this.needsTransition = elapsed >= duration;
        }
    }

    getProgressPercent(now = Date.now()) {
        if (!this.stage) return 0;
        const duration = STAGE_DURATION_REAL[this.stage];
        if (duration === 0) return 100;
        const elapsed = now - this.stageStartTime;
        return Math.min(100, Math.max(0, (elapsed / duration) * 100));
    }

    clear() {
        this.seeds = 0;
        this.stage = null;
        this.stageStartTime = null;
        this.needsTransition = false;
    }
}