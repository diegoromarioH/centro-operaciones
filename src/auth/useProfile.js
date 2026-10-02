import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useProfile(session) {
  const id = session?.user?.id;
  const [state, setState] = useState({ id: null, profile: null, loading: true, error: null });
  const [version, setVersion] = useState(0);
  useEffect(() => {
    if (!id) { setState({ id: null, profile: null, loading: false, error: null }); return; }
    let cancelled = false;
    async function load() {
      setState(prev => prev.id === id && prev.profile ? { ...prev, error: null } : { id, profile: null, loading: true, error: null });
      try {
        const { data: user, error: userError } = await supabase.auth.getUser();
        if (userError || user.user?.id !== id) throw new Error('La sesión no es válida. Vuelve a iniciar sesión.');
        const { data, error } = await supabase.from('profiles').select('id, full_name, role, active').eq('id', id).maybeSingle();
        if (error) throw error;
        if (!cancelled) setState({ id, profile: data, loading: false, error: null });
      } catch (error) {
        if (!cancelled) setState({ id, profile: null, loading: false, error: error.message });
      }
    }
    load();
    const refresh = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', refresh);
    return () => { cancelled = true; document.removeEventListener('visibilitychange', refresh); };
  }, [id, version, session?.access_token]);
  return { ...state, loading: !!id && (state.id !== id || state.loading), retry: () => setVersion(v => v + 1) };
}
