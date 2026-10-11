// Valida docs/audits/{decisions,events}.json contra record.schema.json
// (Ajv estricto) y asertos de secuencia contigua + active/superseded.
// Uso: node scripts/check-records.mjs — sale con 1 si falla.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const schemaPath = join(root, 'docs/audits/record.schema.json');
const files = [join(root, 'docs/audits/decisions.json'), join(root, 'docs/audits/events.json')];

const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
const ajv = new Ajv2020({
  strict: true,
  allErrors: true,
  validateSchema: true
});
addFormats(ajv);
const validate = ajv.compile(schema);

let failed = false;

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  failed = true;
}

for (const file of files) {
  const data = JSON.parse(readFileSync(file, 'utf8'));
  const rel = file.slice(root.length + 1);

  if (!validate(data)) {
    fail(`${rel}: schema — ${ajv.errorsText(validate.errors, { separator: '; ' })}`);
    continue;
  }

  const { items, kind } = data;
  const ids = new Set();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const expectedSeq = i + 1;
    if (item.sequence !== expectedSeq) {
      fail(`${rel}: sequence ${item.sequence} en índice ${i} (esperado ${expectedSeq})`);
    }
    if (ids.has(item.id)) {
      fail(`${rel}: id duplicado "${item.id}"`);
    }
    ids.add(item.id);

    if (kind === 'decisions' && item.recordType === 'decision') {
      if (item.status === 'superseded' && item.active !== false) {
        fail(`${rel}: decisión superseded "${item.id}" debe tener active: false`);
      }
      if (item.status === 'superseded' && !item.supersededBy) {
        fail(`${rel}: decisión superseded "${item.id}" sin supersededBy`);
      }
      if (item.status === 'aceptada' && item.supersededBy !== null) {
        fail(`${rel}: decisión aceptada "${item.id}" no debe tener supersededBy`);
      }
    }

    if (kind === 'events' && item.recordType === 'event') {
      if (item.kind !== 'alerta' && item.kind !== 'aviso') {
        fail(`${rel}: evento "${item.id}" con kind inválido`);
      }
    }
  }

  if (!failed) {
    console.log(`OK: ${rel} (${items.length} items, kind=${kind})`);
  }
}

if (failed) {
  process.exit(1);
}
