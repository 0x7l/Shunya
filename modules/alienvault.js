const axios = require('axios');

async function fetchFromAlienVault(domain) {   
    try {
        const url = `https://otx.alienvault.com/api/v1/indicators/domain/${domain}/passive_dns`;
        const {data} = await axios.get(url, { timeout: 10000 });

        if (!data || !data.passive_dns) return [];

        const subdomains = new Set();
        data.passive_dns.forEach(entry => {
            const hostname = entry.hostname.trim();
            if (hostname.endsWith(`.${domain}`) || hostname === domain) {
                subdomains.add(hostname);
            }
        });

        return [...subdomains];
    } catch (err) {
        console.error(`[!] Alienvault lookup failed: ${err && err.message ? err.message : err}`);
        return [];
    }
}

module.exports = { fetchFromAlienVault };