import { BookOpenCheck } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const reservations = {
  key: "reservations",
  label: "Reservas",
  icon: BookOpenCheck,
  group: "Ventas",
  path: "/ventas/reservations",
  orderBy: "created_at",
  ascending: false,
  list: ["reservation_code", "target_type", "status", "starts_on"],
  columns: [
    { key: "request_id", label: "Solicitud", type: FIELD.FK, table: "requests", display: "code" },
    { key: "reservation_code", label: "Código de reserva", type: FIELD.TEXT },
    { key: "target_type", label: "Tipo de objetivo", type: FIELD.TEXT, required: true },
    { key: "target_id", label: "ID del objetivo", type: FIELD.TEXT },
    { key: "target_slug", label: "Slug del objetivo", type: FIELD.TEXT },
    { key: "customer_name", label: "Nombre del cliente", type: FIELD.TEXT },
    { key: "customer_email", label: "Correo del cliente", type: FIELD.TEXT },
    { key: "customer_whatsapp", label: "WhatsApp del cliente", type: FIELD.TEXT },
    { key: "starts_on", label: "Inicia", type: FIELD.DATE },
    { key: "ends_on", label: "Termina", type: FIELD.DATE },
    { key: "total_amount", label: "Monto total", type: FIELD.NUMBER },
    { key: "currency", label: "Moneda", type: FIELD.TEXT },
    { key: "commission_percent", label: "Comisión (%)", type: FIELD.NUMBER },
    { key: "commission_amount", label: "Comisión (monto)", type: FIELD.NUMBER },
    { key: "status", label: "Estado", type: FIELD.TEXT },
    { key: "metadata", label: "Metadata (JSON)", type: FIELD.JSON },
  ],
};

export default reservations;
