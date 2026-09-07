import React, { useCallback, useRef, useState } from 'react';
import { GripVertical, ImageOff, Loader2, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { resizeImageFile } from '../utils/resizeImage';

const MAX_MB = 8;

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

// Galería de varias fotos para una habitación (o cualquier registro). Guarda
// un array simple de URLs públicas en el campo (p. ej. columna `gallery`
// jsonb). Se puede arrastrar más de un archivo a la vez, quitar cualquiera,
// y reordenarlas arrastrando las miniaturas — la primera es la que se usa
// como portada en las tarjetas de la landing.
export default function GalleryUploadField({ bucket, folder, value, onChange }) {
  const urls = Array.isArray(value) ? value : [];
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const dragIndex = useRef(null);
  const inputRef = useRef(null);

  const uploadFiles = useCallback(
    async (files) => {
      const list = Array.from(files || []).filter((f) => f.type.startsWith('image/'));
      if (!list.length) {
        setError('Solo se permiten imágenes.');
        return;
      }
      const tooBig = list.find((f) => f.size > MAX_MB * 1024 * 1024);
      if (tooBig) {
        setError(`"${tooBig.name}" pesa más de ${MAX_MB}MB.`);
        return;
      }
      setError(null);
      setUploading(true);
      const newUrls = [];
      for (const file of list) {
        const resized = await resizeImageFile(file);
        const path = `${folder}/${Date.now()}-${slugifyFilename(resized.name)}`;
        const { error: uploadError } = await supabase.storage.from(bucket).upload(path, resized, {
          cacheControl: '604800',
          upsert: false,
        });
        if (uploadError) {
          setError(uploadError.message);
          continue;
        }
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        newUrls.push(data.publicUrl);
      }
      setUploading(false);
      if (newUrls.length) onChange([...urls, ...newUrls]);
    },
    [bucket, folder, urls, onChange]
  );

  function removeAt(idx) {
    onChange(urls.filter((_, i) => i !== idx));
  }

  function onDropReorder(idx) {
    const from = dragIndex.current;
    if (from === null || from === idx) return;
    const next = [...urls];
    const [moved] = next.splice(from, 1);
    next.splice(idx, 0, moved);
    onChange(next);
    dragIndex.current = null;
  }

  return (
    <div>
      {urls.length > 0 && (
        <div className="ro-gallery-grid">
          {urls.map((url, idx) => (
            <div
              key={url + idx}
              className="ro-gallery-item"
              draggable
              onDragStart={() => { dragIndex.current = idx; }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDropReorder(idx)}
            >
              <img src={url} alt="" onError={(e) => { e.currentTarget.style.opacity = 0.3; }} />
              {idx === 0 && <span className="ro-gallery-cover-badge">Portada</span>}
              <div className="ro-gallery-item-actions">
                <span className="ro-gallery-drag"><GripVertical size={13} /></span>
                <button type="button" className="ro-gallery-remove" onClick={() => removeAt(idx)}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        className={`ro-dropzone ro-dropzone-compact ${dragOver ? 'ro-dropzone-active' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); uploadFiles(e.dataTransfer.files); }}
      >
        {uploading ? (
          <>
            <Loader2 size={18} className="ro-spin" />
            <span>Subiendo…</span>
          </>
        ) : (
          <>
            <Plus size={18} />
            <span>Agregar fotos (puedes elegir varias a la vez)</span>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="ro-hidden-input"
        onChange={(e) => uploadFiles(e.target.files)}
      />
      {error && (
        <div className="ro-field-error">
          <ImageOff size={13} /> {error}
        </div>
      )}
    </div>
  );
}