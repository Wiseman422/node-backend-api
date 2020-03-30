import { RateLimiter } from 'limiter';

class Limiter {
  constructor(maxRequests) {
    this.limiter = new RateLimiter(maxRequests, 'hour', true);  // fire CB immediately 
  }

  middleware(req, res, next) {
    //Configure Limiter
    // Immediately send 429 header to client when rate limiting is in effect 
    this.limiter.removeTokens(1, (err, remainingRequests) => {
      console.log(remainingRequests);
      if (remainingRequests < 0) {
        res.sendStatus(429);
      }
      else {
        next();
      }
    });
  };
}



export default function (maxRequests) {
  let limiter = new Limiter(maxRequests);
  return limiter.middleware.bind(limiter);
}
