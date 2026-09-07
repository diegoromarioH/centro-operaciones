// Los 12 valores de "status" en la tabla real son demasiados para mostrar
// como columnas de un tablero. Los agrupamos en 6 etapas de negocio; el
// selector de detalle sigue permitiendo elegir el estado exacto dentro de
// cada etapa.
export const STAGES = [
  { key: 'nuevas', label: 'Nuevas', color: '#2563eb', statuses: ['received', 'reviewing'] },
  { key: 'disponibilidad', label: 'Verificando disponibilidad', color: '#d97706', statuses: ['available', 'not_available'] },
  { key: 'propuesta', label: 'Propuesta enviada', color: '#8b5cf6', statuses: ['proposal_sent', 'accepted'] },
  { key: 'pago', label: 'Pago', color: '#e8622c', statuses: ['payment_pending', 'payment_submitted', 'payment_confirmed'] },
  { key: 'confirmada', label: 'Confirmada', color: '#16a34a', statuses: ['confirmed'] },
  { key: 'cerrada', label: 'Cerrada', color: '#6b7280', statuses: ['completed', 'cancelled'] },
];

export const STATUS_LABELS = {
  received: 'Recibida',
  reviewing: 'En revisión',
  available: 'Disponible',
  not_available: 'No disponible',
  proposal_sent: 'Propuesta enviada',
  accepted: 'Aceptada por el cliente',
  payment_pending: 'Pago pendiente',
  payment_submitted: 'Comprobante enviado',
  payment_confirmed: 'Pago confirmado',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

export const REQUEST_TYPE_LABELS = {
  accommodation: 'Alojamiento',
  experience: 'Experiencia',
  motorcycle: 'Moto',
  transport: 'Transporte',
  event: 'Evento',
  general: 'General',
};

export function stageForStatus(status) {
  return STAGES.find((s) => s.statuses.includes(status)) || STAGES[0];
}

// Convierte el WhatsApp guardado (puede traer espacios, guiones, +) en solo
// dígitos, que es lo que exige el enlace wa.me.
export function whatsappDigits(raw) {
  return (raw || '').replace(/[^0-9]/g, '');
}

export function whatsappLink(raw, message) {
  const digits = whatsappDigits(raw);
  if (!digits) return null;
  return `https://wa.me/${digits}${message ? '?text=' + encodeURIComponent(message) : ''}`;
}