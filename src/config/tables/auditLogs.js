import { ShieldAlert } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const auditLogs = {
  key: "audit_logs",
  label: "Bitácora de auditoría",
  icon: ShieldAlert,
  group: "Analítica (solo lectura)",
  path: "/analitica/audit",
  orderBy: "created_at",
  ascending: false,
  readOnly: true,
  list: ["action", "user_email", "module", "created_at"],
  columns: [
    { key: "action", label: "Acción", type: FIELD.TEXT },
    { key: "user_id", label: "ID de usuario", type: FIELD.TEXT },
    { key: "user_email", label: "Usuario", type: FIELD.TEXT },
    { key: "module", label: "Módulo", type: FIELD.TEXT },
    { key: "record_id", label: "ID de registro", type: FIELD.TEXT },
    { key: "ip", label: "IP", type: FIELD.TEXT },
    { key: "device", label: "Dispositivo", type: FIELD.TEXT },
    { key: "metadata", label: "Metadata (JSON)", type: FIELD.JSON },
  ],
};

export default auditLogs;
