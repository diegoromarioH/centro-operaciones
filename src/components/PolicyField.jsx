import React from 'react';

// Plantillas de política predefinidas, como el selector de política de
// cancelación de Booking (Flexible / Moderada / Estricta): al elegir una,
// rellena el texto con la redacción estándar, y ese texto queda editable
// por si el alojamiento necesita un matiz distinto. Se guarda como un solo
// campo de texto en la base de datos — la plantilla es solo un punto de
// partida, no una categoría separada.
export default function PolicyField({ field, value, onChange }) {
  return (
    <div className="ro-policy">
      <div className="ro-policy-presets">
        {field.presets.map((p) => (
          <button
            type="button"
            key={p.label}
            className={'ro-policy-chip' + (value === p.text ? ' active' : '')}
            onClick={() => onChange(p.text)}
            title={p.text}
          >
            {p.label}
          </button>
        ))}
      </div>
      <textarea
        rows={3}
        className="ro-input"
        placeholder="Elige una plantilla arriba o escribe la política directamente"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}