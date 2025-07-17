#!/usr/bin/env node
const { Command } = require('commander');
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const csv = require('csv-writer').createObjectCsvWriter;

// Import modules
const { loadWordlist } = require('../modules/dirscanner');
const ReconEngine = require('../core/reconEngine');

const program = new Command();

program
  .name('shunya')
  .description('Shunya: Advance Subdomain Reconnaissance Tool\nIf --output is not specified, results are printed to the terminal.')
  .version('1.0.0')
  .requiredOption('-d, --domain <domain>', 'Target domain (e.g. example.com)')
  .option('-w, --wordlist <path>', 'Path to subdomain wordlist')
  .option('-t, --threads <number>', 'Concurrent threads', '30')
  .option('-o, --output <path>', 'Output file path (supports .csv, .json, .txt)')
  .option('--format <format>', 'Output format (table, csv, json, txt)', 'table')
  .option('--probe', 'Probe live subdomains via HTTP/HTTPS')
  .option('--geoip', 'Get GeoIP information')
  .option('--dirscan <path>', 'Directory brute-force wordlist')
  .parse();

async function main() {
  try {
    const options = program.opts();
    const domain = options.domain.toLowerCase();

    // Prepare wordlist for subdomain enumeration if provided
    let wordlist = [];
    if (options.wordlist) {
      wordlist = loadWordlist(path.resolve(options.wordlist));
    }

    // Prepare wordlist for dirscan if provided
    let dirscanWordlist = [];
    if (options.dirscan) {
      dirscanWordlist = loadWordlist(path.resolve(options.dirscan));
    }

    // Build engine options
    const engineOptions = {
      domain,
      threads: parseInt(options.threads),
      wordlist,
      probe: options.probe,
      geoip: options.geoip,
      dirscan: dirscanWordlist.length > 0 ? dirscanWordlist : undefined
    };

    printBanner(domain);

    const engine = new ReconEngine(engineOptions);
    const results = await engine.run();

    await handleOutput(results, options);

    console.log(chalk.green.bold('\n[+] Scan completed successfully!\n'));
  } catch (error) {
    console.error(chalk.red.bold('\n[-] Execution failed:'));
    console.error(chalk.red(`[-] ${error.message}\n`));
    process.exit(1);
  }
}

async function handleOutput(data, options) {
  const output = {
    format: options.format,
    path: options.output
  };

  // Determine format from file extension if output path specified
  if (output.path) {
    const ext = path.extname(output.path).slice(1);
    if (['json', 'csv', 'txt'].includes(ext)) {
      output.format = ext;
    }
  }

  // Process the output
  switch (output.format.toLowerCase()) {
    case 'json':
      await outputAsJson(data, output.path);
      break;
    case 'csv':
      await outputAsCsv(data, output.path);
      break;
    case 'txt':
      await outputAsTxt(data, output.path);
      break;
    case 'table':
      outputAsTable(data);
      break;
    default:
      throw new Error(`Unsupported format: ${output.format}`);
  }
}

async function outputAsJson(data, filePath) {
  const content = JSON.stringify(data, null, 2);
  if (filePath) {
    await fs.writeFile(filePath, content);
    console.log(chalk.green(`[+] JSON output saved to: ${filePath}`));
  } else {
    console.log(content);
  }
}

async function outputAsCsv(data, filePath) {
  const csvData = data.subdomains.map(item => ({
    subdomain: item.subdomain,
    ip: Array.isArray(item.ip) ? item.ip.join(',') : (item.ip || 'N/A'),
    status: item.resolved ? 'Resolved' : 'Failed',
    statusCode: item.statusCode || '',
    title: item.title || ''
  }));

  if (filePath) {
    const csvWriter = csv({
      path: filePath,
      header: [
        {id: 'subdomain', title: 'SUBDOMAIN'},
        {id: 'ip', title: 'IP_ADDRESS'},
        {id: 'status', title: 'STATUS'},
        {id: 'statusCode', title: 'HTTP_CODE'},
        {id: 'title', title: 'TITLE'}
      ]
    });
    await csvWriter.writeRecords(csvData);
    console.log(chalk.green(`[+] CSV output saved to: ${filePath}`));
  } else {
    const csvWriter = csv({
      header: [
        {id: 'subdomain', title: 'SUBDOMAIN'},
        {id: 'ip', title: 'IP_ADDRESS'},
        {id: 'status', title: 'STATUS'},
        {id: 'statusCode', title: 'HTTP_CODE'},
        {id: 'title', title: 'TITLE'}
      ]
    });
    const csvContent = await csvWriter.stringifyRecords(csvData);
    console.log(csvContent);
  }
}

