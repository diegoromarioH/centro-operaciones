import { Search } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const seoEntries = {
  key: "seo_entries",
  label: "SEO",
  icon: Search,
  group: "Marketing",
  path: "/marketing/seo",
  orderBy: "updated_at",
  ascending: false,
  list: ["target_type", "target_slug", "title", "active"],
  columns: [
    { key: "target_type", label: "Tipo de entidad", type: FIELD.TEXT, required: true },
    { key: "target_slug", label: "Slug", type: FIELD.TEXT, required: true },
    { key: "language", label: "Idioma", type: FIELD.TEXT },
    { key: "title", label: "Título SEO", type: FIELD.TEXT, required: true },
    { key: "description", label: "Descripción SEO", type: FIELD.TEXTAREA },
    { key: "keywords", label: "Palabras clave", type: FIELD.ARRAY },
    { key: "canonical_url", label: "URL canónica", type: FIELD.TEXT },
    { key: "og_title", label: "Título Open Graph", type: FIELD.TEXT },
    { key: "og_description", label: "Descripción Open Graph", type: FIELD.TEXTAREA },
    { key: "og_image", label: "Imagen Open Graph", type: FIELD.TEXT },
    { key: "twitter_card", label: "Twitter Card", type: FIELD.TEXT },
    { key: "schema_json", label: "Schema.org (JSON)", type: FIELD.JSON },
    { key: "robots", label: "Robots", type: FIELD.TEXT },
    { key: "active", label: "Activo", type: FIELD.BOOL },
  ],
};

export default seoEntries;
