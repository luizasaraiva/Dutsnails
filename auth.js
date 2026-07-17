(() => {
  const db = () => window.vellureDb;
  const emailFrom = input => String(input || '').trim().toLowerCase();
  const showError = (message) => {
    const box = document.getElementById('erro');
    if (box) { box.textContent = message; box.style.display = 'block'; }
    else alert(message);
  };

  window.clienteLogin = async function (event) {
    event.preventDefault();
    const fields = [...event.currentTarget.querySelectorAll('input')];
    const email = emailFrom(fields[0]?.value);
    const password = fields[1]?.value || '';
    try {
      const { error } = await db().auth.signIn(email, password);
      if (error) throw error;
      location.href = 'cliente-area.html';
    } catch (error) { showError(error.message || 'Não foi possível entrar.'); }
  };

  window.clienteCadastro = async function (event) {
    event.preventDefault();
    const fields = [...event.currentTarget.querySelectorAll('input')];
    const [fullName, email, phone, password] = fields.map(x => x.value.trim());
    try {
      const { data, error } = await db().auth.signUp(emailFrom(email), password, fullName, phone);
      if (error) throw error;
      if (data.session) location.href = 'cliente-area.html';
      else {
        alert('Cadastro realizado. Confirme o e-mail para ativar sua conta.');
        location.href = 'cliente-login.html';
      }
    } catch (error) { showError(error.message || 'Não foi possível criar a conta.'); }
  };

  window.recuperarSenha = async function (event) {
    event.preventDefault();
    const email = emailFrom(event.currentTarget.querySelector('input')?.value);
    try {
      const { error } = await db().auth.resetPassword(email);
      if (error) throw error;
      const ok = document.getElementById('okMsg');
      if (ok) ok.style.display = 'block';
    } catch (error) { showError(error.message || 'Não foi possível enviar a recuperação.'); }
  };

  window.adminLogin = async function (event) {
    event.preventDefault();
    try {
      const email = emailFrom(document.getElementById('user').value);
      const password = document.getElementById('pass').value;
      const { error } = await db().auth.signIn(email, password);
      if (error) throw error;
      const user = await db().auth.user();
      const { data: profile, error: profileError } = await db().client.from('profiles').select('role,is_active').eq('id', user.id).single();
      if (profileError) throw profileError;
      if (!profile?.is_active || !['staff','admin'].includes(profile.role)) {
        await db().auth.signOut();
        throw new Error('Sua conta não possui acesso ao painel do Studio.');
      }
      location.href = 'studio-painel.html';
    } catch (error) { showError(error.message || 'Usuário ou senha inválidos.'); }
  };

  window.sairAdmin = window.sairCliente = async function () {
    try { await db()?.auth.signOut(); } finally { location.href = 'index.html'; }
  };

  async function protectPage() {
    const page = location.pathname.split('/').pop();
    const clientProtected = page === 'cliente-area.html';
    const adminProtected = /^studio-(?!login)/.test(page);
    if (!clientProtected && !adminProtected) return;
    try {
      const user = await db().auth.user();
      if (adminProtected) {
        const { data } = await db().client.from('profiles').select('role,is_active').eq('id', user.id).single();
        if (!data?.is_active || !['staff','admin'].includes(data.role)) throw new Error('Sem acesso');
      }
    } catch {
      location.replace(adminProtected ? 'studio-login.html' : 'cliente-login.html');
    }
  }
  document.addEventListener('DOMContentLoaded', protectPage);
})();
