import { Mail } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const newsletters = {
  key: "newsletters",
  label: "Suscriptores",
  icon: Mail,
  group: "Marketing",
  path: "/marketing/newsletters",
  orderBy: "created_at",
  ascending: false,
  list: ["email", "name", "interest", "source", "created_at", "active"],
  columns: [
    { key: "name", label: "Nombre", type: FIELD.TEXT },
    { key: "email", label: "Correo", type: FIELD.TEXT, required: true },
    { key: "interest", label: "Interés", type: FIELD.TEXT },
    { key: "source", label: "Origen", type: FIELD.TEXT },
    { key: "language", label: "Idioma", type: FIELD.TEXT },
    { key: "created_at", label: "Fecha de suscripción", type: FIELD.DATETIME },
    { key: "active", label: "Activo", type: FIELD.BOOL },
    { key: "metadata", label: "Metadata (JSON)", type: FIELD.JSON },
  ],
};

export default newsletters;