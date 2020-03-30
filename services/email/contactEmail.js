import _ from 'lodash';

import Email from './email';
import TopLevelSubject from '../../enums/topLevelSubject';
import Subject from '../../enums/subject';

export default class ContactEmail extends Email {
  constructor(config) {
    super(config);
    this.config = config;
  }

  send(data) {
    data = _.cloneDeep(data);
    data.topLevelSubject = TopLevelSubject.name(data.topLevelSubject);
    data.subject = Subject.name(data.subject);

    return this.sendEmail(this.config.feedbackRecipient, 'feedback', data);
  }
}
 
