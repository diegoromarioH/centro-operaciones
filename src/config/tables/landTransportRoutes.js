import { Bus } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const landTransportRoutes = {
  key: "land_transport_routes",
  label: "Rutas terrestres",
  icon: Bus,
  group: "Movilidad",
  path: "/movilidad/land-routes",
  orderBy: "sort_order",
  ascending: true,
  list: ["name", "origin", "destination", "transport_type", "active"],
  columns: [
    { key: "name", label: "Nombre", type: FIELD.TEXT, required: true },
    { key: "slug", label: "Slug", type: FIELD.TEXT, required: true },
    { key: "origin", label: "Origen", type: FIELD.TEXT, required: true },
    { key: "destination", label: "Destino", type: FIELD.TEXT, required: true },
    { key: "transport_type", label: "Tipo de transporte", type: FIELD.TEXT },
    { key: "notes", label: "Notas", type: FIELD.TEXTAREA },
    { key: "active", label: "Activo", type: FIELD.BOOL },
    { key: "sort_order", label: "Orden", type: FIELD.NUMBER },
  ],
};

export default landTransportRoutes;
