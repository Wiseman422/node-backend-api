
import initialize from './app.initializer';

initialize();

import express from 'express';
import enrouten from 'express-enrouten';
import Middlewares from './middlewares';

let app = express();

app.set('view cache', false );
app.set('json spaces', 4);
app.set('x-powered-by', false);
app.set('port', process.env.PORT || 8080);
app.set('config', require('./config/' + app.get('env')));

Middlewares.use(app);

app.use(enrouten({ directory: 'routes' }));

let server = app.listen(app.get('port'), () => {
  console.log(`Express server listening on port ${server.address().port}`);
});
