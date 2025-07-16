// modules/dirscanner.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

/**
 * Scan directories on a target subdomain
 * @param {string} baseUrl - http(s)://example.com
 * @param {string[]} wordlist - list of paths
 * @param {number} threads - concurrency level
 */
async function scanDirectories(baseUrl, wordlist, threads = 20) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < wordlist.length) {
      const i = index++;
      const word = wordlist[i];
      const url = `${baseUrl}/${word}`;

      try {
        const res = await axios.get(url, {
          timeout: 8000,
          maxRedirects: 2,
          validateStatus: () => true,
        });

        if (![404, 400].includes(res.status)) {
          results.push({
            path: `/${word}`,
            status: res.status,
            length: res.headers['content-length'] || res.data.length,
            url
          });

          console.log(chalk.green(`[+] ${res.status} ${url}`));
        } else {
          console.log(chalk.gray(`[-] ${res.status} ${url}`));
        }

      } catch (err) {
        console.log(chalk.red(`[!] Error: ${url}`));
      }
    }
  }

  const jobs = [];
  for (let i = 0; i < threads; i++) {
    jobs.push(worker());
  }

  await Promise.allSettled(jobs);
  return results;
}

/**
 * Load wordlist from file
 */
function loadWordlist(filepath) {
  try {
    const absPath = path.resolve(filepath);
    const raw = fs.readFileSync(absPath, 'utf-8');
    return raw.split('\n').map(l => l.trim()).filter(Boolean);
  } catch (err) {
    console.error(chalk.red(`[-] Failed to load wordlist: ${err.message}`));
    return [];
  }
}

module.exports = { scanDirectories, loadWordlist };
