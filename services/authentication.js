import jwt from 'jsonwebtoken';

import Security from './security';
import User from '../models/user';
import UserSecurity from '../models/userSecurity';
import Application from '../models/application';

export default class Authentication {
  constructor(database, config) {
    this.user = new User(database, config);
    this.userSecurity = new UserSecurity(database);
    this.application = new Application(database);

    this.secretKey = config.secure.app.secretKey;
    this.expiresIn = config.secure.app.tokenExpiresIn;
  }

  validateUser(user, password)
  {
    var security = new Security();

    return this.userSecurity.getByUser(user.id)
    .then(userSecurity => security.comparePasswords(password, userSecurity.salt, userSecurity.encryptedPassword))
    .then(result => {
      if (result) {
        return result;
      }
      else {
        throw new Error('Invalid Password');
      }
    });
  }

  authenticateApp(secret) 
  {
    return this.application.getBySecret(secret)
    .tap(app => {
      if (!app) {
        throw new Error('invalid secret');
      }
    })
    .then(app => jwt.sign(app, this.secretKey, { expiresIn: this.expiresIn }));
  }

}
