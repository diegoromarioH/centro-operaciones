import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Loader2, MousePointerClick, RefreshCw, Users } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

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

function groupCount(rows, key, limit = 8) {
  const map = {};
  rows.forEach((r) => {
    const v = r[key] || 'Sin especificar';
    map[v] = (map[v] || 0) + 1;
  });
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export default function AnalyticsEventsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);
      setRows(data || []);
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const sessions = new Set(rows.map((r) => r.session_id).filter(Boolean));
    const now = Date.now();
    const last7d = rows.filter((r) => now - new Date(r.created_at).getTime() < 7 * 24 * 60 * 60 * 1000).length;
    const topEvent = groupCount(rows, 'event_name', 1)[0];
    return {
      total: rows.length,
      sessions: sessions.size,
      last7d,
      topEvent: topEvent ? topEvent.name : '—',
    };
  }, [rows]);

  return (
    <div className="ro-panel">
      <div className="ro-stats-row">
        <StatCard label="Eventos registrados" value={stats.total} icon={Activity} />
        <StatCard label="Sesiones únicas" value={stats.sessions} icon={Users} />
        <StatCard label="Últimos 7 días" value={stats.last7d} icon={Activity} />
        <StatCard label="Evento más frecuente" value={stats.topEvent} icon={MousePointerClick} />
      </div>

      <div className="ro-breakdown-row-wrap">
        <BreakdownBar title="Por tipo de evento" rows={groupCount(rows, 'event_name')} />
        <BreakdownBar title="Por página" rows={groupCount(rows, 'page')} />
        <BreakdownBar title="Por dispositivo" rows={groupCount(rows, 'device')} />
        <BreakdownBar title="Por fuente" rows={groupCount(rows, 'source')} />
      </div>

      <div className="ro-panel-toolbar">
        <span className="ro-row-count">Mostrando los últimos {rows.length} eventos</span>
        <div className="ro-toolbar-actions">
          <button className="ro-btn ro-btn-ghost" onClick={() => window.location.reload()} title="Recargar">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="ro-empty">
          <Loader2 size={18} className="ro-spin" /> Cargando…
        </div>
      ) : (
        <div className="ro-table-wrap">
          <table className="ro-table">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Página</th>
                <th>Servicio</th>
                <th>Dispositivo</th>
                <th>Fuente</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 200).map((r) => (
                <tr key={r.id}>
                  <td>{r.event_name}</td>
                  <td>{r.page || '—'}</td>
                  <td>{r.service || '—'}</td>
                  <td>{r.device || '—'}</td>
                  <td>{r.source || '—'}</td>
                  <td>{r.created_at ? new Date(r.created_at).toLocaleString('es-NI') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}