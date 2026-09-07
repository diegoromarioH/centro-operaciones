import { Clock } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const boatSchedules = {
  key: "boat_schedules",
  label: "Horarios de barco",
  icon: Clock,
  group: "Movilidad",
  path: "/movilidad/boat-schedules",
  orderBy: [
    { column: "route_id", ascending: true },
    { column: "departure_time", ascending: true },
  ],
  list: ["route_id", "departure_time", "vessel_name", "active"],
  columns: [
    { key: "route_id", label: "Ruta", type: FIELD.FK, required: true, table: "boat_routes", display: "name" },
    { key: "departure_time", label: "Hora de salida", type: FIELD.TIME, required: true },
    { key: "vessel_name", label: "Nombre del barco", type: FIELD.TEXT },
    { key: "vessel_type", label: "Tipo de embarcación", type: FIELD.TEXT },
    { key: "days", label: "Días", type: FIELD.ARRAY },
    { key: "notes", label: "Notas", type: FIELD.TEXTAREA },
    { key: "active", label: "Activo", type: FIELD.BOOL },
    { key: "sort_order", label: "Orden", type: FIELD.NUMBER },
  ],
};

export default boatSchedules;