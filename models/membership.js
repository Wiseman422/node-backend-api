import _ from 'lodash';
import uuid from 'node-uuid';
import Location from './location';
import DomainParse from '../services/domainParse';
import UserMembership from '../models/userMembership';
import UserMembershipCredential from '../models/userMembershipCredential';

export default class Membership {
  constructor(database, config) {
    this._location = new Location(database);
    this._userMembership = new UserMembership(database, config);
    this._userMembershipCredential = new UserMembershipCredential(database, config);
  }

  async _findBusinessesWithSameDomainByMembershipId(membership) {
    let domainParse = new DomainParse();


    let businessUrls = await this._location.getByBusiness(membership.businessId);
    let groupedBusinessUrls = await Promise.map(businessUrls, businessUrl => {
      let domain = domainParse.parse(businessUrl.url)
      return this._location.getByDomain(domain);
    });

    businessUrls = await Promise.reduce(groupedBusinessUrls, (items, groupedBusinessUrls) => {
      return items.concat(groupedBusinessUrls);
    }, []);

    let businessIds = Object.keys(_.groupBy(businessUrls, 'businessId'));

    businessIds = businessIds.filter(businessId => {
      return businessId !== membership.businessId;
    });

    return businessIds;
  }

  async _copyOtherMemberships(membership) {

    let businessIds = await this._findBusinessesWithSameDomainByMembershipId(membership);

    return await Promise.map(businessIds, businessId => {
      return this._userMembership.getByUserAndBusiness(membership.userId, businessId)
    })
    .map(otherMembership => {
      if (otherMembership) {
        return this._userMembershipCredential.getDecryptedByMembership(otherMembership.id);
      }

      return [];
    })
    .reduce((credentials, membershipCredentials) => {
      return credentials.concat(membershipCredentials);
    }, [])
    .then(credentials => {
      let groupedCredentials = _.groupBy(credentials, 'username');
      return Object.keys(groupedCredentials).map(username => groupedCredentials[username].pop());
    })
    .map(credential => {

      credential.userMembershipId = membership.id;

      return this._userMembershipCredential.insert(credential);
    })

  }

  async _saveOrUpdateOtherMemberships(membershipId, credential) {

    let memberships = await this._userMembership.getById(membershipId);
    let membership = memberships.pop();

    let businessIds = await this._findBusinessesWithSameDomainByMembershipId(membership);

    return await Promise.map(businessIds, businessId => {
      return this._userMembership.getByUserAndBusiness(membership.userId, businessId)
    })
    .map(otherMembership => {
      let promisses = [otherMembership];

      if (otherMembership) {
        let existingCredential = this._userMembershipCredential.getByMembershipUsername(otherMembership.id, credential.username);
        promisses.push(existingCredential);
      }

      return Promise.all(promisses);
    })
    .map(([otherMembership, existingCredential]) => {
      if (otherMembership) {
        let credentialCopy = _.clone(credential);

        delete credentialCopy.id;
        delete credentialCopy.userMembershipId;

        credentialCopy.userMembershipId = otherMembership.id;

        if (existingCredential) {
          return this._userMembershipCredential.update(existingCredential.id, credentialCopy);
        }
        else if (!credentialCopy.deleted) {

          return this._userMembershipCredential.insert(credentialCopy);
        }
      }

      return null;
    });
  }

  insert(membership) {
    return this._userMembership.insert(membership)
    .tap((membership) => {
      return this._copyOtherMemberships(membership);
    });
  }

  update(id, membership) {
    return this._userMembership.update(id, membership);
  }

  insertCredential(credential) {
    return this._userMembershipCredential.insert(credential)
    .tap(() => {
      return this._saveOrUpdateOtherMemberships(credential.userMembershipId, credential);
    });
  }

  updateCredential(id, credential) {
    return this._userMembershipCredential.update(id, credential)
    .tap((cred) => {
      return this._saveOrUpdateOtherMemberships(cred.userMembershipId, cred);
    });
  }

}
