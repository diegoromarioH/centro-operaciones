import { ShieldCheck } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const accommodationPolicies = {
  key: "accommodation_policies",
  label: "Políticas por alojamiento",
  icon: ShieldCheck,
  group: "Alojamiento",
  path: "/alojamiento/policies",
  orderBy: "created_at",
  ascending: false,
  list: ["accommodation_id", "flexibility_level", "check_in_time", "check_out_time"],
  columns: [
    { key: "accommodation_id", label: "Alojamiento", type: FIELD.FK, required: true, table: "accommodations", display: "name" },
    { key: "reservation_policy", label: "Política de reserva", type: FIELD.TEXTAREA },
    { key: "deposit_required", label: "Requiere depósito", type: FIELD.BOOL },
    { key: "deposit_percentage", label: "Porcentaje de depósito", type: FIELD.NUMBER },
    { key: "cancellation_policy", label: "Política de cancelación", type: FIELD.TEXTAREA },
    { key: "refund_policy", label: "Política de reembolso", type: FIELD.TEXTAREA },
    { key: "check_in_time", label: "Hora de check-in", type: FIELD.TEXT },
    { key: "check_out_time", label: "Hora de check-out", type: FIELD.TEXT },
    { key: "pets_policy", label: "Política de mascotas", type: FIELD.TEXTAREA },
    { key: "children_policy", label: "Política de niños", type: FIELD.TEXTAREA },
    { key: "smoking_policy", label: "Política de fumado", type: FIELD.TEXTAREA },
    { key: "events_policy", label: "Política de eventos", type: FIELD.TEXTAREA },
    { key: "flexibility_level", label: "Nivel de flexibilidad", type: FIELD.SELECT, options: ["flexible", "moderada", "estricta"] },
  ],
};

export default accommodationPolicies;
