import { Image as ImageIcon } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const mediaAssets = {
  key: "media_assets",
  label: "Biblioteca de medios",
  icon: ImageIcon,
  group: "Marketing",
  path: "/marketing/media",
  orderBy: "sort_order",
  ascending: true,
  imageField: "public_url",
  list: ["title", "media_type", "section", "active"],
  // La tabla exige "file_path" (la ruta dentro del bucket de Storage),
  // pero el formulario solo pide la imagen y guarda su URL pública en
  // public_url. Aquí derivamos file_path de esa URL antes de guardar, para
  // no tener que mostrarle al usuario un campo técnico que no debería
  // llenar a mano.
  deriveOnSave(payload) {
    if (payload.public_url && !payload.file_path) {
      const marker = '/object/public/media/';
      const idx = payload.public_url.indexOf(marker);
      if (idx > -1) payload.file_path = payload.public_url.slice(idx + marker.length);
    }
    return payload;
  },
  columns: [
    { key: "title", label: "Título", type: FIELD.TEXT },
    { key: "alt_text", label: "Texto alternativo", type: FIELD.TEXT },
    { key: "caption", label: "Leyenda", type: FIELD.TEXT },
    { key: "credit", label: "Crédito", type: FIELD.TEXT },
    { key: "media_type", label: "Tipo", type: FIELD.SELECT, options: ["image", "video", "document", "logo", "favicon"] },
    { key: "section", label: "Sección (bucket)", type: FIELD.SELECT, options: ["home", "gallery", "accommodations", "rooms", "experiences", "blog", "events", "branding", "media"] },
    { key: "public_url", label: "Imagen", type: FIELD.IMAGE, required: true, bucket: "media" },
    { key: "target_type", label: "Tipo de objetivo", type: FIELD.TEXT },
    { key: "target_id", label: "ID del objetivo", type: FIELD.TEXT },
    { key: "target_slug", label: "Slug del objetivo", type: FIELD.TEXT },
    { key: "sort_order", label: "Orden", type: FIELD.NUMBER },
    { key: "is_featured", label: "Destacado", type: FIELD.BOOL },
    { key: "active", label: "Activo", type: FIELD.BOOL },
    { key: "metadata", label: "Metadata (JSON)", type: FIELD.JSON },
  ],
};

export default mediaAssets;