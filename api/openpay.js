const DESTINO = 'https://control.mudanzasellince.com/dashword/webhooks/openpay.php';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ success: true, method: req.method });
  }

  try {
    const resp = await fetch(DESTINO, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'openpay-vercel-relay/1.0',
      },
      body: JSON.stringify(req.body),
    });

    const text = await resp.text();
    console.log('REENVIADO A PHP, STATUS:', resp.status, 'RESPUESTA:', text);

    res.status(resp.status);
    try {
      return res.json(JSON.parse(text));
    } catch {
      return res.send(text);
    }
  } catch (err) {
    console.error('ERROR REENVIANDO:', err.message);
    return res.status(500).json({ success: false });
  }
}
