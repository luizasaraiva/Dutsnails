(()=>{
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmt=v=>new Date(v).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',dateStyle:'short',timeStyle:'short'});
let selected=null;
async function token(){return (await window.vellureDb.client.auth.getSession()).data.session?.access_token}
async function notify(id,action){try{await fetch('/api/appointment-action-notify',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${await token()}`},body:JSON.stringify({appointmentId:id,action})})}catch{}}
async function load(){
 const box=document.getElementById('clientAppointments');if(!box||!window.vellureDb)return;
 const list=await window.vellureDb.clientArea.appointments();
 const future=list.filter(a=>new Date(a.starts_at)>new Date()&&!['cancelled','canceled','completed'].includes(a.status));
 box.innerHTML=future.length?future.map(a=>{const svc=a.appointment_items?.[0]?.service_name_snapshot||'Procedimento';const allowed=new Date(a.starts_at)-Date.now()>86400000;return `<article class="client-appt-row"><div><strong>${esc(svc)}</strong><span>${fmt(a.starts_at)}</span><small>Status: ${esc(a.status)}</small></div><div class="client-appt-actions">${allowed?`<button class="btn light" onclick="abrirReagendamento('${a.id}','${a.starts_at}')">Reagendar</button><button class="btn danger-soft" onclick="cancelarAgendamentoCliente('${a.id}')">Cancelar</button>`:'<small>Alterações somente pelo WhatsApp (menos de 24h).</small>'}</div></article>`}).join(''):'<p>Nenhum agendamento futuro.</p>';
}
window.cancelarAgendamentoCliente=async id=>{const reason=prompt('Conte brevemente o motivo do cancelamento:')||'';if(!confirm('Deseja realmente cancelar este agendamento?'))return;try{const {error}=await window.vellureDb.client.rpc('cancel_own_appointment',{p_appointment_id:id,p_reason:reason});if(error)throw error;await notify(id,'cancelled');alert('Agendamento cancelado.');load()}catch(e){alert(e.message||'Não foi possível cancelar.')}};
window.abrirReagendamento=(id,current)=>{selected=id;document.getElementById('reagData').min=new Date().toISOString().slice(0,10);document.getElementById('reagData').value='';document.getElementById('reagHorario').value='';document.getElementById('reagModal').classList.add('active')};
window.fecharReagendamento=()=>document.getElementById('reagModal').classList.remove('active');
async function refreshSlots(){const d=document.getElementById('reagData').value,h=document.getElementById('reagHorario');[...h.options].forEach((o,i)=>{if(i){o.disabled=false;o.textContent=o.value}});if(!d)return;const r=await fetch(`/api/available-slots?date=${d}`);const j=await r.json();const set=new Set(j.occupied||[]);[...h.options].forEach((o,i)=>{if(i&&set.has(o.value)){o.disabled=true;o.textContent=`${o.value} — indisponível`}})}
async function submit(e){e.preventDefault();const d=document.getElementById('reagData').value,h=document.getElementById('reagHorario').value;if(!d||!h)return alert('Escolha data e horário.');try{const starts=new Date(`${d}T${h}:00-03:00`).toISOString();const {error}=await window.vellureDb.client.rpc('reschedule_own_appointment',{p_appointment_id:selected,p_new_starts_at:starts});if(error)throw error;await notify(selected,'rescheduled');fecharReagendamento();alert('Agendamento reagendado.');load()}catch(e){alert(e.message||'Não foi possível reagendar.')}}
document.addEventListener('DOMContentLoaded',()=>{load().catch(console.error);document.getElementById('reagData')?.addEventListener('change',refreshSlots);document.getElementById('reagForm')?.addEventListener('submit',submit)});
})();
