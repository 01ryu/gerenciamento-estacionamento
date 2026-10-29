export const PLANS = [
 {id:'hour',label:'1 hora · R$ 20,00',minutes:60,priceCents:2000},
 {id:'five',label:'5 horas · R$ 50,00',minutes:300,priceCents:5000},
];
export function parsePrice(value) {
 const text=String(value).trim();
 if(!/^\d{1,7}([,.]\d{1,2})?$/.test(text))return null;
 const [whole,fraction='']=text.replace(',','.').split('.');
 return Number(whole)*100+Number(fraction.padEnd(2,'0'));
}
export function validatePlan(plan) {
 if(!plan||!Number.isInteger(plan.minutes)||plan.minutes<1||plan.minutes>525600)throw new Error('Informe um tempo de 1 a 525600 minutos.');
 if(!Number.isSafeInteger(plan.priceCents)||plan.priceCents<1||plan.priceCents>999999999)throw new Error('Informe um valor maior que zero, com até duas casas decimais.');
 if(typeof plan.notes!=='string'||plan.notes.length>500)throw new Error('As observações devem ter no máximo 500 caracteres.');
 return {...plan,notes:plan.notes.trim()};
}
export function planBalance(entry,now=Date.now()) {
 if(!entry?.enteredAt?.includes('T')||!Number.isInteger(entry.durationMinutes)||entry.durationMinutes<1||!Number.isInteger(entry.priceCents))return null;
 const start=Date.parse(entry.enteredAt),end=entry.closed?Date.parse(entry.exitedAt):now;
 if(!Number.isFinite(start)||!Number.isFinite(end))return null;
 const segments=[{start,end:start+entry.durationMinutes*60000,priceCents:entry.priceCents},...(entry.extensions||[]).map(e=>({start:Date.parse(e.startsAt),end:Date.parse(e.endsAt),priceCents:e.priceCents}))];
 const due=Math.max(...segments.map(s=>s.end));
 const remainingCents=segments.reduce((sum,s)=>sum+s.priceCents*Math.max(0,Math.min(1,(s.end-Math.max(end,s.start))/(s.end-s.start))),0);
 return {remaining:Math.max(0,due-end),overdue:Math.max(0,end-due),elapsed:Math.max(0,end-start),dueAt:new Date(due).toISOString(),remainingCents:Math.round(remainingCents),totalPriceCents:segments.reduce((sum,s)=>sum+s.priceCents,0),totalMinutes:entry.durationMinutes+(entry.extensions||[]).reduce((sum,e)=>sum+e.minutes,0)};
}
export function extensionTiming(entry,minutes,now=Date.now()) {
 const balance=planBalance(entry,now);
 if(!balance||entry.closed)throw new Error('Esta ocupação não possui um período ativo válido para prorrogar.');
 const starts=Math.max(now,Date.parse(balance.dueAt));
 return {startsAt:new Date(starts).toISOString(),endsAt:new Date(starts+minutes*60000).toISOString()};
}
export const money=cents=>(cents/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export function durationText(ms) {
 const seconds=Math.ceil(Math.max(0,ms)/1000),hours=Math.floor(seconds/3600),minutes=Math.floor(seconds%3600/60);
 return `${String(hours).padStart(2,'0')}h ${String(minutes).padStart(2,'0')}min ${String(seconds%60).padStart(2,'0')}s`;
}
