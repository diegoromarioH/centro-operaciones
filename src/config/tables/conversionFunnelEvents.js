import { GitBranch } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const conversionFunnelEvents = {
  key: "conversion_funnel_events",
  label: "Embudo de conversión",
  icon: GitBranch,
  group: "Analítica (solo lectura)",
  path: "/analitica/funnel",
  orderBy: "created_at",
  ascending: false,
  readOnly: true,
  list: ["funnel_name", "step_name", "target_type", "created_at"],
  columns: [
    { key: "funnel_name", label: "Embudo", type: FIELD.TEXT },
    { key: "step_name", label: "Paso", type: FIELD.TEXT },
    { key: "session_id", label: "Sesión", type: FIELD.TEXT },
    { key: "request_id", label: "Solicitud", type: FIELD.FK, table: "requests", display: "code" },
    { key: "target_type", label: "Tipo de objetivo", type: FIELD.TEXT },
    { key: "target_slug", label: "Slug del objetivo", type: FIELD.TEXT },
    { key: "metadata", label: "Metadata (JSON)", type: FIELD.JSON },
  ],
};

export default conversionFunnelEvents;
