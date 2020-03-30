import Enum from './enum';

class VisibilitySettings extends Enum {
  constructor() {
    super({
      'Only me': 0,
      'Friends only': 1,
      'All Joinesty': 2
    });
  }
}

export default new VisibilitySettings();
