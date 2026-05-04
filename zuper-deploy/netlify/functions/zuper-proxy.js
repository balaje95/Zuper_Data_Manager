// Netlify Function — Zuper API Proxy
// Uses Node built-in `https` — works on Node 14, 16, 18, 20. No npm install needed.

const https = require('https');
const url   = require('url');

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
};

exports.handler = function (event, context, callback) {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return callback(null, { statusCode: 204, headers: CORS, body: '' });
  }

  const params = event.queryStringParameters || {};
  const target = params.target;

  if (!target) {
    return callback(null, {
      statusCode: 400, headers: CORS,
      body: JSON.stringify({ error: 'Missing ?target= parameter' }),
    });
  }

  if (!target.startsWith('https://') || !target.includes('zuperpro.com')) {
    return callback(null, {
      statusCode: 403, headers: CORS,
      body: JSON.stringify({ error: 'Forbidden: only zuperpro.com targets allowed' }),
    });
  }

  const parsed   = url.parse(target);
  const fwdHdrs  = { 'Content-Type': 'application/json' };
  if (event.headers['x-api-key']) fwdHdrs['x-api-key'] = event.headers['x-api-key'];

  const options = {
    hostname: parsed.hostname,
    path:     parsed.path,
    method:   event.httpMethod,
    headers:  fwdHdrs,
  };

  const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      callback(null, {
        statusCode: res.statusCode,
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body,
      });
    });
  });

  req.on('error', (err) => {
    callback(null, {
      statusCode: 500, headers: CORS,
      body: JSON.stringify({ error: err.message }),
    });
  });

  if (event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD' && event.body) {
    req.write(event.body);
  }
  req.end();
};
