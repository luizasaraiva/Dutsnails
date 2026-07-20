/**
 * Webhook da Meta / WhatsApp Cloud API para Vercel.
 *
 * Variável obrigatória na Vercel:
 * META_VERIFY_TOKEN
 *
 * GET  -> usado pela Meta para verificar o webhook.
 * POST -> recebe eventos do WhatsApp e responde 200 rapidamente.
 */

module.exports = async function handler(req, res) {
  // Verificação inicial feita pela Meta.
  if (req.method === "GET") {
    const mode = req.query?.["hub.mode"];
    const token = req.query?.["hub.verify_token"];
    const challenge = req.query?.["hub.challenge"];

    const verifyToken = process.env.META_VERIFY_TOKEN;

    if (!verifyToken) {
      console.error("META_VERIFY_TOKEN não configurado na Vercel.");
      return res.status(500).json({
        error: "Configuração do webhook incompleta."
      });
    }

    if (mode === "subscribe" && token === verifyToken) {
      console.log("Webhook da Meta verificado com sucesso.");
      res.setHeader("Content-Type", "text/plain");
      return res.status(200).send(String(challenge ?? ""));
    }

    console.warn("Tentativa de verificação recusada.", {
      mode,
      tokenReceived: Boolean(token)
    });

    return res.status(403).json({
      error: "Token de verificação inválido."
    });
  }

  // Eventos enviados pela Meta.
  if (req.method === "POST") {
    try {
      const payload = req.body || {};

      // Registra somente informações gerais, sem expor tokens.
      const entryCount = Array.isArray(payload.entry) ? payload.entry.length : 0;
      console.log("Evento do WhatsApp recebido.", {
        object: payload.object || null,
        entryCount
      });

      /*
       * Neste momento o sistema apenas confirma o recebimento.
       * Futuramente, este ponto pode tratar:
       * - mensagens recebidas;
       * - status de envio/entrega/leitura;
       * - respostas de clientes.
       */

      return res.status(200).json({ received: true });
    } catch (error) {
      console.error("Erro ao processar webhook da Meta:", error);
      // A Meta deve receber uma resposta válida para não repetir indefinidamente.
      return res.status(200).json({ received: true });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Método não permitido." });
};
