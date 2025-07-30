const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const resolversFile = path.join(__dirname, "resolvers.txt");

// Ensure resolvers.txt exists with fallback resolvers
if (!fs.existsSync(resolversFile)) {
  fs.writeFileSync(resolversFile, "8.8.8.8\n1.1.1.1\n");
}

/**
 * Resolves a list of subdomains using massdns
 * @param {string[]} subdomains - list of subdomains to resolve
 * @returns {Promise<Object[]>} - resolved domains with IPs
 */
function resolveDomains(subdomains = []) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(subdomains) || subdomains.length === 0) {
      return resolve([]); // No input, return empty
    }

    const tmpInput = path.join(os.tmpdir(), `shunya_input_${Date.now()}.txt`);

    fs.writeFileSync(tmpInput, subdomains.join("\n"));

    const massdns = spawn("massdns", [
      "-r", resolversFile,
      "-o", "S",     // Simple stdout format
      "-q",          // Quiet
      "-t", "A",     // Type A records
      tmpInput
    ]);

    let output = "";
    let error = "";

    massdns.stdout.on("data", (data) => {
      output += data.toString();
    });

    massdns.stderr.on("data", (data) => {
      error += data.toString();
    });

    massdns.on("close", (code) => {
      fs.unlinkSync(tmpInput);

      if (code !== 0 || error) {
        return reject(new Error(`massdns failed: ${error || `exit code ${code}`}`));
      }

      const results = output
        .trim()
        .split("\n")
        .filter(line => line.includes(" A ")) // Only process valid A records
        .map(line => {
          const [domain, type, ip] = line.split(" ");
          return {
            domain: domain.replace(/\.$/, ""),
            type,
            ip
          };
        });

      resolve(results);
    });
  });
}

module.exports = { resolveDomains };