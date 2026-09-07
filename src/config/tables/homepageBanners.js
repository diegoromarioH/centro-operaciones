import { Presentation } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const homepageBanners = {
  key: "homepage_banners",
  label: "Anuncios de portada",
  icon: Presentation,
  group: "Marketing",
  path: "/marketing/homepage-banners",
  orderBy: "sort_order",
  ascending: true,
  imageField: "image_url",
  list: ["title", "active", "starts_at", "ends_at", "sort_order"],
  columns: [
    { key: "title", label: "Título", type: FIELD.TEXT, required: true },
    { key: "subtitle", label: "Subtítulo", type: FIELD.TEXT },
    { key: "image_url", label: "Imagen", type: FIELD.IMAGE, required: true, bucket: "home" },
    { key: "link_url", label: "Enlace al hacer clic", type: FIELD.TEXT },
    { key: "cta_text", label: "Texto del botón", type: FIELD.TEXT },
    { key: "active", label: "Activo", type: FIELD.BOOL },
    { key: "sort_order", label: "Orden", type: FIELD.NUMBER },
    { key: "starts_at", label: "Inicia", type: FIELD.DATETIME },
    { key: "ends_at", label: "Termina", type: FIELD.DATETIME },
    { key: "metadata", label: "Metadata (JSON)", type: FIELD.JSON },
  ],
};

export default homepageBanners;
