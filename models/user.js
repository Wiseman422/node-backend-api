import uuid from 'node-uuid';
import _ from 'lodash';
import Entity from './entity';
import VisibilitySettings from '../enums/visibilitySettings';
import LegalPolicyType from '../enums/legalPolicyType';
import UserSecurity from './userSecurity';
import UserCommunicationSetting from './userCommunicationSetting';
import UserOnboarding from './userOnboarding';
import LegalPolicy from './legalPolicy';
import PasswordGenerator from '../services/passwordGenerator';

export default class User extends Entity {
  constructor(database, config) {
    super(database, 'users');

    this.userSecurity = new UserSecurity(database);
    this.userCommunicationSetting = new UserCommunicationSetting(database);
    this.userOnboarding = new UserOnboarding(database);
    this.legalPolicy = new LegalPolicy(database);
    this.config = config;
  }

  getByEmail(email) {
    var s3Url = this.config.s3BucketAddress;
    return this.first(`
    select
      id, email, firstname, lastname, phoneNumber, @s3BucketAddress + profileImagePath as profileImagePath
      from ${this.tableName} where deleted = 0 and email = @email
    `, {s3BucketAddress : s3Url, email : email});
  }

  getMasterkey(user) {
    let passwordGenerator = new PasswordGenerator();

    return this.userSecurity.getByUser(user.id)
      .then(userSecurity => userSecurity.encryptedMasterPassword)
      .then(encPassword => passwordGenerator.generateMasterKey(encPassword, user.email));
  }

  signup(user) {
    let password = user.password;
    let passwordReminder = user.passwordReminder;
    let pin = user.pin;

    return this.getByEmail(user.email)
      .then(hasUser => {
        if (hasUser) {
          throw {status : 400, message : 'There is already an user with this email'};
        }
        else {
          return user;
        }
      })
      .then(() => {
        return Promise.all([
          this.legalPolicy.lastByPolicyType(LegalPolicyType.value('Privacy Policy')),
          this.legalPolicy.lastByPolicyType(LegalPolicyType.value('Terms and Conditions'))
        ]);
      })
      .spread((privacy, terms) => this.insert(user, privacy.id, terms.id))
      .tap(user => Promise.all([
        this.userSecurity.create(user.id, password, passwordReminder, pin),
        this.userCommunicationSetting.create(user.id),
        this.userOnboarding.startNew(user.id)
      ]));
  }

  insert(user, privacyPolicyId, termsAndConditionsId) {
    let now = new Date();

    user = _.pick(user, 'firstName', 'email', 'phoneNumber');
    user.id = uuid.v4();
    user.acceptedPrivacyPolicy = privacyPolicyId;
    user.privacyPolicyAcceptedDate = now;
    user.acceptedTermsAndConditions = termsAndConditionsId;
    user.termsAndConditionsAcceptedDate = now;
    user.joinedDate = now;
    user.dateCreatedUtc = now;
    user.dateModifiedUtc = now;
    user.showBasicInfo = true;
    user.showInterests = true;
    user.showMembershipStats = true;
    user.isBusinessOwner = false;
    user.isAdmin = false;
    user.isBlocked = false;
    user.viewedFriendPage = true;
    user.profileVisibility = VisibilitySettings.value('Friends only');
    user.membershipVisibility = VisibilitySettings.value('Friends only');
    user.bookmarkedMembershipVisibility = VisibilitySettings.value('Friends only');
    user.isOnOnboarding = true;
    user.showUnknownEmailSenders = true;
    user.deleted = false;

    return super.insert(user).then(dbUser => user);
  }
}
