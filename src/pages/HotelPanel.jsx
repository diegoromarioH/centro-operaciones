import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import AccommodationForm from '../components/AccommodationForm';
import AccommodationRoomsPanel from '../components/AccommodationRoomsPanel';
import ListingSubmissions from '../components/ListingSubmissions';
import HotelActivity from '../components/HotelActivity';
import accommodationTable from '../config/tables/accommodations';
import { HOST_FIELDS, hostPayload } from '../auth/access';

const ownerTable = { ...accommodationTable, columns: accommodationTable.columns.filter(c => HOST_FIELDS.has(c.key)), sections: accommodationTable.sections.filter(s => s.key !== 'config') };

export default function HotelPanel({ userId }) {
  const [hotels, setHotels] = useState([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [version, setVersion] = useState(0);
  const hotel = hotels.find(h => h.id === selected);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setError(null);
      try {
        const { data: hosts, error: hostError } = await supabase.from('hosts').select('id').eq('user_id', userId).eq('active', true);
        if (hostError) throw hostError;
        let rows = [];
        if (hosts?.length) {
          const { data: assignments, error: assignmentError } = await supabase.from('accommodation_hosts').select('accommodations(*)').in('host_id', hosts.map(h => h.id));
          if (assignmentError) throw assignmentError;
          rows = [...new Map((assignments || []).filter(a => a.accommodations).map(a => [a.accommodations.id, a.accommodations])).values()];
        }
        if (!cancelled) { setHotels(rows); setSelected(prev => rows.some(h => h.id === prev) ? prev : rows[0]?.id || ''); }
      } catch (e) { if (!cancelled) setError(e.message); }
      finally { if (!cancelled) setLoading(false); }
    }
    load(); return () => { cancelled = true; };
  }, [userId, version]);
  async function save(payload) {
    setSaving(true); setError(null); setMessage('');
    try {
      const { data, error } = await supabase.from('accommodations').update(hostPayload(payload)).eq('id', selected).select().single();
      if (error) throw error;
      setHotels(prev => prev.map(h => h.id === data.id ? data : h)); setMessage('Cambios guardados.');
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }
  return <div>
    <div className="ro-panel-toolbar"><h2>Mi alojamiento</h2><button className="ro-btn ro-btn-ghost" onClick={() => setVersion(v => v + 1)}>Actualizar</button></div>
    {error && <div className="ro-alert" role="alert">{error}</div>}{message && <p role="status">{message}</p>}
    <ListingSubmissions userId={userId} />
    {loading ? <div className="ro-empty">Cargando tus alojamientos…</div> : !hotels.length ? <div className="ro-panel ro-empty">Comienza con «Crear alojamiento». Cuando la OTA apruebe tu ficha, aparecerá aquí para administrar habitaciones.</div> : <>
      <label htmlFor="owner-hotel">Alojamiento</label><select id="owner-hotel" className="ro-input" value={selected} onChange={e => { setSelected(e.target.value); setMessage(''); }}>{hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}</select>
      <p>{hotel?.active ? 'Tu alojamiento está publicado.' : 'Tu alojamiento está oculto. El administrador controla su publicación.'}</p>
      {hotel && <><AccommodationForm key={hotel.id} table={ownerTable} record={hotel} saving={saving} onSave={save} /><AccommodationRoomsPanel key={hotel.id + '-rooms'} accommodationId={hotel.id} accommodationName={hotel.name} /><HotelActivity hotel={hotel} /></>}
    </>}
  </div>;
}
