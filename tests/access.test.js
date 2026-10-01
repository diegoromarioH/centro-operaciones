import test from 'node:test';
import assert from 'node:assert/strict';
import { panelAccess, hostPayload } from '../src/auth/access.js';

test('only active administrators enter the superpanel', () => {
  for (const role of ['admin', 'super_admin']) assert.equal(panelAccess({ role, active: true }), 'admin');
  assert.equal(panelAccess({ role: 'host', active: true }), 'host');
  for (const role of ['admin', 'super_admin', 'host', 'viewer', 'editor', 'support', 'marketing']) {
    assert.equal(panelAccess({ role, active: false }), 'denied');
  }
  assert.equal(panelAccess(null), 'denied');
  assert.equal(panelAccess({ role: 'unknown', active: true }), 'denied');
});
test('host edits cannot change publication or administrative fields', () => {
  assert.deepEqual(hostPayload({ name: 'Hotel', price_from: 70, active: true, featured: true, slug: 'other', created_by: 'other', metadata: { role: 'admin' } }), { name: 'Hotel', price_from: 70 });
});
