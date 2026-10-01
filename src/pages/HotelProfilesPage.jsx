import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function HotelProfilesPage() {
  const [hotels, setHotels] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setError(null);
      try {
        const { data, error } = await supabase.from('accommodations')
          .select('id,name,slug,zone,active,main_image_url,price_from,currency,rooms(id,active),accommodation_hosts(is_primary,hosts(id,display_name,email,active,user_id))').order('name');
        if (error) throw error;
        if (!cancelled) setHotels(data || []);
      } catch (e) { if (!cancelled) setError(e.message); }
      finally { if (!cancelled) setLoading(false); }
    }
    load(); return () => { cancelled = true; };
  }, [version]);
  const filtered = hotels.filter(h => [h.name, h.zone, ...(h.accommodation_hosts || []).map(a => a.hosts?.email)].join(' ').toLowerCase().includes(search.toLowerCase()));
  return <div className="ro-panel">
    <div className="ro-panel-toolbar"><h2>Perfiles de hoteles</h2><button className="ro-btn ro-btn-ghost" onClick={() => setVersion(v => v + 1)}>Actualizar</button></div>
    <p>Revisa la ficha, las habitaciones y los responsables de cada hotel desde tu superpanel.</p>
    <div className="ro-panel-toolbar"><input className="ro-input" aria-label="Buscar hoteles" placeholder="Buscar hotel, zona o correo…" value={search} onChange={e => setSearch(e.target.value)} /><Link className="ro-btn ro-btn-primary" to="/alojamiento/accommodations">Gestionar alojamientos</Link></div>
    {error ? <div className="ro-alert" role="alert">{error}</div> : loading ? <div className="ro-empty">Cargando perfiles…</div> : !filtered.length ? <div className="ro-empty">{hotels.length ? 'No hay resultados para esta búsqueda.' : 'Todavía no hay hoteles registrados. Crea la ficha del hotel y después asigna el acceso de su dueño.'}</div> :
      <div className="ro-hotel-grid">{filtered.map(h => <article className="ro-hotel-card" key={h.id}>
        {h.main_image_url && <img src={h.main_image_url} alt={h.name} />}
        <h3>{h.name}</h3><p>{h.zone || 'Zona pendiente'} · {h.active ? 'Publicado' : 'Oculto'}</p>
        <p>{h.rooms?.length || 0} habitaciones · {h.price_from == null ? 'Tarifa pendiente' : `${h.currency || 'USD'} ${h.price_from}`}</p>
        <h4>Responsables</h4>{h.accommodation_hosts?.length ? h.accommodation_hosts.map(a => <p key={a.hosts?.id}>{a.hosts?.display_name || 'Sin nombre'}{a.is_primary ? ' · Principal' : ''}<br />{a.hosts?.email}<br />{a.hosts?.user_id ? (a.hosts.active ? 'Cuenta vinculada' : 'Responsable inactivo') : 'Sin cuenta de acceso'}</p>) : <p>Sin dueño asignado.</p>}
        <div className="ro-hotel-actions"><Link className="ro-btn ro-btn-primary" to={`/alojamiento/accommodations?hotel=${h.id}`}>Abrir ficha</Link><Link className="ro-btn ro-btn-ghost" to={`/alojamiento/host-accounts?hotel=${h.id}`}>Dar acceso</Link></div>
      </article>)}</div>}
  </div>;
}
