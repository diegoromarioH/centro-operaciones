import React from 'react';
import { FIELD } from '../lib/fieldTypes';
import JsonField from './JsonField';
import ImageUploadField from './ImageUploadField';
import GalleryUploadField from './GalleryUploadField';
import AmenitiesChecklistField from './AmenitiesChecklistField';
import PolicyField from './PolicyField';
import IconSelectField from './IconSelectField';
import RichTextField from './RichTextField';

// Dibuja el control correcto según field.type. fkOptions trae las opciones
// ya cargadas para los campos FK (ver DataTable.jsx). tableKey se usa como
// carpeta dentro del bucket de Storage para los campos de imagen/galería.
export default function FieldInput({ field, value, onChange, fkOptions, tableKey }) {
  switch (field.type) {
    case FIELD.TEXTAREA:
      return (
        <textarea
          rows={field.rows || 3}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="ro-input"
        />
      );
    case FIELD.NUMBER:
      return (
        <input
          type="number"
          step="any"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          className="ro-input"
        />
      );
    case FIELD.BOOL:
      return (
        <label className="ro-switch">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
          <span className="ro-switch-track">
            <span className="ro-switch-thumb" />
          </span>
          <span className="ro-switch-label">{value ? 'Sí' : 'No'}</span>
        </label>
      );
    case FIELD.DATE:
      return (
        <input
          type="date"
          value={value ? String(value).slice(0, 10) : ''}
          onChange={(e) => onChange(e.target.value || null)}
          className="ro-input"
        />
      );
    case FIELD.DATETIME:
      return (
        <input
          type="datetime-local"
          value={value ? String(value).slice(0, 16) : ''}
          onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
          className="ro-input"
        />
      );
    case FIELD.TIME:
      return (
        <input type="time" value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="ro-input" />
      );
    case FIELD.JSON:
      return <JsonField value={value} onChange={onChange} />;
    case FIELD.IMAGE:
      return (
        <ImageUploadField
          bucket={field.bucket || 'media'}
          folder={tableKey || 'general'}
          value={value}
          onChange={onChange}
        />
      );
    case FIELD.GALLERY:
      return (
        <GalleryUploadField
          bucket={field.bucket || 'media'}
          folder={tableKey || 'general'}
          value={value}
          onChange={onChange}
        />
      );
    case FIELD.CHECKLIST:
      return <AmenitiesChecklistField field={field} value={value} onChange={onChange} />;
    case FIELD.POLICY:
      return <PolicyField field={field} value={value} onChange={onChange} />;
    case FIELD.ICON_SELECT:
      return <IconSelectField value={value} onChange={onChange} />;
    case FIELD.RICHTEXT:
      return <RichTextField field={field} value={value} onChange={onChange} />;
    case FIELD.ARRAY:
      return (
        <input
          type="text"
          placeholder="separa cada valor con comas"
          value={Array.isArray(value) ? value.join(', ') : value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="ro-input"
        />
      );
    case FIELD.SELECT:
      return (
        <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="ro-input">
          <option value="">Selecciona…</option>
          {field.options.map((opt) => {
            const optValue = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={optValue} value={optValue}>
                {optLabel}
              </option>
            );
          })}
        </select>
      );
    case FIELD.FK: {
      const opts = fkOptions?.[field.key] || [];
      return (
        <select value={value ?? ''} onChange={(e) => onChange(e.target.value || null)} className="ro-input">
          <option value="">— Ninguno —</option>
          {opts.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      );
    }
    default:
      return <input type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="ro-input" />;
  }
}