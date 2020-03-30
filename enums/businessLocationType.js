import Enum from './enum';

class BusinessLocationType extends Enum {
  constructor() {
    super({
      'Empty': 0,
      'Local and Online': 1,
      'Local': 2,
      'Online': 3
    });
  }
}

export default new BusinessLocationType();
