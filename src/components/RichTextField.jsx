import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bold, Italic, Heading2, Heading3, List, Link2, Image as ImageIcon, Loader2, Eraser } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { resizeImageFile } from '../utils/resizeImage';

function slugifyFilename(name) {
  const dot = name.lastIndexOf('.');
  const base = dot > -1 ? name.slice(0, dot) : name;
  const ext = dot > -1 ? name.slice(dot + 1).toLowerCase() : 'jpg';
  const clean = base
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
  return `${clean || 'imagen'}.${ext}`;
}

// Editor de texto enriquecido basado en contentEditable + document.execCommand.
// No depende de ninguna librería externa (nada que instalar). Guarda y
// recibe HTML directamente — coincide con lo que espera la columna
// content_html en blog_posts. El botón de imagen sube el archivo al mismo
// bucket de Storage que usa el resto del panel (bucket "blog") e inserta la
// imagen en el punto del cursor.
export default function RichTextField({ field, value, onChange }) {
  const ref = useRef(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || '')) {
      ref.current.innerHTML = value || '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sync = useCallback(() => {
    if (ref.current) onChange(ref.current.innerHTML);
  }, [onChange]);

  function exec(cmd, arg) {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    sync();
  }

  function addLink() {
    const url = window.prompt('Enlace (https://...)');
    if (!url) return;
    exec('createLink', url);
  }

  async function addImage(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    const bucket = field.bucket || 'blog';
    const resized = await resizeImageFile(file);
    const path = `content/${Date.now()}-${slugifyFilename(resized.name)}`;
    const { error } = await supabase.storage.from(bucket).upload(path, resized, { cacheControl: '604800', upsert: false });
    setUploading(false);
    if (error) {
      window.alert('No se pudo subir la imagen: ' + error.message);
      return;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    exec('insertImage', data.publicUrl);
  }

  return (
    <div className="ro-richtext">
      <div className="ro-richtext-toolbar">
        <button type="button" onClick={() => exec('bold')} title="Negrita"><Bold size={15} /></button>
        <button type="button" onClick={() => exec('italic')} title="Cursiva"><Italic size={15} /></button>
        <button type="button" onClick={() => exec('formatBlock', 'H2')} title="Título grande"><Heading2 size={15} /></button>
        <button type="button" onClick={() => exec('formatBlock', 'H3')} title="Título mediano"><Heading3 size={15} /></button>
        <button type="button" onClick={() => exec('insertUnorderedList')} title="Lista"><List size={15} /></button>
        <button type="button" onClick={addLink} title="Insertar enlace"><Link2 size={15} /></button>
        <label className="ro-richtext-imgbtn" title="Insertar imagen">
          {uploading ? <Loader2 size={15} className="ro-spin" /> : <ImageIcon size={15} />}
          <input type="file" accept="image/*" className="ro-hidden-input" onChange={addImage} />
        </label>
        <button type="button" onClick={() => exec('removeFormat')} title="Quitar formato"><Eraser size={15} /></button>
      </div>
      <div
        ref={ref}
        className="ro-richtext-body"
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        onBlur={sync}
        data-placeholder="Escribe el contenido del artículo…"
      />
    </div>
  );
}