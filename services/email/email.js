import mandrill from 'mandrill-api/mandrill';

export default class Email {
  constructor(config) {
    this.mandrillClient = new mandrill.Mandrill(config.mandrill_key);
  }

  sendEmail(recipient, templateName, data, metadata) {

    return this._composeMessage(recipient, data, metadata)
    .then(message => this._sendTemplate(message, templateName));
  }

  _sendTemplate(message, templateName) {
    return new Promise((resolve, reject) => {
      this.mandrillClient.messages
      .sendTemplate({ 
        template_content: [],
        template_name: templateName,
        message: message,
        async: true,
        send_at: null
      }, resolve);
    });
  }

  _composeMessage(recipient, data, metadata) {
    let message = {
      to: [{
        email: recipient.email,
        name: recipient.name,
        type: 'to'
      }],
      merge_vars: [{
        rcpt: recipient.email,
        vars: [{
          name: 'data',
          content: data
        }]
      }],
      metadata: metadata
    };

    return Promise.resolve(message);
  }
}
