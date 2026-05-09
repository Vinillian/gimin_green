// Запас ресурсов (вода, раствор, семена)
export class ResourceStock {
  constructor(water = 20, solution = 15, seeds = 30) {
    this.water = water;
    this.solution = solution;
    this.seeds = seeds;
  }

  // Проверка наличия
  hasWater(amount) { return this.water >= amount; }
  hasSolution(amount) { return this.solution >= amount; }
  hasSeeds(amount) { return this.seeds >= amount; }

  // Списание
  useWater(amount) {
    if (this.hasWater(amount)) {
      this.water = Math.round((this.water - amount) * 100) / 100;
      return true;
    }
    return false;
  }
  useSolution(amount) {
    if (this.hasSolution(amount)) {
      this.solution = Math.round((this.solution - amount) * 100) / 100;
      return true;
    }
    return false;
  }
  useSeeds(amount) {
    if (this.hasSeeds(amount)) {
      this.seeds = Math.round((this.seeds - amount) * 100) / 100;
      return true;
    }
    return false;
  }

  // Добавление
  addWater(amount) { this.water = Math.round((this.water + amount) * 100) / 100; }
  addSolution(amount) { this.solution = Math.round((this.solution + amount) * 100) / 100; }
  addSeeds(amount) { this.seeds = Math.round((this.seeds + amount) * 100) / 100; }
}