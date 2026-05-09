// Полка для прижима
export class Shelf {
  constructor(id) {
    this.id = id;
    this.containers = []; // массив id контейнеров
  }

  // Свободное место
  get freeSpace() {
    return 4 - this.containers.length; // CAPACITY.SHELF_CAPACITY
  }

  // Добавить контейнер
  addContainer(containerId) {
    if (this.freeSpace > 0) {
      this.containers.push(containerId);
      return true;
    }
    return false;
  }

  // Удалить контейнер
  removeContainer(containerId) {
    const index = this.containers.indexOf(containerId);
    if (index !== -1) {
      this.containers.splice(index, 1);
      return true;
    }
    return false;
  }
}