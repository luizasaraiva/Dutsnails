const VELLURE_SERVICOS_PADRAO = [
  { id: 1, categoria: "Unhas", icone: "VL", nome: "Alongamento Molde F1", duracao: "2h30", preco: "R$ 150", descricao: "Alongamento elegante, resistente e com acabamento natural.", observacao: "", ativo: true },
  { id: 2, categoria: "Unhas", icone: "VL", nome: "Blindagem", duracao: "1h15", preco: "R$ 90", descricao: "Proteção e resistência para unhas naturais.", observacao: "Não possui manutenção; o produto é renovado integralmente.", ativo: true },
  { id: 3, categoria: "Unhas", icone: "VL", nome: "Alongamento Híbrido", duracao: "2h30", preco: "R$ 180", descricao: "Estrutura resistente com acabamento delicado e sofisticado.", observacao: "", ativo: true },
  { id: 4, categoria: "Unhas", icone: "VL", nome: "Fibra de Vidro", duracao: "2h30", preco: "R$ 180", descricao: "Alongamento refinado, resistente e personalizado.", observacao: "", ativo: true },
  { id: 5, categoria: "Unhas", icone: "VL", nome: "Banho de Gel", duracao: "1h40", preco: "R$ 100", descricao: "Resistência e brilho para acompanhar o crescimento da unha natural.", observacao: "", ativo: true },
  { id: 6, categoria: "Unhas", icone: "VL", nome: "Manutenção", duracao: "Sob agenda", preco: "R$ 100", descricao: "Manutenção da estrutura e renovação do acabamento.", observacao: "Blindagem não possui manutenção.", ativo: true },
  { id: 7, categoria: "Unhas", icone: "VL", nome: "Remoção", duracao: "Sob avaliação", preco: "R$ 50", descricao: "Remoção cuidadosa, preservando a saúde das unhas naturais.", observacao: "", ativo: true },
  { id: 8, categoria: "Decoração", icone: "VL", nome: "Decoração Complexa", duracao: "+30 min", preco: "R$ 25", descricao: "Arte elaborada e personalizada para as duas mãos.", observacao: "Valor referente às duas mãos.", ativo: true },
  { id: 9, categoria: "Extensão de Cílios", icone: "VL", nome: "Volume Brasileiro", duracao: "Sob agenda", preco: "R$ 130", descricao: "Extensão com efeito volumoso, leve e bem definido.", observacao: "", ativo: true },
  { id: 10, categoria: "Extensão de Cílios", icone: "VL", nome: "Volume Fio a Fio", duracao: "Sob agenda", preco: "R$ 90", descricao: "Aplicação delicada para um resultado natural e elegante.", observacao: "", ativo: true },
  { id: 11, categoria: "Extensão de Cílios", icone: "VL", nome: "Volume Egípcio", duracao: "Sob agenda", preco: "R$ 150", descricao: "Volume marcante com acabamento sofisticado e organizado.", observacao: "", ativo: true },
  { id: 12, categoria: "Extensão de Cílios", icone: "VL", nome: "Efeito Fox", duracao: "Sob agenda", preco: "R$ 160", descricao: "Mapeamento alongado para valorizar e elevar o olhar.", observacao: "", ativo: true },
  { id: 13, categoria: "Extensão de Cílios", icone: "VL", nome: "Volume Express", duracao: "Sob agenda", preco: "R$ 90", descricao: "Aplicação prática para realçar o olhar com leveza.", observacao: "", ativo: true },
  { id: 14, categoria: "Extensão de Cílios", icone: "VL", nome: "Mega Brasileiro ou Russo", duracao: "Sob agenda", preco: "R$ 180", descricao: "Volume intenso e personalizado para um olhar de destaque.", observacao: "", ativo: true },
  { id: 15, categoria: "Extensão de Cílios", icone: "VL", nome: "Remoção de Extensão de Cílios", duracao: "Sob agenda", preco: "R$ 60", descricao: "Remoção cuidadosa da extensão, preservando os fios naturais.", observacao: "", ativo: true },
  { id: 16, categoria: "Combos Promocionais", icone: "VL", nome: "Combo Delicada", duracao: "Sob agenda", preco: "R$ 219", descricao: "Alongamento Molde F1 + Volume Fio a Fio para um resultado delicado e elegante.", observacao: "Valor avulso: R$ 240. Economia de R$ 21.", ativo: true },
  { id: 17, categoria: "Combos Promocionais", icone: "VL", nome: "Combo Brasileira", duracao: "Sob agenda", preco: "R$ 249", descricao: "Alongamento Molde F1 + Volume Brasileiro para unhas impecáveis e olhar marcante.", observacao: "Valor avulso: R$ 280. Economia de R$ 31.", ativo: true },
  { id: 18, categoria: "Combos Promocionais", icone: "VL", nome: "Combo Fox Signature", duracao: "Sob agenda", preco: "R$ 299", descricao: "Alongamento Híbrido + Efeito Fox em uma experiência completa Vellure.", observacao: "Valor avulso: R$ 340. Economia de R$ 41.", ativo: true },
  { id: 19, categoria: "Combos Promocionais", icone: "VL", nome: "Combo Mega Luxo", duracao: "Sob agenda", preco: "R$ 329", descricao: "Fibra de Vidro + Mega Brasileiro ou Russo para um visual sofisticado e intenso.", observacao: "Valor avulso: R$ 360. Economia de R$ 31.", ativo: true },
  { id: 20, categoria: "Manutenção de Cílios", icone: "VL", nome: "Manutenção Fio a Fio", duracao: "Sob agenda", preco: "R$ 80", descricao: "Manutenção da técnica Fio a Fio.", observacao: "", ativo: true },
  { id: 21, categoria: "Manutenção de Cílios", icone: "VL", nome: "Manutenção Express", duracao: "Sob agenda", preco: "R$ 80", descricao: "Manutenção da técnica Express.", observacao: "", ativo: true },
  { id: 22, categoria: "Manutenção de Cílios", icone: "VL", nome: "Manutenção Volume Brasileiro", duracao: "Sob agenda", preco: "R$ 85", descricao: "Manutenção do Volume Brasileiro.", observacao: "", ativo: true },
  { id: 23, categoria: "Manutenção de Cílios", icone: "VL", nome: "Manutenção Volume Egípcio", duracao: "Sob agenda", preco: "R$ 90", descricao: "Manutenção do Volume Egípcio.", observacao: "", ativo: true },
  { id: 24, categoria: "Manutenção de Cílios", icone: "VL", nome: "Manutenção Efeito Fox", duracao: "Sob agenda", preco: "R$ 100", descricao: "Manutenção do Efeito Fox.", observacao: "", ativo: true },
  { id: 25, categoria: "Manutenção de Cílios", icone: "VL", nome: "Manutenção Mega Brasileiro ou Russo", duracao: "Sob agenda", preco: "R$ 120", descricao: "Manutenção do Mega Brasileiro ou Russo.", observacao: "", ativo: true }
];

