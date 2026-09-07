import { Sparkles } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const experiences = {
  key: "experiences",
  label: "Experiencias",
  icon: Sparkles,
  group: "Contenido",
  path: "/contenido/experiences",
  orderBy: "sort_order",
  ascending: true,
  imageField: "main_image_url",
  list: ["name", "category", "difficulty", "price_from", "active", "featured"],
  columns: [
    { key: "name", label: "Nombre", type: FIELD.TEXT, required: true },
    { key: "slug", label: "Slug", type: FIELD.TEXT, required: true },
    { key: "category", label: "Categoría", type: FIELD.TEXT },
    { key: "short_description", label: "Descripción corta", type: FIELD.TEXT },
    { key: "description", label: "Descripción", type: FIELD.TEXTAREA },
    { key: "municipality", label: "Municipio", type: FIELD.TEXT },
    { key: "zone", label: "Zona", type: FIELD.TEXT },
    { key: "duration_text", label: "Duración", type: FIELD.TEXT },
    { key: "difficulty", label: "Dificultad", type: FIELD.TEXT },
    { key: "ideal_for", label: "Ideal para", type: FIELD.ARRAY },
    { key: "what_to_bring", label: "Qué llevar", type: FIELD.ARRAY },
    { key: "includes", label: "Incluye", type: FIELD.ARRAY },
    { key: "main_image_url", label: "Imagen principal", type: FIELD.IMAGE, bucket: "experiences" },
    { key: "icon_name", label: "Ícono", type: FIELD.ICON_SELECT },
    { key: "video_url", label: "Video", type: FIELD.TEXT },
    { key: "quote_enabled", label: "Permite cotización", type: FIELD.BOOL },
    { key: "price_public", label: "Precio público", type: FIELD.BOOL },
    { key: "price_from", label: "Precio desde", type: FIELD.NUMBER },
    { key: "currency", label: "Moneda", type: FIELD.TEXT },
    { key: "active", label: "Activo", type: FIELD.BOOL },
    { key: "featured", label: "Destacado", type: FIELD.BOOL },
    { key: "sort_order", label: "Orden", type: FIELD.NUMBER },
    { key: "metadata", label: "Metadata (JSON)", type: FIELD.JSON },
  ],
};

export default experiences;