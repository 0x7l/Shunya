const dns = require('dns').promises;
const PQueue = require('p-queue').default;
const chalk = require('chalk');
const queue = new PQueue({ concurrency: 15 }); // OPSEC-tuned

/**
 * Resolve a single subdomain with retries and timeout.
 * @param {string} subdomain
 * @param {number} retries
 * @returns {Promise<Object>}
 */
async function dnsResolve(subdomain, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const addresses = await dns.resolve(subdomain, { signal: controller.signal });
      clearTimeout(timeout);

      return {
        subdomain,
        ip: addresses,
        resolved: true,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      if (attempt === retries) {
        return {
          subdomain,
          ip: [],
          resolved: false,
          timestamp: new Date().toISOString()
        };
      }
      await new Promise(r => setTimeout(r, 500 * attempt)); // Exponential backoff
    }
  }
}

/**
 * Resolve multiple subdomains concurrently using PQueue.
 * @param {string[]} subdomains
 * @returns {Promise<Object[]>}
 */
async function resolveMany(subdomains = []) {
  const results = [];

  await Promise.all(subdomains.map(sub =>
    queue.add(async () => {
      const result = await dnsResolve(sub);
      results.push(result);

      const status = result.resolved ? chalk.green('✅') : chalk.red('❌');
      const ipDisplay = result.resolved ? chalk.gray(result.ip.join(', ')) : '';
      console.log(`[${status}] ${chalk.bold(sub)} ${ipDisplay}`);
    })
  ));

  return results;
}

module.exports = {
  dnsResolve,
  resolveMany
};