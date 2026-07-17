function formatarDataBR(valor){if(!valor)return 'Não informada';const [ano,mes,dia]=valor.split('-');return `${dia}/${mes}/${ano}`}
function dinheiro(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}

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
    const servico=window.servicoSelecionadoPagamento?.();
    if(!servico?.id) throw new Error('Selecione um procedimento válido.');
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
    const metodoTela=document.querySelector('input[name="metodoPagamento"]:checked')?.value||'PIX';
    const metodo=metodoTela==='Cartão'?'card':'pix';
    const kind=tipo==='total'?'full':'deposit';
    const amount=tipo==='total'?total:total*percentual/100;
    const {data:payment,error:paymentError}=await window.vellureDb.client.from('payments').insert({
      client_id:user.id,appointment_id:appointmentId,method:metodo,kind,amount,status:'pending',notes:document.getElementById('notasPagamento')?.value.trim()||null
    }).select().single();
    if(paymentError) throw paymentError;
    const file=document.getElementById('comprovante')?.files?.[0];
    if(file&&payment?.id) await window.vellureDb.receipts.upload(payment.id,file);

    const nome=document.getElementById('nome').value.trim();
    const telefone=document.getElementById('telefone').value.trim();
    const numero=window.VELLURE_CONFIG?.whatsapp||'5511966818500';
    const mensagem=`Olá, Vellure Studio! Solicitei um agendamento pelo site.\n\nNome: ${nome}\nWhatsApp: ${telefone}\nProcedimento: ${servico.nome}\nData: ${formatarDataBR(data)}\nHorário: ${horario}\nPagamento: ${kind==='full'?'Total':'Sinal'} via ${metodoTela}\nValor: ${dinheiro(amount)}\nCódigo do agendamento: ${appointmentId}\nObservações: ${obs||'Sem observações'}\n\nAguardo a confirmação.`;
    alert('Solicitação registrada! A Vellure confirmará a disponibilidade.');
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`,'_blank','noopener');
    form.reset();
    window.atualizarResumoPagamento?.();
  }catch(error){
    if(/Entre na sua conta/.test(error.message)&&confirm(`${error.message}\n\nDeseja abrir o login agora?`)) location.href='cliente-login.html';
    else alert(error.message||'Não foi possível registrar o agendamento.');
  }finally{if(botao){botao.disabled=false;botao.textContent=textoOriginal}}
 });
});
