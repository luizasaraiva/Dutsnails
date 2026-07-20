const { createClient } = require('@supabase/supabase-js');

function send(res, status, body) {
  res.status(status).json(body);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Método não permitido.' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return send(res, 500, { error: 'Integração ainda não configurada no servidor.' });
  }

  const authHeader = req.headers.authorization || '';
  const jwt = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!jwt) return send(res, 401, { error: 'Entre na sua conta para consultar o pagamento.' });

  const paymentId = String(req.query?.paymentId || '');
  if (!/^[0-9a-f-]{36}$/i.test(paymentId)) return send(res, 400, { error: 'Pagamento inválido.' });

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false }
  });
  const { data: userData, error: userError } = await authClient.auth.getUser(jwt);
  if (userError || !userData?.user) return send(res, 401, { error: 'Sessão inválida.' });

  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const { data: payment, error } = await admin
    .from('payments')
    .select('id,client_id,appointment_id,amount,method,kind,status,gateway_status,gateway_status_detail,paid_at,created_at,appointments(id,status,starts_at,appointment_items(service_name_snapshot))')
    .eq('id', paymentId)
    .single();

  if (error || !payment) return send(res, 404, { error: 'Pagamento não encontrado.' });
  if (payment.client_id !== userData.user.id) return send(res, 403, { error: 'Acesso negado.' });

  const serviceName = payment.appointments?.appointment_items?.[0]?.service_name_snapshot || 'Procedimento Vellure';
  const { data: profile } = await admin
    .from('profiles')
    .select('full_name,phone')
    .eq('id', payment.client_id)
    .maybeSingle();

  return send(res, 200, {
    id: payment.id,
    status: payment.status,
    gatewayStatus: payment.gateway_status,
    gatewayStatusDetail: payment.gateway_status_detail,
    amount: Number(payment.amount || 0),
    method: payment.method,
    kind: payment.kind,
    paidAt: payment.paid_at,
    client: profile ? {
      name: profile.full_name || '',
      phone: profile.phone || ''
    } : null,
    appointment: payment.appointments ? {
      id: payment.appointments.id,
      status: payment.appointments.status,
      startsAt: payment.appointments.starts_at,
      serviceName
    } : null
  });
};
