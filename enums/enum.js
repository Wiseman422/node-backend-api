import _ from 'lodash';

export default class Enum {
  constructor(enumObj) {
    this._enumObj = enumObj;
    this._invertedEnumObj = _.invert(enumObj);
  }

  value(name) {
    return this._enumObj[name];
  }

  name(value) {
    return this._invertedEnumObj[value];
  }
}
