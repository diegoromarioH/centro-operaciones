import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DataTable from '../components/DataTable';
import reservations from '../config/tables/reservations';
import { supabase } from '../lib/supabaseClient';
export default function ReservationsPage() {
 const [params] = useSearchParams(), requestId=params.get('request');
 const [state,setState]=useState({loading:!!requestId});
 useEffect(()=>{let live=true;setState({loading:!!requestId}); if(requestId)(async()=>{
  try {
   const results=await Promise.all([supabase.from('requests').select('*').eq('id',requestId).single(),supabase.from('reservations').select('*').eq('request_id',requestId)]);
   const error=results.find(r=>r.error)?.error;if(error)throw error;
   const request=results[0].data;
   if(request.target_type!=='accommodation')throw Error('Esta pantalla registra reservas de alojamientos.');
   if(live)setState({loading:false,record:results[1].data[0] || {request_id:request.id,target_type:'accommodation',target_id:request.target_id,target_slug:request.target_slug,customer_name:request.customer_name,customer_email:request.customer_email,customer_whatsapp:request.customer_whatsapp,starts_on:request.arrival_date,ends_on:request.departure_date,status:'pending',currency:'USD'}});
  }catch(e){if(live)setState({loading:false,error:e.message});}
 })();return()=>{live=false;};},[requestId]);
 return <><div className="ro-panel"><p>Registra cada reserva aunque el huésped pague directamente al alojamiento por transferencia o efectivo. Cancelar conserva el historial; no se eliminan reservas.</p><p>La comisión se calcula con el porcentaje acordado de esta reserva. Los cobros a los alojamientos se gestionan en Finanzas → Comisiones y cobros.</p></div>{state.error ? <p role="alert" className="ro-alert">{state.error}</p> : state.loading ? <p>Cargando solicitud…</p> : <DataTable key={requestId || 'all'} table={reservations} initialRecord={state.record} />}</>;
}
