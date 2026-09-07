import { Phone } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const boatOperators = {
  key: "boat_operators",
  label: "Contactos de navieras",
  icon: Phone,
  group: "Movilidad",
  path: "/movilidad/boat-operators",
  orderBy: "sort_order",
  ascending: true,
  list: ["name", "phone", "active"],
  columns: [
    { key: "name", label: "Nombre de la naviera / embarcación", type: FIELD.TEXT, required: true },
    { key: "phone", label: "Teléfono(s)", type: FIELD.TEXT },
    { key: "notes", label: "Notas", type: FIELD.TEXTAREA },
    { key: "active", label: "Activo (visible en la landing)", type: FIELD.BOOL },
    { key: "sort_order", label: "Orden", type: FIELD.NUMBER },
  ],
};

export default boatOperators;