// Tipos de campo que puede tener una columna. Cada tabla en src/config/tables/
// declara sus columnas usando estos tipos, y FieldInput.jsx sabe cómo dibujar
// el control correcto para cada uno.
export const FIELD = {
  TEXT: 'text',
  TEXTAREA: 'textarea',
  NUMBER: 'number',
  BOOL: 'bool',
  DATE: 'date',
  DATETIME: 'datetime',
  TIME: 'time',
  JSON: 'json',
  ARRAY: 'array',
  SELECT: 'select',
  FK: 'fk',
  IMAGE: 'image',
  GALLERY: 'gallery', // varias fotos (arrastrar/soltar múltiple), guarda un array de URLs
  CHECKLIST: 'checklist', // casillas agrupadas por categoría, guarda un array de valores
  POLICY: 'policy', // plantillas predefinidas seleccionables + texto final editable (un solo campo de texto en la BD)
  ICON_SELECT: 'icon_select', // selector visual de un ícono Lucide de una lista curada; guarda el nombre del ícono (texto)
};