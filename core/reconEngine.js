const PQueue = require('p-queue').default;
const { fetchFromCrtSh } = require('../modules/crtsh');
const { fetchFromBufferOver } = require('../modules/bufferover');
const { dnsResolve } = require('../modules/resolver');
const { httpProbe } = require('../modules/prober');
const { fetchGeoInfo } = require('../modules/geoip');
const { scanDirectories , loadWordlist } = require('../modules/dirscanner');

class ReconEngine {
  constructor(options) {
    this.options = options;
    const concurrency = parseInt(options.threads) || 20;
    this.queue = new PQueue({ concurrency });
  }

  async run() {
    // Subdomain Enumeration
    const subdomains = await this.enumerateSubdomains();


    // DNS Resolution
    const resolved = [];
    await Promise.all(
      subdomains.map(sub => {
        return this.queue.add(async () => {
          const res = await dnsResolve(sub);
          resolved.push({
            subdomain: sub,
            ip: res?.ip || null,
            resolved: res?.resolved || false
          });
        });
      })
    );

    // Active Probing: merge results into resolved array
    if (this.options.probe) {
      await Promise.all(
        resolved.filter(r => r.resolved).map(async sub => {
          const res = await httpProbe(sub.subdomain);
          sub.statusCode = res?.status || null;
          sub.title = res?.title || '';
        })
      );
    }


    // GeoIP Lookup
    let geoip = {};
    if (this.options.geoip) {
      const ips = [...new Set(resolved.filter(r => r.ip).map(r => r.ip))];
      geoip = await fetchGeoInfo(ips);
    }

    // Directory Scanning
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

    return {
      domain: this.options.domain,
      subdomains: resolved,
      geoip: this.options.geoip ? geoip : undefined,
      dirscan: this.options.dirscan ? dirscan : undefined,
      timestamp: new Date().toISOString()
    };
  }

  async enumerateSubdomains() {
    // Fetch from passive sources
    const domain = this.options.domain;
    let wordlist = [];
    if (this.options.wordlist) {
      if (typeof this.options.wordlist === 'string') {
        wordlist = loadWordlist(this.options.wordlist);
      } else if (Array.isArray(this.options.wordlist)) {
        wordlist = this.options.wordlist;
      }
    }
    const crtshSubs = await fetchFromCrtSh(domain);
    const buffSubs = await fetchFromBufferOver(domain);
    const wordlistSubs = wordlist.map(w => `${w}.${domain}`);
    // Merge and deduplicate
    return Array.from(new Set([...crtshSubs, ...buffSubs, ...wordlistSubs]));
  }
}

module.exports = ReconEngine;