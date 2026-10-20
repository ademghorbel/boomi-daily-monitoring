const test = require('node:test');
const assert = require('node:assert');
const { daysBack, reportWindow, statusIcon } = require('./rules');

const d = (s) => new Date(`${s}T12:00:00Z`);
const holidays = new Set(['2026-07-14']);

test('normal weekday covers one day', () => {
  assert.strictEqual(daysBack(d('2026-07-08'), holidays), 1);
});

test('Monday covers Friday to Monday', () => {
  assert.strictEqual(daysBack(d('2026-07-06'), holidays), 3);
});

test('day after a French holiday merges the skipped day', () => {
  assert.strictEqual(daysBack(d('2026-07-15'), holidays), 2);
});

test('window is 08:00 Paris to 08:00 Paris (summer time = 06:00 UTC)', () => {
  const { start, end } = reportWindow(d('2026-07-08'), holidays);
  assert.strictEqual(start.toISOString(), '2026-07-07T06:00:00.000Z');
  assert.strictEqual(end.toISOString(), '2026-07-08T06:00:00.000Z');
});

test('window handles winter time (07:00 UTC)', () => {
  const { end } = reportWindow(d('2026-11-03'), holidays);
  assert.strictEqual(end.toISOString(), '2026-11-03T07:00:00.000Z');
});

const at = (h) => new Date(Date.UTC(2026, 6, 7, h));

test('icons', () => {
  assert.strictEqual(statusIcon([{ status: 'OK', at: at(1) }]), '☀');
  assert.strictEqual(statusIcon([{ status: 'KO', at: at(1) }, { status: 'OK', at: at(2) }]), '⛅');
  assert.strictEqual(statusIcon([{ status: 'OK', at: at(1) }, { status: 'KO', at: at(2) }]), '❌');
  assert.strictEqual(statusIcon([], 1), '⚠');
});
