const axios = require('axios');

async function fetchFromCrtSh(domain) {
  try {
    const response = await fetch(`https://crt.sh/?q=%25.${domain}&output=json`, {
      headers: { 
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      },
      timeout: 60000
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    return data.map(entry => entry.name_value.toLowerCase().trim())
              .filter(s => s && !s.startsWith('*'));
  } catch (error) {
    console.error(chalk.yellow(`[!] CRT.sh lookup failed: ${error.message}`));
    return [];
  }
}

module.exports = {fetchFromCrtSh};