import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Eye, Download, Loader2, Pencil, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
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
    Object.entries(table.scope || {}).forEach(([k,v]) => {query=query.eq(k,v);});
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
  }, [table.key, table.orderBy, table.ascending, table.scope]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { rows, loading, error, reload };
}

// Componente único que renderiza el CRUD completo de una tabla, dirigido por
// la configuración (table). Todas las páginas en src/pages/ son una línea de
// código que le pasan su config a este mismo componente.
export default function DataTable({ table, rowFilter, compareRows, initialRecord }) {
  const { rows, loading, error, reload } = useTableData(table);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(initialRecord); // undefined = cerrado, null = nuevo
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
    const q = search.trim().toLowerCase();
    const result = rows.filter(r => (!rowFilter || rowFilter(r)) && (!q || table.list.some(k => {
      const field = columnFor(table, k);
      const value = field.type === FIELD.FK ? (fkOptions[k] || []).find(o => o.id === r[k])?.label || r[k] : r[k];
      return String(value ?? '').toLowerCase().includes(q);
    })));
    return compareRows ? result.sort(compareRows) : result;
  }, [rows, search, table.list, rowFilter, compareRows, fkOptions]);

  async function handleSave(rawPayload) {
    if (table.readOnly) return;
    setSaving(true);
    const payload = {...(typeof table.deriveOnSave === 'function' ? table.deriveOnSave(rawPayload) : rawPayload), ...table.scope};
    const isNew = !editing?.id;
    const query = isNew
      ? supabase.from(table.key).insert(payload).select()
      : supabase.from(table.key).update(payload).eq('id', editing.id).select();
    const { data, error } = await query;
    setSaving(false);
    if (error || !data?.length) {
      setToast({ type: 'error', msg: error?.message || 'El registro no se guardó. Revisa tus permisos.' });
    } else {
      setToast({ type: 'success', msg: isNew ? 'Registro creado.' : 'Cambios guardados.' });
      setEditing(undefined);
      reload();
    }
  }

  async function handleDelete(row) {
    if (table.readOnly || table.noDelete) return;
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
          Esta tabla es de solo lectura. Puedes consultar sus registros y exportarlos.
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
                      <button className="ro-icon-btn" title={table.readOnly ? "Ver detalle" : "Editar"} onClick={() => setEditing(row)}>
                        {table.readOnly ? <Eye size={15} /> : <Pencil size={15} />}
                      </button>
                      {!table.readOnly && !table.noDelete && <button
                        className="ro-icon-btn ro-icon-btn-danger"
                        title="Eliminar"
                        onClick={() => setConfirmDelete(row)}
                      >
                        <Trash2 size={15} />
                      </button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {editing !== undefined && table.readOnly && <div className="ro-modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) setEditing(undefined); }}>
        <div className="ro-modal"><div className="ro-modal-header"><h3>{table.label}</h3><button className="ro-icon-btn" title="Cerrar" onClick={() => setEditing(undefined)}><X size={18} /></button></div>
        <div className="ro-modal-body">{table.columns.map(c => <div className="ro-field" key={c.key}><strong>{c.label}</strong><pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{typeof editing[c.key] === 'object' ? JSON.stringify(editing[c.key], null, 2) : String(editing[c.key] ?? '—')}</pre></div>)}</div></div>
      </div>}
      {editing !== undefined && !table.readOnly && (
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
