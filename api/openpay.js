const TARGET = process.env.TARGET_URL || 'https://control.mudanzasellince.com/dashword/webhooks/openpay.php';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true });
  }
  try {
    const headers = { 'Content-Type': 'application/json', 'User-Agent': 'openpay-relay/1.0' };
    if (req.headers.authorization) headers['Authorization'] = req.headers.authorization;
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    const r = await fetch(TARGET, { method: 'POST', headers, body });
    const text = await r.text();
    res.status(r.status);
    res.setHeader('Content-Type', r.headers.get('content-type') || 'application/json');
    return res.send(text);
  } catch (e) {
    console.error('relay_failed', e && e.message);
    return res.status(502).json({ error: 'relay_failed' });
  }
}