async function outputAsTxt(data, filePath) {
  let content = `Shunya Scan Results for ${data.domain}\n`;
  content += `Generated at: ${data.timestamp}\n\n`;
  content += '=== SUBDOMAINS ===\n';

  data.subdomains.forEach(item => {
    content += `${item.subdomain} - ${Array.isArray(item.ip) ? item.ip.join(',') : (item.ip || 'N/A')} - ${item.resolved ? 'Resolved' : 'Failed'} - ${item.statusCode || 'N/A'} - ${item.title || ''}\n`;
  });

  if (filePath) {
    await fs.writeFile(filePath, content);
    console.log(chalk.green(`[+] Text output saved to: ${filePath}`));
  } else {
    console.log(content);
  }
}

function outputAsTable(data) {
  // Print each finding in a simple line format: subdomain [status code] - title
  data.subdomains.forEach(item => {
    const status = item.statusCode ? chalk.yellow(`[${item.statusCode}]`) : chalk.gray('[N/A]');
    const title = item.title ? chalk.cyan(`- ${item.title}`) : '';
    console.log(`${chalk.greenBright(item.subdomain)} ${status} ${title}`);
  });

  // Show summary
  console.log(chalk.bold('\nSummary'));
  console.log(`Total Subdomains: ${chalk.blue(data.subdomains.length)}`);
  console.log(`Resolved: ${chalk.green(data.subdomains.filter(d => d.resolved).length)}`);
  console.log(`Failed: ${chalk.red(data.subdomains.filter(d => !d.resolved).length)}`);
}

// Simple stylish banner
function printBanner(domain) {
  // Hacker-style banner
  console.log(chalk.hex('#00FF41')(`

    ██████  ██░ ██  █    ██  ███▄    █ ▓██   ██▓ ▄▄▄      
  ▒██    ▒ ▓██░ ██▒ ██  ▓██▒ ██ ▀█   █  ▒██  ██▒▒████▄    
  ░ ▓██▄   ▒██▀▀██░▓██  ▒██░▓██  ▀█ ██▒  ▒██ ██░▒██  ▀█▄  
    ▒   ██▒░▓█ ░██ ▓▓█  ░██░▓██▒  ▐▌██▒  ░ ▐██▓░░██▄▄▄▄██ 
  ▒██████▒▒░▓█▒░██▓▒▒█████▓ ▒██░   ▓██░  ░ ██▒▓░ ▓█   ▓██▒
  ▒ ▒▓▒ ▒ ░ ▒ ░░▒░▒░▒▓▒ ▒ ▒ ░ ▒░   ▒ ▒    ██▒▒▒  ▒▒   ▓▒█░
  ░ ░▒  ░ ░ ▒ ░▒░ ░░░▒░ ░ ░ ░ ░░   ░ ▒░ ▓██ ░▒░   ▒   ▒▒ ░
  ░  ░  ░   ░  ░░ ░ ░░░ ░ ░    ░   ░ ░  ▒ ▒ ░░    ░   ▒   
        ░   ░  ░  ░   ░              ░  ░ ░           ░  ░
                                        ░ ░          

  ╔════════════════════════════════════════════════════════╗
  ║       Coded by 0x7l  |  https://github.com/0x7l        ║
  ╚════════════════════════════════════════════════════════╝
  `));

  // Target info
  console.log(chalk.hex('#39FF14')(`\n[+] Target: ${chalk.bold(domain)}\n`));
  console.log(chalk.hex('#00FF41')('[~] Starting subdomain enumeration...\n'));
}

main();