export default class PasswordTemplatesCharacter {
  static _templatesCharacters() {
    return {
      'V' : 'AEIOU',
      'C' : 'BCDFGHJKLMNPQRSTVWXYZ',
      'v' : 'aeiou',
      'c' : 'bcdfghjklmnpqrstvwxyz',
      'A' : 'AEIOUBCDFGHJKLMNPQRSTVWXYZ',
      'a' : 'AEIOUaeiouBCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz',
      'n' : '0123456789',
      'o' : "@&%?,=[]_:-+*$#!'^~;()/.",
      'x' : "AEIOUaeiouBCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz0123456789!@#$%^&*()"
    };
  }

  static get(letter) {
    return this._templatesCharacters()[letter];
  }
}
  
