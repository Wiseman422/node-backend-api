import Enum from './enum';

class Subject extends Enum {
  constructor() {
    super({
      'General Inquiry': 0,
      'Support': 1,
      'Feedback': 2
    });
  }
}

export default new Subject();
