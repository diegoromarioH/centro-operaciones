import { CalendarClock } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const events = {
  key: "events",
  label: "Eventos",
  icon: CalendarClock,
  group: "Contenido",
  path: "/contenido/events",
  orderBy: "starts_at",
  ascending: false,
  imageField: "main_image_url",
  list: ["title", "event_type", "starts_at", "active", "featured"],
  columns: [
    { key: "title", label: "Título", type: FIELD.TEXT, required: true },
    { key: "slug", label: "Slug", type: FIELD.TEXT, required: true },
    { key: "event_type", label: "Tipo", type: FIELD.TEXT },
    { key: "description", label: "Descripción", type: FIELD.TEXTAREA },
    { key: "location", label: "Ubicación", type: FIELD.TEXT },
    { key: "starts_at", label: "Inicia", type: FIELD.DATETIME },
    { key: "ends_at", label: "Termina", type: FIELD.DATETIME },
    { key: "main_image_url", label: "Imagen principal", type: FIELD.IMAGE, bucket: "events" },
    { key: "featured", label: "Destacado", type: FIELD.BOOL },
    { key: "active", label: "Activo", type: FIELD.BOOL },
    { key: "metadata", label: "Metadata (JSON)", type: FIELD.JSON },
  ],
};

export default events;
