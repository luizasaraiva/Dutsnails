function abrirModalLogin(){document.getElementById("loginModal")?.classList.add("active")}
function fecharModalLogin(){document.getElementById("loginModal")?.classList.remove("active")}
function alternarMenu(){document.querySelector(".menu")?.classList.toggle("open")}
function escolherModelo(modelo){const obs=document.getElementById("obs");if(obs)obs.value="Referência escolhida: "+modelo;location.href="#reserva"}
function renderServicos(){
  const servicos=(window.obterServicos?obterServicos():window.VELLURE_SERVICOS||[]).filter(s=>s.ativo!==false);
  const lista=document.getElementById("listaServicos");
  if(lista) lista.innerHTML=servicos.map(s=>`<article class="card service-card"><div class="service-top"><span class="service-mark">${s.icone||'VL'}</span><span class="category">${s.categoria||'Serviço'}</span></div><h3>${s.nome}</h3><p>${s.descricao||''}</p><div class="meta"><span>${s.duracao||''}</span><b>${s.preco||''}</b></div><button class="text-link" onclick="selecionarServico('${String(s.nome).replace(/'/g,"\\'")}')">Agendar este serviço →</button></article>`).join("");
  const select=document.getElementById("servico");
  if(select) select.innerHTML='<option value="">Escolha o serviço</option>'+servicos.map(s=>`<option value="${s.nome} | ${s.preco}">${s.categoria} — ${s.nome} (${s.preco})</option>`).join('');
}
function selecionarServico(nome){const select=document.getElementById('servico');if(select){const opcao=[...select.options].find(o=>o.value.startsWith(nome));select.value=opcao?.value||'';select.dispatchEvent(new Event('change',{bubbles:true}));}location.href='#reserva'}
function renderGaleria(){const g=document.getElementById("listaGaleria");if(g&&window.VELLURE_GALERIA)g.innerHTML=VELLURE_GALERIA.map(i=>`<div class="photo" onclick="escolherModelo('${i.nome}')" style="background-image:url('${i.imagem}')"><span>${i.nome}</span></div>`).join('')}
document.addEventListener("DOMContentLoaded",()=>{renderServicos();renderGaleria();const d=document.getElementById('data');if(d)d.min=new Date().toISOString().split('T')[0]});
function renderAssinaturas(){
 const lista=document.getElementById('listaAssinaturas');if(!lista||!window.obterAssinaturas)return;
 const planos=obterAssinaturas().filter(p=>p.ativo!==false);
 lista.innerHTML=planos.map(p=>`<article class="subscription-card ${p.destaque?'featured':''}">${p.destaque?'<span class="subscription-badge">Mais escolhido</span>':''}<div class="mini">Assinatura mensal</div><h3>${p.nome}</h3><div class="subscription-price">${p.preco}</div><p>${p.descricao||''}</p><ul class="subscription-benefits">${(p.beneficios||[]).map(b=>`<li>${b}</li>`).join('')}</ul><button class="btn ${p.destaque?'gold':'light'} full" onclick="solicitarAssinatura('${String(p.nome).replace(/'/g,"\\'")}','${String(p.preco).replace(/'/g,"\\'")}')">Quero este plano</button></article>`).join('');
}
function solicitarAssinatura(nome,preco){const numero=(window.VELLURE_CONFIG&&VELLURE_CONFIG.whatsapp)||'5511966818500';const msg=`Olá! Tenho interesse em assinar o pacote mensal ${nome} (${preco}). Gostaria de receber as regras, formas de pagamento e disponibilidade.`;window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`,'_blank','noopener')}
document.addEventListener('DOMContentLoaded',renderAssinaturas);

function aplicarServicoRecomendado(){
 const params=new URLSearchParams(location.search);const nome=params.get('servico')||localStorage.getItem('vellure_servico_recomendado');if(!nome)return;
 const select=document.getElementById('servico');if(!select)return;
 const opt=[...select.options].find(o=>o.value.startsWith(nome)||o.textContent.includes(nome));if(opt){select.value=opt.value;select.dispatchEvent(new Event('change',{bubbles:true}));localStorage.removeItem('vellure_servico_recomendado');setTimeout(()=>document.getElementById('reserva')?.scrollIntoView({behavior:'smooth'}),150)}
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(aplicarServicoRecomendado,80));
document.addEventListener('vellure:servicos-carregados',()=>{renderServicos();aplicarServicoRecomendado();window.atualizarResumoPagamento?.()});
document.addEventListener('vellure:assinaturas-carregadas',renderAssinaturas);
