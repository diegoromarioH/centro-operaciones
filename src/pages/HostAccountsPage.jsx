import React, { useCallback, useEffect, useState } from 'react';
import { Copy, KeyRound, Loader2, Users } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Toast from '../components/Toast';

export default function HostAccountsPage() {
  const [accommodations, setAccommodations] = useState([]);
  const [linked, setLinked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [result, setResult] = useState(null);
  const [f, setF] = useState({ display_name: '', email: '', phone: '', whatsapp: '', accommodation_id: '' });

  const reload = useCallback(async () => {
    setLoading(true);
    const [{ data: accs }, { data: hostRows }] = await Promise.all([
      supabase.from('accommodations').select('id, name').order('name'),
      supabase
        .from('accommodation_hosts')
        .select('accommodation_id, is_primary, hosts(id, display_name, email, phone, whatsapp, active, user_id), accommodations(name)')
        .not('hosts.user_id', 'is', null),
    ]);
    setAccommodations(accs || []);
    setLinked((hostRows || []).filter((r) => r.hosts?.user_id));
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  function up(k, v) {
    setF((prev) => ({ ...prev, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('create-host-account', { body: f });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult({ ok: true, tempPassword: data.temp_password, email: f.email });
      setToast({ type: 'success', msg: 'Cuenta de dueño creada.' });
      setF({ display_name: '', email: '', phone: '', whatsapp: '', accommodation_id: '' });
      reload();
    } catch (err) {
      setResult({ ok: false, message: err.message || 'No se pudo crear la cuenta.' });
    } finally {
      setSaving(false);
    }
  }

  function copyPassword() {
    if (result?.tempPassword) {
      navigator.clipboard.writeText(result.tempPassword);
      setToast({ type: 'success', msg: 'Contraseña copiada.' });
    }
  }

  return (
    <div className="ro-panel">
      <div className="ro-host-form-card">
        <h3>
          <KeyRound size={17} /> Dar acceso a un dueño de alojamiento
        </h3>
        <p className="ro-req-empty" style={{ textAlign: 'left', marginBottom: 16 }}>
          Crea una cuenta para que el dueño de un alojamiento inicie sesión en el portal de dueños y administre su
          propia ficha y habitaciones — no puede ver ni tocar nada más del sistema.
        </p>
        <form onSubmit={submit} className="ro-host-form">
          <input required placeholder="Nombre del dueño" value={f.display_name} onChange={(e) => up('display_name', e.target.value)} />
          <input required type="email" placeholder="Correo (con esto inicia sesión)" value={f.email} onChange={(e) => up('email', e.target.value)} />
          <input placeholder="Teléfono" value={f.phone} onChange={(e) => up('phone', e.target.value)} />
          <input placeholder="WhatsApp" value={f.whatsapp} onChange={(e) => up('whatsapp', e.target.value)} />
          <select required value={f.accommodation_id} onChange={(e) => up('accommodation_id', e.target.value)}>
            <option value="">Selecciona el alojamiento…</option>
            {accommodations.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <button className="ro-btn ro-btn-primary" disabled={saving} type="submit">
            {saving ? <Loader2 size={16} className="ro-spin" /> : <KeyRound size={16} />}
            {saving ? 'Creando…' : 'Crear acceso'}
          </button>
        </form>

        {result?.ok && (
          <div className="ro-host-result ok">
            <p>
              Cuenta creada para <b>{result.email}</b>. Comparte esta contraseña temporal con el dueño (no se vuelve a
              mostrar):
            </p>
            <div className="ro-host-password">
              <code>{result.tempPassword}</code>
              <button type="button" className="ro-icon-btn" onClick={copyPassword} title="Copiar">
                <Copy size={15} />
              </button>
            </div>
          </div>
        )}
        {result && !result.ok && <div className="ro-alert">{result.message}</div>}
      </div>

      <h3 className="ro-host-list-title">
        <Users size={17} /> Dueños con acceso al portal
      </h3>
      {loading ? (
        <div className="ro-empty">
          <Loader2 size={18} className="ro-spin" /> Cargando…
        </div>
      ) : linked.length === 0 ? (
        <div className="ro-empty">Todavía no has creado ningún acceso de dueño.</div>
      ) : (
        <div className="ro-table-wrap">
          <table className="ro-table">
            <thead>
              <tr>
                <th>Dueño</th>
                <th>Correo</th>
                <th>Alojamiento</th>
                <th>Teléfono / WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              {linked.map((r, i) => (
                <tr key={i}>
                  <td>{r.hosts?.display_name}</td>
                  <td>{r.hosts?.email}</td>
                  <td>{r.accommodations?.name}</td>
                  <td>{r.hosts?.whatsapp || r.hosts?.phone || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}