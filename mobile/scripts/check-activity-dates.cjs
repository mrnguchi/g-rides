const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../src/utils/activityDates.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
// Reject non-ISO string parsing to catch the engine-dependent behavior that
// caused Invalid Date on mobile, even when running this regression check in Node.
class StrictDate extends Date {
  constructor(...args) {
    if (args.length === 1 && typeof args[0] === 'string' && !/^\d{4}-\d{2}-\d{2}T/.test(args[0])) throw new Error('Non-ISO Date parsing');
    super(...args);
  }
}
const result = {};
new Function('exports', 'Date', compiled)(result, StrictDate);
const { activityDateKey, parseActivityDate } = result;
assert.equal(activityDateKey('Aug 9, 2026'), '2026-08-09');
assert.equal(activityDateKey('Fri, Oct 2, 2026'), '2026-10-02');
assert.equal(activityDateKey('2026-10-02'), '2026-10-02');
assert.equal(activityDateKey('September 27, 2026'), '2026-09-27');
assert.ok(parseActivityDate('2026-09-27T12:00:00.000Z'));
assert.equal(activityDateKey('Feb 29, 2024'), '2024-02-29');
for (const invalid of ['', 'bad date', 'NaN-NaN-NaN', 'Feb 29, 2026', '2026-13-01', '2026-04-31']) {
  assert.equal(parseActivityDate(invalid), null);
  assert.equal(activityDateKey(invalid), 'undated');
}
console.log('Activity date checks passed.');
