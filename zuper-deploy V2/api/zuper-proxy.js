// Vercel Serverless Function — Zuper API Proxy
// Sits between the browser and Zuper API to bypass CORS.
// Only forwards requests to *.zuperpro.com for security.

export default async function handler(req, res) {
  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const target = req.query.target;

  if (!target) {
    return res.status(400).json({ error: 'Missing ?target= parameter' });
  }

  // Security: only allow Zuper API domains
  if (!target.startsWith('https://') || !target.includes('zuperpro.com')) {
    return res.status(403).json({ error: 'Forbidden: only zuperpro.com targets are allowed' });
  }

  // Forward only safe headers
  const forwardHeaders = { 'Content-Type': 'application/json' };
  if (req.headers['x-api-key']) forwardHeaders['x-api-key'] = req.headers['x-api-key'];

  try {
    const fetchOpts = {
      method: req.method,
      headers: forwardHeaders,
    };
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOpts.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const upstream = await fetch(target, fetchOpts);
    const text = await upstream.text();

    res.status(upstream.status).send(text);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
