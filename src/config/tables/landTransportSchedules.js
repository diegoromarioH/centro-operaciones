import { Route } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const landTransportSchedules = {
  key: "land_transport_schedules",
  label: "Horarios terrestres",
  icon: Route,
  group: "Movilidad",
  path: "/movilidad/land-schedules",
  orderBy: "sort_order",
  ascending: true,
  list: ["route_id", "departure_time", "active"],
  columns: [
    { key: "route_id", label: "Ruta", type: FIELD.FK, required: true, table: "land_transport_routes", display: "name" },
    { key: "departure_time", label: "Hora de salida", type: FIELD.TIME, required: true },
    { key: "days", label: "Días", type: FIELD.ARRAY },
    { key: "notes", label: "Notas", type: FIELD.TEXTAREA },
    { key: "active", label: "Activo", type: FIELD.BOOL },
    { key: "sort_order", label: "Orden", type: FIELD.NUMBER },
  ],
};

export default landTransportSchedules;
