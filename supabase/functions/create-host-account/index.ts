import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.112.3";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
function randomPassword() {
  return Array.from(crypto.getRandomValues(new Uint8Array(24)), b => b.toString(16).padStart(2, '0')).join('') + 'Aa1!';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return reply({ error: 'Método no permitido.' }, 405);
  const url = Deno.env.get('SUPABASE_URL')!;
  const caller = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });
  let createdUserId: string | null = null;
  let createdHostId: string | null = null;
  try {
    const { data: identity, error: identityError } = await caller.auth.getUser();
    if (identityError || !identity.user) return reply({ error: 'No autenticado.' }, 401);
    const { data: profile, error: profileError } = await admin.from('profiles').select('role,active').eq('id', identity.user.id).single();
    if (profileError || !profile?.active || !['admin','super_admin'].includes(profile.role)) return reply({ error: 'Solo un administrador puede asignar accesos.' }, 403);

    let input;
    try { input = await req.json(); } catch { return reply({ error: 'Solicitud inválida.' }, 400); }
    const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    const display_name = typeof input.display_name === 'string' ? input.display_name.trim() : '';
    const accommodation_id = typeof input.accommodation_id === 'string' ? input.accommodation_id : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !display_name || display_name.length > 200 || !/^[0-9a-f-]{36}$/i.test(accommodation_id)) return reply({ error: 'Completa nombre, correo y alojamiento válidos.' }, 400);
    const phone = typeof input.phone === 'string' ? input.phone.trim().slice(0,60) : null;
    const whatsapp = typeof input.whatsapp === 'string' ? input.whatsapp.trim().slice(0,60) : null;
    const { data: hotel, error: hotelError } = await admin.from('accommodations').select('id').eq('id',accommodation_id).single();
    if (hotelError || !hotel) return reply({ error: 'El alojamiento no existe. Crea su ficha antes de asignar accesos.' }, 400);

    const { data: existing, error: existingError } = await admin.from('profiles').select('id,role,active').eq('email',email).maybeSingle();
    if (existingError) throw existingError;
    let userId: string;
    let temp_password: string | null = null;
    if (existing) {
      if (existing.role !== 'host' || !existing.active) return reply({ error: 'Este correo pertenece a una cuenta inactiva o con otro rol.' }, 409);
      const { data, error } = await admin.auth.admin.getUserById(existing.id);
      if (error || data.user?.email?.toLowerCase() !== email) return reply({ error: 'No se pudo verificar la cuenta existente.' }, 409);
      userId = existing.id;
    } else {
      temp_password = randomPassword();
      const { data, error } = await admin.auth.admin.createUser({ email, password: temp_password, email_confirm: true });
      if (error || !data.user) return reply({ error: error?.message || 'No se pudo crear la cuenta.' }, 400);
      userId = data.user.id; createdUserId = userId;
      const { error: profileUpdateError } = await admin.from('profiles').update({ full_name: display_name, role: 'host', active: true }).eq('id',userId).select('id').single();
      if (profileUpdateError) throw profileUpdateError;
    }
    const { data: existingHosts, error: hostsError } = await admin.from('hosts').select('id,active').eq('user_id', userId).limit(2);
    if (hostsError) throw hostsError;
    if ((existingHosts?.length || 0) > 1) throw new Error('La cuenta tiene responsables duplicados. Revisa sus vínculos antes de continuar.');
    let hostId = existingHosts?.[0]?.id;
    if (hostId && !existingHosts?.[0]?.active) throw new Error('El responsable está inactivo. Reactívalo antes de asignar otro hotel.');
    if (!hostId) {
      const { data, error } = await admin.from('hosts').insert({ display_name,email,phone,whatsapp,user_id:userId,active:true }).select('id').single();
      if (error) throw error;
      hostId = data.id; createdHostId = hostId;
    }
    const { data: primary, error: primaryError } = await admin.from('accommodation_hosts').select('id').eq('accommodation_id',accommodation_id).eq('is_primary',true).limit(1);
    if (primaryError) throw primaryError;
    const { data: link, error: linkLookupError } = await admin.from('accommodation_hosts').select('id').eq('host_id',hostId).eq('accommodation_id',accommodation_id).maybeSingle();
    if (linkLookupError) throw linkLookupError;
    if (!link) {
      const { error } = await admin.from('accommodation_hosts').insert({ accommodation_id,host_id:hostId,is_primary:!primary?.length });
      if (error) throw error;
    }
    return reply({ ok:true,user_id:userId,host_id:hostId,temp_password,existing_account:!createdUserId });
  } catch (error) {
    // Remove only records created by this invocation; never delete an existing account.
    let cleanupFailed = false;
    if (createdHostId) { const { error } = await admin.from('hosts').delete().eq('id',createdHostId); if (error) cleanupFailed = true; }
    if (createdUserId) { const { error } = await admin.auth.admin.deleteUser(createdUserId); if (error) cleanupFailed = true; }
    return reply({ error: cleanupFailed ? 'La asignación falló y requiere revisión del administrador antes de reintentar.' : (error instanceof Error ? error.message : 'No se pudo asignar el acceso.') },500);
  }
});
