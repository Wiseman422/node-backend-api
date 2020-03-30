import Security from '../services/security';
import Entity from './entity';

export default class UserCommunicationSetting extends Entity {
  constructor(database) {
    super(database, 'UserCommunicationSettings');
  }

  create(userId) {

    let now = new Date();
    let entity = {
      id: userId,
      notifyOnFriendAcceptance: true,
      notifyOnInviteeJoin: true,
      notifyOnRecommendedMembershipBookmarked: true,
      notifyOnRecommendedMembershipJoined: true,
      notifyOnRecommendedMembershipViewed: true,
      notifyOnRemindersTrigerred: true,
      emailOnFriendAcceptance: true,
      emailOnRemindersTrigerred: true,
      emailOnReceiveJoinerRequest: true,
      notificationMethod: 0,
      remindersMethod: 0,
      notificationDigest: 0,
      deleted: false,
      dateCreatedUtc: now,
      dateModifiedUtc: now
    };

    return this.insert(entity);
  }
}
