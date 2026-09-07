import { BedDouble } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const rooms = {
  key: "rooms",
  label: "Habitaciones",
  icon: BedDouble,
  group: "Alojamiento",
  path: "/alojamiento/rooms",
  orderBy: "sort_order",
  ascending: true,
  imageField: "main_image_url",
  list: ["accommodation_id", "name", "room_type", "price", "active"],
  columns: [
    { key: "accommodation_id", label: "Alojamiento", type: FIELD.FK, required: true, table: "accommodations", display: "name" },
    { key: "name", label: "Nombre de la habitación", type: FIELD.TEXT, required: true },
    { key: "room_type", label: "Tipo de habitación", type: FIELD.SELECT, options: [
      "Habitación estándar", "Habitación doble", "Habitación familiar", "Suite",
      "Cabaña privada", "Dormitorio compartido (hostal)", "Apartamento completo"] },
    { key: "capacity", label: "Capacidad (huéspedes)", type: FIELD.NUMBER },
    { key: "beds", label: "Configuración de camas", type: FIELD.TEXT },
    { key: "description", label: "Descripción de la habitación", type: FIELD.TEXTAREA },
    { key: "main_image_url", label: "Foto de portada", type: FIELD.IMAGE, bucket: "rooms" },
    { key: "gallery", label: "Galería de fotos adicionales", type: FIELD.GALLERY, bucket: "rooms" },
    {
      key: "amenities", label: "Amenidades de la habitación", type: FIELD.CHECKLIST,
      groups: [
        {
          label: "Baño",
          options: ["Baño privado", "Agua caliente", "Secador de pelo", "Artículos de aseo gratuitos", "Toallas"],
        },
        {
          label: "Comodidades",
          options: ["Aire acondicionado", "Ventilador de techo", "Balcón", "Vista al lago", "Vista al volcán",
                     "Escritorio", "Closet / armario", "Mosquitero"],
        },
        {
          label: "Tecnología",
          options: ["WiFi gratis", "TV por cable", "Caja fuerte", "Enchufes cerca de la cama"],
        },
        {
          label: "Cocina",
          options: ["Cocina equipada", "Refrigeradora", "Cafetera"],
        },
        {
          label: "Extras",
          options: ["No fumadores", "Apto para niños", "Acceso independiente", "Cuna disponible"],
        },
      ],
    },
    { key: "slug", label: "Slug", type: FIELD.TEXT },
    { key: "price", label: "Precio por noche", type: FIELD.NUMBER },
    { key: "currency", label: "Moneda", type: FIELD.TEXT },
    { key: "active", label: "Activo (visible en la landing)", type: FIELD.BOOL },
    { key: "sort_order", label: "Orden", type: FIELD.NUMBER },
    { key: "metadata", label: "Metadata (JSON)", type: FIELD.JSON },
  ],
};

export default rooms;