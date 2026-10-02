export function panelAccess(profile) {
  if (!profile?.active) return 'denied';
  if (['admin', 'super_admin'].includes(profile.role)) return 'admin';
  return profile.role === 'host' ? 'host' : 'denied';
}

export const HOST_FIELDS = new Set([
  'name', 'accommodation_type', 'short_description', 'description', 'amenities', 'ideal_for', 'views',
  'zone', 'municipality', 'address', 'latitude', 'longitude', 'map_embed_url', 'price_from', 'currency',
  'deposit_required', 'deposit_percent', 'payment_policy', 'check_in_time', 'check_out_time',
  'reservation_policy', 'cancellation_policy', 'refund_policy', 'children_policy', 'pet_policy',
  'smoking_policy', 'events_policy', 'main_image_url', 'video_url',
]);

export function hostPayload(payload) {
  return Object.fromEntries(Object.entries(payload).filter(([key]) => HOST_FIELDS.has(key)));
}
