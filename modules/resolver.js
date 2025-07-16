// modules/resolver.js
const dns = require('dns').promises;

/**
 * Resolve a single subdomain.
 * Used with PQueue from reconEngine.js
 * @param {string} subdomain
 */
async function dnsResolve(subdomain) {
  try {
    const addresses = await dns.resolve(subdomain);
    return {
      subdomain,
      ip: addresses,
      resolved: true,
      timestamp: new Date().toISOString()
    };
  } catch {
    return {
      subdomain,
      ip: [],
      resolved: false,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { dnsResolve };