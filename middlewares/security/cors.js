
class Cors {
  constructor() {
  }

  middleware(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, GET, PATCH, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, app_token");
    next();
  }
}



export default function () {
  let cors = new Cors();
  return cors.middleware.bind(cors);
}
