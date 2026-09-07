import { FIELD } from '../lib/fieldTypes';

// Recorta y formatea un valor para mostrarlo en una celda de la tabla.
export function fmtCell(value, field) {
  if (value === null || value === undefined || value === '') return '—';
  if (field?.type === FIELD.BOOL) return value ? 'Sí' : 'No';
  if (field?.type === FIELD.JSON) {
    try {
      return JSON.stringify(value).slice(0, 60);
    } catch {
      return String(value);
    }
  }
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value).slice(0, 60);
  const s = String(value);
  return s.length > 60 ? s.slice(0, 60) + '…' : s;
}

// Busca la definición de columna de una tabla por su clave.
export function columnFor(table, key) {
  return table.columns.find((c) => c.key === key) || { key, label: key, type: FIELD.TEXT };
}
