// ⚡ Zuper Data Manager — Local Server
// No npm install needed. Uses only Node.js built-in modules.
//
// HOW TO RUN:
//   node server.js
//
// Then open:  http://localhost:3000

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const url   = require('url');

const PORT = 3000;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
};

http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);

  // ── CORS preflight ──────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    return res.end();
  }

  // ── Proxy endpoint ──────────────────────────────────────────
  if (parsed.pathname === '/api/zuper-proxy') {
    const target = parsed.query.target;

    if (!target || !target.includes('zuperpro.com')) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Invalid or missing target' }));
    }

    let reqBody = '';
    req.on('data', (chunk) => { reqBody += chunk; });
    req.on('end', () => {
      const t = url.parse(target);

      const fwdHeaders = { 'Content-Type': 'application/json' };
      if (req.headers['x-api-key']) fwdHeaders['x-api-key'] = req.headers['x-api-key'];

      const options = {
        hostname: t.hostname,
        path:     t.path,
        method:   req.method,
        headers:  fwdHeaders,
      };

      const proxyReq = https.request(options, (proxyRes) => {
        let data = '';
        proxyRes.on('data', (c) => { data += c; });
        proxyRes.on('end', () => {
          res.writeHead(proxyRes.statusCode, {
            ...CORS_HEADERS,
            'Content-Type': 'application/json',
          });
          res.end(data);
        });
      });

      proxyReq.on('error', (err) => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      });

      if (req.method !== 'GET' && req.method !== 'HEAD' && reqBody) {
        proxyReq.write(reqBody);
      }
      proxyReq.end();
    });
    return;
  }

  // ── Serve index.html for everything else ───────────────────
  fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('index.html not found');
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });

}).listen(PORT, '127.0.0.1', () => {
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║   ⚡ Zuper Data Manager — Running    ║');
  console.log('╠══════════════════════════════════════╣');
  console.log('║  Open: http://localhost:' + PORT + '           ║');
  console.log('╚══════════════════════════════════════╝\n');
});
