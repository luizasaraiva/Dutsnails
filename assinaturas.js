const VELLURE_ASSINATURAS_PADRAO = [
  {id:101,nome:'Vellure Essencial',preco:'R$ 179/mês',descricao:'Manutenção mensal de unhas e cílios com praticidade e economia.',beneficios:['1 banho de gel por mês','1 Volume Express por mês','Prioridade na agenda','5% de desconto em serviços extras'],destaque:false,ativo:true},
  {id:102,nome:'Vellure Signature',preco:'R$ 249/mês',descricao:'Cuidado completo para manter unhas e olhar impecáveis todos os meses.',beneficios:['1 manutenção de alongamento por mês','1 Volume Brasileiro por mês','1 decoração simples inclusa','Prioridade na agenda','10% de desconto em serviços extras'],destaque:true,ativo:true},
  {id:103,nome:'Vellure Premium',preco:'R$ 329/mês',descricao:'Experiência premium para quem deseja unhas e cílios sempre renovados.',beneficios:['1 manutenção de alongamento por mês','1 extensão de cílios de até R$ 160 por mês','1 remoção de cílios quando necessária','Prioridade máxima na agenda','10% de desconto em serviços extras'],destaque:false,ativo:true},
  {id:104,nome:'Vellure Luxo',preco:'R$ 399/mês',descricao:'O plano mais completo da Vellure para uma rotina de beleza exclusiva.',beneficios:['1 manutenção de alongamento por mês','1 Mega Brasileiro ou Russo por mês','1 decoração complexa por mês','Prioridade máxima na agenda','15% de desconto em serviços extras'],destaque:false,ativo:true}
];
function obterAssinaturas(){
  try{
    const salvas=JSON.parse(localStorage.getItem('vellure_assinaturas'));
    if(Array.isArray(salvas)&&salvas.length){
      const ids=new Set(salvas.map(item=>item.id));
      const novas=VELLURE_ASSINATURAS_PADRAO.filter(item=>!ids.has(item.id));
      if(novas.length){
        const atualizadas=[...salvas,...novas];
        localStorage.setItem('vellure_assinaturas',JSON.stringify(atualizadas));
        return atualizadas;
      }
      return salvas;
    }
    return VELLURE_ASSINATURAS_PADRAO;
  }catch{return VELLURE_ASSINATURAS_PADRAO}
}
function salvarAssinaturas(x){localStorage.setItem('vellure_assinaturas',JSON.stringify(x));window.VELLURE_ASSINATURAS=x}
function restaurarAssinaturas(){localStorage.removeItem('vellure_assinaturas');window.VELLURE_ASSINATURAS=[...VELLURE_ASSINATURAS_PADRAO]}
window.VELLURE_ASSINATURAS=obterAssinaturas();window.obterAssinaturas=obterAssinaturas;window.salvarAssinaturas=salvarAssinaturas;window.restaurarAssinaturas=restaurarAssinaturas;
