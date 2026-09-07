import { Megaphone } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const campaigns = {
  key: "campaigns",
  label: "Campañas",
  icon: Megaphone,
  group: "Marketing",
  path: "/marketing/campaigns",
  orderBy: "created_at",
  ascending: false,
  list: ["name", "channel", "status", "budget"],
  columns: [
    { key: "name", label: "Nombre", type: FIELD.TEXT, required: true },
    { key: "channel", label: "Canal", type: FIELD.SELECT, options: ["meta", "google", "tiktok", "email", "otro"] },
    { key: "objective", label: "Objetivo", type: FIELD.TEXT },
    { key: "status", label: "Estado", type: FIELD.SELECT, options: ["draft", "active", "paused", "completed"] },
    { key: "starts_at", label: "Inicia", type: FIELD.DATETIME },
    { key: "ends_at", label: "Termina", type: FIELD.DATETIME },
    { key: "budget", label: "Presupuesto", type: FIELD.NUMBER },
    { key: "metadata", label: "Metadata (JSON)", type: FIELD.JSON },
  ],
};

export default campaigns;
