/* Carregue antes dos módulos Vellure:
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="supabase-config.js"></script>
<script src="supabase-client.js"></script>
*/
(() => {
  const rawCfg = window.VELLURE_SUPABASE || window.VELLURE_SUPABASE_CONFIG;
  const cfg = rawCfg ? {
    url: rawCfg.url,
    publishableKey: rawCfg.publishableKey || rawCfg.anonKey
  } : null;
  if (!cfg?.url || !cfg?.publishableKey || cfg.url.includes('SEU-PROJETO')) {
    console.warn('Supabase ainda não configurado.');
    window.vellureDb = null;
    return;
  }
  const client = window.supabase.createClient(cfg.url, cfg.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  async function requireUser() {
    const { data: { user }, error } = await client.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error('Usuário não autenticado.');
    return user;
  }

  window.vellureDb = {
    client,
    auth: {
      signUp: (email, password, fullName, phone) => client.auth.signUp({
        email, password, options: { data: { full_name: fullName, phone } }
      }),
      signIn: (email, password) => client.auth.signInWithPassword({ email, password }),
      signOut: () => client.auth.signOut(),
      resetPassword: email => client.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}${location.pathname.replace(/[^/]+$/, '')}cliente-recuperar.html` }),
      user: requireUser
    },
    catalog: {
      services: async () => (await client.from('public_service_catalog').select('*').order('category').order('sort_order')).data || [],
      plans: async () => (await client.from('subscription_plans').select('*,plan_benefits(*)').eq('is_active', true).order('sort_order')).data || []
    },
    clientArea: {
      profile: async () => { const u=await requireUser(); return (await client.from('profiles').select('*,client_profiles(*),loyalty_accounts(*)').eq('id',u.id).single()).data; },
      appointments: async () => { const u=await requireUser(); return (await client.from('appointments').select('*,appointment_items(*)').eq('client_id',u.id).order('starts_at',{ascending:false})).data || []; },
      payments: async () => { const u=await requireUser(); return (await client.from('payments').select('*').eq('client_id',u.id).order('created_at',{ascending:false})).data || []; },
      subscriptions: async () => { const u=await requireUser(); return (await client.from('client_subscriptions').select('*,subscription_plans(*)').eq('client_id',u.id).order('created_at',{ascending:false})).data || []; },
      vouchers: async () => { const u=await requireUser(); return (await client.from('vouchers').select('*').eq('client_id',u.id).order('created_at',{ascending:false})).data || []; },
      referrals: async () => { const u=await requireUser(); return (await client.from('referrals').select('*').eq('referrer_id',u.id).order('created_at',{ascending:false})).data || []; }
    },
    booking: {
      create: async (serviceId, startsAt, notes='', staffId=null) => {
        const { data, error } = await client.rpc('create_appointment', { p_service_id:serviceId, p_starts_at:startsAt, p_notes:notes||null, p_staff_id:staffId });
        if (error) throw error;
        return data;
      }
    },
    receipts: {
      upload: async (paymentId, file) => {
        const u = await requireUser();
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
        const path = `${u.id}/${paymentId}/${Date.now()}-${safe}`;
        const { error: upErr } = await client.storage.from('payment-receipts').upload(path,file,{upsert:false});
        if (upErr) throw upErr;
        const { data, error } = await client.from('payment_receipts').insert({ payment_id:paymentId, storage_path:path, file_name:file.name, mime_type:file.type, size_bytes:file.size, uploaded_by:u.id }).select().single();
        if (error) throw error;
        return data;
      },
      signedUrl: async path => {
        const { data, error } = await client.storage.from('payment-receipts').createSignedUrl(path,300);
        if (error) throw error;
        return data.signedUrl;
      }
    }
  };
})();
