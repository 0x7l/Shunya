// modules/prober.js
const axios = require('axios');

/**
 * Probes a single subdomain using HTTP and HTTPS
 * @param {string} subdomain
 * @param {number} timeout
 */
async function httpProbe(subdomain, timeout = 8000) {
  const urlsToTry = [`http://${subdomain}`, `https://${subdomain}`];

  for (const url of urlsToTry) {
    try {
      const res = await axios.get(url, {
        timeout,
        maxRedirects: 3,
        validateStatus: () => true,
      });

      return {
        subdomain,
        url,
        status: res.status,
        title: extractTitle(res.data),
        length: res.headers['content-length'] || res.data.length,
      };
    } catch (err) {
      // try next protocol
      continue;
    }
  }

  return {
    subdomain,
    url: null,
    status: null,
    title: null,
    length: null,
  };
}

/**
 * Extracts the <title> tag from HTML
 * @param {string} html
 */
function extractTitle(html) {
  const match = html.match(/<title>(.*?)<\/title>/i);
  return match ? match[1].trim() : null;
}

module.exports = { httpProbe };