const { RateLimiter } = require('limiter');

class RateLimiterService {
  constructor(requestsPerInterval, interval) {
    this.limiter = new RateLimiter({
      tokensPerInterval: requestsPerInterval,
      interval: interval
    });
  }

  async waitForTurn() {
    await this.limiter.removeTokens(1);
  }
}

module.exports = RateLimiterService;