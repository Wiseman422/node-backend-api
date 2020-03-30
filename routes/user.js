import User from '../models/user';
import Review from '../models/review';
import Reminder from '../models/reminder';
import Business from '../models/business';
import Membership from '../models/membership';
import UserSecurity from '../models/userSecurity';
import UserMembership from '../models/userMembership';
import Authentication from '../services/authentication';
import VisibilitySettings from '../enums/visibilitySettings';
import PasswordGenerator from '../services/passwordGenerator';
import PasswordTemplates from '../services/passwordTemplates';
import UserMembershipCredential from '../models/userMembershipCredential';

import _ from 'lodash';

module.exports = (router) => {

  //USER RESOURCE =========================================
  router.get('/', (req, res) => {
    res.json({message : 'users'});
  });

  //USER LOGIN =========================================
  router.post('/login', (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;
    let userModel = new User(req.database, req.app.get('config'));
    let authentication = new Authentication(req.database, req.app.get('config'));

    userModel.getByEmail(email)
      .tap(user => {
        if (!user) {
          throw new Error('Unknown User');
        }
      })
      .tap(user => authentication.validateUser(user, password))
      .then(user => [user, userModel.getMasterkey(user)])
      .spread((user, masterkey) => {
        user.masterkey = masterkey;
        return user;
      })
      .then(user => res.status(200).json(user))
      .catch(next);
  });

  router.post('/:id/pin', (req, res, next) => {
    let userSecurity = new UserSecurity(req.database, req.app.get('config'));;
    userSecurity.checkPIN(req.params.id, req.body.pin)
      .then((valid) => {
        let resStatus = valid ? 200 : 401;
        res.status(resStatus).json({valid});
      })
      .catch(next);
  });

  //USER SIGNUP =========================================
  router.post('/signup', (req, res, next) => {

    req.checkBody('email', 'Enter a valid email address.').isEmail();
    req.checkBody('fullName', 'Name is required.').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
      res.status(400).send(errors);
    } else {
      let signup = _.pick(req.body, 'fullName', 'email', 'password', 'passwordReminder', 'pin', 'phoneNumber');
      let user = new User(req.database, req.app.get('config'));

      //TODO: find better way for doing this
      signup.firstName = signup.fullName;
      delete signup.fullName;

      user.signup(signup)
        .then(rows => res.status(201).json(rows))
        .catch(next);
    }
  });

  router.get('/masterpassword', (req, res, next) => {
    let passwordGenerator = new PasswordGenerator();
    passwordGenerator.generateMasterKey(req.query.masterpassword, req.query.email)
      .then(masterKey => passwordGenerator.generatePassword(masterKey, req.query.domain, req.query.credentialId, PasswordTemplates[req.query.passwordType]()))
      .then(password => res.status(200).json({password}))
      .catch(next);
  });

  //USER MEMBERSHIPS ==========================================
  router.get('/:id/memberships', (req, res, next) => {
    let id = req.params.id;
    var userMembership = new UserMembership(req.database, req.app.get('config'));
    let business = new Business(req.database, req.app.get('config'));

    userMembership.getByUser(id).then((rows) => {
      let promises = [];

      rows.forEach((row) => {
        if (row.businessId) {
          promises.push(
            business.getBusinessDeals(row.businessId).then((deal) => {
              row.deals = deal;
            })
          );
        }
      });

      Promise.all(promises).then(() => {
        res.status(200).json(rows);
      }).catch(next);
    });
  });

  router.post('/:id/memberships', (req, res, next) => {
    let userId = req.params.id;

    req.checkBody('businessId', 'businessId is required.').notEmpty();

    let errors = req.validationErrors();
    if (errors) {
      res.status(400).send(errors);
    } else {
      var membership = _.pick(req.body, 'businessId');
      membership.userId = userId;

      var membershipModel = new Membership(req.database, req.app.get('config'));;
      membershipModel.insert(membership)
        .then((rows) => {
          res.status(201).json(rows);
      }).catch(next);
    }
  });

  router.get('/:id/membershipsids', (req, res, next) => {
    let id = req.params.id;

    var userMembership = new UserMembership(req.database, req.app.get('config'));;
    var userMembershipCredential = new UserMembershipCredential(req.database, req.app.get('config'));;
    var business = new Business(req.database, req.app.get('config'));;

    userMembership.getBusinessByUser(id)
      .map(row => {
        row.memberships = userMembershipCredential.getDecryptedByMembership(row.id);
        return Promise.props(row);
      })
      .then(rows => res.status(200).json(rows))
      .catch(next);
  });

  //USER MEMBERSHIP CREDENTIALS ==========================================
  router.get('/memberships/:id/credentials', (req, res, next) => {
    let id = req.params.id;
    var credential = new UserMembershipCredential(req.database, req.app.get('config'));

    credential.getDecryptedByMembership(id).then((rows) => {
      res.status(200).json(rows);
    }).catch(next);
  });

  router.post('/memberships/credentials', (req, res, next) => {
    let membershipId = req.body.userMembershipId;

    req.checkBody('username', 'username is required.').notEmpty();
    req.checkBody('credentialId', 'credentialId is required').notEmpty();
    req.checkBody('userMembershipId', 'userMembershipId is required.').notEmpty();
    req.checkBody('isMasterPassword', 'isMasterPassword is required').notEmpty().isBoolean();

    let errors = req.validationErrors();
    if (errors) {
      res.status(400).send(errors);
    } else {
      var membershipCredential = _.pick(req.body, 'username', 'password', 'notes', 'credentialId', 'isMasterPassword');
      membershipCredential.userMembershipId = membershipId;

      var membership = new Membership(req.database, req.app.get('config'));;
      membership.insertCredential(membershipCredential)
        .then((rows) => {
          res.status(201).json(rows);
        }).catch(next);
    }
  });

  router.put('/memberships/credentials/:id', (req, res, next) => {
    let id = req.params.id;
    var credential = new UserMembershipCredential(req.database, req.app.get('config'));

    req.checkBody('username', 'username is required.').notEmpty();
    req.checkBody('isMasterPassword', 'isMasterPassword is required.').notEmpty();

    let errors = req.validationErrors();
    if (errors) {
      res.status(400).send(errors);
    } else {
      let toSave = _.pick(req.body, 'username', 'password', 'notes', 'isMasterPassword');
      credential.update(id, toSave).then((rows) => {
        res.status(200).json(rows);
      }).catch(next);
    }
  });

  router.patch('/memberships/credentials/:id', (req, res, next) => {
    let credentialId = req.params.id;
    let credential = _.pick(req.body, 'username', 'password', 'notes', 'credentialId', 'isMasterPassword');

    if (!Object.keys(credential).length) {
      res.status(400).send({message : 'There must be at least one valid credential field.'});
    } else {
      var membership = new Membership(req.database, req.app.get('config'));;
      membership.updateCredential(credentialId, credential)
        .then(() => {
          res.sendStatus(200);
        }).catch(next);
    }
  });

  router.delete('/memberships/credentials/:id', (req, res, next) => {
    let id = req.params.id;
    let membership = new Membership(req.database, req.app.get('config'));

    let toDelete = {
      'deleted'       : true,
      'deleteDateUtc' : new Date()
    };

    membership.updateCredential(id, toDelete).then(() => {
      res.sendStatus(200);
    }).catch(next);
  });

  // MEMBERSHIPS ==========================================
  router.get('/memberships/:id', (req, res, next) => {
    let id = req.params.id;
    var userMembership = new UserMembership(req.database, req.app.get('config'));

    userMembership.getById(id).then((rows) => {
      if (rows instanceof Array && rows.length === 1) {
        res.status(200).json(rows[0]);
      } else {
        res.status(404);
      }
    }).catch(next);
  });

  router.patch('/memberships/:id', (req, res, next) => {
    let id = req.params.id;
    let data = _.omit(req.body, ['id']);

    if (!Object.keys(data).length) {
      return res.status(400).json({message : 'No valid field found'});
    }

    let membership = new Membership(req.database, req.app.get('config'));;
    membership.update(id, data).then(() => {
      res.status(200).send(_.assign({id}, data));
    }).catch(next);
  });

  router.delete('/memberships/:id', (req, res, next) => {
    let id = req.params.id;
    let membership = new Membership(req.database, req.app.get('config'));

    let toDelete = {
      'deleted'       : true,
      'deleteDateUtc' : new Date()
    };

    membership.update(id, toDelete).then(() => {
      res.sendStatus(200);
    }).catch(next);
  });

  // MEMBERSHIP REMINDERS ==========================================
  router.get('/memberships/:id/reminders', (req, res, next) => {
    let id = req.params.id;
    var reminder = new Reminder(req.database, req.app.get('config'));

    reminder.getByMembership(id).then((rows) => {
      res.status(200).json(rows);
    }).catch(next);
  });

  router.post('/memberships/reminders', (req, res, next) => {
    var reminder = new Reminder(req.database, req.app.get('config'));

    req.checkBody('userMembershipId', 'userMembershipId is required.').notEmpty();
    req.checkBody('repeatInterval', 'repeatInterval is required.').notEmpty();

    let errors = req.validationErrors();
    if (errors) {
      res.status(400).send(errors);
    } else {
      let toSave = _.pick(req.body, 'userMembershipId', 'description', 'date', 'repeatInterval');
      reminder.insert(toSave).then((rows) => {
        res.status(201).json(rows);
      }).catch(next);
    }
  });

  router.put('/memberships/reminders/:id', (req, res, next) => {
    let id = req.params.id;
    var reminder = new Review(req.database, req.app.get('config'));

    req.checkBody('repeatInterval', 'repeatInterval is required.').notEmpty();

    let errors = req.validationErrors();
    if (errors) {
      res.status(400).send(errors);
    } else {
      let toSave = _.pick(req.body, 'description', 'date', 'repeatInterval');
      reminder.update(id, toSave).then((rows) => {
        res.status(200).json(rows);
      }).catch(next);
    }
  });

  router.delete('/memberships/reminders/:id', (req, res, next) => {
    let id = req.params.id;
    let reminder = new Reminder(req.database, req.app.get('config'));

    let toDelete = {
      'deleted'       : true,
      'deleteDateUtc' : new Date()
    };

    reminder.update(id, toDelete).then(() => {
      res.sendStatus(200);
    }).catch(next);
  });

  // USER REVIEW ==========================================
  router.post('/memberships/reviews', (req, res, next) => {
    var review = new Review(req.database, req.app.get('config'));

    req.checkBody('userId', 'userId is required.').notEmpty();
    req.checkBody('businessId', 'businessId is required.').notEmpty();
    req.checkBody('rating', 'rating is required.').notEmpty();

    let errors = req.validationErrors();
    if (errors) {
      res.status(400).send(errors);
    } else {
      let toSave = _.pick(req.body, 'userId', 'businessId', 'rating', 'body');
      review.insert(toSave).then((rows) => {
        res.status(201).json(rows);
      }).catch(next);
    }
  });

  router.put('/memberships/reviews/:id', (req, res, next) => {
    let id = req.params.id;
    var review = new Review(req.database, req.app.get('config'));

    req.checkBody('rating', 'rating is required.').notEmpty();

    let errors = req.validationErrors();
    if (errors) {
      res.status(400).send(errors);
    } else {
      let toSave = _.pick(req.body, 'rating', 'body');
      review.update(id, toSave).then((rows) => {
        res.status(200).json(rows);
      }).catch(next);
    }
  });

  //USER SETTINGS ==========================================
  router.get('/:id/settings', (req, res) => {
    let id = req.params.id;
    res.json({message : 'user settings: '});
  });

  //USER PROFILE ===========================================
  router.get('/:id/profile', (req, res) => {
    let id = req.params.id;
    res.json({message : 'user profile: '});
  });

  router.get('/:id', (req, res) => {
    var id = req.params.id;
    res.json({message : 'userid: '});
  });

  router.delete('/:id', (req, res) => {
    var id = req.params.id;
    res.json({message : 'user deleted: '});
  });
};
