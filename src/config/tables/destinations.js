import { Compass } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const destinations = {
  key: "destinations",
  label: "Destinos",
  icon: Compass,
  group: "Contenido",
  path: "/contenido/destinations",
  orderBy: "sort_order",
  ascending: true,
  imageField: "main_image_url",
  list: ["name", "type", "zone", "active"],
  columns: [
    { key: "name", label: "Nombre", type: FIELD.TEXT, required: true },
    { key: "slug", label: "Slug (URL)", type: FIELD.TEXT, required: true },
    { key: "type", label: "Categoría", type: FIELD.SELECT, options: ["Atardecer", "Naturaleza", "Playa", "Cultura", "Aventura", "Mirador"] },
    { key: "zone", label: "Zona", type: FIELD.TEXT },
    { key: "short_description", label: "Descripción corta (para tarjeta)", type: FIELD.TEXT },
    { key: "description", label: "Descripción completa", type: FIELD.TEXTAREA },
    { key: "main_image_url", label: "Imagen principal", type: FIELD.IMAGE, bucket: "destinations" },
    { key: "active", label: "Activo (visible en la landing)", type: FIELD.BOOL },
    { key: "sort_order", label: "Orden", type: FIELD.NUMBER },
  ],
};

export default destinations;