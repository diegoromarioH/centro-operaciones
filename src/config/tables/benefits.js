import { Gift } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const benefits = {
  key: "benefits",
  label: "Beneficios exclusivos",
  icon: Gift,
  group: "Marketing",
  path: "/marketing/benefits",
  orderBy: "priority",
  ascending: false,
  list: ["title", "target_type", "benefit_type", "active", "priority"],
  columns: [
    { key: "target_type", label: "Aplica a", type: FIELD.SELECT, required: true, options: ["accommodation", "room", "experience", "motorcycle", "event", "global"] },
    { key: "target_id", label: "ID del objetivo", type: FIELD.TEXT },
    { key: "target_slug", label: "Slug del objetivo", type: FIELD.TEXT },
    { key: "badge_text", label: "Texto del badge", type: FIELD.TEXT },
    { key: "title", label: "Título", type: FIELD.TEXT, required: true },
    { key: "description", label: "Descripción", type: FIELD.TEXTAREA },
    { key: "benefit_type", label: "Tipo de beneficio", type: FIELD.SELECT, options: ["discount", "benefit", "flash", "coupon", "included", "upgrade"] },
    { key: "discount_percent", label: "Porcentaje de descuento", type: FIELD.NUMBER },
    { key: "discount_amount", label: "Monto de descuento", type: FIELD.NUMBER },
    { key: "coupon_code", label: "Código de cupón", type: FIELD.TEXT },
    { key: "starts_at", label: "Inicia", type: FIELD.DATETIME },
    { key: "ends_at", label: "Termina", type: FIELD.DATETIME },
    { key: "active", label: "Activo", type: FIELD.BOOL },
    { key: "show_on_card", label: "Mostrar en tarjeta", type: FIELD.BOOL },
    { key: "show_on_detail", label: "Mostrar en ficha", type: FIELD.BOOL },
    { key: "priority", label: "Prioridad", type: FIELD.NUMBER },
    { key: "terms", label: "Términos", type: FIELD.TEXTAREA },
    { key: "metadata", label: "Metadata (JSON)", type: FIELD.JSON },
  ],
};

export default benefits;
