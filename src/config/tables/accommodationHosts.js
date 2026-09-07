import { Link2 } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const accommodationHosts = {
  key: "accommodation_hosts",
  label: "Alojamiento ↔ Anfitrión",
  icon: Link2,
  group: "Alojamiento",
  path: "/alojamiento/accommodation-hosts",
  orderBy: "created_at",
  ascending: false,
  list: ["accommodation_id", "host_id", "is_primary"],
  columns: [
    { key: "accommodation_id", label: "Alojamiento", type: FIELD.FK, required: true, table: "accommodations", display: "name" },
    { key: "host_id", label: "Anfitrión", type: FIELD.FK, required: true, table: "hosts", display: "display_name" },
    { key: "is_primary", label: "Es el anfitrión principal", type: FIELD.BOOL },
  ],
};

export default accommodationHosts;
