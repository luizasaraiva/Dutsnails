/**
 * Endpoint central da Meta/WhatsApp.
 * A rota pública /api/meta-webhook é redirecionada para /api por vercel.json.
 */
module.exports = async function handler(req, res) {
  if (req.method === "GET") {
    const mode = req.query && req.query["hub.mode"];
    const token = req.query && req.query["hub.verify_token"];
    const challenge = req.query && req.query["hub.challenge"];
    const expectedToken = process.env.META_VERIFY_TOKEN;

    if (!expectedToken) {
      return res.status(500).json({
        error: "META_VERIFY_TOKEN não configurado"
      });
    }

    if (mode === "subscribe" && token === expectedToken) {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.status(200).send(String(challenge || ""));
    }

    return res.status(403).json({
      error: "Token de verificação inválido"
    });
  }

  if (req.method === "POST") {
    return res.status(200).json({ received: true });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Método não permitido" });
};