function obterServicos(){
  if(Array.isArray(window.VELLURE_SERVICOS)&&window.VELLURE_SERVICOS.length&&window.VELLURE_SERVICOS!==VELLURE_SERVICOS_PADRAO)return window.VELLURE_SERVICOS;
  try {
    const salvos = JSON.parse(localStorage.getItem("vellure_servicos"));
    if (Array.isArray(salvos) && salvos.length) {
      const idsSalvos = new Set(salvos.map(item => item.id));
      const novos = VELLURE_SERVICOS_PADRAO.filter(item => !idsSalvos.has(item.id));
      if (novos.length) {
        const atualizado = [...salvos, ...novos];
        localStorage.setItem("vellure_servicos", JSON.stringify(atualizado));
        return atualizado;
      }
      return salvos;
    }
    return VELLURE_SERVICOS_PADRAO;
  } catch { return VELLURE_SERVICOS_PADRAO; }
}
function salvarServicos(servicos){
  localStorage.setItem("vellure_servicos", JSON.stringify(servicos));
  window.VELLURE_SERVICOS = servicos;
}
function restaurarServicos(){
  localStorage.removeItem("vellure_servicos");
  window.VELLURE_SERVICOS = [...VELLURE_SERVICOS_PADRAO];
}
window.VELLURE_SERVICOS = obterServicos();
window.obterServicos = obterServicos;
window.salvarServicos = salvarServicos;
window.restaurarServicos = restaurarServicos;
// Sincronização com Supabase. O catálogo padrão permanece como fallback offline do PWA.
async function sincronizarServicosSupabase(){
  if(!window.vellureDb) return obterServicos();
  try{
    const rows=await window.vellureDb.catalog.services();
    if(!rows.length) return obterServicos();
    const convertidos=rows.map(r=>({
      id:r.id,
      categoria:r.category,
      icone:'VL',
      nome:r.name,
      duracao:r.duration_minutes?`${Math.floor(r.duration_minutes/60)}h${r.duration_minutes%60?String(r.duration_minutes%60).padStart(2,'0'):''}`:'Sob agenda',
      duracaoMinutos:r.duration_minutes,
      preco:Number(r.price).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}),
      precoNumero:Number(r.price),
      precoManutencao:r.maintenance_price==null?null:Number(r.maintenance_price),
      descricao:r.description||'',
      observacao:r.notes||'',
      imagem:r.image_path||'',
      destaque:!!r.is_featured,
      ativo:true,
      ordem:r.sort_order||0
    }));
    window.VELLURE_SERVICOS=convertidos;
    localStorage.setItem('vellure_servicos_cache',JSON.stringify(convertidos));
    document.dispatchEvent(new CustomEvent('vellure:servicos-carregados',{detail:convertidos}));
    return convertidos;
  }catch(error){
    console.error('Falha ao carregar serviços do Supabase:',error);
    const cache=JSON.parse(localStorage.getItem('vellure_servicos_cache')||'null');
    if(Array.isArray(cache)&&cache.length) window.VELLURE_SERVICOS=cache;
    return window.VELLURE_SERVICOS;
  }
}
window.sincronizarServicosSupabase=sincronizarServicosSupabase;
document.addEventListener('DOMContentLoaded',sincronizarServicosSupabase);
