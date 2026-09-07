import { Ship } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const boatRoutes = {
  key: "boat_routes",
  label: "Rutas de barco",
  icon: Ship,
  group: "Movilidad",
  path: "/movilidad/boat-routes",
  orderBy: "sort_order",
  ascending: true,
  list: ["name", "origin", "destination", "status", "active"],
  columns: [
    { key: "name", label: "Nombre", type: FIELD.TEXT, required: true },
    { key: "slug", label: "Slug", type: FIELD.TEXT, required: true },
    { key: "origin", label: "Origen", type: FIELD.TEXT, required: true },
    { key: "destination", label: "Destino", type: FIELD.TEXT, required: true },
    { key: "status", label: "Estado", type: FIELD.TEXT },
    { key: "weather_status", label: "Estado por clima", type: FIELD.SELECT, options: [
      { value: "normal", label: "Zarpes con normalidad" },
      { value: "delay", label: "Pueden haber retrasos por clima" },
      { value: "cancelled", label: "Cancelado por clima hasta nuevo aviso" },
    ] },
    { key: "weather_note", label: "Nota adicional sobre el clima (opcional)", type: FIELD.TEXTAREA },
    { key: "phone", label: "Teléfono / WhatsApp", type: FIELD.TEXT },
    { key: "notes", label: "Notas", type: FIELD.TEXTAREA },
    { key: "contact_info", label: "Contacto adicional (JSON opcional)", type: FIELD.JSON },
    { key: "active", label: "Activo", type: FIELD.BOOL },
    { key: "sort_order", label: "Orden", type: FIELD.NUMBER },
  ],
};

export default boatRoutes;