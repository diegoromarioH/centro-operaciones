import React, { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError('Correo o contraseña incorrectos.');
  }

  return (
    <div className="ro-login-screen">
      <form className="ro-login-card" onSubmit={handleLogin}>
        <div className="ro-brand-mark ro-brand-mark-lg">RO</div>
        <h1>Centro de Operaciones</h1>
        <p className="ro-login-sub">Inicia sesión para administrar Reserva Ometepe.</p>
        {error && (
          <div className="ro-alert">
            <AlertCircle size={15} /> {error}
          </div>
        )}
        <div className="ro-field">
          <label htmlFor="login-email">Correo</label>
          <input
            id="login-email"
            type="email"
            required
            className="ro-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tú@reservaometepe.com"
          />
        </div>
        <div className="ro-field">
          <label htmlFor="login-password">Contraseña</label>
          <input
            id="login-password"
            type="password"
            required
            className="ro-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <button type="submit" className="ro-btn ro-btn-primary ro-btn-block" disabled={loading}>
          {loading ? <Loader2 size={16} className="ro-spin" /> : null}
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
