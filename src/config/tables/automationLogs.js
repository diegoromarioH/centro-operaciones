import { ScrollText } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const automationLogs = {
  key: "automation_logs",
  label: "Bitácora de automatizaciones",
  icon: ScrollText,
  group: "Finanzas y automatización",
  path: "/finanzas/automation-logs",
  orderBy: "created_at",
  ascending: false,
  readOnly: true,
  list: ["rule_id", "event_name", "status", "error_message"],
  columns: [
    { key: "rule_id", label: "Regla", type: FIELD.FK, table: "automation_rules", display: "name" },
    { key: "event_name", label: "Evento", type: FIELD.TEXT },
    { key: "status", label: "Estado", type: FIELD.TEXT },
    { key: "payload", label: "Payload (JSON)", type: FIELD.JSON },
    { key: "response", label: "Respuesta (JSON)", type: FIELD.JSON },
    { key: "error_message", label: "Mensaje de error", type: FIELD.TEXTAREA },
  ],
};

export default automationLogs;
