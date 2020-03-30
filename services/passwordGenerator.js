import crypto from 'crypto';
import Security from './security';
import PasswordTemplatesCharacter from './passwordTemplatesCharacter';

export default class PasswordGenerator {

  generateMasterKey(password, email) {
    let security = new Security();
    return security.deriveKeyString(password, email);
  }

  generatePassword(masterKey, domain, credentialId, templates) {
    const seedSecretKey = '50c96b1e1404.joinesty.masterpassword';

    let seedText = seedSecretKey + domain + domain.length + credentialId;
    let seedBuffer = crypto.createHmac('sha256', masterKey).update(seedText).digest();

    let templateIndex = seedBuffer[0] % templates.length;
    let template  = templates[templateIndex];

    let password = template.split('').reduce((password, letter, index) => {
      let charactersTemplate = PasswordTemplatesCharacter.get(letter);
      let bufferValue = seedBuffer[ index + 1];
      let charIndex = bufferValue % charactersTemplate.length;

      return password + charactersTemplate[charIndex];
    }, '');

    return Promise.resolve(password);
  }
}
