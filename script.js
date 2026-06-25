
const whatsapp = "5511966818500";

function escolherModelo(modelo) {
  document.getElementById("obs").value = "Gostei do modelo: " + modelo;
  window.location.href = "#reserva";
}

const form = document.getElementById("formReserva");
if (form) {
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    const nome = document.getElementById("nome").value;
    const telefone = document.getElementById("telefone").value;
    const servico = document.getElementById("servico").value;
    const data = document.getElementById("data").value;
    const horario = document.getElementById("horario").value;
    const obs = document.getElementById("obs").value || "Sem observações";
    const clube = document.getElementById("querClube").checked
      ? "Sim, quero criar login depois e participar do Clube Duts"
      : "Não quero criar login agora";

    const mensagem =
      "Olá, DutsNails! Gostaria de reservar um horário.%0A%0A" +
      "Nome: " + nome + "%0A" +
      "WhatsApp: " + telefone + "%0A" +
      "Serviço: " + servico + "%0A" +
      "Data desejada: " + data + "%0A" +
      "Horário: " + horario + "%0A" +
      "Clube Duts: " + clube + "%0A" +
      "Observação: " + obs;

    window.open("https://wa.me/" + whatsapp + "?text=" + mensagem, "_blank");
  });
}
