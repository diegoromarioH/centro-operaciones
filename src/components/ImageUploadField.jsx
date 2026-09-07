import React, { useCallback, useRef, useState } from 'react';
import { ImageOff, Loader2, Trash2, UploadCloud } from 'lucide-react';
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

// Campo de imagen: arrastra o selecciona un archivo, lo sube al bucket de
// Supabase Storage que le corresponde a la tabla, y guarda la URL pública
// resultante como valor del campo. bucket y folder vienen de la config de
// la tabla (field.bucket / table.key).
export default function ImageUploadField({ bucket, folder, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten imágenes.');
        return;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        setError(`La imagen pesa más de ${MAX_MB}MB.`);
        return;
      }
      setError(null);
      setUploading(true);
      const resized = await resizeImageFile(file);
      const path = `${folder}/${Date.now()}-${slugifyFilename(resized.name)}`;
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, resized, {
        cacheControl: '604800',
        upsert: false,
      });
      setUploading(false);
      if (uploadError) {
        setError(uploadError.message);
        return;
      }
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
    },
    [bucket, folder, onChange]
  );

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  }

  return (
    <div>
      {value ? (
        <div className="ro-image-preview">
          <img src={value} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <div className="ro-image-preview-actions">
            <button type="button" className="ro-btn ro-btn-ghost" onClick={() => inputRef.current?.click()}>
              <UploadCloud size={14} /> Cambiar
            </button>
            <button type="button" className="ro-btn ro-btn-ghost ro-icon-btn-danger" onClick={() => onChange(null)}>
              <Trash2 size={14} /> Quitar
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`ro-dropzone ${dragOver ? 'ro-dropzone-active' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          {uploading ? (
            <>
              <Loader2 size={22} className="ro-spin" />
              <span>Subiendo…</span>
            </>
          ) : (
            <>
              <UploadCloud size={22} />
              <span>Arrastra una imagen o haz clic para elegirla</span>
              <span className="ro-dropzone-hint">JPG, PNG o WEBP · hasta {MAX_MB}MB</span>
            </>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="ro-hidden-input"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && (
        <div className="ro-field-error">
          <ImageOff size={13} /> {error}
        </div>
      )}
    </div>
  );
}