const fs = require('fs');
const path = require('path');
const s7 = require('nodes7');

const conn = new s7();
const host = process.argv[2] || '192.168.10.3';
const csvPath = path.join(__dirname, 'logo-names.csv');
const outJson = path.join(__dirname, 's7-autoprobe-results.json');
const outCsv = path.join(__dirname, 's7-autoprobe-results.csv');

if (!fs.existsSync(csvPath)) {
  console.error('logo-names.csv not found in scripts/');
  process.exit(1);
}

const lines = fs.readFileSync(csvPath, 'utf8').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
// skip header if present
if (lines[0].toLowerCase().startsWith('connector')) lines.shift();
const names = lines.map(l => l.replace(/,$/, '').trim());

// candidate address generators
function candidatesFor(name) {
  const res = [];
  // common LOGO variants: M, Q, I, AI, AQ, V, VW, MW, DBW, DBX
  // heuristics: numeric suffix
  const base = name.replace(/[^0-9A-Za-z\.]/g, '');
  const digits = base.match(/(\d+)$/);
  const num = digits ? digits[1] : null;

  // raw name as first attempt
  res.push(name);
  if (num) {
    // MB/MW/VW/AI/AQ/DBW variants
    res.push(`MW${num}`);
    res.push(`VW${num}`);
    res.push(`V${num}.0`);
    res.push(`V${num}`);
    res.push(`M${num}`);
    res.push(`Q${num}`);
    res.push(`AI${num}`);
    res.push(`AQ${num}`);
  }
  // some names like S1.1 might map to V8.x; include a couple generic tries
  if (name.includes('.')) {
    res.push(name.replace('.', '_'));
    res.push(name.replace('.', ''));
  }
  // deduplicate maintaining order
  return [...new Set(res)];
}

console.log('Starting autoprobe for', host, 'names:', names.length);

// connect
conn.initiateConnection({ host, port: 102, rack: 0, slot: 1 }, (err) => {
  if (err) { console.error('Connection failed', err); process.exit(2); }
  console.log('S7 connected to', host);

  const results = [];

  (async function runAll() {
    for (const name of names) {
      const cands = candidatesFor(name);
      let found = null;
      for (const cand of cands) {
        // try translationCB temporarily
        conn.setTranslationCB((tag) => cand);
        try {
          await new Promise((res, rej) => {
            conn.addItems(['PROBE_TMP'], (err) => {
              // ignore add err
              conn.readAllItems((err2, vals) => {
                if (err2) return res(null);
                const v = vals['PROBE_TMP'];
                // treat defined/non-null as success
                return res(v !== undefined ? v : null);
              });
            });
          }).then((val) => {
            if (val !== null) {
              found = { name, candidate: cand, value: val };
            }
          });
        } catch (e) {
          // ignore
        }
        // cleanup PROBE_TMP to avoid growing list
        try { conn.delItems(['PROBE_TMP']); } catch (e) {}
        if (found) break;
      }
      if (!found) results.push({ name, match: null }); else results.push({ name, match: found.candidate, value: found.value });
      console.log(`${name} -> ${found ? found.candidate : 'NO MATCH'}`);
    }

    fs.writeFileSync(outJson, JSON.stringify(results, null, 2));
    const csv = ['name,match,value', ...results.map(r => `${r.name},${r.match||''},${r.value||''}`)].join('\n');
    fs.writeFileSync(outCsv, csv);
    console.log('Finished. Results saved to', outJson, outCsv);
    process.exit(0);
  })();
});
