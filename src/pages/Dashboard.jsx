import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { TABLES, GROUPS } from '../config/tables';

// Tablas más relevantes para las tarjetas grandes de resumen.
const HIGHLIGHTS = ['accommodations', 'experiences', 'motorcycles', 'requests', 'homepage_banners'];

export default function Dashboard() {
  const [errors, setErrors] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadCounts() {
      setLoading(true);
      const results = {};
      const failures = [];
      await Promise.all(
        TABLES.map(async (t) => {
          const { count, error } = await supabase.from(t.key).select('*', { count: 'exact', head: true });
          if (error) failures.push(t.label);
          results[t.key] = error ? null : count ?? 0;
        })
      );
      if (!cancelled) {
        setErrors(failures);
        setCounts(results);
        setLoading(false);
      }
    }
    loadCounts();
    return () => {
      cancelled = true;
    };
  }, []);

  const highlightTables = HIGHLIGHTS.map((key) => TABLES.find((t) => t.key === key)).filter(Boolean);
  const pendingRequests = counts['requests'];

  return (
    <div className="ro-dashboard">
      {errors.length > 0 && <div className="ro-alert" role="alert">No se pudieron consultar: {errors.join(', ')}. Recarga para reintentar.</div>}
      <div className="ro-dashboard-hero">
        <div>
          <h2>Hola de nuevo 👋</h2>
          <p>Este es el estado general de Reserva Ometepe en este momento.</p>
        </div>
        {!loading && typeof pendingRequests === 'number' && (
          <Link to="/ventas/requests" className="ro-hero-stat">
            <span className="ro-hero-stat-value">{pendingRequests}</span>
            <span className="ro-hero-stat-label">solicitudes en total</span>
          </Link>
        )}
      </div>

      <div className="ro-dashboard-grid">
        {highlightTables.map((t) => {
          const Icon = t.icon;
          return (
            <Link key={t.key} to={t.path} className="ro-stat-card">
              <div className="ro-stat-card-icon">
                <Icon size={20} />
              </div>
              <div className="ro-stat-card-body">
                <div className="ro-stat-card-value">{loading ? '—' : counts[t.key] ?? '—'}</div>
                <div className="ro-stat-card-label">{t.label}</div>
              </div>
              <ArrowRight size={16} className="ro-stat-card-arrow" />
            </Link>
          );
        })}
      </div>

      <div className="ro-dashboard-groups">
        {GROUPS.map((group) => (
          <div className="ro-group-card" key={group}>
            <h3>{group}</h3>
            <ul>
              {TABLES.filter((t) => t.group === group).map((t) => (
                <li key={t.key}>
                  <Link to={t.path}>
                    <span>{t.label}</span>
                    <span className="ro-group-card-count">{loading ? '—' : counts[t.key] ?? '—'}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
