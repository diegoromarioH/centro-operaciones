import test from 'node:test';
import assert from 'node:assert/strict';
import {listingIssues,editableSubmission} from '../src/utils/listingWorkflow.js';
const complete={name:'Casa',accommodation_type:'Casa',description:'Casa en Ometepe',address:'Moyogalpa',zone:'Moyogalpa',main_image_url:'https://example.com/foto.jpg',currency:'USD',price_from:40,payment_policy:'Efectivo al llegar',cancellation_policy:'48 horas'};
test('La revisión exige información comercial y políticas, permite borradores incompletos',()=>{assert.deepEqual(listingIssues(complete),[]);assert.ok(listingIssues({name:'Casa'}).includes('Forma de pago directo'));});
test('Rechaza precios inválidos y depósitos fuera del acuerdo',()=>{for(const price_from of [-1,0,'x',Infinity])assert.ok(listingIssues({...complete,price_from}).length);assert.ok(listingIssues({...complete,deposit_required:true,deposit_percent:101}).length);assert.deepEqual(listingIssues({...complete,deposit_required:true,deposit_percent:25}),[]);});
test('Solo borradores y cambios solicitados pueden editarse',()=>{assert.equal(editableSubmission('draft'),true);assert.equal(editableSubmission('changes_requested'),true);for(const s of ['approved','submitted','rejected','unexpected'])assert.equal(editableSubmission(s),false);});
