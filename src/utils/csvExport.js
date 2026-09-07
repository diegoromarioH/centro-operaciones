// Exporta un arreglo de objetos a un archivo .csv y dispara la descarga en
// el navegador. Reutilizable para cualquier tabla del panel, no solo
// suscriptores.
function csvEscape(value) {
  if (value === null || value === undefined) return '';
  let str = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (/[",\n]/.test(str)) str = '"' + str.replace(/"/g, '""') + '"';
  return str;
}

export function exportToCSV(filename, rows, columns) {
  if (!rows.length) return;
  const header = columns.map((c) => csvEscape(c.label)).join(',');
  const body = rows.map((row) => columns.map((c) => csvEscape(row[c.key])).join(',')).join('\n');
  const csv = '\uFEFF' + header + '\n' + body; // BOM para que Excel abra bien los acentos
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : filename + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}