document.addEventListener("DOMContentLoaded", () => {
  const tabelaServicos = document.getElementById("tabelaServicos");
  if(tabelaServicos && window.DUTS_SERVICOS){
    tabelaServicos.innerHTML = DUTS_SERVICOS.map(s => `
      <tr>
        <td>${s.nome}</td>
        <td>${s.duracao}</td>
        <td>${s.preco}</td>
        <td>${s.observacao || "-"}</td>
      </tr>`).join("");
  }
});
