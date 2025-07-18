const PQueue = require('p-queue').default;
const chalk = require('chalk');
const { fetchFromCrtSh } = require('../modules/crtsh');
const { fetchFromAlienVault } = require('../modules/alienvault');
const { resolveMany } = require('../modules/resolver');
const { httpProbe } = require('../modules/prober');
const { fetchGeoInfo } = require('../modules/geoip');
const { scanDirectories, loadWordlist } = require('../modules/dirscanner');

class ReconEngine {
  constructor(options) {
    this.options = options;
    this.queue = new PQueue({ concurrency: parseInt(options.threads) || 1 });
  }

  async run() {
    const domain = this.options.domain;

    // 🔎 Subdomain Enumeration
    const subdomains = await this.enumerateSubdomains(domain);

    // 🌐 DNS Resolution (via updated resolver.js)
    const resolved = await resolveMany(subdomains, parseInt(this.options.threads));

    // ✅ Logging DNS resolution in real-time
    resolved.forEach(r => {
      if (r.resolved) {
        console.log(chalk.green(`[+] Resolved: ${r.subdomain} -> ${r.ip}`));
      } else {
        console.log(chalk.gray(`[-] Failed: ${r.subdomain}`));
      }
    });

    // ⚡ HTTP Probing (optional)
    if (this.options.probe) {
      await Promise.all(
        resolved
          .filter(r => r.resolved)
          .map(sub => this.queue.add(async () => {
            const probe = await httpProbe(sub.subdomain);
            sub.statusCode = probe?.status || null;
            sub.title = probe?.title || '';
            if (sub.statusCode) {
              console.log(chalk.cyan(`[+] HTTP ${sub.statusCode} - ${sub.subdomain}`));
            }
          }))
      );
    }

    // 🌍 GeoIP Lookup (optional)
    let geoip = {};
    if (this.options.geoip) {
      const uniqueIps = [...new Set(resolved.map(r => r.ip).filter(Boolean))];
      geoip = await fetchGeoInfo(uniqueIps);
    }

    // 📁 Directory Scanning (optional)
    let dirscan = [];
    if (this.options.dirscan) {
      let wordlist = [];

      if (typeof this.options.dirscan === 'string') {
        wordlist = loadWordlist(this.options.dirscan);
      } else if (Array.isArray(this.options.dirscan)) {
        wordlist = this.options.dirscan;
      }

      dirscan = await scanDirectories(
        resolved.filter(r => r.resolved),
        wordlist,
        parseInt(this.options.threads)
      );
    }

    // 📦 Final output
    return {
      domain,
      timestamp: new Date().toISOString(),
      subdomains: resolved,
      geoip: this.options.geoip ? geoip : undefined,
      dirscan: this.options.dirscan ? dirscan : undefined
    };
  }

  async enumerateSubdomains(domain) {
    const passive1 = await fetchFromCrtSh(domain);
    const passive2 = await fetchFromAlienVault(domain);

    let wordlistSubs = [];
    if (this.options.wordlist) {
      const wordlist =
        typeof this.options.wordlist === 'string'
          ? loadWordlist(this.options.wordlist)
          : this.options.wordlist;

      wordlistSubs = wordlist.map(w => `${w}.${domain}`);
    }

    return Array.from(new Set([...passive1, ...passive2, ...wordlistSubs]));
  }
}

module.exports = ReconEngine;