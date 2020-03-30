import Security from '../services/security';
import Entity from './entity';

export default class UserSecurity extends Entity {
  constructor(database) {
    super(database, 'UserSecurities');
  }

  create(userId, password, passwordReminder, pin) {
    let now = new Date();
    let security = new Security();
    let salt = security.generateSalt();
    let encryptedPassword = security.passwordHash(password, salt);

    let entity = {
      id: userId,
      salt: salt,
      encryptedPassword: encryptedPassword,
      encryptedMasterPassword: encryptedPassword,
      passwordReminder: passwordReminder,
      invalidLoginAttempts: 0,
      lastPasswordDateTimeUtc: now,
      emailIsConfirmed: false,
      hasTwoFactorAuthEnabled: false,
      dateCreatedUtc: now,
      dateModifiedUtc: now,
      deleted: false,
    };


    if (pin) {

      return security.encrypt(pin)
      .then((encryptedPIN) => {
        entity.secureStoragePIN = encryptedPIN;
        return this.insert(entity);
      });
    }

    return this.insert(entity);
  }

  checkPIN(userId, pin) {
    let security = new Security();

    return this.first(`select secureStoragePIN from ${this.tableName} where id = @userId`, { userId })
    .then((user) => security.decrypt(user.secureStoragePIN))
    .then((userPIN) => pin === userPIN);
  }

  getByUser(userId) {
    return this.first(`select 
      encryptedPassword, 
      encryptedMasterPassword, 
      secureStoragePIN,
      salt, 
      invalidLoginAttempts, 
      EmailIsConfirmed, 
      hasTwoFactorAuthEnabled, 
      secureStoragePIN,
      lockedOutUntilUtc, 
      lastLoginDateUtc
    from ${this.tableName} where id = @userId`, { userId });
  }
}
