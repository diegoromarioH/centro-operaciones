import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw, Search } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { STAGES, stageForStatus } from '../config/requestStages';
import RequestCard from '../components/RequestCard';
import RequestDetailPanel from '../components/RequestDetailPanel';
import Toast from '../components/Toast';

export default function RequestsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('requests').select('*').order('created_at', { ascending: false });
    if (error) setToast({ type: 'error', msg: error.message });
    else setRows(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? rows.filter((r) => [r.code, r.customer_name, r.customer_email, r.service_name].some((v) => String(v || '').toLowerCase().includes(q)))
    : rows;

  async function handleSave(id, payload) {
    setSaving(true);
    const { error } = await supabase.from('requests').update(payload).eq('id', id);
    setSaving(false);
    if (error) {
      setToast({ type: 'error', msg: error.message });
    } else {
      setToast({ type: 'success', msg: 'Solicitud actualizada.' });
      setOpen(null);
      reload();
    }
  }

  async function handleDelete(row) {
    if (!window.confirm(`¿Eliminar la solicitud ${row.code}? Esta acción no se puede deshacer.`)) return;
    const { error } = await supabase.from('requests').delete().eq('id', row.id);
    if (error) setToast({ type: 'error', msg: error.message });
    else {
      setToast({ type: 'success', msg: 'Solicitud eliminada.' });
      setOpen(null);
      reload();
    }
  }

  return (
    <div className="ro-panel">
      <div className="ro-panel-toolbar">
        <div className="ro-search-box">
          <Search size={16} />
          <input placeholder="Buscar por código, cliente, correo o servicio…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="ro-toolbar-actions">
          <button className="ro-btn ro-btn-ghost" onClick={reload} title="Recargar">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="ro-empty">
          <Loader2 size={18} className="ro-spin" /> Cargando…
        </div>
      ) : (
        <div className="ro-req-board">
          {STAGES.map((stage) => {
            const items = filtered.filter((r) => stageForStatus(r.status).key === stage.key);
            return (
              <div className="ro-req-column" key={stage.key}>
                <div className="ro-req-column-head" style={{ '--stage-color': stage.color }}>
                  <span>{stage.label}</span>
                  <b>{items.length}</b>
                </div>
                <div className="ro-req-column-body">
                  {items.length === 0 ? (
                    <p className="ro-req-empty">Sin solicitudes</p>
                  ) : (
                    items.map((r) => <RequestCard key={r.id} request={r} onOpen={setOpen} />)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <RequestDetailPanel request={open} saving={saving} onClose={() => setOpen(null)} onSave={handleSave} onDelete={handleDelete} />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}