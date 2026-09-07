import { Zap } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const automationRules = {
  key: "automation_rules",
  label: "Reglas de automatización",
  icon: Zap,
  group: "Finanzas y automatización",
  path: "/finanzas/automation-rules",
  orderBy: "created_at",
  ascending: false,
  list: ["name", "trigger_event", "action_type", "active"],
  columns: [
    { key: "name", label: "Nombre", type: FIELD.TEXT, required: true },
    { key: "trigger_event", label: "Evento que dispara", type: FIELD.TEXT, required: true },
    { key: "action_type", label: "Tipo de acción", type: FIELD.SELECT, required: true, options: ["email", "whatsapp", "notification", "task", "webhook"] },
    { key: "active", label: "Activa", type: FIELD.BOOL },
    { key: "config", label: "Configuración (JSON)", type: FIELD.JSON },
  ],
};

export default automationRules;
