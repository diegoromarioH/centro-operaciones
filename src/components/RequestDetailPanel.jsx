import React, { useState } from 'react';
import { X, MessageCircle, Mail, Loader2, Save, Trash2 } from 'lucide-react';
import { STAGES, STATUS_LABELS, REQUEST_TYPE_LABELS, whatsappLink } from '../config/requestStages';

export default function RequestDetailPanel({ request, saving, onClose, onSave, onDelete }) {
  const [status, setStatus] = useState(request.status);
  const [notes, setNotes] = useState(request.notes || '');

  const waMsg = `Hola ${request.customer_name}, te escribimos de Reserva Ometepe sobre tu solicitud ${request.code} (${request.service_name || REQUEST_TYPE_LABELS[request.request_type] || 'servicio'}).`;
  const wa = whatsappLink(request.customer_whatsapp, waMsg);
  const dirty = status !== request.status || notes !== (request.notes || '');

  return (
    <div className="ro-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ro-modal ro-req-detail">
        <div className="ro-modal-header">
          <div>
            <h3>{request.code}</h3>
            <small className="ro-req-detail-date">Recibida el {new Date(request.created_at).toLocaleString('es-NI')}</small>
          </div>
          <button className="ro-icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="ro-modal-body">
          <section className="ro-req-section">
            <h4>Cliente</h4>
            <div className="ro-req-row"><span>Nombre</span><b>{request.customer_name}</b></div>
            <div className="ro-req-row">
              <span>Correo</span>
              <a href={`mailto:${request.customer_email}`}><Mail size={13} /> {request.customer_email}</a>
            </div>
            <div className="ro-req-row">
              <span>WhatsApp</span>
              <b>{request.customer_whatsapp}</b>
            </div>
            {request.customer_country && <div className="ro-req-row"><span>País</span><b>{request.customer_country}</b></div>}
            {wa && (
              <a className="ro-btn ro-btn-whatsapp" href={wa} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={16} /> Contactar por WhatsApp
              </a>
            )}
          </section>

          <section className="ro-req-section">
            <h4>Servicio solicitado</h4>
            <div className="ro-req-row"><span>Tipo</span><b>{REQUEST_TYPE_LABELS[request.request_type] || request.request_type}</b></div>
            <div className="ro-req-row"><span>Servicio</span><b>{request.service_name || '—'}</b></div>
            {request.target_slug && <div className="ro-req-row"><span>Slug</span><b>{request.target_slug}</b></div>}
          </section>

          <section className="ro-req-section">
            <h4>Fechas y viajeros</h4>
            <div className="ro-req-row"><span>Llegada</span><b>{request.arrival_date || '—'}</b></div>
            <div className="ro-req-row"><span>Salida</span><b>{request.departure_date || '—'}</b></div>
            <div className="ro-req-row"><span>Viajeros</span><b>{request.adults || 0} adulto(s){request.children ? `, ${request.children} niño(s)` : ''}</b></div>
          </section>

          {request.payment_proof_url && (
            <section className="ro-req-section">
              <h4>Comprobante de pago</h4>
              <a href={request.payment_proof_url} target="_blank" rel="noopener noreferrer">
                <img className="ro-req-proof" src={request.payment_proof_url} alt="Comprobante de pago" />
              </a>
            </section>
          )}

          <section className="ro-req-section">
            <h4>Notas</h4>
            <textarea rows={4} className="ro-input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas internas sobre esta solicitud" />
          </section>

          <section className="ro-req-section">
            <h4>Estado</h4>
            <select className="ro-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STAGES.map((stage) => (
                <optgroup key={stage.key} label={stage.label}>
                  {stage.statuses.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </section>
        </div>

        <div className="ro-modal-footer ro-req-footer">
          <button className="ro-btn ro-btn-danger-ghost" onClick={() => onDelete(request)}>
            <Trash2 size={15} /> Eliminar
          </button>
          <button className="ro-btn ro-btn-primary" disabled={!dirty || saving} onClick={() => onSave(request.id, { status, notes })}>
            {saving ? <Loader2 size={16} className="ro-spin" /> : <Save size={16} />}
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}