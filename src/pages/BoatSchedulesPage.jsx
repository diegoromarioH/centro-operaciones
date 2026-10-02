import React, { useEffect, useMemo, useState } from 'react';
import DataTable from '../components/DataTable';
import boatSchedules from '../config/tables/boatSchedules';
import { supabase } from '../lib/supabaseClient';
export default function BoatSchedulesPage() {
  const [operators, setOperators] = useState([]), [routes, setRoutes] = useState([]);
  const [operator, setOperator] = useState(''), [route, setRoute] = useState(''), [error, setError] = useState('');
  useEffect(() => { let live = true; (async () => {
    const results = await Promise.all([supabase.from('boat_operators').select('id,name').order('name'), supabase.from('boat_routes').select('id,name').order('name')]);
    if (!live) return;
    if (results.some(r => r.error)) setError(results.find(r => r.error).error.message);
    else { setOperators(results[0].data); setRoutes(results[1].data); }
  })(); return () => { live = false; }; }, []);
  const filter = useMemo(() => r => (!operator || (operator === 'unassigned' ? !r.operator_id : r.operator_id === operator)) && (!route || r.route_id === route), [operator, route]);
  const compare = useMemo(() => (a,b) => {
    const name = (items,id) => items.find(i => i.id === id)?.name || 'Sin asignar';
    return name(operators,a.operator_id).localeCompare(name(operators,b.operator_id),'es') || name(routes,a.route_id).localeCompare(name(routes,b.route_id),'es') || String(a.departure_time).localeCompare(String(b.departure_time));
  }, [operators,routes]);
  return <><div className="ro-panel ro-panel-toolbar">
    <label>Naviera <select className="ro-input" value={operator} onChange={e => setOperator(e.target.value)}><option value="">Todas</option><option value="unassigned">Sin asignar</option>{operators.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label>
    <label>Ruta <select className="ro-input" value={route} onChange={e => setRoute(e.target.value)}><option value="">Todas</option>{routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
    <p>Orden: naviera → ruta → hora de salida.</p></div>{error && <p role="alert" className="ro-alert">{error}</p>}<DataTable table={boatSchedules} rowFilter={filter} compareRows={compare} /></>;
}
