# 🕵️ Shunya - Advanced Subdomain Reconnaissance Tool

![Shunya Logo](screenshots/logo.png) *(Optional: Add a logo later)*  
*A lightning-fast subdomain discovery tool with integrated probing, GeoIP lookup, and directory brute-forcing.*

---

## ✨ Features

- **Multi-Source Enumeration**  
  CRT.sh, BufferOver, and wordlist brute-forcing
- **Smart Probing**  
  HTTP(s) checks with title extraction
- **GeoIP Intelligence**  
  Country/City/ISP mapping for discovered IPs
- **Brute-Force Ready**  
  Built-in directory scanning
- **Flexible Outputs**  
  JSON, CSV, TXT, and beautiful console tables

---

## 🚀 Installation

### npm (Global)
```bash
npm install -g shunya

Manual
bash

git clone https://github.com/0x7l/shunya.git
cd shunya
npm install
npm link  # For global access

🛠 Usage
Basic Scan
bash

shunya -d example.com

Full Reconnaissance
bash

shunya -d example.com \
  --wordlist subdomains.txt \
  --probe \
  --geoip \
  --dirscan directories.txt \
  -o results.json \
  --format json

📌 Options
Option	Description	Default
-d, --domain	Target domain (required)	-
-w, --wordlist	Subdomain wordlist path	-
-t, --threads	Concurrent threads	30
-o, --output	Output file path	-
--format	Output format (table/json/csv/txt)	table
--probe	Enable HTTP probing	false
--geoip	Enable GeoIP lookup	false
--dirscan	Directory brute-force wordlist	-
🎯 Examples

    Quick Scan with Table Output
    bash

shunya -d example.com

Full Scan with JSON Export
bash

shunya -d example.com --probe --geoip -o results.json

Wordlist Brute-Force
bash

    shunya -d example.com -w subdomains.txt

📂 Output Samples
JSON Structure
json

{
  "domain": "example.com",
  "subdomains": [
    {
      "subdomain": "mail.example.com",
      "ip": "93.184.216.34",
      "resolved": true
    }
  ],
  "probed": [
    {
      "subdomain": "mail.example.com",
      "status": 200,
      "title": "Example Mail Portal"
    }
  ],
  "geoip": {
    "93.184.216.34": {
      "country": "United States",
      "city": "Cambridge",
      "isp": "Fastly"
    }
  }
}

CSV Output
text

subdomain,ip,status
mail.example.com,93.184.216.34,Resolved

🛡 Security Considerations

    Rate Limiting
    Built-in throttling for API sources (CRT.sh, BufferOver)

    Legal Use

        Always get proper authorization before scanning

        Respect robots.txt and rate limits

    Privacy
    GeoIP data is fetched from ip-api.com (non-commercial use)

🤝 Contributing

    Fork the repository

    Create a feature branch (git checkout -b feature/amazing-feature)

    Commit changes (git commit -m 'Add amazing feature')

    Push to branch (git push origin feature/amazing-feature)

    Open a Pull Request

📜 License

MIT © 0x7l