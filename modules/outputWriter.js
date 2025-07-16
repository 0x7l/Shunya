// modules/outputWriter.js
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function saveAsJson(domain, data, outputDir) {
  try {
    const jsonPath = path.join(outputDir, `${domain}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    console.log(chalk.green(`[+] JSON saved: ${jsonPath}`));
  } catch (err) {
    console.error(chalk.red(`[-] Failed to save JSON: ${err.message}`));
  }
}

function saveAsCsv(domain, data, outputDir) {
  try {
    const csvPath = path.join(outputDir, `${domain}.csv`);
    const csvHeader = 'Subdomain,Resolved,IP(s),Timestamp\n';
    const csvBody = data.map(entry => {
      const ipField = Array.isArray(entry.ip) ? entry.ip.join('|') : entry.ip;
      return `${entry.subdomain},${entry.resolved},${ipField},${entry.timestamp}`;
    }).join('\n');

    fs.writeFileSync(csvPath, csvHeader + csvBody);
    console.log(chalk.green(`[+] CSV saved: ${csvPath}`));
  } catch (err) {
    console.error(chalk.red(`[-] Failed to save CSV: ${err.message}`));
  }
}

module.exports = { saveAsJson, saveAsCsv };