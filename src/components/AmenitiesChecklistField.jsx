import React from 'react';

// Casillas agrupadas por categoría (baño, comodidades, tecnología...) en vez
// de un campo de texto con comas. Guarda un array plano de los valores
// marcados, igual formato que el campo ARRAY normal — solo cambia cómo se
// captura. field.groups: [{ label, options: [...] }]
export default function AmenitiesChecklistField({ field, value, onChange }) {
  const selected = new Set(Array.isArray(value) ? value : []);

  function toggle(option) {
    const next = new Set(selected);
    if (next.has(option)) next.delete(option);
    else next.add(option);
    onChange(Array.from(next));
  }

  return (
    <div className="ro-checklist">
      {field.groups.map((group) => (
        <div className="ro-checklist-group" key={group.label}>
          <div className="ro-checklist-group-label">{group.label}</div>
          <div className="ro-checklist-options">
            {group.options.map((option) => {
              const active = selected.has(option);
              return (
                <button
                  type="button"
                  key={option}
                  className={`ro-chip ${active ? 'ro-chip-active' : ''}`}
                  onClick={() => toggle(option)}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}