import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { TABLES, GROUPS } from '../config/tables';

// Tablas más relevantes para las tarjetas grandes de resumen.
const HIGHLIGHTS = ['requests', 'reservations', 'accommodations', 'homepage_banners'];
const QUICK_ACTIONS=[['Editar landing','/marketing/homepage-banners'],['Revisar alojamientos','/alojamiento/accommodations'],['Invitar anfitrión','/alojamiento/accommodations?section=hosts'],['Gestionar solicitudes','/ventas/requests'],['Registrar reservas','/ventas/reservations'],['Dashboard de finanzas','/finanzas']];

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
        TABLES.filter(t=>HIGHLIGHTS.includes(t.key)).map(async (t) => {
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

      <div className="ro-dashboard-groups">{QUICK_ACTIONS.map(([label,path])=><Link className="ro-group-card" to={path} key={path}><h3>{label}</h3><ArrowRight size={18}/></Link>)}</div>
    </div>
  );
}
