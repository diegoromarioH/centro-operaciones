import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, KeyRound } from 'lucide-react';
import { TABLES, GROUPS } from '../config/tables';

// Páginas que no están ligadas a una sola tabla de Supabase (por ejemplo,
// HostAccountsPage llama a una Edge Function), así que no aparecen solas en
// TABLES. Se agregan aquí a mano para que sí salgan en el menú, agrupadas
// igual que el resto.
const EXTRA_PAGES = [
  { key: 'host-accounts', label: 'Accesos de dueños', icon: KeyRound, path: '/alojamiento/host-accounts', group: 'Alojamiento' },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <aside className={`ro-sidebar ${open ? 'ro-sidebar-open' : ''}`}>
        <div className="ro-sidebar-brand">
          <span className="ro-brand-mark">RO</span>
          <div>
            <div className="ro-brand-title">Centro de Operaciones</div>
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
          {GROUPS.map((group) => (
            <div className="ro-nav-group" key={group}>
              <div className="ro-nav-group-label">{group}</div>
              {[...TABLES.filter((t) => t.group === group), ...EXTRA_PAGES.filter((p) => p.group === group)].map((t) => {
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