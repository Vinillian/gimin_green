import { ACHIEVEMENTS } from '../../constants.js';
import { store } from '../store/index.js';
import { eventBus } from './eventBus.js';

class AchievementService {
  constructor() {
    this.achievements = ACHIEVEMENTS;
    eventBus.on('container:harvested', this.check.bind(this));
    eventBus.on('buckets:full', this.check.bind(this));
    // другие события
  }

  check() {
    let newAchievements = [];
    Object.values(this.achievements).forEach(ach => {
      if (!store.stats.achievements.includes(ach.id) && ach.condition(store.stats)) {
        store.stats.achievements.push(ach.id);
        newAchievements.push(ach);
        this.giveReward(ach);
      }
    });
    if (newAchievements.length) {
      eventBus.emit('achievements:new', newAchievements);
      store.notify();
    }
  }

  giveReward(achievement) {
    switch(achievement.id) {
      case 'first_crop':
        store.resources.addSeeds(5);
        break;
      case 'beginner_farmer':
        store.resources.addWater(10);
        break;
      case 'experienced_farmer':
        store.resources.addSolution(20);
        break;
      // остальные
    }
  }
}

export const achievementService = new AchievementService();