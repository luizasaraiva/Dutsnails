const { createClient } = require('@supabase/supabase-js');
const { MercadoPagoConfig, Payment, WebhookSignatureValidator } = require('mercadopago');

function mapStatus(status) {
  if (status === 'approved') return 'paid';
  if (status === 'cancelled' || status === 'refunded' || status === 'charged_back') return 'cancelled';
  if (status === 'rejected') return 'failed';
  return 'pending';
}

function mapMethod(payment) {
  const type = payment.payment_type_id;
  const id = payment.payment_method_id;
  if (id === 'pix' || type === 'bank_transfer') return 'pix';
  if (type === 'credit_card' || type === 'debit_card' || type === 'prepaid_card') return 'card';
  return null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!accessToken || !webhookSecret || !supabaseUrl || !serviceRoleKey) return res.status(500).end();

  const dataId = String(req.query['data.id'] || req.body?.data?.id || '');
  const eventType = String(req.query.type || req.body?.type || '');
  if (!dataId || (eventType && eventType !== 'payment')) return res.status(200).end();

  try {
    WebhookSignatureValidator.validate({
      xSignature: req.headers['x-signature'],
      xRequestId: req.headers['x-request-id'],
      dataId,
      secret: webhookSecret
    });
  } catch (error) {
    console.error('Assinatura inválida do Mercado Pago:', error);
    return res.status(401).end();
  }

  try {
    const mp = new MercadoPagoConfig({ accessToken, options: { timeout: 10000 } });
    const paymentClient = new Payment(mp);
    const mpPayment = await paymentClient.get({ id: dataId });
    const vellurePaymentId = String(mpPayment.external_reference || mpPayment.metadata?.vellure_payment_id || '');
    if (!/^[0-9a-f-]{36}$/i.test(vellurePaymentId)) return res.status(200).end();

    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const status = mapStatus(mpPayment.status);
    const method = mapMethod(mpPayment);
    const update = {
      status,
      gateway: 'mercado_pago',
      external_payment_id: String(mpPayment.id),
      gateway_status: mpPayment.status || null,
      gateway_status_detail: mpPayment.status_detail || null,
      gateway_payload: mpPayment,
      updated_at: new Date().toISOString()
    };
    if (method) update.method = method;
    if (status === 'paid') update.paid_at = mpPayment.date_approved || new Date().toISOString();

    const { data: updatedPayment, error } = await admin
      .from('payments')
      .update(update)
      .eq('id', vellurePaymentId)
      .select('appointment_id,status')
      .single();
    if (error) throw error;

    if (updatedPayment?.appointment_id && status === 'paid') {
      await admin.from('appointments').update({ status: 'confirmed', updated_at: new Date().toISOString() })
        .eq('id', updatedPayment.appointment_id);
    }

    return res.status(200).end();
  } catch (error) {
    console.error('Erro no webhook Mercado Pago:', error);
    return res.status(500).end();
  }
};
