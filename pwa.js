et vellureInstallPrompt = null;

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
const isMobile = () => window.matchMedia('(max-width: 980px)').matches || /android|iphone|ipad|ipod/i.test(navigator.userAgent);

function atualizarBotoesInstalacao() {
  const instalado = isStandalone();
  document.querySelectorAll('[data-install-pwa], [data-install-pwa-mobile]').forEach((botao) => {
    if (instalado) {
      botao.hidden = true;
      return;
    }
    // No celular o botão deve continuar visível, inclusive no iPhone,
    // onde ele abre as instruções de "Adicionar à Tela de Início".
    botao.hidden = !(vellureInstallPrompt || isMobile());
  });

  const dica = document.getElementById('dicaInstalacaoMobile');
  if (!dica) return;
  if (instalado) {
    dica.hidden = false;
    dica.textContent = 'O Vellure App já está instalado neste aparelho.';
  } else if (isIos()) {
    dica.hidden = false;
    dica.textContent = 'No iPhone: toque em Compartilhar e depois em “Adicionar à Tela de Início”.';
  } else {
    dica.hidden = true;
  }
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  vellureInstallPrompt = event;
  atualizarBotoesInstalacao();
});

window.addEventListener('appinstalled', () => {
  vellureInstallPrompt = null;
  localStorage.setItem('vellure_pwa_instalado', 'sim');
  atualizarBotoesInstalacao();
});

async function instalarVellure() {
  if (isStandalone()) {
    alert('O Vellure App já está instalado neste aparelho.');
    return;
  }
  if (!vellureInstallPrompt) {
    if (isIos()) {
      alert('Para instalar no iPhone: toque no botão Compartilhar do Safari e escolha “Adicionar à Tela de Início”.');
    } else {
      alert('Abra o menu do navegador e escolha “Instalar aplicativo” ou “Adicionar à tela inicial”.');
    }
    return;
  }
  vellureInstallPrompt.prompt();
  await vellureInstallPrompt.userChoice;
  vellureInstallPrompt = null;
  atualizarBotoesInstalacao();
}

async function ativarNotificacoesVellure() {
  if (!('Notification' in window)) {
    alert('Este navegador não oferece notificações.');
    return;
  }
  const permissao = await Notification.requestPermission();
  if (permissao === 'granted') {
    new Notification('Vellure Studio', {
      body: 'Notificações ativadas. Você poderá receber lembretes de agenda e benefícios.',
      icon: 'icon-192.png',
      data: { url: 'cliente-area.html' }
    });
    localStorage.setItem('vellure_notificacoes', 'ativas');
  } else {
    alert('A permissão de notificações não foi concedida.');
  }
}

window.instalarVellure = instalarVellure;
window.ativarNotificacoesVellure = ativarNotificacoesVellure;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(console.error));
}

function definirVisibilidade(elemento, visivel) {
  if (elemento) elemento.hidden = !visivel;
}

async function atualizarAcessoApp() {
  const entrarDesktop = document.getElementById('entrarApp');
  const clienteDesktop = document.getElementById('areaClienteApp');
  const adminDesktop = document.getElementById('painelStudioApp');
  const entrarMobile = document.getElementById('entrarAppMobile');
  const clienteMobile = document.getElementById('areaClienteMobile');
  const adminMobile = document.getElementById('painelStudioMobile');

  definirVisibilidade(entrarDesktop, true);
  definirVisibilidade(entrarMobile, true);
  definirVisibilidade(clienteDesktop, false);
  definirVisibilidade(clienteMobile, false);
  definirVisibilidade(adminDesktop, false);
  definirVisibilidade(adminMobile, false);

  try {
    let tentativas = 0;
    while (!window.vellureDb && tentativas < 30) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      tentativas += 1;
    }
    if (!window.vellureDb) return;

    const user = await window.vellureDb.auth.user();
    if (!user) return;

    const { data: perfil, error } = await window.vellureDb.client
      .from('profiles')
      .select('role,is_active')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !perfil || perfil.is_active === false) return;

    definirVisibilidade(entrarDesktop, false);
    definirVisibilidade(entrarMobile, false);

    if (perfil.role === 'admin' || perfil.role === 'staff') {
      definirVisibilidade(adminDesktop, true);
      definirVisibilidade(adminMobile, true);
    } else {
      definirVisibilidade(clienteDesktop, true);
      definirVisibilidade(clienteMobile, true);
    }
  } catch (error) {
    console.warn('Não foi possível identificar o acesso do aplicativo.', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  atualizarBotoesInstalacao();
  atualizarAcessoApp();
});
window.addEventListener('pageshow', () => {
  atualizarBotoesInstalacao();
  atualizarAcessoApp();
});
window.addEventListener('resize', atualizarBotoesInstalacao);
