import crypto from 'crypto';

export default class Security {

  comparePasswords(pass, salt, encryptedPassword)
  {
    return this.passwordHash(pass, salt) === encryptedPassword;
  }

  passwordHash(pass, salt)
  {
    var prepend = salt + pass;
    var buffer = new Buffer(prepend, 'utf8');

    return crypto.createHash('sha512').update(buffer).digest('base64');
  }

  generateSalt()
  {
    return crypto.randomBytes(256).toString('base64');
  }

  encrypt(text) {
    return this._processCipher(text, true);
  }

  decrypt(text) {
    return this._processCipher(text, false);
  }

  deriveKeyString(secret, salt) {
    return new Promise((resolve, reject) => {
      let iterations = 34563 + salt.length + secret.length;

      crypto.pbkdf2(secret, salt, iterations, 64, 'sha256', function(err, key) {
        if (err) {
          reject(err);
        }
        else {
          resolve(key.toString('base64'));
        }
      });
    });
  }

  _processCipher(text, isEncryption) {
    //Constants used in the old application source code
    const initVectorBytes = new Buffer('tz89gefi340t89w2', 'ascii');
    const key = new Buffer('4n8RLNdjUqIt1+0PeajGs4vQ0l8vf9ZKjozO5kmYOT8=', 'base64');

    let cipher = isEncryption ? 
    crypto.createCipheriv('aes-256-cbc', key, initVectorBytes) :
    crypto.createDecipheriv('aes-256-cbc', key, initVectorBytes);

    let resultText = isEncryption ? cipher.update(text, 'utf8', 'base64') : cipher.update(text, 'base64', 'utf8') ;
    resultText += cipher.final(isEncryption ? 'base64' : 'utf8');

    return Promise.resolve(resultText);
  }
}
