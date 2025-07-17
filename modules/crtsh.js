const axios = require('axios');
const chalk = require('chalk');

/**
 * Fetch subdomains from crt.sh for the given domain
 * @param {string} domain - The target domain
 * @returns {Promise<string[]} List of subdomains
 */
async function fetchFromCrtSh(domain) {
  try {
    const url = `https://crt.sh/?q=%25.${domain}&output=json`;  // Correct query
    const { data } = await axios.get(url, { timeout: 150000 });

    if (!Array.isArray(data)) return [];

    const subdomains = new Set();

    data.forEach(entry => {
      const cn = entry.common_name;
      const name_value = entry.name_value;
      if (cn) subdomains.add(cn.trim());
      if (name_value) {
        name_value.split('\n').forEach(s => {
          if (s.trim().endsWith(domain)) subdomains.add(s.trim());
        });
      }
    });

    return Array.from(subdomains);
  } catch (err) {
    console.error('[!] CRT.sh lookup failed:', err && err.message ? err.message : err);
    return [];
  }
}

module.exports = {fetchFromCrtSh};