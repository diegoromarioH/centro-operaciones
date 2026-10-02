import test from 'node:test';
import assert from 'node:assert/strict';
import { chargeBalance, collectionTotals } from '../src/utils/commissionBalance.js';
test('partial payments and reversals preserve outstanding balance',()=>{
 const c={id:'a',amount:'12.30',currency:'USD',status:'open'};
 const p=[{charge_id:'a',amount:'2.10',status:'confirmed'},{charge_id:'a',amount:'3.20',status:'void'},{charge_id:'other',amount:20,status:'confirmed'}];
 assert.deepEqual(chargeBalance(c,p),{paid:2.1,balance:10.2});
 assert.deepEqual(chargeBalance({...c,status:'void'},p),{paid:2.1,balance:0});
});
test('summary never combines USD and NIO or includes cancelled charges',()=>{
 const charges=[{id:'a',amount:10,currency:'USD',status:'open'},{id:'b',amount:300,currency:'NIO',status:'open'},{id:'c',amount:999,currency:'USD',status:'void'}];
 assert.deepEqual(collectionTotals(charges,[{charge_id:'a',amount:10,status:'confirmed'}]),{USD:{issued:10,paid:10,balance:0},NIO:{issued:300,paid:0,balance:300}});
});
