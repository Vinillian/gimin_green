// Поддон на свету (условный объект, используется для быстрого доступа)
import { CAPACITY } from '../../constants.js';

export class Pallet {
  constructor(number) {
    this.number = number; // 1 или 2
    this.start = (number - 1) * CAPACITY.PALLET_SIZE + 1;
    this.end = number * CAPACITY.PALLET_SIZE;
  }

  // Проверить, принадлежит ли номер контейнера этому поддону
  contains(containerNumber) {
    return containerNumber >= this.start && containerNumber <= this.end;
  }
}