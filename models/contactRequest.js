import _ from 'lodash';
import uuid from 'node-uuid';
import Entity from './entity';

export default class ContactRequest extends Entity {
  constructor(database) {
    super(database, 'ContactRequests');
  }

  create(data) {
    let now = new Date();

    data = _.pick(data, 'ipAddress', 'userAgent', 'userId', 'name', 'email', 
    'topLevelSubject', 'subject', 'message');

    data.id = uuid.v4();
    data.userId = data.userId || '';
    data.dateCreatedUtc = now;
    data.dateModifiedUtc = now;
    data.deleted = false;

    return this.insert(data);
  }

}
