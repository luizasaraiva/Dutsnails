document.addEventListener("DOMContentLoaded", () => {
  const formReserva = document.getElementById("formReserva");
  if(!formReserva) return;

  formReserva.addEventListener("submit", function(e){
    e.preventDefault();
    const nome = document.getElementById("nome").value;
    const telefone = document.getElementById("telefone").value;
    const servico = document.getElementById("servico").value;
    const data = document.getElementById("data").value;
    const horario = document.getElementById("horario").value;
    const obs = document.getElementById("obs").value || "Sem observações";
    const clube = document.getElementById("querClube").checked ? "Sim, quero criar login depois e participar do Clube Duts" : "Não quero criar login agora";
    const numero = (window.DUTS_CONFIG && DUTS_CONFIG.whatsapp) ? DUTS_CONFIG.whatsapp : "5511966818500";
    const mensagem =
      "Olá, DutsNails! Gostaria de reservar um horário.%0A%0A" +
      "Nome: " + nome + "%0AWhatsApp: " + telefone + "%0AServiço: " + servico +
      "%0AData desejada: " + data + "%0AHorário: " + horario +
      "%0AClube Duts: " + clube + "%0AObservação: " + obs;
    window.open("https://wa.me/" + numero + "?text=" + mensagem, "_blank");
  });
});

