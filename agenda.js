function formatarDataBR(valor){if(!valor)return 'Não informada';const [ano,mes,dia]=valor.split('-');return `${dia}/${mes}/${ano}`}
function dinheiro(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
function uuidValido(valor){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(valor||''))}
async function resolverServicoSupabase(servico){
  if(uuidValido(servico?.id)) return servico;
  const nome=String(servico?.nome||'').trim();
  if(!nome) throw new Error('Selecione novamente o procedimento.');
  const {data,error}=await window.vellureDb.client.from('public_service_catalog').select('*').eq('name',nome).limit(1).maybeSingle();
  if(error) throw error;
  if(!data?.id||!uuidValido(data.id)) throw new Error('Este serviço ainda não está corretamente cadastrado. Atualize a página e selecione novamente.');
  return {...servico,id:data.id,nome:data.name||servico.nome,precoNumero:Number(data.price),preco:Number(data.price).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})};
}
function extrairPrecoServico(servico){
  if(Number.isFinite(Number(servico?.precoNumero))) return Number(servico.precoNumero);
  const txt=String(servico?.preco||'').replace(/[^0-9,.-]/g,'').replace(/\.(?=\d{3}(?:\D|$))/g,'').replace(',','.');
  return Number(txt)||0;
}
async function marcarFalhaLocal(paymentId, motivo){
  if(!paymentId||!window.vellureDb?.client)return;
  try{await window.vellureDb.client.from('payments').update({gateway_status:'checkout_error',gateway_status_detail:String(motivo||'').slice(0,250),updated_at:new Date().toISOString()}).eq('id',paymentId)}catch{}
}

document.addEventListener('DOMContentLoaded',()=>{
 const form=document.getElementById('formReserva'); if(!form)return;
 form.addEventListener('submit',async e=>{
  e.preventDefault();
  const botao=form.querySelector('button[type="submit"]');
  const textoOriginal=botao?.textContent;
  let paymentId=null;
  try{
    if(botao){botao.disabled=true;botao.textContent='Preparando pagamento...'}
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
    if(Number.isNaN(Date.parse(startsAt))) throw new Error('Data ou horário inválido.');
    if(new Date(startsAt)<=new Date()) throw new Error('Escolha uma data e um horário futuros.');

    const total=extrairPrecoServico(servico);
    if(!(total>0)) throw new Error('O serviço selecionado está sem preço válido.');
    const tipo=document.querySelector('input[name="tipoPagamento"]:checked')?.value||'sinal';
    const {data:settings}=await window.vellureDb.client.from('studio_settings').select('deposit_percent').eq('id',1).maybeSingle();
    const percentual=Math.min(100,Math.max(1,Number(settings?.deposit_percent||30)));
    const kind=tipo==='total'?'full':'deposit';
    const amount=Number((tipo==='total'?total:total*percentual/100).toFixed(2));

    const obs=document.getElementById('obs').value.trim()||'';
    const nome=document.getElementById('nome').value.trim();
    const telefone=document.getElementById('telefone').value.trim();
    const notasPagamento=document.getElementById('notasPagamento')?.value.trim()||'';
    const notasCompletas=[obs,`Contato informado: ${nome} • ${telefone}`].filter(Boolean).join('\n');

    const appointmentId=await window.vellureDb.booking.create(servico.id,startsAt,notasCompletas,null);
    if(!uuidValido(appointmentId)) throw new Error('O agendamento não retornou um identificador válido.');

    const {data:payment,error:paymentError}=await window.vellureDb.client.from('payments').insert({
      client_id:user.id,
      appointment_id:appointmentId,
      method:'pix',
      kind,
      amount,
      status:'pending',
      gateway:'mercado_pago',
      gateway_status:'created',
      notes:notasPagamento||null
    }).select('id').single();
    if(paymentError) throw paymentError;
    paymentId=payment.id;

    const {data:sessionData}=await window.vellureDb.client.auth.getSession();
    const token=sessionData?.session?.access_token;
    if(!token) throw new Error('Sua sessão expirou. Entre novamente para pagar.');

    const checkoutResponse=await fetch('/api/create-mercadopago-checkout',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
      body:JSON.stringify({paymentId})
    });
    const checkout=await checkoutResponse.json().catch(()=>({}));
    if(!checkoutResponse.ok||!checkout.checkoutUrl) throw new Error(checkout.error||'Não foi possível abrir o Mercado Pago.');

    sessionStorage.setItem('vellure_ultimo_agendamento',JSON.stringify({appointmentId,paymentId,nome,telefone,servico:servico.nome,data,horario,amount,kind}));
    window.location.assign(checkout.checkoutUrl);
  }catch(error){
    await marcarFalhaLocal(paymentId,error?.message);
    if(/Entre na sua conta/.test(error.message)&&confirm(`${error.message}\n\nDeseja abrir o login agora?`)) location.href='cliente-login.html';
    else alert(error.message||'Não foi possível registrar o agendamento.');
  }finally{if(botao){botao.disabled=false;botao.textContent=textoOriginal}}
 });
});
