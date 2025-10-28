const fs = require('fs');
const path = require('path');

const file = process.argv[2] || path.join(__dirname, 'logo-project.lsc');
if (!fs.existsSync(file)) {
  console.error('File not found:', file);
  console.error('Place your LOGO! .lsc export into scripts/logo-project.lsc or pass the path as argument');
  process.exit(1);
}

const content = fs.readFileSync(file, 'utf8');

// Try to detect if it's XML or plain text and extract possible symbol table entries
let names = [];
if (content.trim().startsWith('<')) {
  // simple XML parsing: look for tags like <Symbol> or elements containing Name and Address
  const re = /<Symbol[^>]*>([\s\S]*?)<\/Symbol>/gi;
  let m;
  while ((m = re.exec(content))) {
    const block = m[1];
    const nameMatch = /<Name>([^<]+)<\/Name>/i.exec(block);
    if (nameMatch) names.push(nameMatch[1].trim());
  }
  // fallback: look for Name="..." patterns
  const nameAttrRe = /Name=\"([^\"]+)\"/gi;
  while ((m = nameAttrRe.exec(content))) names.push(m[1]);
} else {
  // plain text: try to find lines like "Label: NAME" or CSV-like lines
  const lines = content.split(/\r?\n/);
  for (const l of lines) {
    const parts = l.split(/[;,\t]/).map(p => p.trim());
    if (parts.length >= 1) {
      const cand = parts[0];
      if (/^[A-Za-z0-9_.]+$/.test(cand) && cand.length <= 40) names.push(cand);
    }
  }
}

// dedupe and write results
names = [...new Set(names)].filter(Boolean);
const outJson = path.join(path.dirname(file), 'logo-project-symbols.json');
fs.writeFileSync(outJson, JSON.stringify(names, null, 2));
console.log('Extracted', names.length, 'symbols to', outJson);
