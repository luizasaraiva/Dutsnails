function onlyDigits(value){return String(value||'').replace(/\D/g,'')}
function normalizeBrazilPhone(value){
  let n=onlyDigits(value);
  if(!n)return '';
  if(n.startsWith('00'))n=n.slice(2);
  if(!n.startsWith('55'))n='55'+n;
  return n;
}
async function graphRequest(body){
  const token=process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId=process.env.WHATSAPP_PHONE_NUMBER_ID;
  if(!token||!phoneId) return {ok:false,skipped:true,reason:'WhatsApp Cloud API não configurada'};
  const response=await fetch(`https://graph.facebook.com/v23.0/${phoneId}/messages`,{
    method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},body:JSON.stringify(body)
  });
  const payload=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(payload?.error?.message||`WhatsApp HTTP ${response.status}`);
  return {ok:true,payload};
}
async function sendText(to,text){
  const phone=normalizeBrazilPhone(to);
  if(!phone)return {ok:false,skipped:true,reason:'Telefone ausente'};
  return graphRequest({messaging_product:'whatsapp',recipient_type:'individual',to:phone,type:'text',text:{preview_url:false,body:String(text).slice(0,4096)}});
}
async function sendTemplate(to,templateName,parameters=[],languageCode='pt_BR'){
  const phone=normalizeBrazilPhone(to);
  if(!phone||!templateName)return {ok:false,skipped:true,reason:'Telefone ou template ausente'};
  return graphRequest({messaging_product:'whatsapp',to:phone,type:'template',template:{name:templateName,language:{code:languageCode},components:[{type:'body',parameters:parameters.map(v=>({type:'text',text:String(v)}))}]}});
}
module.exports={sendText,sendTemplate,normalizeBrazilPhone};
