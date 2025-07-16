// modules/geoip.js
const axios = require('axios');
const chalk = require('chalk');

/**
 * Fetch GeoIP data from ip-api.com
 * @param {string[]} ipList
 */
async function fetchGeoInfo(ipList) {
  const results = {};

  for (const ip of ipList) {
    try {
      const res = await axios.get(`http://ip-api.com/json/${ip}`, {
        timeout: 7000
      });

      if (res.data && res.data.status === 'success') {
        results[ip] = {
          country: res.data.country,
          city: res.data.city,
          asn: res.data.as,
          org: res.data.org,
          isp: res.data.isp
        };
        console.log(chalk.cyan(`[+] GeoIP: ${ip} -> ${res.data.country}, ${res.data.org}`));
      } else {
        results[ip] = null;
        console.log(chalk.gray(`[-] Failed GeoIP: ${ip}`));
      }
    } catch (err) {
      results[ip] = null;
      console.log(chalk.red(`[-] Error GeoIP ${ip}: ${err.message}`));
    }
  }

  return results;
}
module.exports = { fetchGeoInfo };
