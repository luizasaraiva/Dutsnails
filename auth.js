function clienteLogin(e){e.preventDefault();localStorage.setItem("vellure_cliente_logado","sim");location.href="cliente-area.html"}
function adminLogin(e){e.preventDefault();const user=document.getElementById("user").value;const pass=document.getElementById("pass").value;if(user==="vellure"&&pass==="studio123"){localStorage.setItem("vellure_admin_logado","sim");location.href="studio-painel.html"}else document.getElementById("erro").style.display="block"}
function sairAdmin(){localStorage.removeItem("vellure_admin_logado");location.href="studio-login.html"}
function sairCliente(){localStorage.removeItem("vellure_cliente_logado");location.href="cliente-login.html"}
