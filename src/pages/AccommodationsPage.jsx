import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import accommodationsTable from '../config/tables/accommodations';
import AccommodationForm from '../components/AccommodationForm';
import AccommodationRoomsPanel from '../components/AccommodationRoomsPanel';
import Toast from '../components/Toast';

function AccommodationDetail({ accommodation, saving, onBack, onSave, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isNew = !accommodation.id;

  return (
    <div className="ro-detail">
      <div className="ro-detail-header">
        <button className="ro-btn ro-btn-ghost" onClick={onBack}>
          <ArrowLeft size={15} /> Volver a alojamientos
        </button>
        {!isNew && (
          <button className="ro-btn ro-btn-ghost ro-icon-btn-danger" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={15} /> Eliminar alojamiento
          </button>
        )}
      </div>

      <AccommodationForm
        key={accommodation.id || 'new-accommodation'}
        table={accommodationsTable}
        record={isNew ? null : accommodation}
        saving={saving}
        onSave={onSave}
      />

      {!isNew && (
        <AccommodationRoomsPanel accommodationId={accommodation.id} accommodationName={accommodation.name} />
      )}

      {confirmDelete && (
        <div className="ro-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setConfirmDelete(false); }}>
          <div className="ro-modal ro-modal-sm">
            <div className="ro-modal-header">
              <h3>Eliminar alojamiento</h3>
              <button className="ro-icon-btn" onClick={() => setConfirmDelete(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="ro-modal-body">
              <p>
                ¿Eliminar <strong>{accommodation.name}</strong>? Esto también eliminará sus habitaciones. No se puede deshacer.
              </p>
            </div>
            <div className="ro-modal-footer">
              <button className="ro-btn ro-btn-ghost" onClick={() => setConfirmDelete(false)}>
                Cancelar
              </button>
              <button className="ro-btn ro-btn-danger" onClick={onDelete}>
                <Trash2 size={15} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccommodationsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [active, setActive] = useState(null); // null = lista, {} = nuevo, fila = ficha
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('accommodations').select('*').order('name', { ascending: true });
    setList(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const filtered = useMemo(() => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((r) => (r.name || '').toLowerCase().includes(q) || (r.zone || '').toLowerCase().includes(q));
  }, [list, search]);

  async function handleSaveAccommodation(payload) {
    setSaving(true);
    const isNew = !active?.id;
    const query = isNew
      ? supabase.from('accommodations').insert(payload).select().single()
      : supabase.from('accommodations').update(payload).eq('id', active.id).select().single();
    const { data, error } = await query;
    setSaving(false);
    if (error) {
      setToast({ type: 'error', msg: error.message });
      return;
    }
    setToast({
      type: 'success',
      msg: isNew ? 'Alojamiento creado. Ahora puedes agregar sus habitaciones.' : 'Cambios guardados.',
    });
    setActive(data);
    reload();
  }

  async function handleDeleteAccommodation() {
    const { error } = await supabase.from('accommodations').delete().eq('id', active.id);
    if (error) {
      setToast({ type: 'error', msg: error.message });
      return;
    }
    setToast({ type: 'success', msg: 'Alojamiento eliminado.' });
    setActive(null);
    reload();
  }

  if (active) {
    return (
      <>
        <AccommodationDetail
          accommodation={active}
          saving={saving}
          onBack={() => {
            setActive(null);
            reload();
          }}
          onSave={handleSaveAccommodation}
          onDelete={handleDeleteAccommodation}
        />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  return (
    <div className="ro-panel">
      <div className="ro-panel-toolbar">
        <div className="ro-search-box">
          <Search size={16} />
          <input placeholder="Buscar alojamientos…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="ro-btn ro-btn-primary" onClick={() => setActive({})}>
          <Plus size={16} /> Nuevo alojamiento
        </button>
      </div>

      {loading ? (
        <div className="ro-empty">
          <Loader2 size={18} className="ro-spin" /> Cargando…
        </div>
      ) : filtered.length === 0 ? (
        <div className="ro-empty">Sin alojamientos todavía. Crea el primero con "Nuevo alojamiento".</div>
      ) : (
        <div className="ro-table-wrap">
          <table className="ro-table">
            <thead>
              <tr>
                <th className="ro-thumb-col"></th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Zona</th>
                <th>Precio desde</th>
                <th>Activo</th>
                <th>Destacado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="ro-row-clickable" onClick={() => setActive(row)}>
                  <td className="ro-thumb-col">
                    {row.main_image_url ? (
                      <img className="ro-thumb" src={row.main_image_url} alt="" />
                    ) : (
                      <div className="ro-thumb ro-thumb-empty" />
                    )}
                  </td>
                  <td>{row.name}</td>
                  <td>{row.accommodation_type || '—'}</td>
                  <td>{row.zone || '—'}</td>
                  <td>{row.price_from ? `$${row.price_from}` : '—'}</td>
                  <td>
                    <span className={`ro-badge ${row.active ? 'ro-badge-on' : 'ro-badge-off'}`}>
                      {row.active ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td>
                    <span className={`ro-badge ${row.featured ? 'ro-badge-on' : 'ro-badge-off'}`}>
                      {row.featured ? 'Sí' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}