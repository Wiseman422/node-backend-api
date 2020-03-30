import uuid from 'node-uuid';
import Entity from './entity';
import OnboardingStep from './onboardingStep';

export default class UserOnboarding extends Entity {
  constructor(database) {
    super(database, 'UserOnboardings');

    this.onboardingStep = new OnboardingStep(database);
  }

  startNew(userId, category = 'A') {
    return this.onboardingStep.firstStepByCategory(category)
    .then(step => this.create(userId, step));

  }

  create(userId, step) {
    let now = new Date();

    let entity = {
      id: uuid.v4(),
      userId: userId,
      onboardingStepId: step.id,
      category: step.category,
      done: false,
      skip: false,
      dateCreatedUtc: now,
      dateModifiedUtc: now,
      deleted: false
    };

    return this.insert(entity);
  }
}
