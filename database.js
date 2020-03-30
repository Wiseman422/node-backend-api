import mssql from 'mssql'; 

mssql.Promise = Promise;
mssql.on('error', err => {
  console.log(err);
});

export default class Database {

  static connect(config) {

    let database = new Database();
    let connection = new mssql.Connection(config);

    return connection.connect().then(() => {
      database.connection = connection;
      return database;
    });
  }


  close() {
    if (this.connection && this.connection.close) {
      this.connection.close();
    }
  }

  query(sql, params) {
    return this.createRequest()
    .then(request => this._configureParams(request, params))
    .then(request => request.query(sql));
  }

  createTransaction() {
    var transaction = this.connection.transaction();
    return transaction.begin()
    .then(obj => transaction);
  }

  createRequest(transaction) {
    if (transaction) {
      return Promise.resolve(transaction.request());
    }
    else {
      return Promise.resolve(new mssql.Request(this.connection));
    }
  }

  createStreamRequest() {
    let request = new mssql.Request(this.connection);
    request.stream = true;
    return Promise.resolve(request);
  }

  _configureParams(request, params) {
    if (params) {
      Object.keys(params).forEach(function(paramName) {
        request.input(paramName, params[paramName]);
      });
    }

    return request;
  }
}
