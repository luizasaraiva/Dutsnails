/**
 * Webhook oficial da Meta / WhatsApp Cloud API.
 *
 * Variável obrigatória:
 * META_VERIFY_TOKEN
 */

function getQuery(req) {
  try {
    const host = req.headers?.host || 'localhost';
    const url = new URL(req.url || '/', `https://${host}`);
    return {
      mode: url.searchParams.get('hub.mode') || req.query?.['hub.mode'] || '',
      token: url.searchParams.get('hub.verify_token') || req.query?.['hub.verify_token'] || '',
      challenge: url.searchParams.get('hub.challenge') || req.query?.['hub.challenge'] || ''
    };
  } catch (_) {
    return {
      mode: req.query?.['hub.mode'] || '',
      token: req.query?.['hub.verify_token'] || '',
      challenge: req.query?.['hub.challenge'] || ''
    };
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    const { mode, token, challenge } = getQuery(req);
    const expected = String(process.env.META_VERIFY_TOKEN || '').trim();

    // Acesso manual: confirma que a rota está publicada sem expor segredo.
    if (!mode && !token && !challenge) {
      return res.status(200).json({
        ok: true,
        service: 'vellure-meta-webhook',
        configured: Boolean(expected)
      });
    }

    if (!expected) {
      console.error('META_VERIFY_TOKEN não configurado.');
      return res.status(500).send('META_VERIFY_TOKEN não configurado');
    }

    if (mode === 'subscribe' && String(token).trim() === expected) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(200).send(String(challenge));
    }

    console.warn('Verificação da Meta recusada.', {
      mode,
      tokenReceived: Boolean(token),
      challengeReceived: Boolean(challenge)
    });
    return res.status(403).send('Token de verificação inválido');
  }

  if (req.method === 'POST') {
    const payload = req.body || {};
    const entryCount = Array.isArray(payload.entry) ? payload.entry.length : 0;

    console.log('Evento Meta/WhatsApp recebido.', {
      object: payload.object || null,
      entryCount
    });

    // A Meta exige resposta rápida para não reenviar o evento.
    return res.status(200).json({ received: true });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Método não permitido.' });
};
