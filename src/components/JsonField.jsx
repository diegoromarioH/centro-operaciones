import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

// Textarea que edita un valor JSON como texto plano, y solo llama a onChange
// cuando el contenido es JSON válido. Mientras es inválido, muestra el error
// y no propaga el cambio, para no guardar datos corruptos.
export default function JsonField({ value, onChange }) {
  const [text, setText] = useState(() => {
    try {
      return JSON.stringify(value ?? {}, null, 2);
    } catch {
      return '{}';
    }
  });
  const [err, setErr] = useState(null);

  function handleChange(e) {
    const t = e.target.value;
    setText(t);
    try {
      const parsed = JSON.parse(t);
      setErr(null);
      onChange(parsed);
    } catch {
      setErr('JSON inválido: los cambios no se guardarán hasta que sea válido.');
    }
  }

  return (
    <div>
      <textarea rows={6} value={text} onChange={handleChange} className={`ro-input ro-mono ${err ? 'ro-input-error' : ''}`} />
      {err && (
        <div className="ro-field-error">
          <AlertCircle size={13} /> {err}
        </div>
      )}
    </div>
  );
}
