import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// undefined = todavía cargando, null = sin sesión, objeto = con sesión.
export function useSession() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => sub.subscription.unsubscribe();
  }, []);

  return session;
}
