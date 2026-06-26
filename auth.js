function clienteLogin(e){
  e.preventDefault();
  localStorage.setItem("duts_cliente_logado","sim");
  window.location.href = "cliente-area.html";
}
function adminLogin(e){
  e.preventDefault();
  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;
  if(user === "duda" && pass === "duts123"){
    localStorage.setItem("duts_admin_logado","sim");
    window.location.href = "studio-painel.html";
  }else{
    document.getElementById("erro").style.display = "block";
  }
}
function sairAdmin(){
  localStorage.removeItem("duts_admin_logado");
  window.location.href = "studio-login.html";
}
function sairCliente(){
  localStorage.removeItem("duts_cliente_logado");
  window.location.href = "cliente-login.html";
}
