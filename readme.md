# 🕵️ Shunya - Advanced Subdomain Reconnaissance Tool

![Shunya Logo](./assets/banner.PNG)

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

```
git clone https://github.com/0x7l/shunya.git

cd shunya

cat requirements.txt | xargs npm install

cd /utils/massdns

make

sudo cp bin/massdns /usr/local/bin
```

## 🛠 Usage
Basic Scan
```
cd /bin
node shunya.js -d example.com
```

## Full Reconnaissance

```
  shunya -d example.com \
  --wordlist subdomains.txt \
  --probe \
  --geoip \
  --dirscan directories.txt \
  -o results.json \
  --format json
```

## 📌 Options
```
Option	Description	Default
-d, --domain	Target domain (required)	-
-w, --wordlist	Subdomain wordlist path	-
-t, --threads	Concurrent threads	30
-o, --output	Output file path	-
--format	Output format (table/json/csv/txt)	table
--probe	Enable HTTP probing	false
--geoip	Enable GeoIP lookup	false
--dirscan	Directory brute-force wordlist	-
```
## 🎯 Examples


```shunya -d example.com```

## Full Scan with JSON Export

```shunya -d example.com --probe --geoip -o results.json```

## Wordlist Brute-Force

```shunya -d example.com -w subdomains.txt```

## 📂 Output Samples
## JSON Structure

```
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
```


## 🛡 Security Considerations
```
    Rate Limiting
    Built-in throttling for API sources (CRT.sh, Alienvault)

    Legal Use

        Always get proper authorization before scanning

        Respect robots.txt and rate limits

    Privacy
    GeoIP data is fetched from ip-api.com (non-commercial use)
```
## 🤝 Contributing
```
    Fork the repository

    Create a feature branch (git checkout -b feature/amazing-feature)

    Commit changes (git commit -m 'Add amazing feature')

    Push to branch (git push origin feature/amazing-feature)

    Open a Pull Request
```

📜 License

MIT © 0x7l

## 🔗 Dependencies & Credits

- **[massdns](https://github.com/blechschmidt/massdns)**  
  Shunya uses massdns for high-performance DNS resolution.  
  Credits to [@blechschmidt](https://github.com/blechschmidt) — Licensed under MIT