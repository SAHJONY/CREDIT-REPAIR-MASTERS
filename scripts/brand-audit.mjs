import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const roots = ['app', 'components', 'lib', 'public'];
const textExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json', '.html', '.css', '.md', '.txt']);
const forbidden = [
  /CREDIT REPAIR MASTERS/g,
  /Credit Repair Masters/g,
  /credit repair masters/g
];

const violations = [];

async function walk(root, directory = root) {
  let entries = [];
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(root, path);
      continue;
    }
    if (!textExtensions.has(extname(entry.name))) continue;

    const content = await readFile(path, 'utf8');
    for (const pattern of forbidden) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const line = content.slice(0, match.index).split('\n').length;
        violations.push(`${relative('.', path)}:${line} contains legacy brand "${match[0]}"`);
      }
    }
  }
}

for (const root of roots) await walk(root);

if (violations.length) {
  console.error('New850 brand audit failed:\n' + violations.map((item) => `- ${item}`).join('\n'));
  process.exit(1);
}

console.log('New850 brand audit passed: no legacy customer-facing brand references found.');
