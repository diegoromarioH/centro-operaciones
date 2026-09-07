import { Building2 } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const accommodations = {
  key: "accommodations",
  label: "Alojamientos",
  icon: Building2,
  group: "Alojamiento",
  path: "/alojamiento/accommodations",
  orderBy: "name",
  ascending: true,
  imageField: "main_image_url",
  list: ["name", "accommodation_type", "zone", "price_from", "active", "featured"],
  columns: [
    { key: "name", label: "Nombre", type: FIELD.TEXT, required: true, section: "basico" },
    { key: "slug", label: "Slug (URL)", type: FIELD.TEXT, required: true, section: "basico" },
    { key: "accommodation_type", label: "Tipo", type: FIELD.SELECT, options: ["Hotel", "Hostel", "Cabañas", "Eco Lodge", "Apartamento", "Casa", "Resort"], section: "basico" },
    { key: "short_description", label: "Descripción corta", type: FIELD.TEXT, section: "basico" },
    { key: "description", label: "Descripción completa", type: FIELD.TEXTAREA, rows: 5, section: "basico" },
    { key: "amenities", label: "Amenidades", type: FIELD.CHECKLIST, section: "basico", groups: [
      { label: "Conectividad y clima", options: ["WiFi gratis", "Aire acondicionado", "Ventilador", "TV por cable", "Calefacción"] },
      { label: "Cocina", options: ["Cocina equipada", "Refrigeradora", "Cafetera", "Microondas", "Utensilios de cocina"] },
      { label: "Baño y confort", options: ["Agua caliente", "Secadora de pelo", "Toallas y sábanas", "Artículos de aseo"] },
      { label: "Exterior y recreación", options: ["Piscina", "Jardín", "Terraza", "Hamacas", "Parqueo gratuito", "BBQ / parrilla"] },
      { label: "Servicios", options: ["Desayuno incluido", "Limpieza diaria", "Recepción 24 horas", "Caja fuerte", "Lavandería", "Traslados"] },
    ] },
    { key: "ideal_for", label: "Ideal para", type: FIELD.CHECKLIST, section: "basico", groups: [
      { label: "Ideal para", options: ["Parejas", "Familias", "Grupos de amigos", "Viajeros solos", "Mochileros", "Luna de miel", "Trabajo remoto", "Aventureros", "Retiro y relax"] },
    ] },
    { key: "views", label: "Vistas", type: FIELD.CHECKLIST, section: "basico", groups: [
      { label: "Vistas", options: ["Vista al lago", "Vista al volcán", "Vista al jardín", "Vista a la piscina", "Vista a la montaña", "Sin vista específica"] },
    ] },
    { key: "zone", label: "Zona", type: FIELD.TEXT, section: "ubicacion" },
    { key: "municipality", label: "Municipio", type: FIELD.TEXT, section: "ubicacion" },
    { key: "address", label: "Dirección", type: FIELD.TEXT, section: "ubicacion" },
    { key: "latitude", label: "Latitud", type: FIELD.NUMBER, section: "ubicacion" },
    { key: "longitude", label: "Longitud", type: FIELD.NUMBER, section: "ubicacion" },
    { key: "map_embed_url", label: "Mapa (embed)", type: FIELD.TEXT, section: "ubicacion" },
    { key: "price_from", label: "Precio desde", type: FIELD.NUMBER, section: "precios" },
    { key: "currency", label: "Moneda", type: FIELD.SELECT, options: [{ value: "USD", label: "Dólar estadounidense (USD)" }, { value: "NIO", label: "Córdoba nicaragüense (NIO)" }], section: "precios" },
    { key: "deposit_required", label: "Requiere depósito", type: FIELD.BOOL, section: "precios" },
    { key: "deposit_percent", label: "Porcentaje de depósito", type: FIELD.NUMBER, section: "precios" },
    { key: "payment_policy", label: "Política de pago", type: FIELD.POLICY, section: "precios", presets: [
      { label: "Depósito + saldo al llegar", text: "Se requiere un depósito para confirmar la reserva; el saldo se paga al momento del check-in en efectivo o transferencia." },
      { label: "Pago completo por adelantado", text: "Pago completo por adelantado mediante transferencia bancaria o plataforma de pago en línea." },
    ] },
    { key: "check_in_time", label: "Hora de check-in", type: FIELD.TIME, section: "politicas" },
    { key: "check_out_time", label: "Hora de check-out", type: FIELD.TIME, section: "politicas" },
    { key: "reservation_policy", label: "Política de reserva", type: FIELD.POLICY, section: "politicas", presets: [
      { label: "Confirmación tras contacto", text: "Reserva confirmada tras validar disponibilidad y datos del huésped. Reserva Ometepe se pone en contacto para coordinar los detalles finales antes de confirmar." },
      { label: "Confirmación con depósito", text: "Reserva sujeta a disponibilidad al momento de la solicitud. Se confirma únicamente tras el pago del depósito acordado." },
    ] },
    { key: "cancellation_policy", label: "Política de cancelación", type: FIELD.POLICY, section: "politicas", presets: [
      { label: "Flexible", text: "Cancelación gratuita hasta 48 horas antes del check-in. Después de ese plazo se cobra la primera noche." },
      { label: "Moderada", text: "Cancelación gratuita hasta 7 días antes del check-in. Cancelaciones posteriores no son reembolsables." },
      { label: "Estricta", text: "No reembolsable. Los cambios de fecha están sujetos a disponibilidad y a un cargo adicional." },
    ] },
    { key: "refund_policy", label: "Política de reembolso", type: FIELD.POLICY, section: "politicas", presets: [
      { label: "Reembolso en 5-10 días", text: "Los reembolsos aplicables se procesan en un plazo de 5 a 10 días hábiles al mismo método de pago utilizado." },
      { label: "Solo reprogramación", text: "No se realizan reembolsos; solo se ofrece reprogramación sujeta a disponibilidad." },
    ] },
    { key: "children_policy", label: "Política de niños", type: FIELD.POLICY, section: "politicas", presets: [
      { label: "Se aceptan niños", text: "Se aceptan niños de todas las edades. Pueden aplicar cargos adicionales según edad y ocupación de la habitación." },
      { label: "Solo adultos", text: "Alojamiento pensado para adultos; no se aceptan menores de edad." },
    ] },
    { key: "pet_policy", label: "Política de mascotas", type: FIELD.POLICY, section: "politicas", presets: [
      { label: "Se aceptan con cargo", text: "Se aceptan mascotas pequeñas con cargo adicional, previa coordinación." },
      { label: "No se aceptan", text: "No se permiten mascotas." },
    ] },
    { key: "smoking_policy", label: "Política de fumado", type: FIELD.POLICY, section: "politicas", presets: [
      { label: "Zonas designadas", text: "Prohibido fumar en habitaciones y áreas cerradas. Existen zonas exteriores designadas." },
      { label: "100% libre de humo", text: "Propiedad 100% libre de humo, incluyendo áreas exteriores." },
    ] },
    { key: "events_policy", label: "Política de eventos", type: FIELD.POLICY, section: "politicas", presets: [
      { label: "No se permiten", text: "No se permiten eventos ni fiestas privadas sin autorización previa." },
      { label: "Con autorización", text: "Se permiten eventos pequeños con autorización y cargo adicional; consultar disponibilidad." },
    ] },
    { key: "main_image_url", label: "Imagen principal", type: FIELD.IMAGE, bucket: "accommodations", section: "multimedia" },
    { key: "video_url", label: "Video (URL)", type: FIELD.TEXT, section: "multimedia" },
    { key: "rating", label: "Calificación", type: FIELD.NUMBER, section: "config" },
    { key: "review_count", label: "Cantidad de reseñas", type: FIELD.NUMBER, section: "config" },
    { key: "active", label: "Activo (visible en la landing)", type: FIELD.BOOL, section: "config" },
    { key: "featured", label: "Destacado", type: FIELD.BOOL, section: "config" },
    { key: "sort_order", label: "Orden", type: FIELD.NUMBER, section: "config" },
    { key: "metadata", label: "Metadata (JSON)", type: FIELD.JSON, section: "config" },
  ],
  sections: [
    { key: "basico", label: "Información básica" },
    { key: "ubicacion", label: "Ubicación" },
    { key: "precios", label: "Precios y depósito" },
    { key: "politicas", label: "Políticas" },
    { key: "multimedia", label: "Multimedia" },
    { key: "config", label: "Visibilidad y config" },
  ],
};

export default accommodations;