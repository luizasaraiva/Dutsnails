(() => {
  const db = () => window.vellureDb;
  const normalizeEmail = value => String(value || '').trim().toLowerCase();

  function showError(message) {
    const box = document.getElementById('erro');
    if (!box) return alert(message);
    box.textContent = message;
    box.style.display = 'block';
  }

  function clearError() {
    const box = document.getElementById('erro');
    if (box) {
      box.textContent = '';
      box.style.display = 'none';
    }
  }

  window.adminLogin = async function adminLogin(event) {
    event?.preventDefault();
    clearError();

    const button = document.getElementById('entrarAdmin');
    const email = normalizeEmail(document.getElementById('user')?.value);
    const password = document.getElementById('pass')?.value || '';

    if (!db()) {
      showError('A conexão com o Supabase não foi carregada. Atualize os arquivos supabase-config.js e supabase-client.js.');
      return;
    }

    try {
      if (button) {
        button.disabled = true;
        button.textContent = 'Entrando...';
      }

      const { data: signInData, error: signInError } = await db().auth.signIn(email, password);
      if (signInError) throw signInError;

      const user = signInData?.user || await db().auth.user();
      const { data: profile, error: profileError } = await db().client
        .from('profiles')
        .select('role,is_active')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) throw new Error('Seu perfil ainda não foi criado na tabela profiles.');
      if (profile.is_active === false) throw new Error('Sua conta administrativa está desativada.');
      if (profile.role !== 'admin') {
        await db().auth.signOut();
        throw new Error('Esta conta não possui permissão de administradora.');
      }

      location.replace('studio-painel.html');
    } catch (error) {
      const map = {
        'Invalid login credentials': 'E-mail ou senha incorretos.',
        'Email not confirmed': 'Confirme seu e-mail antes de entrar.',
        'Failed to fetch': 'Não foi possível conectar ao Supabase. Verifique a internet e a configuração do projeto.'
      };
      showError(map[error?.message] || error?.message || 'Não foi possível entrar.');
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = 'Entrar';
      }
    }
  };

  window.clienteLogin = async function clienteLogin(event) {
    event.preventDefault();
    const fields = [...event.currentTarget.querySelectorAll('input')];
    try {
      const { error } = await db().auth.signIn(normalizeEmail(fields[0]?.value), fields[1]?.value || '');
      if (error) throw error;
      location.href = 'cliente-area.html';
    } catch (error) {
      showError(error.message || 'Não foi possível entrar.');
    }
  };

  window.clienteCadastro = async function clienteCadastro(event) {
    event.preventDefault();
    const fields = [...event.currentTarget.querySelectorAll('input')];
    const [fullName, email, phone, password] = fields.map(input => input.value.trim());
    try {
      const { data, error } = await db().auth.signUp(normalizeEmail(email), password, fullName, phone);
      if (error) throw error;
      if (data.session) location.href = 'cliente-area.html';
      else {
        alert('Cadastro realizado. Confirme o e-mail para ativar sua conta.');
        location.href = 'cliente-login.html';
      }
    } catch (error) {
      showError(error.message || 'Não foi possível criar a conta.');
    }
  };

  window.recuperarSenha = async function recuperarSenha(event) {
    event.preventDefault();
    const email = normalizeEmail(event.currentTarget.querySelector('input')?.value);
    try {
      const { error } = await db().auth.resetPassword(email);
      if (error) throw error;
      const ok = document.getElementById('okMsg');
      if (ok) ok.style.display = 'block';
    } catch (error) {
      showError(error.message || 'Não foi possível enviar a recuperação.');
    }
  };

  window.sairAdmin = window.sairCliente = async function sair() {
    try { await db()?.auth.signOut(); }
    finally { location.href = 'index.html'; }
  };

  async function protectPage() {
    const page = location.pathname.split('/').pop();
    const clientProtected = page === 'cliente-area.html';
    const adminProtected = /^studio-(?!login)/.test(page);
    if (!clientProtected && !adminProtected) return;

    try {
      const user = await db().auth.user();
      if (adminProtected) {
        const { data, error } = await db().client
          .from('profiles')
          .select('role,is_active')
          .eq('id', user.id)
          .maybeSingle();
        if (error || !data || data.is_active === false || data.role !== 'admin') {
          throw new Error('Sem acesso');
        }
      }
    } catch {
      location.replace(adminProtected ? 'studio-login.html' : 'cliente-login.html');
    }
  }

  document.addEventListener('DOMContentLoaded', protectPage);
})();
