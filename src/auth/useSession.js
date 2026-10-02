import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// undefined = todavía cargando, null = sin sesión, objeto = con sesión.
export function useSession() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data, error }) => { if (active) setSession(error ? null : data.session); }).catch(() => { if (active) setSession(null); });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  return session;
}

