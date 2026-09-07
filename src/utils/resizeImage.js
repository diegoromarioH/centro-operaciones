// Redimensiona y comprime una imagen en el navegador (via canvas) antes de
// subirla a Supabase Storage. Evita el problema típico de subir una foto de
// cámara de 4000x3000px para mostrarla en una tarjeta de 280x280 — eso
// desperdicia cientos de KB por imagen y ralentiza la carga de la landing
// para cada visitante.
//
// Mantiene el mismo tipo de archivo si es PNG (para no perder transparencia
// en logos o imágenes con fondo transparente); todo lo demás se comprime
// como JPEG de buena calidad.
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

export function resizeImageFile(file, maxDimension = MAX_DIMENSION) {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      resolve(file);
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { width, height } = img;
      const scale = Math.min(1, maxDimension / Math.max(width, height));
      if (scale >= 1) {
        // Ya es del tamaño adecuado, no hace falta tocarla.
        resolve(file);
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const newName = outType === 'image/jpeg' && !/\.jpe?g$/i.test(file.name)
            ? file.name.replace(/\.[^.]+$/, '.jpg')
            : file.name;
          resolve(new File([blob], newName, { type: outType }));
        },
        outType,
        outType === 'image/jpeg' ? JPEG_QUALITY : undefined
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // si algo falla, sube el archivo original sin tocar
    };
    img.src = url;
  });
}