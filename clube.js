(function(){
  const KEY='vellure_clube_clientes';
  const defaults=[{
    id:'maria-demo', nome:'Maria', email:'maria@exemplo.com', whatsapp:'(11) 99999-0000',
    assinatura:'Vellure Signature', statusAssinatura:'Ativa', renovacao:'05/08/2026',
    pontos:620, cashback:28.50, indicacoes:2,
    visitas:[
      {data:'24/07/2026',hora:'14:00',servico:'Manutenção de Alongamento'},
      {data:'08/08/2026',hora:'10:00',servico:'Manutenção Volume Brasileiro'}
    ],
    vouchers:[{codigo:'MIMO50',titulo:'Mimo Vellure',descricao:'R$ 50 de desconto em um serviço acima de R$ 150',validade:'31/08/2026',status:'Disponível'}],
    cupons:[{codigo:'CLUBE10',titulo:'10% OFF',descricao:'10% de desconto em serviços adicionais',validade:'31/12/2026',status:'Ativo'}],
    beneficios:['Prioridade na agenda','5% de cashback','Desconto em serviços extras','Mimo de aniversário'],
    historico:[{data:'03/07/2026',descricao:'Manutenção de alongamento',pontos:100},{data:'15/06/2026',descricao:'Alongamento Molde F1',pontos:150}]
  }];
  function load(){try{const x=JSON.parse(localStorage.getItem(KEY));if(Array.isArray(x)&&x.length)return x}catch(e){}localStorage.setItem(KEY,JSON.stringify(defaults));return JSON.parse(JSON.stringify(defaults))}
  function save(x){localStorage.setItem(KEY,JSON.stringify(x))}
  function money(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
  function current(){const all=load();const id=localStorage.getItem('vellure_cliente_id');return all.find(c=>c.id===id)||all[0]}
  function esc(s){return String(s??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]))}
  function statusClass(s){return /ativa|ativo|disponível|confirmado/i.test(s||'')?'club-status ok':'club-status'}

  window.ClubeVellure={load,save,current,money};

  window.renderClubeCliente=function(){
    const c=current(); if(!c)return;
    const nome=document.getElementById('clienteNome'); if(nome) nome.textContent=c.nome; const vip=document.getElementById('vipNome'); if(vip) vip.textContent=String(c.nome||'MEMBRO DO CLUBE').toUpperCase();
    const nivel=c.pontos>=1000?'Diamante':c.pontos>=500?'Gold':'Essencial';
    const progress=Math.min(100,(c.pontos%500)/5);
    const html={
      assinatura:`<div class="club-plan"><span class="club-kicker">Plano atual</span><h3>${esc(c.assinatura||'Sem assinatura')}</h3><span class="${statusClass(c.statusAssinatura)}">${esc(c.statusAssinatura||'Inativa')}</span><p>Próxima renovação: <b>${esc(c.renovacao||'—')}</b></p><a class="btn gold" href="index.html#assinaturas">Ver planos</a></div>`,
      pontos:`<div class="club-points"><span class="club-kicker">Nível ${nivel}</span><strong>${Number(c.pontos||0)}</strong><small>pontos disponíveis</small><div class="club-progress"><i style="width:${progress}%"></i></div><p>Ganhe pontos em atendimentos, indicações e assinaturas.</p></div>`,
      cashback:`<div class="club-cash"><span class="club-kicker">Saldo disponível</span><strong>${money(c.cashback)}</strong><small>cashback Vellure</small><p>Use no próximo atendimento elegível.</p></div>`,
      indicacoes:`<div class="club-referral"><span class="club-kicker">Indique e ganhe</span><strong>${Number(c.indicacoes||0)}</strong><small>indicações confirmadas</small><button class="btn dark" onclick="copiarIndicacao('${esc(c.id)}')">Copiar meu código</button></div>`
    };
    Object.entries(html).forEach(([id,val])=>{const el=document.getElementById('club-'+id);if(el)el.innerHTML=val});
    const visitas=document.getElementById('club-visitas'); if(visitas) visitas.innerHTML=(c.visitas||[]).length?(c.visitas||[]).map(v=>`<div class="club-list-item"><div class="club-date"><b>${esc(v.data)}</b><span>${esc(v.hora)}</span></div><div><strong>${esc(v.servico)}</strong><small>Agendamento futuro</small></div><a href="index.html#reserva">Detalhes</a></div>`).join(''):'<p>Nenhuma visita agendada.</p>';
    const vouchers=document.getElementById('club-vouchers'); if(vouchers) vouchers.innerHTML=(c.vouchers||[]).map(v=>`<article class="reward-card"><span class="${statusClass(v.status)}">${esc(v.status)}</span><h3>${esc(v.titulo)}</h3><p>${esc(v.descricao)}</p><div><code>${esc(v.codigo)}</code><small>Validade: ${esc(v.validade)}</small></div></article>`).join('')||'<p>Nenhum voucher disponível.</p>';
    const cupons=document.getElementById('club-cupons'); if(cupons) cupons.innerHTML=(c.cupons||[]).map(v=>`<article class="reward-card coupon"><span class="${statusClass(v.status)}">${esc(v.status)}</span><h3>${esc(v.titulo)}</h3><p>${esc(v.descricao)}</p><div><code>${esc(v.codigo)}</code><small>Validade: ${esc(v.validade)}</small></div></article>`).join('')||'<p>Nenhum cupom ativo.</p>';
    const beneficios=document.getElementById('club-beneficios'); if(beneficios) beneficios.innerHTML=(c.beneficios||[]).map(b=>`<li>${esc(b)}</li>`).join('');
  };

  window.copiarIndicacao=function(id){const code='VELLURE-'+String(id).toUpperCase();navigator.clipboard?.writeText(code);alert('Código de indicação copiado: '+code)};

  window.renderClubeAdmin=function(){
    const tbody=document.getElementById('clubAdminBody');if(!tbody)return;const all=load();
    tbody.innerHTML=all.map(c=>`<tr><td><b>${esc(c.nome)}</b><small>${esc(c.whatsapp)}</small></td><td>${esc(c.assinatura||'Sem plano')}<small>${esc(c.statusAssinatura||'')}</small></td><td>${Number(c.pontos||0)}</td><td>${money(c.cashback)}</td><td>${Number(c.indicacoes||0)}</td><td class="table-actions"><button onclick="editarClube('${c.id}')">Editar</button><button onclick="ajustarPontos('${c.id}',100)">+100 pts</button><button onclick="ajustarCashback('${c.id}',10)">+R$10</button></td></tr>`).join('');
    const totalPontos=all.reduce((s,c)=>s+Number(c.pontos||0),0), totalCash=all.reduce((s,c)=>s+Number(c.cashback||0),0), ativos=all.filter(c=>/ativa/i.test(c.statusAssinatura||'')).length;
    const ids={clubStatClientes:all.length,clubStatAssinantes:ativos,clubStatPontos:totalPontos,clubStatCash:money(totalCash)};Object.entries(ids).forEach(([i,v])=>{const e=document.getElementById(i);if(e)e.textContent=v});
  };
  window.editarClube=function(id){const c=load().find(x=>x.id===id);if(!c)return;['id','nome','whatsapp','assinatura','statusAssinatura','renovacao','pontos','cashback','indicacoes'].forEach(k=>{const e=document.getElementById('cf-'+k);if(e)e.value=c[k]??''});document.getElementById('clubModal').classList.add('active')};
  window.novoClube=function(){document.getElementById('clubForm').reset();document.getElementById('cf-id').value='cliente-'+Date.now();document.getElementById('clubModal').classList.add('active')};
  window.fecharClubeModal=function(){document.getElementById('clubModal').classList.remove('active')};
  window.salvarClube=function(e){e.preventDefault();const all=load(),id=document.getElementById('cf-id').value;let c=all.find(x=>x.id===id);if(!c){c={id,visitas:[],vouchers:[],cupons:[],beneficios:['Prioridade na agenda'],historico:[]};all.push(c)};['nome','whatsapp','assinatura','statusAssinatura','renovacao'].forEach(k=>c[k]=document.getElementById('cf-'+k).value);['pontos','cashback','indicacoes'].forEach(k=>c[k]=Number(document.getElementById('cf-'+k).value||0));save(all);fecharClubeModal();renderClubeAdmin()};
  window.ajustarPontos=function(id,n){const all=load(),c=all.find(x=>x.id===id);if(c){c.pontos=Number(c.pontos||0)+n;save(all);renderClubeAdmin()}};
  window.ajustarCashback=function(id,n){const all=load(),c=all.find(x=>x.id===id);if(c){c.cashback=Number(c.cashback||0)+n;save(all);renderClubeAdmin()}};

  document.addEventListener('DOMContentLoaded',()=>{renderClubeCliente();renderClubeAdmin()});
})();
