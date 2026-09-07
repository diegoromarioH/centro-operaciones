import React, { useState } from 'react';
import { AlertCircle, Check, Loader2, Save } from 'lucide-react';
import { FIELD } from '../lib/fieldTypes';
import FieldInput from './FieldInput';

// Formulario de alojamiento organizado en pestañas por sección (Información
// básica, Ubicación, Precios, Políticas, Multimedia, Config), como el panel
// de anfitrión de Airbnb o la extranet de Booking, en vez de una lista plana
// de ~35 campos. Se puede guardar desde cualquier pestaña — si falta un
// campo obligatorio en otra sección, se salta ahí automáticamente.
export default function AccommodationForm({ table, record, saving, onSave }) {
  const sections = table.sections || [{ key: 'general', label: 'General' }];
  const [tab, setTab] = useState(sections[0].key);
  const [values, setValues] = useState(() => {
    const init = {};
    table.columns.forEach((c) => {
      init[c.key] = record ? record[c.key] : null;
    });
    return init;
  });
  const [missing, setMissing] = useState([]);

  const columnsBySection = sections.map((s) => ({
    ...s,
    columns: table.columns.filter((c) => (c.section || sections[0].key) === s.key),
  }));

  function setField(key, val) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function sectionIsComplete(sectionCols) {
    return sectionCols.every((c) => {
      const v = values[c.key];
      if (c.type === FIELD.ARRAY || c.type === FIELD.CHECKLIST) return Array.isArray(v) ? v.length > 0 : !!v;
      return v !== null && v !== undefined && v !== '';
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...values };
    const missingFields = [];
    let firstMissingSection = null;
    table.columns.forEach((c) => {
      if (c.type === FIELD.ARRAY && typeof payload[c.key] === 'string') {
        payload[c.key] = payload[c.key].split(',').map((s) => s.trim()).filter(Boolean);
      }
      if (c.required && (payload[c.key] === null || payload[c.key] === undefined || payload[c.key] === '')) {
        missingFields.push(c.label);
        if (!firstMissingSection) firstMissingSection = c.section || sections[0].key;
      }
    });
    if (missingFields.length) {
      setMissing(missingFields);
      setTab(firstMissingSection);
      return;
    }
    setMissing([]);
    if (!record) {
      Object.keys(payload).forEach((k) => {
        if (payload[k] === null) delete payload[k];
      });
    }
    onSave(payload);
  }

  return (
    <form className="ro-modal ro-inline-card ro-otaform" onSubmit={handleSubmit}>
      <div className="ro-otaform-tabs">
        {columnsBySection.map((s) => (
          <button
            type="button"
            key={s.key}
            className={'ro-otaform-tab' + (tab === s.key ? ' active' : '')}
            onClick={() => setTab(s.key)}
          >
            <span className={'ro-otaform-dot' + (sectionIsComplete(s.columns) ? ' done' : '')}>
              {sectionIsComplete(s.columns) ? <Check size={12} /> : ''}
            </span>
            {s.label}
          </button>
        ))}
      </div>

      <div className="ro-modal-body">
        {missing.length > 0 && (
          <div className="ro-alert">
            <AlertCircle size={15} /> Completa los campos requeridos: {missing.join(', ')}
          </div>
        )}
        {columnsBySection
          .find((s) => s.key === tab)
          .columns.map((field) => (
            <div className="ro-field" key={field.key}>
              <label htmlFor={field.key}>
                {field.label}
                {field.required && <span className="ro-required">*</span>}
              </label>
              <FieldInput field={field} value={values[field.key]} onChange={(v) => setField(field.key, v)} tableKey={table.key} />
            </div>
          ))}
      </div>

      <div className="ro-modal-footer ro-otaform-footer">
        <button type="submit" className="ro-btn ro-btn-primary" disabled={saving}>
          {saving ? <Loader2 size={16} className="ro-spin" /> : <Save size={16} />}
          {saving ? 'Guardando…' : record ? 'Guardar cambios' : 'Crear alojamiento'}
        </button>
      </div>
    </form>
  );
}