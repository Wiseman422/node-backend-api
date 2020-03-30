import Database from '../database';
import onFinished from 'on-finished';


class DatabaseLifecycle {
  singleton(app) {
    Database.connect(app.get('config').db)
    .then((database) => {
      this.database = database;
      console.log('Database Connection as singleton');
    })
    .catch(console.log);
  }

  middleware(req, res, next) {

    //creating and opening database connection at begining of request lifecycle
    if (this.database) {
      req.database = this.database;
      next();
    }
    else {
      Database.connect(req.app.get('config').db)
      .then((database) => {
        req.database = database;
        next();
      })
      .catch(next);

      //closing connection on database at the end of request lifecycle
      onFinished(req, (err, req) => {
        if (req.database) {
          req.database.close();
          req.database = null;
        }
      });
    }
  }
}

export default function(app) {
  let databaseLifecycle = new DatabaseLifecycle();
  databaseLifecycle.singleton(app);
  return databaseLifecycle.middleware.bind(databaseLifecycle);
}
