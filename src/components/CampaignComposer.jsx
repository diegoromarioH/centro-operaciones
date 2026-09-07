import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Send, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// Llama a la Edge Function "send-campaign" (ver /supabase/functions/send-campaign)
// que envía el correo vía Resend. Si el proyecto todavía no tiene configurada
// la llave RESEND_API_KEY como secreto de Supabase, la función responde con
// un error claro que se muestra aquí mismo, en vez de fallar en silencio.
export default function CampaignComposer({ segment, segmentLabel, onClose, onToast }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null); // { ok, message }

  const recipients = segment.filter((r) => r.active !== false && r.email);

  async function send() {
    setSending(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('send-campaign', {
        body: {
          subject,
          html: body.replace(/\n/g, '<br/>'),
          recipients: recipients.map((r) => ({ email: r.email, name: r.name || '' })),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult({ ok: true, message: `Campaña enviada a ${data?.sent ?? recipients.length} suscriptor(es).` });
      onToast?.({ type: 'success', msg: 'Campaña enviada.' });
    } catch (err) {
      setResult({ ok: false, message: err.message || 'No se pudo enviar la campaña.' });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="ro-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ro-modal ro-campaign-modal">
        <div className="ro-modal-header">
          <h3>Redactar campaña</h3>
          <button className="ro-icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="ro-modal-body">
          <div className="ro-campaign-target">
            Se enviará a <b>{recipients.length}</b> suscriptor(es) activos — segmento: <b>{segmentLabel}</b>
          </div>
          <div className="ro-field">
            <label>Asunto</label>
            <input className="ro-input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ej. Nuevas experiencias disponibles en Ometepe" />
          </div>
          <div className="ro-field">
            <label>Mensaje</label>
            <textarea className="ro-input" rows={10} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Escribe el contenido del correo. Los saltos de línea se conservan." />
          </div>
          {result && (
            <div className={result.ok ? 'ro-campaign-ok' : 'ro-alert'}>
              {result.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />} {result.message}
            </div>
          )}
        </div>
        <div className="ro-modal-footer">
          <button className="ro-btn ro-btn-ghost" onClick={onClose}>
            Cerrar
          </button>
          <button className="ro-btn ro-btn-primary" disabled={!subject || !body || !recipients.length || sending} onClick={send}>
            {sending ? <Loader2 size={16} className="ro-spin" /> : <Send size={16} />}
            {sending ? 'Enviando…' : 'Enviar campaña'}
          </button>
        </div>
      </div>
    </div>
  );
}