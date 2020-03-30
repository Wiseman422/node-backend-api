
import jwt from 'jsonwebtoken';

import Security from './security';
import Application from '../models/application';

export default class AUthorization {
  constructor(database, config) {
    this.application = new Application(database);
    this.secretKey = config.secure.app.secretKey;
  }

  _verifyToken(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.secretKey, (err, decoded) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(decoded);
        }
      });
    });
  }

  authorizeApp(token) 
  {
    return this._verifyToken(token)
    .then(decoded => this.application.getBySecret(decoded.secret))
    .tap(app => {
      if (!app) {
        throw new Error('invalid secret');
      }
    });
  }
}
