import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function HotelActivity({ hotel }) {
  const [state, setState] = useState({ loading: true, error: null, requests: [], reservations: [] });
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setState({ loading: true, error: null, requests: [], reservations: [] });
      try {
        async function rows(table, fields) {
          const base = () => supabase.from(table).select(fields).eq('target_type', 'accommodation').order('created_at', { ascending: false }).limit(100);
          const results = await Promise.all([base().eq('target_id', hotel.id), base().is('target_id', null).eq('target_slug', hotel.slug)]);
          for (const r of results) if (r.error) throw r.error;
          return results.flatMap(r => r.data || []).sort((a,b) => b.created_at.localeCompare(a.created_at)).slice(0,100);
        }
        const [requests, reservations] = await Promise.all([
          rows('requests', 'id,code,customer_name,arrival_date,departure_date,status,created_at'),
          rows('reservations', 'id,reservation_code,customer_name,starts_on,ends_on,status,created_at'),
        ]);
        if (!cancelled) setState({ loading: false, error: null, requests, reservations });
      } catch (e) { if (!cancelled) setState({ loading: false, error: e.message, requests: [], reservations: [] }); }
    }
    load(); return () => { cancelled = true; };
  }, [hotel.id, hotel.slug]);
  return <div className="ro-panel">
    <h3>Actividad del hotel</h3><p>Últimas 100 solicitudes y reservas por sección. La confirmación y los cobros los gestiona Reserva Ometepe.</p>
    {state.loading ? <div className="ro-empty">Cargando actividad…</div> : state.error ? <div className="ro-alert" role="alert">{state.error}</div> : ['requests','reservations'].map(key => <section key={key}>
      <h4>{key === 'requests' ? 'Solicitudes' : 'Reservas'}</h4>
      {!state[key].length ? <p>Sin registros para este hotel.</p> : <div className="ro-table-wrap"><table className="ro-table"><thead><tr><th>Código</th><th>Huésped</th><th>Llegada</th><th>Salida</th><th>Estado</th></tr></thead><tbody>{state[key].map(r => <tr key={r.id}><td>{r.code || r.reservation_code}</td><td>{r.customer_name}</td><td>{r.arrival_date || r.starts_on || '—'}</td><td>{r.departure_date || r.ends_on || '—'}</td><td>{r.status}</td></tr>)}</tbody></table></div>}
    </section>)}
  </div>;
}
