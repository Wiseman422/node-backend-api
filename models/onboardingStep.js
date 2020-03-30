import uuid from 'node-uuid';
import Entity from './entity';

export default class OnboardingStep extends Entity {
  constructor(database) {
    super(database, 'OnboardingSteps');
  }

  firstStepByCategory(category) {
    return this.first(`select TOP 1 id, category from ${this.tableName}
    where category = @category
    order by [order]`, { category });
  }

}
