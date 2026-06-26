function abrirModalLogin(){document.getElementById("loginModal")?.classList.add("active")}
function fecharModalLogin(){document.getElementById("loginModal")?.classList.remove("active")}

function escolherModelo(modelo){
  const obs = document.getElementById("obs");
  if(obs) obs.value = "Gostei do modelo: " + modelo;
  window.location.href = "#reserva";
}

function renderServicos(){
  const lista = document.getElementById("listaServicos");
  if(lista && window.DUTS_SERVICOS){
    lista.innerHTML = DUTS_SERVICOS.map(s => `
      <div class="card">
        <div class="icon">${s.icone}</div>
        <h3>${s.nome}</h3>
        <p>${s.descricao}</p>
        <div class="meta"><span>${s.duracao}</span><b>${s.preco}</b></div>
      </div>`).join("");
  }

  const select = document.getElementById("servico");
  if(select && window.DUTS_SERVICOS){
    select.innerHTML = '<option value="">Escolha o serviço</option>' +
      DUTS_SERVICOS.map(s => `<option>${s.nome} - ${s.preco}</option>`).join("");
  }
}

function renderGaleria(){
  const galeria = document.getElementById("listaGaleria");
  if(galeria && window.DUTS_GALERIA){
    galeria.innerHTML = DUTS_GALERIA.map(item => `
      <div class="photo" onclick="escolherModelo('${item.nome}')" style="background-image:url('${item.imagem}')"><span>${item.nome}</span></div>`).join("");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderServicos();
  renderGaleria();
});
