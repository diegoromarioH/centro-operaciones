import { supabase } from './supabaseClient';

export async function uploadPath(folder, filename) {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.user) throw new Error('Inicia sesión para subir imágenes.');
  return `users/${data.session.user.id}/${folder}/${crypto.randomUUID()}-${filename}`;
}
