const fs = require('fs');
const path = require('path');

const resultsPath = path.join(__dirname, 's7-autoprobe-results.json');
const mappingOut = path.join(__dirname, 's7-mapping.js');

if (!fs.existsSync(resultsPath)) {
  console.error('No autoprobe results found. Run: npm run s7-autoprobe -- <PLC_IP>');
  process.exit(1);
}
const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

// Build mapping using only entries that have a match
const mapping = {};
for (const r of results) {
  if (r.match) mapping[r.name] = r.match;
}

const content = `// Auto-generated mapping from s7-autoprobe
module.exports = ${JSON.stringify(mapping, null, 2)};
`;
fs.writeFileSync(mappingOut, content);
console.log('Wrote mapping to', mappingOut);
console.log(Object.keys(mapping).length, 'entries written.');
