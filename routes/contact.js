import ContactRequest from '../models/contactRequest';
import ContactEmail from '../services/email/contactEmail';
import _ from 'lodash';

export default (router) => {

  router.post('/sendFeedback', (req, res, next) => {
    req.checkBody('email', 'Enter a valid email address.').isEmail();
    req.checkBody('name', 'Name is required.').notEmpty();
    req.checkBody('topLevelSubject', 'Subject is required').notEmpty();
    req.checkBody('subject', 'Subject is required').notEmpty();
    req.checkBody('message', 'Message is required').notEmpty();


    var errors = req.validationErrors();

    if (errors) {
      res.status(400).send(errors);
    }
    else {
      let data = _.pick(req.body, 'email', 'name', 'topLevelSubject', 'subject', 'message');

      data.ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      data.userAgent = JSON.stringify(req.useragent);

      let contactRequest =  new ContactRequest(req.database);
      let contactEmail =  new ContactEmail(req.app.get('config').email);

      Promise.all([
        contactRequest.save(data),
        contactEmail.send(data)
      ])
      .then(results => res.sendStatus(201))
      .catch(next);
    }
  });
};
