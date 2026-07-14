import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const lessonFiles = [
  'src/data/part1-home-accommodation-001.ts',
  'src/data/part1-home-accommodation-002.ts',
  'src/data/part1-home-accommodation-003.ts',
];
const sourceText = lessonFiles
  .map((file) => fs.readFileSync(path.join(root, file), 'utf8'))
  .join('\n');
const words = new Set(
  (sourceText.match(/[A-Za-z]+(?:['’][A-Za-z]+)?/g) || [])
    .map((word) => word.toLowerCase().replace(/[’]/g, "'"))
    .filter((word) => word.length > 1),
);

const fullPath = path.join(root, 'public/dictionaries/ecdict-compact.json');
const outputPath = path.join(root, 'public/dictionaries/home-accommodation-ecdict.json');
const rows = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
const subset = rows.filter((row) => {
  const word = String(row.w || '').toLowerCase();
  return words.has(word);
});

fs.writeFileSync(outputPath, `${JSON.stringify(subset)}\n`);
console.log(`lesson dictionary built: ${subset.length} entries from ${words.size} lesson words`);
