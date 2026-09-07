import React from 'react';
import { MessageCircle, Calendar, Users } from 'lucide-react';
import { REQUEST_TYPE_LABELS, whatsappLink } from '../config/requestStages';

export default function RequestCard({ request, onOpen }) {
  const waMsg = `Hola ${request.customer_name}, te escribimos de Reserva Ometepe sobre tu solicitud ${request.code} (${request.service_name || REQUEST_TYPE_LABELS[request.request_type] || 'servicio'}).`;
  const wa = whatsappLink(request.customer_whatsapp, waMsg);

  return (
    <div className="ro-req-card" onClick={() => onOpen(request)}>
      <div className="ro-req-card-top">
        <span className="ro-req-code">{request.code}</span>
        <span className="ro-req-type">{REQUEST_TYPE_LABELS[request.request_type] || request.request_type}</span>
      </div>
      <b className="ro-req-name">{request.customer_name}</b>
      <p className="ro-req-service">{request.service_name || '—'}</p>
      {(request.arrival_date || request.adults) && (
        <div className="ro-req-meta">
          {request.arrival_date && (
            <span>
              <Calendar size={12} /> {request.arrival_date}
            </span>
          )}
          {request.adults && (
            <span>
              <Users size={12} /> {request.adults}
              {request.children ? `+${request.children}` : ''}
            </span>
          )}
        </div>
      )}
      {wa && (
        <a
          className="ro-req-wa"
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          <MessageCircle size={13} /> WhatsApp
        </a>
      )}
    </div>
  );
}