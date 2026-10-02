export const SUBMISSION_LABELS = {draft:'Borrador',submitted:'En revisión',changes_requested:'Cambios solicitados',approved:'Aprobado',rejected:'Rechazado'};
export function listingIssues(p = {}) {
 const fields = {name:'Nombre',accommodation_type:'Tipo de alojamiento',description:'Descripción',address:'Dirección',zone:'Zona',main_image_url:'Foto principal',currency:'Moneda',payment_policy:'Forma de pago directo',cancellation_policy:'Política de cancelación'};
 const issues=Object.entries(fields).filter(([k])=>!String(p[k]??'').trim()).map(([,label])=>label);
 if(!Number.isFinite(Number(p.price_from)) || Number(p.price_from)<=0)issues.push('Precio por noche mayor que cero');
 if(p.currency && !['USD','NIO'].includes(p.currency))issues.push('Moneda USD o NIO');
 if(p.deposit_required && (!Number.isFinite(Number(p.deposit_percent)) || Number(p.deposit_percent)<=0 || Number(p.deposit_percent)>100))issues.push('Depósito entre 1 y 100%');
 return issues;
}
export function editableSubmission(status) {return ['draft','changes_requested'].includes(status);}
