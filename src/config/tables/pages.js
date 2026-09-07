import { FileText } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const pages = {
  key: "pages",
  label: "Páginas del sitio",
  icon: FileText,
  group: "Contenido",
  path: "/contenido/pages",
  orderBy: "sort_order",
  ascending: true,
  list: ["slug", "title", "page_type", "status"],
  columns: [
    { key: "slug", label: "Slug", type: FIELD.TEXT, required: true },
    { key: "title", label: "Título", type: FIELD.TEXT, required: true },
    { key: "subtitle", label: "Subtítulo", type: FIELD.TEXT },
    { key: "page_type", label: "Tipo de página", type: FIELD.SELECT, options: ["page", "landing", "legal"] },
    { key: "language", label: "Idioma", type: FIELD.SELECT, options: ["es", "en"] },
    { key: "content", label: "Contenido (JSON)", type: FIELD.JSON },
    { key: "hero_media_id", label: "Imagen destacada", type: FIELD.FK, table: "media_assets", display: "title" },
    { key: "status", label: "Estado", type: FIELD.SELECT, options: ["draft", "published", "archived"] },
    { key: "sort_order", label: "Orden", type: FIELD.NUMBER },
  ],
};

export default pages;
