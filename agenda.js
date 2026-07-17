function formatarDataBR(valor){if(!valor)return "Não informada";const [ano,mes,dia]=valor.split('-');return `${dia}/${mes}/${ano}`}
document.addEventListener("DOMContentLoaded",()=>{
 const form=document.getElementById("formReserva"); if(!form)return;
 form.addEventListener("submit",e=>{
  e.preventDefault();
  const nome=document.getElementById("nome").value.trim();
  const telefone=document.getElementById("telefone").value.trim();
  const servico=document.getElementById("servico").value;
  const data=formatarDataBR(document.getElementById("data").value);
  const horario=document.getElementById("horario").value;
  const obs=document.getElementById("obs").value.trim()||"Sem observações";
  const clube=document.getElementById("querClube")?.checked?"Tenho interesse no Clube Vellure":"Não informado";
  const numero=window.VELLURE_CONFIG?.whatsapp||"5511966818500";
  const mensagem=`Olá, Vellure Studio! Gostaria de solicitar um agendamento.\n\nNome: ${nome}\nWhatsApp: ${telefone}\nProcedimento: ${servico}\nData desejada: ${data}\nHorário desejado: ${horario}\nClube Vellure: ${clube}\nObservações: ${obs}\n\nAguardo a confirmação de disponibilidade.`;
  window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`,"_blank","noopener");
 });
});
