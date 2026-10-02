import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { chargeBalance, collectionTotals } from '../utils/commissionBalance';
import { exportToCSV } from '../utils/csvExport';
const money = (value,currency) => `${currency} ${Number(value).toFixed(2)}`;
const today = () => new Intl.DateTimeFormat('en-CA',{timeZone:'America/Managua',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
// Supabase caps responses: fetch every page, or fail without presenting partial totals.
async function allRows(table,columns='*') {
 const rows=[];
 for(let start=0;;start+=500) {
  const {data,error}=await supabase.from(table).select(columns).order('id').range(start,start+499);
  if(error) throw error;
  rows.push(...data); if(data.length<500) return rows;
 }
}
export default function CommissionCollectionsPage() {
 const [state,setState]=useState({charges:[],payments:[],reservations:[],accommodations:[]});
 const [error,setError]=useState(''), [loading,setLoading]=useState(true), [busy,setBusy]=useState(false);
 const [filter,setFilter]=useState(''), [status,setStatus]=useState('all');
 const [reservationId,setReservationId]=useState(''), [due,setDue]=useState(today);
 const [chargeId,setChargeId]=useState(''), [amount,setAmount]=useState(''), [date,setDate]=useState(today), [method,setMethod]=useState('transfer'), [reference,setReference]=useState('');
 const [voiding,setVoiding]=useState(null), [reason,setReason]=useState('');
 const reload=useCallback(async()=>{setLoading(true);setError('');try {
  const [charges,payments,reservations,accommodations]=await Promise.all([allRows('ota_commission_charges'),allRows('ota_commission_payments'),allRows('reservations'),allRows('accommodations','id,name')]);
  setState({charges,payments,reservations,accommodations});
 }catch(e){setError(e.message);}finally{setLoading(false);}},[]);
 useEffect(()=>{reload();},[reload]);
 const rows=useMemo(()=>state.charges.map(c=>({...c,...chargeBalance(c,state.payments),accommodation:state.accommodations.find(a=>a.id===c.accommodation_id)?.name || c.accommodation_id,reservation:state.reservations.find(r=>r.id===c.reservation_id)?.reservation_code || c.reservation_id})).filter(c=>(!filter || c.accommodation_id===filter) && (status==='all' || (status==='void' ? c.status==='void' : c.status!=='void' && (status==='paid' ? c.balance===0 : status==='overdue' ? c.balance>0 && c.due_on<today() : c.balance>0)))),[state,filter,status]);
 const totals=collectionTotals(rows,state.payments);
 const eligible=state.reservations.filter(r=>r.target_type==='accommodation' && r.target_id && r.status==='completed' && Number(r.commission_percent)>0 && Number(r.total_amount)>0 && !state.charges.some(c=>c.reservation_id===r.id));
 const open=state.charges.filter(c=>c.status==='open' && chargeBalance(c,state.payments).balance>0);
 async function mutate(operation){if(busy)return;setBusy(true);setError('');try{const result=await operation();if(result.error)throw result.error;if(!result.data?.length)throw Error('No se guardó el registro. Revisa los permisos.');await reload();}catch(e){setError(e.message);}finally{setBusy(false);}}
 return <div className="ro-panel">
  <div className="ro-panel-toolbar"><h2>Comisiones y cobros</h2><button className="ro-btn ro-btn-ghost" disabled={busy || loading} onClick={reload}>Actualizar</button></div>
  <p>El huésped paga directamente al alojamiento. Aquí registras lo que el alojamiento debe a Reserva Ometepe y los pagos recibidos por transferencia, depósito o efectivo.</p>
  {error && <p className="ro-alert" role="alert">{error}</p>}
  {loading ? <p>Cargando cuentas por cobrar…</p> : <>
  <div className="ro-panel-toolbar"><label>Alojamiento <select className="ro-input" value={filter} onChange={e=>setFilter(e.target.value)}><option value="">Todos</option>{state.accommodations.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label><label>Estado <select className="ro-input" value={status} onChange={e=>setStatus(e.target.value)}>{[['all','Todos'],['pending','Pendientes'],['overdue','Vencidos'],['paid','Pagados'],['void','Anulados']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><button className="ro-btn ro-btn-ghost" onClick={()=>exportToCSV('estado-de-cuenta',rows,[{key:'accommodation',label:'Alojamiento'},{key:'reservation',label:'Reserva'},{key:'currency',label:'Moneda'},{key:'amount',label:'Comisión'},{key:'paid',label:'Abonado'},{key:'balance',label:'Saldo'},{key:'due_on',label:'Vencimiento'},{key:'status',label:'Estado'}])}>Exportar estado de cuenta</button></div>
  {Object.entries(totals).map(([currency,t])=><p key={currency}><strong>{currency}</strong> · Comisiones emitidas: {money(t.issued,currency)} · Cobrado: {money(t.paid,currency)} · Pendiente: {money(t.balance,currency)}</p>)}
  <h3>Emitir cobro de comisión</h3><p>Solo reservas completadas, con alojamiento vinculado y porcentaje acordado. El importe y la moneda se toman de la reserva al guardar.</p>
  <form className="ro-panel-toolbar" onSubmit={e=>{e.preventDefault();mutate(()=>supabase.from('ota_commission_charges').insert({reservation_id:reservationId,due_on:due}).select());}}>
   <label>Reserva <select className="ro-input" required value={reservationId} onChange={e=>setReservationId(e.target.value)}><option value="">Seleccionar reserva</option>{eligible.map(r=><option key={r.id} value={r.id}>{r.reservation_code} · {r.customer_name} · {r.commission_percent}%</option>)}</select></label><label>Vencimiento <input className="ro-input" type="date" required value={due} onChange={e=>setDue(e.target.value)}/></label><button className="ro-btn ro-btn-primary" disabled={busy || loading || !reservationId}>Emitir cobro</button>
  </form>
  <h3>Registrar abono recibido</h3>
  <form className="ro-panel-toolbar" onSubmit={e=>{e.preventDefault();mutate(()=>supabase.from('ota_commission_payments').insert({charge_id:chargeId,amount:Number(amount),paid_on:date,method,reference:reference.trim()}).select());}}>
   <label>Cobro <select className="ro-input" required value={chargeId} onChange={e=>setChargeId(e.target.value)}><option value="">Seleccionar cobro</option>{open.map(c=><option key={c.id} value={c.id}>{state.reservations.find(r=>r.id===c.reservation_id)?.reservation_code} · Saldo {money(chargeBalance(c,state.payments).balance,c.currency)}</option>)}</select></label>
   <label>Monto <input className="ro-input" required type="number" min="0.01" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)}/></label><label>Fecha <input className="ro-input" required type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label>Método <select className="ro-input" value={method} onChange={e=>setMethod(e.target.value)}><option value="transfer">Transferencia</option><option value="deposit">Depósito</option><option value="cash">Efectivo</option></select></label><label>Referencia o recibo <input className="ro-input" required value={reference} onChange={e=>setReference(e.target.value)}/></label><button className="ro-btn ro-btn-primary" disabled={busy || loading || !chargeId}>Guardar abono</button>
  </form>
  <div className="ro-table-wrap"><table className="ro-table"><thead><tr><th>Alojamiento / reserva</th><th>Comisión</th><th>Abonado</th><th>Saldo</th><th>Vencimiento</th><th>Estado</th><th>Historial</th></tr></thead><tbody>{rows.map(c=><tr key={c.id}><td>{c.accommodation}<br/>{c.reservation}</td><td>{money(c.amount,c.currency)}</td><td>{money(c.paid,c.currency)}</td><td>{money(c.balance,c.currency)}</td><td>{c.due_on}</td><td>{c.status==='void' ? `Anulado: ${c.void_reason}` : c.balance===0 ? 'Pagado' : c.due_on<today() ? 'Vencido' : c.paid>0 ? 'Parcial' : 'Pendiente'}</td><td>{state.payments.filter(p=>p.charge_id===c.id).map(p=><p key={p.id}>{p.paid_on} · {money(p.amount,c.currency)} · {p.method} · {p.reference} · {p.status==='void' ? `Anulado: ${p.void_reason}` : <button disabled={busy || loading} className="ro-btn ro-btn-ghost" onClick={()=>{setVoiding({table:'ota_commission_payments',id:p.id});setReason('');}}>Anular abono</button>}</p>)}{c.status==='open' && <button className="ro-btn ro-btn-ghost" disabled={busy || c.paid>0} onClick={()=>{setVoiding({table:'ota_commission_charges',id:c.id});setReason('');}}>Anular cobro</button>}</td></tr>)}</tbody></table></div>{!rows.length && <p>Sin cobros para estos filtros.</p>}
  {voiding && <form className="ro-panel" onSubmit={e=>{e.preventDefault();const v=voiding;mutate(()=>supabase.from(v.table).update({status:'void',void_reason:reason.trim()}).eq('id',v.id).select());setVoiding(null);}}><label>Motivo de anulación <input className="ro-input" required value={reason} onChange={e=>setReason(e.target.value)}/></label><button className="ro-btn ro-btn-danger" disabled={busy || loading || !reason.trim()}>Confirmar anulación</button><button type="button" className="ro-btn ro-btn-ghost" onClick={()=>setVoiding(null)}>Volver</button></form>}
  </>}
 </div>;
}
