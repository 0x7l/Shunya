const axios = require('axios');

async function fetchFromBufferOver(domain) {
    try {
        const url = `https://dns.bufferover.run/dns?q=.${domain}`;
        const { data } = await axios.get(url, { timeout: 10000 });
        if (!data || !data.FQDN) return [];
        // FQDN is an array of subdomains
        return data.FQDN.map(sub => sub.replace(/\,$/, '').trim()).filter(Boolean);
    } catch (err) {
        console.error(`[!] Error fetching from bufferover: ${err.message}`);
        return [];
    }
}

module.exports = { fetchFromBufferOver };