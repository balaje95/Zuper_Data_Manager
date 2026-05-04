// Netlify Function — Zuper API Proxy
// Sits between the browser and Zuper API to bypass CORS.
// Only forwards requests to *.zuperpro.com for security.
// Uses Node 18+ native fetch (no node-fetch needed).

exports.handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  const target = event.queryStringParameters && event.queryStringParameters.target;

  if (!target) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Missing ?target= parameter' }),
    };
  }

  // Security: only allow Zuper API domains
  if (!target.startsWith('https://') || !target.includes('zuperpro.com')) {
    return {
      statusCode: 403,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Forbidden: only zuperpro.com targets are allowed' }),
    };
  }

  // Forward only safe headers
  const forwardHeaders = { 'Content-Type': 'application/json' };
  if (event.headers['x-api-key']) forwardHeaders['x-api-key'] = event.headers['x-api-key'];

  try {
    const fetchOpts = {
      method: event.httpMethod,
      headers: forwardHeaders,
    };
    if (event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD' && event.body) {
      fetchOpts.body = event.body;
    }

    const upstream = await fetch(target, fetchOpts);
    const text = await upstream.text();

    return {
      statusCode: upstream.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
