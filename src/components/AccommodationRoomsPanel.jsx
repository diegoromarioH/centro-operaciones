import React, { useCallback, useEffect, useState } from 'react';
import { BedDouble, Pencil, Plus, Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import roomsTable from '../config/tables/rooms';
import EditForm from './EditForm';
import Toast from './Toast';

// Se usa dentro de AccommodationsPage: administra las habitaciones de UN
// alojamiento específico, sin salir de su ficha. Reutiliza la config y el
// EditForm de "rooms" tal cual — solo pre-llena accommodation_id.
export default function AccommodationRoomsPanel({ accommodationId, accommodationName }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(undefined); // undefined = cerrado
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('rooms')
      .select('*')
      .eq('accommodation_id', accommodationId)
      .order('sort_order', { ascending: true });
    setRooms(data || []);
    setLoading(false);
  }, [accommodationId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const fkOptions = { accommodation_id: [{ id: accommodationId, label: accommodationName || 'Este alojamiento' }] };

  async function handleSave(payload) {
    setSaving(true);
    const isNew = !editing?.id;
    const query = isNew
      ? supabase.from('rooms').insert(payload).select()
      : supabase.from('rooms').update(payload).eq('id', editing.id).select();
    const { error } = await query;
    setSaving(false);
    if (error) {
      setToast({ type: 'error', msg: error.message });
      return;
    }
    setToast({ type: 'success', msg: isNew ? 'Habitación agregada.' : 'Cambios guardados.' });
    setEditing(undefined);
    reload();
  }

  async function handleDelete(row) {
    const { error } = await supabase.from('rooms').delete().eq('id', row.id);
    if (error) setToast({ type: 'error', msg: error.message });
    else {
      setToast({ type: 'success', msg: 'Habitación eliminada.' });
      reload();
    }
    setConfirmDelete(null);
  }

  return (
    <div className="ro-panel ro-rooms-panel">
      <div className="ro-panel-toolbar">
        <h3 className="ro-panel-title">
          <BedDouble size={16} /> Habitaciones de este alojamiento
        </h3>
        <button className="ro-btn ro-btn-primary" onClick={() => setEditing({ accommodation_id: accommodationId })}>
          <Plus size={16} /> Nueva habitación
        </button>
      </div>

      {loading ? (
        <div className="ro-empty">Cargando…</div>
      ) : rooms.length === 0 ? (
        <div className="ro-empty">Todavía no hay habitaciones. Agrega la primera con "Nueva habitación".</div>
      ) : (
        <div className="ro-room-cards">
          {rooms.map((r) => (
            <div className="ro-room-card" key={r.id}>
              {r.main_image_url ? (
                <img className="ro-room-card-img" src={r.main_image_url} alt="" />
              ) : (
                <div className="ro-room-card-img ro-thumb-empty" />
              )}
              <div className="ro-room-card-body">
                <div className="ro-room-card-name">{r.name}</div>
                <div className="ro-room-card-meta">
                  {r.room_type || 'Habitación'} · {r.capacity ?? '—'} huéspedes
                </div>
                <div className="ro-room-card-price">{r.price ? `$${r.price} / noche` : 'Precio no definido'}</div>
              </div>
              <div className="ro-room-card-actions">
                <button className="ro-icon-btn" title="Editar" onClick={() => setEditing(r)}>
                  <Pencil size={14} />
                </button>
                <button className="ro-icon-btn ro-icon-btn-danger" title="Eliminar" onClick={() => setConfirmDelete(r)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== undefined && (
        <EditForm
          key={editing?.id || 'new-room'}
          table={roomsTable}
          record={editing}
          fkOptions={fkOptions}
          saving={saving}
          onCancel={() => setEditing(undefined)}
          onSave={handleSave}
        />
      )}

      {confirmDelete && (
        <div className="ro-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setConfirmDelete(null); }}>
          <div className="ro-modal ro-modal-sm">
            <div className="ro-modal-header">
              <h3>Eliminar habitación</h3>
              <button className="ro-icon-btn" onClick={() => setConfirmDelete(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="ro-modal-body">
              <p>
                ¿Eliminar <strong>{confirmDelete.name}</strong>? Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="ro-modal-footer">
              <button className="ro-btn ro-btn-ghost" onClick={() => setConfirmDelete(null)}>
                Cancelar
              </button>
              <button className="ro-btn ro-btn-danger" onClick={() => handleDelete(confirmDelete)}>
                <Trash2 size={15} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}