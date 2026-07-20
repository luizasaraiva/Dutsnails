const { createClient } = require('@supabase/supabase-js');
const { MercadoPagoConfig, Preference } = require('mercadopago');

function send(res, status, body) {
  res.status(status).json(body);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Método não permitido.' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const siteUrl = (process.env.SITE_URL || 'https://vellurestudio.vercel.app').replace(/\/$/, '');

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey || !accessToken) {
    return send(res, 500, { error: 'Integração ainda não configurada no servidor.' });
  }

  const authHeader = req.headers.authorization || '';
  const jwt = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!jwt) return send(res, 401, { error: 'Entre na sua conta para pagar.' });

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false }
  });
  const { data: userData, error: userError } = await authClient.auth.getUser(jwt);
  if (userError || !userData?.user) return send(res, 401, { error: 'Sessão inválida. Entre novamente.' });

  const paymentId = String(req.body?.paymentId || '');
  if (!/^[0-9a-f-]{36}$/i.test(paymentId)) return send(res, 400, { error: 'Pagamento inválido.' });

  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const { data: payment, error: paymentError } = await admin
    .from('payments')
    .select('id,client_id,appointment_id,amount,status,gateway_preference_id,gateway_checkout_url,appointments(id,starts_at,appointment_items(service_name_snapshot))')
    .eq('id', paymentId)
    .single();

  if (paymentError || !payment) return send(res, 404, { error: 'Pagamento não encontrado.' });
  if (payment.client_id !== userData.user.id) return send(res, 403, { error: 'Este pagamento não pertence à sua conta.' });
  if (payment.status === 'paid') return send(res, 409, { error: 'Este pagamento já foi aprovado.' });
  if (!Number.isFinite(Number(payment.amount)) || Number(payment.amount) <= 0) return send(res, 400, { error: 'O valor do pagamento é inválido.' });

  if (payment.gateway_checkout_url && payment.gateway_preference_id) {
    return send(res, 200, { checkoutUrl: payment.gateway_checkout_url, preferenceId: payment.gateway_preference_id });
  }

  const item = payment.appointments?.appointment_items?.[0];
  const title = item?.service_name_snapshot ? `Vellure Studio — ${item.service_name_snapshot}` : 'Vellure Studio — Reserva';
  const mp = new MercadoPagoConfig({ accessToken, options: { timeout: 10000 } });
  const preference = new Preference(mp);

  try {
    const result = await preference.create({
      body: {
        items: [{
          id: payment.id,
          title,
          description: 'Pagamento de agendamento no Vellure Studio',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: Number(payment.amount)
        }],
        payer: { email: userData.user.email },
        external_reference: payment.id,
        metadata: {
          vellure_payment_id: payment.id,
          appointment_id: payment.appointment_id,
          client_id: payment.client_id
        },
        back_urls: {
          success: `${siteUrl}/pagamento-retorno.html?status=approved&payment_id=${encodeURIComponent(payment.id)}`,
          pending: `${siteUrl}/pagamento-retorno.html?status=pending&payment_id=${encodeURIComponent(payment.id)}`,
          failure: `${siteUrl}/pagamento-retorno.html?status=failure&payment_id=${encodeURIComponent(payment.id)}`
        },
        auto_return: 'approved',
        notification_url: `${siteUrl}/api/mercadopago-webhook`,
        statement_descriptor: 'VELLURE',
        binary_mode: false
      },
      requestOptions: { idempotencyKey: payment.id }
    });

    const checkoutUrl = result.init_point || result.sandbox_init_point;
    if (!checkoutUrl) throw new Error('O Mercado Pago não retornou o endereço do checkout.');

    await admin.from('payments').update({
      gateway: 'mercado_pago',
      gateway_preference_id: String(result.id),
      gateway_checkout_url: checkoutUrl,
      gateway_status: 'checkout_created',
      updated_at: new Date().toISOString()
    }).eq('id', payment.id);

    return send(res, 200, { checkoutUrl, preferenceId: result.id });
  } catch (error) {
    console.error('Mercado Pago preference error:', error);
    return send(res, 502, { error: error?.message || 'Não foi possível abrir o Mercado Pago.' });
  }
};
