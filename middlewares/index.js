import morgan from 'morgan';
import bodyParser from 'body-parser';
import compress from 'compression';
import expressValidator from 'express-validator';
import useragent from 'express-useragent';

import limiter from './security/limiter';
import cors from './security/cors';
import appAuthorization from './security/appAuthorization';
import databaseLifecycle from './database_lifecycle';



export default class Middlewares {
  static use(app) {
    let config = app.get('config');

    Middlewares.basic(app);

    if (config.isDevelopment) {
      Middlewares.debug(app);
    }

  }

  static basic(app) {
    let maxRequests = app.get('config').maxRequestPerHour;

    app.use(useragent.express());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(expressValidator()); 
    app.use(bodyParser.json());
    app.use(cors());
    app.use(databaseLifecycle(app));
    app.use(compress());
    app.use(appAuthorization());

    //app.use(limiter(maxRequests));
  }

  static debug(app) {
    app.use(morgan('dev'));
    app.use(function(err, req, res, next) {
      res.status(err.status || 500).send({ message: err.message || 'unknown error'});
    });
  }
}
