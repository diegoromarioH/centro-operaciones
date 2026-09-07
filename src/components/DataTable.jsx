import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Download, Loader2, Pencil, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { FIELD } from '../lib/fieldTypes';
import { fmtCell, columnFor } from '../utils/format';
import { exportToCSV } from '../utils/csvExport';
import EditForm from './EditForm';
import Toast from './Toast';

function useTableData(table) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    let query = supabase.from(table.key).select('*');
    // table.orderBy puede ser un string (una sola columna, como antes) o un
    // arreglo de { column, ascending } para ordenar por varias columnas en
    // cascada, por ejemplo ruta y luego hora en horarios de barco.
    if (Array.isArray(table.orderBy)) {
      table.orderBy.forEach((o) => {
        query = query.order(o.column, { ascending: !!o.ascending, nullsFirst: false });
      });
    } else {
      query = query.order(table.orderBy || 'id', { ascending: !!table.ascending, nullsFirst: false });
    }
    const { data, error } = await query;
    if (error) setError(error.message);
    else setRows(data || []);
    setLoading(false);
  }, [table.key, table.orderBy, table.ascending]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { rows, loading, error, reload };
}

// Componente único que renderiza el CRUD completo de una tabla, dirigido por
// la configuración (table). Todas las páginas en src/pages/ son una línea de
// código que le pasan su config a este mismo componente.
export default function DataTable({ table }) {
  const { rows, loading, error, reload } = useTableData(table);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(undefined); // undefined = cerrado, null = nuevo
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [fkOptions, setFkOptions] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadFks() {
      const fkFields = table.columns.filter((c) => c.type === FIELD.FK);
      if (!fkFields.length) return;
      const results = {};
      await Promise.all(
        fkFields.map(async (f) => {
          const cols = f.display2 ? `id, ${f.display}, ${f.display2}` : `id, ${f.display}`;
          const { data } = await supabase.from(f.table).select(cols).limit(1000);
          results[f.key] = (data || []).map((r) => ({
            id: r.id,
            label: f.display2
              ? `${r[f.display] ?? ''} ${r[f.display2] ? '· ' + r[f.display2] : ''}`.trim()
              : r[f.display] ?? r.id,
          }));
        })
      );
      if (!cancelled) setFkOptions(results);
    }
    loadFks();
    return () => {
      cancelled = true;
    };
  }, [table.key]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) => table.list.some((k) => String(r[k] ?? '').toLowerCase().includes(q)));
  }, [rows, search, table.list]);

  async function handleSave(rawPayload) {
    setSaving(true);
    const payload = typeof table.deriveOnSave === 'function' ? table.deriveOnSave(rawPayload) : rawPayload;
    const isNew = !editing?.id;
    const query = isNew
      ? supabase.from(table.key).insert(payload).select()
      : supabase.from(table.key).update(payload).eq('id', editing.id).select();
    const { error } = await query;
    setSaving(false);
    if (error) {
      setToast({ type: 'error', msg: error.message });
    } else {
      setToast({ type: 'success', msg: isNew ? 'Registro creado.' : 'Cambios guardados.' });
      setEditing(undefined);
      reload();
    }
  }

  async function handleDelete(row) {
    const { error } = await supabase.from(table.key).delete().eq('id', row.id);
    if (error) setToast({ type: 'error', msg: error.message });
    else {
      setToast({ type: 'success', msg: 'Registro eliminado.' });
      reload();
    }
    setConfirmDelete(null);
  }

  return (
    <div className="ro-panel">
      <div className="ro-panel-toolbar">
        <div className="ro-search-box">
          <Search size={16} />
          <input
            placeholder={`Buscar en ${table.label.toLowerCase()}…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="ro-toolbar-actions">
          <span className="ro-row-count">{filtered.length} registro{filtered.length === 1 ? '' : 's'}</span>
          <button className="ro-btn ro-btn-ghost" onClick={reload} title="Recargar">
            <RefreshCw size={15} />
          </button>
          <button
            className="ro-btn ro-btn-ghost"
            title="Exportar a CSV"
            disabled={!filtered.length}
            onClick={() => exportToCSV(table.key, filtered, table.columns.filter((c) => c.type !== FIELD.JSON))}
          >
            <Download size={15} />
          </button>
          {!table.readOnly && (
            <button className="ro-btn ro-btn-primary" onClick={() => setEditing(null)}>
              <Plus size={16} /> Nuevo
            </button>
          )}
        </div>
      </div>

      {table.readOnly && (
        <div className="ro-readonly-banner">
          Esta tabla la llena la propia aplicación automáticamente. Aquí solo puedes consultarla y borrar registros
          antiguos.
        </div>
      )}

      {loading && (
        <div className="ro-empty">
          <Loader2 size={18} className="ro-spin" /> Cargando…
        </div>
      )}
      {error && (
        <div className="ro-alert">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {!loading &&
        !error &&
        (filtered.length === 0 ? (
          <div className="ro-empty">Sin registros todavía. {!table.readOnly && 'Crea el primero con “Nuevo”.'}</div>
        ) : (
          <div className="ro-table-wrap">
            <table className="ro-table">
              <thead>
                <tr>
                  {table.imageField && <th className="ro-thumb-col"></th>}
                  {table.list.map((k) => (
                    <th key={k}>{columnFor(table, k).label}</th>
                  ))}
                  <th className="ro-actions-col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} onClick={() => setEditing(row)} className="ro-row-clickable">
                    {table.imageField && (
                      <td className="ro-thumb-col">
                        {row[table.imageField] ? (
                          <img className="ro-thumb" src={row[table.imageField]} alt="" />
                        ) : (
                          <div className="ro-thumb ro-thumb-empty" />
                        )}
                      </td>
                    )}
                    {table.list.map((k) => {
                      const field = columnFor(table, k);
                      let display = row[k];
                      if (field.type === FIELD.FK) {
                        const opt = (fkOptions[k] || []).find((o) => o.id === row[k]);
                        display = opt ? opt.label : row[k];
                      }
                      return (
                        <td key={k}>
                          {field.type === FIELD.BOOL ? (
                            <span className={`ro-badge ${row[k] ? 'ro-badge-on' : 'ro-badge-off'}`}>
                              {row[k] ? 'Sí' : 'No'}
                            </span>
                          ) : (
                            fmtCell(display, field.type === FIELD.FK ? null : field)
                          )}
                        </td>
                      );
                    })}
                    <td className="ro-actions-col" onClick={(e) => e.stopPropagation()}>
                      <button className="ro-icon-btn" title="Editar" onClick={() => setEditing(row)}>
                        <Pencil size={15} />
                      </button>
                      <button
                        className="ro-icon-btn ro-icon-btn-danger"
                        title="Eliminar"
                        onClick={() => setConfirmDelete(row)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {editing !== undefined && (
        <EditForm
          key={editing?.id || 'new'}
          table={table}
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
              <h3>Eliminar registro</h3>
              <button className="ro-icon-btn" onClick={() => setConfirmDelete(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="ro-modal-body">
              <p>
                Esta acción no se puede deshacer. ¿Quieres eliminar este registro de <strong>{table.label}</strong>?
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