import {chargeBalance} from './commissionBalance.js';
export function financeSnapshot({charges=[],payments=[],reservations=[],transactions=[],accommodationId='',from='',to='',today}) {
 const inPeriod=d=>!!d&&(!from||d>=from)&&(!to||d<=to);
 const localDay=value=>value?new Intl.DateTimeFormat('en-CA',{timeZone:'America/Managua',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value)):'';
 const scoped=charges.filter(c=>!accommodationId||c.accommodation_id===accommodationId);
 const valid=scoped.filter(c=>c.status!=='void');
 const currencies={USD:{issued:0,collected:0,balance:0,overdue:0,otherIncome:0,expenses:0,reservationValue:0,reservationCount:0},NIO:{issued:0,collected:0,balance:0,overdue:0,otherIncome:0,expenses:0,reservationValue:0,reservationCount:0}};
 const add=(currency,key,value)=>{if(currencies[currency])currencies[currency][key]+=Math.round(Number(value||0)*100)/100;};
 for(const c of valid){const b=chargeBalance(c,payments);add(c.currency,'balance',b.balance);if(c.due_on<today)add(c.currency,'overdue',b.balance);if(inPeriod(localDay(c.created_at)))add(c.currency,'issued',c.amount);}
 for(const p of payments){const c=valid.find(c=>c.id===p.charge_id);if(c&&p.status==='confirmed'&&inPeriod(p.paid_on))add(c.currency,'collected',p.amount);}
 for(const t of transactions){if(t.status!=='confirmed'||!inPeriod(t.transaction_date)||(accommodationId&&(t.target_type!=='accommodation'||t.target_id!==accommodationId)))continue;if(t.transaction_type==='income')add(t.currency,'otherIncome',t.amount);if(t.transaction_type==='expense')add(t.currency,'expenses',t.amount);}
 const relevantReservations=reservations.filter(r=>r.target_type==='accommodation'&&r.status!=='cancelled'&&(!accommodationId||r.target_id===accommodationId)&&inPeriod(r.starts_on));
 for(const r of relevantReservations){add(r.currency,'reservationValue',r.total_amount);add(r.currency,'reservationCount',1);}
 for(const t of Object.values(currencies)){for(const k of Object.keys(t))t[k]=Math.round(t[k]*100)/100;t.result=Math.round((t.collected+t.otherIncome-t.expenses)*100)/100;}
 return {currencies,reservations:relevantReservations.length,overdueCharges:valid.filter(c=>c.due_on<today&&chargeBalance(c,payments).balance>0).length};
}
