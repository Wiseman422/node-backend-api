//THIS INITIALIZATION FILE IS NEEDED FOR OVERRIDING BABEL STUFF (SUCH AS PROMISE)
//replacing defualt promise library to bluebird
var bluebird = require('bluebird');
require('babel-runtime/core-js/promise').default = bluebird;
GLOBAL.Promise = bluebird;

module.exports = function () {
  console.log('Application initialized');
};

