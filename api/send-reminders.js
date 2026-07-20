const {createClient}=require('@supabase/supabase-js');
const {sendTemplate}=require('./_whatsapp');
function fmtDate(v){return new Date(v).toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo'})}
function fmtTime(v){return new Date(v).toLocaleTimeString('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit'})}
module.exports=async function handler(req,res){
  if(!['GET','POST'].includes(req.method))return res.status(405).end();
  const secret=process.env.CRON_SECRET;
  if(secret&&req.headers.authorization!==`Bearer ${secret}`)return res.status(401).json({error:'Não autorizado.'});
  const admin=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
  const now=Date.now();
  const windows=[
    {type:'reminder_24h',column:'reminder_24h_sent_at',from:new Date(now+23*3600000),to:new Date(now+25*3600000),template:process.env.WHATSAPP_REMINDER_24H_TEMPLATE||'vellure_lembrete_24h'},
    {type:'reminder_2h',column:'reminder_2h_sent_at',from:new Date(now+90*60000),to:new Date(now+150*60000),template:process.env.WHATSAPP_REMINDER_2H_TEMPLATE||'vellure_lembrete_2h'}
  ];
  let sent=0,failed=0,skipped=0;
  for(const w of windows){
    const {data:apps,error}=await admin.from('appointments').select('id,client_id,starts_at,status,appointment_items(service_name_snapshot)').in('status',['confirmed','pending']).is(w.column,null).gte('starts_at',w.from.toISOString()).lte('starts_at',w.to.toISOString());
    if(error){failed++;continue}
    const ids=[...new Set((apps||[]).map(a=>a.client_id).filter(Boolean))];
    const {data:profiles}=ids.length?await admin.from('profiles').select('id,full_name,phone').in('id',ids):{data:[]};
    const map=Object.fromEntries((profiles||[]).map(p=>[p.id,p]));
    for(const a of apps||[]){
      const p=map[a.client_id]; const service=a.appointment_items?.[0]?.service_name_snapshot||'procedimento';
      try{
        const result=await sendTemplate(p?.phone,w.template,[p?.full_name||'Cliente',fmtDate(a.starts_at),fmtTime(a.starts_at),service]);
        const status=result.skipped?'skipped':'sent';
        await admin.from('notification_log').insert({appointment_id:a.id,recipient:p?.phone,notification_type:w.type,status,payload:result});
        if(result.skipped){skipped++;continue}
        await admin.from('appointments').update({[w.column]:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',a.id);
        sent++;
      }catch(e){failed++;await admin.from('notification_log').insert({appointment_id:a.id,recipient:p?.phone,notification_type:w.type,status:'failed',error_message:String(e.message).slice(0,500)});}
    }
  }
  return res.status(200).json({ok:true,sent,failed,skipped});
};
