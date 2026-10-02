import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, KeyRound, Building2, DollarSign } from 'lucide-react';
import { TABLES, GROUPS } from '../config/tables';

// Páginas que no están ligadas a una sola tabla de Supabase (por ejemplo,
// HostAccountsPage llama a una Edge Function), así que no aparecen solas en
// TABLES. Se agregan aquí a mano para que sí salgan en el menú, agrupadas
// igual que el resto.
const NAV_GROUPS = [
 {label:'Operación',keys:['requests','reservations','accommodations','host-accounts','contact_messages']},
 {label:'Landing y contenido',keys:['homepage_banners','pages','experiences','tour_guides','destinations','travel_guides','events','blog_posts','blog_categories','seo_entries','media_assets']},
 {label:'Movilidad',keys:['boat_operators','boat_routes','boat_schedules','land_transport_routes','land_transport_schedules','motorcycles']},
 {label:'Finanzas',keys:['commission-collections','finance_transactions']},
 {label:'Marketing',keys:['campaigns','ads','newsletters']},
 {label:'Estadísticas',keys:['analytics_events','conversion_funnel_events']},
 {label:'Configuración',keys:['site_settings','profiles','automation_rules','automation_logs','audit_logs']},
];
const EXTRA_PAGES = [
 {key:'commission-collections',label:'Comisiones y cobros',icon:DollarSign,path:'/finanzas/collections'},
 {key:'host-accounts',label:'Anfitriones e invitaciones',icon:KeyRound,path:'/alojamiento/host-accounts'},
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <aside className={`ro-sidebar ${open ? 'ro-sidebar-open' : ''}`}>
        <div className="ro-sidebar-brand">
          <span className="ro-brand-mark">RO</span>
          <div>
            <div className="ro-brand-title">Superpanel</div>
            <div className="ro-brand-sub">Reserva Ometepe</div>
          </div>
        </div>
        <nav className="ro-nav">
          <div className="ro-nav-group">
            <NavLink
              to="/"
              end
              onClick={onClose}
              className={({ isActive }) => `ro-nav-item ${isActive ? 'ro-nav-item-active' : ''}`}
            >
              <LayoutGrid size={16} />
              <span>Inicio</span>
            </NavLink>
          </div>
          {NAV_GROUPS.map((group) => (
            <div className="ro-nav-group" key={group.label}>
              <div className="ro-nav-group-label">{group.label}</div>
              {group.keys.map(key => [...TABLES,...EXTRA_PAGES].find(t=>t.key===key)).filter(Boolean).map((t) => {
                const Icon = t.icon;
                return (
                  <NavLink
                    key={t.key}
                    to={t.path}
                    onClick={onClose}
                    className={({ isActive }) => `ro-nav-item ${isActive ? 'ro-nav-item-active' : ''}`}
                  >
                    <Icon size={16} />
                    <span>{t.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
      {open && <div className="ro-sidebar-backdrop" onClick={onClose} />}
    </>
  );
}
