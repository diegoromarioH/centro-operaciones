import { UserCog } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const hosts = {
  key: "hosts",
  label: "Anfitriones",
  icon: UserCog,
  group: "Alojamiento",
  path: "/alojamiento/hosts",
  orderBy: "display_name",
  ascending: true,
  list: ["display_name", "role_label", "email", "active"],
  columns: [
    { key: "display_name", label: "Nombre", type: FIELD.TEXT, required: true },
    { key: "role_label", label: "Rol", type: FIELD.TEXT },
    { key: "email", label: "Correo", type: FIELD.TEXT },
    { key: "phone", label: "Teléfono", type: FIELD.TEXT },
    { key: "whatsapp", label: "WhatsApp", type: FIELD.TEXT },
    { key: "notes", label: "Notas", type: FIELD.TEXTAREA },
    { key: "bank_accounts", label: "Cuentas bancarias (JSON)", type: FIELD.JSON },
    { key: "active", label: "Activo", type: FIELD.BOOL },
  ],
};

export default hosts;
