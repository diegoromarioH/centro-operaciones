import { Users } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const tourGuides = {
  key: "tour_guides",
  label: "Guías turísticos",
  icon: Users,
  group: "Contenido",
  path: "/contenido/tour-guides",
  orderBy: "sort_order",
  ascending: true,
  imageField: "photo_url",
  list: ["name", "specialty", "years_experience", "active"],
  columns: [
    { key: "name", label: "Nombre", type: FIELD.TEXT, required: true },
    { key: "photo_url", label: "Foto", type: FIELD.IMAGE, bucket: "guides" },
    { key: "specialty", label: "Especialidad", type: FIELD.TEXT },
    { key: "languages", label: "Idiomas", type: FIELD.CHECKLIST, groups: [
      { label: "Idiomas", options: ["Español", "Inglés", "Francés", "Alemán", "Italiano"] },
    ] },
    { key: "bio", label: "Biografía", type: FIELD.TEXTAREA },
    { key: "whatsapp", label: "WhatsApp", type: FIELD.TEXT },
    { key: "email", label: "Correo", type: FIELD.TEXT },
    { key: "years_experience", label: "Años de experiencia", type: FIELD.NUMBER },
    { key: "active", label: "Activo (visible en la landing)", type: FIELD.BOOL },
    { key: "sort_order", label: "Orden", type: FIELD.NUMBER },
  ],
};

export default tourGuides;