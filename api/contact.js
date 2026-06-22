module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  const body = req.body || {};
  console.log('DEBUG body keys:', Object.keys(body), 'content-type:', req.headers['content-type']);

  // Honeypot: bots fill hidden fields. Pretend success without sending anything.
  if (body.botcheck) {
    res.status(200).json({ success: true });
    return;
  }

  const token = body['cf-turnstile-response'];
  if (!token) {
    console.log('DEBUG missing token, full body:', JSON.stringify(body));
    res.status(400).json({ success: false, message: 'Verificação anti-spam ausente.' });
    return;
  }

  const verifyRes = await fetch('https://challenge.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: req.headers['x-forwarded-for'] || '',
    }),
  });
  const verifyData = await verifyRes.json();
  console.log('DEBUG turnstile verify result:', JSON.stringify(verifyData), 'secretSet:', !!process.env.TURNSTILE_SECRET_KEY);

  if (!verifyData.success) {
    res.status(400).json({ success: false, message: 'Verificação anti-spam falhou.', detail: verifyData['error-codes'] });
    return;
  }

  const web3formsRes = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: process.env.WEB3FORMS_ACCESS_KEY,
      subject: 'Novo contato via portfólio',
      from_name: 'Portfólio Eduardo Cremm',
      name: body.name,
      email: body.email,
      project_type: body.project_type,
      message: body.message,
    }),
  });
  const web3formsData = await web3formsRes.json();

  res.status(web3formsRes.ok ? 200 : 502).json(web3formsData);
};
