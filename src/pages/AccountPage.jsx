import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AccountPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  async function save(e) {
    e.preventDefault(); setError(null); setMessage('');
    if (password.length < 12) { setError('Usa una contraseña de al menos 12 caracteres.'); return; }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword(''); setConfirm(''); setMessage('Contraseña actualizada.');
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }
  return <div className="ro-panel"><h2>Mi cuenta</h2><p>Actualiza tu contraseña temporal por una contraseña personal.</p>
    <form onSubmit={save} style={{ maxWidth: 480 }}>
      {error && <div className="ro-alert" role="alert">{error}</div>}{message && <p role="status">{message}</p>}
      <div className="ro-field"><label htmlFor="new-password">Nueva contraseña</label><input id="new-password" className="ro-input" type={show ? 'text' : 'password'} autoComplete="new-password" minLength={12} required value={password} onChange={e => setPassword(e.target.value)} /></div>
      <div className="ro-field"><label htmlFor="confirm-password">Confirmar contraseña</label><input id="confirm-password" className="ro-input" type={show ? 'text' : 'password'} autoComplete="new-password" minLength={12} required value={confirm} onChange={e => setConfirm(e.target.value)} /></div>
      <label><input type="checkbox" checked={show} onChange={e => setShow(e.target.checked)} /> Mostrar contraseña</label>
      <div className="ro-panel-toolbar"><button className="ro-btn ro-btn-primary" disabled={saving}>{saving ? 'Guardando…' : 'Actualizar contraseña'}</button></div>
    </form>
  </div>;
}
