import React, { useState } from 'react';
import { AlertCircle, Loader2, Save, X } from 'lucide-react';
import { FIELD } from '../lib/fieldTypes';
import FieldInput from './FieldInput';

// Formulario de crear/editar. Se monta con key={record?.id || 'new'} para
// que cada apertura arranque con estado limpio.
// variant="modal" (por defecto): se muestra flotando sobre un overlay.
// variant="inline": se muestra como una tarjeta normal dentro de la página
// (usado por AccommodationsPage para editar el alojamiento sin salir de la vista).
export default function EditForm({ table, record, fkOptions, onCancel, onSave, saving, variant = 'modal' }) {
  const [values, setValues] = useState(() => {
    const init = {};
    table.columns.forEach((c) => {
      // Al crear (record=null) todo arranca en null, incluidos los BOOL —
      // así, si el usuario no toca el campo, no lo mandamos y la base de
      // datos aplica su propio valor por defecto (currency, active,
      // amenities:'{}', etc.) en vez de que nosotros forcemos uno propio
      // que puede chocar con columnas NOT NULL.
      init[c.key] = record ? record[c.key] : null;
    });
    return init;
  });
  const [missing, setMissing] = useState([]);

  function setField(key, val) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...values };
    const missingFields = [];
    table.columns.forEach((c) => {
      if (c.type === FIELD.ARRAY && typeof payload[c.key] === 'string') {
        payload[c.key] = payload[c.key]
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (c.required && (payload[c.key] === null || payload[c.key] === undefined || payload[c.key] === '')) {
        missingFields.push(c.label);
      }
    });
    if (missingFields.length) {
      setMissing(missingFields);
      return;
    }
    setMissing([]);
    // Al crear un registro nuevo, cualquier campo que quedó en null (nunca
    // tocado) se quita del payload en vez de mandarse como NULL explícito.
    // Muchas columnas son NOT NULL con un valor por defecto (currency,
    // active, amenities, metadata…) y mandar null ahí rompe el insert
    // aunque el campo no fuera obligatorio. Al editar sí se respeta el
    // null, porque puede ser una limpieza intencional de un campo existente.
    if (!record) {
      Object.keys(payload).forEach((k) => {
        if (payload[k] === null) delete payload[k];
      });
    }
    onSave(payload);
  }

  const form = (
    <form className={variant === 'inline' ? 'ro-modal ro-inline-card' : 'ro-modal'} onSubmit={handleSubmit}>
      <div className="ro-modal-header">
        <h3>{record ? `Editar ${table.label.toLowerCase()}` : `Nuevo registro — ${table.label}`}</h3>
        {variant === 'modal' && (
          <button type="button" className="ro-icon-btn" onClick={onCancel}>
            <X size={18} />
          </button>
        )}
      </div>
      <div className="ro-modal-body">
        {missing.length > 0 && (
          <div className="ro-alert">
            <AlertCircle size={15} /> Completa los campos requeridos: {missing.join(', ')}
          </div>
        )}
        {table.columns.map((field) => (
          <div className="ro-field" key={field.key}>
            <label htmlFor={field.key}>
              {field.label}
              {field.required && <span className="ro-required">*</span>}
            </label>
            <FieldInput
              field={field}
              value={values[field.key]}
              onChange={(v) => setField(field.key, v)}
              fkOptions={fkOptions}
              tableKey={table.key}
            />
          </div>
        ))}
      </div>
      <div className="ro-modal-footer">
        {variant === 'modal' && (
          <button type="button" className="ro-btn ro-btn-ghost" onClick={onCancel}>
            Cancelar
          </button>
        )}
        <button type="submit" className="ro-btn ro-btn-primary" disabled={saving}>
          {saving ? <Loader2 size={16} className="ro-spin" /> : <Save size={16} />}
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  );

  if (variant === 'inline') return form;

  return (
    <div className="ro-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      {form}
    </div>
  );
}