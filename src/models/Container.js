// Контейнер с растением
import { STAGE_DURATION, STAGE_ICONS } from '../../constants.js';

export class Container {
  constructor(id, number, stage, currentDay) {
    this.id = id;
    this.number = number;           // порядковый номер (уникальный)
    this.stage = stage;             // 'sow', 'press', 'light'
    this.location = 'table';         // 'table', 'shelf', 'light'
    this.locationId = null;          // id полки или номер поддона
    this.stageStartDay = currentDay;
    this.lastSprayDay = currentDay;
    this.lastWaterDay = currentDay;
    this.needsSpray = false;
    this.needsWater = false;
    this.needsTransition = (STAGE_DURATION[stage] === 0); // стадия с нулевой длительностью сразу готова
  }

  // Обновить прогресс стадии и потребности в уходе
  updateProgress(currentDay) {
    const daysPassed = currentDay - this.stageStartDay;
    const totalDays = STAGE_DURATION[this.stage];
    if (totalDays > 0) {
      this.needsTransition = daysPassed >= totalDays;
    }

    // Проверка опрыскивания (для всех стадий, кроме 'sow')
    if (this.stage !== 'sow' && currentDay > this.lastSprayDay) {
      this.needsSpray = true;
    }

    // Проверка полива (только на свету)
    if (this.stage === 'light' && currentDay > this.lastWaterDay) {
      this.needsWater = true;
    }
  }

  // Опрыскать
  spray(currentDay) {
    this.lastSprayDay = currentDay;
    this.needsSpray = false;
  }

  // Полить
  water(currentDay) {
    this.lastWaterDay = currentDay;
    this.needsWater = false;
  }

  // Переместить в новую локацию и сменить стадию
  moveTo(newLocation, newStage, currentDay, newNumber = null) {
    this.location = newLocation;
    this.stage = newStage;
    this.stageStartDay = currentDay;
    this.needsTransition = false;
    if (newLocation === 'light' && newNumber !== null) {
      this.number = newNumber;
      this.locationId = newNumber;
    } else if (newLocation === 'shelf') {
      this.locationId = newLocation; // здесь будет id полки, передадим отдельно
    }
    // Сброс дней ухода
    this.lastSprayDay = currentDay;
    this.lastWaterDay = currentDay;
    this.needsSpray = false;
    this.needsWater = false;
  }

  // Получить иконку стадии
  get stageIcon() {
    return STAGE_ICONS[this.stage];
  }
}