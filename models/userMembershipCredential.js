import _ from 'lodash';
import uuid from 'node-uuid';
import Entity from './entity';
import Security from '../services/security';

export default class UserMembershipCredential extends Entity {
  constructor(database) {
    super(database, 'UserMembershipCredentials');
  }

  decryptMembershipCredentials(membershipCredential) {
    let security = new Security();

    let promise = security.decrypt(membershipCredential.username)
      .then(username => membershipCredential.username = username);

    if (membershipCredential.password) {
      promise = promise
        .then(() => security.decrypt(membershipCredential.password))
        .then(password => membershipCredential.password = password);
    }

    return promise
      .then(() => membershipCredential);
  }

  findDecryptedById(id) {
    return this.first(`select id, userMembershipId, username, password, notes, credentialId, isMasterPassword, deleted
    from ${this.tableName}
    where id = @id`, {id})
      .then(this.decryptMembershipCredentials);
  }

  getDecryptedByMembership(membershipId) {
    return this.query(`select id, username, password, notes, credentialId, isMasterPassword
      from ${this.tableName}
      where userMembershipId = @membershipId and deleted = 0`, {membershipId})
      .map(this.decryptMembershipCredentials);
  }

  getByMembershipUsername(userMembershipId, username) {
    let security = new Security();

    return security.encrypt(username)
    .then(encUsername => {
      return this.first(`select id, username, password, notes, credentialId, isMasterPassword
        from ${this.tableName}
      where userMembershipId = @userMembershipId and username = @username and deleted = 0`, { userMembershipId, username: encUsername });
    });
  }

  insert(credential) {
    return this.getByMembershipUsername(credential.userMembershipId, credential.username)
    .then(membership => {
      if (membership) {
        throw {status : 400, message : 'There is already a membership credential for this username'};
      }

      let security = new Security();
      let now = new Date();

      let password = credential.password;
      let username = credential.username;

      credential.id = uuid.v4();
      credential.deleted = false;
      credential.dateCreatedUtc = now;
      credential.dateModifiedUtc = now;

      let promise = security.encrypt(credential.username)
      .then(username => credential.username = username);

      if (credential.password) {

        promise = promise
        .then(() => security.encrypt(credential.password))
        .then(password => credential.password = password);
      }

      return promise
      .then(() => super.insert(credential))
      .then(() => {
        credential.username = username;
        credential.password = password;
        return credential;
      });
    });
  }

  update(id, credential) {

    let security = new Security();
    let promises = [];

    if (credential.username) {
      promises.push(security.encrypt(credential.username).then(username => credential.username = username));
    }

    if (credential.password) {
      promises.push(security.encrypt(credential.password).then(password => credential.password = password));
    }

    return Promise.all(promises)
    .then(() => super.update(id, credential))
    .then(() => this.findDecryptedById(id));
  }
}
