import { supabase } from './supabaseClient';

// Este servicio no reemplaza los datos de respaldo del código (DATA.hotels /
// DATA.motos en main.jsx) — los complementa. Si Supabase responde con datos,
// App() los usa; si falla o está vacío, la landing sigue mostrando el
// respaldo como hasta ahora. Así nunca se rompe la página por falta de
// contenido en la base de datos.

function buildDepositText(row) {
  if (!row) return 'Anticipo configurable según el alojamiento.';
  if (!row.deposit_required) return 'No requiere anticipo obligatorio.';
  const pct = row.deposit_percentage;
  return pct ? `Requiere anticipo de aproximadamente ${pct}%.` : 'Requiere anticipo. Monto sujeto a confirmación.';
}

function mapAccommodation(row, roomsByAcc, policyByAcc, primaryHostByAcc) {
  const rooms = roomsByAcc.get(row.id) || [];
  const policy = policyByAcc.get(row.id);
  const hostName = primaryHostByAcc.get(row.id);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    zone: row.zone || row.municipality || '',
    type: row.accommodation_type || 'Alojamiento',
    price: row.price_from ?? 0,
    available: rooms.length,
    rating: row.rating ?? 0,
    reviews: row.review_count ?? 0,
    img: row.main_image_url || '',
    tags: (row.ideal_for && row.ideal_for.length ? row.ideal_for : row.amenities || []).slice(0, 4),
    amenities: row.amenities || [],
    views: row.views || [],
    host: hostName ? `Anfitrión: ${hostName}` : 'Anfitrión local verificado',
    desc: row.description || row.short_description || '',
    rooms: rooms.map((r) => ({
      name: r.name,
      type: r.room_type || 'Habitación',
      capacity: r.capacity ?? 2,
      beds: r.beds || '',
      price: r.price ?? row.price_from ?? 0,
      amenities: r.amenities || [],
    })),
    policies: {
      reservation: policy?.reservation_policy || row.reservation_policy || 'Solicitud sujeta a confirmación del alojamiento.',
      deposit: buildDepositText(policy),
      cancellation: policy?.cancellation_policy || row.cancellation_policy || 'Consultar condiciones en la propuesta.',
      refund: policy?.refund_policy || row.refund_policy || 'Sujeto a la política confirmada en la propuesta.',
      checkin: policy?.check_in_time || row.check_in_time || '2:00 PM',
      checkout: policy?.check_out_time || row.check_out_time || '11:00 AM',
      pets: policy?.pets_policy || row.pet_policy || 'Consultar antes de reservar',
      children: policy?.children_policy || row.children_policy || 'Consultar antes de reservar',
    },
  };
}

export async function fetchLiveHotels() {
  try {
    const [{ data: accs, error: accErr }, { data: rooms }, { data: policies }, { data: accHosts }] = await Promise.all([
      supabase.from('accommodations').select('*').eq('active', true).order('sort_order', { ascending: true }),
      supabase.from('rooms').select('*').eq('active', true),
      supabase.from('accommodation_policies').select('*'),
      supabase
        .from('accommodation_hosts')
        .select('accommodation_id, is_primary, hosts(display_name)')
        .eq('is_primary', true),
    ]);
    if (accErr || !accs || !accs.length) return null;

    const roomsByAcc = new Map();
    (rooms || []).forEach((r) => {
      if (!roomsByAcc.has(r.accommodation_id)) roomsByAcc.set(r.accommodation_id, []);
      roomsByAcc.get(r.accommodation_id).push(r);
    });

    const policyByAcc = new Map();
    (policies || []).forEach((p) => policyByAcc.set(p.accommodation_id, p));

    const primaryHostByAcc = new Map();
    (accHosts || []).forEach((h) => {
      if (h.hosts?.display_name) primaryHostByAcc.set(h.accommodation_id, h.hosts.display_name);
    });

    return accs.map((row) => mapAccommodation(row, roomsByAcc, policyByAcc, primaryHostByAcc));
  } catch {
    return null;
  }
}

export async function fetchLiveMotorcycles() {
  try {
    const { data, error } = await supabase
      .from('motorcycles')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    if (error || !data || !data.length) return null;
    return data.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      price: row.price_from ?? 0,
      type: row.motorcycle_type || 'Moto',
      img: row.main_image_url || '',
      desc: row.description || '',
    }));
  } catch {
    return null;
  }
}