import React, { useCallback, useEffect, useState } from 'react';
import { Copy, KeyRound, Loader2, Users } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Toast from '../components/Toast';
import { useSearchParams, Link } from 'react-router-dom';

export default function HostAccountsPage({ accommodationId }) {
  const [params] = useSearchParams();
  const [loadError, setLoadError] = useState(null);
  const [accommodations, setAccommodations] = useState([]);
  const [linked, setLinked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [result, setResult] = useState(null);
  const [f, setF] = useState({ display_name: '', email: '', phone: '', whatsapp: '', accommodation_id: accommodationId || params.get('hotel') || '' });

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const [{ data: accs, error: accError }, { data: hostRows, error: hostError }] = await Promise.all([
      supabase.from('accommodations').select('id, name').order('name'),
      supabase
        .from('hosts')
        .select('id, display_name, email, phone, whatsapp, active, user_id, accommodation_hosts(accommodation_id, accommodations(name))')
        .not('user_id', 'is', null),
    ]);
    if (accError || hostError) setLoadError((accError || hostError).message);
    setAccommodations(accs || []);
    setLinked((hostRows || []).flatMap(h => h.accommodation_hosts?.length ? h.accommodation_hosts.map(a => ({...a, hosts:h})) : [{hosts:h}]));
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
      setResult({ ok: true, tempPassword: data.temp_password, email: f.email, existingAccount: data.existing_account });
      setToast({ type: 'success', msg: data.existing_account ? 'Cuenta existente vinculada al alojamiento.' : 'Cuenta de anfitrión creada.' });
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
      {loadError && <div className="ro-alert" role="alert">{loadError}<button className="ro-btn ro-btn-ghost" onClick={reload}>Reintentar</button></div>}
      <div className="ro-host-form-card">
        <h3>
          <KeyRound size={17} /> Dar acceso a un anfitrión
        </h3>
        <p className="ro-req-empty" style={{ textAlign: 'left', marginBottom: 16 }}>
          Crea o vincula una cuenta para que el anfitrión inicie sesión en el panel de anfitriones y administre su
          ficha y habitaciones. Puedes asignarle un alojamiento existente o permitirle crear un borrador para revisión de la OTA. Las credenciales se comparten manualmente; esta acción no envía correos.
        </p>
        <form onSubmit={submit} className="ro-host-form">
          <input required placeholder="Nombre del anfitrión" value={f.display_name} onChange={(e) => up('display_name', e.target.value)} />
          <input required type="email" placeholder="Correo (con esto inicia sesión)" value={f.email} onChange={(e) => up('email', e.target.value)} />
          <input placeholder="Teléfono" value={f.phone} onChange={(e) => up('phone', e.target.value)} />
          <input placeholder="WhatsApp" value={f.whatsapp} onChange={(e) => up('whatsapp', e.target.value)} />
          <select value={f.accommodation_id} onChange={(e) => up('accommodation_id', e.target.value)}>
            <option value="">El anfitrión creará su alojamiento</option>
            {accommodations.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <button className="ro-btn ro-btn-primary" disabled={saving} type="submit">
            {saving ? <Loader2 size={16} className="ro-spin" /> : <KeyRound size={16} />}
            {saving ? 'Asignando…' : 'Asignar acceso'}
          </button>
        </form>

        {result?.ok && (
          <div className="ro-host-result ok">
            {result.existingAccount ? <p>Acceso disponible para <b>{result.email}</b>. El anfitrión puede ingresar con su contraseña actual.</p> : <><p>
              Cuenta creada para <b>{result.email}</b>. Comparte esta contraseña temporal con el anfitrión (no se vuelve a
              mostrar):
            </p>
            <div className="ro-host-password">
              <code>{result.tempPassword}</code>
              <button type="button" className="ro-icon-btn" onClick={copyPassword} title="Copiar">
                <Copy size={15} />
              </button>
            </div></>}
          </div>
        )}
        {result && !result.ok && <div className="ro-alert">{result.message}</div>}
      </div>

      <h3 className="ro-host-list-title">
        <Users size={17} /> Anfitriones con acceso al portal
      </h3>
      {loading ? (
        <div className="ro-empty">
          <Loader2 size={18} className="ro-spin" /> Cargando…
        </div>
      ) : linked.length === 0 ? (
        <div className="ro-empty">Todavía no has creado ningún acceso de anfitrión.</div>
      ) : (
        <div className="ro-table-wrap">
          <table className="ro-table">
            <thead>
              <tr>
                <th>Anfitrión</th>
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
                  <td>{r.accommodation_id ? <Link to={`/alojamiento/accommodations?hotel=${r.accommodation_id}`}>{r.accommodations?.name}</Link> : "Pendiente de crear alojamiento"}</td>
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
