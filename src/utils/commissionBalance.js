export function chargeBalance(charge, payments) {
 const paid = payments.filter(p => p.charge_id === charge.id && p.status === 'confirmed').reduce((sum,p) => sum + Math.round(Number(p.amount)*100),0);
 const principal = Math.round(Number(charge.amount)*100);
 return { paid: paid/100, balance: charge.status === 'void' ? 0 : (principal-paid)/100 };
}
export function collectionTotals(charges,payments) {
 return charges.filter(c => c.status !== 'void').reduce((acc,c) => {
  const b = chargeBalance(c,payments);
  const t = acc[c.currency] ||= {issued:0,paid:0,balance:0};
  t.issued=Math.round((t.issued+Number(c.amount))*100)/100;
  t.paid=Math.round((t.paid+b.paid)*100)/100;
  t.balance=Math.round((t.balance+b.balance)*100)/100;
  return acc;
 },{});
}
