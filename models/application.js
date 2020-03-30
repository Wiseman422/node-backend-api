import _ from 'lodash';
import Entity from './entity';

export default class Application extends Entity {
  constructor(database) {
    super(database, 'applications');

    //mocking up while we don't have the database table
    this.applications = [
      this._createApp('Joinesty front-end-v2', 'Bx522vYx66b30pX190Ug2odY5AKgJ9p3'),
      this._createApp('Joinesty browser-extension', 'UvInDooZ05G8OWlqiVOC5Yd1xNet9WtN')
    ];
  }

  _createApp(name, secret) {
    return { name, secret };
  }

  getBySecret(secret) {
    return Promise.resolve(_.find(this.applications, 'secret', secret));
  }

  getByName(name) {
    return Promise.resolve(_.find(this.applications, 'name', name));
  }
}
