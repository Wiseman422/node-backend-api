import Authorization from '../../services/authorization';
class AppAuthorization {
  constructor() {
  }

  middleware(req, res, next) {
    //Request token path or healthcheck (the only routes that doesn't need app authorization
    if (req.path === '/application/token' || req.path === '/healthcheck' || req.method === 'OPTIONS') {
      next();
    }
    else {
      let authorization = new Authorization(req.database, req.app.get('config')); 

      if (req.headers.app_token) {
        authorization.authorizeApp(req.headers.app_token)
        .tap(app => { req.clientApp = app; })
        .tap(app => { next(); })
        .catch(err => res.status(401).json(err));
      }
      else {
        res.status(401).json({ message: 'you need to provide the app_token header for this endpoint' });
      }
    }
  }
}



export function QQ() {
  let appAuthorization = new AppAuthorization();
  return appAuthorization.middleware.bind(appAuthorization);
}
