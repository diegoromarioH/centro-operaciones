import { Users } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const profiles = {
  key: "profiles",
  label: "Usuarios del panel",
  icon: Users,
  group: "Config y personas",
  path: "/config/profiles",
  orderBy: "created_at",
  ascending: false,
  list: ["full_name", "email", "role", "active"],
  columns: [
    { key: "id", label: "ID de usuario (auth)", type: FIELD.TEXT, required: true },
    { key: "full_name", label: "Nombre completo", type: FIELD.TEXT },
    { key: "email", label: "Correo", type: FIELD.TEXT },
    { key: "role", label: "Rol", type: FIELD.SELECT, options: ["super_admin", "admin", "editor", "marketing", "support", "viewer"] },
    { key: "avatar_url", label: "Avatar", type: FIELD.IMAGE, bucket: "media" },
    { key: "active", label: "Activo", type: FIELD.BOOL },
  ],
};

export default profiles;
