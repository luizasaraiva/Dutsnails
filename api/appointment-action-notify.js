const {createClient}=require('@supabase/supabase-js');
const {sendText}=require('./_whatsapp');
module.exports=async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Método não permitido.'});
  const token=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
  if(!token)return res.status(401).json({error:'Não autorizado.'});
  const admin=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
  const {data:{user}}=await admin.auth.getUser(token);
  if(!user)return res.status(401).json({error:'Sessão inválida.'});
  const appointmentId=String(req.body?.appointmentId||''); const action=String(req.body?.action||'');
  const {data:a,error}=await admin.from('appointments').select('id,client_id,starts_at,status,cancellation_reason,appointment_items(service_name_snapshot)').eq('id',appointmentId).eq('client_id',user.id).single();
  if(error||!a)return res.status(404).json({error:'Agendamento não encontrado.'});
  const {data:p}=await admin.from('profiles').select('full_name,phone').eq('id',user.id).single();
  const date=new Date(a.starts_at).toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo'}),hour=new Date(a.starts_at).toLocaleTimeString('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit'});
  const title=action==='cancelled'?'❌ Agendamento cancelado':'🔄 Agendamento reagendado';
  const msg=`${title} — Vellure Studio\n\nCliente: ${p?.full_name||'Cliente'}\nWhatsApp: ${p?.phone||'—'}\nServiço: ${a.appointment_items?.[0]?.service_name_snapshot||'Procedimento'}\nNova data/horário: ${date} às ${hour}${a.cancellation_reason?`\nMotivo: ${a.cancellation_reason}`:''}\nPedido: ${a.id}`;
  try{const result=await sendText(process.env.WHATSAPP_STUDIO_NUMBER||'5511966818500',msg);await admin.from('notification_log').insert({appointment_id:a.id,recipient:process.env.WHATSAPP_STUDIO_NUMBER||'5511966818500',notification_type:action,status:result.skipped?'skipped':'sent',payload:result});return res.status(200).json({ok:true,sent:!result.skipped});}
  catch(e){return res.status(500).json({error:e.message})}
};
