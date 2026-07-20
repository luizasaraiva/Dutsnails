const {createClient}=require('@supabase/supabase-js');
module.exports=async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({error:'Método não permitido.'});
  const date=String(req.query.date||'');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return res.status(400).json({error:'Data inválida.'});
  const admin=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
  const start=new Date(`${date}T00:00:00-03:00`),end=new Date(`${date}T23:59:59-03:00`);
  const {data,error}=await admin.from('appointments').select('starts_at,status').gte('starts_at',start.toISOString()).lte('starts_at',end.toISOString()).not('status','in','("cancelled","canceled")');
  if(error)return res.status(500).json({error:'Não foi possível consultar a agenda.'});
  const occupied=(data||[]).map(x=>new Date(x.starts_at).toLocaleTimeString('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit'}));
  res.setHeader('Cache-Control','no-store');
  return res.status(200).json({date,occupied});
};
