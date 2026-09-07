import React from 'react';
import { LogOut, Menu } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Topbar({ title, subtitle, userEmail, onOpenSidebar }) {
  return (
    <header className="ro-topbar">
      <button className="ro-icon-btn ro-only-mobile" onClick={onOpenSidebar}>
        <Menu size={20} />
      </button>
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="ro-topbar-user">
        <span>{userEmail}</span>
        <button className="ro-btn ro-btn-ghost" onClick={() => supabase.auth.signOut()}>
          <LogOut size={15} /> Salir
        </button>
      </div>
    </header>
  );
}
