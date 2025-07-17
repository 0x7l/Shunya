const axios = require('axios');
const chalk = require('chalk');

/**
 * Fetch subdomains from bufferover.run
 * @param {string} domain - The target domain
 * @returns {Promise<string[]>} List of subdomains
 */
async function fetchFromBufferOver(domain) {
  const url = `https://dns.bufferover.run/dns?q=.${domain}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'ShunyaRecon/1.0 (+https://github.com/0x7l/Shunya)',
        'Accept': 'application/json',
      },
      timeout: 10000,
      validateStatus: () => true, // handle non-200 manually
    });

    if (response.status !== 200) {
      console.error(chalk.red(`[!] Bufferover responded with status ${response.status}`));
      return [];
    }

    const data = response.data;

    if (!data || !data.FQDN || !Array.isArray(data.FQDN)) {
      console.warn(chalk.yellow(`[!] No valid subdomain data from bufferover`));
      return [];
    }

    const cleaned = Array.from(new Set(
      data.FQDN.map(s => s.replace(/,$/, '').trim()).filter(Boolean)
    ));

    return cleaned;
  } catch (err) {
    console.error('[!] Error fetching from bufferover:', err && err.message ? err.message : err);
    return [];
  }
}

module.exports = { fetchFromBufferOver };