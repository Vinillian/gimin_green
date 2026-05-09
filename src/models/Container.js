import { STAGE_DURATION_REAL, CARE_INTERVALS, STAGE_ICONS } from '../../constants.js';

export class Container {
    constructor(id, number, stage, startTime = Date.now()) {
        this.id = id;
        this.number = number;
        this.stage = stage;
        this.location = 'table';
        this.locationId = null;
        this.stageStartTime = startTime;
        this.lastSprayTime = startTime;
        this.lastWaterTime = startTime;
        this.needsSpray = false;
        this.needsWater = false;
        this.needsTransition = (STAGE_DURATION_REAL[stage] === 0);
    }

    updateProgress(now = Date.now()) {
        // Переход на следующую стадию
        const duration = STAGE_DURATION_REAL[this.stage];
        if (duration > 0) {
            const elapsed = now - this.stageStartTime;
            this.needsTransition = elapsed >= duration;
        } else {
            this.needsTransition = true;
        }

        // Опрыскивание (если не стадия посева)
        if (this.stage !== 'sow') {
            const sprayElapsed = now - this.lastSprayTime;
            this.needsSpray = sprayElapsed >= CARE_INTERVALS.SPRAY_EVERY;
        }

        // Полив (только на стадии света)
        if (this.stage === 'light') {
            const waterElapsed = now - this.lastWaterTime;
            this.needsWater = waterElapsed >= CARE_INTERVALS.WATER_EVERY;
        }
    }

    getProgressPercent(now = Date.now()) {
        const duration = STAGE_DURATION_REAL[this.stage];
        if (duration === 0) return 100;
        const elapsed = now - this.stageStartTime;
        return Math.min(100, Math.max(0, (elapsed / duration) * 100));
    }

    spray(now = Date.now()) {
        this.lastSprayTime = now;
        this.needsSpray = false;
    }

    water(now = Date.now()) {
        this.lastWaterTime = now;
        this.needsWater = false;
    }

    moveTo(newLocation, newStage, now = Date.now(), locationId = null, newNumber = null) {
        this.location = newLocation;
        this.stage = newStage;
        this.stageStartTime = now;
        this.needsTransition = false;
        this.locationId = locationId;
        if (newLocation === 'light' && newNumber !== null) {
            this.number = newNumber;
        }
        this.lastSprayTime = now;
        this.lastWaterTime = now;
        this.needsSpray = false;
        this.needsWater = false;
    }

    get stageIcon() {
        return STAGE_ICONS[this.stage];
    }
}