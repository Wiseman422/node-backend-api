import Enum from './enum';

class TopLevelSubject extends Enum {
  constructor() {
    super({
      'Personal': 0,
      'Business': 1
    });
  }
}

export default new TopLevelSubject();
