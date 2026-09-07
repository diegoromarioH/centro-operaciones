import { Send } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const requests = {
  key: "requests",
  label: "Solicitudes",
  icon: Send,
  group: "Ventas",
  path: "/ventas/requests",
  orderBy: "created_at",
  ascending: false,
  list: ["code", "request_type", "customer_name", "status", "created_at"],
  columns: [
    { key: "code", label: "Código", type: FIELD.TEXT },
    { key: "request_type", label: "Tipo", type: FIELD.SELECT, required: true, options: ["accommodation", "experience", "motorcycle", "transport", "event", "general"] },
    { key: "service_name", label: "Servicio", type: FIELD.TEXT },
    { key: "target_type", label: "Tipo de objetivo", type: FIELD.TEXT },
    { key: "target_id", label: "ID del objetivo", type: FIELD.TEXT },
    { key: "target_slug", label: "Slug del objetivo", type: FIELD.TEXT },
    { key: "customer_name", label: "Nombre del cliente", type: FIELD.TEXT, required: true },
    { key: "customer_email", label: "Correo del cliente", type: FIELD.TEXT, required: true },
    { key: "customer_whatsapp", label: "WhatsApp del cliente", type: FIELD.TEXT, required: true },
    { key: "customer_country", label: "País del cliente", type: FIELD.TEXT },
    { key: "arrival_date", label: "Fecha de llegada", type: FIELD.DATE },
    { key: "departure_date", label: "Fecha de salida", type: FIELD.DATE },
    { key: "requested_date", label: "Fecha solicitada", type: FIELD.DATE },
    { key: "adults", label: "Adultos", type: FIELD.NUMBER },
    { key: "children", label: "Niños", type: FIELD.NUMBER },
    { key: "room_id", label: "Habitación", type: FIELD.FK, table: "rooms", display: "name" },
    { key: "notes", label: "Notas", type: FIELD.TEXTAREA },
    { key: "status", label: "Estado", type: FIELD.SELECT, options: ["received", "reviewing", "available", "proposal_sent", "accepted", "payment_pending", "payment_submitted", "payment_confirmed", "confirmed", "completed", "cancelled", "not_available"] },
    { key: "proposal", label: "Propuesta (JSON)", type: FIELD.JSON },
    { key: "payment_proof_url", label: "Comprobante de pago", type: FIELD.IMAGE, bucket: "media" },
    { key: "metadata", label: "Metadata (JSON)", type: FIELD.JSON },
  ],
};

export default requests;
