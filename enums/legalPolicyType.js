import Enum from './enum';

class LegalPolicyType extends Enum {
  constructor() {
    super({
      'Privacy Policy': 0,
      'Terms and Conditions': 1
    });
  }
}

export default new LegalPolicyType();
