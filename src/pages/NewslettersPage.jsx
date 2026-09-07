import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Loader2, Mail, RefreshCw, Search, Send, Trash2, Users, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { exportToCSV } from '../utils/csvExport';
import Toast from '../components/Toast';
import CampaignComposer from '../components/CampaignComposer';

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="ro-stat-card">
      <div className="ro-stat-icon">
        <Icon size={18} />
      </div>
      <div>
        <b>{value}</b>
        <span>{label}</span>
      </div>
    </div>
  );
}

function BreakdownBar({ title, rows }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="ro-breakdown">
      <h4>{title}</h4>
      {rows.length === 0 && <p className="ro-req-empty">Sin datos todavía</p>}
      {rows.map((r) => (
        <div className="ro-breakdown-row" key={r.name}>
          <span>{r.name}</span>
          <div className="ro-breakdown-track">
            <div className="ro-breakdown-fill" style={{ width: `${(r.count / max) * 100}%` }} />
          </div>
          <b>{r.count}</b>
        </div>
      ))}
    </div>
  );
}

function groupCount(rows, key) {
  const map = {};
  rows.forEach((r) => {
    const v = r[key] || 'Sin especificar';
    map[v] = (map[v] || 0) + 1;
  });
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export default function NewslettersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [interestFilter, setInterestFilter] = useState('Todos');
  const [sourceFilter, setSourceFilter] = useState('Todos');
  const [selected, setSelected] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [composing, setComposing] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('newsletters').select('*').order('created_at', { ascending: false });
    if (error) setToast({ type: 'error', msg: error.message });
    else setRows(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const interests = useMemo(() => ['Todos', ...new Set(rows.map((r) => r.interest).filter(Boolean))], [rows]);
  const sources = useMemo(() => ['Todos', ...new Set(rows.map((r) => r.source).filter(Boolean))], [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (interestFilter !== 'Todos' && r.interest !== interestFilter) return false;
      if (sourceFilter !== 'Todos' && r.source !== sourceFilter) return false;
      if (q && !String(r.email || '').toLowerCase().includes(q) && !String(r.name || '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, search, interestFilter, sourceFilter]);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = rows.filter((r) => {
      const d = new Date(r.created_at);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    return {
      total: rows.length,
      active: rows.filter((r) => r.active !== false).length,
      thisMonth,
      byInterest: groupCount(rows, 'interest'),
      bySource: groupCount(rows, 'source'),
    };
  }, [rows]);

  function toggleSelected(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) => (prev.size === filtered.length ? new Set() : new Set(filtered.map((r) => r.id))));
  }

  async function bulkDeactivate() {
    const { error } = await supabase.from('newsletters').update({ active: false }).in('id', Array.from(selected));
    if (error) setToast({ type: 'error', msg: error.message });
    else {
      setToast({ type: 'success', msg: `${selected.size} suscriptor(es) desactivados.` });
      setSelected(new Set());
      reload();
    }
  }

  async function bulkDelete() {
    if (!window.confirm(`¿Eliminar ${selected.size} suscriptor(es)? Esta acción no se puede deshacer.`)) return;
    const { error } = await supabase.from('newsletters').delete().in('id', Array.from(selected));
    if (error) setToast({ type: 'error', msg: error.message });
    else {
      setToast({ type: 'success', msg: `${selected.size} suscriptor(es) eliminados.` });
      setSelected(new Set());
      reload();
    }
  }

  const exportColumns = [
    { key: 'name', label: 'Nombre' },
    { key: 'email', label: 'Correo' },
    { key: 'interest', label: 'Interés' },
    { key: 'source', label: 'Origen' },
    { key: 'created_at', label: 'Fecha de suscripción' },
    { key: 'active', label: 'Activo' },
  ];

  return (
    <div className="ro-panel">
      <div className="ro-stats-row">
        <StatCard label="Suscriptores totales" value={stats.total} icon={Users} />
        <StatCard label="Activos" value={stats.active} icon={Mail} />
        <StatCard label="Nuevos este mes" value={stats.thisMonth} icon={Users} />
      </div>

      <div className="ro-breakdown-row-wrap">
        <BreakdownBar title="Por interés" rows={stats.byInterest} />
        <BreakdownBar title="Por origen" rows={stats.bySource} />
      </div>

      <div className="ro-panel-toolbar">
        <div className="ro-search-box">
          <Search size={16} />
          <input placeholder="Buscar por nombre o correo…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="ro-input ro-toolbar-select" value={interestFilter} onChange={(e) => setInterestFilter(e.target.value)}>
          {interests.map((i) => (
            <option key={i}>{i}</option>
          ))}
        </select>
        <select className="ro-input ro-toolbar-select" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
          {sources.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <div className="ro-toolbar-actions">
          <span className="ro-row-count">{filtered.length} registro{filtered.length === 1 ? '' : 's'}</span>
          <button className="ro-btn ro-btn-ghost" onClick={reload} title="Recargar">
            <RefreshCw size={15} />
          </button>
          <button
            className="ro-btn ro-btn-ghost"
            title="Exportar segmento a CSV"
            disabled={!filtered.length}
            onClick={() => exportToCSV('suscriptores', filtered, exportColumns)}
          >
            <Download size={15} />
          </button>
          <button className="ro-btn ro-btn-primary" disabled={!filtered.length} onClick={() => setComposing(true)}>
            <Send size={15} /> Redactar campaña
          </button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="ro-bulkbar">
          <span>{selected.size} seleccionado(s)</span>
          <button className="ro-btn ro-btn-ghost" onClick={bulkDeactivate}>
            Desactivar
          </button>
          <button className="ro-btn ro-btn-danger-ghost" onClick={bulkDelete}>
            <Trash2 size={14} /> Eliminar
          </button>
          <button className="ro-icon-btn" onClick={() => setSelected(new Set())}>
            <X size={15} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="ro-empty">
          <Loader2 size={18} className="ro-spin" /> Cargando…
        </div>
      ) : filtered.length === 0 ? (
        <div className="ro-empty">Sin suscriptores para este filtro.</div>
      ) : (
        <div className="ro-table-wrap">
          <table className="ro-table">
            <thead>
              <tr>
                <th className="ro-check-col">
                  <input type="checkbox" checked={selected.size === filtered.length} onChange={toggleSelectAll} />
                </th>
                <th>Correo</th>
                <th>Nombre</th>
                <th>Interés</th>
                <th>Origen</th>
                <th>Suscrito</th>
                <th>Activo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td className="ro-check-col" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelected(r.id)} />
                  </td>
                  <td>{r.email}</td>
                  <td>{r.name || '—'}</td>
                  <td>{r.interest || '—'}</td>
                  <td>{r.source || '—'}</td>
                  <td>{r.created_at ? new Date(r.created_at).toLocaleDateString('es-NI') : '—'}</td>
                  <td>
                    <span className={`ro-badge ${r.active !== false ? 'ro-badge-on' : 'ro-badge-off'}`}>
                      {r.active !== false ? 'Sí' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {composing && (
        <CampaignComposer
          segment={filtered}
          segmentLabel={`${interestFilter !== 'Todos' ? interestFilter : ''}${sourceFilter !== 'Todos' ? ' · ' + sourceFilter : ''}` || 'Todos los suscriptores'}
          onClose={() => setComposing(false)}
          onToast={setToast}
        />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}