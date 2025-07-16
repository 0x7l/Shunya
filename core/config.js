module.exports = {
  version: '1.0.0',
  defaultThreads: 30,
  rateLimits: {
    crtSh: { requests: 5, interval: 1000 }, // 5 requests/second
    bufferOver: { requests: 2, interval: 1000 },
    dnsResolve: { requests: 50, interval: 1000 },
    geoIP: { requests: 45, interval: 60000 } // 45 requests/minute (ip-api.com limits)
  },
  userAgent: 'ShunyaRecon/1.0',
  httpTimeout: 5000, // 5 seconds
  dirScanTimeout: 10000 // 10 seconds
};