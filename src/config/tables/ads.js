import { LayoutTemplate } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const ads = {
  key: "ads",
  label: "Anuncios",
  icon: LayoutTemplate,
  group: "Marketing",
  path: "/marketing/ads",
  orderBy: "created_at",
  ascending: false,
  imageField: "creative_url",
  list: ["campaign_id", "name", "status"],
  columns: [
    { key: "campaign_id", label: "Campaña", type: FIELD.FK, table: "campaigns", display: "name" },
    { key: "name", label: "Nombre", type: FIELD.TEXT, required: true },
    { key: "creative_url", label: "Imagen del anuncio", type: FIELD.IMAGE, bucket: "media" },
    { key: "copy_text", label: "Texto del anuncio", type: FIELD.TEXTAREA },
    { key: "cta", label: "Llamado a la acción", type: FIELD.TEXT },
    { key: "status", label: "Estado", type: FIELD.SELECT, options: ["draft", "active", "paused"] },
    { key: "metrics", label: "Métricas (JSON)", type: FIELD.JSON },
  ],
};

export default ads;
