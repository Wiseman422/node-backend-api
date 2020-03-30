import uuid from 'node-uuid';
import Entity from './entity';

export default class Reminder extends Entity {
  constructor(database) {
    super(database, 'reviews');
  }

  insert(review) {
    let now = new Date();
    let toInsert = {};

    toInsert.id = uuid.v4();
    toInsert.userId = review.userId;
    toInsert.businessId = review.businessId;
    toInsert.rating = review.rating;
    toInsert.body = review.body;
    toInsert.dateSubmittedUtc = now;
    toInsert.dateCreatedUtc = now;
    toInsert.dateModifiedUtc = now;
    toInsert.reviewDeleteReason = 0;
    toInsert.isHidden = false;
    toInsert.deleted = false;

    return super.insert(toInsert).then(() => toInsert);
  }
}
