// Netlify Function — Zuper API Proxy
// Node 18+ native fetch, plain CommonJS — no dependencies needed.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
};

exports.handler = async function (event) {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  const params = event.queryStringParameters || {};
  const target = params.target;

  if (!target) {
    return {
      statusCode: 400,
      headers: CORS,
      body: JSON.stringify({ error: 'Missing ?target= parameter' }),
    };
  }

  // Security: only proxy to Zuper domains
  if (!target.startsWith('https://') || !target.includes('zuperpro.com')) {
    return {
      statusCode: 403,
      headers: CORS,
      body: JSON.stringify({ error: 'Forbidden: only zuperpro.com targets allowed' }),
    };
  }

  const fwdHeaders = { 'Content-Type': 'application/json' };
  if (event.headers['x-api-key']) fwdHeaders['x-api-key'] = event.headers['x-api-key'];

  try {
    const fetchOpts = { method: event.httpMethod, headers: fwdHeaders };
    if (event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD' && event.body) {
      fetchOpts.body = event.body;
    }

    const upstream = await fetch(target, fetchOpts);
    const text = await upstream.text();

    return {
      statusCode: upstream.status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
