import uuid from 'node-uuid';
import Entity from './entity';

export default class Reminder extends Entity {
  constructor(database) {
    super(database, 'reminders');
  }

  getByMembership(membershipId) {
    return this.query(`
      select
        id, description, date, repeatInterval, userMembershipId
      from ${this.tableName}
      where deleted = 0 and userMembershipId = @membershipId
    `, {membershipId});
  }

  insert(reminder) {
    let now = new Date();
    let toInsert = {};

    toInsert.id = uuid.v4();
    toInsert.userMembershipId = reminder.userMembershipId;
    toInsert.description = reminder.description;
    toInsert.repeatInterval = reminder.repeatInterval;
    toInsert.date = reminder.date || now;
    toInsert.dateCreatedUtc = now;
    toInsert.dateModifiedUtc = now;
    toInsert.deleted = false;

    return super.insert(toInsert).then(() => toInsert);
  }
}
