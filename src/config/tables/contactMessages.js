import { MessageSquare } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const contactMessages = {
  key: "contact_messages",
  label: "Mensajes de contacto",
  icon: MessageSquare,
  group: "Config y personas",
  path: "/config/contact-messages",
  orderBy: "created_at",
  ascending: false,
  readOnly: true,
  list: ["type", "name", "email", "created_at"],
  columns: [
    { key: "type", label: "Tipo", type: FIELD.TEXT },
    { key: "name", label: "Nombre", type: FIELD.TEXT },
    { key: "email", label: "Correo", type: FIELD.TEXT },
    { key: "message", label: "Mensaje", type: FIELD.TEXTAREA },
  ],
};

export default contactMessages;
