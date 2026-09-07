import { BarChart3 } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const analyticsEvents = {
  key: "analytics_events",
  label: "Eventos de analítica",
  icon: BarChart3,
  group: "Analítica (solo lectura)",
  path: "/analitica/events",
  orderBy: "created_at",
  ascending: false,
  readOnly: true,
  list: ["event_name", "page", "service", "created_at"],
  columns: [
    { key: "event_name", label: "Evento", type: FIELD.TEXT },
    { key: "session_id", label: "Sesión", type: FIELD.TEXT },
    { key: "user_id", label: "ID de usuario", type: FIELD.TEXT },
    { key: "page", label: "Página", type: FIELD.TEXT },
    { key: "service", label: "Servicio", type: FIELD.TEXT },
    { key: "reference_id", label: "ID de referencia", type: FIELD.TEXT },
    { key: "language", label: "Idioma", type: FIELD.TEXT },
    { key: "device", label: "Dispositivo", type: FIELD.TEXT },
    { key: "country", label: "País", type: FIELD.TEXT },
    { key: "source", label: "Fuente", type: FIELD.TEXT },
    { key: "medium", label: "Medio", type: FIELD.TEXT },
    { key: "campaign", label: "Campaña", type: FIELD.TEXT },
    { key: "metadata", label: "Metadata (JSON)", type: FIELD.JSON },
  ],
};

export default analyticsEvents;
