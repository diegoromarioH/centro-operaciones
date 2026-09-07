import { BookOpen } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

// OJO: esto es distinto de "Guías turísticos" (tour_guides, personas que
// acompañan viajeros). Esta tabla son las tarjetas de ideas/itinerarios
// tipo "Ruta romántica de 2 días" en la página de Guías de viaje.
const travelGuides = {
  key: "travel_guides",
  label: "Guías de viaje (itinerarios)",
  icon: BookOpen,
  group: "Contenido",
  path: "/contenido/travel-guides",
  orderBy: "sort_order",
  ascending: true,
  imageField: "main_image_url",
  list: ["title", "type", "active"],
  columns: [
    { key: "title", label: "Título", type: FIELD.TEXT, required: true },
    { key: "slug", label: "Slug (URL)", type: FIELD.TEXT, required: true },
    { key: "type", label: "Categoría", type: FIELD.SELECT, options: ["Pareja", "Aventura", "Familia", "Fotografía", "Relax", "Cultura"] },
    { key: "description", label: "Descripción corta (para tarjeta)", type: FIELD.TEXTAREA },
    { key: "body", label: "Contenido completo de la guía", type: FIELD.TEXTAREA },
    { key: "main_image_url", label: "Imagen principal", type: FIELD.IMAGE, bucket: "guides" },
    { key: "active", label: "Activo (visible en la landing)", type: FIELD.BOOL },
    { key: "sort_order", label: "Orden", type: FIELD.NUMBER },
  ],
};

export default travelGuides;
