function formatarDataBR(valor){if(!valor)return 'Não informada';const [ano,mes,dia]=valor.split('-');return `${dia}/${mes}/${ano}`}
function dinheiro(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
function uuidValido(valor){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(valor||''))}
async function resolverServicoSupabase(servico){
  if(uuidValido(servico?.id)) return servico;
  const nome=String(servico?.nome||'').trim();
  if(!nome) throw new Error('Selecione novamente o procedimento.');
  const {data,error}=await window.vellureDb.client.from('public_service_catalog').select('*').eq('name',nome).limit(1).maybeSingle();
  if(error) throw error;
  if(!data?.id||!uuidValido(data.id)) throw new Error('Este serviço ainda não está corretamente cadastrado no sistema. Atualize a página e selecione o procedimento novamente.');
  return {...servico,id:data.id,nome:data.name||servico.nome,precoNumero:Number(data.price),preco:Number(data.price).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})};
}

document.addEventListener('DOMContentLoaded',()=>{
 const form=document.getElementById('formReserva'); if(!form)return;
 form.addEventListener('submit',async e=>{
  e.preventDefault();
  const botao=form.querySelector('button[type="submit"]');
  const textoOriginal=botao?.textContent;
  try{
    if(botao){botao.disabled=true;botao.textContent='Registrando...'}
    if(!window.vellureDb) throw new Error('A conexão com o sistema não foi carregada.');
    let user;
    try{user=await window.vellureDb.auth.user()}catch{throw new Error('Entre na sua conta antes de confirmar o agendamento.');}
    let servico=window.servicoSelecionadoPagamento?.();
    if(!servico?.id) throw new Error('Selecione um procedimento válido.');
    servico=await resolverServicoSupabase(servico);
    const data=document.getElementById('data').value;
    const horario=document.getElementById('horario').value;
    if(!data||!horario) throw new Error('Informe a data e o horário.');
    const startsAt=new Date(`${data}T${horario}:00-03:00`).toISOString();
    const obs=document.getElementById('obs').value.trim()||'';
    const appointmentId=await window.vellureDb.booking.create(servico.id,startsAt,obs,null);

    const cfg=await window.vellureDb.client.from('studio_settings').select('*').eq('id',1).single();
    const percentual=Number(cfg.data?.deposit_percent||30);
    const total=Number(servico.precoNumero??String(servico.preco).replace(/[^0-9,]/g,'').replace(',','.'))||0;
    const tipo=document.querySelector('input[name="tipoPagamento"]:checked')?.value||'sinal';
    const metodo='pix';
    const kind=tipo==='total'?'full':'deposit';
    const amount=tipo==='total'?total:total*percentual/100;
    const {data:payment,error:paymentError}=await window.vellureDb.client.from('payments').insert({
      client_id:user.id,appointment_id:appointmentId,method:metodo,kind,amount,status:'pending',notes:document.getElementById('notasPagamento')?.value.trim()||null
    }).select().single();
    if(paymentError) throw paymentError;
    const {data:sessionData}=await window.vellureDb.client.auth.getSession();
    const token=sessionData?.session?.access_token;
    if(!token) throw new Error('Sua sessão expirou. Entre novamente para pagar.');
    const checkoutResponse=await fetch('/api/create-mercadopago-checkout',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},body:JSON.stringify({paymentId:payment.id})});
    const checkout=await checkoutResponse.json().catch(()=>({}));
    if(!checkoutResponse.ok||!checkout.checkoutUrl) throw new Error(checkout.error||'Não foi possível abrir o Mercado Pago.');

    const nome=document.getElementById('nome').value.trim();
    const telefone=document.getElementById('telefone').value.trim();
    const numero=window.VELLURE_CONFIG?.whatsapp||'5511966818500';
    sessionStorage.setItem('vellure_ultimo_agendamento',JSON.stringify({appointmentId,paymentId:payment.id,nome,telefone,servico:servico.nome,data,horario,amount}));
    location.href=checkout.checkoutUrl;
  }catch(error){
    if(/Entre na sua conta/.test(error.message)&&confirm(`${error.message}\n\nDeseja abrir o login agora?`)) location.href='cliente-login.html';
    else alert(error.message||'Não foi possível registrar o agendamento.');
  }finally{if(botao){botao.disabled=false;botao.textContent=textoOriginal}}
 });
});
