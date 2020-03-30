import Authentication from '../services/authentication';

export default (router) => {

  router.post('/token', (req, res, next) => {
    if (req.body.secret) {
      var authentication = new Authentication(req.database, req.app.get('config'));

      authentication.authenticateApp(req.body.secret)
      .then(token => res.status(200).json({ token }))
      .catch(err => next(err));
    }
    else {
      res.status(400).json({ message: 'secret field is required.'});
    }
  });

  router.get('/info', (req, res, next) => {
    res.status(200).json(req.clientApp);
  });
};
