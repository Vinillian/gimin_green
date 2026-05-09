// Ведро для замачивания и проветривания семян
import { STAGE_DURATION } from '../../constants.js';

export class Bucket {
    constructor(id) {
        this.id = id;
        this.seeds = 0;
        this.stage = null;
        this.stageStartDay = null;
        this.needsTransition = false;
    }

    addSeeds(count) {
        this.seeds += count;
    }

    startStage(stage, currentDay) {
        this.stage = stage;
        this.stageStartDay = currentDay;
        this.needsTransition = false;
    }

    updateProgress(currentDay) {
        if (!this.stage) return;
        const daysPassed = currentDay - this.stageStartDay;
        const totalDays = STAGE_DURATION[this.stage];
        this.needsTransition = daysPassed >= totalDays;
    }

    clear() {
        this.seeds = 0;
        this.stage = null;
        this.stageStartDay = null;
        this.needsTransition = false;
    }
}