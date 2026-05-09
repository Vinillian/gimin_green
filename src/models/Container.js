import { STAGE_DURATION, STAGE_ICONS } from '../../constants.js';

export class Container {
  constructor(id, number, stage, currentDay) {
    this.id = id;
    this.number = number;
    this.stage = stage;
    this.location = 'table';
    this.locationId = null;
    this.stageStartDay = currentDay;
    this.lastSprayDay = currentDay;
    this.lastWaterDay = currentDay;
    this.needsSpray = false;
    this.needsWater = false;
    this.needsTransition = (STAGE_DURATION[stage] === 0);
  }

  updateProgress(currentDay) {
    const daysPassed = currentDay - this.stageStartDay;
    const totalDays = STAGE_DURATION[this.stage];
    if (totalDays > 0) {
      this.needsTransition = daysPassed >= totalDays;
    }

    // Опрыскивание нужно, если прошёл хотя бы 1 полный день с последнего опрыскивания
    // и контейнер не в стадии 'sow'
    if (this.stage !== 'sow' && currentDay - this.lastSprayDay >= 1) {
      this.needsSpray = true;
    }

    // Полив нужен, если прошёл хотя бы 1 полный день с последнего полива
    // и контейнер на стадии 'light'
    if (this.stage === 'light' && currentDay - this.lastWaterDay >= 1) {
      this.needsWater = true;
    }
  }

  spray(currentDay) {
    this.lastSprayDay = currentDay;
    this.needsSpray = false;
  }

  water(currentDay) {
    this.lastWaterDay = currentDay;
    this.needsWater = false;
  }

  moveTo(newLocation, newStage, currentDay, locationId = null, newNumber = null) {
    this.location = newLocation;
    this.stage = newStage;
    this.stageStartDay = currentDay;
    this.needsTransition = false;
    this.locationId = locationId;
    if (newLocation === 'light' && newNumber !== null) {
      this.number = newNumber;
    }
    this.lastSprayDay = currentDay;
    this.lastWaterDay = currentDay;
    this.needsSpray = false;
    this.needsWater = false;
  }

  get stageIcon() {
    return STAGE_ICONS[this.stage];
  }
}