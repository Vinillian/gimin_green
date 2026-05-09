import { CAPACITY } from '../../constants.js';

export class Shelf {
  constructor(id) {
    this.id = id;
    this.containers = [];
  }

  get freeSpace() {
    return CAPACITY.SHELF_CAPACITY - this.containers.length;
  }

  addContainer(containerId) {
    if (this.freeSpace > 0) {
      this.containers.push(containerId);
      return true;
    }
    return false;
  }

  removeContainer(containerId) {
    const index = this.containers.indexOf(containerId);
    if (index !== -1) {
      this.containers.splice(index, 1);
      return true;
    }
    return false;
  }
}