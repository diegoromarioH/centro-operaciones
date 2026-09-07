import { Bike } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const motorcycles = {
  key: "motorcycles",
  label: "Motos",
  icon: Bike,
  group: "Movilidad",
  path: "/movilidad/motorcycles",
  orderBy: "sort_order",
  ascending: true,
  imageField: "main_image_url",
  list: ["name", "motorcycle_type", "price_from", "active", "featured"],
  columns: [
    { key: "name", label: "Nombre", type: FIELD.TEXT, required: true },
    { key: "slug", label: "Slug", type: FIELD.TEXT, required: true },
    { key: "motorcycle_type", label: "Tipo", type: FIELD.SELECT, options: ["Scooter automática", "Motocicleta manual", "Cuatrimoto", "Bicicleta eléctrica"] },
    { key: "description", label: "Descripción", type: FIELD.TEXTAREA },
    { key: "capacity", label: "Capacidad (personas)", type: FIELD.NUMBER },
    { key: "requirements", label: "Requisitos", type: FIELD.ARRAY },
    { key: "price_from", label: "Precio desde", type: FIELD.NUMBER },
    { key: "currency", label: "Moneda", type: FIELD.TEXT },
    { key: "main_image_url", label: "Imagen principal", type: FIELD.IMAGE, bucket: "media" },
    { key: "active", label: "Activo", type: FIELD.BOOL },
    { key: "featured", label: "Destacado", type: FIELD.BOOL },
    { key: "sort_order", label: "Orden", type: FIELD.NUMBER },
    { key: "metadata", label: "Metadata (JSON)", type: FIELD.JSON },
  ],
};

export default motorcycles;
